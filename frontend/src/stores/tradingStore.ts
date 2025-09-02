import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface MarketData {
  symbol: string
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
  change?: number
  changePercent?: number
}

export interface TradingSignal {
  id: string
  symbol: string
  timestamp: Date
  signalType: 'BUY' | 'SELL' | 'HOLD'
  direction: 'LONG' | 'SHORT'
  price: number
  quantity: number
  stopLoss?: number
  takeProfit?: number
  confluenceScore: number
  reasonCodes: string[]
  isEnriched: boolean
}

export interface Position {
  symbol: string
  quantity: number
  averagePrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  timestamp: Date
}

export interface AccountBalance {
  cash: number
  buyingPower: number
  equity: number
  totalMarketValue: number
  timestamp: Date
}

interface TradingState {
  // Connection status
  isConnected: boolean
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  
  // Market data
  marketData: Record<string, MarketData>
  watchlist: string[]
  
  // Trading signals
  signals: TradingSignal[]
  activeSignals: TradingSignal[]
  
  // Portfolio
  positions: Position[]
  accountBalance: AccountBalance | null
  
  // UI state
  selectedSymbol: string | null
  chartTimeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  isDarkMode: boolean
  themePreference: 'light' | 'dark' | 'system'
  
  // Actions
  setConnectionStatus: (status: TradingState['connectionStatus']) => void
  updateMarketData: (data: MarketData) => void
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  addSignal: (signal: TradingSignal) => void
  updatePosition: (position: Position) => void
  setAccountBalance: (balance: AccountBalance) => void
  setSelectedSymbol: (symbol: string | null) => void
  setChartTimeframe: (timeframe: TradingState['chartTimeframe']) => void
  toggleDarkMode: () => void
  setThemePreference: (preference: TradingState['themePreference']) => void
  clearSignals: () => void
}

export const useTradingStore = create<TradingState>()(
  devtools(
    (set) => ({
      // Initial state
      isConnected: false,
      connectionStatus: 'disconnected',
      
      marketData: {},
      watchlist: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'],
      
      signals: [],
      activeSignals: [],
      
      positions: [],
      accountBalance: null,
      
      selectedSymbol: 'AAPL',
      chartTimeframe: '1d',
      isDarkMode: true,
      themePreference: 'system',
      
      // Actions
      setConnectionStatus: (status) => set({ 
        connectionStatus: status, 
        isConnected: status === 'connected' 
      }),
      
      updateMarketData: (data) => set((state) => ({
        marketData: {
          ...state.marketData,
          [data.symbol]: data
        }
      })),
      
      addToWatchlist: (symbol) => set((state) => ({
        watchlist: [...new Set([...state.watchlist, symbol])]
      })),
      
      removeFromWatchlist: (symbol) => set((state) => ({
        watchlist: state.watchlist.filter(s => s !== symbol)
      })),
      
      addSignal: (signal) => set((state) => ({
        signals: [signal, ...state.signals],
        activeSignals: signal.signalType !== 'HOLD' 
          ? [signal, ...state.activeSignals]
          : state.activeSignals
      })),
      
      updatePosition: (position) => set((state) => ({
        positions: state.positions.map(p => 
          p.symbol === position.symbol ? position : p
        )
      })),
      
      setAccountBalance: (balance) => set({ accountBalance: balance }),
      
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      
      setChartTimeframe: (timeframe) => set({ chartTimeframe: timeframe }),
      
      toggleDarkMode: () => set((state) => ({ 
        isDarkMode: !state.isDarkMode,
        themePreference: !state.isDarkMode ? 'dark' : 'light'
      })),

      setThemePreference: (preference) => set((state) => {
        let isDarkMode = state.isDarkMode
        if (preference === 'system') {
          isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        } else {
          isDarkMode = preference === 'dark'
        }
        return { themePreference: preference, isDarkMode }
      }),
      
      clearSignals: () => set({ signals: [], activeSignals: [] }),
    }),
    {
      name: 'trading-store',
    }
  )
)
