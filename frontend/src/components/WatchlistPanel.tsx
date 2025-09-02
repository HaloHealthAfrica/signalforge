import { useState } from 'react'
import { Plus, Minus, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { useTradingStore } from '../stores/tradingStore'

interface MarketDataItem {
  price: number
  change: number
  changePercent: number
  volume: string
}

interface WatchlistPanelProps {
  marketData: Record<string, MarketDataItem>
  onSymbolSelect: (symbol: string) => void
}

export const WatchlistPanel = ({ marketData, onSymbolSelect }: WatchlistPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { watchlist, addToWatchlist, removeFromWatchlist, selectedSymbol } = useTradingStore()

  const filteredWatchlist = watchlist.filter(symbol => 
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddSymbol = () => {
    const symbol = prompt('Enter symbol to add:')
    if (symbol && !watchlist.includes(symbol.toUpperCase())) {
      addToWatchlist(symbol.toUpperCase())
    }
  }

  const handleRemoveSymbol = (symbol: string) => {
    if (confirm(`Remove ${symbol} from watchlist?`)) {
      removeFromWatchlist(symbol)
    }
  }

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const formatChange = (change: number) => {
    return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success-500'
    if (change < 0) return 'text-danger-500'
    return 'text-dark-300'
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Watchlist</h2>
          <button
            onClick={handleAddSymbol}
            className="p-1 text-dark-400 hover:text-primary-500 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search symbols..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Watchlist Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredWatchlist.map((symbol) => {
          const data = marketData[symbol]
          if (!data) return null

          const isSelected = selectedSymbol === symbol
          
          return (
            <div
              key={symbol}
              className={`p-4 border-b border-dark-700 cursor-pointer transition-colors duration-200 ${
                isSelected ? 'bg-primary-600/20 border-primary-500' : 'hover:bg-dark-800'
              }`}
              onClick={() => onSymbolSelect(symbol)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{symbol}</span>
                  <Star className="w-3 h-3 text-warning-500 fill-current" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveSymbol(symbol)
                  }}
                  className="p-1 text-dark-400 hover:text-danger-500 transition-colors duration-200"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    ${formatPrice(data.price)}
                  </span>
                  <div className="flex items-center space-x-1">
                    {data.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-success-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-danger-500" />
                    )}
                    <span className={`text-sm font-medium ${getChangeColor(data.change)}`}>
                      {formatChange(data.change)} ({data.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-dark-400">
                  Vol: {data.volume}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="text-xs text-dark-400 text-center">
          <p>{filteredWatchlist.length} symbols</p>
          <p className="mt-1">Click to view chart</p>
        </div>
      </div>
    </div>
  )
}
