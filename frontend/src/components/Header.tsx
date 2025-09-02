import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  User, 
  Search,
  Sun,
  Moon,
  Command,
  Zap,
  Monitor,
  ChevronDown
} from 'lucide-react';
import { useTradingStore } from '../stores/tradingStore';

export const Header = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showThemeMenu, setShowThemeMenu] = React.useState(false)
  const { isDarkMode, themePreference, setThemePreference, selectedSymbol } = useTradingStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
    }
  }

  const headerVariants = {
    hidden: { y: -60, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.header 
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="h-18 glass-card border-b border-glass-white-10 px-6 flex items-center justify-between backdrop-blur-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-success-500/5" />

      {/* Left Section - Search */}
      <div className="flex items-center space-x-6 flex-1 relative z-10">
        <motion.form 
          onSubmit={handleSearch} 
          className="relative group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400 group-focus-within:text-primary-400 transition-colors duration-200" />
            <Command className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-500 group-focus-within:text-primary-500 transition-colors duration-200" />
            <motion.input
              type="text"
              placeholder="Search symbols, signals, strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="trading-input w-96 pl-11 pr-11 py-3.5 bg-glass-white-10 border border-glass-white-10 text-white placeholder-dark-400 focus:border-primary-500/50"
              whileFocus={{ scale: 1.02 }}
            />
          </div>
        </motion.form>
        
        <AnimatePresence>
          {selectedSymbol && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500/20 text-primary-300 rounded-xl border border-primary-500/30 backdrop-blur-sm"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">{selectedSymbol}</span>
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-2 relative z-10">
        {/* Theme Toggle */}
        <motion.div className="relative">
          <motion.button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-3 text-dark-300 hover:text-white glass rounded-xl hover:bg-glass-white-10 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isDarkMode ? 0 : 180 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {themePreference === 'system' ? (
                <Monitor className="w-5 h-5" />
              ) : isDarkMode ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 glass-card p-2 border border-glass-white-10 rounded-xl shadow-depth-4 z-50"
              >
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setThemePreference('light')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      themePreference === 'light' 
                        ? 'bg-primary-500/20 text-primary-300' 
                        : 'text-dark-300 hover:text-white hover:bg-glass-white-10'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemePreference('dark')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      themePreference === 'dark' 
                        ? 'bg-primary-500/20 text-primary-300' 
                        : 'text-dark-300 hover:text-white hover:bg-glass-white-10'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemePreference('system')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      themePreference === 'system' 
                        ? 'bg-primary-500/20 text-primary-300' 
                        : 'text-dark-300 hover:text-white hover:bg-glass-white-10'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Notifications */}
        <motion.div className="relative">
          <motion.button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 text-dark-300 hover:text-white glass rounded-xl hover:bg-glass-white-10 transition-all duration-300 relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
            <motion.span 
              className="absolute top-1 right-1 w-3 h-3 bg-danger-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-xs font-bold text-white">3</span>
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 glass-card p-4 border border-glass-white-10 rounded-2xl shadow-depth-4 z-50"
              >
                <h3 className="text-sm font-semibold text-white mb-3">Recent Notifications</h3>
                <div className="space-y-2">
                  <div className="notification-success">
                    <p className="text-xs font-medium">AAPL signal triggered</p>
                    <p className="text-xs text-dark-400">2 minutes ago</p>
                  </div>
                  <div className="notification-warning">
                    <p className="text-xs font-medium">Portfolio rebalancing suggested</p>
                    <p className="text-xs text-dark-400">1 hour ago</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Settings */}
        <motion.button 
          className="p-3 text-dark-300 hover:text-white glass rounded-xl hover:bg-glass-white-10 transition-all duration-300"
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        {/* User Profile */}
        <motion.div 
          className="flex items-center space-x-3 glass rounded-xl px-4 py-2 hover:bg-glass-white-10 transition-all duration-300 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
            whileHover={{ scale: 1.1 }}
          >
            <User className="w-5 h-5 text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm" />
          </motion.div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white">Alex Trader</p>
            <p className="text-xs text-primary-300">Live Account</p>
          </div>
          <motion.div
            animate={{ rotate: showNotifications ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-dark-400 group-hover:text-primary-400 transition-colors" />
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  )
}
