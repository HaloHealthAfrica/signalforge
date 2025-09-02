import axios from 'axios';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://api.tradeloop.app' 
    : 'http://localhost:3000'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (development only)
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    // In production, only log critical errors
    if (import.meta.env.PROD && error.response?.status >= 500) {
      console.error('Server Error:', errorMessage);
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Market Data API
export const marketAPI = {
  getOverview: () => api.get('/api/market/overview'),
  getHours: () => api.get('/api/market/hours'),
};

// Trading Signals API
export const signalsAPI = {
  getAll: () => api.get('/api/signals'),
  getById: (id: string) => api.get(`/api/signals/${id}`),
  create: (signal: any) => api.post('/api/signals', signal),
  update: (id: string, signal: any) => api.put(`/api/signals/${id}`, signal),
  delete: (id: string) => api.delete(`/api/signals/${id}`),
};

// Portfolio API
export const portfolioAPI = {
  getPositions: () => api.get('/api/portfolio/positions'),
  getPerformance: () => api.get('/api/portfolio/performance'),
  getBalance: () => api.get('/api/portfolio/balance'),
  getHistory: (startDate: string, endDate: string) => 
    api.get(`/api/portfolio/history?startDate=${startDate}&endDate=${endDate}`),
};

// Backtest API
export const backtestAPI = {
  runBacktest: (config: {
    symbols: string[];
    fromDate: string;
    toDate: string;
    initialBalance: number;
    riskParams: any;
  }) => api.post('/api/backtest/run', config),
  
  getResults: (id: string) => api.get(`/api/backtest/results/${id}`),
  getHistory: () => api.get('/api/backtest/history'),
  deleteResult: (id: string) => api.delete(`/api/backtest/results/${id}`),
};

// Risk Management API
export const riskAPI = {
  getParameters: () => api.get('/api/risk/parameters'),
  updateParameters: (params: any) => api.put('/api/risk/parameters', params),
  getExposure: () => api.get('/api/risk/exposure'),
  getHeatMap: () => api.get('/api/risk/heatmap'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/api/settings'),
  update: (settings: any) => api.post('/api/settings', settings),
  testConnection: (provider: string) => api.post(`/api/settings/test/${provider}`),
};

// Health Check API
export const healthAPI = {
  check: () => api.get('/health'),
  status: () => api.get('/api/status'),
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const calculateTimeRemaining = (endTime: string): string => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = end - now;
  
  if (diff <= 0) return 'Closed';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

export default api;

