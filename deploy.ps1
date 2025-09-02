# TradeLoop Auto-Deployment Script for Windows
# Run this from Cursor to automatically deploy your application

param(
    [switch]$SkipCleanup,
    [switch]$SkipHealthCheck
)

# Stop on any error
$ErrorActionPreference = "Stop"

Write-Host "🚀 TradeLoop Auto-Deployment Starting..." -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is running
function Test-Docker {
    Write-Status "Checking Docker status..."
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop first."
        exit 1
    }
}

# Stop existing containers
function Stop-Containers {
    Write-Status "Stopping existing containers..."
    try {
        docker-compose down --remove-orphans
        Write-Success "Existing containers stopped"
    }
    catch {
        Write-Warning "No existing containers to stop"
    }
}

# Clean up old images and containers
function Cleanup-Docker {
    if ($SkipCleanup) {
        Write-Warning "Skipping cleanup as requested"
        return
    }
    
    Write-Status "Cleaning up old Docker resources..."
    try {
        docker system prune -f
        docker image prune -f
        Write-Success "Cleanup completed"
    }
    catch {
        Write-Warning "Cleanup failed, continuing anyway"
    }
}

# Build and start the application
function Deploy-Application {
    Write-Status "Building and starting TradeLoop application..."
    
    # Build the application
    Write-Status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start the application
    Write-Status "Starting services..."
    docker-compose up -d
    
    Write-Success "Deployment completed!"
}

# Wait for services to be healthy
function Wait-ForHealth {
    if ($SkipHealthCheck) {
        Write-Warning "Skipping health checks as requested"
        return
    }
    
    Write-Status "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    Write-Status "Waiting for PostgreSQL..."
    $timeout = 60
    $postgresReady = $false
    
    while ($timeout -gt 0 -and -not $postgresReady) {
        try {
            docker-compose exec -T postgres pg_isready -U tradeloop -d tradeloop | Out-Null
            $postgresReady = $true
            Write-Success "PostgreSQL is ready"
        }
        catch {
            Start-Sleep -Seconds 2
            $timeout -= 2
        }
    }
    
    if (-not $postgresReady) {
        Write-Error "PostgreSQL failed to start within timeout"
        exit 1
    }
    
    # Wait for backend
    Write-Status "Waiting for backend service..."
    $timeout = 60
    $backendReady = $false
    
    while ($timeout -gt 0 -and -not $backendReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                $backendReady = $true
                Write-Success "Backend service is ready"
            }
        }
        catch {
            Start-Sleep -Seconds 2
            $timeout -= 2
        }
    }
    
    if (-not $backendReady) {
        Write-Warning "Backend service may not be fully ready"
    }
}

# Show deployment status
function Show-Status {
    Write-Status "Deployment Status:"
    Write-Host ""
    
    # Show running containers
    Write-Status "Running containers:"
    docker-compose ps
    
    Write-Host ""
    
    # Show logs
    Write-Status "Recent logs:"
    docker-compose logs --tail=20
    
    Write-Host ""
    
    # Show service URLs
    Write-Status "Service URLs:"
    Write-Host "Backend API: http://localhost:3000"
    Write-Host "Frontend: http://localhost:5173 (if running in dev mode)"
    Write-Host "Database: localhost:5432"
    
    Write-Host ""
    Write-Success "🎉 TradeLoop is now running!"
    Write-Status "Use 'docker-compose logs -f' to monitor logs"
    Write-Status "Use 'docker-compose down' to stop services"
}

# Main deployment flow
function Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "    TradeLoop Auto-Deployment Script" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Test-Docker
    Stop-Containers
    Cleanup-Docker
    Deploy-Application
    Wait-ForHealth
    Show-Status
}

# Run the main function
Main
