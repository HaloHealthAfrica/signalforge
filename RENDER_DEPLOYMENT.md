# 🚀 Render Deployment Guide

## Quick Deploy

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Render**: 
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Choose "New Blueprint" and select your repo
3. **Deploy**: Render will automatically use `render.yaml` to deploy everything

## Manual Setup (Alternative)

### 1. Database
- Create PostgreSQL database
- Name: `tradeloop-db`
- Plan: Free tier

### 2. Backend Service
- **Type**: Web Service
- **Build Command**: `npm ci && npm run build && npx prisma generate`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```
  NODE_ENV=production
  PORT=10000
  DATABASE_URL=[Auto-populated from database]
  CORS_ORIGIN=https://your-frontend-url.onrender.com
  ```

### 3. Frontend Service
- **Type**: Static Site
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment Variables**:
  ```
  VITE_API_URL=https://your-backend-url.onrender.com
  ```

## Environment Variables to Set

In Render dashboard, add these environment variables:

### Required
- `DATABASE_URL` - Auto-populated by Render
- `NODE_ENV=production`
- `JWT_SECRET` - Generate a secure random string
- `CORS_ORIGIN` - Your frontend URL

### Trading APIs (Set these after deployment)
- `TRADING_API_KEY` - Your trading platform API key
- `TRADING_API_SECRET` - Your trading platform API secret  
- `TRADING_SANDBOX=true` - Set to false for live trading

### Optional
- `REDIS_URL` - If using Redis for caching
- `LOG_LEVEL=info`

## Deployment Commands

### First Deployment
```bash
# Ensure migrations are ready
npm run db:generate
npm run build

# Deploy will run automatically via render.yaml
```

### Updates
```bash
git push origin main  # Triggers auto-deployment
```

## Monitoring

- **Health Check**: `/health` endpoint
- **API Status**: `/api/status`
- **Logs**: Available in Render dashboard

## URLs After Deployment

- **API**: `https://tradeloop-api.onrender.com`
- **Frontend**: `https://tradeloop-frontend.onrender.com`
- **Health Check**: `https://tradeloop-api.onrender.com/health`

## Free Tier Limits

- **Database**: 1GB storage, 97 connection hours/month
- **Web Services**: 750 hours/month per service
- **Bandwidth**: 100GB/month per service
- **Build Time**: 500 minutes/month

## Troubleshooting

### Common Issues

1. **Build Fails**: Check that all dependencies are in `dependencies`, not `devDependencies`
2. **Database Connection**: Ensure `DATABASE_URL` is properly set
3. **CORS Errors**: Verify `CORS_ORIGIN` matches your frontend URL
4. **Port Issues**: Make sure your app listens on `process.env.PORT`

### Debug Commands
```bash
# Check environment
curl https://your-app.onrender.com/api/status

# Check database connection
curl https://your-app.onrender.com/health
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Frontend connects to API
- [ ] CORS configured correctly
- [ ] SSL certificates active (auto-handled by Render)
- [ ] Custom domain configured (optional)

## Next Steps

1. **Custom Domain**: Add your domain in Render settings
2. **Monitoring**: Set up alerts for downtime
3. **Backup**: Configure database backups
4. **Scaling**: Upgrade plans as needed