const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { db, saveData } = require('../db');

// 获取所有标签
router.get('/', async (req, res) => {
  try {
    const tags = db.tags || [];
    res.json({ code: 200, data: tags });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建标签
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ code: 400, message: '标签名称不能为空' });
    }
    
    // 检查是否已存在
    const exists = db.tags.find(t => t.name === name);
    if (exists) {
      return res.status(400).json({ code: 400, message: '标签名称已存在' });
    }
    
    const id = uuidv4();
    const tag = {
      id,
      name,
      created_at: new Date().toISOString()
    };
    
    db.tags.push(tag);
    saveData('tags');
    
    res.json({ code: 200, message: '创建成功', data: tag });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新标签
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const index = db.tags.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '标签不存在' });
    }
    
    // 检查名称是否重复
    if (name && name !== db.tags[index].name) {
      const exists = db.tags.find(t => t.name === name && t.id !== req.params.id);
      if (exists) {
        return res.status(400).json({ code: 400, message: '标签名称已存在' });
      }
    }
    
    db.tags[index] = {
      ...db.tags[index],
      name: name || db.tags[index].name,
      updated_at: new Date().toISOString()
    };
    
    saveData('tags');
    
    res.json({ code: 200, message: '更新成功', data: db.tags[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除标签
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = db.tags.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '标签不存在' });
    }
    
    db.tags.splice(index, 1);
    saveData('tags');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
