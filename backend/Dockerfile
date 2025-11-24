# ============================================================================
# LEMNIX Backend - Multi-Stage Dockerfile
# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:20.19-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (production + dev for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run db:generate

# Build TypeScript
RUN npm run build

# ============================================================================
# Stage 2: Runtime
# ============================================================================
FROM node:20.19-alpine AS runtime

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema (needed for migrations)
COPY --from=builder /app/prisma ./prisma

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/docker-entrypoint.sh"]

# Start application
CMD ["node", "dist/index.js"]

