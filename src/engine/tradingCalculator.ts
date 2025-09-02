import { 
  TechnicalIndicators, 
  TradingSignal, 
  SignalType, 
  Direction, 
  ConfluenceFactors,
  RiskParameters,
  TradingMode
} from '../types/trading';
import { MarketData } from '../types/dataProvider';

export class TradingCalculator {
  private riskParams: RiskParameters;

  constructor(riskParams: RiskParameters) {
    this.riskParams = riskParams;
  }

  // === Core Indicator Calculations ===
  calculateATR(data: MarketData[], period: number = 14): number {
    if (data.length < period + 1) return 0;
    let sum = 0;
    for (let i = 1; i <= period; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      sum += Math.max(tr1, tr2, tr3);
    }
    return sum / period;
  }

  calculateEMA(data: MarketData[], period: number): number {
    if (data.length < period) return 0;
    const k = 2 / (period + 1);
    let ema = data[0].close;
    for (let i = 1; i < data.length; i++) {
      ema = (data[i].close * k) + (ema * (1 - k));
    }
    return ema;
  }

  calculateVWAP(data: MarketData[]): number {
    if (data.length === 0) return 0;
    let tpv = 0, vol = 0;
    data.forEach(bar => {
      const tp = (bar.high + bar.low + bar.close) / 3;
      tpv += tp * bar.volume;
      vol += bar.volume;
    });
    return vol > 0 ? tpv / vol : 0;
  }

