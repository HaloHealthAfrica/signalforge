import { CacheEntry, ApiRateLimit } from '../types/dataProvider';

export type ApiOptimizerEvent =
  | { type: 'CACHE_HIT'; provider: string; key: string }
  | { type: 'CACHE_MISS'; provider: string; key: string }
  | { type: 'THROTTLED'; provider: string; queueSize: number }
  | { type: 'RETRY'; provider: string; attempt: number; delayMs: number }
  | { type: 'REQUEST_EXECUTED'; provider: string; key?: string };

export class ApiOptimizer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private rateLimits: Map<string, ApiRateLimit> = new Map();
  private requestQueues: Map<string, Array<() => Promise<any>>> = new Map();
  private isProcessing: Map<string, boolean> = new Map();
  private subscribers: Array<(event: ApiOptimizerEvent) => void> = [];

  constructor() {
    this.initializeRateLimits();
  }

  private initializeRateLimits(): void {
    this.rateLimits.set('polygon', {
      requestsPerMinute: 5,
      requestsPerHour: 300,
      requestsPerDay: 5000,
      currentRequests: 0,
      resetTime: new Date()
    });

    this.rateLimits.set('twelvedata', {
      requestsPerMinute: 8,
      requestsPerHour: 800,
      requestsPerDay: 8000,
      currentRequests: 0,
      resetTime: new Date()
    });

    this.rateLimits.set('tradier', {
      requestsPerMinute: 120,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      currentRequests: 0,
      resetTime: new Date()
    });
  }

  subscribe(listener: (event: ApiOptimizerEvent) => void): void {
    this.subscribers.push(listener);
  }

  private emit(event: ApiOptimizerEvent): void {
    this.subscribers.forEach(sub => sub(event));
  }

  async executeWithRateLimit<T>(
    provider: string,
    operation: () => Promise<T>,
    cacheKey?: string,
    ttl: number = 5 * 60 * 1000,
    retries: number = 3
  ): Promise<T> {
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp.getTime() < cached.ttl) {
        this.emit({ type: 'CACHE_HIT', provider, key: cacheKey });
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    if (!this.canMakeRequest(provider)) {
      this.emit({ type: 'THROTTLED', provider, queueSize: (this.requestQueues.get(provider)?.length || 0) + 1 });
      return this.queueRequest(provider, operation, cacheKey, ttl, retries);
    }

    try {
      this.incrementRequestCount(provider);
      const result = await this.executeWithRetry(operation, provider, retries);
      if (cacheKey) {
        this.emit({ type: 'CACHE_MISS', provider, key: cacheKey });
        this.cache.set(cacheKey, { data: result, timestamp: new Date(), ttl });
      }
      this.emit({ type: 'REQUEST_EXECUTED', provider, key: cacheKey });
      return result;
    } catch (error) {
      console.error(`API request failed for ${provider}:`, error);
      throw error;
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    provider: string,
    retries: number,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (err: any) {
      if (attempt <= retries) {
        const delayMs = 500 * Math.pow(2, attempt - 1);
        this.emit({ type: 'RETRY', provider, attempt, delayMs });
        await this.delay(delayMs);
        return this.executeWithRetry(operation, provider, retries, attempt + 1);
      }
      throw err;
    }
  }

  private canMakeRequest(provider: string): boolean {
    const rl = this.rateLimits.get(provider);
    if (!rl) return true;
    this.resetRateLimitIfNeeded(provider);
    return rl.currentRequests < rl.requestsPerMinute;
  }

  private resetRateLimitIfNeeded(provider: string): void {
    const rl = this.rateLimits.get(provider);
    if (!rl) return;

    const now = new Date();
    const timeSinceReset = now.getTime() - rl.resetTime.getTime();

    if (timeSinceReset >= 60000) { // 1 minute
      rl.currentRequests = 0;
      rl.resetTime = now;
    }
  }

  private incrementRequestCount(provider: string): void {
    const rl = this.rateLimits.get(provider);
    if (rl) {
      rl.currentRequests++;
    }
  }

  private async queueRequest<T>(
    provider: string,
    operation: () => Promise<T>,
    cacheKey?: string,
    ttl: number = 5 * 60 * 1000,
    retries: number = 3
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedOperation = async () => {
        try {
          const result = await this.executeWithRateLimit(provider, operation, cacheKey, ttl, retries);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (!this.requestQueues.has(provider)) {
        this.requestQueues.set(provider, []);
      }

      this.requestQueues.get(provider)!.push(queuedOperation);
      this.processQueue(provider);
    });
  }

  private async processQueue(provider: string): Promise<void> {
    if (this.isProcessing.get(provider)) return;

    this.isProcessing.set(provider, true);
    const queue = this.requestQueues.get(provider) || [];

    while (queue.length > 0 && this.canMakeRequest(provider)) {
      const operation = queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error(`Queued operation failed for ${provider}:`, error);
        }
      }
    }

    this.isProcessing.set(provider, false);

    if (queue.length > 0) {
      // Schedule next processing cycle
      setTimeout(() => this.processQueue(provider), 1000);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    const totalRequests = this.subscribers.length;
    const cacheHits = this.cache.size;
    const hitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;

    return {
      size: this.cache.size,
      hitRate
    };
  }

  // Rate limit management
  getRateLimitInfo(provider: string): ApiRateLimit | undefined {
    return this.rateLimits.get(provider);
  }

  updateRateLimit(provider: string, limits: Partial<ApiRateLimit>): void {
    const current = this.rateLimits.get(provider);
    if (current) {
      this.rateLimits.set(provider, { ...current, ...limits });
    }
  }

  // Queue management
  getQueueSize(provider: string): number {
    return this.requestQueues.get(provider)?.length || 0;
  }

  clearQueue(provider: string): void {
    this.requestQueues.set(provider, []);
  }

  // Cleanup
  cleanup(): void {
    this.cache.clear();
    this.requestQueues.clear();
    this.isProcessing.clear();
    this.subscribers = [];
  }
}
