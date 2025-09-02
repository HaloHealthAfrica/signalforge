import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target,
  PieChart,
  TrendingDown,
  Shield
} from 'lucide-react';

export const PortfolioView = () => {
  const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1m' | '3m' | '1y'>('1d')

  // Mock portfolio data
  const mockPortfolio = {
    totalValue: 125450.75,
    cash: 15450.75,
    invested: 110000.00,
    dayChange: 1250.50,
    dayChangePercent: 1.01,
    totalPnL: 25450.75,
    totalPnLPercent: 25.45
  }

  const mockPositions = [
    {
      symbol: 'AAPL',
      quantity: 100,
      averagePrice: 150.25,
      currentPrice: 175.43,
      marketValue: 17543.00,
      unrealizedPnL: 2518.00,
      unrealizedPnLPercent: 16.76
    },
    {
      symbol: 'MSFT',
      quantity: 50,
      averagePrice: 320.00,
      currentPrice: 338.11,
      marketValue: 16905.50,
      unrealizedPnL: 905.50,
      unrealizedPnLPercent: 5.66
    },
    {
      symbol: 'TSLA',
      quantity: 75,
      averagePrice: 250.00,
      currentPrice: 242.54,
      marketValue: 18190.50,
      unrealizedPnL: -559.50,
      unrealizedPnLPercent: -2.98
    },
    {
      symbol: 'NVDA',
      quantity: 25,
      averagePrice: 400.00,
      currentPrice: 456.78,
      marketValue: 11419.50,
      unrealizedPnL: 1419.50,
      unrealizedPnLPercent: 35.49
    }
  ]

  const timeframes: Array<{ value: '1d' | '1w' | '1m' | '3m' | '1y', label: string }> = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '1y', label: '1Y' },
  ]

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success-500'
    if (change < 0) return 'text-danger-500'
    return 'text-dark-300'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  return (
    <div className="h-full bg-dark-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
          <p className="text-dark-400">Monitor your positions and performance</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="trading-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Total Value</p>
                <p className="text-2xl font-bold text-white">${mockPortfolio.totalValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              {getChangeIcon(mockPortfolio.dayChange)}
              <span className={`text-sm font-medium ${getChangeColor(mockPortfolio.dayChange)}`}>
                {mockPortfolio.dayChange >= 0 ? '+' : ''}${mockPortfolio.dayChange.toLocaleString()} ({mockPortfolio.dayChangePercent}%)
              </span>
            </div>
          </div>

          <div className="trading-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Cash</p>
                <p className="text-2xl font-bold text-white">${mockPortfolio.cash.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <p className="text-sm text-dark-400 mt-3">Available for trading</p>
          </div>

          <div className="trading-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Invested</p>
                <p className="text-2xl font-bold text-white">${mockPortfolio.invested.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-warning-600" />
              </div>
            </div>
            <p className="text-sm text-dark-400 mt-3">In positions</p>
          </div>

          <div className="trading-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">Total P&L</p>
                <p className="text-2xl font-bold text-success-500">+${mockPortfolio.totalPnL.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <p className="text-sm text-success-500 mt-3">+{mockPortfolio.totalPnLPercent}%</p>
          </div>
        </div>

        {/* Performance Chart and Positions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 trading-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance</h3>
              <div className="flex space-x-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                      timeframe === tf.value
                        ? 'bg-primary-600 text-white'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64 bg-dark-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                <p className="text-dark-400">Performance chart</p>
                <p className="text-xs text-dark-500">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Allocation Chart */}
          <div className="trading-card">
            <h3 className="text-lg font-semibold text-white mb-4">Allocation</h3>
            <div className="h-64 bg-dark-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                <p className="text-dark-400">Allocation chart</p>
                <p className="text-xs text-dark-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Positions Table */}
        <div className="trading-card">
          <h3 className="text-lg font-semibold text-white mb-4">Open Positions</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 text-dark-400 font-medium">Symbol</th>
                  <th className="text-left py-3 text-dark-400 font-medium">Quantity</th>
                  <th className="text-left py-3 text-dark-400 font-medium">Avg Price</th>
                  <th className="text-left py-3 text-dark-400 font-medium">Current Price</th>
                  <th className="text-left py-3 text-dark-400 font-medium">Market Value</th>
                  <th className="text-left py-3 text-dark-400 font-medium">Unrealized P&L</th>
                  <th className="text-left py-3 text-dark-400 font-medium">P&L %</th>
                  <th className="text-left py-3 text-dark-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPositions.map((position) => (
                  <tr key={position.symbol} className="border-b border-dark-600 hover:bg-dark-700">
                    <td className="py-3">
                      <span className="font-semibold text-white">{position.symbol}</span>
                    </td>
                    <td className="py-3 text-white">{position.quantity}</td>
                    <td className="py-3 text-white">${position.averagePrice.toFixed(2)}</td>
                    <td className="py-3 text-white">${position.currentPrice.toFixed(2)}</td>
                    <td className="py-3 text-white">${position.marketValue.toLocaleString()}</td>
                    <td className={`py-3 font-medium ${getChangeColor(position.unrealizedPnL)}`}>
                      {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toLocaleString()}
                    </td>
                    <td className={`py-3 font-medium ${getChangeColor(position.unrealizedPnLPercent)}`}>
                      {position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors duration-200">
                          Trade
                        </button>
                        <button className="px-3 py-1 bg-dark-600 text-white text-xs rounded hover:bg-dark-500 transition-colors duration-200">
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="trading-card mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-success-600" />
                </div>
                <div>
                  <p className="text-white font-medium">Bought 50 AAPL</p>
                  <p className="text-sm text-dark-400">Market order executed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">$8,771.50</p>
                <p className="text-sm text-dark-400">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-danger-600" />
                </div>
                <div>
                  <p className="text-white font-medium">Sold 25 TSLA</p>
                  <p className="text-sm text-dark-400">Stop loss triggered</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">$6,063.50</p>
                <p className="text-sm text-dark-400">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
