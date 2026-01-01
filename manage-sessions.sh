#!/bin/bash

# WAHA Session Management Script
# Ganti dengan API key dan domain Anda

API_KEY="your-api-key-here"
BASE_URL="https://wa.rasain.xyz"

echo "🔍 WAHA Session Manager"
echo "======================="
echo ""

# Function: List all sessions
list_sessions() {
    echo "📋 Semua sessions yang ada:"
    curl -s -H "X-API-Key: $API_KEY" \
        "$BASE_URL/api/sessions?all=true" | jq '.'
    echo ""
}

# Function: Delete a session
delete_session() {
    local session_name=$1
    echo "🗑️  Menghapus session: $session_name"
    curl -s -X POST \
        -H "X-API-Key: $API_KEY" \
        "$BASE_URL/api/$session_name/sessions/logout" | jq '.'
    echo ""
}

# Function: Create new session
create_session() {
    local session_name=$1
    echo "✨ Membuat session baru: $session_name"
    curl -s -X POST \
        -H "X-API-Key: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$session_name\"}" \
        "$BASE_URL/api/sessions/start" | jq '.'
    echo ""
}

# Function: Get QR code
get_qr() {
    local session_name=$1
    echo "📱 QR Code untuk session: $session_name"
    echo "URL: $BASE_URL/api/$session_name/auth/qr"
    echo ""
}

# Main menu
case "$1" in
    list)
        list_sessions
        ;;
    delete)
        if [ -z "$2" ]; then
            echo "❌ Usage: $0 delete <session_name>"
            exit 1
        fi
        delete_session "$2"
        ;;
    create)
        if [ -z "$2" ]; then
            echo "❌ Usage: $0 create <session_name>"
            exit 1
        fi
        create_session "$2"
        ;;
    qr)
        if [ -z "$2" ]; then
            echo "❌ Usage: $0 qr <session_name>"
            exit 1
        fi
        get_qr "$2"
        ;;
    clean)
        echo "🧹 Menghapus SEMUA sessions..."
        sessions=$(curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/sessions?all=true" | jq -r '.[].name')
        for session in $sessions; do
            delete_session "$session"
            sleep 1
        done
        echo "✅ Selesai!"
        ;;
    *)
        echo "WAHA Session Manager"
        echo ""
        echo "Usage:"
        echo "  $0 list                    - Lihat semua sessions"
        echo "  $0 create <name>           - Buat session baru"
        echo "  $0 delete <name>           - Hapus session"
        echo "  $0 qr <name>               - Dapatkan QR code URL"
        echo "  $0 clean                   - Hapus SEMUA sessions"
        echo ""
        echo "Edit script ini dan ganti:"
        echo "  API_KEY=\"your-api-key-here\""
        echo "  BASE_URL=\"https://wa.rasain.xyz\""
        exit 1
        ;;
esac
