# TradeLoop Production Auto-Deployment Script for Windows
# Run this from Cursor to automatically deploy your application to production

param(
    [switch]$SkipCleanup,
    [switch]$SkipHealthCheck,
    [string]$Environment = "production"
)

# Stop on any error
$ErrorActionPreference = "Stop"

Write-Host "🚀 TradeLoop Production Auto-Deployment Starting..." -ForegroundColor Cyan

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

# Check if .env file exists
function Test-EnvironmentFile {
    Write-Status "Checking environment configuration..."
    
    if (Test-Path ".env") {
        Write-Success "Environment file found"
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^[^#].*=") {
                $key, $value = $_ -split "=", 2
                Write-Host "  $key = $value" -ForegroundColor Gray
            }
        }
    } else {
        Write-Warning "No .env file found, using defaults"
        Write-Status "Creating .env file from template..."
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env"
            Write-Success "Created .env from template"
        } else {
            Write-Error "No env.example found. Please create a .env file with your production settings."
            exit 1
        }
    }
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
    Write-Status "Stopping existing production containers..."
    try {
        docker-compose -f docker-compose.prod.yml down --remove-orphans
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
    Write-Status "Building and starting TradeLoop production application..."
    
    # Build the application
    Write-Status "Building Docker images for production..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start the application
    Write-Status "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    Write-Success "Production deployment completed!"
}

# Wait for services to be healthy
function Wait-ForHealth {
    if ($SkipHealthCheck) {
        Write-Warning "Skipping health checks as requested"
        return
    }
    
    Write-Status "Waiting for production services to be healthy..."
    
    # Wait for PostgreSQL
    Write-Status "Waiting for PostgreSQL..."
    $timeout = 120
    $postgresReady = $false
    
    while ($timeout -gt 0 -and -not $postgresReady) {
        try {
            docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U tradeloop -d tradeloop | Out-Null
            $postgresReady = $true
            Write-Success "PostgreSQL is ready"
        }
        catch {
            Start-Sleep -Seconds 5
            $timeout -= 5
        }
    }
    
    if (-not $postgresReady) {
        Write-Error "PostgreSQL failed to start within timeout"
        exit 1
    }
    
    # Wait for backend
    Write-Status "Waiting for backend service..."
    $timeout = 120
    $backendReady = $false
    
    while ($timeout -gt 0 -and -not $backendReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                $backendReady = $true
                Write-Success "Backend service is ready"
            }
        }
        catch {
            Start-Sleep -Seconds 5
            $timeout -= 5
        }
    }
    
    if (-not $backendReady) {
        Write-Warning "Backend service may not be fully ready"
    }
    
    # Wait for frontend
    Write-Status "Waiting for frontend service..."
    $timeout = 60
    $frontendReady = $false
    
    while ($timeout -gt 0 -and -not $frontendReady) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                $frontendReady = $true
                Write-Success "Frontend service is ready"
            }
        }
        catch {
            Start-Sleep -Seconds 5
            $timeout -= 5
        }
    }
    
    if (-not $frontendReady) {
        Write-Warning "Frontend service may not be fully ready"
    }
}

# Show deployment status
function Show-Status {
    Write-Status "Production Deployment Status:"
    Write-Host ""
    
    # Show running containers
    Write-Status "Running production containers:"
    docker-compose -f docker-compose.prod.yml ps
    
    Write-Host ""
    
    # Show logs
    Write-Status "Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=20
    
    Write-Host ""
    
    # Show service URLs
    Write-Status "Production Service URLs:"
    Write-Host "Backend API: http://localhost:3000"
    Write-Host "Frontend: http://localhost"
    Write-Host "Database: localhost:5432"
    Write-Host "Redis: localhost:6379"
    
    Write-Host ""
    Write-Success "🎉 TradeLoop is now running in PRODUCTION mode!"
    Write-Status "Use 'docker-compose -f docker-compose.prod.yml logs -f' to monitor logs"
    Write-Status "Use 'docker-compose -f docker-compose.prod.yml down' to stop services"
    Write-Status "Use 'docker-compose -f docker-compose.prod.yml restart' to restart services"
}

# Main deployment flow
function Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "    TradeLoop Production Deployment" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Test-EnvironmentFile
    Test-Docker
    Stop-Containers
    Cleanup-Docker
    Deploy-Application
    Wait-ForHealth
    Show-Status
}

# Run the main function
Main
