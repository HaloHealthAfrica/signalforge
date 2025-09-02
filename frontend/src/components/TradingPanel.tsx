import { useState } from 'react';
import { 
  TrendingUp, 
  Target,
  Shield
} from 'lucide-react';

interface TradingPanelProps {
  symbol: string | null
}

export const TradingPanel = ({ symbol }: TradingPanelProps) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const handlePlaceOrder = () => {
    if (!symbol || !quantity) return
    
    const order = {
      symbol,
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      price: orderType === 'limit' ? parseFloat(price) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    }
    
    console.log('Placing order:', order)
    // TODO: Implement order placement
  }

  const calculateRisk = () => {
    if (!quantity || !stopLoss || !symbol) return null
    
    const qty = parseFloat(quantity)
    const stop = parseFloat(stopLoss)
    const currentPrice = 150 // Mock price, should come from store
    
    const riskPerShare = Math.abs(currentPrice - stop)
    const totalRisk = riskPerShare * qty
    
    return {
      riskPerShare: riskPerShare.toFixed(2),
      totalRisk: totalRisk.toFixed(2),
      riskPercent: ((totalRisk / (currentPrice * qty)) * 100).toFixed(2)
    }
  }

  const riskInfo = calculateRisk()

  if (!symbol) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <Target className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <p className="text-dark-400 text-lg">Select a symbol to trade</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white">Trade {symbol}</h2>
        <p className="text-sm text-dark-400">Paper Trading Account</p>
      </div>

      {/* Order Entry */}
      <div className="p-4 space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Order Type
          </label>
          <div className="flex space-x-1">
            <button
              onClick={() => setOrderType('market')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                orderType === 'market'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:text-white'
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType('limit')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                orderType === 'limit'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:text-white'
              }`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Side Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Side
          </label>
          <div className="flex space-x-1">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-bold transition-colors duration-200 ${
                side === 'buy'
                  ? 'bg-success-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>BUY</span>
              </div>
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-bold transition-colors duration-200 ${
                side === 'sell'
                  ? 'bg-danger-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>SELL</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="trading-input w-full"
          />
        </div>

        {/* Price (for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Limit Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="trading-input w-full"
            />
          </div>
        )}

        {/* Stop Loss */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Stop Loss
          </label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="trading-input w-full"
          />
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Take Profit
          </label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="trading-input w-full"
          />
        </div>

        {/* Risk Analysis */}
        {riskInfo && (
          <div className="p-3 bg-dark-800 rounded-lg border border-dark-600">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-warning-500" />
              Risk Analysis
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-dark-400">Risk/Share</p>
                <p className="text-white font-medium">${riskInfo.riskPerShare}</p>
              </div>
              <div>
                <p className="text-dark-400">Total Risk</p>
                <p className="text-white font-medium">${riskInfo.totalRisk}</p>
              </div>
              <div>
                <p className="text-dark-400">Risk %</p>
                <p className="text-white font-medium">{riskInfo.riskPercent}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!quantity}
          className={`w-full py-3 px-4 rounded-md font-bold text-white transition-colors duration-200 ${
            side === 'buy'
              ? 'bg-success-600 hover:bg-success-700 disabled:bg-dark-600'
              : 'bg-danger-600 hover:bg-danger-700 disabled:bg-dark-600'
          }`}
        >
          {side === 'buy' ? 'BUY' : 'SELL'} {symbol}
        </button>
      </div>

      {/* Position Info */}
      <div className="p-4 border-t border-dark-700">
        <h3 className="text-sm font-medium text-white mb-3">Current Position</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-400">Shares</span>
            <span className="text-white">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Avg Price</span>
            <span className="text-white">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Market Value</span>
            <span className="text-white">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Unrealized P&L</span>
            <span className="text-white">$0.00</span>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-start space-x-2 text-xs text-dark-400">
          <Shield className="w-4 h-4 mt-0.5 text-warning-500 flex-shrink-0" />
          <p>
            Trading involves substantial risk of loss. Only trade with capital you can afford to lose.
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  )
}
