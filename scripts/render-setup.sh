#!/bin/bash
# Render Database Setup Script

echo "🚀 Setting up TradeLoop for Render deployment..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database (optional)
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

echo "✅ Database setup complete!"