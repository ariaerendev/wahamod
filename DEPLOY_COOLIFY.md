# 🚀 Deploy WAHA MOD to Coolify

Complete guide to deploy WAHA MOD on Coolify using Docker Compose.

## 📋 Prerequisites

Before deploying, make sure you have:

- ✅ Coolify instance installed and running
- ✅ Domain name (optional, but recommended)
- ✅ SSL certificate (Coolify can auto-generate with Let's Encrypt)

## 🎯 Deployment Options

### Option 1: Deploy from GitHub (Recommended)

This is the easiest method and allows automatic updates.

#### Step 1: Push to GitHub

```bash
# If you haven't already
cd /mnt/92A816A5A81687BD/waha
git remote add origin https://github.com/YOUR_USERNAME/wahamod.git
git push -u origin main
```

#### Step 2: Create Project in Coolify

1. Login to your Coolify instance
2. Click **"+ New"** → **"Resource"**
3. Select **"Docker Compose"**
4. Choose your server

#### Step 3: Configure Docker Compose

1. **Source**: Select "GitHub" or "Git Repository"
2. **Repository**: Enter your GitHub repo URL
   ```
   https://github.com/YOUR_USERNAME/wahamod.git
   ```
3. **Branch**: `main`
4. **Docker Compose Location**: `docker-compose.coolify.yml`

#### Step 4: Configure Environment Variables

In Coolify, add these environment variables:

```env
# REQUIRED - Change this!
WAHA_API_KEY=your-super-secret-api-key-here

# Optional - Port (Coolify will handle this)
WAHA_PORT=3000

# Dashboard credentials (Change these!)
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=your-secure-password

# Swagger credentials (Change these!)
WAHA_SWAGGER_USERNAME=admin
WAHA_SWAGGER_PASSWORD=your-secure-password

# Webhooks (if needed)
WHATSAPP_HOOK_URL=https://your-webhook-url.com/webhook
WHATSAPP_HOOK_EVENTS=message,message.any,state.change

# Engine selection
WHATSAPP_DEFAULT_ENGINE=WEBJS
```

#### Step 5: Configure Domain (Optional)

1. In Coolify, go to your application
2. Click **"Domains"**
3. Add your domain: `waha.yourdomain.com`
4. Enable **"Auto SSL"** for automatic HTTPS

#### Step 6: Deploy

1. Click **"Deploy"**
2. Wait for the build and deployment to complete
3. Access your WAHA MOD instance!

---

### Option 2: Deploy with Docker Image

If you don't want to use GitHub, deploy directly from Docker Hub.

#### Step 1: Create Docker Compose in Coolify

1. Login to Coolify
2. Click **"+ New"** → **"Resource"**
3. Select **"Docker Compose"**
4. Choose your server

#### Step 2: Paste Docker Compose

Copy and paste this docker-compose configuration:

```yaml
version: '3.8'

services:
  waha:
    image: devlikeapro/waha:latest
    container_name: wahamod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - WAHA_API_KEY=${WAHA_API_KEY}
      - WAHA_DASHBOARD_ENABLED=true
      - WAHA_DASHBOARD_USERNAME=${WAHA_DASHBOARD_USERNAME}
      - WAHA_DASHBOARD_PASSWORD=${WAHA_DASHBOARD_PASSWORD}
      - WAHA_SWAGGER_ENABLED=true
      - WAHA_SWAGGER_USERNAME=${WAHA_SWAGGER_USERNAME}
      - WAHA_SWAGGER_PASSWORD=${WAHA_SWAGGER_PASSWORD}
      - WHATSAPP_DEFAULT_ENGINE=WEBJS
      - WAHA_PRINT_QR=true
    volumes:
      - waha_sessions:/app/.sessions
      - waha_media:/app/.media
      - waha_browser:/app/.wwebjs_auth
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  waha_sessions:
  waha_media:
  waha_browser:
```

#### Step 3: Configure Environment Variables

Add the same environment variables as Option 1.

#### Step 4: Deploy

Click **"Deploy"** and wait for completion.

---

## 🔧 Post-Deployment Configuration

### 1. Access WAHA MOD

After deployment, access your instance:

- **Dashboard**: `https://waha.yourdomain.com/dashboard`
- **Swagger API**: `https://waha.yourdomain.com/swagger`
- **API Endpoint**: `https://waha.yourdomain.com/api`

### 2. Test the API

```bash
# Check version
curl https://waha.yourdomain.com/api/version \
  -H "X-Api-Key: your-api-key"

# Start a session
curl -X POST https://waha.yourdomain.com/api/sessions/mysession/start \
  -H "X-Api-Key: your-api-key" \
  -H "Content-Type: application/json"

# Get QR Code
curl https://waha.yourdomain.com/api/sessions/mysession/auth/qr \
  -H "X-Api-Key: your-api-key"
```

### 3. Scan QR Code

1. Go to Dashboard: `https://waha.yourdomain.com/dashboard`
2. Login with your credentials
3. Start a session
4. Scan QR code with WhatsApp

---

## 📊 Monitoring & Management

### View Logs in Coolify

1. Go to your application in Coolify
2. Click **"Logs"** tab
3. View real-time logs

### Check Health Status

```bash
curl https://waha.yourdomain.com/health
```

### Restart Service

In Coolify:
1. Go to your application
2. Click **"Restart"**

---

## 🔄 Updates & Maintenance

### Auto-Update with GitHub

If you deployed from GitHub:
1. Push updates to your repository
2. In Coolify, click **"Redeploy"**
3. Coolify will pull latest changes and redeploy

### Manual Update

If using Docker image:
1. Update the image tag in docker-compose
2. Click **"Redeploy"** in Coolify

### Backup Data

Your data is stored in Docker volumes:
- `waha_sessions` - Session data
- `waha_media` - Media files
- `waha_browser` - Browser data

To backup, use Coolify's backup feature or manually backup volumes:

```bash
# Backup sessions
docker run --rm -v waha_sessions:/data -v $(pwd):/backup \
  alpine tar czf /backup/sessions-backup.tar.gz -C /data .

# Backup media
docker run --rm -v waha_media:/data -v $(pwd):/backup \
  alpine tar czf /backup/media-backup.tar.gz -C /data .
```

---

## 🔐 Security Best Practices

### 1. Change Default Credentials

Always change default passwords:
- `WAHA_API_KEY` - Your API key
- `WAHA_DASHBOARD_PASSWORD` - Dashboard password
- `WAHA_SWAGGER_PASSWORD` - Swagger password

### 2. Use HTTPS

Enable SSL in Coolify:
1. Add your domain
2. Enable "Auto SSL"
3. Force HTTPS redirect

### 3. Restrict Access

Use Coolify's firewall features to restrict access:
- Whitelist your IP addresses
- Use VPN for admin access
- Enable fail2ban

### 4. Regular Backups

Schedule automatic backups in Coolify:
1. Go to "Backups" section
2. Enable automatic backups
3. Set backup frequency

---

## 🐛 Troubleshooting

### Container Won't Start

**Check logs:**
```bash
# In Coolify, view logs or use Docker
docker logs wahamod
```

**Common issues:**
- Port already in use → Change `WAHA_PORT`
- Missing API key → Set `WAHA_API_KEY`
- Volume permissions → Check volume mounts

### Can't Access Dashboard

1. Check if port is exposed correctly
2. Verify domain configuration
3. Check firewall rules
4. Ensure credentials are correct

### QR Code Not Showing

1. Check `WAHA_PRINT_QR=true` in environment
2. View container logs for QR code
3. Use Dashboard to view QR instead

### Session Not Persisting

1. Check volume mounts are configured
2. Verify `waha_sessions` volume exists
3. Check disk space

### High Memory Usage

WEBJS engine uses Chrome, which can consume memory:
- Use `WHATSAPP_DEFAULT_ENGINE=NOWEB` for lower memory
- Increase container memory limit in Coolify
- Limit number of concurrent sessions

---

## 📈 Scaling

### Horizontal Scaling

For high traffic, deploy multiple instances:

1. Deploy multiple WAHA MOD instances
2. Use load balancer (Coolify supports this)
3. Each instance handles different sessions

### Vertical Scaling

Increase resources in Coolify:
1. Go to application settings
2. Increase CPU/Memory limits
3. Restart container

---

## 🆘 Support

### Issues?

- Check [WAHA Docs](https://waha.devlike.pro/docs/overview/introduction/)
- View [Troubleshooting Guide](https://waha.devlike.pro/docs/how-to/troubleshooting/)
- Check container logs in Coolify

### Configuration Examples

See `docker-compose.coolify.yml` for full configuration options.

---

## ✅ Deployment Checklist

- [ ] Coolify instance ready
- [ ] Repository pushed to GitHub (if using Option 1)
- [ ] Environment variables configured
- [ ] API key set (changed from default)
- [ ] Dashboard credentials changed
- [ ] Swagger credentials changed
- [ ] Domain configured (optional)
- [ ] SSL enabled (optional)
- [ ] Deployed successfully
- [ ] Health check passing
- [ ] Dashboard accessible
- [ ] API responding
- [ ] QR code scanned
- [ ] Session working
- [ ] Backups configured

---

**🎉 Your WAHA MOD is now running on Coolify!**

Access:
- Dashboard: `https://waha.yourdomain.com/dashboard`
- Swagger: `https://waha.yourdomain.com/swagger`
- API: `https://waha.yourdomain.com/api`

Happy WhatsApp automating! 🚀
