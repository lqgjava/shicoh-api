/**
 * JSON 文件数据库 - 数据持久化存储
 * 数据保存在 data/ 目录下的 JSON 文件中
 * 
 * Vercel Serverless 环境：数据存储在 /tmp/data/（可写但冷启动会重置）
 * 本地开发环境：数据存储在 data/（持久化）
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 判断运行环境
const isVercel = !!process.env.VERCEL;

// 数据目录：Vercel 使用 /tmp/data，本地使用项目下的 data/
const DATA_DIR = isVercel ? '/tmp/shicoh-data' : path.join(__dirname, 'data');
const SOURCE_DATA_DIR = path.join(__dirname, 'data'); // 部署包中的原始数据

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Vercel 冷启动时，从部署包拷贝初始数据到 /tmp
if (isVercel && fs.existsSync(SOURCE_DATA_DIR)) {
    const dataFiles = fs.readdirSync(SOURCE_DATA_DIR).filter(f => f.endsWith('.json'));
    for (const file of dataFiles) {
        const targetPath = path.join(DATA_DIR, file);
        if (!fs.existsSync(targetPath)) {
            try {
                fs.copyFileSync(path.join(SOURCE_DATA_DIR, file), targetPath);
            } catch (err) {
                console.error(`拷贝初始数据失败: ${file}`, err.message);
            }
        }
    }
}

// 数据文件路径
const DATA_FILES = {
    users: path.join(DATA_DIR, 'users.json'),
    banners: path.join(DATA_DIR, 'banners.json'),
    products: path.join(DATA_DIR, 'products.json'),
    news: path.join(DATA_DIR, 'news.json'),
    company: path.join(DATA_DIR, 'company.json'),
    categories: path.join(DATA_DIR, 'categories.json'),
    tags: path.join(DATA_DIR, 'tags.json'),
    newsTypes: path.join(DATA_DIR, 'newsTypes.json'),
    messages: path.join(DATA_DIR, 'messages.json'),
    settings: path.join(DATA_DIR, 'settings.json'),
    stats: path.join(DATA_DIR, 'stats.json'),
    partners: path.join(DATA_DIR, 'partners.json')
};

// 读取数据文件
function readData(filePath, defaultValue = []) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error);
    }
    return defaultValue;
}

// 写入数据文件
function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`写入文件失败: ${filePath}`, error);
        return false;
    }
}

// 数据库对象
const db = {
    users: readData(DATA_FILES.users, []),
    banners: readData(DATA_FILES.banners, []),
    products: readData(DATA_FILES.products, []),
    news: readData(DATA_FILES.news, []),
    company: readData(DATA_FILES.company, null),
    categories: readData(DATA_FILES.categories, []),
    tags: readData(DATA_FILES.tags, []),
    newsTypes: readData(DATA_FILES.newsTypes, []),
    messages: readData(DATA_FILES.messages, []),
    settings: readData(DATA_FILES.settings, {}),
    stats: readData(DATA_FILES.stats, { views: 0, lastReset: new Date().toISOString() }),
    partners: readData(DATA_FILES.partners, [])
};

// 保存数据到文件
function saveData(table) {
    if (DATA_FILES[table]) {
        return writeData(DATA_FILES[table], db[table]);
    }
    return false;
}

// 初始化默认数据
function initDatabase() {
    let hasNewData = false;

    // 初始化默认管理员
    if (db.users.length === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.users.push({
            id: '1',
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            created_at: new Date().toISOString()
        });
        saveData('users');
        console.log('✅ 默认管理员已创建');
        hasNewData = true;
    }

    // 初始化默认轮播图
    if (db.banners.length === 0) {
        db.banners = [
            { id: '1', title: '创新驱动 精工制造', subtitle: '新思考电机专注于各类微特电机的研发、生产与销售', image: '/assets/images/banner.svg', link: '#about', sort: 1, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', title: '智能制造 引领未来', subtitle: '拥有全自动化生产线和智能检测系统', image: '/assets/images/banner.svg', link: '#products', sort: 2, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '3', title: '全球合作 互利共赢', subtitle: '产品远销全球50多个国家和地区', image: '/assets/images/banner.svg', link: '#news', sort: 3, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        saveData('banners');
        console.log('✅ 默认轮播图已创建');
        hasNewData = true;
    }

    // 初始化默认产品分类
    if (db.categories.length === 0) {
        db.categories = [
            { id: 'brushless', name: '直流无刷电机', sort: 1, created_at: new Date().toISOString() },
            { id: 'stepper', name: '步进电机', sort: 2, created_at: new Date().toISOString() },
            { id: 'servo', name: '伺服电机', sort: 3, created_at: new Date().toISOString() },
            { id: 'custom', name: '定制方案', sort: 4, created_at: new Date().toISOString() }
        ];
        saveData('categories');
        console.log('✅ 默认产品分类已创建');
        hasNewData = true;
    }

    // 初始化默认产品标签
    if (db.tags.length === 0) {
        db.tags = [
            { id: '1', name: '高效节能', created_at: new Date().toISOString() },
            { id: '2', name: '低噪音', created_at: new Date().toISOString() },
            { id: '3', name: '长寿命', created_at: new Date().toISOString() },
            { id: '4', name: '高精度', created_at: new Date().toISOString() },
            { id: '5', name: '高扭矩', created_at: new Date().toISOString() },
            { id: '6', name: '响应快', created_at: new Date().toISOString() }
        ];
        saveData('tags');
        console.log('✅ 默认产品标签已创建');
        hasNewData = true;
    }

    // 初始化默认产品
    if (db.products.length === 0) {
        db.products = [
            { id: '1', name: '直流无刷电机', category: 'brushless', description: '高效节能、低噪音、长寿命', tags: ['高效节能', '低噪音', '长寿命'], image: '/assets/images/placeholder.svg', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', name: '步进电机', category: 'stepper', description: '高精度、高扭矩、响应快', tags: ['高精度', '高扭矩', '响应快'], image: '/assets/images/placeholder.svg', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '3', name: '伺服电机', category: 'servo', description: '高动态响应、精准定位', tags: ['动态响应', '精准定位', '高性能'], image: '/assets/images/placeholder.svg', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        saveData('products');
        console.log('✅ 默认产品已创建');
        hasNewData = true;
    }

    // 初始化默认新闻类型
    if (db.newsTypes.length === 0) {
        db.newsTypes = [
            { id: 'company', name: '公司新闻', sort: 1, created_at: new Date().toISOString() },
            { id: 'industry', name: '行业资讯', sort: 2, created_at: new Date().toISOString() },
            { id: 'product', name: '新品发布', sort: 3, created_at: new Date().toISOString() }
        ];
        saveData('newsTypes');
        console.log('✅ 默认新闻类型已创建');
        hasNewData = true;
    }

    // 初始化默认新闻
    if (db.news.length === 0) {
        db.news = [
            { id: '1', title: '新思考电机荣获"2026年度智能制造示范企业"称号', summary: '近日，新思考电机凭借先进的智能制造体系...', content: '详细内容...', type: 'company', image: '/assets/images/placeholder.svg', date: '2026-03-15', views: 1286, published: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', title: '新思考电机新品发布：高效节能伺服电机系列正式上市', summary: '2月28日，新思考电机新品发布会在总部举行...', content: '详细内容...', type: 'product', image: '/assets/images/placeholder.svg', date: '2026-02-28', views: 2450, published: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        saveData('news');
        console.log('✅ 默认新闻已创建');
        hasNewData = true;
    }

    // 初始化默认企业信息
    if (!db.company) {
        db.company = {
            id: 1,
            name: '新思考电机股份有限公司',
            slogan: '创新驱动 精工制造',
            description: '新思考电机专注于各类微特电机的研发、生产与销售，为全球客户提供高品质的电机解决方案。',
            founded: '2005',
            employees: '2000+',
            address: '江苏省苏州市工业园区智能制造产业园88号',
            phone: '400-888-8888',
            email: 'info@xinsikao-motor.com',
            website: 'www.xinsikao-motor.com',
            stats: { experience: 21, countries: 50, capacity: 5000, patents: 200 },
            features: ['国家级高新技术企业', 'ISO9001质量体系认证', 'IATF16949汽车认证', '200+技术专利'],
            updated_at: new Date().toISOString()
        };
        saveData('company');
        console.log('✅ 默认企业信息已创建');
        hasNewData = true;
    }

    // 初始化默认系统设置
    if (Object.keys(db.settings).length === 0) {
        db.settings = {
            siteName: '新思考电机股份有限公司',
            siteLogo: '/assets/images/logo.png',
            siteFavicon: '/favicon.ico',
            siteKeywords: '新思考电机,直流无刷电机,步进电机,伺服电机',
            siteDescription: '新思考电机专注于各类微特电机的研发、生产与销售',
            contactPhone: '400-888-8888',
            contactEmail: 'info@xinsikao-motor.com',
            contactAddress: '江苏省苏州市工业园区智能制造产业园88号',
            icp: '苏ICP备12345678号',
            updated_at: new Date().toISOString()
        };
        saveData('settings');
        console.log('✅ 默认系统设置已创建');
        hasNewData = true;
    }

    // 初始化默认合作伙伴
    if (db.partners.length === 0) {
        db.partners = [
            { id: '1', name: 'ABB', logo: '', website: '', sort: 1, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', name: 'SIEMENS', logo: '', website: '', sort: 2, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '3', name: 'SCHNEIDER', logo: '', website: '', sort: 3, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '4', name: 'BOSCH', logo: '', website: '', sort: 4, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '5', name: 'PANASONIC', logo: '', website: '', sort: 5, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '6', name: 'MITSUBISHI', logo: '', website: '', sort: 6, enabled: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        saveData('partners');
        console.log('✅ 默认合作伙伴已创建');
        hasNewData = true;
    }

    if (!hasNewData) {
        console.log('✅ 数据库已加载，包含持久化数据');
    }
}

// 异步数据库操作接口
const dbAsync = {
    // 查询所有
    all(table, where = null, params = []) {
        return new Promise((resolve) => {
            let result = db[table] || [];
            if (where) {
                result = result.filter(item => {
                    for (let key in where) {
                        if (item[key] !== where[key]) return false;
                    }
                    return true;
                });
            }
            resolve(result);
        });
    },

    // 查询单个
    get(table, where) {
        return new Promise((resolve) => {
            const result = (db[table] || []).find(item => {
                for (let key in where) {
                    if (item[key] !== where[key]) return false;
                }
                return true;
            });
            resolve(result || null);
        });
    },

    // 插入
    insert(table, data) {
        return new Promise((resolve) => {
            if (!db[table]) db[table] = [];
            const newItem = {
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            db[table].push(newItem);
            saveData(table);
            resolve({ id: data.id, changes: 1 });
        });
    },

    // 更新
    update(table, data, where) {
        return new Promise((resolve) => {
            const index = (db[table] || []).findIndex(item => {
                for (let key in where) {
                    if (item[key] !== where[key]) return false;
                }
                return true;
            });
            if (index !== -1) {
                db[table][index] = { 
                    ...db[table][index], 
                    ...data, 
                    updated_at: new Date().toISOString() 
                };
                saveData(table);
                resolve({ changes: 1 });
            } else {
                resolve({ changes: 0 });
            }
        });
    },

    // 删除
    delete(table, where) {
        return new Promise((resolve) => {
            const initialLength = (db[table] || []).length;
            db[table] = (db[table] || []).filter(item => {
                for (let key in where) {
                    if (item[key] === where[key]) return false;
                }
                return true;
            });
            const changes = initialLength - db[table].length;
            if (changes > 0) {
                saveData(table);
            }
            resolve({ changes });
        });
    },

    // SQL 兼容方法 - run
    run(sql, params = []) {
        return new Promise((resolve) => {
            // 解析 INSERT 语句
            if (sql.includes('INSERT INTO')) {
                const match = sql.match(/INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/);
                if (match) {
                    const table = match[1];
                    const columns = match[2].split(',').map(c => c.trim());
                    const data = {};
                    columns.forEach((col, idx) => {
                        data[col] = params[idx];
                    });
                    if (!db[table]) db[table] = [];
                    db[table].push({
                        ...data,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                    saveData(table);
                    resolve({ id: data.id, changes: 1 });
                    return;
                }
            }
            
            // 解析 UPDATE 语句
            if (sql.includes('UPDATE')) {
                const match = sql.match(/UPDATE (\w+) SET (.+) WHERE (.+)/);
                if (match) {
                    const table = match[1];
                    const whereClause = match[3];
                    
                    const whereMatch = whereClause.match(/(\w+) = \?/);
                    if (whereMatch && whereMatch[1] === 'id') {
                        const id = params[params.length - 1];
                        const index = (db[table] || []).findIndex(item => item.id === id);
                        if (index !== -1) {
                            const setMatch = match[2].match(/(\w+) = \?/g);
                            if (setMatch) {
                                setMatch.forEach((setItem, idx) => {
                                    const colMatch = setItem.match(/(\w+) = \?/);
                                    if (colMatch) {
                                        const col = colMatch[1];
                                        if (col !== 'updated_at') {
                                            db[table][index][col] = params[idx];
                                        }
                                    }
                                });
                            }
                            db[table][index].updated_at = new Date().toISOString();
                            saveData(table);
                            resolve({ changes: 1 });
                            return;
                        }
                    }
                }
                resolve({ changes: 0 });
                return;
            }
            
            // 解析 DELETE 语句
            if (sql.includes('DELETE')) {
                const match = sql.match(/DELETE FROM (\w+) WHERE (.+)/);
                if (match) {
                    const table = match[1];
                    const whereClause = match[2];
                    const whereMatch = whereClause.match(/(\w+) = \?/);
                    if (whereMatch && whereMatch[1] === 'id') {
                        const id = params[0];
                        const initialLength = (db[table] || []).length;
                        db[table] = (db[table] || []).filter(item => item.id !== id);
                        const changes = initialLength - db[table].length;
                        if (changes > 0) {
                            saveData(table);
                        }
                        resolve({ changes });
                        return;
                    }
                }
            }
            
            resolve({ id: Date.now(), changes: 1 });
        });
    },

    // SQL 兼容方法 - get
    get(sql, params = []) {
        return new Promise((resolve) => {
            if (sql.includes('FROM users')) {
                const username = params[0];
                const user = db.users.find(u => u.username === username);
                resolve(user || null);
            } else if (sql.includes('FROM company')) {
                resolve(db.company);
            } else {
                resolve(null);
            }
        });
    },

    // SQL 兼容方法 - all
    all(sql, params = []) {
        return new Promise((resolve) => {
            if (sql.includes('FROM banners')) {
                let banners = [...db.banners];
                if (sql.includes('WHERE enabled = 1')) {
                    banners = banners.filter(b => b.enabled === 1);
                }
                banners.sort((a, b) => a.sort - b.sort);
                resolve(banners);
            } else if (sql.includes('FROM products')) {
                resolve(db.products);
            } else if (sql.includes('FROM news')) {
                let news = [...db.news];
                if (sql.includes('ORDER BY date DESC')) {
                    news.sort((a, b) => new Date(b.date) - new Date(a.date));
                }
                resolve(news);
            } else {
                resolve([]);
            }
        });
    }
};

// 初始化
initDatabase();

module.exports = { db, dbAsync, saveData };
