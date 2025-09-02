#!/bin/bash

# TradeLoop Auto-Deployment Script
# Run this from Cursor to automatically deploy your application

set -e  # Exit on any error

echo "🚀 TradeLoop Auto-Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    print_success "Docker is running"
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans
    print_success "Existing containers stopped"
}

# Clean up old images and containers
cleanup() {
    print_status "Cleaning up old Docker resources..."
    docker system prune -f
    docker image prune -f
    print_success "Cleanup completed"
}

# Build and start the application
deploy() {
    print_status "Building and starting TradeLoop application..."
    
    # Build the application
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start the application
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Deployment completed!"
}

# Wait for services to be healthy
wait_for_health() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U tradeloop -d tradeloop > /dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "PostgreSQL failed to start within timeout"
        exit 1
    fi
    
    # Wait for backend
    print_status "Waiting for backend service..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            print_success "Backend service is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Backend service may not be fully ready"
    fi
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    
    # Show running containers
    print_status "Running containers:"
    docker-compose ps
    
    echo ""
    
    # Show logs
    print_status "Recent logs:"
    docker-compose logs --tail=20
    
    echo ""
    
    # Show service URLs
    print_status "Service URLs:"
    echo "Backend API: http://localhost:3000"
    echo "Frontend: http://localhost:5173 (if running in dev mode)"
    echo "Database: localhost:5432"
    
    echo ""
    print_success "🎉 TradeLoop is now running!"
    print_status "Use 'docker-compose logs -f' to monitor logs"
    print_status "Use 'docker-compose down' to stop services"
}

# Main deployment flow
main() {
    echo "=========================================="
    echo "    TradeLoop Auto-Deployment Script"
    echo "=========================================="
    echo ""
    
    check_docker
    stop_containers
    cleanup
    deploy
    wait_for_health
    show_status
}

# Run the main function
main "$@"
