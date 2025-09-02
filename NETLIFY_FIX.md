# 🔧 Netlify "Page Not Found" Fix

## Immediate Fix Steps

### Step 1: Update Netlify Build Settings
1. **Go to your Netlify site dashboard**
2. **Site settings** → **Build & deploy** → **Build settings**
3. **Update settings**:
   ```
   Base directory: frontend
   Build command: npm ci && npm run build
   Publish directory: frontend/dist
   ```

### Step 2: Set Environment Variables  
1. **Site settings** → **Environment variables**
2. **Add these variables**:
   ```
   VITE_API_URL=https://tradeloop-api.onrender.com
   VITE_APP_TITLE=TradeLoop
   VITE_ENVIRONMENT=production
   NODE_VERSION=18
   ```

### Step 3: Force Redeploy
1. **Deploys** tab → **Trigger deploy** → **Deploy site**
2. **Wait 3-5 minutes** for build to complete

## Alternative: Quick Manual Fix

If the above doesn't work, try this:

### Option A: Import Fresh from GitHub
1. **Delete current Netlify site**
2. **New site from Git** → **GitHub** → `HaloHealthAfrica/signalforge`
3. **Build settings**:
   - Base directory: `frontend`
   - Build command: `npm ci && npm run build`  
   - Publish directory: `frontend/dist`
4. **Environment variables**: Add `VITE_API_URL=https://tradeloop-api.onrender.com`

### Option B: Manual File Upload
If build keeps failing:
1. **Local build**: 
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. **Drag & drop** the `frontend/dist` folder to Netlify
3. **Add _redirects file** with content: `/* /index.html 200`

## Check Your Current Status

### Test Backend API First:
- Visit: https://tradeloop-api.onrender.com/health
- Should show: `{"status":"healthy","service":"TradeLoop Backend"}`

### Test Frontend Build Locally:
```bash
cd frontend
npm run build
npm run preview
```
- Should work at: http://localhost:4173

## Expected Result After Fix:
- ✅ **URL**: https://your-site.netlify.app
- ✅ **Loading screen**: Shows TradeLoop logo
- ✅ **Dashboard**: Shows trading interface with market data
- ✅ **Console logs**: Shows API connection successful

## If Still Failing:
Send me:
1. **Netlify build logs** (from Deploy log)
2. **Browser console errors** (F12 → Console)
3. **Your site URL**

**The netlify.toml file should handle most configuration automatically now!**