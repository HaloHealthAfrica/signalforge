import { 
  TradingSignal, 
  TradingMode, 
  RiskParameters,
  Outcome
} from '../types/trading';
import { MarketData } from '../types/dataProvider';
import { Timeframe } from '../types/dataProvider';
import { MarketDataProvider, IndicatorProvider } from '../types/dataProvider';
import { TradingCalculator } from './tradingCalculator';
import { FeedbackLogger } from '../utils/feedbackLogger';
import { TradierAdapter } from '../adapters/tradierAdapter';

export interface BacktestConfig {
  symbols: string[];
  fromDate: Date;
  toDate: Date;
  timeframe: Timeframe;
  initialBalance: number;
  riskParams: RiskParameters;
  useEnrichedIndicators: boolean;
  maxSignalsPerSymbol: number;
  maxConcurrentPositions: number;
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
  signals: TradingSignal[];
  equityCurve: Array<{ date: Date; balance: number }>;
}

export class BacktestEngine {
  private marketDataProvider: MarketDataProvider;
  private indicatorProvider: IndicatorProvider;
  private tradingCalculator: TradingCalculator;
  private feedbackLogger: FeedbackLogger;
  private tradierAdapter: TradierAdapter;
  private config: BacktestConfig;

  private currentBalance: number;
  private openPositions: Map<string, TradingSignal> = new Map();
  private closedSignals: TradingSignal[] = [];
  private equityCurve: Array<{ date: Date; balance: number }> = [];
  private dailyPnL: Map<string, number> = new Map();

  constructor(
    marketDataProvider: MarketDataProvider,
    indicatorProvider: IndicatorProvider,
    tradingCalculator: TradingCalculator,
    feedbackLogger: FeedbackLogger,
    tradierAdapter: TradierAdapter,
    config: BacktestConfig
  ) {
    this.marketDataProvider = marketDataProvider;
    this.indicatorProvider = indicatorProvider;
    this.tradingCalculator = tradingCalculator;
    this.feedbackLogger = feedbackLogger;
    this.tradierAdapter = tradierAdapter;
    this.config = config;
    this.currentBalance = config.initialBalance;
  }

  async runBacktest(): Promise<BacktestResult> {
    console.log(`Starting backtest for ${this.config.symbols.join(', ')} from ${this.config.fromDate.toISOString()} to ${this.config.toDate.toISOString()}`);
    
    try {
      // Initialize equity curve
      this.equityCurve.push({
        date: this.config.fromDate,
        balance: this.currentBalance
      });

      // Process each symbol
      for (const symbol of this.config.symbols) {
        await this.processSymbol(symbol);
      }

      // Close any remaining open positions
      await this.closeAllPositions();

      // Generate final results
      const results = this.generateResults();
      
      console.log(`Backtest completed. Final balance: $${results.finalBalance.toFixed(2)} (${results.returnPercentage.toFixed(2)}% return)`);
      
      return results;
    } catch (error) {
      console.error('Backtest failed:', error);
      throw error;
    }
  }

  private async processSymbol(symbol: string): Promise<void> {
    console.log(`Processing symbol: ${symbol}`);
    
    try {
      const historicalData = await this.marketDataProvider.getHistoricalBars(
        symbol,
        this.config.fromDate,
        this.config.toDate,
        this.config.timeframe
      );

      if (historicalData.length === 0) {
        console.log(`No historical data found for ${symbol}`);
        return;
      }

      for (let i = 50; i < historicalData.length; i++) {
        const currentData = historicalData.slice(0, i + 1);
        const currentBar = currentData[currentData.length - 1];
        
        // Check entry
        if (this.canOpenNewPosition(symbol)) {
          await this.processBarForSignals(symbol, currentData, currentBar);
        }

        // Check exits
        await this.checkExitConditions(symbol, currentBar);

        // Equity curve update (daily granularity)
        if (i % 24 === 0 || i === historicalData.length - 1) {
          this.updateEquityCurve(currentBar.timestamp);
        }
      }
    } catch (error) {
      console.error(`Error processing symbol ${symbol}:`, error);
    }
  }

  private async processBarForSignals(
    symbol: string, 
    data: MarketData[], 
    currentBar: MarketData
  ): Promise<void> {
    try {
      let enrichedIndicators: any = undefined;

      if (this.config.useEnrichedIndicators) {
        enrichedIndicators = await this.getEnrichedIndicators(symbol, currentBar.timestamp);
      }

      const analysis = this.tradingCalculator.analyzeMarket(data, this.config.riskParams, enrichedIndicators);
      const signal = analysis.tradingSignal;

      if (signal && this.shouldExecuteSignal(signal, currentBar)) {
        await this.executeSignal({
          ...signal,
          symbol,
          isEnriched: !!enrichedIndicators,
          reason: signal.reason,
          confluenceScore: signal.confluenceScore
        }, currentBar);
      }
    } catch (error) {
      console.error(`Error processing bar for signals:`, error);
    }
  }

