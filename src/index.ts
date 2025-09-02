import dotenv from 'dotenv';
import { PolygonAdapter } from './adapters/polygonAdapter';
import { TwelveDataAdapter } from './adapters/twelveDataAdapter';
import { TradierAdapter, TradierConfig } from './adapters/tradierAdapter';
import { TradingCalculator } from './engine/tradingCalculator';
import { BacktestEngine, BacktestConfig } from './engine/backtestEngine';
import { FeedbackLogger } from './utils/feedbackLogger';
import { RiskParameters, TradingMode } from './types/trading';
import { Timeframe } from './types/dataProvider';

dotenv.config();

// === Configuration ===
const polygonKey = process.env.POLYGON_API_KEY || '';
const twelveKey = process.env.TWELVEDATA_API_KEY || '';
const tradierToken = process.env.TRADIER_ACCESS_TOKEN || '';
const tradierAccountId = process.env.TRADIER_ACCOUNT_ID || '';

const tradierConfig: TradierConfig = {
  apiKey: process.env.TRADIER_API_KEY || '',
  accessToken: tradierToken,
  accountId: tradierAccountId,
  baseUrl: process.env.TRADIER_BASE_URL || 'https://api.tradier.com',
  isPaper: process.env.TRADIER_PAPER === 'true',
};

// === Risk Parameters ===
const riskParams: RiskParameters = {
  maxRiskPercent: parseFloat(process.env.DEFAULT_RISK_PERCENT || '2.0'),
  maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS || '3.0'),
  maxDailyWin: parseFloat(process.env.MAX_DAILY_WIN || '5.0'),
  symbolCooldownHours: parseInt(process.env.SYMBOL_COOLDOWN_HOURS || '2'),
  killZoneStart: process.env.KILL_ZONE_START || '09:30',
  killZoneEnd: process.env.KILL_ZONE_END || '15:45',
  commissionPerTrade: parseFloat(process.env.COMMISSION_PER_TRADE || '1.00'),
  slippagePercent: parseFloat(process.env.SLIPPAGE_PERCENT || '0.1'),
  maxRiskAmount: parseFloat(process.env.MAX_RISK_AMOUNT || '500.00'),
  minConfluenceScore: 0.6,
  minRiskReward: 2.0
};

// === Backtest Configuration ===
const backtestConfig: BacktestConfig = {
  symbols: ['AAPL', 'MSFT'],
  fromDate: new Date('2024-01-01'),
  toDate: new Date('2024-12-31'),
  timeframe: Timeframe.DAY_1,
  initialBalance: 100_000,
  riskParams,
  useEnrichedIndicators: true,
  maxSignalsPerSymbol: 50,
  maxConcurrentPositions: 5,
};

async function main() {
  // === Initialize Components ===
  const polygon = new PolygonAdapter(polygonKey);
  const twelve = new TwelveDataAdapter(twelveKey);
  const tradier = new TradierAdapter(tradierConfig);
  const feedbackLogger = new FeedbackLogger();
  const calculator = new TradingCalculator(riskParams);

  // Mode selection
  const mode = process.env.MODE || 'backtest'; // "backtest" | "live" | "paper"

  try {
    if (mode === 'backtest') {
      console.log('🚀 Running Backtest Engine...');
      const engine = new BacktestEngine(
        polygon,
        twelve,
        calculator,
        feedbackLogger,
        tradier,
        backtestConfig
      );
      const results = await engine.runBacktest();
      console.log('📊 Backtest Results:', results);
    } else {
      console.log(`🚀 Starting ${mode.toUpperCase()} trading loop...`);

      await polygon.connect();
      await twelve.connect();
      await tradier.connect();

      // Subscribe to live data
      polygon.onData(async (bar) => {
        try {
          const enriched = await twelve.getMultipleIndicators(bar.symbol, [
            'ema', 'atr', 'rsi', 'macd', 'vwap'
          ]);

          const enrichedMap = enriched.reduce((acc, ind) => {
            acc[ind.indicator] = ind.value;
            return acc;
          }, {} as Record<string, number>);

          const { tradingSignal } = calculator.analyzeMarket([bar], riskParams, enrichedMap);
          if (tradingSignal) {
            console.log(`📈 Signal generated: ${tradingSignal.symbol} ${tradingSignal.signalType} ${tradingSignal.direction}`);
            
            await feedbackLogger.logSignal(tradingSignal);

            if (mode === 'live') {
              const orderResponse = await tradier.placeOrder({
                symbol: tradingSignal.symbol,
                side: tradingSignal.direction === 'LONG' ? 'buy' : 'sell',
                quantity: tradingSignal.quantity,
                type: 'market',
                timeInForce: 'day'
              });
              console.log('🛒 Order placed:', orderResponse);
              await feedbackLogger.updateSignalExecution(tradingSignal.id, orderResponse.orderId, tradingSignal.price, tradingSignal.quantity);
            } else {
              console.log('📝 Paper trade executed:', tradingSignal);
              await feedbackLogger.updateSignalExecution(tradingSignal.id, `paper_${Date.now()}`, tradingSignal.price, tradingSignal.quantity);
            }
          }
        } catch (err) {
          console.error('❌ Live trading loop error:', err);
        }
      });

      // Subscribe to chosen symbols
      for (const symbol of backtestConfig.symbols) {
        await polygon.subscribeToSymbol(symbol);
      }
    }
  } catch (err) {
    console.error('❌ Fatal error in index:', err);
  } finally {
    await feedbackLogger.close();
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  process.exit(0);
});

main();
