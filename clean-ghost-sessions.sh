#!/bin/bash

# Clean Ghost Sessions - Hapus session files yang tidak aktif
# Jalankan script ini di server Coolify

echo "🧹 WAHA Ghost Session Cleaner"
echo "=============================="
echo ""

# Cari container ID WAHA
CONTAINER_ID=$(docker ps --filter "ancestor=ghcr.io/ariaerendev/wahamod:latest" --format "{{.ID}}")

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Container WAHA tidak ditemukan!"
    echo "Pastikan container sedang running."
    exit 1
fi

echo "✅ Container ID: $CONTAINER_ID"
echo ""

# Lihat isi folder .sessions
echo "📂 Isi folder .sessions di container:"
docker exec $CONTAINER_ID ls -lah /app/.sessions/
echo ""

# Option 1: Hapus semua session files
read -p "⚠️  Hapus SEMUA session files? (y/N): " confirm
if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo "🗑️  Menghapus semua session files..."
    docker exec $CONTAINER_ID rm -rf /app/.sessions/*
    echo "✅ Session files terhapus!"
    echo ""
    echo "🔄 Restart container untuk apply changes:"
    echo "   docker restart $CONTAINER_ID"
else
    echo "❌ Dibatalkan."
fi

echo ""
echo "💡 Tips:"
echo "   - Setelah clean, buat session baru dengan nama berbeda"
echo "   - Atau restart container dulu baru buat session"
