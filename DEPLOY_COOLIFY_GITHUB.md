# 🚀 Panduan Deploy WAHA MOD di Coolify via GitHub

Panduan lengkap step-by-step untuk deploy WAHA MOD di Coolify menggunakan GitHub repository.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah memiliki:

- ✅ Instance Coolify yang sudah running
- ✅ Akses admin ke Coolify dashboard
- ✅ Domain (opsional, untuk custom domain & SSL)
- ✅ GitHub account (untuk fork/access repository)

## 🎯 Step 1: Persiapan Repository

### Option A: Gunakan Repository Official (Recommended)

Langsung gunakan repository yang sudah tersedia:
```
https://github.com/ariaerendev/wahamod
```

### Option B: Fork Repository (Untuk Customization)

Jika ingin melakukan customization:

1. Buka https://github.com/ariaerendev/wahamod
2. Klik tombol **"Fork"** di kanan atas
3. Fork ke akun GitHub Anda sendiri
4. Gunakan URL fork Anda untuk deployment

## 🚀 Step 2: Deploy di Coolify

### 2.1 Buat Resource Baru

1. Login ke **Coolify Dashboard**
2. Pilih **Server** yang akan digunakan
3. Klik tombol **"+ New Resource"**
4. Pilih **"Docker Compose"**

### 2.2 Configure Source

Di halaman konfigurasi:

**Source Configuration:**
- **Source Type**: Git Repository
- **Repository URL**: 
  ```
  https://github.com/ariaerendev/wahamod.git
  ```
  _(atau URL fork Anda)_
- **Branch**: `main`
- **Docker Compose Location**: `docker-compose.coolify.yml`

**Build Configuration:**
- **Build Pack**: Docker Compose
- **Base Directory**: `/` (root)

### 2.3 Tunggu Build Pertama

**PENTING:** Pada deployment pertama, GitHub Actions akan auto-build Docker image:

1. Setelah konfigurasi repository, **tunggu 3-5 menit**
2. GitHub Actions akan build image di: https://github.com/ariaerendev/wahamod/actions
3. Image akan tersedia di: `ghcr.io/ariaerendev/wahamod:latest`
4. Setelah build selesai (✅ green checkmark), lanjut ke step berikutnya

**Cek Build Status:**
- Buka https://github.com/ariaerendev/wahamod/actions
- Tunggu workflow "Build and Push Docker Image" selesai
- Status harus ✅ (hijau) sebelum deploy

## ⚙️ Step 3: Configure Environment Variables

Di Coolify dashboard, tambahkan environment variables berikut:

### 3.1 Required Variables (Wajib Diubah!)

```env
# API Security - WAJIB GANTI!
WAHA_API_KEY=your-super-secret-api-key-here-min-32-chars

# Dashboard Access
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=your-secure-password-here

# Swagger Access  
WAHA_SWAGGER_USERNAME=admin
WAHA_SWAGGER_PASSWORD=your-secure-password-here
```

**🔐 Security Tips:**
- API Key minimal 32 karakter random
- Gunakan password yang kuat (huruf besar/kecil, angka, symbol)
- **JANGAN** gunakan default `admin/admin`

### 3.2 Optional Variables

```env
# Port (Coolify biasanya handle otomatis)
WAHA_PORT=3000

# Webhooks (jika diperlukan)
WHATSAPP_HOOK_URL=https://your-webhook-endpoint.com/webhook
WHATSAPP_HOOK_EVENTS=message,message.any,state.change,session.status

# Engine Selection
WHATSAPP_DEFAULT_ENGINE=WEBJS
# Options: WEBJS (stable), NOWEB (lightweight), GOWS (advanced)

# File Upload Limit
WAHA_FILE_UPLOAD_LIMIT=50mb

# Logging
WAHA_LOG_LEVEL=info
DEBUG=false

# Auto-start Session (optional)
WHATSAPP_START_SESSION=default

# Health Check
WAHA_HEALTH_MEDIA_FILES_THRESHOLD_MB=100
```

### 3.3 Cara Input di Coolify

1. Di halaman resource Anda, klik tab **"Environment Variables"**
2. Klik **"+ Add"** untuk setiap variable
3. Input **Key** dan **Value**
4. Klik **"Save"**

**Format Input:**
```
Key: WAHA_API_KEY
Value: your-super-secret-api-key-here-min-32-chars
```

