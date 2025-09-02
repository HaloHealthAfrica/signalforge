# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies including OpenSSL
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    openssl-dev \
    && rm -rf /var/cache/apk/*

# Copy package files and prisma schema (needed for postinstall)
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma/

# Install dependencies including dev dependencies for build
RUN npm ci && npm cache clean --force

# Copy source code (excluding node_modules and other unnecessary files)
COPY src/ ./src/

# Generate Prisma client (explicit generation after copying source)
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tradeloop -u 1001

# Change ownership of the app directory
RUN chown -R tradeloop:nodejs /app
USER tradeloop

# Expose port (will use PORT env var, default 3000)
EXPOSE 3000 10000

# Health check (use dynamic port)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').get(\`http://localhost:\${port}/health\`, (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]
