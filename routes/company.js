const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { dbAsync } = require('../db');

// 获取企业信息
router.get('/', async (req, res) => {
  try {
    const company = await dbAsync.get('SELECT * FROM company WHERE id = 1');
    if (!company) {
      return res.status(404).json({ code: 404, message: '企业信息不存在' });
    }
    
    // 解析 JSON 字段
    const result = {
      ...company,
      stats: JSON.parse(company.stats || '{}'),
      features: JSON.parse(company.features || '[]')
    };
    
    res.json({ code: 200, data: result });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新企业信息
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, slogan, description, founded, employees, address, phone, email, website, stats, features } = req.body;
    
    const result = await dbAsync.run(
      `UPDATE company SET 
        name = ?, slogan = ?, description = ?, founded = ?, employees = ?, 
        address = ?, phone = ?, email = ?, website = ?, 
        stats = ?, features = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = 1`,
      [name, slogan, description, founded, employees, address, phone, email, website, 
       JSON.stringify(stats || {}), JSON.stringify(features || [])]
    );
    
    if (result.changes === 0) {
      // 如果没有更新，尝试插入
      await dbAsync.run(
        `INSERT INTO company (id, name, slogan, description, founded, employees, address, phone, email, website, stats, features) 
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, slogan, description, founded, employees, address, phone, email, website,
         JSON.stringify(stats || {}), JSON.stringify(features || [])]
      );
    }
    
    res.json({ code: 200, message: '更新成功', data: { name, slogan, description, stats, features } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
