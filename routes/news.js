const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../db');

// 获取所有已发布的新闻
router.get('/', async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    
    let sql = 'SELECT * FROM news WHERE published = 1';
    const params = [];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (page - 1) * limit);
    
    const news = await dbAsync.all(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM news WHERE published = 1';
    if (type) countSql += ' AND type = ?';
    const countResult = await dbAsync.get(countSql, type ? [type] : []);
    
    res.json({ code: 200, data: news, total: countResult.total });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有新闻（包括未发布的，用于后台）
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const news = await dbAsync.all('SELECT * FROM news ORDER BY date DESC');
    res.json({ code: 200, data: news, total: news.length });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取单个新闻
router.get('/:id', async (req, res) => {
  try {
    const news = await dbAsync.get('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!news) {
      return res.status(404).json({ code: 404, message: '新闻不存在' });
    }
    
    // 增加浏览量
    await dbAsync.run('UPDATE news SET views = views + 1 WHERE id = ?', [req.params.id]);
    news.views++;
    
    res.json({ code: 200, data: news });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建新闻
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, type, image, date } = req.body;
    const id = uuidv4();
    
    await dbAsync.run(
      'INSERT INTO news (id, title, summary, content, type, image, date, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, summary, content, type, image || '/assets/images/placeholder.svg', date || new Date().toISOString().split('T')[0], 0]
    );
    
    res.json({ code: 200, message: '创建成功', data: { id, title, summary, type, image, date } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新新闻
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, type, image, date, published } = req.body;
    
    const result = await dbAsync.run(
      'UPDATE news SET title = ?, summary = ?, content = ?, type = ?, image = ?, date = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, summary, content, type, image, date, published !== undefined ? (published ? 1 : 0) : 1, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '新闻不存在' });
    }
    
    res.json({ code: 200, message: '更新成功', data: { id: req.params.id, title, summary, type, image, date, published } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除新闻
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await dbAsync.run('DELETE FROM news WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '新闻不存在' });
    }
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