  private async getEnrichedIndicators(symbol: string, timestamp: Date): Promise<any> {
    try {
      const indicators = await this.indicatorProvider.getIndicators(symbol, ['atr', 'ema', 'vwap', 'rsi']);
      const enriched: any = {};
      indicators.forEach(indicator => {
        enriched[indicator.indicator] = indicator.value;
      });
      return enriched;
    } catch (error) {
      console.error(`Failed to get enriched indicators for ${symbol}:`, error);
      return undefined;
    }
  }

  private shouldExecuteSignal(signal: TradingSignal, currentBar: MarketData): boolean {
    if (signal.confluenceScore < 0.6) return false;

    // Kill zones
    if (this.config.riskParams.killZones) {
      const now = currentBar.timestamp;
      const inKillZone = this.config.riskParams.killZones.some(zone => {
        const [startH, startM] = zone.start.split(':').map(Number);
        const [endH, endM] = zone.end.split(':').map(Number);
        const start = new Date(now); start.setHours(startH, startM, 0);
        const end = new Date(now); end.setHours(endH, endM, 0);
        return now >= start && now <= end;
      });
      if (!inKillZone) return false;
    }

    // Balance check
    const requiredCapital = signal.price * signal.quantity;
    if (requiredCapital > this.currentBalance * 0.95) return false;

    // Daily limits
    const today = currentBar.timestamp.toDateString();
    const dailyPnL = this.dailyPnL.get(today) || 0;
    
    if (dailyPnL < -(this.currentBalance * this.config.riskParams.maxDailyLoss / 100)) return false;
    if (dailyPnL > this.currentBalance * this.config.riskParams.maxDailyWin / 100) return false;

    // Symbol cooldown
    const lastSignalTime = this.getLastSignalTime(signal.symbol);
    if (lastSignalTime) {
      const hoursSinceLastSignal = (currentBar.timestamp.getTime() - lastSignalTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSignal < this.config.riskParams.symbolCooldownHours) return false;
    }

    return true;
  }

  private async executeSignal(signal: TradingSignal, currentBar: MarketData): Promise<void> {
    try {
      signal.mode = TradingMode.BACKTEST;
      await this.feedbackLogger.logSignal(signal);

      const executedPrice = currentBar.close;
      const executedQuantity = signal.quantity;

      await this.feedbackLogger.updateSignalExecution(
        signal.id,
        `backtest_${Date.now()}`,
        executedPrice,
        executedQuantity
      );

      this.openPositions.set(signal.symbol, {
        ...signal,
        executedAt: currentBar.timestamp,
        executedPrice,
        executedQuantity
      });

      this.currentBalance -= executedPrice * executedQuantity;
      console.log(`Signal executed: ${signal.symbol} ${signal.direction} at ${executedPrice}`);
    } catch (error) {
      console.error(`Failed to execute signal:`, error);
    }
  }

  private async checkExitConditions(symbol: string, currentBar: MarketData): Promise<void> {
    const position = this.openPositions.get(symbol);
    if (!position) return;

    const currentPrice = currentBar.close;
    let shouldExit = false;
    let exitReason = '';
    let pnl = 0;

    // Stop loss
    if (position.direction === 'LONG' && currentPrice <= (position.stopLoss || 0)) {
      shouldExit = true;
      exitReason = 'STOP_LOSS';
    } else if (position.direction === 'SHORT' && currentPrice >= (position.stopLoss || 0)) {
      shouldExit = true;
      exitReason = 'STOP_LOSS';
    }

    // Take profit
    if (!shouldExit) {
      if (position.direction === 'LONG' && currentPrice >= (position.takeProfit || 0)) {
        shouldExit = true;
        exitReason = 'TAKE_PROFIT';
      } else if (position.direction === 'SHORT' && currentPrice <= (position.takeProfit || 0)) {
        shouldExit = true;
        exitReason = 'TAKE_PROFIT';
      }
    }

    // Trailing stop (simple: 1 ATR behind peak)
    // Could be extended here...

    if (shouldExit) {
      pnl = (position.direction === 'LONG')
        ? (currentPrice - position.executedPrice!) * position.executedQuantity!
        : (position.executedPrice! - currentPrice) * position.executedQuantity!;

      // Apply commission/slippage
      pnl -= (position.executedQuantity! * this.config.riskParams.commissionPerTrade);
      pnl -= (Math.abs(currentPrice - position.executedPrice!) * this.config.riskParams.slippagePercent * position.executedQuantity!);

      await this.closePosition(position, currentPrice, exitReason, pnl);
    }
  }

