# 🎨 Frontend Deployment Guide

## Current Status
- ✅ **Backend API**: Deployed successfully at https://tradeloop-api.onrender.com
- ❌ **Frontend**: Needs separate deployment

## Quick Frontend Deployment

### Option 1: Manual Render Deployment (Recommended)

1. **Go to Render Dashboard** → New Static Site
2. **Connect GitHub** → Select `HaloHealthAfrica/signalforge`
3. **Configure Build**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://tradeloop-api.onrender.com
   VITE_APP_TITLE=TradeLoop
   VITE_ENVIRONMENT=production
   ```

5. **Deploy** 🚀

### Option 2: Use Frontend-Only Blueprint

1. **In Render**, create New Blueprint
2. **Use file**: `render-frontend.yaml` (instead of main render.yaml)
3. **Deploy**

## Test After Deployment

Your frontend will be available at:
```
https://tradeloop-frontend.onrender.com
```

## Expected Features

- 📊 **Dashboard**: Real-time trading metrics
- 📈 **Market Data**: Live stock prices  
- 🎯 **Signals**: Trading signals with confluence scores
- 💰 **Portfolio**: Position tracking and P&L
- ⚙️ **Settings**: API configuration
- 📉 **Backtesting**: Historical strategy testing

## Troubleshooting

### Build Fails
- Check that Node.js version is 18+
- Verify all dependencies in `frontend/package.json`

### Blank Page
- Check browser console for API connection errors
- Verify `VITE_API_URL` environment variable

### API Connection Issues  
- Ensure backend API is running: https://tradeloop-api.onrender.com/health
- Check CORS settings in backend

## Local Testing
```bash
cd frontend
npm run build
npm run preview
```

Your trading dashboard will be live once deployed! 🎯