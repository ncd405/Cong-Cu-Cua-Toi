const express = require('express');
const app = express();

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Công Cụ Của Tôi API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Facebook download
app.post('/api/facebook/download', (req, res) => {
  const { url } = req.body;
  res.json({
    success: true,
    message: 'Facebook download API',
    url: url || 'No URL provided'
  });
});

// TikTok download
app.post('/api/tiktok/download', (req, res) => {
  const { url } = req.body;
  res.json({
    success: true,
    message: 'TikTok download API',
    url: url || 'No URL provided'
  });
});

module.exports = app;
