import { PrismaClient } from '@prisma/client';
import { TradingSignal, Outcome, TradingMode } from '../types/trading';

export class FeedbackLogger {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async logSignal(signal: TradingSignal): Promise<void> {
    try {
      await this.prisma.tradeSignal.create({
        data: {
          id: signal.id,
          symbol: signal.symbol,
          timestamp: signal.timestamp,
          signalType: signal.signalType,
          direction: signal.direction,
          price: signal.price,
          quantity: signal.quantity,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
          atr: signal.indicators.atr,
          ema20: signal.indicators.ema20,
          ema50: signal.indicators.ema50,
          vwap: signal.indicators.vwap,
          isEnriched: signal.isEnriched,
          enrichedAt: signal.enrichedAt,
          confluenceScore: signal.confluenceScore,
          reasonCodes: signal.reasonCodes,
          riskRewardRatio: signal.riskRewardRatio,
          maxRisk: signal.maxRisk,
          mode: signal.mode,
          outcome: 'OPEN'
        }
      });

      console.log(`Signal logged: ${signal.symbol} ${signal.direction} ${signal.signalType} at ${signal.price}`);
    } catch (error) {
      console.error('Failed to log signal:', error);
      throw error;
    }
  }

  async updateSignalOutcome(
    signalId: string, 
    outcome: Outcome, 
    pnl?: number, 
    executedPrice?: number, 
    executedQuantity?: number
  ): Promise<void> {
    try {
      const updateData: any = {
        outcome,
        updatedAt: new Date()
      };

      if (pnl !== undefined) {
        updateData.pnl = pnl;
      }

      if (executedPrice !== undefined) {
        updateData.executedPrice = executedPrice;
      }

      if (executedQuantity !== undefined) {
        updateData.executedQuantity = executedQuantity;
      }

      if (outcome !== 'OPEN') {
        updateData.closedAt = new Date();
      }

      await this.prisma.tradeSignal.update({
        where: { id: signalId },
        data: updateData
      });

      console.log(`Signal outcome updated: ${signalId} -> ${outcome}${pnl ? ` (PnL: ${pnl})` : ''}`);
    } catch (error) {
      console.error('Failed to update signal outcome:', error);
      throw error;
    }
  }

  async updateSignalExecution(
    signalId: string, 
    orderId: string, 
    executedPrice: number, 
    executedQuantity: number
  ): Promise<void> {
    try {
      await this.prisma.tradeSignal.update({
        where: { id: signalId },
        data: {
          orderId,
          executedAt: new Date(),
          executedPrice,
          executedQuantity,
          updatedAt: new Date()
        }
      });

      console.log(`Signal execution updated: ${signalId} -> Order ${orderId} executed at ${executedPrice}`);
    } catch (error) {
      console.error('Failed to update signal execution:', error);
      throw error;
    }
  }

  async getSignalPerformance(
    symbol?: string,
    fromDate?: Date,
    toDate?: Date,
    mode?: TradingMode
  ): Promise<{
    totalSignals: number;
    winningSignals: number;
    losingSignals: number;
    breakevenSignals: number;
    openSignals: number;
    winRate: number;
    averagePnL: number;
    totalPnL: number;
    enrichedWinRate: number;
    localWinRate: number;
  }> {
    try {
      const whereClause: any = {};
      
      if (symbol) {
        whereClause.symbol = symbol;
      }
      
      if (fromDate || toDate) {
        whereClause.timestamp = {};
        if (fromDate) whereClause.timestamp.gte = fromDate;
        if (toDate) whereClause.timestamp.lte = toDate;
      }
      
      if (mode) {
        whereClause.mode = mode;
      }

      const signals = await this.prisma.tradeSignal.findMany({
        where: whereClause,
        select: {
          outcome: true,
          pnl: true,
          isEnriched: true,
          confluenceScore: true
        }
      });

      const totalSignals = signals.length;
      const winningSignals = signals.filter(s => s.outcome === 'WIN').length;
      const losingSignals = signals.filter(s => s.outcome === 'LOSS').length;
      const breakevenSignals = signals.filter(s => s.outcome === 'BREAKEVEN').length;
      const openSignals = signals.filter(s => s.outcome === 'OPEN').length;

      const closedSignals = signals.filter(s => s.outcome !== 'OPEN');
      const winRate = closedSignals.length > 0 ? winningSignals / closedSignals.length : 0;

      const pnlValues = signals.filter(s => s.pnl !== null).map(s => s.pnl!);
      const averagePnL = pnlValues.length > 0 ? pnlValues.reduce((sum, pnl) => sum + pnl, 0) / pnlValues.length : 0;
      const totalPnL = pnlValues.reduce((sum, pnl) => sum + pnl, 0);

      // Calculate enriched vs local win rates
      const enrichedSignals = signals.filter(s => s.isEnriched && s.outcome !== 'OPEN');
      const localSignals = signals.filter(s => !s.isEnriched && s.outcome !== 'OPEN');

      const enrichedWinRate = enrichedSignals.length > 0 
        ? enrichedSignals.filter(s => s.outcome === 'WIN').length / enrichedSignals.length 
        : 0;

      const localWinRate = localSignals.length > 0 
        ? localSignals.filter(s => s.outcome === 'WIN').length / localSignals.length 
        : 0;

      return {
        totalSignals,
        winningSignals,
        losingSignals,
        breakevenSignals,
        openSignals,
        winRate,
        averagePnL,
        totalPnL,
        enrichedWinRate,
        localWinRate
      };
    } catch (error) {
      console.error('Failed to get signal performance:', error);
      throw error;
    }
  }

