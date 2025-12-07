const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Công Cụ Của Tôi API đang hoạt động',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            facebook: '/api/facebook/download',
            tiktok: '/api/tiktok/download',
            audio: '/api/tiktok/audio'
        }
    });
});

// Facebook Download API
app.post('/api/facebook/download', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'Vui lòng cung cấp URL video Facebook'
        });
    }
    
    res.json({
        success: true,
        message: 'Đã nhận URL video Facebook',
        data: {
            url: url,
            status: 'processing',
            formats: ['HD (1080p)', 'SD (720p)', '360p'],
            estimated_time: '10-30 giây',
            note: 'API thực sẽ tích hợp yt-dlp trong phiên bản tiếp theo'
        }
    });
});

// TikTok Download API
app.post('/api/tiktok/download', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'Vui lòng cung cấp URL video TikTok'
        });
    }
    
    res.json({
        success: true,
        message: 'Đã nhận URL video TikTok',
        data: {
            url: url,
            watermark: false,
            audio_extract: true,
            formats: ['MP4', 'MP3'],
            estimated_time: '5-15 giây',
            note: 'API thực sẽ tích hợp tiktok-scraper trong phiên bản tiếp theo'
        }
    });
});

// TikTok Audio Extract API
app.post('/api/tiktok/audio', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({
            success: false,
            error: 'Vui lòng cung cấp URL video TikTok'
        });
    }
    
    res.json({
        success: true,
        message: 'Đã nhận yêu cầu tách audio',
        data: {
            url: url,
            format: 'MP3',
            bitrate: '320kbps',
            estimated_time: '5-10 giây'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server Công Cụ Của Tôi đang chạy!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`📁 API: http://localhost:${PORT}/api/health`);
});
