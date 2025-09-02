# 🚀 Deploy to Netlify - Complete Guide

## Method 1: Auto-Deploy from GitHub (Recommended)

### Step 1: Connect GitHub to Netlify
1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up/Login** with GitHub account
3. **Click "New site from Git"**
4. **Choose GitHub** as provider
5. **Select repository**: `HaloHealthAfrica/signalforge`

### Step 2: Configure Build Settings
Netlify should auto-detect settings from `netlify.toml`, but verify:

```
Build command: cd frontend && npm ci && npm run build
Publish directory: frontend/dist
```

### Step 3: Deploy
1. **Click "Deploy site"**
2. **Wait 3-5 minutes** for build
3. **Get your URL**: `https://random-name.netlify.app`

## Method 2: Manual Drag & Drop (Fastest)

### Option A: Use Pre-built Dist Folder
1. **Go to [netlify.com](https://netlify.com)**
2. **Drag & drop** the `frontend/dist` folder from your computer
3. **Live in 30 seconds!**

### Option B: Quick Manual Build & Deploy
```bash
cd frontend
npm ci
VITE_API_URL=https://tradeloop-api.onrender.com npm run build
```
Then drag the `dist` folder to Netlify.

## Method 3: Netlify CLI (Advanced)

```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

## Environment Variables (If Method 1)

If auto-deployment doesn't work, manually add these in **Site settings → Environment variables**:

```
VITE_API_URL=https://tradeloop-api.onrender.com
VITE_APP_TITLE=TradeLoop
VITE_ENVIRONMENT=production
NODE_VERSION=18
```

## Expected Result

✅ **Your TradeLoop app will be live at**: `https://your-site.netlify.app`

Features that should work:
- ✅ **Beautiful trading dashboard**
- ✅ **Live market data** from your Render API
- ✅ **Trading signals** with AI confluence scoring
- ✅ **Portfolio tracking** and P&L
- ✅ **Backtesting interface**
- ✅ **Settings panel** for API keys

## Troubleshooting

### If Build Fails:
- Check build logs in Netlify dashboard
- Verify `netlify.toml` is in root directory
- Ensure environment variables are set

### If App Shows Errors:
- Check browser console (F12)
- Verify API connection: https://tradeloop-api.onrender.com/health
- Check network tab for failed requests

### If "Page Not Found":
- Ensure `_redirects` file exists in build output
- Check that redirects are configured in `netlify.toml`

## Benefits of Netlify:
- ✅ **Instant deploys** (30 seconds for manual, 3-5 min for Git)
- ✅ **Free tier** with generous limits  
- ✅ **Auto-SSL** certificates
- ✅ **Global CDN** for fast loading
- ✅ **Custom domains** supported
- ✅ **Branch previews** for testing

**Recommended: Try Method 2 (drag & drop) first for instant results!**