  async getConfluenceAnalysis(
    symbol?: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    confluenceRanges: Array<{
      range: string;
      count: number;
      winRate: number;
      averagePnL: number;
    }>;
    topReasonCodes: Array<{
      reasonCode: string;
      count: number;
      winRate: number;
    }>;
  }> {
    try {
      const whereClause: any = {
        outcome: { not: 'OPEN' }
      };
      
      if (symbol) {
        whereClause.symbol = symbol;
      }
      
      if (fromDate || toDate) {
        whereClause.timestamp = {};
        if (fromDate) whereClause.timestamp.gte = fromDate;
        if (toDate) whereClause.timestamp.lte = toDate;
      }

      const signals = await this.prisma.tradeSignal.findMany({
        where: whereClause,
        select: {
          confluenceScore: true,
          reasonCodes: true,
          outcome: true,
          pnl: true
        }
      });

      // Analyze confluence score ranges
      const confluenceRanges = [
        { min: 0.6, max: 0.7, label: '0.6-0.7' },
        { min: 0.7, max: 0.8, label: '0.7-0.8' },
        { min: 0.8, max: 0.9, label: '0.8-0.9' },
        { min: 0.9, max: 1.0, label: '0.9-1.0' }
      ];

      const rangeAnalysis = confluenceRanges.map(range => {
        const rangeSignals = signals.filter(s => 
          s.confluenceScore >= range.min && s.confluenceScore < range.max
        );
        
        const wins = rangeSignals.filter(s => s.outcome === 'WIN').length;
        const winRate = rangeSignals.length > 0 ? wins / rangeSignals.length : 0;
        const averagePnL = rangeSignals.length > 0 
          ? rangeSignals.reduce((sum, s) => sum + (s.pnl || 0), 0) / rangeSignals.length 
          : 0;

        return {
          range: range.label,
          count: rangeSignals.length,
          winRate,
          averagePnL
        };
      });

      // Analyze reason codes
      const reasonCodeMap = new Map<string, { count: number; wins: number }>();
      
      signals.forEach(signal => {
        signal.reasonCodes.forEach(code => {
          const existing = reasonCodeMap.get(code) || { count: 0, wins: 0 };
          existing.count++;
          if (signal.outcome === 'WIN') existing.wins++;
          reasonCodeMap.set(code, existing);
        });
      });

      const topReasonCodes = Array.from(reasonCodeMap.entries())
        .map(([code, stats]) => ({
          reasonCode: code,
          count: stats.count,
          winRate: stats.wins / stats.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        confluenceRanges: rangeAnalysis,
        topReasonCodes
      };
    } catch (error) {
      console.error('Failed to get confluence analysis:', error);
      throw error;
    }
  }

  async getSymbolPerformance(symbols: string[]): Promise<Array<{
    symbol: string;
    totalSignals: number;
    winRate: number;
    averagePnL: number;
    totalPnL: number;
    bestSignal: string;
    worstSignal: string;
  }>> {
    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const signals = await this.prisma.tradeSignal.findMany({
            where: { 
              symbol,
              outcome: { not: 'OPEN' }
            },
            select: {
              id: true,
              outcome: true,
              pnl: true,
              confluenceScore: true
            },
            orderBy: { timestamp: 'desc' }
          });

          if (signals.length === 0) {
            return {
              symbol,
              totalSignals: 0,
              winRate: 0,
              averagePnL: 0,
              totalPnL: 0,
              bestSignal: '',
              worstSignal: ''
            };
          }

          const wins = signals.filter(s => s.outcome === 'WIN').length;
          const winRate = wins / signals.length;
          const pnlValues = signals.filter(s => s.pnl !== null).map(s => s.pnl!);
          const averagePnL = pnlValues.length > 0 ? pnlValues.reduce((sum, pnl) => sum + pnl, 0) / pnlValues.length : 0;
          const totalPnL = pnlValues.reduce((sum, pnl) => sum + pnl, 0);

          const bestSignal = signals.reduce((best, current) => 
            (current.pnl || 0) > (best.pnl || 0) ? current : best
          ).id;

          const worstSignal = signals.reduce((worst, current) => 
            (current.pnl || 0) < (worst.pnl || 0) ? current : worst
          ).id;

          return {
            symbol,
            totalSignals: signals.length,
            winRate,
            averagePnL,
            totalPnL,
            bestSignal,
            worstSignal
          };
        })
      );

      return results;
    } catch (error) {
      console.error('Failed to get symbol performance:', error);
      throw error;
    }
  }

  async cleanupOldSignals(daysToKeep: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prisma.tradeSignal.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Cleaned up ${result.count} old signals older than ${daysToKeep} days`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup old signals:', error);
      throw error;
    }
  }

  async getDatabaseStats(): Promise<{
    totalSignals: number;
    totalEnrichedSignals: number;
    totalLocalSignals: number;
    oldestSignal: Date | null;
    newestSignal: Date | null;
    databaseSize: string;
  }> {
    try {
      const [totalSignals, enrichedSignals, localSignals, oldestSignal, newestSignal] = await Promise.all([
        this.prisma.tradeSignal.count(),
        this.prisma.tradeSignal.count({ where: { isEnriched: true } }),
        this.prisma.tradeSignal.count({ where: { isEnriched: false } }),
        this.prisma.tradeSignal.findFirst({ orderBy: { timestamp: 'asc' }, select: { timestamp: true } }),
        this.prisma.tradeSignal.findFirst({ orderBy: { timestamp: 'desc' }, select: { timestamp: true } })
      ]);

      return {
        totalSignals,
        totalEnrichedSignals: enrichedSignals,
        totalLocalSignals: localSignals,
        oldestSignal: oldestSignal?.timestamp || null,
        newestSignal: newestSignal?.timestamp || null,
        databaseSize: 'N/A' // Would need additional queries to get actual DB size
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
