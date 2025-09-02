# 🚀 TradeLoop Auto-Deployment Guide

This guide explains how to automatically deploy TradeLoop using Docker from Cursor.

## 📋 Prerequisites

- Docker Desktop installed and running
- Windows PowerShell (for Windows users)
- Bash shell (for Linux/Mac users)

## 🎯 Quick Start

### Development Deployment

**Windows (PowerShell):**
```powershell
# Run from Cursor terminal in project root
.\deploy.ps1

# Skip cleanup if you want to keep old images
.\deploy.ps1 -SkipCleanup

# Skip health checks for faster deployment
.\deploy.ps1 -SkipHealthCheck
```

**Linux/Mac (Bash):**
```bash
# Make script executable first
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Production Deployment

**Windows (PowerShell):**
```powershell
# Deploy to production
.\deploy-prod.ps1

# Customize environment
.\deploy-prod.ps1 -Environment "staging"
```

## 🔧 What Each Script Does

### Development Script (`deploy.ps1` / `deploy.sh`)
1. ✅ Checks Docker status
2. 🛑 Stops existing containers
3. 🧹 Cleans up old Docker resources
4. 🏗️ Builds and starts services
5. 🔍 Waits for health checks
6. 📊 Shows deployment status

### Production Script (`deploy-prod.ps1`)
1. ✅ Checks environment configuration
2. 🐳 Verifies Docker status
3. 🛑 Stops production containers
4. 🧹 Cleans up resources
5. 🏗️ Builds production images
6. 🚀 Deploys all services
7. 🔍 Comprehensive health checks
8. 📊 Production status report

## 🌐 Service URLs After Deployment

### Development
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Database**: localhost:5432

### Production
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📁 File Structure

```
Signalforge/
├── deploy.ps1              # Windows development deployment
├── deploy.sh               # Linux/Mac development deployment
├── deploy-prod.ps1         # Windows production deployment
├── docker-compose.yml      # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── Dockerfile              # Backend Docker image
├── frontend/
│   └── Dockerfile         # Frontend Docker image
└── DEPLOYMENT.md          # This guide
```

## 🚨 Troubleshooting

### Common Issues

**Docker not running:**
```powershell
# Start Docker Desktop manually
# Or check Docker service
Get-Service docker
```

**Port conflicts:**
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F
```

**Permission denied:**
```powershell
# Run PowerShell as Administrator
# Or check execution policy
Get-ExecutionPolicy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Useful Commands

**View logs:**
```powershell
# Development
docker-compose logs -f

# Production
docker-compose -f docker-compose.prod.yml logs -f
```

**Stop services:**
```powershell
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

**Restart services:**
```powershell
# Development
docker-compose restart

# Production
docker-compose -f docker-compose.prod.yml restart
```

## 🔄 Continuous Deployment

### Auto-restart on file changes (Development)
The development setup includes volume mounts for hot reloading. Any changes to your source code will automatically restart the services.

### Production updates
For production updates, simply run the production deployment script again:
```powershell
.\deploy-prod.ps1
```

## 📊 Monitoring

### Health Checks
- **PostgreSQL**: Database connectivity
- **Backend**: API health endpoint
- **Frontend**: Web server response

### Logs
- **Real-time logs**: `docker-compose logs -f`
- **Service-specific logs**: `docker-compose logs -f <service-name>`

## 🎉 Success Indicators

When deployment is successful, you should see:
- ✅ All containers running
- 🟢 Health checks passing
- 🌐 Services accessible at expected URLs
- 📝 Recent logs showing successful startup

## 🆘 Getting Help

If you encounter issues:
1. Check Docker Desktop is running
2. Verify no port conflicts
3. Check the logs: `docker-compose logs`
4. Ensure your `.env` file is properly configured
5. Try running with `-SkipHealthCheck` for debugging

---

**Happy Trading! 🚀📈**
