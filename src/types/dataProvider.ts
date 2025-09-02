export interface DataProvider {
  name: string;
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface HistoricalDataProvider extends DataProvider {
  getHistoricalBars(
    symbol: string,
    from: Date,
    to: Date,
    timeframe: Timeframe
  ): Promise<MarketData[]>;
  
  getHistoricalIndicators(
    symbol: string,
    from: Date,
    to: Date,
    indicators: string[]
  ): Promise<IndicatorData[]>;
}

export interface LiveDataProvider extends DataProvider {
  subscribeToSymbol(symbol: string): Promise<void>;
  unsubscribeFromSymbol(symbol: string): Promise<void>;
  onData(callback: (data: MarketData) => void): void;
  onError(callback: (error: Error) => void): void;
}

export interface IndicatorProvider extends DataProvider {
  getIndicators(
    symbol: string,
    indicators: string[],
    params?: Record<string, any>
  ): Promise<IndicatorData[]>;
}

export interface MarketDataProvider extends HistoricalDataProvider, LiveDataProvider {}

// Re-export MarketData interface to avoid circular dependencies
export interface MarketData {
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface PolygonAggregate {
  c: number;  // Close price
  h: number;  // High price
  l: number;  // Low price
  n: number;  // Number of transactions
  o: number;  // Open price
  t: number;  // Timestamp (Unix milliseconds)
  v: number;  // Volume
  vw: number; // Volume weighted average price
}

export interface TwelveDataIndicator {
  symbol: string;
  indicator: string;
  value: number;
  timestamp: Date;
  parameters?: Record<string, any>;
}

export interface IndicatorData {
  symbol: string;
  indicator: string;
  value: number;
  timestamp: Date;
  parameters?: Record<string, any>;
}

export enum Timeframe {
  MINUTE_1 = '1',
  MINUTE_5 = '5',
  MINUTE_15 = '15',
  MINUTE_30 = '30',
  HOUR_1 = '60',
  DAY_1 = 'D',
  WEEK_1 = 'W',
  MONTH_1 = 'M'
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface PolygonWebSocketTrade {
  ev: string;        // Event type
  sym: string;       // Symbol
  p: number;         // Price
  s: number;         // Size
  t: number;         // Timestamp
  c: number[];       // Conditions
  x: number;         // Exchange
}

export interface TwelveDataWebSocketQuote {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
}

export interface ApiRateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  currentRequests: number;
  resetTime: Date;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
}
