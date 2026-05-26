const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { db, saveData } = require('../db');

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const categories = db.categories || [];
    // 按排序字段排序
    categories.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    res.json({ code: 200, data: categories });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取单个分类
router.get('/:id', async (req, res) => {
  try {
    const category = db.categories.find(c => c.id === req.params.id);
    if (!category) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    res.json({ code: 200, data: category });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建分类
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, sort } = req.body;
    
    if (!name) {
      return res.status(400).json({ code: 400, message: '分类名称不能为空' });
    }
    
    // 检查是否已存在
    const exists = db.categories.find(c => c.name === name);
    if (exists) {
      return res.status(400).json({ code: 400, message: '分类名称已存在' });
    }
    
    const id = uuidv4();
    const category = {
      id,
      name,
      sort: sort || db.categories.length + 1,
      created_at: new Date().toISOString()
    };
    
    db.categories.push(category);
    saveData('categories');
    
    res.json({ code: 200, message: '创建成功', data: category });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新分类
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, sort } = req.body;
    const index = db.categories.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    
    // 检查名称是否与其他分类重复
    if (name && name !== db.categories[index].name) {
      const exists = db.categories.find(c => c.name === name && c.id !== req.params.id);
      if (exists) {
        return res.status(400).json({ code: 400, message: '分类名称已存在' });
      }
    }
    
    db.categories[index] = {
      ...db.categories[index],
      name: name || db.categories[index].name,
      sort: sort !== undefined ? sort : db.categories[index].sort,
      updated_at: new Date().toISOString()
    };
    
    saveData('categories');
    
    res.json({ code: 200, message: '更新成功', data: db.categories[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除分类
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = db.categories.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    
    // 检查是否有产品使用此分类
    const productsUsingCategory = db.products.filter(p => p.category === db.categories[index].id);
    if (productsUsingCategory.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: `该分类下还有 ${productsUsingCategory.length} 个产品，无法删除` 
      });
    }
    
    db.categories.splice(index, 1);
    saveData('categories');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
