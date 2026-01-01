#!/bin/bash
# Quick check if WAHA Plus is active

echo "🔍 Checking WAHA tier..."
curl -s https://wa.rasain.xyz/api/version | jq '.tier'

echo -e "\n📊 Expected: \"PLUS\""
echo "📊 Current Core shows: \"CORE\""
