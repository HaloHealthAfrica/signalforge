# 🔧 Render Deployment Troubleshooting Guide

## Quick Fixes Applied

### 1. Dependencies Fixed
- Moved `typescript` and `prisma` to `dependencies` (not devDependencies)
- This ensures they're available during Render builds

### 2. Build Commands Simplified
- Main: `npm install && npm run build:render`
- Fallback: `npm ci --verbose && npx tsc && npx prisma generate`

### 3. Configuration Files
- `render.yaml` - Full stack deployment
- `render-backend-only.yaml` - Backend only (use if full stack fails)
- `render-simple.yaml` - Minimal configuration

## If Build Still Fails

### Option 1: Manual Render Setup (Recommended)

**Step 1: Create Database**
1. Go to Render Dashboard → New PostgreSQL
2. Name: `tradeloop-db`
3. User: `tradeloop` 
4. Database: `tradeloop`
5. Plan: Free

**Step 2: Create Web Service**
1. New Web Service → Connect GitHub repo
2. **Build Command**: `npm install && npx tsc && npx prisma generate`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[Copy from database service]
   CORS_ORIGIN=*
   ```

### Option 2: Use Backend-Only Config
1. In Render, go to Blueprint settings
2. Replace `render.yaml` content with `render-backend-only.yaml`
3. This deploys only the API first

### Option 3: Debug Build Process
If you can share the exact error message, I can provide specific fixes for:
- Node version issues
- Prisma generation failures  
- TypeScript compilation errors
- Missing dependencies
- Build timeout issues

## Common Error Messages & Solutions

### "tsc: command not found"
**Fix**: TypeScript moved to dependencies ✅

### "prisma: command not found" 
**Fix**: Prisma moved to dependencies ✅

### "Build failed with exit code 1"
**Fix**: Check specific error in build logs

### "Cannot connect to database"
**Fix**: Ensure DATABASE_URL is set from database service

### "Port already in use"
**Fix**: Using PORT=10000 (Render standard)

## Manual Deployment Commands

If Blueprint fails, create services manually:

```bash
# Database
# Create PostgreSQL service in Render dashboard

# Backend API
Build: npm install && npx tsc && npx prisma generate  
Start: npm start
Port: 10000
Health: /health
```

## Testing Deployment

Once deployed, test these endpoints:
- `https://your-service.onrender.com/health`
- `https://your-service.onrender.com/api/status`

## Need Help?

Share the specific error message from Render build logs and I can provide targeted fixes!