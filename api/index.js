const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Công Cụ Của Tôi API',
    version: '3.1.0',
    timestamp: new Date().toISOString()
  });
});

// API test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API đang hoạt động!',
    endpoints: [
      '/api/download/facebook',
      '/api/download/tiktok'
    ]
  });
});

// Tải video Facebook - Sử dụng API mới
app.post('/api/download/facebook', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu URL video Facebook' 
      });
    }
    
    console.log('Đang xử lý Facebook URL:', url);
    
    // THỬ API 1: getmyfb.com
    try {
      const response = await axios.get(`https://getmyfb.com/process`, {
        params: { 
          url: url,
          lang: 'en'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.url) {
        return res.json({
          success: true,
          platform: 'facebook',
          url: response.data.url,
          title: response.data.title || 'Facebook Video',
          quality: response.data.quality || 'HD',
          message: 'Tải thành công từ getmyfb.com'
        });
      }
    } catch (api1Error) {
      console.log('API 1 failed:', api1Error.message);
    }
    
    // THỬ API 2: fbdownloader.net
    try {
      const response = await axios.get(`https://fbdownloader.net/api/ajaxSearch`, {
        params: { 
          url: url,
          rand: Math.random()
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': 'https://fbdownloader.net',
          'Referer': 'https://fbdownloader.net/'
        },
        timeout: 10000
      });
      
      const data = response.data;
      if (data && data.links && (data.links.hd || data.links.sd)) {
        return res.json({
          success: true,
          platform: 'facebook',
          url: data.links.hd || data.links.sd,
          title: data.title || 'Facebook Video',
          thumbnail: data.thumbnail,
          quality: data.links.hd ? 'HD' : 'SD',
          message: 'Tải thành công từ fbdownloader.net'
        });
      }
    } catch (api2Error) {
      console.log('API 2 failed:', api2Error.message);
    }
    
    // THỬ API 3: ssyoutube.com (cũng hỗ trợ Facebook)
    try {
      const response = await axios.get(`https://ssyoutube.com/api/convert`, {
        params: { 
          url: url,
          format: 'json'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.url) {
        return res.json({
          success: true,
          platform: 'facebook',
          url: response.data.url,
          title: response.data.title || 'Facebook Video',
          message: 'Tải thành công từ ssyoutube.com'
        });
      }
    } catch (api3Error) {
      console.log('API 3 failed:', api3Error.message);
    }
    
    // Nếu tất cả API đều fail, trả về fallback với hướng dẫn
    res.json({
      success: false,
      platform: 'facebook',
      message: 'Hiện tại không thể tải video Facebook qua API. Bạn có thể:',
      alternatives: [
        '1. Sử dụng trình duyệt để tải trực tiếp',
        '2. Dùng extension Video DownloadHelper',
        '3. Thử video TikTok bên dưới (đang hoạt động)'
      ],
      tutorial: 'Cách tải thủ công: Mở video trên Facebook → F12 → Network → Tìm file video .mp4 → Copy link'
    });
    
  } catch (error) {
    console.error('Facebook download error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Không thể tải video Facebook. API đang bị giới hạn.',
      tip: 'Tính năng TikTok vẫn hoạt động bình thường'
    });
  }
});

// Tải video TikTok - Giữ nguyên (đang hoạt động)
app.post('/api/download/tiktok', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'Thiếu URL video TikTok' 
      });
    }
    
    console.log('Đang xử lý TikTok URL:', url);
    
    // API 1: tikwm.com
    try {
      const response = await axios.get(`https://www.tikwm.com/api/`, {
        params: { url },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      const data = response.data;
      if (data && data.data && data.data.play) {
        return res.json({
          success: true,
          platform: 'tiktok',
          url: data.data.play,
          music: data.data.music,
          title: data.data.title || 'TikTok Video',
          author: data.data.author?.nickname || 'Unknown',
          duration: data.data.duration,
          thumbnail: data.data.cover,
          message: 'Tải thành công từ TikWM.com'
        });
      }
    } catch (api1Error) {
      console.log('TikTok API 1 failed:', api1Error.message);
    }
    
    // API 2: tiktokv.com
    try {
      const response = await axios.get(`https://tiktokv.com/api/v1/video`, {
        params: { url },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.video_url) {
        return res.json({
          success: true,
          platform: 'tiktok',
          url: response.data.video_url,
          music: response.data.music_url,
          title: response.data.desc || 'TikTok Video',
          author: response.data.author?.nickname,
          message: 'Tải thành công từ TikTokV.com'
        });
      }
    } catch (api2Error) {
      console.log('TikTok API 2 failed:', api2Error.message);
    }
    
    // API 3: snaptik.app
    try {
      const response = await axios.get(`https://snaptik.app/ajaxSearch`, {
        params: { url },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.url) {
        return res.json({
          success: true,
          platform: 'tiktok',
          url: response.data.url,
          message: 'Tải thành công từ SnapTik.app'
        });
      }
    } catch (api3Error) {
      console.log('TikTok API 3 failed:', api3Error.message);
    }
    
    // Fallback cho TikTok
    res.json({
      success: true,
      platform: 'tiktok',
      url: `https://ttdownloader.com/?url=${encodeURIComponent(url)}`,
      title: 'TikTok Video',
      author: 'TikTok Creator',
      message: 'Sử dụng TTDownloader.com để tải video. Click link và làm theo hướng dẫn.'
    });
    
  } catch (error) {
    console.error('TikTok download error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Không thể tải video TikTok. Thử lại sau.',
      tip: 'Bạn có thể thử tải trực tiếp qua snaptik.app'
    });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Khởi động server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💡 Lưu ý: API Facebook có thể bị giới hạn, TikTok hoạt động tốt hơn`);
  });
}

module.exports = app;