## 🌐 Step 4: Configure Domain (Optional)

### 4.1 Setup Custom Domain

1. Di Coolify dashboard, buka resource Anda
2. Klik tab **"Domains"**
3. Klik **"+ Add Domain"**
4. Input domain Anda: `waha.yourdomain.com`
5. Enable **"Generate SSL Certificate"** (Let's Encrypt)
6. Klik **"Save"**

### 4.2 DNS Configuration

Di DNS provider Anda (Cloudflare, Namecheap, dll):

**A Record:**
```
Type: A
Name: waha (atau subdomain pilihan Anda)
Value: [IP Server Coolify]
TTL: Auto atau 3600
```

**Atau CNAME (jika menggunakan proxy):**
```
Type: CNAME
Name: waha
Value: server.yourdomain.com
TTL: Auto atau 3600
```

Tunggu propagasi DNS (5-30 menit).

## 🚀 Step 5: Deploy!

1. Setelah semua konfigurasi selesai
2. Di Coolify dashboard, klik tombol **"Deploy"**
3. Monitor logs di tab **"Deployment Logs"**
4. Tunggu hingga status menjadi **"Running"** ✅

**Timeline Deployment:**
- Pull repository: ~10-30 detik
- Pull Docker image dari GHCR: ~1-3 menit (tergantung koneksi)
- Start container: ~20-40 detik
- Health check: ~30 detik
- **Total: ~2-5 menit**

## ✅ Step 6: Verifikasi Deployment

### 6.1 Cek Container Status

Di Coolify logs, pastikan Anda melihat:
```
✓ Container started
✓ Health check: passing
✓ Listening on port 3000
```

### 6.2 Akses Aplikasi

**Tanpa Custom Domain:**
```
http://[IP-SERVER]:3000
```

**Dengan Custom Domain:**
```
https://waha.yourdomain.com
```

### 6.3 Test Endpoints

**1. Health Check:**
```bash
curl https://waha.yourdomain.com/health
```
Response:
```json
{"status":"ok"}
```

**2. API Version:**
```bash
curl -H "X-API-Key: your-api-key" \
  https://waha.yourdomain.com/api/version
```
Response:
```json
{
  "version": "2024.12.4",
  "tier": "PLUS",
  "browser": "chromium/131.0.6778.87"
}
```

**3. Dashboard:**
```
https://waha.yourdomain.com/dashboard
```
Login dengan credentials yang Anda set di environment variables.

**4. Swagger API Docs:**
```
https://waha.yourdomain.com/swagger
```

### 6.4 Test Multi-Session (Plus Feature!)

```bash
# Create session
curl -X POST https://waha.yourdomain.com/api/sessions/start \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "session1"}'

# Check session
curl -H "X-API-Key: your-api-key" \
  https://waha.yourdomain.com/api/sessions

# Get QR Code
curl -H "X-API-Key: your-api-key" \
  https://waha.yourdomain.com/api/session1/auth/qr
```

Jika berhasil mendapatkan QR code → **Multi-session feature UNLOCKED!** ✅

## 🔄 Maintenance & Updates

### Auto-Update dari GitHub

Setiap kali ada push baru ke repository `main`:

1. GitHub Actions auto-build image baru
2. Image baru ter-push ke GHCR dengan tag `latest`
3. Di Coolify, klik **"Redeploy"** untuk pull image terbaru
4. Coolify akan restart container dengan image baru

### Manual Redeploy

Di Coolify dashboard:
1. Buka resource Anda
2. Klik tombol **"Redeploy"**
3. Tunggu pull + restart selesai

### Rollback

Jika ada masalah setelah update:
1. Di GitHub Actions, cari build sebelumnya yang stable
2. Copy SHA commit: contoh `6d6d9ac`
3. Di Coolify, ubah image tag:
   ```
   ghcr.io/ariaerendev/wahamod:main-6d6d9ac
   ```
4. Redeploy

## 🔐 Security Best Practices

### 1. Ganti Semua Default Credentials

```bash
# Generate API key yang kuat
openssl rand -base64 32

# Generate random password
openssl rand -base64 24
```

### 2. Aktifkan SSL/HTTPS

- Gunakan custom domain
- Enable auto-SSL di Coolify
- Force HTTPS redirect

### 3. Restrict API Access

Di Coolify, tambahkan environment:
```env
# IP Whitelist (optional)
WAHA_ALLOWED_IPS=1.2.3.4,5.6.7.8

# Rate limiting (via reverse proxy)
```

### 4. Regular Backups

Backup Docker volumes:
```bash
# Di server Coolify
docker run --rm \
  -v wahamod_waha_sessions:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/waha-sessions-backup.tar.gz -C /data .
```

## 🐛 Troubleshooting

### Issue 1: Image Pull Failed

**Error:**
```
Error: pull access denied for ghcr.io/ariaerendev/wahamod
```

**Solution:**
1. Cek GitHub Actions build status
2. Pastikan workflow sudah selesai (✅ green)
3. Tunggu 1-2 menit setelah build selesai
4. Coba redeploy lagi

### Issue 2: Container Start Failed

**Error:**
```
Error: Container exited with code 1
```

**Solution:**
1. Cek logs di Coolify: tab "Logs"
2. Pastikan environment variables sudah benar
3. Cek `WAHA_API_KEY` tidak kosong
4. Restart container

### Issue 3: Health Check Failing

**Error:**
```
Health check: failing
```

**Solution:**
1. Tunggu 60-90 detik (startup time)
2. Cek port mapping (3000:3000)
3. Cek logs untuk error messages
4. Restart jika perlu

### Issue 4: QR Code Not Showing

**Solution:**
1. Set environment:
   ```env
   WAHA_PRINT_QR=true
   WHATSAPP_START_SESSION=default
   ```
2. Cek logs untuk QR code (text format)
3. Atau akses: `/api/session-name/auth/qr`

### Issue 5: Can't Create Multiple Sessions

**Verify Plus Features Unlocked:**
```bash
curl -H "X-API-Key: your-api-key" \
  https://waha.yourdomain.com/api/version
```

Response harus menunjukkan:
```json
{"tier": "PLUS"}
```

Jika masih "CORE", image belum ter-update. Tunggu GitHub Actions build selesai.

## 📊 Monitoring

### View Logs

**Real-time logs di Coolify:**
1. Buka resource Anda
2. Tab "Logs"
3. Enable "Auto-refresh"

**Via SSH ke server:**
```bash
docker logs -f [container-id]
```

### Check Resource Usage

Di Coolify dashboard:
- CPU usage
- Memory usage
- Network traffic
- Disk usage

### Metrics Endpoint

```bash
curl -H "X-API-Key: your-api-key" \
  https://waha.yourdomain.com/api/server/status
```

## 📚 Resources

- **Repository:** https://github.com/ariaerendev/wahamod
- **GitHub Actions:** https://github.com/ariaerendev/wahamod/actions
- **Docker Image:** https://ghcr.io/ariaerendev/wahamod:latest
- **WAHA Docs:** https://waha.devlike.pro
- **Coolify Docs:** https://coolify.io/docs

## 🎉 Deployment Checklist

Gunakan checklist ini untuk memastikan deployment sukses:

- [ ] Repository URL sudah benar
- [ ] Branch `main` selected
- [ ] GitHub Actions build selesai (✅ green)
- [ ] Environment variables configured
- [ ] `WAHA_API_KEY` diganti (min 32 chars)
- [ ] Dashboard credentials diganti
- [ ] Swagger credentials diganti
- [ ] Domain configured (optional)
- [ ] SSL enabled (optional)
- [ ] Deployment sukses (status: Running)
- [ ] Health check passing
- [ ] `/health` endpoint responding
- [ ] `/api/version` shows `"tier": "PLUS"`
- [ ] Dashboard accessible
- [ ] Swagger accessible
- [ ] Multi-session test passed
- [ ] QR code generation working
- [ ] Backups configured

---

## 🎊 Selamat! WAHA MOD Anda Sudah Running

**Access Points:**
- **Dashboard:** https://waha.yourdomain.com/dashboard
- **Swagger:** https://waha.yourdomain.com/swagger
- **API:** https://waha.yourdomain.com/api
- **Health:** https://waha.yourdomain.com/health

**Features Unlocked:**
- ✅ Unlimited sessions
- ✅ Multi-session management
- ✅ Persistent storage
- ✅ Advanced media handling
- ✅ All Plus features

**Support:**
- Issues: https://github.com/ariaerendev/wahamod/issues
- Original WAHA: https://waha.devlike.pro

Happy automating! 🚀📱
