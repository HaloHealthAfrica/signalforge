# TradeLoop Frontend

A comprehensive AI-powered trading platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Trading Dashboard** - Live market data and AI signals
- **Portfolio Management** - Track positions and performance
- **Backtesting Engine** - Test trading strategies with historical data
- **Risk Management** - Position sizing and exposure monitoring
- **Settings & Configuration** - API key management and preferences

## 🔧 Backend Integration

The frontend is now fully integrated with the TradeLoop backend APIs:

### API Endpoints

- **Market Data**: `/api/market/overview` - Real-time market prices
- **Trading Signals**: `/api/signals` - AI-generated trading opportunities
- **Portfolio**: `/api/portfolio/*` - Positions and performance data
- **Backtesting**: `/api/backtest/run` - Strategy testing
- **Risk Management**: `/api/risk/*` - Risk parameters and exposure
- **Settings**: `/api/settings` - Configuration management

### Data Flow

1. **Real-time Updates**: Market data polls every 3 seconds
2. **Signal Monitoring**: Trading signals update every 5 seconds
3. **Portfolio Tracking**: Position data refreshes every 10 seconds
4. **Interactive Forms**: Backtest configuration and settings management

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on port 3000

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The frontend will connect to `http://localhost:3000` by default

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3000
```

## 📱 Usage

### Dashboard
- View real-time market data for major symbols
- Monitor live AI trading signals
- Track portfolio performance metrics

### Signals
- Browse AI-generated trading opportunities
- View confluence scores and risk/reward ratios
- Execute trades directly from the interface

### Portfolio
- Monitor active positions and P&L
- View asset allocation charts
- Track performance over time

### Backtesting
- Configure strategy parameters
- Run historical analysis
- View performance metrics and equity curves

### Risk Management
- Set position sizing rules
- Monitor daily limits
- View portfolio exposure and correlations

### Settings
- Manage API keys for data providers
- Configure trading preferences
- Set risk management parameters

## 🔌 API Integration

The frontend uses a comprehensive API service layer:

- **`/services/api.ts`** - API client and endpoints
- **`/hooks/useApi.ts`** - React hooks for data fetching
- **`/types/api.ts`** - TypeScript interfaces for all data structures

### Custom Hooks

- `useApi<T>()` - Single API call with loading/error states
- `usePolling<T>()` - Real-time data polling
- `useApiMutation<T, R>()` - API mutations (POST/PUT/DELETE)

## 🎨 UI Components

Built with modern design principles:

- **Responsive Design** - Works on all screen sizes
- **Dark Theme** - Professional trading interface
- **Real-time Updates** - Live data with loading states
- **Error Handling** - Graceful error display and recovery
- **Interactive Elements** - Hover effects and smooth transitions

## 🚀 Next Steps

To complete the production system:

1. **Real Charting**: Integrate TradingView or Recharts
2. **WebSocket**: Replace polling with real-time connections
3. **Authentication**: Add user login and security
4. **Real Trading**: Connect to live brokerage APIs
5. **Advanced Analytics**: Add more sophisticated metrics

## 📊 Performance

- **Optimized Rendering** - React.memo and useCallback for performance
- **Efficient Polling** - Configurable intervals for different data types
- **Error Boundaries** - Graceful error handling and recovery
- **Loading States** - Skeleton screens and progress indicators

## 🔒 Security

- **API Key Management** - Secure storage of trading API keys
- **Input Validation** - Form validation and sanitization
- **Error Handling** - No sensitive data in error messages
- **CORS Configuration** - Proper backend CORS setup

## 📝 Contributing

1. Follow TypeScript best practices
2. Use the established API service patterns
3. Add proper error handling and loading states
4. Maintain responsive design principles
5. Test with the backend APIs

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection**: Ensure backend is running on port 3000
2. **CORS Errors**: Check backend CORS configuration
3. **API Errors**: Verify API endpoints and data formats
4. **Type Errors**: Check TypeScript interfaces match backend responses

### Debug Mode

Enable detailed logging in the browser console:
- API requests and responses
- Error details and stack traces
- Data flow and state changes

## 📚 Resources

- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios HTTP Client](https://axios-http.com/)

