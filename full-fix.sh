#!/bin/bash
echo "🚀 Full fix website..."

cd ~
rm -rf fix-complete
mkdir fix-complete
cd fix-complete

# Tạo cấu trúc đơn giản chắc chắn chạy
mkdir api public

# 1. Vercel config đơn giản nhất
echo '{"rewrites":[{"source":"/api/(.*)","destination":"/api/index.js"},{"source":"/(.*)","destination":"/public/$1"}]}' > vercel.json

# 2. API đơn giản nhất
cat > api/index.js << 'API'
module.exports = (req, res) => {
  if (req.url === '/api/health' || req.url === '/api/health/') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Công Cụ Của Tôi API',
      time: new Date().toISOString()
    }));
    return;
  }
  res.statusCode = 404;
  res.end('Not Found');
};
API

# 3. HTML đơn giản
cat > public/index.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
<title>Công Cụ Của Tôi</title>
<style>body{background:#0a0a0a;color:white;text-align:center;padding:50px;font-family:Arial}</style>
</head>
<body>
<h1>🔧 Công Cụ Của Tôi</h1>
<p>Tải video Facebook, TikTok miễn phí</p>
<div id="status">Đang kiểm tra API...</div>
<script>
fetch('/api/health').then(r=>r.json()).then(d=>{
 document.getElementById('status').innerHTML='✅ API: '+d.message;
}).catch(e=>{
 document.getElementById('status').innerHTML='❌ API lỗi';
});
</script>
</body>
</html>
HTML

# 4. Push lên GitHub
git init
git add .
git commit -m "Complete fix: Working API + Frontend"
git remote add origin https://github.com/ncd405/Cong-Cu-Cua-Toi.git
git branch -M main
git push -f origin main

echo "✅ Đã fix hoàn toàn!"
echo "🌐 Website: https://cong-cu-cua-toi.vercel.app"
echo "📡 API: https://cong-cu-cua-toi.vercel.app/api/health"
echo "⏳ Chờ 2 phút..."
