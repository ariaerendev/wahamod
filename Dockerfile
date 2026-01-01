# WAHA MOD - Build from Source with Pre-built Dependencies
# Uses official WAHA image for node_modules, then rebuilds TypeScript

# Stage 1: Extract node_modules from official WAHA
FROM devlikeapro/waha:latest AS official

# Stage 2: Build our source
FROM node:22-slim AS builder

# Install required build tools
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Configure git
RUN git config --global core.autocrlf input && \
    git config --global user.email "build@wahamod.local" && \
    git config --global user.name "WAHA Builder" && \
    git config --global advice.detachedHead false

WORKDIR /app

# Copy package files first
COPY package.json ./
COPY yarn.lock ./

# Enable corepack
RUN corepack enable

# Copy pre-built node_modules from official image (includes compiled libsignal)
COPY --from=official /app/node_modules ./node_modules

# Copy our source code
COPY . .

# Verify/update dependencies (fast since node_modules already exist)
RUN yarn install

# Build our TypeScript (uses existing node_modules)
RUN yarn build

# Stage 2: Runtime (fresh - v2)
FROM node:22-alpine AS runtime-v2

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