  calculateRSI(data: MarketData[], period: number = 14): number {
    if (data.length < period + 1) return 0;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(data: MarketData[], fast: number = 12, slow: number = 26, signal: number = 9) {
    if (data.length < slow + signal) return { macd: 0, signal: 0, histogram: 0 };
    const macdLine = this.calculateEMA(data, fast) - this.calculateEMA(data, slow);
    const signalLine = this.calculateEMA(data, signal);
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  // === Main Signal Generator ===
  generateSignals(data: MarketData[], enriched?: Partial<TechnicalIndicators>, accountBalance: number = 10000): TradingSignal[] {
    if (data.length < 50) return [];
    const current = data[data.length - 1];
    const previous = data[data.length - 2];

    const indicators: TechnicalIndicators = {
      atr: enriched?.atr ?? this.calculateATR(data),
      ema20: enriched?.ema20 ?? this.calculateEMA(data, 20),
      ema50: enriched?.ema50 ?? this.calculateEMA(data, 50),
      vwap: enriched?.vwap ?? this.calculateVWAP(data),
      rsi: enriched?.rsi ?? this.calculateRSI(data),
      ...this.calculateMACD(data)
    };

    const rawSignals: (TradingSignal | null)[] = [
      this.checkBreakout(current, previous, indicators, !!enriched),
      this.checkPullback(current, previous, indicators, !!enriched),
      this.checkReversal(current, previous, indicators, !!enriched),
      this.checkContinuation(current, previous, indicators, !!enriched)
    ];

    // Validate and size positions
    return rawSignals
      .filter((s): s is TradingSignal => s !== null)
      .map(signal => {
        const qty = this.calculatePositionSize(accountBalance, this.riskParams.maxRiskAmount || 1000, signal.stopLoss || 0, signal.price);
        return { ...signal, quantity: qty };
      })
      .filter(signal => this.validateSignal(signal, this.riskParams));
  }

  // === Individual Signal Checks ===
  private checkBreakout(current: MarketData, previous: MarketData, ind: TechnicalIndicators, enriched: boolean): TradingSignal | null {
    const avgVol = (current.volume + previous.volume) / 2;
    if (current.close > ind.ema20 && current.close > ind.ema50 && current.close > ind.vwap && current.volume > avgVol * 1.5) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.BREAKOUT, Direction.LONG, current.close, ind, 
        { trendAlignment: 0.9, volumeConfirmation: 0.8, supportResistance: 0.7, momentumStrength: 0.6, volatilityAppropriate: 0.8 },
        ['EMA_ABOVE','VWAP_ABOVE','VOLUME_SPIKE'], enriched);
    }
    if (current.close < ind.ema20 && current.close < ind.ema50 && current.close < ind.vwap && current.volume > avgVol * 1.5) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.BREAKOUT, Direction.SHORT, current.close, ind, 
        { trendAlignment: 0.9, volumeConfirmation: 0.8, supportResistance: 0.7, momentumStrength: 0.6, volatilityAppropriate: 0.8 },
        ['EMA_BELOW','VWAP_BELOW','VOLUME_SPIKE'], enriched);
    }
    return null;
  }

  private checkPullback(current: MarketData, previous: MarketData, ind: TechnicalIndicators, enriched: boolean): TradingSignal | null {
    if (Math.abs(current.close - ind.ema20) / ind.ema20 < 0.02 && ind.rsi && ind.rsi < 30) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.PULLBACK, Direction.LONG, current.close, ind,
        { trendAlignment: 0.7, volumeConfirmation: 0.5, supportResistance: 0.8, momentumStrength: 0.7, volatilityAppropriate: 0.6 },
        ['EMA_SUPPORT','RSI_OVERSOLD'], enriched);
    }
    if (Math.abs(current.close - ind.ema20) / ind.ema20 < 0.02 && ind.rsi && ind.rsi > 70) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.PULLBACK, Direction.SHORT, current.close, ind,
        { trendAlignment: 0.7, volumeConfirmation: 0.5, supportResistance: 0.8, momentumStrength: 0.7, volatilityAppropriate: 0.6 },
        ['EMA_RESISTANCE','RSI_OVERBOUGHT'], enriched);
    }
    return null;
  }

  private checkReversal(current: MarketData, previous: MarketData, ind: TechnicalIndicators, enriched: boolean): TradingSignal | null {
    if (ind.macd && ind.signal && ind.rsi && ind.macd > ind.signal && ind.rsi < 40 && current.close > previous.close) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.REVERSAL, Direction.LONG, current.close, ind,
        { trendAlignment: 0.6, volumeConfirmation: 0.7, supportResistance: 0.6, momentumStrength: 0.8, volatilityAppropriate: 0.7 },
        ['MACD_CROSS','RSI_OVERSOLD'], enriched);
    }
    if (ind.macd && ind.signal && ind.rsi && ind.macd < ind.signal && ind.rsi > 60 && current.close < previous.close) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.REVERSAL, Direction.SHORT, current.close, ind,
        { trendAlignment: 0.6, volumeConfirmation: 0.7, supportResistance: 0.6, momentumStrength: 0.8, volatilityAppropriate: 0.7 },
        ['MACD_CROSS_DOWN','RSI_OVERBOUGHT'], enriched);
    }
    return null;
  }

  private checkContinuation(current: MarketData, previous: MarketData, ind: TechnicalIndicators, enriched: boolean): TradingSignal | null {
    if (current.close > ind.ema20 && ind.ema20 > ind.ema50 && current.close > ind.vwap) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.CONTINUATION, Direction.LONG, current.close, ind,
        { trendAlignment: 0.8, volumeConfirmation: 0.6, supportResistance: 0.7, momentumStrength: 0.7, volatilityAppropriate: 0.8 },
        ['TREND_ALIGNED','EMA_ALIGNMENT','VWAP_SUPPORT'], enriched);
    }
    if (current.close < ind.ema20 && ind.ema20 < ind.ema50 && current.close < ind.vwap) {
      return this.createSignal(current.symbol, current.timestamp, SignalType.CONTINUATION, Direction.SHORT, current.close, ind,
        { trendAlignment: 0.8, volumeConfirmation: 0.6, supportResistance: 0.7, momentumStrength: 0.7, volatilityAppropriate: 0.8 },
        ['TREND_ALIGNED','EMA_ALIGNMENT','VWAP_RESISTANCE'], enriched);
    }
    return null;
  }

  // === Helpers ===
  private calculateConfluenceScore(factors: ConfluenceFactors): number {
    const weights = { trendAlignment: 0.25, volumeConfirmation: 0.20, supportResistance: 0.20, momentumStrength: 0.20, volatilityAppropriate: 0.15 };
    return Object.entries(weights).reduce((score, [k,v]) => score + (factors[k as keyof ConfluenceFactors] || 0) * v, 0);
  }

  private createSignal(symbol: string, timestamp: Date, type: SignalType, direction: Direction, price: number, ind: TechnicalIndicators, factors: ConfluenceFactors, reasons: string[], enriched: boolean): TradingSignal {
    const confluence = this.calculateConfluenceScore(factors);
    const atr = ind.atr || price * 0.01;
    const stopLoss = direction === Direction.LONG ? price - (atr * 2) : price + (atr * 2);
    const takeProfit = direction === Direction.LONG ? price + (atr * 3) : price - (atr * 3);
    const rr = Math.abs(takeProfit - price) / Math.abs(stopLoss - price);
    return {
      id: `signal_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
      symbol,
      timestamp,
      signalType: type,
      direction,
      price,
      quantity: 0, // sized later
      stopLoss,
      takeProfit,
      indicators: ind,
      isEnriched: enriched,
      confluenceScore: confluence,
      reasonCodes: reasons,
      riskRewardRatio: rr,
      maxRisk: this.riskParams.maxRiskAmount,
      mode: TradingMode.BACKTEST,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  calculatePositionSize(accountBalance: number, riskAmount: number, stopLoss: number, currentPrice: number): number {
    const riskPerShare = Math.abs(currentPrice - stopLoss);
    if (riskPerShare <= 0) return 0;
    const maxSharesByRisk = Math.floor(riskAmount / riskPerShare);
    const maxSharesByBalance = Math.floor(accountBalance * 0.95 / currentPrice);
    return Math.min(maxSharesByRisk, maxSharesByBalance);
  }

  validateSignal(signal: TradingSignal, params: RiskParameters): boolean {
    if (signal.confluenceScore < (params.minConfluenceScore ?? 0.6)) return false;
    if (signal.riskRewardRatio && signal.riskRewardRatio < (params.minRiskReward ?? 2.0)) return false;
    if (signal.indicators.atr && signal.indicators.atr > signal.price * 0.1) return false;
    return true;
  }

  // New method for the updated backtest engine
  analyzeMarket(
    data: MarketData[], 
    riskParams: RiskParameters,
    enrichedIndicators?: Partial<TechnicalIndicators>
  ): { tradingSignal: TradingSignal | null } {
    if (data.length < 50) return { tradingSignal: null }; // Need enough data for indicators

    const currentBar = data[data.length - 1];
    const previousBar = data[data.length - 2];

    // Calculate indicators (use enriched if available, otherwise calculate locally)
    const indicators: TechnicalIndicators = {
      atr: enrichedIndicators?.atr || this.calculateATR(data),
      ema20: enrichedIndicators?.ema20 || this.calculateEMA(data, 20),
      ema50: enrichedIndicators?.ema50 || this.calculateEMA(data, 50),
      vwap: enrichedIndicators?.vwap || this.calculateVWAP(data),
      rsi: enrichedIndicators?.rsi || this.calculateRSI(data),
      ...this.calculateMACD(data)
    };

    // Check for signals in order of priority
    let signal: TradingSignal | null = null;

    // Check for breakout signals first
    signal = this.checkBreakout(currentBar, previousBar, indicators, !!enrichedIndicators);
    if (signal) return { tradingSignal: signal };

    // Check for pullback signals
    signal = this.checkPullback(currentBar, previousBar, indicators, !!enrichedIndicators);
    if (signal) return { tradingSignal: signal };

    // Check for reversal signals
    signal = this.checkReversal(currentBar, previousBar, indicators, !!enrichedIndicators);
    if (signal) return { tradingSignal: signal };

    // Check for continuation signals
    signal = this.checkContinuation(currentBar, previousBar, indicators, !!enrichedIndicators);
    if (signal) return { tradingSignal: signal };

    return { tradingSignal: null };
  }
}
