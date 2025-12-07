const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('.'));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Công Cụ Của Tôi API',
        version: '1.0.0'
    });
});

app.listen(PORT, () => {
    console.log('🚀 Server: http://localhost:' + PORT);
});
