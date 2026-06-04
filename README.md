# 健身记录小程序

一个基于 Taro + NestJS 的健身记录微信小程序，帮助用户记录每日训练数据。

## 功能特性

- 📅 日历视图：直观查看每月训练记录
- 💪 训练记录：记录训练部位、动作、重量、组数、次数
- 👤 微信登录：每个用户独立数据，互不干扰
- 📱 移动端优化：专为手机端设计的交互体验

## 技术栈

### 前端
- Taro 3 + React + TypeScript
- TDesign 小程序组件库
- SCSS 样式

### 后端
- NestJS + TypeORM
- MySQL 8.0
- JWT 认证
- Docker 容器化

## 项目结构

```
fitness-tracker/
├── client/                    # Taro 小程序前端
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── utils/            # 工具函数
│   │   └── services/         # API 请求
│   ├── config/               # Taro 配置
│   └── package.json
│
├── server/                    # NestJS 后端
│   ├── src/
│   │   ├── entities/         # 数据库实体
│   │   ├── modules/          # 业务模块
│   │   │   ├── auth/         # 认证模块
│   │   │   ├── user/         # 用户模块
│   │   │   ├── workout/      # 训练模块
│   │   │   ├── exercise/     # 动作模块
│   │   │   └── body-part/    # 部位模块
│   │   └── guards/           # 认证守卫
│   ├── config/               # 配置文件
│   └── package.json
│
├── docker-compose.yml        # Docker 编排
├── init.sql                  # 数据库初始化
└── README.md
```

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js 18+
- npm 或 yarn
- Docker 和 Docker Compose（可选）
- 微信开发者工具

### 2. 启动数据库

```bash
# 使用 Docker 启动 MySQL
docker-compose up -d mysql

# 或者手动安装 MySQL 并执行初始化脚本
mysql -u root -p < init.sql
```

### 3. 启动后端服务

```bash
cd server

# 安装依赖
npm install

# 配置环境变量（复制 .env.example 并修改）
cp .env.example .env

# 启动开发服务器
npm run start:dev
```

### 4. 启动前端小程序

```bash
cd client

# 安装依赖
npm install

# 启动微信小程序开发
npm run dev:weapp
```

### 5. 微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `client/dist` 目录
3. 配置 AppID（可在微信公众平台申请）
4. 开始开发调试

## 环境变量配置

### 后端环境变量（.env）

```env
# 服务配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=fitness_tracker

# JWT 配置
JWT_SECRET=your-jwt-secret

# 微信小程序配置
WX_APPID=your-appid
WX_SECRET=your-secret
```

## API 接口

### 认证接口
- `GET /api/auth/wx-login?code=xxx` - 微信登录

### 训练记录
- `GET /api/workouts?month=2026-06` - 获取月度训练数据
- `GET /api/workouts/:id` - 获取训练详情
- `POST /api/workouts` - 创建训练记录
- `PUT /api/workouts/:id` - 更新训练记录
- `DELETE /api/workouts/:id` - 删除训练记录

### 基础数据
- `GET /api/body-parts` - 获取训练部位列表
- `GET /api/exercises?bodyPartId=1` - 获取动作列表

## 预置数据

### 训练部位
- 胸、背、腿、肩、手臂、核心

### 常用动作
- **胸部**：卧推、上斜卧推、哑铃飞鸟、龙门架夹胸、俯卧撑
- **背部**：高位下拉、引体向上、杠铃划船、单边划船、后拉
- **腿部**：深蹲、腿举、腿弯举、腿屈伸、硬拉
- **肩部**：推举、侧平举、面拉、绕肩、前平举
- **手臂**：弯举、三头下压、锤式弯举、窄距卧推、颈后臂屈伸
- **核心**：卷腹、平板支撑、悬垂举腿、俄罗斯转体、死虫

## 部署

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境配置

1. 修改 `docker-compose.yml` 中的环境变量
2. 配置微信小程序 AppID 和 Secret
3. 配置数据库密码
4. 配置 JWT 密钥

## 开发说明

### 代码规范
- 遵循 TypeScript 严格模式
- 使用 ESLint 和 Prettier 格式化代码
- 组件采用函数式组件 + Hooks

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式（不影响功能）
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

## License

MIT