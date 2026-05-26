const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { db, saveData } = require('../db');

// 获取所有产品
router.get('/all', async (req, res) => {
  try {
    const products = db.products || [];
    // 按创建时间倒序
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ code: 200, data: products });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有产品（兼容旧接口）
router.get('/', async (req, res) => {
  try {
    const products = db.products || [];
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ code: 200, data: products });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取单个产品
router.get('/:id', async (req, res) => {
  try {
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '产品不存在' });
    }
    res.json({ code: 200, data: product });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建产品
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, description, tags, image } = req.body;
    const id = uuidv4();
    
    const product = {
      id,
      name,
      category,
      description,
      tags: tags || [],
      image: image || '/assets/images/placeholder.svg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.products.push(product);
    saveData('products');
    
    res.json({ code: 200, message: '创建成功', data: product });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新产品
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, description, tags, image } = req.body;
    const index = db.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '产品不存在' });
    }
    
    db.products[index] = {
      ...db.products[index],
      name: name || db.products[index].name,
      category: category || db.products[index].category,
      description: description || db.products[index].description,
      tags: tags || db.products[index].tags,
      image: image || db.products[index].image,
      updated_at: new Date().toISOString()
    };
    
    saveData('products');
    
    res.json({ code: 200, message: '更新成功', data: db.products[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除产品
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = db.products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '产品不存在' });
    }
    
    db.products.splice(index, 1);
    saveData('products');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
