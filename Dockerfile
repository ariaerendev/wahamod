# WAHA MOD - Build from Source
# Builds WAHA from source code with all modifications intact
# This ensures TypeScript changes are properly compiled to JavaScript

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy all files (except what's in .dockerignore)
COPY . .

# Enable corepack for Yarn modern
RUN corepack enable

# Install dependencies
RUN yarn install

# Build the application (TypeScript -> JavaScript)
RUN yarn build

# Stage 2: Runtime
FROM node:22-alpine

# Install required system packages
RUN apk add --no-cache \
    chromium \
    ca-certificates \
    ffmpeg \
    tini \
    wget \
    curl \
    zip \
    unzip

# Create waha user and directories
RUN addgroup -S waha && adduser -S waha -G waha
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=waha:waha /app/dist ./dist
COPY --from=builder --chown=waha:waha /app/node_modules ./node_modules
COPY --from=builder --chown=waha:waha /app/package.json ./

# Copy runtime files
COPY --chown=waha:waha entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create data directories
RUN mkdir -p /app/.sessions /app/.media && chown -R waha:waha /app

# Environment variables
ENV PUPPETEER_SKIP_DOWNLOAD=True \
    CHOKIDAR_USEPOLLING=1 \
    CHOKIDAR_INTERVAL=5000 \
    WAHA_ZIPPER=ZIPUNZIP \
    GODEBUG=netdns=cgo \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER waha
WORKDIR /app
EXPOSE 3000

# Health check
HEALTHCHECK --interval=1h --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ping || exit 1

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/entrypoint.sh"]
