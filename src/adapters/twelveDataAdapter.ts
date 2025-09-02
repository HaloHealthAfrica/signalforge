import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { 
  IndicatorProvider, 
  LiveDataProvider,
  IndicatorData,
  TwelveDataWebSocketQuote,
  MarketData
} from '../types/dataProvider';
import { ApiOptimizer } from './apiOptimizer';

export class TwelveDataAdapter implements IndicatorProvider, LiveDataProvider {
  public name = 'TwelveData';
  public isConnected = false;
  
  private apiKey: string;
  private baseUrl: string;
  private httpClient: AxiosInstance;
  private ws: WebSocket | null = null;
  private wsUrl = 'wss://ws.twelvedata.com/v1/quotes/price';
  private dataCallbacks: Array<(data: MarketData) => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];
  private subscribedSymbols: Set<string> = new Set();
  private apiOptimizer: ApiOptimizer;

  constructor(apiKey: string, baseUrl: string = 'https://api.twelvedata.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.apiOptimizer = new ApiOptimizer();
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      params: { apikey: this.apiKey }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.httpClient.get('/time_series', {
        params: { symbol: 'AAPL', interval: '1min', outputsize: 1 }
      });
      this.isConnected = true;
      console.log('✅ TwelveData adapter connected');
    } catch (error) {
      console.error('❌ Failed to connect TwelveData:', error);
      throw new Error('Failed to connect TwelveData API');
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribedSymbols.clear();
    console.log('✅ TwelveData adapter disconnected');
  }

  async getIndicators(symbol: string, indicators: string[], params?: Record<string, any>): Promise<IndicatorData[]> {
    const results: IndicatorData[] = [];
    for (const indicator of indicators) {
      const cacheKey = `twelvedata_${indicator}_${symbol}_${JSON.stringify(params || {})}`;
      try {
        const value = await this.apiOptimizer.executeWithRateLimit(
          'twelvedata',
          async () => {
            const res = await this.httpClient.get(`/${indicator}`, {
              params: { symbol, ...params }
            });
            if (res.data.status === 'ok') {
              if (res.data.values && res.data.values[0]) {
                return res.data.values[0];
              }
              if (res.data.value) {
                return { value: res.data.value, datetime: new Date() };
              }
            }
            throw new Error(`Indicator ${indicator} not available`);
          },
          cacheKey,
          5 * 60 * 1000
        );
        
        results.push({
          symbol,
          indicator,
          value: parseFloat(value.value || value.close || 0),
          timestamp: new Date(value.datetime || Date.now()),
          parameters: params
        });
      } catch (err) {
        console.error(`❌ Indicator fetch failed (${indicator}, ${symbol}):`, err);
      }
    }
    return results;
  }

  async getHistoricalIndicators(symbol: string, from: Date, to: Date, indicators: string[]): Promise<IndicatorData[]> {
    const results: IndicatorData[] = [];
    for (const indicator of indicators) {
      const cacheKey = `twelvedata_hist_${indicator}_${symbol}_${from.getTime()}_${to.getTime()}`;
      try {
        const values = await this.apiOptimizer.executeWithRateLimit(
          'twelvedata',
          async () => {
            const res = await this.httpClient.get(`/${indicator}`, {
              params: {
                symbol,
                start_date: from.toISOString().split('T')[0],
                end_date: to.toISOString().split('T')[0],
                outputsize: 5000
              }
            });
            return res.data.values || [];
          },
          cacheKey,
          15 * 60 * 1000
        );
        values.forEach((v: any) => {
          results.push({
            symbol,
            indicator,
            value: parseFloat(v.value || v.close || 0),
            timestamp: new Date(v.datetime),
            parameters: {}
          });
        });
      } catch (err) {
        console.error(`❌ Historical indicator fetch failed (${indicator}, ${symbol}):`, err);
      }
    }
    return results;
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (this.subscribedSymbols.has(symbol)) return;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connectWebSocket();
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = { action: 'subscribe', params: { symbols: symbol, apikey: this.apiKey } };
      this.ws.send(JSON.stringify(msg));
      this.subscribedSymbols.add(symbol);
      console.log(`📡 Subscribed ${symbol} on TwelveData WS`);
    }
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.subscribedSymbols.has(symbol)) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = { action: 'unsubscribe', params: { symbols: symbol, apikey: this.apiKey } };
      this.ws.send(JSON.stringify(msg));
      this.subscribedSymbols.delete(symbol);
      console.log(`📡 Unsubscribed ${symbol} on TwelveData WS`);
    }
  }

  onData(cb: (data: MarketData) => void): void {
    this.dataCallbacks.push(cb);
  }

  onError(cb: (err: Error) => void): void {
    this.errorCallbacks.push(cb);
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', () => {
        console.log('✅ TwelveData WS connected');
        this.isConnected = true;
        resolve();
      });
      this.ws.on('message', (raw: WebSocket.Data) => {
        try {
          const msg = JSON.parse(raw.toString());
          this.handleWebSocketMessage(msg);
        } catch (e) {
          console.error('❌ WS parse error:', e);
        }
      });
      this.ws.on('error', (err) => {
        console.error('❌ TwelveData WS error:', err);
        this.errorCallbacks.forEach(cb => cb(err));
        reject(err);
      });
      this.ws.on('close', () => {
        console.log('⚠️ TwelveData WS closed. Reconnecting in 5s...');
        this.isConnected = false;
        this.subscribedSymbols.clear();
        setTimeout(() => {
          if (this.subscribedSymbols.size > 0) this.connectWebSocket();
        }, 5000);
      });
    });
  }

  private handleWebSocketMessage(msg: any): void {
    if (msg.event === 'price') {
      const q = msg as TwelveDataWebSocketQuote;
      const marketData: MarketData = {
        symbol: q.symbol,
        timestamp: new Date(q.timestamp),
        open: q.price,
        high: q.price,
        low: q.price,
        close: q.price,
        volume: q.volume || 0
      };
      this.dataCallbacks.forEach(cb => cb(marketData));
    } else if (msg.event === 'error') {
      this.errorCallbacks.forEach(cb => cb(new Error(msg.message || 'TwelveData WS error')));
    } else {
      console.log('ℹ️ WS event:', msg.event, msg);
    }
  }

  // Convenience wrappers
  async getATR(symbol: string, period = 14): Promise<number> {
    const d = await this.getIndicators(symbol, ['atr'], { period });
    return d[0]?.value || 0;
  }

  async getEMA(symbol: string, period: number): Promise<number> {
    const d = await this.getIndicators(symbol, ['ema'], { period });
    return d[0]?.value || 0;
  }

  async getVWAP(symbol: string): Promise<number> {
    const d = await this.getIndicators(symbol, ['vwap']);
    return d[0]?.value || 0;
  }

  async getRSI(symbol: string, period = 14): Promise<number> {
    const d = await this.getIndicators(symbol, ['rsi'], { period });
    return d[0]?.value || 0;
  }

  async getMACD(symbol: string, fast = 12, slow = 26, signal = 9) {
    const d = await this.getIndicators(symbol, ['macd'], {
      fast_period: fast,
      slow_period: slow,
      signal_period: signal
    });
    if (d.length > 0 && typeof d[0].value === 'object') {
      const v: any = d[0].value;
      return { macd: v.macd, signal: v.macd_signal, histogram: v.macd_histogram };
    }
    return { macd: 0, signal: 0, histogram: 0 };
  }

  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }

  getConnectionStatus(): { isConnected: boolean; wsReadyState: number | null } {
    return { isConnected: this.isConnected, wsReadyState: this.ws?.readyState ?? null };
  }

  async getMultipleIndicators(symbol: string, indicators: string[], params?: Record<string, any>): Promise<IndicatorData[]> {
    const promises = indicators.map(ind => this.getIndicators(symbol, [ind], params));
    const results = await Promise.allSettled(promises);
    return results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<IndicatorData[]>).value);
  }
}