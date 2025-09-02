import { motion } from 'framer-motion'

interface PulseIndicatorProps {
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  intensity?: 'low' | 'medium' | 'high'
  speed?: 'slow' | 'normal' | 'fast'
  shape?: 'circle' | 'square'
  label?: string
  className?: string
}

export const PulseIndicator = ({
  color = '#3b82f6',
  size = 'md',
  intensity = 'medium',
  speed = 'normal',
  shape = 'circle',
  label,
  className = ''
}: PulseIndicatorProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2'
      case 'lg':
        return 'w-4 h-4'
      case 'xl':
        return 'w-6 h-6'
      default:
        return 'w-3 h-3'
    }
  }

  const getShapeClass = () => {
    return shape === 'circle' ? 'rounded-full' : 'rounded-sm'
  }

  const getAnimationDuration = () => {
    switch (speed) {
      case 'slow':
        return 2
      case 'fast':
        return 0.8
      default:
        return 1.4
    }
  }

  const getIntensitySettings = () => {
    switch (intensity) {
      case 'low':
        return {
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
          rings: 1
        }
      case 'high':
        return {
          scale: [1, 1.8, 1],
          opacity: [0.8, 0.2, 0.8],
          rings: 3
        }
      default:
        return {
          scale: [1, 1.4, 1],
          opacity: [0.6, 0.3, 0.6],
          rings: 2
        }
    }
  }

  const settings = getIntensitySettings()
  const duration = getAnimationDuration()

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Main indicator */}
      <div className="relative">
        <motion.div
          className={`${getSizeClasses()} ${getShapeClass()}`}
          style={{ backgroundColor: color }}
          animate={{
            scale: settings.scale,
            opacity: settings.opacity
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Pulse rings */}
        {[...Array(settings.rings)].map((_, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 ${getSizeClasses()} ${getShapeClass()} border-2`}
            style={{ 
              borderColor: color,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 2.5, 3],
              opacity: [0.8, 0.3, 0]
            }}
            transition={{
              duration: duration * 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: index * (duration * 0.3)
            }}
          />
        ))}

        {/* Glow effect for high intensity */}
        {intensity === 'high' && (
          <motion.div
            className={`absolute inset-0 ${getSizeClasses()} ${getShapeClass()} blur-sm`}
            style={{ 
              backgroundColor: color,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: duration * 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Label */}
      {label && (
        <motion.span
          className="ml-2 text-xs font-medium text-dark-300"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}

// Preset components for common use cases
export const LiveIndicator = ({ className }: { className?: string }) => (
  <PulseIndicator
    color="#22c55e"
    size="sm"
    intensity="medium"
    speed="normal"
    label="LIVE"
    className={className}
  />
)

export const ProcessingIndicator = ({ className }: { className?: string }) => (
  <PulseIndicator
    color="#f59e0b"
    size="md"
    intensity="high"
    speed="fast"
    label="Processing..."
    className={className}
  />
)

export const ErrorIndicator = ({ className }: { className?: string }) => (
  <PulseIndicator
    color="#ef4444"
    size="md"
    intensity="low"
    speed="slow"
    label="Error"
    className={className}
  />
)