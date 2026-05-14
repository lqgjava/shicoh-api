const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../db');

// 获取所有产品
router.get('/', async (req, res) => {
  try {
    const products = await dbAsync.all('SELECT * FROM products ORDER BY created_at DESC');
    // 解析 tags JSON
    const formattedProducts = products.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]')
    }));
    res.json({ code: 200, data: formattedProducts });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取单个产品
router.get('/:id', async (req, res) => {
  try {
    const product = await dbAsync.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ code: 404, message: '产品不存在' });
    }
    product.tags = JSON.parse(product.tags || '[]');
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
    
    await dbAsync.run(
      'INSERT INTO products (id, name, category, description, tags, image) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, category, description, JSON.stringify(tags || []), image || '/assets/images/placeholder.svg']
    );
    
    res.json({ code: 200, message: '创建成功', data: { id, name, category, description, tags, image } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新产品
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, description, tags, image } = req.body;
    
    const result = await dbAsync.run(
      'UPDATE products SET name = ?, category = ?, description = ?, tags = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, category, description, JSON.stringify(tags || []), image, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '产品不存在' });
    }
    
    res.json({ code: 200, message: '更新成功', data: { id: req.params.id, name, category, description, tags, image } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除产品
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await dbAsync.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ code: 404, message: '产品不存在' });
    }
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
