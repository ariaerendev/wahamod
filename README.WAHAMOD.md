# WAHA MOD - WhatsApp HTTP API (Unlocked Edition)

**WAHA MOD** is a modified version of [WAHA (WhatsApp HTTP API)](https://github.com/devlikeapro/waha) with all Plus features unlocked and available for free.

## ⚠️ Disclaimer

This is an unofficial modification of WAHA for educational and research purposes only. This project is not affiliated with, endorsed by, or connected to the original WAHA project or its creators.

**Important Notes:**
- This modification removes commercial limitations from the original WAHA software
- Use at your own risk - no warranty or support provided
- For commercial use, please support the original project at [waha.devlike.pro](https://waha.devlike.pro/support-us)
- WhatsApp does not allow unofficial clients, so use responsibly

## 🔓 What's Unlocked?

All WAHA Plus features are now available without restrictions:

### ✅ Multi-Session Support
- Run **unlimited WhatsApp sessions** simultaneously
- No more "default session only" limitation
- Each session runs independently with its own storage

### ✅ Advanced Storage
- Multi-session persistent storage
- No automatic storage cleanup on boot
- Session configs are preserved

### ✅ All Plus Features
- Multi-session orchestration
- Richer media handling
- External storage integrations (ready for MongoDB, PostgreSQL, SQLite)
- Advanced session management

## 🚀 Quick Start

### Prerequisites
- Docker installed on your system
- Node.js 22.x (for local development)
- Yarn 3.6+ (for local development)

### Using Docker (Recommended)

```bash
# Pull the image
docker pull devlikeapro/waha

# Run WAHA MOD
docker run -it -p 3000:3000 --name waha-mod devlikeapro/waha
```

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/wahamod.git
cd wahamod

# Install dependencies
npm install
# or
yarn install

# Build
npm run build
# or
yarn build

# Run
npm run start:prod
# or
yarn start:prod
```

## 📖 Usage

### Start Multiple Sessions

```bash
# Start session 1
curl -X POST http://localhost:3000/api/sessions/session1/start

# Start session 2
curl -X POST http://localhost:3000/api/sessions/session2/start

# Start session N
curl -X POST http://localhost:3000/api/sessions/customer-123/start
```

### Send Messages

```bash
curl -X POST http://localhost:3000/api/sendText \
  -H "Content-Type: application/json" \
  -d '{
    "session": "session1",
    "chatId": "1234567890@c.us",
    "text": "Hello from WAHA MOD!"
  }'
```

### List All Sessions

```bash
curl http://localhost:3000/api/sessions
```

### Stop a Session

```bash
curl -X POST http://localhost:3000/api/sessions/session1/stop
```

## 📚 Documentation

For detailed API documentation, visit:
- **Swagger UI**: http://localhost:3000/swagger
- **Dashboard**: http://localhost:3000/dashboard
- **Original WAHA Docs**: https://waha.devlike.pro/docs/overview/introduction/

## 🔧 Configuration

All original WAHA configuration options are supported. See [WAHA Configuration](https://waha.devlike.pro/docs/how-to/config/) for details.

## 🏗️ Technical Details

### Changes from Original WAHA Core

1. **Version Detection Override** (`src/version.ts`)
   - `getWAHAVersion()` always returns `WAHAVersion.PLUS`
   - No more folder or environment variable checks

2. **Multi-Session Architecture** (`src/core/manager.core.ts`)
   - Replaced single session storage with `Map<string, WhatsappSession>`
   - Removed `OnlyDefaultSessionIsAllowed` exception
   - Removed `onlyDefault()` validation method
   - All session methods now support multiple concurrent sessions

3. **Plus Module** (`src/plus/app.module.plus.ts`)
   - Created Plus module that re-exports Core module
   - System detects PLUS version due to `/plus` folder existence

4. **Storage Management**
   - Disabled automatic storage cleanup on boot
   - Session configs are preserved across restarts
   - Each session has isolated storage

### Architecture

```
┌─────────────────────────────────────┐
│         WAHA MOD (Plus)             │
├─────────────────────────────────────┤
│  SessionManagerCore (Enhanced)      │
│  ├── sessions: Map<name, Session>   │
│  ├── sessionConfigs: Map<name, Cfg> │
│  └── Multi-session support          │
├─────────────────────────────────────┤
│  Core Features + Plus Features      │
│  ├── HTTP/REST API                  │
│  ├── WebSocket Support              │
│  ├── Webhooks                       │
│  ├── Media Management               │
│  ├── Group Management               │
│  ├── Status & Channels              │
│  └── Unlimited Sessions ✨          │
└─────────────────────────────────────┘
```

## 🤝 Contributing

This is a community project. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚖️ License

This project inherits the license from the original WAHA project (Apache 2.0).

**Important**: The original WAHA Plus is a commercial product. This modification is for educational purposes. For production use, please consider supporting the original project at https://waha.devlike.pro/support-us.

## 🙏 Credits

- Original WAHA Project: https://github.com/devlikeapro/waha
- WAHA Documentation: https://waha.devlike.pro/
- Created with ❤️ for the community

## 📞 Support

For issues and questions about WAHA MOD:
- Open an issue on GitHub
- For original WAHA features, refer to the [official documentation](https://waha.devlike.pro/docs/overview/introduction/)

**Note**: This is a community project. For official support, use the original WAHA project.

---

**Made with 💻 by the community** | **Star ⭐ if you find it useful!**
