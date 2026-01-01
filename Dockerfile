# WAHA MOD - Optimized Dockerfile  
# Extends official WAHA image with Plus features unlocked
# Strategy: Replace compiled JS files directly in dist/ (no rebuild needed)
# Build time: <30 seconds

FROM devlikeapro/waha:latest

USER root
WORKDIR /app

# Install TypeScript compiler (lightweight, no full build deps needed)
RUN npm install -g typescript@5.3.3

# Copy modified source files
COPY src/version.ts ./src/version.ts
COPY src/core/manager.core.ts ./src/core/manager.core.ts
COPY src/plus/ ./src/plus/

# Compile only modified files and replace in dist/
# This preserves official image's dist/ while patching our changes
RUN tsc --outDir ./dist \
    --module commonjs \
    --target es2021 \
    --esModuleInterop \
    --skipLibCheck \
    --declaration false \
    src/version.ts \
    src/core/manager.core.ts \
    src/plus/app.module.plus.ts

# Cleanup TypeScript compiler
RUN npm uninstall -g typescript && \
    rm -rf /root/.npm /tmp/*

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
