#!/bin/bash
echo "🔄 Fixing push error..."

cd ~/Cong-Cu-Cua-Toi

# Thử pull trước
echo "Pulling from GitHub..."
git fetch origin

if git pull origin main --allow-unrelated-histories 2>/dev/null; then
    echo "Pull successful"
else
    echo "Using force push..."
    git push -f origin main
fi

echo "✅ Done!"
