const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { db, saveData } = require('../db');

// 获取所有已发布的新闻（前端用）
router.get('/', async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    
    let news = db.news || [];
    
    // 筛选已发布的
    news = news.filter(n => n.published === 1);
    
    // 按类型筛选
    if (type) {
      news = news.filter(n => n.type === type);
    }
    
    // 按日期倒序
    news.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 分页
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginatedNews = news.slice(start, end);
    
    res.json({ code: 200, data: paginatedNews, total: news.length });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有新闻（包括未发布的，用于后台）
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const news = db.news || [];
    news.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ code: 200, data: news, total: news.length });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取单个新闻
router.get('/:id', async (req, res) => {
  try {
    const news = db.news.find(n => n.id === req.params.id);
    if (!news) {
      return res.status(404).json({ code: 404, message: '新闻不存在' });
    }
    
    // 增加浏览量
    news.views = (news.views || 0) + 1;
    saveData('news');
    
    res.json({ code: 200, data: news });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建新闻
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, type, image, date, published } = req.body;
    const id = uuidv4();
    
    const news = {
      id,
      title,
      summary,
      content,
      type,
      image: image || '/assets/images/placeholder.svg',
      date: date || new Date().toISOString().split('T')[0],
      views: 0,
      published: published !== undefined ? (published ? 1 : 0) : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.news.push(news);
    saveData('news');
    
    res.json({ code: 200, message: '创建成功', data: news });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新新闻
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, summary, content, type, image, date, published } = req.body;
    const index = db.news.findIndex(n => n.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '新闻不存在' });
    }
    
    db.news[index] = {
      ...db.news[index],
      title: title || db.news[index].title,
      summary: summary || db.news[index].summary,
      content: content || db.news[index].content,
      type: type || db.news[index].type,
      image: image || db.news[index].image,
      date: date || db.news[index].date,
      published: published !== undefined ? (published ? 1 : 0) : db.news[index].published,
      updated_at: new Date().toISOString()
    };
    
    saveData('news');
    
    res.json({ code: 200, message: '更新成功', data: db.news[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除新闻
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = db.news.findIndex(n => n.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '新闻不存在' });
    }
    
    db.news.splice(index, 1);
    saveData('news');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
