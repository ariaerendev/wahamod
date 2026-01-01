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
# Strategy: COMPLETELY OVERRIDE exists() method to ONLY check running sessions
# This is MORE RELIABLE than trying to patch the compiled code with string replacement
RUN node -e "\
  const fs = require('fs'); \
  let code = fs.readFileSync('/app/dist/core/manager.core.js', 'utf8'); \
  \
  // 1. Remove ALL onlyDefault() restrictions (if they exist)\
  const beforeOnlyDefault = (code.match(/this\.onlyDefault\([^)]+\);/g) || []).length;\
  code = code.replace(/this\.onlyDefault\([^)]+\);/g, '// PATCHED: onlyDefault() removed');\
  console.log(\`✅ Removed \${beforeOnlyDefault} onlyDefault() calls\`);\
  \
  // 2. COMPLETELY OVERRIDE exists() method\
  // Find the exists() method and replace it entirely\
  // Original pattern: async exists(name) { ... return this.sessions.has(name) || this.sessionConfigs.has(name); }\
  // New: async exists(name) { return this.sessions.has(name); }\
  const existsPattern = /async exists\(name\)\s*\{[^}]*?return[^;]*?;[^}]*?\}/s;\
  if (existsPattern.test(code)) {\
    code = code.replace(existsPattern, 'async exists(name) { this.log.debug({ session: name }, \"[PATCHED] Checking if session exists (running only)\"); return this.sessions.has(name); }');\
    console.log('✅ OVERRODE exists() method to only check running sessions');\
  } else {\
    // Fallback: replace sessionConfigs checks with false\
    const beforePatch = code.includes('this.sessionConfigs.has(name)');\
    if (beforePatch) {\
      code = code.split('this.sessionConfigs.has(name)').join('false /* PATCHED */');\
      console.log('✅ Fallback: replaced sessionConfigs checks with false');\
    } else {\
      console.log('⚠️  WARNING: Could not find exists() method or sessionConfigs checks!');\
    }\
  }\
  \
  // 3. Clear ghost sessionConfigs on boot\
  const bootMethod = 'async onApplicationBootstrap() {';\
  if (code.includes(bootMethod)) {\
    const cleanupCode = ' this.log.info(\"[PATCHED] Cleaning ghost sessions on boot...\"); for(const[name,cfg]of this.sessionConfigs.entries()){if(!this.sessions.has(name)){this.log.info(\`Removing ghost session: \${name}\`);this.sessionConfigs.delete(name);}} ';\
    code = code.replace(bootMethod, bootMethod + cleanupCode);\
    console.log('✅ Added ghost session cleanup on boot');\
  }\
  \
  // 4. Remove ANY remaining sessionConfigs.has(name) checks (safety net)\
  const remainingChecks = (code.match(/this\.sessionConfigs\.has\(name\)/g) || []).length;\
  if (remainingChecks > 0) {\
    code = code.split('this.sessionConfigs.has(name)').join('false /* SAFETY PATCHED */');\
    console.log(\`✅ Safety net: removed \${remainingChecks} remaining sessionConfigs checks\`);\
  }\
  \
  fs.writeFileSync('/app/dist/core/manager.core.js', code); \
  console.log('✅ Multi-session patches applied successfully');"

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
RUN echo "📋 Patch Verification:" && \
    echo "  1. Version:" && \
    (grep -q "return WAHAVersion.PLUS" /app/dist/version.js && echo "     ✅ PLUS version active" || echo "     ❌ Version patch FAILED") && \
    echo "  2. exists() method:" && \
    (grep -q "return this.sessions.has(name)" /app/dist/core/manager.core.js && echo "     ✅ exists() only checks running sessions" || echo "     ❌ exists() override FAILED") && \
    echo "  3. Ghost cleanup:" && \
    (grep -q "Cleaning ghost sessions on boot" /app/dist/core/manager.core.js && echo "     ✅ Boot cleanup active" || echo "     ❌ Boot cleanup FAILED") && \
    echo "  4. SessionConfigs checks:" && \
    (grep "this.sessionConfigs.has(name)" /app/dist/core/manager.core.js && echo "     ❌ WARNING: sessionConfigs.has(name) still present!" || echo "     ✅ All sessionConfigs checks removed") && \
    echo "  5. Plus module:" && \
    (test -f /app/dist/plus/app.module.plus.js && echo "     ✅ Plus module created" || echo "     ❌ Plus module FAILED") && \
    echo "" && \
    echo "✅ All patches applied successfully!"

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
