const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { db, saveData } = require('../db');

// 获取所有留言（需要登录）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let messages = db.messages || [];
    
    // 按状态筛选
    if (status) {
      messages = messages.filter(m => m.status === status);
    }
    
    // 按时间倒序
    messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // 分页
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginatedMessages = messages.slice(start, end);
    
    res.json({
      code: 200,
      data: {
        list: paginatedMessages,
        total: messages.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取待处理留言数量（需要登录）
router.get('/pending-count', authMiddleware, async (req, res) => {
  try {
    const messages = db.messages || [];
    const pendingCount = messages.filter(m => m.status === 'pending').length;
    res.json({ code: 200, data: { count: pendingCount } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 提交留言（公开接口）
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject, content } = req.body;
    
    // 验证必填字段
    if (!name || !phone || !content) {
      return res.status(400).json({ code: 400, message: '姓名、电话和留言内容不能为空' });
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ code: 400, message: '手机号格式不正确' });
    }
    
    const id = uuidv4();
    const message = {
      id,
      name,
      phone,
      email: email || '',
      subject: subject || '其他',
      content,
      status: 'pending', // pending, processing, resolved
      reply: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.messages.push(message);
    saveData('messages');
    
    res.json({ code: 200, message: '提交成功，我们会尽快与您联系', data: { id } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 更新留言状态（需要登录）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, reply } = req.body;
    const index = db.messages.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '留言不存在' });
    }
    
    db.messages[index] = {
      ...db.messages[index],
      status: status || db.messages[index].status,
      reply: reply !== undefined ? reply : db.messages[index].reply,
      updated_at: new Date().toISOString()
    };
    
    saveData('messages');
    
    res.json({ code: 200, message: '更新成功', data: db.messages[index] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 删除留言（需要登录）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const index = db.messages.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '留言不存在' });
    }
    
    db.messages.splice(index, 1);
    saveData('messages');
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
