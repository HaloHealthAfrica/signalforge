import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'TradeLoop API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api_status: '/api/status',
      market_data: '/api/market/overview',
      signals: '/api/signals',
      portfolio: '/api/portfolio/positions',
      backtest: '/api/backtest/run',
      settings: '/api/settings'
    },
    docs: 'Visit /health for service health check'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'TradeLoop Backend',
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple API endpoints for now
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Market Data API
app.get('/api/market/overview', (req, res) => {
  // Mock market data - replace with real adapter calls
  const marketData = {
    SPY: { 
      price: 441.23 + (Math.random() - 0.5) * 2, 
      change: 2.45 + (Math.random() - 0.5) * 1, 
      changePercent: 0.56 + (Math.random() - 0.5) * 0.2 
    },
    QQQ: { 
      price: 376.89 + (Math.random() - 0.5) * 2, 
      change: -1.23 + (Math.random() - 0.5) * 1, 
      changePercent: -0.33 + (Math.random() - 0.5) * 0.2 
    },
    AAPL: { 
      price: 189.45 + (Math.random() - 0.5) * 2, 
      change: 3.21 + (Math.random() - 0.5) * 1, 
      changePercent: 1.72 + (Math.random() - 0.5) * 0.2 
    },
    TSLA: { 
      price: 251.34 + (Math.random() - 0.5) * 2, 
      change: -4.67 + (Math.random() - 0.5) * 1, 
      changePercent: -1.83 + (Math.random() - 0.5) * 0.2 
    }
  };
  
  res.json(marketData);
});

// Trading Signals API
app.get('/api/signals', (req, res) => {
  const signals = [
    { 
      id: 1, 
      symbol: 'AAPL', 
      type: 'BUY', 
      confluence: 87, 
      price: 189.45, 
      timestamp: new Date().toISOString(),
      signalType: 'BREAKOUT',
      direction: 'LONG',
      reasonCodes: ['Trend Alignment', 'Volume Confirmation'],
      riskRewardRatio: 2.5
    },
    { 
      id: 2, 
      symbol: 'MSFT', 
      type: 'SELL', 
      confluence: 72, 
      price: 334.21, 
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      signalType: 'REVERSAL',
      direction: 'SHORT',
      reasonCodes: ['RSI Overbought', 'Support Break'],
      riskRewardRatio: 1.8
    },
    { 
      id: 3, 
      symbol: 'NVDA', 
      type: 'BUY', 
      confluence: 94, 
      price: 456.78, 
      timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      signalType: 'CONTINUATION',
      direction: 'LONG',
      reasonCodes: ['Strong Trend', 'Pullback Entry'],
      riskRewardRatio: 3.2
    },
    { 
      id: 4, 
      symbol: 'GOOGL', 
      type: 'BUY', 
      confluence: 68, 
      price: 134.56, 
      timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
      signalType: 'PULLBACK',
      direction: 'LONG',
      reasonCodes: ['Support Test', 'Volume Increase'],
      riskRewardRatio: 2.1
    }
  ];
  
  res.json(signals);
});

// Portfolio API
app.get('/api/portfolio/positions', (req, res) => {
  const positions = [
    { 
      symbol: 'AAPL', 
      shares: 100, 
      avgPrice: 185.23, 
      currentPrice: 189.45, 
      pnl: 422.00,
      marketValue: 18945.00,
      unrealizedPnL: 422.00,
      timestamp: new Date().toISOString()
    },
    { 
      symbol: 'TSLA', 
      shares: 50, 
      avgPrice: 258.91, 
      currentPrice: 251.34, 
      pnl: -378.50,
      marketValue: 12567.00,
      unrealizedPnL: -378.50,
      timestamp: new Date().toISOString()
    },
    { 
      symbol: 'NVDA', 
      shares: 25, 
      avgPrice: 442.15, 
      currentPrice: 456.78, 
      pnl: 365.75,
      marketValue: 11419.50,
      unrealizedPnL: 365.75,
      timestamp: new Date().toISOString()
    }
  ];
  
  res.json(positions);
});

app.get('/api/portfolio/performance', (req, res) => {
  const performance = {
    dailyPnL: 1247.83,
    dailyPnLPercent: 2.4,
    winRate: 73.2,
    winRateChange: 1.8,
    maxDrawdown: -2.1,
    maxDrawdownChange: -0.3,
    totalPnL: 409.25,
    totalPnLPercent: 0.8,
    sharpeRatio: 1.85,
    totalTrades: 24,
    winningTrades: 18,
    losingTrades: 6
  };
  
  res.json(performance);
});

