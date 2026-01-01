# WAHA MOD - Optimized Dockerfile
# Extends official WAHA image with Plus features unlocked
# Build time: ~2-3 minutes (vs 15+ minutes for full build)

FROM devlikeapro/waha:latest

# Install build dependencies (minimal)
USER root
WORKDIR /tmp

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install corepack and yarn
RUN npm install -g corepack && corepack enable

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Enable yarn berry
RUN yarn set version 4.9.2

# Copy only modified source files (Plus features unlock)
COPY src/version.ts ./src/version.ts
COPY src/core/manager.core.ts ./src/core/manager.core.ts
COPY src/plus/ ./src/plus/

# Rebuild only affected modules (much faster than full build)
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build 2>&1 | tee /tmp/build.log && \
    find ./dist -name "*.d.ts" -delete

# Cleanup build dependencies to reduce image size
RUN apt-get purge -y build-essential python3 git && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /root/.cache /root/.npm

# Reset NODE_OPTIONS to original WAHA value
ENV NODE_OPTIONS="--max-old-space-size=16384"

# Keep original WAHA configurations
ENV PUPPETEER_SKIP_DOWNLOAD=True
ENV CHOKIDAR_USEPOLLING=1
ENV CHOKIDAR_INTERVAL=5000
ENV WAHA_ZIPPER=ZIPUNZIP
ENV GODEBUG=netdns=cgo

WORKDIR /app
EXPOSE 3000

# Use original WAHA entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/entrypoint.sh"]
