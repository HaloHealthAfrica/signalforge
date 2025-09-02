import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { 
  MarketData, 
  MarketDataProvider, 
  Timeframe, 
  PolygonAggregate,
  PolygonWebSocketTrade,
  WebSocketMessage 
} from '../types/dataProvider';
import { ApiOptimizer } from './apiOptimizer';

export class PolygonAdapter implements MarketDataProvider {
  public name = 'Polygon';
  public isConnected = false;
  
  private apiKey: string;
  private baseUrl: string;
  private httpClient: AxiosInstance;
  private ws: WebSocket | null = null;
  private wsUrl = 'wss://delayed.polygon.io';
  private dataCallbacks: Array<(data: MarketData) => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];
  private subscribedSymbols: Set<string> = new Set();
  private apiOptimizer: ApiOptimizer;

  constructor(apiKey: string, baseUrl: string = 'https://api.polygon.io') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.apiOptimizer = new ApiOptimizer();
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  async connect(): Promise<void> {
    try {
      // Test connection with a simple API call
      await this.httpClient.get('/v2/reference/tickers', {
        params: { limit: 1 }
      });
      
      this.isConnected = true;
      console.log('Polygon adapter connected successfully');
    } catch (error) {
      console.error('Failed to connect to Polygon:', error);
      throw new Error('Failed to connect to Polygon API');
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribedSymbols.clear();
    console.log('Polygon adapter disconnected');
  }

  async getHistoricalBars(
    symbol: string,
    from: Date,
    to: Date,
    timeframe: Timeframe
  ): Promise<MarketData[]> {
    const cacheKey = `polygon_bars_${symbol}_${timeframe}_${from.getTime()}_${to.getTime()}`;
    
    return this.apiOptimizer.executeWithRateLimit(
      'polygon',
      async () => {
        const response = await this.httpClient.get(`/v2/aggs/ticker/${symbol}/range/${timeframe}/day/${from.toISOString().split('T')[0]}/${to.toISOString().split('T')[0]}`, {
          params: {
            adjusted: true,
            sort: 'asc',
            limit: 50000
          }
        });

        if (response.data.results) {
          return response.data.results.map((bar: PolygonAggregate) => this.mapAggregateToMarketData(symbol, bar));
        }
        
        return [];
      },
      cacheKey,
      15 * 60 * 1000 // 15 minutes cache for historical data
    );
  }

  async getHistoricalIndicators(
    symbol: string,
    from: Date,
    to: Date,
    indicators: string[]
  ): Promise<any[]> {
    // Polygon doesn't provide indicators directly, so we'll return empty array
    // Indicators will be calculated locally or fetched from TwelveData
    return [];
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    if (this.subscribedSymbols.has(symbol)) {
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connectWebSocket();
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        action: 'subscribe',
        params: `T.${symbol}`
      };
      
      this.ws.send(JSON.stringify(subscribeMessage));
      this.subscribedSymbols.add(symbol);
      console.log(`Subscribed to ${symbol} on Polygon WebSocket`);
    }
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    if (!this.subscribedSymbols.has(symbol)) {
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = {
        action: 'unsubscribe',
        params: `T.${symbol}`
      };
      
      this.ws.send(JSON.stringify(unsubscribeMessage));
      this.subscribedSymbols.delete(symbol);
      console.log(`Unsubscribed from ${symbol} on Polygon WebSocket`);
    }
  }

  onData(callback: (data: MarketData) => void): void {
    this.dataCallbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        console.log('Polygon WebSocket connected');
        this.isConnected = true;
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('Polygon WebSocket error:', error);
        this.errorCallbacks.forEach(callback => callback(error));
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('Polygon WebSocket disconnected');
        this.isConnected = false;
        this.subscribedSymbols.clear();
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.subscribedSymbols.size > 0) {
            this.connectWebSocket();
          }
        }, 5000);
      });

      // Set connection timeout
      setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  private handleWebSocketMessage(message: any): void {
    if (message.ev === 'T') {
      // Trade event
      const trade = message as PolygonWebSocketTrade;
      const marketData: MarketData = {
        symbol: trade.sym,
        timestamp: new Date(trade.t),
        open: trade.p,
        high: trade.p,
        low: trade.p,
        close: trade.p,
        volume: trade.s
      };

      this.dataCallbacks.forEach(callback => callback(marketData));
    }
  }

  private mapAggregateToMarketData(symbol: string, aggregate: PolygonAggregate): MarketData {
    return {
      symbol,
      timestamp: new Date(aggregate.t),
      open: aggregate.o,
      high: aggregate.h,
      low: aggregate.l,
      close: aggregate.c,
      volume: aggregate.v,
      vwap: aggregate.vw
    };
  }

  // Additional utility methods
  async getTickerDetails(symbol: string): Promise<any> {
    const cacheKey = `polygon_ticker_${symbol}`;
    
    return this.apiOptimizer.executeWithRateLimit(
      'polygon',
      async () => {
        const response = await this.httpClient.get(`/v3/reference/tickers/${symbol}`);
        return response.data;
      },
      cacheKey,
      60 * 60 * 1000 // 1 hour cache for ticker details
    );
  }

  async getPreviousClose(symbol: string): Promise<any> {
    const cacheKey = `polygon_prev_close_${symbol}`;
    
    return this.apiOptimizer.executeWithRateLimit(
      'polygon',
      async () => {
        const response = await this.httpClient.get(`/v2/aggs/ticker/${symbol}/prev`);
        return response.data;
      },
      cacheKey,
      5 * 60 * 1000 // 5 minutes cache for previous close
    );
  }

  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }

  getConnectionStatus(): { isConnected: boolean; wsReadyState: number | null } {
    return {
      isConnected: this.isConnected,
      wsReadyState: this.ws ? this.ws.readyState : null
    };
  }
}
