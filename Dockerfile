# WAHA MOD - Patched Image
# Extends official WAHA image with Plus features unlocked
# Strategy: Use Node.js to patch compiled JS files (more reliable than sed)
# Build time: <10 seconds

FROM devlikeapro/waha:latest

USER root
WORKDIR /app

# Patch 1: Force PLUS version in dist/version.js
# Replace entire getWAHAVersion function to always return PLUS
RUN node -e "\
  const fs = require('fs'); \
  let code = fs.readFileSync('/app/dist/version.js', 'utf8'); \
  code = code.replace(/function getWAHAVersion\(\) \{[\s\S]*?return hasPlusDirectory.*?\n\}/m, \
    'function getWAHAVersion() { return WAHAVersion.PLUS; }'); \
  fs.writeFileSync('/app/dist/version.js', code); \
  console.log('✅ Patched version.js to always return PLUS');"

# Patch 2: Fix ghost sessions + multi-session support
# Strategy: 
# 1. Remove onlyDefault() restrictions
# 2. Replace sessionConfigs check with false (only check running sessions)
# 3. Clear ghost sessionConfigs on boot
RUN node -e "\
  const fs = require('fs'); \
  let code = fs.readFileSync('/app/dist/core/manager.core.js', 'utf8'); \
  \
  // Remove onlyDefault restrictions\
  code = code.replace(/this\.onlyDefault\([^)]+\);/g, '// PATCHED: Multi-session enabled'); \
  \
  // Fix exists() method - replace sessionConfigs check with false\
  const beforeExists = code.includes('this.sessionConfigs.has(name)');\
  if (beforeExists) {\
    code = code.split('this.sessionConfigs.has(name)').join('false /* PATCHED: Ghost sessions fix */');\
    console.log('✅ Applied ghost sessions fix to exists()');\
  }\
  \
  // Clear ghost sessionConfigs on boot - add cleanup in onApplicationBootstrap\
  const bootMethod = 'async onApplicationBootstrap() {';\
  if (code.includes(bootMethod)) {\
    code = code.replace(\
      bootMethod,\
      bootMethod + ' for(const[n,c]of this.sessionConfigs.entries()){if(!this.sessions.has(n)){this.log.info(`Removing ghost: ${n}`);this.sessionConfigs.delete(n);}}'\
    );\
    console.log('✅ Added ghost session cleanup on boot');\
  }\
  \
  fs.writeFileSync('/app/dist/core/manager.core.js', code); \
  console.log('✅ Patched manager.core.js: multi-session + ghost sessions fix');"

# Patch 3: Create Plus module that re-exports Core
RUN mkdir -p /app/dist/plus && \
    node -e "\
      const code = '\"use strict\";\n\
Object.defineProperty(exports, \"__esModule\", { value: true });\n\
exports.AppModulePlus = void 0;\n\
const app_module_core_1 = require(\"../core/app.module.core\");\n\
exports.AppModulePlus = app_module_core_1.AppModuleCore;\n';\
      require('fs').writeFileSync('/app/dist/plus/app.module.plus.js', code); \
      console.log('✅ Created Plus module');"

# Verify patches applied
RUN echo "📋 Verification:" && \
    grep -q "return WAHAVersion.PLUS" /app/dist/version.js && echo "  ✓ Version patch OK" || echo "  ✗ Version patch FAILED" && \
    grep -q "PATCHED: Multi-session" /app/dist/core/manager.core.js && echo "  ✓ Multi-session patch OK" || echo "  ✗ Multi-session FAILED" && \
    grep -q "Ghost sessions fix" /app/dist/core/manager.core.js && echo "  ✓ Ghost sessions fix OK" || echo "  ✗ Ghost sessions FAILED" && \
    (grep "this.sessionConfigs.has(name)" /app/dist/core/manager.core.js && echo "  ✗ WARNING: sessionConfigs still present!" || echo "  ✓ sessionConfigs removed OK") && \
    test -f /app/dist/plus/app.module.plus.js && echo "  ✓ Plus module OK" || echo "  ✗ Plus module FAILED"

# Keep original WAHA configurations
ENV PUPPETEER_SKIP_DOWNLOAD=True
ENV CHOKIDAR_USEPOLLING=1
ENV CHOKIDAR_INTERVAL=5000
ENV WAHA_ZIPPER=ZIPUNZIP
ENV GODEBUG=netdns=cgo

WORKDIR /app
EXPOSE 3000

# Health check runs once per hour to minimize log spam
HEALTHCHECK --interval=1h --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ping || exit 1

# Use original WAHA entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/entrypoint.sh"]
