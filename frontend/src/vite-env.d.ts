/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_ENABLE_WEBSOCKET: string
  readonly VITE_ENABLE_BACKTEST: string
  readonly VITE_ENABLE_PORTFOLIO_SYNC: string
  readonly VITE_MARKET_DATA_INTERVAL: string
  readonly VITE_SIGNALS_INTERVAL: string
  readonly VITE_PORTFOLIO_INTERVAL: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ENABLE_ERROR_TRACKING: string
  readonly VITE_GA_TRACKING_ID: string
  readonly VITE_ENABLE_ANALYTICS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}