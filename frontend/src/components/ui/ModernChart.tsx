import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  BarChart,
  Bar
} from 'recharts';

interface ChartDataPoint {
  timestamp: string
  price: number
  volume: number
  high: number
  low: number
  change?: number
}

interface ModernChartProps {
  data: ChartDataPoint[]
  type?: 'line' | 'area' | 'candlestick' | 'volume'
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  color?: string
  gradientColors?: [string, string]
}

export const ModernChart = ({
  data,
  type = 'line',
  height = 400,
  showGrid = true,
  showTooltip = true,
  color = '#3b82f6',
  gradientColors = ['#3b82f6', '#1d4ed8']
}: ModernChartProps) => {
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isPositive = data.change >= 0
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card p-4 border border-glass-white-10 rounded-xl shadow-depth-3 backdrop-blur-xl"
          style={{ background: 'rgba(30, 41, 59, 0.9)' }}
        >
          <p className="text-sm font-semibold text-white mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center space-x-4">
              <span className="text-xs text-dark-300">Price:</span>
              <span className={`text-sm font-bold ${isPositive ? 'text-success-400' : 'text-danger-400'}`}>
                ${data.price?.toFixed(2)}
              </span>
            </div>
            {data.volume && (
              <div className="flex justify-between items-center space-x-4">
                <span className="text-xs text-dark-300">Volume:</span>
                <span className="text-sm font-medium text-primary-300">
                  {(data.volume / 1000000).toFixed(1)}M
                </span>
              </div>
            )}
            {data.change !== undefined && (
              <div className="flex justify-between items-center space-x-4">
                <span className="text-xs text-dark-300">Change:</span>
                <span className={`text-sm font-bold ${isPositive ? 'text-success-400' : 'text-danger-400'}`}>
                  {isPositive ? '+' : ''}{data.change.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={gradientColors[1]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)"
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={3}
              fill="url(#colorGradient)"
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: color, 
                strokeWidth: 2, 
                fill: '#fff',
                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))'
              }}
            />
          </AreaChart>
        )

      case 'volume':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)"
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Bar
              dataKey="volume"
              fill={color}
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        )

      default: // line chart
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)"
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Line
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: color, 
                strokeWidth: 2, 
                fill: '#fff',
                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))'
              }}
            />
          </LineChart>
        )
    }
  }

  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      className="chart-container relative"
    >
      {/* Chart glow effect */}
      <div className="absolute inset-0 bg-primary-500/5 rounded-2xl blur-xl" />
      
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Animated grid overlay for extra depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary-500/5 rounded-2xl" />
      </div>
    </motion.div>
  )
}