  private async closePosition(
    position: TradingSignal, 
    exitPrice: number, 
    reason: string, 
    pnl: number
  ): Promise<void> {
    try {
      let outcome: Outcome = Outcome.LOSS;
      if (pnl > 0) outcome = Outcome.WIN;
      else if (Math.abs(pnl) < 1) outcome = Outcome.BREAKEVEN;

      await this.feedbackLogger.updateSignalOutcome(
        position.id,
        outcome,
        pnl,
        exitPrice,
        position.executedQuantity
      );

      // Close position
      this.openPositions.delete(position.symbol);

      // Add capital back plus PnL
      this.currentBalance += (position.executedPrice! * position.executedQuantity!) + pnl;

      // Update daily PnL
      const today = position.executedAt!.toDateString();
      const currentDailyPnL = this.dailyPnL.get(today) || 0;
      this.dailyPnL.set(today, currentDailyPnL + pnl);

      console.log(`Position closed: ${position.symbol} ${outcome} (${reason}) - PnL: $${pnl.toFixed(2)}`);

      // Update signal in closed signals array
      const signalIndex = this.closedSignals.findIndex(s => s.id === position.id);
      if (signalIndex !== -1) {
        this.closedSignals[signalIndex] = {
          ...position,
          outcome,
          pnl,
          closedAt: new Date()
        };
      }
    } catch (error) {
      console.error(`Failed to close position:`, error);
    }
  }

  private async closeAllPositions(): Promise<void> {
    const symbols = Array.from(this.openPositions.keys());
    
    for (const symbol of symbols) {
      const position = this.openPositions.get(symbol)!;
      // Close at last known price (in real backtest, you'd use the last bar)
      await this.closePosition(position, position.executedPrice!, 'BACKTEST_END', 0);
    }
  }

  private canOpenNewPosition(symbol: string): boolean {
    // Check if we already have a position in this symbol
    if (this.openPositions.has(symbol)) return false;

    // Check if we've reached max concurrent positions
    if (this.openPositions.size >= this.config.maxConcurrentPositions) return false;

    // Check if we've reached max signals per symbol
    const symbolSignals = this.closedSignals.filter(s => s.symbol === symbol).length;
    if (symbolSignals >= this.config.maxSignalsPerSymbol) return false;

    return true;
  }

  private getLastSignalTime(symbol: string): Date | null {
    const lastSignal = this.closedSignals
      .filter(s => s.symbol === symbol)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    return lastSignal ? lastSignal.timestamp : null;
  }

  private updateEquityCurve(date: Date): void {
    this.equityCurve.push({
      date,
      balance: this.currentBalance
    });
  }

  private generateResults(): BacktestResult {
    const totalSignals = this.closedSignals.length;
    const winningSignals = this.closedSignals.filter(s => s.outcome === 'WIN').length;
    const losingSignals = this.closedSignals.filter(s => s.outcome === 'LOSS').length;
    const breakevenSignals = this.closedSignals.filter(s => s.outcome === 'BREAKEVEN').length;
    const winRate = totalSignals > 0 ? winningSignals / totalSignals : 0;

    const totalPnL = this.closedSignals.reduce((sum, s) => sum + (s.pnl || 0), 0);
    const averagePnL = totalSignals > 0 ? totalPnL / totalSignals : 0;

    const finalBalance = this.currentBalance;
    const returnPercentage = ((finalBalance - this.config.initialBalance) / this.config.initialBalance) * 100;

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = this.config.initialBalance;
    
    this.equityCurve.forEach(point => {
      if (point.balance > peak) {
        peak = point.balance;
      }
      const drawdown = (peak - point.balance) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Calculate Sharpe ratio (simplified)
    const returns = this.equityCurve.slice(1).map((point, i) => {
      const prevBalance = this.equityCurve[i].balance;
      return (point.balance - prevBalance) / prevBalance;
    });

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0;

    return {
      totalSignals,
      winningSignals,
      losingSignals,
      breakevenSignals,
      winRate,
      totalPnL,
      averagePnL,
      maxDrawdown,
      sharpeRatio,
      finalBalance,
      returnPercentage,
      signals: this.closedSignals,
      equityCurve: this.equityCurve
    };
  }

  // Utility methods
  getCurrentBalance(): number {
    return this.currentBalance;
  }

  getOpenPositions(): Map<string, TradingSignal> {
    return new Map(this.openPositions);
  }

  getDailyPnL(): Map<string, number> {
    return new Map(this.dailyPnL);
  }

  async cleanup(): Promise<void> {
    await this.feedbackLogger.close();
  }
}
