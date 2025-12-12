#!/bin/bash
echo "🔄 Fixing empty repository issue..."

cd ~/Cong-Cu-Cua-Toi

# Xóa và tạo lại từ đầu
cd ~
rm -rf fix-project
mkdir fix-project
cd fix-project

# Tạo file đơn giản
echo "# Công Cụ Của Tôi" > README.md
echo "Website: https://cong-cu-cua-toi.vercel.app" >> README.md

# Khởi tạo git
git init
git add README.md
git commit -m "First commit"

# Tạo branch main
git branch -M main

# Kết nối với GitHub
git remote add origin https://github.com/ncd405/Cong-Cu-Cua-Toi.git

# Force push
git push -f origin main

echo "✅ Đã tạo repository mới!"
echo "🌐 GitHub: https://github.com/ncd405/Cong-Cu-Cua-Toi"
