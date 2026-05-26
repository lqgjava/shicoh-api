const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { db, saveData } = require('../db');

// 获取系统设置（公开接口）
router.get('/', async (req, res) => {
  try {
    const settings = db.settings || {};
    res.json({ code: 200, data: settings });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新系统设置（需要登录）
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      siteName,
      siteLogo,
      siteFavicon,
      siteKeywords,
      siteDescription,
      contactPhone,
      contactEmail,
      contactAddress,
      icp
    } = req.body;
    
    db.settings = {
      ...db.settings,
      siteName: siteName || db.settings.siteName,
      siteLogo: siteLogo || db.settings.siteLogo,
      siteFavicon: siteFavicon || db.settings.siteFavicon,
      siteKeywords: siteKeywords || db.settings.siteKeywords,
      siteDescription: siteDescription || db.settings.siteDescription,
      contactPhone: contactPhone || db.settings.contactPhone,
      contactEmail: contactEmail || db.settings.contactEmail,
      contactAddress: contactAddress || db.settings.contactAddress,
      icp: icp || db.settings.icp,
      updated_at: new Date().toISOString()
    };
    
    saveData('settings');
    
    res.json({ code: 200, message: '保存成功', data: db.settings });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
