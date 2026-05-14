# 新思考电机 - 后端 API

## 项目介绍

这是新思考电机官网的后端 API 服务，基于 Node.js + Express 开发。

## 技术栈

- **运行环境**: Node.js
- **Web 框架**: Express
- **认证**: JWT (JSON Web Token)
- **文件上传**: Multer
- **跨域**: CORS

## 项目结构

```
shicoh-api/
├── middleware/       # 中间件
│   └── auth.js      # JWT 认证中间件
├── routes/          # 路由
│   ├── auth.js      # 认证相关
│   ├── banners.js   # 轮播图管理
│   ├── products.js  # 产品管理
│   ├── news.js      # 新闻管理
│   ├── company.js   # 企业信息
│   └── upload.js    # 文件上传
├── uploads/         # 上传文件目录
├── server.js        # 入口文件
└── package.json
```

## API 接口列表

### 认证
- `POST /api/auth/login` - 登录
- `GET /api/auth/info` - 获取用户信息
- `POST /api/auth/logout` - 退出登录

### 轮播图
- `GET /api/banners` - 获取轮播图列表
- `POST /api/banners` - 创建轮播图（需认证）
- `PUT /api/banners/:id` - 更新轮播图（需认证）
- `DELETE /api/banners/:id` - 删除轮播图（需认证）

### 产品
- `GET /api/products` - 获取产品列表
- `POST /api/products` - 创建产品（需认证）
- `PUT /api/products/:id` - 更新产品（需认证）
- `DELETE /api/products/:id` - 删除产品（需认证）

### 新闻
- `GET /api/news` - 获取新闻列表
- `POST /api/news` - 创建新闻（需认证）
- `PUT /api/news/:id` - 更新新闻（需认证）
- `DELETE /api/news/:id` - 删除新闻（需认证）

### 企业信息
- `GET /api/company` - 获取企业信息
- `PUT /api/company` - 更新企业信息（需认证）

### 文件上传
- `POST /api/upload` - 上传图片（需认证）

## 安装和运行

### 安装依赖

```bash
cd shicoh-api
npm install
```

### 开发环境运行

```bash
npm run dev
```

或使用 nodemon 自动重启：
```bash
npx nodemon server.js
```

服务器运行在 http://localhost:3002

### 生产环境运行

```bash
npm start
```

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 数据存储

当前使用内存存储数据，重启服务器后数据会丢失。

**生产环境建议**：
- 使用 MySQL/MongoDB 等数据库
- 使用 Redis 存储会话
- 配置环境变量管理密钥

## 环境变量

创建 `.env` 文件：
```
PORT=3002
JWT_SECRET=your-secret-key
```
