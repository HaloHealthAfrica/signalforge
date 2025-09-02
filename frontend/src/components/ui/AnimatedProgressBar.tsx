import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animated?: boolean
  gradient?: boolean
  glowEffect?: boolean
}

export const AnimatedProgressBar = ({
  value,
  max = 100,
  label,
  color = '#3b82f6',
  size = 'md',
  showPercentage = true,
  animated = true,
  gradient = true,
  glowEffect = false
}: AnimatedProgressBarProps) => {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(value)
    }
  }, [value, animated])

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 'h-2'
      case 'lg':
        return 'h-4'
      default:
        return 'h-3'
    }
  }

  const getGradientColors = () => {
    if (percentage < 30) return ['#ef4444', '#dc2626'] // red
    if (percentage < 70) return ['#f59e0b', '#d97706'] // yellow
    return ['#22c55e', '#16a34a'] // green
  }

  const gradientColors = getGradientColors()

  return (
    <div className="w-full">
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-dark-300">{label}</span>
          )}
          {showPercentage && (
            <motion.span
              className="text-xs font-semibold text-primary-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div 
        className={`relative w-full ${getHeight()} bg-dark-700/50 rounded-full overflow-hidden backdrop-blur-sm`}
      >
        {/* Background glow */}
        {glowEffect && (
          <div 
            className="absolute inset-0 rounded-full blur-sm opacity-50"
            style={{ backgroundColor: color }}
          />
        )}

        {/* Progress bar */}
        <motion.div
          className={`absolute top-0 left-0 ${getHeight()} rounded-full`}
          style={{
            background: gradient 
              ? `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`
              : color
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeOut",
            delay: 0.2
          }}
        >
          {/* Shimmer effect */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                delay: 1
              }}
            />
          )}

          {/* Pulse effect for active progress */}
          {glowEffect && percentage > 0 && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-2 rounded-r-full"
              style={{ backgroundColor: color }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Segments for visual appeal */}
        <div className="absolute inset-0 flex">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-dark-600/30 last:border-r-0"
              style={{ marginTop: '1px', marginBottom: '1px' }}
            />
          ))}
        </div>
      </div>

      {/* Value display */}
      {animated && (
        <motion.div
          className="mt-1 text-xs text-dark-400"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {displayValue.toLocaleString()} / {max.toLocaleString()}
          </motion.span>
        </motion.div>
      )}
    </div>
  )
}