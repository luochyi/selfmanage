# 阿里云 + 宝塔面板部署指南

## 前置要求

- 阿里云 ECS 服务器（推荐 2核4G）
- 宝塔面板已安装
- 域名已备案（微信小程序要求 HTTPS）

## 一、服务器环境配置

### 1. 宝塔面板安装软件

登录宝塔面板，在 **软件商店** 中安装：
- Node.js 项目管理器（PM2）
- MySQL 8.0
- Nginx（最新版）
- Docker（可选）

### 2. 创建数据库

宝塔 → **数据库** → **添加数据库**：
- 数据库名：`fitness_tracker`
- 用户名：`fitness`
- 密码：设置一个强密码（记住这个密码）
- 备注：健身记录数据库

### 3. 导入数据表

宝塔 → **数据库** → 点击 `fitness_tracker` → **导入** → 上传 `init.sql` 文件

## 二、部署后端服务

### 方案A：PM2 部署（推荐，简单）

#### 1. 上传代码

宝塔 → **文件** → 进入 `/www/wwwroot/` → 创建文件夹 `fitness-server`

将整个项目上传到 `/www/wwwroot/fitness-server/`

或者在终端执行：
```bash
cd /www/wwwroot/
git clone https://github.com/luochyi/selfmanage.git fitness-server
```

#### 2. 配置环境变量

宝塔 → **文件** → 编辑 `/www/wwwroot/fitness-server/server/.env`：

```env
PORT=3000
NODE_ENV=production

# 数据库配置（替换成你的密码）
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=fitness
DB_PASSWORD=你的数据库密码
DB_DATABASE=fitness_tracker

# JWT 密钥
JWT_SECRET=your-random-secret-key-here

# 微信小程序
WX_APPID=wxf29facc70542b8dc
WX_SECRET=475dd5f16ee9442f4deb7180d5707a8c
```

#### 3. 安装依赖并构建

宝塔 → **终端**，执行：

```bash
cd /www/wwwroot/fitness-server/server

# 安装依赖
npm install

# 构建项目
npm run build
```

#### 4. 启动服务

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start dist/main.js --name fitness-server

# 查看状态
pm2 status

# 查看日志
pm2 logs fitness-server

# 设置开机自启
pm2 startup
pm2 save
```

### 方案B：Docker 部署（可选）

```bash
cd /www/wwwroot/fitness-server
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 三、配置 Nginx 反向代理

### 1. 添加站点

宝塔 → **网站** → **添加站点**：
- 域名：`your-domain.com`（你的域名）
- 根目录：`/www/wwwroot/fitness-server/client/dist`（前端构建产物）
- PHP 版本：选择 **纯静态**

### 2. 配置反向代理

点击站点名称 → **设置** → **反向代理** → **添加反向代理**：

- 代理名称：`api`
- 目标 URL：`http://127.0.0.1:3000`
- 发送域名：`$host`

或者手动编辑 Nginx 配置：

```nginx
# 反向代理 API
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

## 四、配置 HTTPS

### 1. 申请 SSL 证书

宝塔 → **网站** → 点击站点名称 → **SSL**：
- 选择 **Let's Encrypt**
- 勾选域名
- 点击 **申请**

### 2. 强制 HTTPS

在 SSL 设置中，开启 **强制 HTTPS**

## 五、更新前端配置

### 1. 修改 API 地址

编辑 `client/src/config/index.ts`，将 production 的 baseUrl 改为你的域名：

```typescript
production: {
  baseUrl: 'https://your-domain.com/api',
},
```

### 2. 构建前端

```bash
cd /www/wwwroot/fitness-server/client

# 安装依赖
npm install

# 构建小程序
npx taro build --type weapp
```

### 3. 上传到微信开发者工具

将 `client/dist` 目录导入微信开发者工具

## 六、微信小程序配置

### 1. 配置合法域名

登录 [微信公众平台](https://mp.weixin.qq.com/)：
- 开发 → 开发管理 → 开发设置 → 服务器域名
- request 合法域名添加：`https://your-domain.com`

### 2. 测试登录

在小程序中使用「开发测试登录」功能验证

## 常见问题

### 1. 数据库连接失败
检查 `.env` 中的数据库配置是否正确

### 2. 端口被占用
```bash
# 查看占用端口的进程
netstat -tlnp | grep 3000

# 杀掉进程
kill -9 PID
```

### 3. PM2 服务崩溃
```bash
# 查看错误日志
pm2 logs fitness-server

# 重启服务
pm2 restart fitness-server
```

### 4. Nginx 502 错误
确认后端服务已启动：
```bash
pm2 status
curl http://localhost:3000/api/body-parts
```

## 服务器安全建议

1. 修改宝塔面板默认端口
2. 设置强密码
3. 开启防火墙，只开放必要端口（80, 443, 22）
4. 定期备份数据库
