const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { db, saveData } = require('../db');

// 获取所有新闻类型
router.get('/', async (req, res) => {
  try {
    const newsTypes = db.newsTypes || [];
    newsTypes.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    res.json({ code: 200, data: newsTypes });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建新闻类型
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, sort } = req.body;
    
    if (!name) {
      return res.status(400).json({ code: 400, message: '类型名称不能为空' });
    }
    
    // 检查是否已存在
    const exists = db.newsTypes.find(t => t.name === name);
    if (exists) {
      return res.status(400).json({ code: 400, message: '类型名称已存在' });
    }
    
    const id = uuidv4();
    const newsType = {
      id,
      name,
      sort: sort || db.newsTypes.length + 1,
      created_at: new Date().toISOString()
    };
    
    db.newsTypes.push(newsType);
    saveData('newsTypes');
    
    res.json({ code: 200, message: '创建成功', data: newsType });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新新闻类型
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, sort } = req.body;
    const index = db.newsTypes.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '类型不存在' });
    }
    
    // 检查名称是否重复
    if (name && name !== db.newsTypes[index].name) {
      const exists = db.newsTypes.find(t => t.name === name && t.id !== req.params.id);
      if (exists) {
        return res.status(400).json({ code: 400, message: '类型名称已存在' });
      }
    }
    
    db.newsTypes[index] = {
      ...db.newsTypes[index],
      name: name || db.newsTypes[index].name,
      sort: sort !== undefined ? sort : db.newsTypes[index].sort,
      updated_at: new Date().toISOString()
    };
    
    saveData('newsTypes');
    
    res.json({ code: 200, message: '更新成功', data: db.newsTypes[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除新闻类型
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = db.newsTypes.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '类型不存在' });
    }
    
    // 检查是否有新闻使用此类型
    const newsUsingType = db.news.filter(n => n.type === db.newsTypes[index].id);
    if (newsUsingType.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: `该类型下还有 ${newsUsingType.length} 条新闻，无法删除` 
      });
    }
    
    db.newsTypes.splice(index, 1);
    saveData('newsTypes');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
