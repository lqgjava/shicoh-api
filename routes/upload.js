const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

// 判断运行环境
const isVercel = !!process.env.VERCEL;

// 本地环境：上传目录配置
const localUploadDir = path.join(__dirname, '..', 'uploads');
if (!isVercel && !fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
}

// 本地环境：配置磁盘存储
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, localUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型，只允许上传图片文件'), false);
    }
};

// 本地环境的 multer 配置
const localUpload = multer({
    storage: localStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Vercel 环境的 multer 配置（内存存储，用于 Vercel Blob 上传）
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// 上传图片
router.post('/', authMiddleware, async (req, res) => {
    // 根据环境选择不同的上传策略
    const uploadMiddleware = isVercel ? memoryUpload.single('file') : localUpload.single('file');
    
    uploadMiddleware(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ code: 400, message: '文件大小超过限制（最大5MB）' });
            }
            return res.status(400).json({ code: 400, message: '上传错误: ' + err.message });
        } else if (err) {
            return res.status(400).json({ code: 400, message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ code: 400, message: '没有上传文件' });
        }
        
        try {
            if (isVercel) {
                // Vercel 环境：上传到 Vercel Blob
                const { put } = await import('@vercel/blob');
                const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
                const blob = await put(`uploads/${filename}`, req.file.buffer, {
                    access: 'public',
                    contentType: req.file.mimetype
                });
                
                res.json({
                    code: 200,
                    message: '上传成功',
                    data: {
                        url: blob.url,
                        filename: filename,
                        size: req.file.size
                    }
                });
            } else {
                // 本地环境：使用磁盘存储的结果
                const url = `/uploads/${req.file.filename}`;
                res.json({
                    code: 200,
                    message: '上传成功',
                    data: {
                        url,
                        filename: req.file.filename,
                        size: req.file.size
                    }
                });
            }
        } catch (error) {
            console.error('上传处理失败:', error);
            res.status(500).json({ code: 500, message: '上传处理失败: ' + error.message });
        }
    });
});

module.exports = router;
