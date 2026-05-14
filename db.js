const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'data', 'shicoh.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('✅ 数据库连接成功');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  db.serialize(() => {
    // 用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 轮播图表
    db.run(`
      CREATE TABLE IF NOT EXISTS banners (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        image TEXT,
        link TEXT,
        sort INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 产品表
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        tags TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 新闻表
    db.run(`
      CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT,
        content TEXT,
        type TEXT,
        image TEXT,
        date TEXT,
        views INTEGER DEFAULT 0,
        published INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 企业信息表
    db.run(`
      CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT,
        slogan TEXT,
        description TEXT,
        founded TEXT,
        employees TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        stats TEXT,
        features TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      // 插入默认数据
      insertDefaultData();
    });
  });
}

// 插入默认数据
function insertDefaultData() {
  // 检查是否已有数据
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('查询用户表失败:', err);
      return;
    }
    
    if (row.count === 0) {
      // 插入默认管理员
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        ['1', 'admin', hashedPassword, 'admin']
      );
      console.log('✅ 默认管理员已创建');
    }
  });

  // 检查轮播图
  db.get('SELECT COUNT(*) as count FROM banners', (err, row) => {
    if (err || row.count > 0) return;
    
    const banners = [
      { id: '1', title: '创新驱动 精工制造', subtitle: '新思考电机专注于各类微特电机的研发、生产与销售', image: '/assets/images/banner.svg', link: '#about', sort: 1 },
      { id: '2', title: '智能制造 引领未来', subtitle: '拥有全自动化生产线和智能检测系统', image: '/assets/images/banner.svg', link: '#products', sort: 2 },
      { id: '3', title: '全球合作 互利共赢', subtitle: '产品远销全球50多个国家和地区', image: '/assets/images/banner.svg', link: '#news', sort: 3 }
    ];
    
    const stmt = db.prepare('INSERT INTO banners (id, title, subtitle, image, link, sort) VALUES (?, ?, ?, ?, ?, ?)');
    banners.forEach(b => stmt.run(b.id, b.title, b.subtitle, b.image, b.link, b.sort));
    stmt.finalize();
    console.log('✅ 默认轮播图已创建');
  });

  // 检查产品
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err || row.count > 0) return;
    
    const products = [
      { id: '1', name: '直流无刷电机', category: 'brushless', description: '高效节能、低噪音、长寿命', tags: JSON.stringify(['高效节能', '低噪音', '长寿命']) },
      { id: '2', name: '步进电机', category: 'stepper', description: '高精度、高扭矩、响应快', tags: JSON.stringify(['高精度', '高扭矩', '响应快']) },
      { id: '3', name: '伺服电机', category: 'servo', description: '高动态响应、精准定位', tags: JSON.stringify(['动态响应', '精准定位', '高性能']) }
    ];
    
    const stmt = db.prepare('INSERT INTO products (id, name, category, description, tags, image) VALUES (?, ?, ?, ?, ?, ?)');
    products.forEach(p => stmt.run(p.id, p.name, p.category, p.description, p.tags, '/assets/images/placeholder.svg'));
    stmt.finalize();
    console.log('✅ 默认产品已创建');
  });

  // 检查新闻
  db.get('SELECT COUNT(*) as count FROM news', (err, row) => {
    if (err || row.count > 0) return;
    
    const news = [
      { id: '1', title: '新思考电机荣获"2026年度智能制造示范企业"称号', summary: '近日，新思考电机凭借先进的智能制造体系...', type: 'company', date: '2026-03-15', views: 1286 },
      { id: '2', title: '新思考电机新品发布：高效节能伺服电机系列正式上市', summary: '2月28日，新思考电机新品发布会在总部举行...', type: 'product', date: '2026-02-28', views: 2450 }
    ];
    
    const stmt = db.prepare('INSERT INTO news (id, title, summary, content, type, image, date, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    news.forEach(n => stmt.run(n.id, n.title, n.summary, '详细内容...', n.type, '/assets/images/placeholder.svg', n.date, n.views));
    stmt.finalize();
    console.log('✅ 默认新闻已创建');
  });

  // 检查企业信息
  db.get('SELECT COUNT(*) as count FROM company', (err, row) => {
    if (err || row.count > 0) return;
    
    const company = {
      name: '新思考电机股份有限公司',
      slogan: '创新驱动 精工制造',
      description: '新思考电机专注于各类微特电机的研发、生产与销售，为全球客户提供高品质的电机解决方案。',
      founded: '2005',
      employees: '2000+',
      address: '江苏省苏州市工业园区智能制造产业园88号',
      phone: '400-888-8888',
      email: 'info@xinsikao-motor.com',
      website: 'www.xinsikao-motor.com',
      stats: JSON.stringify({ experience: 21, countries: 50, capacity: 5000, patents: 200 }),
      features: JSON.stringify(['国家级高新技术企业', 'ISO9001质量体系认证', 'IATF16949汽车认证', '200+技术专利'])
    };
    
    db.run(
      'INSERT INTO company (id, name, slogan, description, founded, employees, address, phone, email, website, stats, features) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [company.name, company.slogan, company.description, company.founded, company.employees, company.address, company.phone, company.email, company.website, company.stats, company.features]
    );
    console.log('✅ 默认企业信息已创建');
  });
}

// Promisify 数据库操作
const dbAsync = {
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

module.exports = { db, dbAsync };
