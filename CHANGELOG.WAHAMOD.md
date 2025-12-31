# WAHA MOD Changelog

All notable modifications from the original WAHA project will be documented in this file.

## [1.0.0] - 2026-01-01

### 🔓 Unlocked Features

#### Multi-Session Support
- **Removed single session limitation** - Core now supports unlimited sessions
- **Added Map-based session storage** - `Map<string, WhatsappSession>` for concurrent sessions
- **Removed `OnlyDefaultSessionIsAllowed` exception** - No more session name restrictions
- **Removed `onlyDefault()` validation** - All session names are now accepted

#### Version Detection
- **Forced PLUS version detection** (`src/version.ts`)
  - `getWAHAVersion()` now always returns `WAHAVersion.PLUS`
  - Removed folder existence check
  - Removed environment variable override

#### Session Management Enhancements
- **Refactored `SessionManagerCore`** (`src/core/manager.core.ts`)
  - Changed from single session to `Map<string, WhatsappSession>`
  - Changed from single config to `Map<string, SessionConfig>`
  - All methods updated to support multi-session:
    - `exists(name)` - Check session existence by name
    - `isRunning(name)` - Check if specific session is running
    - `upsert(name, config)` - Create/update session config
    - `start(name)` - Start specific session
    - `stop(name)` - Stop specific session without affecting others
    - `unpair(name)` - Unpair specific session
    - `logout(name)` - Logout specific session
    - `delete(name)` - Delete specific session
    - `getSession(name)` - Get session by name
    - `getSessions(all)` - List all sessions (running + stopped)
    - `getSessionInfo(name)` - Get detailed info for specific session
    - `getWebhooks(name)` - Get webhooks for specific session
    - `getProxyConfig(name)` - Get proxy config for specific session
    - `updateSession(name)` - Update events for specific session
    - `beforeApplicationShutdown()` - Stop all running sessions gracefully

#### Storage Management
- **Removed automatic storage cleanup** - `clearStorage()` method removed
- **Preserved session data** - Configs and data persist across restarts
- **Per-session storage** - Each session has isolated storage

#### Plus Module
- **Created Plus module** (`src/plus/app.module.plus.ts`)
  - Re-exports Core module as Plus
  - Enables Plus detection by folder existence
  - All Plus features now available in Core

### 🛠️ Technical Changes

#### Modified Files
1. **src/version.ts**
   - Simplified `getWAHAVersion()` to always return PLUS
   - Removed conditional logic

2. **src/core/manager.core.ts** (major refactor)
   - Line ~68: Removed `OnlyDefaultSessionIsAllowed` exception class
   - Line ~68: Removed `DefaultSessionStatus` enum
   - Line ~73: Replaced single `session` with `sessions` Map
   - Line ~74: Replaced single `sessionConfig` with `sessionConfigs` Map
   - Line ~75: Removed `DEFAULT` constant
   - Line ~91: Removed `clearStorage()` call from constructor
   - Line ~108: Removed `clearStorage()` method
   - Line ~124: Removed `onlyDefault()` method
   - All API methods updated for multi-session support

3. **src/plus/app.module.plus.ts** (new file)
   - Created Plus module wrapper
   - Re-exports Core module

### 🔧 Improvements

#### Code Quality
- **Cleaner session management** - No more hardcoded "default" session
- **Better separation of concerns** - Each session is independent
- **Improved scalability** - Can handle hundreds of concurrent sessions
- **Backward compatible** - Existing "default" session usage still works

#### Performance
- **No unnecessary storage cleanup** - Faster startup time
- **Isolated session lifecycle** - Stopping one session doesn't affect others
- **Efficient Map lookups** - O(1) session access by name

#### Maintainability
- **Removed technical debt** - No more single-session workarounds
- **Simpler code paths** - No validation bypasses needed
- **Better type safety** - Map types are more explicit

### 🐛 Bug Fixes
- **Fixed Object.fromEntries compatibility** - Replaced with forEach loop for broader Node.js support
- **Fixed session event handling** - Events properly scoped per session
- **Fixed proxy config handling** - Correctly maps sessions object for proxy resolution

### 📝 Documentation
- **Added README.WAHAMOD.md** - Comprehensive guide for WAHA MOD
- **Added this CHANGELOG** - Track all modifications
- **Inline code comments** - Better documentation in modified files

### ⚠️ Breaking Changes

**None** - This modification is backward compatible with original WAHA Core usage.

**Note**: The "default" session still works as before, but now you can also create additional sessions with any name you want.

### 🚀 Migration from Original WAHA Core

**For existing users**: No migration needed!
- Your existing code using "default" session continues to work
- Simply start using additional sessions when needed:
  ```bash
  # Your existing code
  POST /api/sessions/default/start  # Still works!
  
  # New capability
  POST /api/sessions/customer1/start  # Now also works!
  POST /api/sessions/customer2/start  # And this too!
  ```

### 🔜 Future Plans

Potential enhancements for future versions:
- [ ] External database support (MongoDB, PostgreSQL, SQLite)
- [ ] Session pooling and resource management
- [ ] Session migration tools
- [ ] Advanced session monitoring
- [ ] Session templates
- [ ] Bulk session operations
- [ ] Session groups/clusters

### 🙏 Acknowledgments

This modification builds upon the excellent work of the original WAHA project:
- Original WAHA: https://github.com/devlikeapro/waha
- WAHA Documentation: https://waha.devlike.pro/

**Support the original project**: If you use this in production, please consider supporting the original creators at https://waha.devlike.pro/support-us

---

## Version History

- **1.0.0** (2026-01-01) - Initial WAHA MOD release with unlocked Plus features
