# 部署指南

## 方案一：部署到 Render（推荐，免费）

### 步骤

1. **推送代码到 GitHub**
```bash
cd d:/app/ai-biancheng/CatPawAI-Project/shicoh-api
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/shicoh-api.git
git push -u origin main
```

2. **在 Render 上部署**
   - 访问 https://dashboard.render.com/
   - 点击 "New Web Service"
   - 连接你的 GitHub 仓库
   - 选择 `shicoh-api` 仓库
   - 配置：
     - Name: `shicoh-api`
     - Runtime: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - 点击 "Create Web Service"

3. **获取部署地址**
   - 部署完成后，会获得类似 `https://shicoh-api.onrender.com` 的地址
   - API 地址为 `https://shicoh-api.onrender.com/api`

### 注意事项
- Render 免费版会在 15 分钟无访问后休眠，首次访问可能需要等待 30 秒唤醒
- SQLite 数据会持久化存储

---

## 方案二：部署到 Vercel

Vercel 不支持 SQLite 文件写入，需要使用外部数据库（如 Vercel Postgres）。

### 步骤

1. **安装 Vercel CLI**
```bash
npm i -g vercel
```

2. **部署**
```bash
cd d:/app/ai-biancheng/CatPawAI-Project/shicoh-api
vercel
```

---

## 方案三：部署到阿里云/腾讯云服务器

### 步骤

1. **购买云服务器**（推荐 1核2G 配置）

2. **连接服务器**
```bash
ssh root@你的服务器IP
```

3. **安装 Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **上传代码**
```bash
# 本地执行
scp -r d:/app/ai-biancheng/CatPawAI-Project/shicoh-api root@你的服务器IP:/opt/
```

5. **启动服务**
```bash
ssh root@你的服务器IP
cd /opt/shicoh-api
npm install
npm start
```

6. **使用 PM2 守护进程**
```bash
npm install -g pm2
pm2 start server.js --name shicoh-api
pm2 startup
pm2 save
```

7. **配置 Nginx 反向代理**（可选）
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 部署后配置

### 1. 更新官网 API 地址

修改 `shicoh-shouye/js/api.js`：
```javascript
const API_BASE_URL = 'https://你的部署地址/api';
```

### 2. 更新后台管理 API 地址

修改 `shicoh-admin/.env`：
```
VITE_API_BASE_URL=https://你的部署地址/api
```

---

## 验证部署

访问以下地址测试：
- 健康检查：`https://你的部署地址/api/health`
- 获取企业信息：`https://你的部署地址/api/company`

---

## 推荐

- **开发测试**：使用 Render（免费、简单）
- **生产环境**：使用阿里云/腾讯云（稳定、可控）
