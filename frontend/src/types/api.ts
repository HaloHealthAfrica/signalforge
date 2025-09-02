// Market Data Types
export interface MarketDataPoint {
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketData {
  [symbol: string]: MarketDataPoint;
}

// Trading Signal Types
export interface TradingSignal {
  id: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  confluence: number;
  price: number;
  timestamp: string;
  signalType: string;
  direction: string;
  reasonCodes: string[];
  riskRewardRatio: number;
}

// Portfolio Types
export interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  marketValue: number;
  unrealizedPnL: number;
  timestamp: string;
}

export interface Performance {
  dailyPnL: number;
  dailyPnLPercent: number;
  winRate: number;
  winRateChange: number;
  maxDrawdown: number;
  maxDrawdownChange: number;
  totalPnL: number;
  totalPnLPercent: number;
  sharpeRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

// Backtest Types
export interface BacktestConfig {
  symbols: string[];
  fromDate: string;
  toDate: string;
  initialBalance: number;
  riskParams: any;
}

export interface BacktestRequest {
  symbols: string[];
  fromDate: string;
  toDate: string;
  initialBalance: number;
  riskParams: any;
}

export interface BacktestResult {
  totalSignals: number;
  winningSignals: number;
  losingSignals: number;
  breakevenSignals: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  finalBalance: number;
  returnPercentage: number;
  signals: any[];
  equityCurve: Array<{ date: string; balance: number }>;
}

// Risk Management Types
export interface RiskParameters {
  maxRiskPercent: number;
  maxDailyLoss: number;
  maxDailyWin: number;
  symbolCooldownHours: number;
  killZoneStart: string;
  killZoneEnd: string;
  commissionPerTrade: number;
  slippagePercent: number;
  maxRiskAmount: number;
  minConfluenceScore: number;
  minRiskReward: number;
}

export interface RiskExposure {
  totalExposure: number;
  maxExposure: number;
  exposurePercent: number;
  sectorExposure: { [sector: string]: number };
  correlationMatrix: (string | number)[][];
}

// Settings Types
export interface ApiKeys {
  polygon: string;
  twelveData: string;
  tradier: string;
  tradierAccessToken: string;
}

export interface TradingPreferences {
  defaultRiskPercent: number;
  maxDailyLossPercent: number;
  symbolCooldownHours: number;
  usePaperTrading: boolean;
  autoExecuteSignals: boolean;
}

export interface Settings {
  apiKeys: ApiKeys;
  tradingPreferences: TradingPreferences;
}

// Market Hours Types
export interface MarketHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  timeUntilOpen: number;
  timeUntilClose: number;
  nextOpen: string;
  timezone: string;
}
