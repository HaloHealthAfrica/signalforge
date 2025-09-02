import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Settings
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { useTradingStore } from '../stores/tradingStore';

interface ChartPanelProps {
  symbol: string | null
}

export const ChartPanel = ({ symbol }: ChartPanelProps) => {
  const { chartTimeframe, setChartTimeframe } = useTradingStore()
  const [chartData, setChartData] = useState<any[]>([])

  // Mock chart data
  useEffect(() => {
    if (symbol) {
      // Generate mock data for the selected symbol
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        time: i,
        price: 150 + Math.sin(i * 0.1) * 20 + Math.random() * 10,
        volume: Math.floor(Math.random() * 1000000) + 500000,
        high: 150 + Math.sin(i * 0.1) * 20 + Math.random() * 15,
        low: 150 + Math.sin(i * 0.1) * 20 - Math.random() * 15,
      }))
      setChartData(mockData)
    }
  }, [symbol])

  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' },
  ]

  if (!symbol) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-800">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <p className="text-dark-400 text-lg">Select a symbol to view chart</p>
        </div>
      </div>
    )
  }

  const currentPrice = chartData[chartData.length - 1]?.price || 0
  const previousPrice = chartData[chartData.length - 2]?.price || currentPrice
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = ((priceChange / previousPrice) * 100) || 0

  return (
    <div className="h-full flex flex-col bg-dark-800">
      {/* Chart Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{symbol}</h2>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-3xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              <div className="flex items-center space-x-2">
                {priceChange >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-danger-500" />
                )}
                <span className={`text-lg font-semibold ${
                  priceChange >= 0 ? 'text-success-500' : 'text-danger-500'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors duration-200">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setChartTimeframe(tf.value as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                chartTimeframe === tf.value
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-4">
        <div className="h-full chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-dark-400">Open</p>
            <p className="text-white font-medium">${chartData[0]?.price.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-dark-400">High</p>
            <p className="text-white font-medium">${Math.max(...chartData.map(d => d.high)).toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-dark-400">Low</p>
            <p className="text-white font-medium">${Math.min(...chartData.map(d => d.low)).toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-dark-400">Volume</p>
            <p className="text-white font-medium">{(chartData[chartData.length - 1]?.volume / 1000000).toFixed(1)}M</p>
          </div>
        </div>
      </div>
    </div>
  )
}
