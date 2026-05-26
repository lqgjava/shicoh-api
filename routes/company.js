const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { db, saveData } = require('../db');

// 获取企业信息
router.get('/', async (req, res) => {
  try {
    if (!db.company) {
      return res.status(404).json({ code: 404, message: '企业信息不存在' });
    }
    
    res.json({ code: 200, data: db.company });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新企业信息
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, slogan, description, founded, employees, address, phone, email, website, stats, features, factoryImage } = req.body;
    
    // 更新企业信息
    db.company = {
      id: 1,
      name,
      slogan,
      description,
      founded,
      employees,
      address,
      phone,
      email,
      website,
      stats: stats || {},
      features: features || [],
      factoryImage: factoryImage || db.company.factoryImage || '',
      updated_at: new Date().toISOString()
    };
    
    // 保存到文件
    saveData('company');
    
    res.json({ code: 200, message: '更新成功', data: db.company });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
