import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  PieChart, 
  BarChart3, 
  Settings as SettingsIcon, 
  Bell, 
  Search,
  Menu,
  Zap,
  Target,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  marketAPI, 
  signalsAPI, 
  portfolioAPI, 
  backtestAPI, 
  riskAPI, 
  settingsAPI,
  formatCurrency,
  formatPercentage,
  formatTimestamp,
  calculateTimeRemaining
} from './services/api';
import { useApi, useApiMutation, usePolling } from './hooks/useApi';
import { 
  MarketData, 
  TradingSignal, 
  Position, 
  Performance, 
  RiskParameters, 
  MarketHours, 
  Settings,
  BacktestResult,
  BacktestRequest
} from './types/api';

const TradeLoopApp = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Debug info on mount
  useEffect(() => {
    console.log('🚀 TradeLoop App Loading...');
    console.log('📍 Environment:', import.meta.env.MODE);
    console.log('🌐 API URL:', import.meta.env.VITE_API_URL);
  }, []);

  // API data hooks
  const { data: marketData, loading: marketLoading, error: marketError } = usePolling<MarketData>(
    marketAPI.getOverview,
    3000 // Poll every 3 seconds for real-time updates
  );

  const { data: signals, loading: signalsLoading, error: signalsError } = usePolling<TradingSignal[]>(
    signalsAPI.getAll,
    5000 // Poll every 5 seconds for signals
  );

  const { data: positions, loading: positionsLoading, error: positionsError } = usePolling<Position[]>(
    portfolioAPI.getPositions,
    10000 // Poll every 10 seconds for portfolio
  );

  const { data: performance, loading: performanceLoading, error: performanceError } = useApi<Performance>(
    portfolioAPI.getPerformance
  );

  const { data: riskParams } = useApi<RiskParameters>(
    riskAPI.getParameters
  );

  const { data: marketHours, loading: marketHoursLoading } = useApi<MarketHours>(
    marketAPI.getHours
  );

  const { data: settings } = useApi<Settings>(
    settingsAPI.get
  );

  // Backtest mutation hook
  const backtestMutation = useApiMutation<BacktestRequest, BacktestResult>(backtestAPI.runBacktest);

  // Settings mutation hook
  const settingsMutation = useApiMutation(settingsAPI.update);

  // Local state for form inputs
  const [backtestConfig, setBacktestConfig] = useState({
    symbols: 'SPY, QQQ, AAPL',
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    initialBalance: 100000
  });

  const [apiKeys, setApiKeys] = useState({
    polygon: '',
    twelveData: '',
    tradier: '',
    tradierAccessToken: ''
  });

  const [tradingPreferences, setTradingPreferences] = useState({
    defaultRiskPercent: 2.0,
    maxDailyLossPercent: 5.0,
    symbolCooldownHours: 24
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setApiKeys(settings.apiKeys || {});
      setTradingPreferences(settings.tradingPreferences || {});
    }
  }, [settings]);

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-900 border-r border-slate-700 flex flex-col`}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-white">TradeLoop</h1>
              <p className="text-xs text-slate-400">AI Trading Platform</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'signals', label: 'Signals', icon: Target },
          { id: 'portfolio', label: 'Portfolio', icon: PieChart },
          { id: 'backtest', label: 'Backtest', icon: BarChart3 },
          { id: 'risk', label: 'Risk Management', icon: Shield },
          { id: 'settings', label: 'Settings', icon: SettingsIcon }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeView === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className={`w-2 h-2 rounded-full ${marketError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          {sidebarOpen && <span className="text-sm">{marketError ? 'Disconnected' : 'Connected'}</span>}
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <div className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center space-x-2 text-slate-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {marketHoursLoading ? 'Loading...' : 
             marketHours?.isOpen ? 
               `Market Open: ${calculateTimeRemaining(marketHours.nextOpen)}` : 
               'Market Closed'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search symbols..." 
            className="bg-transparent text-white placeholder-slate-400 outline-none w-48"
          />
        </div>
        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-300" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </button>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <SettingsIcon className="w-5 h-5 text-slate-300" />
        </button>
      </div>
    </div>
  );

  const MarketOverview = () => {
    if (marketLoading) {
      return (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 animate-pulse">
              <div className="h-8 bg-slate-700 rounded mb-2"></div>
              <div className="h-6 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (marketError) {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">Error loading market data: {marketError}</span>
          </div>
        </div>
      );
    }

    if (!marketData) return null;

    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(marketData).map(([symbol, data]) => (
          <div key={symbol} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{symbol}</h3>
              {data.change >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{formatCurrency(data.price)}</p>
              <p className={`text-sm ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.change >= 0 ? '+' : ''}{formatCurrency(data.change)} ({formatPercentage(data.changePercent)})
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const SignalsFeed = () => {
    if (signalsLoading) {
      return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      );
    }

    if (signalsError) {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">Error loading signals: {signalsError}</span>
          </div>
        </div>
      );
    }

    if (!signals) return null;

    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            Live Signals
          </h3>
          <span className="text-sm text-slate-400">Last updated: now</span>
        </div>
        
        <div className="space-y-3">
          {signals.map(signal => (
            <div key={signal.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  signal.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-semibold text-white">{signal.symbol}</p>
                  <p className="text-sm text-slate-400">{formatCurrency(signal.price)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Confluence</p>
                  <p className={`font-bold ${
                    signal.confluence >= 80 ? 'text-green-500' : 
                    signal.confluence >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {signal.confluence}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">Time</p>
                  <p className="text-white text-sm">{formatTimestamp(signal.timestamp)}</p>
                </div>
                <button className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  signal.type === 'BUY' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}>
                  {signal.type}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PositionsPanel = () => {
    if (positionsLoading) {
      return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      );
    }

    if (positionsError) {
      return (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">Error loading positions: {positionsError}</span>
          </div>
        </div>
      );
    }

    if (!positions) return null;

    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            Active Positions
          </h3>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-400">Total P&L:</span>
            <span className={`font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalPnL)}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          {positions.map((position, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div>
                <p className="font-semibold text-white">{position.symbol}</p>
                <p className="text-sm text-slate-400">{position.shares} shares @ {formatCurrency(position.avgPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{formatCurrency(position.currentPrice)}</p>
                <p className={`text-sm font-bold ${
                  position.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PerformanceMetrics = () => {
    if (performanceLoading) {
      return (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 animate-pulse">
              <div className="h-6 bg-slate-700 rounded mb-2"></div>
              <div className="h-8 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (performanceError || !performance) return null;

    const metrics = [
      { 
        label: 'Daily P&L', 
        value: formatCurrency(performance.dailyPnL), 
        change: formatPercentage(performance.dailyPnLPercent), 
        positive: performance.dailyPnL >= 0, 
        icon: DollarSign 
      },
      { 
        label: 'Win Rate', 
        value: `${performance.winRate}%`, 
        change: formatPercentage(performance.winRateChange), 
        positive: performance.winRateChange >= 0, 
        icon: Target 
      },
      { 
        label: 'Max Drawdown', 
        value: formatPercentage(performance.maxDrawdown), 
        change: formatPercentage(performance.maxDrawdownChange), 
        positive: performance.maxDrawdownChange >= 0, 
        icon: TrendingDown 
      }
    ];

    return (
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-5 h-5 ${
                index === 0 ? 'text-green-500' : index === 1 ? 'text-blue-500' : 'text-red-500'
              }`} />
              <span className={`text-sm ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-sm text-slate-400">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ChartPlaceholder = () => (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Price Chart</h3>
        <div className="flex space-x-2">
          {['1m', '5m', '15m', '1h', '1d'].map(timeframe => (
            <button key={timeframe} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors">
              {timeframe}
            </button>
          ))}
        </div>
      </div>
      <div className="h-60 bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">Interactive Chart Component</p>
          <p className="text-sm text-slate-500">TradingView integration would go here</p>
        </div>
      </div>
    </div>
  );

  // Additional view components
  const SignalsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Trading Signals</h1>
          <p className="text-slate-400">Real-time AI-generated trading opportunities</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-900/20 border border-blue-700 rounded-lg px-4 py-2">
          <Target className="w-5 h-5 text-blue-500" />
          <span className="text-blue-400 font-semibold">Live Signals</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <SignalsFeed />
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Signal Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Signals', value: '24', change: '+3', positive: true },
              { label: 'Buy Signals', value: '18', change: '+2', positive: true },
              { label: 'Sell Signals', value: '6', change: '+1', positive: true },
              { label: 'Avg Confluence', value: '78.5%', change: '+2.1%', positive: true }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PortfolioView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Management</h1>
          <p className="text-slate-400">Track positions, performance, and risk</p>
        </div>
        <div className="flex items-center space-x-2 bg-purple-900/20 border border-purple-700 rounded-lg px-4 py-2">
          <PieChart className="w-5 h-5 text-purple-500" />
          <span className="text-purple-400 font-semibold">Active Portfolio</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <ChartPlaceholder />
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
            <div className="h-40 bg-slate-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Portfolio Allocation Chart</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <PositionsPanel />
          <PerformanceMetrics />
        </div>
      </div>
    </div>
  );

  const BacktestView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Backtesting Engine</h1>
          <p className="text-slate-400">Test strategies with historical data</p>
        </div>
        <div className="flex items-center space-x-2 bg-orange-900/20 border border-orange-700 rounded-lg px-4 py-2">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <span className="text-orange-400 font-semibold">Historical Analysis</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Backtest Configuration</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Symbols</label>
              <input 
                type="text" 
                placeholder="SPY, QQQ, AAPL" 
                value={backtestConfig.symbols}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, symbols: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Date Range</label>
              <input 
                type="date" 
                value={backtestConfig.fromDate}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, fromDate: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Initial Capital</label>
              <input 
                type="number" 
                placeholder="100000" 
                value={backtestConfig.initialBalance}
                onChange={(e) => setBacktestConfig(prev => ({ ...prev, initialBalance: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => {
                const config = {
                  symbols: backtestConfig.symbols.split(',').map(s => s.trim()),
                  fromDate: backtestConfig.fromDate,
                  toDate: new Date().toISOString().split('T')[0],
                  initialBalance: backtestConfig.initialBalance,
                  riskParams: riskParams || {}
                };
                backtestMutation.mutate(config);
              }}
              disabled={backtestMutation.loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-semibold"
            >
              {backtestMutation.loading ? 'Running...' : 'Run Backtest'}
            </button>
            <button 
              onClick={() => setBacktestConfig({
                symbols: 'SPY, QQQ, AAPL',
                fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                toDate: new Date().toISOString().split('T')[0],
                initialBalance: 100000
              })}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
            >
              Reset
            </button>
          </div>
          {backtestMutation.error && (
            <div className="mt-4 bg-red-900/20 border border-red-700 rounded-lg p-3">
              <span className="text-red-400">Error: {backtestMutation.error}</span>
            </div>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-80">
          <h3 className="text-lg font-semibold text-white mb-4">Backtest Results</h3>
          {backtestMutation.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">{backtestMutation.data.winRate}%</p>
                  <p className="text-sm text-slate-400">Win Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(backtestMutation.data.totalPnL)}</p>
                  <p className="text-sm text-slate-400">Total P&L</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{backtestMutation.data.sharpeRatio.toFixed(2)}</p>
                  <p className="text-sm text-slate-400">Sharpe Ratio</p>
                </div>
              </div>
              <div className="h-40 bg-slate-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">Equity Curve Chart</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-60 bg-slate-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Backtest Results Chart</p>
                <p className="text-sm text-slate-500">Run a backtest to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RiskManagementView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Risk Management</h1>
          <p className="text-slate-400">Monitor exposure and manage risk parameters</p>
        </div>
        <div className="flex items-center space-x-2 bg-red-900/20 border border-red-700 rounded-lg px-4 py-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="text-red-400 font-semibold">Risk Monitoring</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Position Sizing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Account Balance</label>
                <input type="text" value="$100,000" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" readOnly />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Risk Per Trade (%)</label>
                <input type="text" value="2.0%" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" readOnly />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Max Position Size</label>
                <input type="text" value="$2,000" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" readOnly />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Limits</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Max Daily Loss:</span>
                <span className="text-red-500 font-semibold">-$5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Daily Win:</span>
                <span className="text-green-500 font-semibold">+$10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current P&L:</span>
                <span className="text-green-500 font-semibold">+$1,247.83</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Heat Map</h3>
            <div className="h-40 bg-slate-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Risk Exposure Heat Map</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Correlation Matrix</h3>
            <div className="h-40 bg-slate-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Asset Correlation Matrix</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings & Configuration</h1>
          <p className="text-slate-400">Manage platform preferences and API keys</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-700 rounded-lg px-4 py-2">
          <SettingsIcon className="w-5 h-5 text-slate-400" />
          <span className="text-slate-300 font-semibold">Configuration</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Polygon API Key</label>
              <input 
                type="password" 
                placeholder="Enter API key" 
                value={apiKeys.polygon}
                onChange={(e) => setApiKeys(prev => ({ ...prev, polygon: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">TwelveData API Key</label>
              <input 
                type="password" 
                placeholder="Enter API key" 
                value={apiKeys.twelveData}
                onChange={(e) => setApiKeys(prev => ({ ...prev, twelveData: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tradier API Key</label>
              <input 
                type="password" 
                placeholder="Enter API key" 
                value={apiKeys.tradier}
                onChange={(e) => setApiKeys(prev => ({ ...prev, tradier: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tradier Access Token</label>
              <input 
                type="password" 
                placeholder="Enter access token" 
                value={apiKeys.tradierAccessToken}
                onChange={(e) => setApiKeys(prev => ({ ...prev, tradierAccessToken: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => {
                const newSettings = {
                  apiKeys,
                  tradingPreferences
                };
                settingsMutation.mutate(newSettings);
              }}
              disabled={settingsMutation.loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-semibold"
            >
              {settingsMutation.loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
          {settingsMutation.error && (
            <div className="mt-4 bg-red-900/20 border border-red-700 rounded-lg p-3">
              <span className="text-red-400">Error: {settingsMutation.error}</span>
            </div>
          )}
          {settingsMutation.data && (
            <div className="mt-4 bg-green-900/20 border border-green-700 rounded-lg p-3">
              <span className="text-green-400">Settings saved successfully!</span>
            </div>
          )}
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Trading Preferences</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Default Risk %</label>
              <input 
                type="number" 
                step="0.1"
                value={tradingPreferences.defaultRiskPercent}
                onChange={(e) => setTradingPreferences(prev => ({ ...prev, defaultRiskPercent: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Max Daily Loss %</label>
              <input 
                type="number" 
                step="0.1"
                value={tradingPreferences.maxDailyLossPercent}
                onChange={(e) => setTradingPreferences(prev => ({ ...prev, maxDailyLossPercent: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Symbol Cooldown (hrs)</label>
              <input 
                type="number" 
                value={tradingPreferences.symbolCooldownHours}
                onChange={(e) => setTradingPreferences(prev => ({ ...prev, symbolCooldownHours: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
                    <p className="text-slate-400">Real-time market overview and AI signals</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-900/20 border border-green-700 rounded-lg px-4 py-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-400 font-semibold">
                      {marketHoursLoading ? 'Loading...' : 
                       marketHours?.isOpen ? 'Market Open' : 'Market Closed'}
                    </span>
                  </div>
                </div>
                
                <MarketOverview />
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    <ChartPlaceholder />
                    <SignalsFeed />
                  </div>
                  <div className="space-y-6">
                    <PositionsPanel />
                    <PerformanceMetrics />
                  </div>
                </div>
              </div>
            )}
            
            {activeView === 'signals' && <SignalsView />}
            {activeView === 'portfolio' && <PortfolioView />}
            {activeView === 'backtest' && <BacktestView />}
            {activeView === 'risk' && <RiskManagementView />}
            {activeView === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TradeLoopApp;