// Backtest API
app.post('/api/backtest/run', (req, res) => {
  const { symbols, fromDate, toDate, initialBalance, riskParams } = req.body;
  
  // Mock backtest result - replace with real backtest engine
  const backtestResult = {
    totalSignals: 24,
    winningSignals: 18,
    losingSignals: 6,
    breakevenSignals: 0,
    winRate: 75.0,
    totalPnL: 1247.83,
    averagePnL: 51.99,
    maxDrawdown: -2.1,
    sharpeRatio: 1.85,
    finalBalance: 101247.83,
    returnPercentage: 1.25,
    signals: [],
    equityCurve: [
      { date: new Date(fromDate), balance: initialBalance },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), balance: initialBalance * 0.998 },
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), balance: initialBalance * 1.002 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), balance: initialBalance * 1.008 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), balance: initialBalance * 1.012 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), balance: initialBalance * 1.015 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), balance: initialBalance * 1.018 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), balance: initialBalance * 1.021 },
      { date: new Date(), balance: initialBalance * 1.025 }
    ]
  };
  
  res.json(backtestResult);
});

// Risk Management API
app.get('/api/risk/parameters', (req, res) => {
  const riskParams = {
    maxRiskPercent: 2.0,
    maxDailyLoss: 5.0,
    maxDailyWin: 10.0,
    symbolCooldownHours: 24,
    killZoneStart: "09:30",
    killZoneEnd: "16:00",
    commissionPerTrade: 0.65,
    slippagePercent: 0.1,
    maxRiskAmount: 2000,
    minConfluenceScore: 0.6,
    minRiskReward: 2.0
  };
  
  res.json(riskParams);
});

app.get('/api/risk/exposure', (req, res) => {
  const exposure = {
    totalExposure: 42931.50,
    maxExposure: 50000,
    exposurePercent: 85.9,
    sectorExposure: {
      'Technology': 45.2,
      'Consumer Discretionary': 29.3,
      'Communication Services': 25.5
    },
    correlationMatrix: [
      ['AAPL', 'TSLA', 'NVDA'],
      [1.0, 0.3, 0.7],
      [0.3, 1.0, 0.4],
      [0.7, 0.4, 1.0]
    ]
  };
  
  res.json(exposure);
});

// Settings API
app.get('/api/settings', (req, res) => {
  const settings = {
    apiKeys: {
      polygon: process.env.POLYGON_API_KEY || '',
      twelveData: process.env.TWELVEDATA_API_KEY || '',
      tradier: process.env.TRADIER_API_KEY || '',
      tradierAccessToken: process.env.TRADIER_ACCESS_TOKEN || ''
    },
    tradingPreferences: {
      defaultRiskPercent: 2.0,
      maxDailyLossPercent: 5.0,
      symbolCooldownHours: 24,
      usePaperTrading: true,
      autoExecuteSignals: false
    }
  };
  
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const { apiKeys, tradingPreferences } = req.body;
  
  // In a real implementation, save to database
  console.log('Saving settings:', { apiKeys, tradingPreferences });
  
  res.json({ 
    success: true, 
    message: 'Settings saved successfully',
    timestamp: new Date().toISOString()
  });
});

// Market Hours API
app.get('/api/market/hours', (req, res) => {
  const now = new Date();
  const marketOpen = new Date(now);
  marketOpen.setHours(9, 30, 0, 0);
  
  const marketClose = new Date(now);
  marketClose.setHours(16, 0, 0, 0);
  
  const isMarketOpen = now >= marketOpen && now <= marketClose;
  const timeUntilOpen = Math.max(0, marketOpen.getTime() - now.getTime());
  const timeUntilClose = Math.max(0, marketClose.getTime() - now.getTime());
  
  const marketHours = {
    isOpen: isMarketOpen,
    openTime: "09:30",
    closeTime: "16:00",
    timeUntilOpen: timeUntilOpen,
    timeUntilClose: timeUntilClose,
    nextOpen: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    timezone: "America/New_York"
  };
  
  res.json(marketHours);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TradeLoop Backend Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});

export default app;
