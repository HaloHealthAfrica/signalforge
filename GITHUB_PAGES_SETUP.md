# 🚀 GitHub Pages Setup Guide

## Step 1: Enable GitHub Pages

1. **Go to your repository**: https://github.com/HaloHealthAfrica/signalforge
2. **Click Settings** tab
3. **Scroll down to "Pages"** section
4. **Source**: Select "Deploy from a branch"
5. **Branch**: Select "gh-pages"
6. **Folder**: Select "/ (root)"
7. **Click Save**

## Step 2: Check GitHub Actions

1. **Go to Actions tab**: https://github.com/HaloHealthAfrica/signalforge/actions
2. **Look for "Deploy Frontend to GitHub Pages"** workflow
3. **Should show green checkmark** when completed
4. **If failed**, click on it to see error logs

## Step 3: Access Your Site

After GitHub Actions completes successfully:
- **Frontend URL**: https://halohealthafrica.github.io/signalforge/
- **Backend API**: https://tradeloop-api.onrender.com ✅

## Step 4: If Still Not Working

### Option A: Manual GitHub Pages Setup
1. **Settings → Pages**
2. **Source**: GitHub Actions (instead of Deploy from branch)
3. **This uses the automated workflow**

### Option B: Alternative - Use Vercel (Fastest)
1. **Go to [vercel.com](https://vercel.com)**
2. **Import GitHub repo**: `HaloHealthAfrica/signalforge`
3. **Root Directory**: `frontend`
4. **Framework**: React
5. **Deploy** (takes 2-3 minutes)

### Option C: Alternative - Use Surge.sh (Simple)
```bash
cd frontend
npm run build
npx surge dist/ --domain your-app-name.surge.sh
```

## Troubleshooting

### If GitHub Actions Fails:
- Check if repository has Actions enabled
- Verify workflow file exists: `.github/workflows/deploy-frontend.yml`

### If Pages Shows 404:
- Ensure `gh-pages` branch exists
- Check base path configuration in vite.config.ts

### If App Loads But API Fails:
- Check console for CORS errors
- Verify API URL: https://tradeloop-api.onrender.com/health

## Expected Result
- Beautiful TradeLoop trading dashboard
- Live market data from your Render API
- All trading features working

**Try the GitHub Pages URL first, then try Vercel as backup!**