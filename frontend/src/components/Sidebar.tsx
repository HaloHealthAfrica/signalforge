import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Settings, 
  Zap,
  Activity,
  Target,
  BookOpen,
  Sparkles
} from 'lucide-react'
import { useTradingStore } from '../stores/tradingStore'

export const Sidebar = () => {
  const { connectionStatus } = useTradingStore()

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard', badge: null },
    { path: '/backtest', icon: BookOpen, label: 'Backtest', badge: null },
    { path: '/portfolio', icon: PieChart, label: 'Portfolio', badge: null },
    { path: '/signals', icon: Zap, label: 'Signals', badge: 'AI' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics', badge: null },
    { path: '/settings', icon: Settings, label: 'Settings', badge: null },
  ]

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-success-500'
      case 'connecting': return 'bg-warning-500 animate-pulse'
      case 'error': return 'bg-danger-500 animate-pulse'
      default: return 'bg-dark-400'
    }
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Live Market Data'
      case 'connecting': return 'Connecting...'
      case 'error': return 'Connection Error'
      default: return 'Disconnected'
    }
  }

  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div 
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-72 glass-card border-r border-glass-white-10 flex flex-col backdrop-blur-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <motion.div 
          variants={itemVariants}
          className="p-6 border-b border-glass-white-10"
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">TradeLoop</h1>
              <p className="text-xs text-primary-300 font-medium">AI Trading Platform</p>
            </div>
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div 
          variants={itemVariants}
          className="p-4 border-b border-glass-white-10"
        >
          <div className="glass rounded-xl p-3 hover:bg-glass-white-10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-200 font-medium">Market Status</span>
              <div className="flex items-center space-x-2">
                <motion.div 
                  className={`w-2.5 h-2.5 rounded-full ${getConnectionColor()}`}
                  animate={connectionStatus === 'connecting' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: connectionStatus === 'connecting' ? Infinity : 0, duration: 1 }}
                />
                <span className="text-xs text-dark-300 font-medium">{getConnectionText()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <AnimatePresence>
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  }
                >
                  {({ isActive }) => (
                    <motion.div 
                      className="flex items-center space-x-3 w-full"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        animate={{ rotate: isActive ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <motion.span 
                          className="px-2.5 py-1 text-xs bg-primary-500/20 text-primary-300 rounded-full border border-primary-500/30 font-bold"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="p-4 border-t border-glass-white-10 space-y-3"
        >
          <motion.button 
            className="w-full trading-button-primary flex items-center justify-center space-x-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Trade</span>
          </motion.button>
          <motion.button 
            className="w-full trading-button-ghost flex items-center justify-center space-x-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Activity className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            <span>Market Scan</span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="p-4 border-t border-glass-white-10"
        >
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-dark-300">
              <p className="font-semibold text-primary-300">TradeLoop v1.0.0</p>
              <p className="mt-1 text-dark-400">Powered by AI</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
