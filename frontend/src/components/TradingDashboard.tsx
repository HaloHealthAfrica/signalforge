import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target,
  Zap,
  Monitor,
  Smartphone,
  Activity
} from 'lucide-react';
import { useTradingStore } from '../stores/tradingStore';
import { TradingPanel } from './TradingPanel';
import { SignalsPanel } from './SignalsPanel';
import { ChartPanel } from './ChartPanel';
import { MetricsCard } from './ui/MetricsCard';
import { WatchlistPanel } from './WatchlistPanel';

export const TradingDashboard = () => {
  const { selectedSymbol, setSelectedSymbol } = useTradingStore()
  const [activeTab, setActiveTab] = React.useState<'chart' | 'signals'>('chart')
  const [isMobileLayout, setIsMobileLayout] = React.useState(false)

  const mockMarketData = {
    AAPL: { price: 175.43, change: 2.15, changePercent: 1.24, volume: '45.2M' },
    MSFT: { price: 338.11, change: -1.23, changePercent: -0.36, volume: '28.7M' },
    GOOGL: { price: 142.56, change: 0.89, changePercent: 0.63, volume: '32.1M' },
    TSLA: { price: 242.54, change: 8.76, changePercent: 3.75, volume: '89.3M' },
    NVDA: { price: 456.78, change: 12.34, changePercent: 2.78, volume: '67.2M' },
  }

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
  }

  const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  const tabVariants = {
    inactive: { 
      scale: 0.95, 
      opacity: 0.7,
      y: 2
    },
    active: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  }

  return (
    <div className="h-full p-4 relative space-y-6">
      {/* Top Metrics Row */}
      <motion.div 
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricsCard
          title="Portfolio Value"
          value={125420}
          change={2.34}
          changeLabel="Last 24h"
          icon={DollarSign}
          iconColor="#22c55e"
          trend="up"
          format="currency"
        />
        <MetricsCard
          title="Today's P&L"
          value={1240}
          change={-0.56}
          changeLabel="Since market open"
          icon={TrendingUp}
          iconColor="#3b82f6"
          trend="up"
          format="currency"
        />
        <MetricsCard
          title="Active Signals"
          value={8}
          change={12.5}
          changeLabel="New this hour"
          icon={Zap}
          iconColor="#f59e0b"
          trend="up"
        />
        <MetricsCard
          title="Win Rate"
          value={73.2}
          change={1.8}
          changeLabel="Last 30 days"
          icon={Target}
          iconColor="#8b5cf6"
          trend="up"
          format="percentage"
        />
      </motion.div>

      {/* Layout Toggle */}
      <div className="absolute top-4 right-4 z-20 lg:hidden">
        <div className="flex bg-glass-white-10 backdrop-blur-sm rounded-xl p-1 border border-glass-white-10">
          <button
            onClick={() => setIsMobileLayout(false)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              !isMobileLayout ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileLayout(true)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isMobileLayout ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Trading Interface */}
      <motion.div 
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
        className={`flex-1 grid gap-4 ${
          isMobileLayout || window.innerWidth < 1024 
            ? 'grid-cols-1 grid-rows-3' 
            : 'grid-cols-trading'
        }`}
        style={{ height: 'calc(100vh - 200px)' }}
      >
        {/* Left Panel - Watchlist */}
        <motion.div 
          variants={panelVariants}
          className={`${isMobileLayout ? 'row-span-1' : ''} overflow-hidden`}
        >
          <WatchlistPanel 
            marketData={mockMarketData}
            onSymbolSelect={handleSymbolSelect}
          />
        </motion.div>

        {/* Center Panel - Chart & Signals */}
        <motion.div 
          variants={panelVariants}
          className={`flex flex-col ${isMobileLayout ? 'row-span-2' : ''} overflow-hidden`}
        >
          {/* Tab Navigation with glassmorphism */}
          <div className="flex glass border-b border-glass-white-10 rounded-t-2xl backdrop-blur-xl mb-4">
            <motion.button
              onClick={() => setActiveTab('chart')}
              variants={tabVariants}
              animate={activeTab === 'chart' ? 'active' : 'inactive'}
              className={`px-6 py-4 font-semibold transition-all duration-300 relative group ${
                activeTab === 'chart'
                  ? 'text-primary-400'
                  : 'text-dark-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: activeTab === 'chart' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <BarChart3 className="w-5 h-5" />
                </motion.div>
                <span>Price Chart</span>
              </div>
              {activeTab === 'chart' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('signals')}
              variants={tabVariants}
              animate={activeTab === 'signals' ? 'active' : 'inactive'}
              className={`px-6 py-4 font-semibold transition-all duration-300 relative group ${
                activeTab === 'signals'
                  ? 'text-primary-400'
                  : 'text-dark-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    rotate: activeTab === 'signals' ? 360 : 0,
                    scale: activeTab === 'signals' ? [1, 1.2, 1] : 1
                  }}
                  transition={{ 
                    duration: activeTab === 'signals' ? 0.5 : 0.3,
                    repeat: activeTab === 'signals' ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  <Activity className="w-5 h-5" />
                </motion.div>
                <span>AI Signals</span>
                <motion.div
                  className="w-2 h-2 bg-success-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>
              {activeTab === 'signals' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          </div>

          {/* Tab Content with smooth transitions */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === 'chart' ? (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ChartPanel symbol={selectedSymbol} />
                </motion.div>
              ) : (
                <motion.div
                  key="signals"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <SignalsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Panel - Trading Controls */}
        <motion.div 
          variants={panelVariants}
          className={`${isMobileLayout ? 'row-span-1' : ''} overflow-hidden`}
        >
          <TradingPanel symbol={selectedSymbol} />
        </motion.div>
      </motion.div>
    </div>
  )
}
