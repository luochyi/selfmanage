# 部署步骤 - 一步步跟着做

## 第一步：登录宝塔面板

浏览器打开：https://8.136.205.144:15559/d89f9fb0
- 用户名：qqnabo0h
- 密码：e48431b9

**⚠️ 登录后第一件事：修改面板密码！**
面板设置 → 修改密码 → 设置一个新密码

---

## 第二步：安装必要软件

登录后，点击左侧 **软件商店**，安装以下软件：

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js项目管理器 | 最新版 | PM2 管理 Node 服务 |
| MySQL | 8.0 | 数据库 |
| Nginx | 最新版 | 反向代理 |
| Docker管理器 | 最新版 | 可选 |

---

## 第三步：创建数据库

1. 左侧点击 **数据库**
2. 点击 **添加数据库**
3. 填写：
   - 数据库名：`fitness_tracker`
   - 用户名：`fitness`
   - 密码：`Fit@2024Secure`（自己记一个强密码）
4. 点击 **提交**

---

## 第四步：上传项目代码

1. 左侧点击 **文件**
2. 进入目录 `/www/wwwroot/`
3. 点击 **上传** → **上传目录**
4. 上传整个 `server` 文件夹（本地路径：`/Users/pd/Desktop/code/selfmanage/server`）

**或者用终端 Git 克隆：**
1. 左侧点击 **终端**
2. 执行：
```bash
cd /www/wwwroot/
git clone https://github.com/luochyi/selfmanage.git fitness-server
```

---

## 第五步：配置环境变量

1. 文件管理器进入 `/www/wwwroot/fitness-server/server/`（或 `/www/wwwroot/server/`）
2. 编辑 `.env` 文件，修改为：

```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=fitness
DB_PASSWORD=Fit@2024Secure
DB_DATABASE=fitness_tracker

JWT_SECRET=fitness-tracker-jwt-2024-secret

WX_APPID=wxf29facc70542b8dc
WX_SECRET=475dd5f16ee9442f4deb7180d5707a8c
```

**注意：DB_PASSWORD 要和第三步创建数据库时的密码一致！**

---

## 第六步：导入数据库表

1. 将本地的 `init.sql` 文件上传到服务器
2. 在终端执行：
```bash
mysql -u fitness -p'Fit@2024Secure' fitness_tracker < /www/wwwroot/fitness-server/init.sql
```
（输入密码后回车）

---

## 第七步：安装依赖并启动服务

在终端依次执行：

```bash
# 进入服务端目录
cd /www/wwwroot/fitness-server/server

# 安装依赖
npm install

# 构建项目
npm run build

# 安装 PM2（如果还没装）
npm install -g pm2

# 启动服务
pm2 start dist/main.js --name fitness-server

# 设置开机自启
pm2 startup
pm2 save
```

**验证服务是否启动成功：**
```bash
curl http://localhost:3000/api/body-parts
```
如果返回 JSON 数据说明成功了！

---

## 第八步：配置 Nginx 反向代理

1. 左侧点击 **网站**
2. 点击 **添加站点**
3. 填写：
   - 域名：`www.pdstudios.me`
   - 根目录：`/www/wwwroot/fitness-server/client/dist`（先随便填，后面改）
   - PHP 版本：**纯静态**
4. 点击 **提交**

5. 点击站点名称 → **设置** → **反向代理**
6. 点击 **添加反向代理**：
   - 代理名称：`api`
   - 目标URL：`http://127.0.0.1:3000`
   - 发送域名：`$host`
7. 点击 **提交**

---

## 第九步：配置 HTTPS

1. 在站点设置中，点击 **SSL**
2. 选择 **Let's Encrypt**
3. 勾选 `www.pdstudios.me`
4. 点击 **申请**
5. 申请成功后，开启 **强制 HTTPS**

**如果申请失败，检查域名 DNS 解析：**
- 域名管理面板添加 A 记录：
  - 主机记录：`www`
  - 记录类型：`A`
  - 记录值：`8.136.205.144`

---

## 第十步：上传代码到 Git

在本地终端执行：
```bash
cd /Users/pd/Desktop/code/selfmanage
git add .
git commit -m "feat: 添加部署配置"
git push origin main
```

---

## 第十一步：构建前端并测试

```bash
cd /Users/pd/Desktop/code/selfmanage/client
npx taro build --type weapp
```

然后将 `client/dist` 目录导入微信开发者工具测试。

---

## 验证清单

- [ ] 宝塔面板能正常访问
- [ ] MySQL 数据库创建成功
- [ ] Node.js 服务启动成功（pm2 status 显示 online）
- [ ] Nginx 反向代理配置成功
- [ ] HTTPS 证书申请成功
- [ ] 浏览器访问 https://www.pdstudios.me/api/body-parts 能返回数据
- [ ] 微信开发者工具中小程序能正常登录

---

## 常见问题

### Q: pm2 显示 error 状态？
```bash
pm2 logs fitness-server
```
查看错误日志，常见原因：
- 数据库密码错误
- 端口被占用

### Q: curl 返回 502 错误？
服务没启动，检查：
```bash
pm2 status
# 如果没有运行，重新启动
pm2 start dist/main.js --name fitness-server
```

### Q: 域名访问不了？
1. 检查阿里云安全组是否开放了 80 和 443 端口
2. 检查域名 DNS 解析是否正确

### Q: 微信小程序请求失败？
1. 确认 HTTPS 证书正常
2. 在微信公众平台配置 request 合法域名：`https://www.pdstudios.me`
