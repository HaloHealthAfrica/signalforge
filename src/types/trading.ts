

export interface TechnicalIndicators {
  atr: number;
  ema20: number;
  ema50: number;
  vwap: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  signal?: number;  // MACD signal line
  histogram?: number; // MACD histogram
}

export interface TradingSignal {
  id: string;
  symbol: string;
  timestamp: Date;
  signalType: SignalType;
  direction: Direction;
  price: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  
  // Technical indicators
  indicators: TechnicalIndicators;
  
  // Enrichment flags
  isEnriched: boolean;
  enrichedAt?: Date;
  
  // Confluence scoring
  confluenceScore: number;
  reasonCodes: string[];
  reason?: string; // Additional reason field for the new backtest engine
  
  // Risk management
  riskRewardRatio?: number;
  maxRisk?: number;
  
  // Trade execution
  orderId?: string;
  executedAt?: Date;
  executedPrice?: number;
  executedQuantity?: number;
  
  // Outcome tracking
  outcome?: Outcome;
  pnl?: number;
  closedAt?: Date;
  
  // Metadata
  mode: TradingMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeOrder {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  price?: number;
  stopPrice?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  extendedHours?: boolean;
}

export interface OrderResponse {
  orderId: string;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  filledPrice: number;
  commission: number;
  timestamp: Date;
}

export interface AccountBalance {
  accountId: string;
  cash: number;
  buyingPower: number;
  dayTradingBuyingPower: number;
  equity: number;
  longMarketValue: number;
  shortMarketValue: number;
  totalMarketValue: number;
  timestamp: Date;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  marketValue: number;
  unrealizedPnL: number;
  timestamp: Date;
}

export enum SignalType {
  BREAKOUT = 'BREAKOUT',
  PULLBACK = 'PULLBACK',
  REVERSAL = 'REVERSAL',
  CONTINUATION = 'CONTINUATION'
}

export enum Direction {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum Outcome {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BREAKEVEN = 'BREAKEVEN',
  OPEN = 'OPEN'
}

export enum TradingMode {
  BACKTEST = 'BACKTEST',
  LIVE = 'LIVE',
  PAPER = 'PAPER'
}

export interface ConfluenceFactors {
  trendAlignment: number;      // 0-1: How well aligned with overall trend
  volumeConfirmation: number;  // 0-1: Volume supporting the move
  supportResistance: number;   // 0-1: Proximity to key levels
  momentumStrength: number;    // 0-1: RSI, MACD confirmation
  volatilityAppropriate: number; // 0-1: ATR in normal range
}

export interface RiskParameters {
  maxRiskPercent: number;      // Max % of account to risk per trade
  maxDailyLoss: number;        // Max daily loss percentage
  maxDailyWin: number;         // Max daily win percentage
  symbolCooldownHours: number; // Hours between trades on same symbol
  killZoneStart: string;       // Market open time (HH:MM)
  killZoneEnd: string;         // Market close time (HH:MM)
  killZones?: Array<{ start: string; end: string }>; // Multiple kill zones
  commissionPerTrade: number;  // Commission per trade in dollars
  slippagePercent: number;     // Slippage as percentage of price
  maxRiskAmount: number;       // Max dollar amount to risk per trade
  minConfluenceScore?: number; // Minimum confluence score (default: 0.6)
  minRiskReward?: number;      // Minimum risk/reward ratio (default: 2.0)
}
