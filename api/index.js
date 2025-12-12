const express = require('express');
const app = express();

app.use(require('express').json());

// Health check endpoint - FIXED
app.get('/api/health', (req, res) => {
  console.log('Health check called');
  res.json({
    status: 'healthy',
    message: 'Công Cụ Của Tôi API đang hoạt động',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Facebook download endpoint
app.post('/api/facebook/download', (req, res) => {
  res.json({
    success: true,
    message: 'Facebook download API (Demo)',
    url: req.body.url || 'No URL provided'
  });
});

// TikTok download endpoint
app.post('/api/tiktok/download', (req, res) => {
  res.json({
    success: true,
    message: 'TikTok download API (Demo)',
    url: req.body.url || 'No URL provided'
  });
});

// Handle all other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available: ['/api/health', '/api/facebook/download', '/api/tiktok/download']
  });
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
