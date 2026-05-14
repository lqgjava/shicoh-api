const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../db');

// 获取所有启用的轮播图
router.get('/', async (req, res) => {
  try {
    const banners = await dbAsync.all(
      'SELECT * FROM banners WHERE enabled = 1 ORDER BY sort ASC'
    );
    res.json({ code: 200, data: banners });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有轮播图（包括禁用的，用于后台管理）
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const banners = await dbAsync.all('SELECT * FROM banners ORDER BY sort ASC');
    res.json({ code: 200, data: banners });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建轮播图
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, subtitle, image, link, sort } = req.body;
    const id = uuidv4();
    
    await dbAsync.run(
      'INSERT INTO banners (id, title, subtitle, image, link, sort) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, subtitle, image, link, sort || 0]
    );
    
    res.json({ code: 200, message: '创建成功', data: { id, title, subtitle, image, link, sort } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新轮播图
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, subtitle, image, link, sort, enabled } = req.body;
    
    const result = await dbAsync.run(
      'UPDATE banners SET title = ?, subtitle = ?, image = ?, link = ?, sort = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, subtitle, image, link, sort, enabled !== undefined ? (enabled ? 1 : 0) : 1, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '轮播图不存在' });
    }
    
    res.json({ code: 200, message: '更新成功', data: { id: req.params.id, title, subtitle, image, link, sort, enabled } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除轮播图
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await dbAsync.run('DELETE FROM banners WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '轮播图不存在' });
    }
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
