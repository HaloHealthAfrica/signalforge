#!/bin/bash

# TradeLoop Frontend Docker Deployment Script
set -e

echo "🚀 TradeLoop Frontend Docker Deployment"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="tradeloop-frontend"
CONTAINER_NAME="tradeloop-frontend"
PORT=${PORT:-80}
ENV=${ENV:-production}

# Functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if Docker is running
check_docker() {
    log "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    success "Docker is running"
}

# Build the Docker image
build_image() {
    log "Building Docker image..."
    if [ "$ENV" = "production" ]; then
        docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$ENV .
    else
        docker build -t $IMAGE_NAME:$ENV .
    fi
    success "Docker image built successfully"
}

# Stop and remove existing container
cleanup_container() {
    log "Cleaning up existing containers..."
    if docker ps -a | grep -q $CONTAINER_NAME; then
        warn "Stopping existing container..."
        docker stop $CONTAINER_NAME || true
        docker rm $CONTAINER_NAME || true
    fi
    success "Container cleanup complete"
}

# Run the container
run_container() {
    log "Starting new container..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        --restart unless-stopped \
        --health-cmd="curl -f http://localhost/health || exit 1" \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        $IMAGE_NAME:$ENV

    success "Container started successfully"
}

# Wait for container to be healthy
wait_for_health() {
    log "Waiting for container to be healthy..."
    for i in {1..30}; do
        if docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null | grep -q "healthy"; then
            success "Container is healthy!"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    warn "Container health check timed out"
}

# Show deployment info
show_info() {
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo "Application URL: http://localhost:$PORT"
    echo "Health Check: http://localhost:$PORT/health"
    echo "Container Name: $CONTAINER_NAME"
    echo "Image: $IMAGE_NAME:$ENV"
    echo ""
    echo "Useful Commands:"
    echo "  View logs: docker logs $CONTAINER_NAME"
    echo "  Stop: docker stop $CONTAINER_NAME"
    echo "  Restart: docker restart $CONTAINER_NAME"
    echo "  Remove: docker rm -f $CONTAINER_NAME"
    echo ""
}

# Main deployment flow
main() {
    check_docker
    cleanup_container
    build_image
    run_container
    wait_for_health
    show_info
}

# Handle command line arguments
case "$1" in
    "build")
        check_docker
        build_image
        ;;
    "run")
        check_docker
        cleanup_container
        run_container
        wait_for_health
        show_info
        ;;
    "stop")
        log "Stopping container..."
        docker stop $CONTAINER_NAME
        success "Container stopped"
        ;;
    "logs")
        docker logs -f $CONTAINER_NAME
        ;;
    "clean")
        cleanup_container
        docker rmi $IMAGE_NAME:$ENV 2>/dev/null || true
        success "Cleanup complete"
        ;;
    *)
        main
        ;;
esac