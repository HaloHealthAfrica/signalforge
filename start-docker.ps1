# Docker Desktop Startup Helper Script
# This script helps start Docker Desktop and verify it's working

Write-Host "🐳 Docker Desktop Startup Helper" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker Desktop is installed
Write-Host "Checking Docker Desktop installation..." -ForegroundColor Blue

$dockerPaths = @(
    "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
    "${env:LOCALAPPDATA}\Docker\Docker\Docker Desktop.exe"
)

$dockerInstalled = $false
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Docker Desktop found at: $path" -ForegroundColor Green
        $dockerInstalled = $true
        $dockerPath = $path
        break
    }
}

if (-not $dockerInstalled) {
    Write-Host "❌ Docker Desktop not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop from:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if Docker Desktop is already running
Write-Host ""
Write-Host "Checking if Docker Desktop is running..." -ForegroundColor Blue

try {
    docker info | Out-Null
    Write-Host "✅ Docker Desktop is already running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run the deployment script:" -ForegroundColor Cyan
    Write-Host "  .\deploy.ps1" -ForegroundColor White
    exit 0
}
catch {
    Write-Host "❌ Docker Desktop is not running" -ForegroundColor Red
}

# Try to start Docker Desktop
Write-Host ""
Write-Host "Attempting to start Docker Desktop..." -ForegroundColor Blue

try {
    Start-Process -FilePath $dockerPath -WindowStyle Minimized
    Write-Host "✅ Docker Desktop startup initiated" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please wait for Docker Desktop to fully start..." -ForegroundColor Yellow
    Write-Host "This may take 1-2 minutes on first startup." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Once Docker Desktop is running (check the system tray), run:" -ForegroundColor Cyan
    Write-Host "  .\deploy.ps1" -ForegroundColor White
}
catch {
    Write-Host "❌ Failed to start Docker Desktop automatically" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop manually:" -ForegroundColor Yellow
    Write-Host "1. Look for Docker Desktop in your Start Menu" -ForegroundColor White
    Write-Host "2. Or double-click: $dockerPath" -ForegroundColor White
    Write-Host "3. Wait for it to fully start" -ForegroundColor White
    Write-Host "4. Run this script again to verify" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
