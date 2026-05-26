const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { db, saveData } = require('../db');
const authMiddleware = require('../middleware/auth');

// 确保partners数据存在
if (!db.partners) {
    db.partners = [];
    saveData('partners');
}

// 获取所有合作伙伴（前端用，只返回启用的）
router.get('/', async (req, res) => {
  try {
    let partners = db.partners || [];
    // 只返回启用的
    const enabledPartners = partners.filter(p => p.enabled !== 0);
    enabledPartners.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    res.json({ code: 200, data: enabledPartners });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取所有合作伙伴（包括禁用的，用于后台管理）
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const partners = db.partners || [];
    partners.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    res.json({ code: 200, data: partners });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取单个合作伙伴
router.get('/:id', async (req, res) => {
  try {
    const partner = (db.partners || []).find(p => p.id === req.params.id);
    if (!partner) {
      return res.status(404).json({ code: 404, message: '合作伙伴不存在' });
    }
    res.json({ code: 200, data: partner });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建合作伙伴（需要登录）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, logo, website, sort, enabled } = req.body;
    const id = uuidv4();
    
    const partner = {
      id,
      name,
      logo: logo || '',
      website: website || '',
      sort: sort || 0,
      enabled: enabled !== undefined ? (enabled ? 1 : 0) : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.partners.push(partner);
    saveData('partners');
    
    res.json({ code: 200, message: '创建成功', data: partner });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新合作伙伴（需要登录）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, logo, website, sort, enabled } = req.body;
    const index = (db.partners || []).findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '合作伙伴不存在' });
    }
    
    db.partners[index] = {
      ...db.partners[index],
      name: name !== undefined ? name : db.partners[index].name,
      logo: logo !== undefined ? logo : db.partners[index].logo,
      website: website !== undefined ? website : db.partners[index].website,
      sort: sort !== undefined ? sort : db.partners[index].sort,
      enabled: enabled !== undefined ? (enabled ? 1 : 0) : db.partners[index].enabled,
      updated_at: new Date().toISOString()
    };
    
    saveData('partners');
    
    res.json({ code: 200, message: '更新成功', data: db.partners[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除合作伙伴（需要登录）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = (db.partners || []).findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '合作伙伴不存在' });
    }
    
    db.partners.splice(index, 1);
    saveData('partners');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
