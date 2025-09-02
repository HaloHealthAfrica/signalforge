import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target,
  Zap,
  Shield
} from 'lucide-react';

export const BacktestView = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  // Mock backtest results
  const mockResults = {
    totalSignals: 156,
    winningSignals: 89,
    losingSignals: 67,
    winRate: 57.1,
    totalPnL: 12450.75,
    maxDrawdown: -3250.50,
    sharpeRatio: 1.85,
    finalBalance: 112450.75,
    returnPercentage: 12.45
  }

  const handleStartBacktest = () => {
    setIsRunning(true)
    // Simulate progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10
      if (currentProgress >= 100) {
        currentProgress = 100
        setIsRunning(false)
        clearInterval(interval)
      }
      setProgress(currentProgress)
    }, 200)
  }

  const handleStopBacktest = () => {
    setIsRunning(false)
    setProgress(0)
  }

  return (
    <div className="h-full bg-dark-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Strategy Backtesting</h1>
          <p className="text-dark-400">Test your trading strategies against historical data</p>
        </div>

        {/* Backtest Controls */}
        <div className="trading-card mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Backtest Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Symbols</label>
              <input
                type="text"
                defaultValue="AAPL, MSFT, GOOGL, TSLA, NVDA"
                className="trading-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Start Date</label>
              <input
                type="date"
                defaultValue="2024-01-01"
                className="trading-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">End Date</label>
              <input
                type="date"
                defaultValue="2024-12-31"
                className="trading-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Initial Balance</label>
              <input
                type="number"
                defaultValue="100000"
                className="trading-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Max Risk %</label>
              <input
                type="number"
                defaultValue="2"
                step="0.1"
                className="trading-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Commission</label>
              <input
                type="number"
                defaultValue="1.00"
                step="0.01"
                className="trading-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Slippage %</label>
              <input
                type="number"
                defaultValue="0.1"
                step="0.01"
                className="trading-input w-full"
              />
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-300">Progress</span>
                <span className="text-sm text-white">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!isRunning ? (
              <button
                onClick={handleStartBacktest}
                className="trading-button-primary flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Start Backtest</span>
              </button>
            ) : (
              <button
                onClick={handleStopBacktest}
                className="trading-button-danger flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
            <button className="trading-button-secondary flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <div className="trading-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
              Performance Metrics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <p className="text-2xl font-bold text-white">{mockResults.totalSignals}</p>
                <p className="text-xs text-dark-400">Total Signals</p>
              </div>
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <p className="text-2xl font-bold text-success-500">{mockResults.winRate}%</p>
                <p className="text-xs text-dark-400">Win Rate</p>
              </div>
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <p className="text-2xl font-bold text-white">${mockResults.totalPnL.toLocaleString()}</p>
                <p className="text-xs text-dark-400">Total P&L</p>
              </div>
              <div className="text-center p-3 bg-dark-700 rounded-lg">
                <p className="text-2xl font-bold text-white">{mockResults.sharpeRatio}</p>
                <p className="text-xs text-dark-400">Sharpe Ratio</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-dark-400">Final Balance</span>
                <span className="text-white font-medium">${mockResults.finalBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Return %</span>
                <span className="text-success-500 font-medium">+{mockResults.returnPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Max Drawdown</span>
                <span className="text-danger-500 font-medium">${mockResults.maxDrawdown.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Equity Curve */}
          <div className="trading-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
              Equity Curve
            </h3>
            
            <div className="h-64 bg-dark-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                <p className="text-dark-400">Chart will appear here</p>
                <p className="text-xs text-dark-500">After backtest completion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Signals */}
        <div className="trading-card mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-500" />
            Recent Signals
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-2 text-dark-400 font-medium">Date</th>
                  <th className="text-left py-2 text-dark-400 font-medium">Symbol</th>
                  <th className="text-left py-2 text-dark-400 font-medium">Signal</th>
                  <th className="text-left py-2 text-dark-400 font-medium">Price</th>
                  <th className="text-left py-2 text-dark-400 font-medium">P&L</th>
                  <th className="text-left py-2 text-dark-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dark-600">
                  <td className="py-2 text-white">2024-08-30</td>
                  <td className="py-2 text-white">AAPL</td>
                  <td className="py-2">
                    <span className="signal-badge signal-buy">BUY</span>
                  </td>
                  <td className="py-2 text-white">$175.43</td>
                  <td className="py-2 text-success-500">+$45.20</td>
                  <td className="py-2">
                    <span className="status-indicator status-success">Closed</span>
                  </td>
                </tr>
                <tr className="border-b border-dark-600">
                  <td className="py-2 text-white">2024-08-30</td>
                  <td className="py-2 text-white">TSLA</td>
                  <td className="py-2">
                    <span className="signal-badge signal-sell">SELL</span>
                  </td>
                  <td className="py-2 text-white">$242.54</td>
                  <td className="py-2 text-danger-500">-$12.30</td>
                  <td className="py-2">
                    <span className="status-indicator status-danger">Closed</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
