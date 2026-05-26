const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 先加载数据库模块（会自动初始化）
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3002;

// 判断运行环境
const isVercel = !!process.env.VERCEL;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 仅在本地环境提供上传图片的访问
// Vercel 环境下图片存储在 Vercel Blob，URL 是外部链接
if (!isVercel) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));
}

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/products', require('./routes/products'));
app.use('/api/news', require('./routes/news'));
app.use('/api/company', require('./routes/company'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/news-types', require('./routes/newsTypes'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/settings', require('./routes/settings'));

// 根路径提示
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '新思考电机 API 服务运行正常',
    docs: 'API 接口路径以 /api 开头',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'API 运行正常' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// 本地开发时启动服务器，Vercel 环境下不启动（由 Vercel 管理）
if (!isVercel) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`环境: development`);
  });
}

// 导出 app 供 Vercel Serverless Function 使用
module.exports = app;
