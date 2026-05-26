const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { db, saveData } = require('../db');

// 获取所有启用的轮播图（前端用）
router.get('/', async (req, res) => {
  try {
    const banners = db.banners.filter(b => b.enabled === 1);
    banners.sort((a, b) => a.sort - b.sort);
    res.json({ code: 200, data: banners });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有轮播图（包括禁用的，用于后台管理）
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const banners = db.banners || [];
    banners.sort((a, b) => a.sort - b.sort);
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
    
    const banner = {
      id,
      title,
      subtitle,
      image,
      link,
      sort: sort || 0,
      enabled: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.banners.push(banner);
    saveData('banners');
    
    res.json({ code: 200, message: '创建成功', data: banner });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新轮播图
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, subtitle, image, link, sort, enabled } = req.body;
    const index = db.banners.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '轮播图不存在' });
    }
    
    db.banners[index] = {
      ...db.banners[index],
      title: title !== undefined ? title : db.banners[index].title,
      subtitle: subtitle !== undefined ? subtitle : db.banners[index].subtitle,
      image: image !== undefined ? image : db.banners[index].image,
      link: link !== undefined ? link : db.banners[index].link,
      sort: sort !== undefined ? sort : db.banners[index].sort,
      enabled: enabled !== undefined ? (enabled ? 1 : 0) : db.banners[index].enabled,
      updated_at: new Date().toISOString()
    };
    
    saveData('banners');
    
    res.json({ code: 200, message: '更新成功', data: db.banners[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除轮播图
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = db.banners.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '轮播图不存在' });
    }
    
    db.banners.splice(index, 1);
    saveData('banners');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
