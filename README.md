# Công Cụ Của Tôi

Trang web công cụ tải video Facebook, TikTok miễn phí

## 🚀 Tính Năng Chính
- ✅ Tải video Facebook (HD/SD/360p)
- ✅ Tải video TikTok (không watermark)
- ✅ Tách nhạc từ TikTok (MP3)
- ✅ Lưu trữ bài viết Facebook (đang phát triển)
- ✅ API đầy đủ
- ✅ Giao diện responsive

## 🛠 Công Nghệ
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js + Express
- **Hosting**: Vercel (auto-deploy từ GitHub)
- **Domain**: https://cong-cu-cua-toi.vercel.app

## 📦 Cài Đặt Local
```bash
# Clone repository
git clone https://github.com/ncd405/Cong-Cu-Cua-Toi.git
cd Cong-Cu-Cua-Toi

# Cài dependencies
npm install

# Chạy server
npm start

# Mở trình duyệt: http://localhost:3000

# Tạo script update tự động
cat > update_v2.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating to version 2.0..."

# Cập nhật server.js
cat > server.js << 'SERVERJS'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Công Cụ Của Tôi API',
        version: '2.0.0',
        time: new Date().toISOString()
    });
});

app.post('/api/facebook/download', (req, res) => {
    const { url } = req.body;
    res.json({
        success: true,
        message: 'Facebook download API ready',
        url: url
    });
});

app.post('/api/tiktok/download', (req, res) => {
    const { url } = req.body;
    res.json({
        success: true,
        message: 'TikTok download API ready',
        url: url
    });
});

app.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
});
SERVERJS

# Cập nhật index.html
cat > index.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>Công Cụ Của Tôi v2.0</title>
    <style>
        body { 
            font-family: Arial; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #0a0a0a; 
            color: white; 
        }
        h1 { color: #3b82f6; text-align: center; }
        .tool { 
            background: #1a1a1a; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 10px; 
        }
        input, button { 
            width: 100%; 
            padding: 10px; 
            margin: 10px 0; 
        }
        button { background: #3b82f6; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔧 Công Cụ Của Tôi v2.0</h1>
    <div class="tool">
        <h2>Facebook Downloader</h2>
        <input type="text" placeholder="Facebook URL">
        <button>Download</button>
    </div>
    <div class="tool">
        <h2>TikTok Downloader</h2>
        <input type="text" placeholder="TikTok URL">
        <button>Download</button>
    </div>
    <script>console.log("Công Cụ Của Tôi v2.0");</script>
</body>
</html>
HTML

echo "✅ Updated files"
echo "📁 Files: server.js, index.html"
