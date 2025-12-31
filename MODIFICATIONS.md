# WAHA MOD - Modified Files

This document lists all files that have been modified from the original WAHA project.

## Modified Files

### 1. src/version.ts
**Purpose**: Force PLUS version detection

**Changes**:
- Modified `getWAHAVersion()` to always return `WAHAVersion.PLUS`
- Removed folder existence check (`fs.existsSync`)
- Removed environment variable check

**Impact**: System now always detects as PLUS version

---

### 2. src/core/manager.core.ts
**Purpose**: Enable multi-session support

**Changes**:
- **Removed**:
  - `OnlyDefaultSessionIsAllowed` exception class
  - `DefaultSessionStatus` enum
  - `DEFAULT` constant
  - `onlyDefault()` method
  - `clearStorage()` method
  - Single `session` variable
  - Single `sessionConfig` variable

- **Added**:
  - `sessions: Map<string, WhatsappSession>` - Multi-session storage
  - `sessionConfigs: Map<string, SessionConfig>` - Multi-session configs

- **Modified Methods** (all updated for multi-session):
  - `constructor()` - Removed clearStorage call
  - `beforeApplicationShutdown()` - Stop all sessions
  - `exists(name)` - Check in Map
  - `isRunning(name)` - Check in Map
  - `upsert(name, config)` - Set in Map
  - `start(name)` - Create and store in Map
  - `stop(name)` - Remove from Map
  - `unpair(name)` - Get from Map
  - `logout(name)` - No validation
  - `delete(name)` - Remove from both Maps
  - `getWebhooks(name)` - Get config by name
  - `getProxyConfig(name)` - Get config by name
  - `getSession(name)` - Get from Map
  - `getSessions(all)` - Iterate all Maps
  - `getSessionInfo(name)` - Find by name
  - `updateSession(name)` - Update specific session
  - `fetchEngineInfo(session)` - Accept session parameter

**Impact**: Core now supports unlimited concurrent sessions

---

## New Files

### 1. src/plus/app.module.plus.ts
**Purpose**: Create Plus module to enable Plus detection

**Content**:
```typescript
export { AppModuleCore as AppModulePlus } from '../core/app.module.core';
```

**Impact**: System detects Plus version due to `/plus` folder existence

---

### 2. README.WAHAMOD.md
**Purpose**: Documentation for WAHA MOD users

**Contains**:
- Project description
- Disclaimer
- Features unlocked
- Quick start guide
- Usage examples
- Technical details
- Architecture diagram

---

### 3. CHANGELOG.WAHAMOD.md
**Purpose**: Track all modifications

**Contains**:
- Version history
- Detailed change log
- Breaking changes (none)
- Migration guide
- Future plans

---

### 4. MODIFICATIONS.md (this file)
**Purpose**: Document all file changes

**Contains**:
- List of modified files
- List of new files
- Change summaries
- Impact analysis

---

## Unchanged Files

All other files remain identical to the original WAHA Core project:
- `src/main.ts` - Bootstrap logic (loads Plus module dynamically)
- `src/config.service.ts` - Configuration service
- `src/api/**` - All API controllers
- `src/core/abc/**` - Abstract base classes
- `src/core/engines/**` - WhatsApp engines (WEBJS, NOWEB, GOWS)
- `src/core/media/**` - Media management
- `src/core/storage/**` - Storage abstractions
- `src/apps/**` - App integrations
- All other source files

## Testing

To verify modifications:

```bash
# 1. Check version detection
npm run start:prod
# Should log: "WAHA (WhatsApp HTTP API) - Running PLUS version..."

# 2. Test multi-session
curl -X POST http://localhost:3000/api/sessions/test1/start
curl -X POST http://localhost:3000/api/sessions/test2/start
curl http://localhost:3000/api/sessions
# Should return array with both sessions

# 3. Verify Plus module
ls -la dist/plus/
# Should contain app.module.plus.js
```

## Rollback Instructions

To rollback to original WAHA Core:

```bash
# 1. Restore src/version.ts from original
git checkout origin/main -- src/version.ts

# 2. Restore src/core/manager.core.ts from original
git checkout origin/main -- src/core/manager.core.ts

# 3. Remove Plus module
rm -rf src/plus/

# 4. Rebuild
npm run build
```

## Compatibility

**WAHA MOD is compatible with**:
- All original WAHA Core features
- All existing integrations (n8n, ChatWoot, etc.)
- All engines (WEBJS, NOWEB, GOWS)
- All storage backends
- All webhook configurations

**Breaking changes**: None

**New capabilities**:
- Multi-session support
- Unlimited concurrent WhatsApp accounts
- Independent session lifecycle management

---

Last updated: 2026-01-01
