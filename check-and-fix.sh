#!/bin/bash
echo "🔍 Kiểm tra website..."

# Kiểm tra website
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://cong-cu-cua-toi.vercel.app)
echo "HTTP Status: $WEB_STATUS"

# Kiểm tra API
API_STATUS=$(curl -s https://cong-cu-cua-toi.vercel.app/api/health 2>/dev/null | grep -o "healthy" || echo "API_ERROR")

echo "API Status: $API_STATUS"

# Kiểm tra GitHub
cd ~/Cong-Cu-Cua-Toi 2>/dev/null && GIT_STATUS=$(git status --short) || GIT_STATUS="NO_REPO"

echo "Git Status: $GIT_STATUS"

# Fix nếu có vấn đề
if [ "$WEB_STATUS" != "200" ]; then
    echo "❌ Website không hoạt động"
    echo "👉 Vào Vercel Dashboard để redeploy"
elif [ "$API_STATUS" = "API_ERROR" ]; then
    echo "⚠️ API không hoạt động"
    echo "Đang trigger redeploy..."
    date > ~/Cong-Cu-Cua-Toi/update.txt 2>/dev/null
    cd ~/Cong-Cu-Cua-Toi && git add . && git commit -m "fix" && git push 2>/dev/null
else
    echo "✅ Website đang hoạt động"
    echo "👉 Thử Ctrl+F5 để refresh cache"
fi

echo ""
echo "📱 TRY THESE:"
echo "1. Ctrl+F5 (hard refresh)"
echo "2. https://cong-cu-cua-toi.vercel.app?t=$(date +%s) (no cache)"
echo "3. Check Vercel dashboard"
