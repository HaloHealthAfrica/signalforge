# TradeLoop 🚀

A sophisticated trading system that generates signals, executes trades, and learns from outcomes to continuously improve performance.

## 🎯 System Overview

TradeLoop implements a complete trading feedback loop:

1. **Signal Generation** → Technical analysis using ATR, EMA, VWAP with optional enrichment
2. **Trade Execution** → Automated order placement via Tradier (paper/live)
3. **Feedback Collection** → All signals and outcomes logged to PostgreSQL
4. **Performance Analysis** → Continuous improvement of confluence scoring and thresholds

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Polygon.io    │    │   TwelveData    │    │     Tradier     │
│  Market Data    │    │   Indicators    │    │   Execution     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TradeLoop Engine                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │   Polygon   │ │ TwelveData  │ │  Tradier    │             │
│  │  Adapter    │ │  Adapter    │ │  Adapter    │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
│                              │                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │  Trading    │ │ Backtest    │ │ Feedback    │             │
│  │Calculator   │ │  Engine     │ │  Logger     │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │ ml_trade_feedback│
                    └─────────────────┘
```

## ✨ Features

### 🔍 Signal Generation
- **Technical Indicators**: ATR, EMA (20/50), VWAP, RSI, MACD
- **Signal Types**: Breakout, Pullback, Reversal, Continuation
- **Confluence Scoring**: Multi-factor analysis with weighted scoring
- **Risk Management**: Stop-loss, take-profit, position sizing

### 📊 Data Sources
- **Polygon.io**: Historical bars + real-time WebSocket data
- **TwelveData**: Enriched technical indicators
- **Tradier**: Order execution and account management

### 🧪 Backtesting
- Historical data replay with realistic execution
- Performance metrics (win rate, P&L, drawdown, Sharpe ratio)
- Enriched vs local indicator comparison
- Risk parameter optimization

### 📈 Live Trading
- Real-time signal generation
- Paper trading mode for testing
- Live trading with risk controls
- Continuous performance monitoring

### 🔄 Feedback Loop
- Every signal logged to database
- Outcome tracking (WIN/LOSS/BREAKEVEN)
- Confluence score analysis
- Performance improvement recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- API keys for Polygon, TwelveData, and Tradier

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd tradeloop
npm install
```

2. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your API keys and database URL
```

3. **Set up database**
```bash
npm run db:generate
npm run db:migrate
```

4. **Build the project**
```bash
npm run build
```

### Usage Examples

#### Run a Backtest
```bash
# Basic backtest on SPY
npm run backtest -- -s SPY -f 2024-01-01 -t 2024-01-31

# Advanced backtest with enriched indicators
npm run backtest -- -s SPY,QQQ -f 2024-01-01 -t 2024-01-31 --enriched --balance 50000

# Custom timeframe and limits
npm run backtest -- -s SPY -f 2024-01-01 -t 2024-01-31 --timeframe 5 --max-signals 20
```

#### Start Live Trading
```bash
# Paper trading on SPY and QQQ
npm run live -- -s SPY,QQQ --paper

# Live trading with enriched indicators
npm run live -- -s SPY --enriched
```

#### Analyze Performance
```bash
# Overall performance
npm run analyze

# Symbol-specific analysis
npm run analyze -- -s SPY

# Date range analysis
npm run analyze -- -f 2024-01-01 -t 2024-01-31

# Mode-specific analysis
npm run analyze -- --mode PAPER
```

#### Database Statistics
```bash
npm run stats
```

## 📁 Project Structure

```
src/
├── adapters/           # External API integrations
│   ├── apiOptimizer.ts # Rate limiting & caching
│   ├── polygonAdapter.ts
│   ├── twelveDataAdapter.ts
│   └── tradierAdapter.ts
├── engine/             # Core trading logic
│   ├── backtestEngine.ts
│   └── tradingCalculator.ts
├── utils/              # Utilities
│   └── feedbackLogger.ts
├── types/              # TypeScript definitions
│   ├── trading.ts
│   └── dataProvider.ts
└── index.ts            # CLI entry point
```

## ⚙️ Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/tradeloop"

# API Keys
POLYGON_API_KEY="your_polygon_key"
TWELVEDATA_API_KEY="your_twelvedata_key"
TRADIER_API_KEY="your_tradier_key"
TRADIER_ACCESS_TOKEN="your_access_token"
TRADIER_ACCOUNT_ID="your_account_id"

# Trading Parameters
DEFAULT_RISK_PERCENT=2.0
MAX_DAILY_LOSS=5.0
MAX_DAILY_WIN=10.0
SYMBOL_COOLDOWN_HOURS=24
KILL_ZONE_START="09:30"
KILL_ZONE_END="15:45"
```

### Risk Management
- **Position Sizing**: Based on account balance and ATR
- **Daily Limits**: Maximum loss/win percentages
- **Symbol Cooldown**: Hours between trades on same symbol
- **Kill Zones**: Market hours restrictions

## 📊 Signal Generation Logic

### Confluence Factors
1. **Trend Alignment** (25%): Price vs EMA positioning
2. **Volume Confirmation** (20%): Volume supporting the move
3. **Support/Resistance** (20%): Proximity to key levels
4. **Momentum Strength** (20%): RSI, MACD confirmation
5. **Volatility Appropriate** (15%): ATR in normal range

### Signal Types
- **Breakout**: Price breaking above/below EMAs + VWAP with volume
- **Pullback**: Price near EMA with oversold/overbought RSI
- **Reversal**: MACD crossovers with RSI confirmation
- **Continuation**: Trend-following moves above/below EMAs

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="TradingCalculator"
```

## 📈 Performance Monitoring

### Key Metrics
- **Win Rate**: Percentage of profitable trades
- **Risk/Reward Ratio**: Average profit vs loss
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Sharpe Ratio**: Risk-adjusted returns
- **Enriched vs Local**: Performance comparison

### Database Queries
```sql
-- Get signal performance by confluence score
SELECT 
  CASE 
    WHEN confluence_score >= 0.9 THEN '0.9-1.0'
    WHEN confluence_score >= 0.8 THEN '0.8-0.9'
    WHEN confluence_score >= 0.7 THEN '0.7-0.8'
    ELSE '0.6-0.7'
  END as score_range,
  COUNT(*) as total_signals,
  AVG(CASE WHEN outcome = 'WIN' THEN 1.0 ELSE 0.0 END) as win_rate,
  AVG(pnl) as avg_pnl
FROM "TradeSignal"
WHERE outcome != 'OPEN'
GROUP BY score_range
ORDER BY score_range DESC;
```

## 🔧 Development

### Adding New Indicators
1. Extend `TechnicalIndicators` interface
2. Add calculation method to `TradingCalculator`
3. Update signal generation logic
4. Add to enriched indicators if applicable

### Adding New Signal Types
1. Extend `SignalType` enum
2. Add detection method to `TradingCalculator`
3. Implement confluence scoring
4. Add to backtest and live trading

### Database Schema Changes
1. Update Prisma schema
2. Generate migration: `npm run db:migrate`
3. Update types and interfaces
4. Test with existing data

## 🚨 Risk Disclaimer

This software is for educational and research purposes. Trading involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: This README + inline code comments
- **Community**: GitHub Discussions

---

**TradeLoop** - Where signals become profits through continuous learning 🎯📈
