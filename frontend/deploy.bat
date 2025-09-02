@echo off
setlocal EnableDelayedExpansion

REM TradeLoop Frontend Docker Deployment Script for Windows
echo 🚀 TradeLoop Frontend Docker Deployment
echo =======================================

REM Configuration
set IMAGE_NAME=tradeloop-frontend
set CONTAINER_NAME=tradeloop-frontend
set PORT=80
set ENV=production

if "%~1"=="" goto :main
if "%~1"=="build" goto :build
if "%~1"=="run" goto :run
if "%~1"=="stop" goto :stop
if "%~1"=="logs" goto :logs
if "%~1"=="clean" goto :clean
goto :main

:check_docker
echo [INFO] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)
echo [SUCCESS] Docker is running
goto :eof

:build_image
echo [INFO] Building Docker image...
if "%ENV%"=="production" (
    docker build -t %IMAGE_NAME%:latest -t %IMAGE_NAME%:%ENV% .
) else (
    docker build -t %IMAGE_NAME%:%ENV% .
)
if errorlevel 1 (
    echo [ERROR] Docker build failed
    exit /b 1
)
echo [SUCCESS] Docker image built successfully
goto :eof

:cleanup_container
echo [INFO] Cleaning up existing containers...
docker ps -a | findstr %CONTAINER_NAME% >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Stopping existing container...
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
)
echo [SUCCESS] Container cleanup complete
goto :eof

:run_container
echo [INFO] Starting new container...
docker run -d ^
    --name %CONTAINER_NAME% ^
    -p %PORT%:80 ^
    --restart unless-stopped ^
    --health-cmd="curl -f http://localhost/health || exit 1" ^
    --health-interval=30s ^
    --health-timeout=10s ^
    --health-retries=3 ^
    %IMAGE_NAME%:%ENV%

if errorlevel 1 (
    echo [ERROR] Failed to start container
    exit /b 1
)
echo [SUCCESS] Container started successfully
goto :eof

:wait_for_health
echo [INFO] Waiting for container to be healthy...
for /l %%i in (1,1,30) do (
    docker inspect --format="{{.State.Health.Status}}" %CONTAINER_NAME% 2>nul | findstr "healthy" >nul
    if not errorlevel 1 (
        echo [SUCCESS] Container is healthy!
        goto :eof
    )
    echo|set /p="."
    timeout /t 2 /nobreak >nul
)
echo [WARN] Container health check timed out
goto :eof

:show_info
echo.
echo 🎉 Deployment Complete!
echo ======================
echo Application URL: http://localhost:%PORT%
echo Health Check: http://localhost:%PORT%/health
echo Container Name: %CONTAINER_NAME%
echo Image: %IMAGE_NAME%:%ENV%
echo.
echo Useful Commands:
echo   View logs: docker logs %CONTAINER_NAME%
echo   Stop: docker stop %CONTAINER_NAME%
echo   Restart: docker restart %CONTAINER_NAME%
echo   Remove: docker rm -f %CONTAINER_NAME%
echo.
goto :eof

:main
call :check_docker
call :cleanup_container
call :build_image
call :run_container
call :wait_for_health
call :show_info
goto :end

:build
call :check_docker
call :build_image
goto :end

:run
call :check_docker
call :cleanup_container
call :run_container
call :wait_for_health
call :show_info
goto :end

:stop
echo [INFO] Stopping container...
docker stop %CONTAINER_NAME%
echo [SUCCESS] Container stopped
goto :end

:logs
docker logs -f %CONTAINER_NAME%
goto :end

:clean
call :cleanup_container
docker rmi %IMAGE_NAME%:%ENV% >nul 2>&1
echo [SUCCESS] Cleanup complete
goto :end

:end
endlocal