# 🔧 Fix Ghost Sessions - Session Exist Tapi Tidak Muncul di Dashboard

## Masalah

Error: `Session 'debg' already exists` tapi session tidak terlihat di dashboard.

**Penyebab:** Session tersimpan di storage (`/app/.sessions/`) tapi tidak running/active.

## Solusi

### Opsi 1: Clean Via Coolify Dashboard (Recommended)

1. **Stop Container:**
   - Buka Coolify dashboard
   - Klik tombol **"Stop"**
   - Tunggu hingga container benar-benar stop

2. **Clean Sessions Folder:**
   
   **Via Coolify Terminal:**
   - Klik tab **"Terminal"**
   - Jalankan command:
     ```bash
     # Cari container ID
     docker ps -a | grep wahamod
     
     # Hapus session files
     docker exec <container-id> rm -rf /app/.sessions/*
     
     # Atau hapus volume mount di host
     rm -rf ./sessions/*
     ```

   **Via SSH ke Server:**
   ```bash
   # Masuk ke folder project
   cd /path/to/wahamod
   
   # Hapus semua session files
   rm -rf ./sessions/*
   ```

3. **Start Container:**
   - Klik tombol **"Start"**
   - Tunggu container running

4. **Buat Session Baru:**
   - Sekarang bisa buat session dengan nama apapun
   - Session akan fresh, tidak ada ghost sessions

### Opsi 2: Via Script (Jika Punya SSH Access)

Upload `clean-ghost-sessions.sh` ke server, lalu:

```bash
chmod +x clean-ghost-sessions.sh
./clean-ghost-sessions.sh
```

### Opsi 3: Force Delete Via API

Kadang session "exist" tapi API endpoint `/sessions/logout` tidak bekerja karena session tidak running.

**Workaround:**

1. **Cek semua sessions (including inactive):**
   ```bash
   curl -H "X-API-Key: your-key" \
     https://wa.rasain.xyz/api/sessions?all=true
   ```

2. **Jika session muncul, coba stop dulu:**
   ```bash
   curl -X POST -H "X-API-Key: your-key" \
     https://wa.rasain.xyz/api/debg/sessions/stop
   ```

3. **Lalu logout (delete):**
   ```bash
   curl -X POST -H "X-API-Key: your-key" \
     https://wa.rasain.xyz/api/debg/sessions/logout
   ```

4. **Jika masih gagal, restart container:**
   - Di Coolify: Stop → Start
   - Atau: `docker restart <container-id>`

### Opsi 4: Fresh Install (Nuclear Option)

Jika semua cara di atas gagal:

1. **Backup data penting** (jika ada)
2. **Stop container** di Coolify
3. **Hapus volumes:**
   ```bash
   rm -rf ./sessions/*
   rm -rf ./media/*
   ```
4. **Redeploy** di Coolify
5. **Buat sessions baru** - sekarang pasti bersih

## Pencegahan

Untuk mencegah ghost sessions di masa depan:

### 1. Selalu Stop Session Dengan Benar

**BENAR:**
```bash
# Stop session dulu
curl -X POST -H "X-API-Key: your-key" \
  https://wa.rasain.xyz/api/session-name/sessions/stop

# Baru logout
curl -X POST -H "X-API-Key: your-key" \
  https://wa.rasain.xyz/api/session-name/sessions/logout
```

**SALAH:**
- Restart container tanpa stop sessions
- Force kill container

### 2. Gunakan Session Management Script

Gunakan script `manage-sessions.sh` yang sudah saya buat:

```bash
# Edit API_KEY dan BASE_URL dulu
nano manage-sessions.sh

# List sessions
./manage-sessions.sh list

# Delete dengan benar
./manage-sessions.sh delete session-name

# Clean all (hati-hati!)
./manage-sessions.sh clean
```

### 3. Monitor Storage

Cek storage sessions secara berkala:

```bash
# Via host
ls -lah ./sessions/

# Via container
docker exec <container-id> ls -lah /app/.sessions/
```

Jika ada folder session tapi tidak active → ghost session → perlu dibersihkan.

## FAQ

**Q: Kenapa ghost sessions bisa terjadi?**
A: Biasanya karena:
- Container restart mendadak (crash, killed, out of memory)
- Stop container tanpa proper session shutdown
- Network issue saat session sedang initialize

**Q: Aman tidak hapus folder ./sessions/?**
A: Aman, tapi konsekuensinya:
- ❌ Semua session logout (perlu scan QR lagi)
- ❌ Chat history hilang (jika tidak pakai database external)
- ✅ Fresh start, tidak ada ghost sessions

**Q: Cara backup sessions sebelum clean?**
A:
```bash
# Backup
tar czf sessions-backup-$(date +%Y%m%d).tar.gz ./sessions/

# Restore (jika perlu)
tar xzf sessions-backup-20260101.tar.gz
```

**Q: Apakah multi-session masih berfungsi setelah clean?**
A: Ya! Multi-session tetap berfungsi. Ghost sessions hanya masalah storage, bukan masalah kode.

## Test Setelah Clean

Setelah clean ghost sessions, test:

```bash
# 1. Buat session baru
curl -X POST https://wa.rasain.xyz/api/sessions/start \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "test1"}'

# 2. Cek muncul di list
curl -H "X-API-Key: your-key" \
  https://wa.rasain.xyz/api/sessions

# 3. Buat session kedua
curl -X POST https://wa.rasain.xyz/api/sessions/start \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "test2"}'

# 4. Cek ada 2 sessions
curl -H "X-API-Key: your-key" \
  https://wa.rasain.xyz/api/sessions
```

Jika berhasil → Multi-session fully functional! ✅

---

**Rekomendasi:** Gunakan Opsi 1 (Clean via Coolify) karena paling mudah dan aman.
