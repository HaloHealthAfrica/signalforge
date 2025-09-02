// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods in tests to reduce noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables for testing
process.env.POLYGON_API_KEY = 'test_polygon_key';
process.env.TWELVEDATA_API_KEY = 'test_twelvedata_key';
process.env.TRADIER_API_KEY = 'test_tradier_key';
process.env.TRADIER_ACCESS_TOKEN = 'test_access_token';
process.env.TRADIER_ACCOUNT_ID = 'test_account_id';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/tradeloop_test';

// Export test utilities
export const createMockMarketData = (symbol: string, price: number, timestamp: Date) => ({
  symbol,
  timestamp,
  open: price,
  high: price + 0.5,
  low: price - 0.5,
  close: price,
  volume: 1000
});

export const createMockTechnicalIndicators = () => ({
  atr: 1.5,
  ema20: 100.0,
  ema50: 99.5,
  vwap: 100.2,
  rsi: 55,
  macd: 0.1,
  macdSignal: 0.05,
  macdHistogram: 0.05
});

export const createMockTradingSignal = (symbol: string, price: number) => ({
  id: `test_signal_${Date.now()}`,
  symbol,
  timestamp: new Date(),
  signalType: 'BREAKOUT' as const,
  direction: 'LONG' as const,
  price,
  quantity: 100,
  stopLoss: price - 2,
  takeProfit: price + 3,
  indicators: createMockTechnicalIndicators(),
  isEnriched: false,
  confluenceScore: 0.8,
  reasonCodes: ['TEST_SIGNAL'],
  riskRewardRatio: 2.5,
  maxRisk: 200,
  mode: 'BACKTEST' as const,
  createdAt: new Date(),
  updatedAt: new Date()
});
