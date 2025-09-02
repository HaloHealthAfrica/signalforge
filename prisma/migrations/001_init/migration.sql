-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('BREAKOUT', 'PULLBACK', 'REVERSAL', 'CONTINUATION');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('WIN', 'LOSS', 'BREAKEVEN', 'OPEN');

-- CreateEnum
CREATE TYPE "TradingMode" AS ENUM ('BACKTEST', 'LIVE', 'PAPER');

-- CreateTable
CREATE TABLE "TradeSignal" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "signalType" "SignalType" NOT NULL,
    "direction" "Direction" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "atr" DOUBLE PRECISION,
    "ema20" DOUBLE PRECISION,
    "ema50" DOUBLE PRECISION,
    "vwap" DOUBLE PRECISION,
    "isEnriched" BOOLEAN NOT NULL DEFAULT false,
    "enrichedAt" TIMESTAMP(3),
    "confluenceScore" DOUBLE PRECISION NOT NULL,
    "reasonCodes" TEXT[],
    "riskRewardRatio" DOUBLE PRECISION,
    "maxRisk" DOUBLE PRECISION,
    "orderId" TEXT,
    "executedAt" TIMESTAMP(3),
    "executedPrice" DOUBLE PRECISION,
    "executedQuantity" INTEGER,
    "outcome" "Outcome",
    "pnl" DOUBLE PRECISION,
    "closedAt" TIMESTAMP(3),
    "mode" "TradingMode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradeSignal_symbol_timestamp_idx" ON "TradeSignal"("symbol", "timestamp");

-- CreateIndex
CREATE INDEX "TradeSignal_outcome_idx" ON "TradeSignal"("outcome");

-- CreateIndex
CREATE INDEX "TradeSignal_isEnriched_idx" ON "TradeSignal"("isEnriched");
