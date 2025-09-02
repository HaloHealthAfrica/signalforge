import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  format?: 'currency' | 'percentage' | 'number'
  loading?: boolean
}

export const MetricsCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = '#3b82f6',
  trend = 'neutral',
  format = 'number',
  loading = false
}: MetricsCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success-400'
      case 'down':
        return 'text-danger-400'
      default:
        return 'text-dark-300'
    }
  }

  const getTrendBgColor = () => {
    switch (trend) {
      case 'up':
        return 'bg-success-500/20'
      case 'down':
        return 'bg-danger-500/20'
      default:
        return 'bg-primary-500/20'
    }
  }

  const formatValue = (val: string | number) => {
    if (loading) return '---'
    
    switch (format) {
      case 'currency':
        return typeof val === 'number' ? `$${val.toLocaleString()}` : val
      case 'percentage':
        return typeof val === 'number' ? `${val}%` : val
      default:
        return typeof val === 'number' ? val.toLocaleString() : val
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="trading-card p-6 cursor-pointer group relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary-500/30 transition-all duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 rounded-xl"
              style={{ backgroundColor: iconColor + '20' }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </motion.div>
            <h3 className="text-sm font-medium text-dark-300">{title}</h3>
          </div>

          {change !== undefined && (
            <motion.div
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getTrendBgColor()} ${getTrendColor()}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {Math.abs(change)}%
            </motion.div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {loading ? (
            <div className="shimmer w-24 h-8 rounded" />
          ) : (
            <motion.div
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {formatValue(value)}
            </motion.div>
          )}
        </div>

        {/* Change Label */}
        {changeLabel && (
          <motion.p
            className="text-xs text-dark-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {changeLabel}
          </motion.p>
        )}

        {/* Sparkline effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1">
          <motion.div
            className={`h-full rounded-b-2xl ${
              trend === 'up' ? 'bg-success-500' : 
              trend === 'down' ? 'bg-danger-500' : 'bg-primary-500'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl shadow-glow-primary" />
      </div>
    </motion.div>
  )
}