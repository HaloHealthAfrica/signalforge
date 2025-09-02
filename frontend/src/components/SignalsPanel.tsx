import React from 'react';
import { 
  Target,
  Zap,
  Shield
} from 'lucide-react';

export const SignalsPanel = () => {
  const [filter, setFilter] = React.useState<'all' | 'buy' | 'sell'>('all')
  
  // Mock signals data
  const mockSignals = [
    {
      id: '1',
      symbol: 'AAPL',
      signalType: 'BUY' as const,
      direction: 'LONG' as const,
      price: 175.43,
      quantity: 100,
      confluenceScore: 0.85,
      reasonCodes: ['EMA_ABOVE', 'VWAP_ABOVE', 'VOLUME_SPIKE'],
      isEnriched: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: '2',
      symbol: 'TSLA',
      signalType: 'SELL' as const,
      direction: 'SHORT' as const,
      price: 242.54,
      quantity: 50,
      confluenceScore: 0.72,
      reasonCodes: ['MACD_CROSS_DOWN', 'RSI_OVERBOUGHT'],
      isEnriched: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
      id: '3',
      symbol: 'NVDA',
      signalType: 'BUY' as const,
      direction: 'LONG' as const,
      price: 456.78,
      quantity: 25,
      confluenceScore: 0.91,
      reasonCodes: ['BREAKOUT', 'TREND_ALIGNED', 'VOLUME_CONFIRMATION'],
      isEnriched: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
  ]

  const filteredSignals = filter === 'all' 
    ? mockSignals 
    : mockSignals.filter(signal => signal.signalType === filter.toUpperCase())

  const getSignalBgColor = (signalType: string) => {
    switch (signalType) {
      case 'BUY': return 'bg-success-100 text-success-800'
      case 'SELL': return 'bg-danger-100 text-danger-800'
      default: return 'bg-dark-100 text-dark-800'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="h-full flex flex-col bg-dark-800">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-white">AI Trading Signals</h2>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-success-500 animate-pulse" />
            <span className="text-xs text-success-500">Live</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {(['all', 'buy', 'sell'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {f === 'all' ? 'All' : f === 'buy' ? 'Buy' : 'Sell'}
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSignals.map((signal) => (
          <div
            key={signal.id}
            className="trading-card border-l-4 border-l-primary-500 hover:border-l-primary-400 transition-colors duration-200"
          >
            {/* Signal Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg text-white">{signal.symbol}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalBgColor(signal.signalType)}`}>
                  {signal.signalType}
                </span>
                {signal.isEnriched && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    AI Enhanced
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-dark-400">
                <Shield className="w-3 h-3" />
                <span>{formatTimeAgo(signal.timestamp)}</span>
              </div>
            </div>

            {/* Signal Details */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-dark-400">Price</p>
                <p className="text-lg font-bold text-white">${signal.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400">Quantity</p>
                <p className="text-lg font-bold text-white">{signal.quantity}</p>
              </div>
            </div>

            {/* Confluence Score */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-dark-400">AI Confidence</span>
                <span className="text-sm font-medium text-white">{Math.round(signal.confluenceScore * 100)}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${signal.confluenceScore * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Reason Codes */}
            <div className="mb-3">
              <p className="text-xs text-dark-400 mb-2">Signal Reasons</p>
              <div className="flex flex-wrap gap-1">
                {signal.reasonCodes.map((reason, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-dark-700 text-dark-300 rounded text-xs"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="flex-1 trading-button-primary text-sm py-2">
                <Target className="w-4 h-4 mr-2" />
                Execute Signal
              </button>
              <button className="px-3 py-2 bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600 rounded-md transition-colors duration-200">
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="text-center">
          <p className="text-xs text-dark-400">
            {filteredSignals.length} signals • Last updated: {formatTimeAgo(new Date())}
          </p>
          <p className="text-xs text-dark-400 mt-1">
            AI signals are for educational purposes only
          </p>
        </div>
      </div>
    </div>
  )
}
