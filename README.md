# 纤途无忧 — 健康生活微信小程序

> 一款面向健康生活的微信小程序，集中医体质调理、运动健康记录、积分公益体系于一体。项目采用前后端分离架构，配套完整的可视化后端管理后台。

## 技术栈

| 层级 | 技术 |
|------|------|
| 小程序前端 | 微信小程序原生框架 + TDesign 组件库 + Less |
| 后端服务 | Node.js 18+ + Express |
| 数据库 | MySQL 8.0（Sequelize ORM）|
| 管理后台 | Express + EJS 服务端渲染 + 自定义 CSS 设计系统 |
| 认证方式 | JWT 双 Token（小程序端 Bearer / 管理后台 Cookie）|

## 功能概览

### 小程序端

- **首页仪表盘**：步数记录与圆环进度展示、身体状态（BMI）、饮食/运动概览、今日任务、生理期记录与智能预测
- **运动健康记录**：9 种运动类型选择（含 MET 代谢当量），自动计算热量消耗，日度记录管理
- **中医体质调理**：体质测评、当日药膳推荐、理疗方案查看、生活常识与知识快报
- **积分公益体系**：积分获取/兑换、公益捐赠（积分兑换物资）、成就徽章系统
- **购物商城**：课程/器械/中医产品浏览与购买、购物车管理
- **个人中心**：资料编辑、头像上传、积分记录、徽章展示、成就墙

### 后端服务

- **认证模块**：微信一键登录、短信验证码登录、JWT 双 Token 刷新、token 版本控制登出
- **用户模块**：资料 CRUD、头像上传（base64）、积分流水、每日任务、运动记录、身体数据
- **商城模块**：商品管理、购物车完整增删改查、地址管理
- **管理后台**：数据看板（ECharts 趋势图）、用户管理、积分调整、商品管理、运动数据查看

### 管理后台

位于 `http://localhost:3000/admin/login`，提供完整的数据管理与可视化功能。

## 快速开始

### 前置要求

- Node.js >= 18 LTS
- MySQL >= 8.0
- 微信小程序 AppID（[注册](https://mp.weixin.qq.com/)）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/xian-tu-wu-you.git
cd xian-tu-wu-you
```

### 2. 配置后端

```bash
cd minip-server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

编辑 `.env`，填写以下配置：

| 变量 | 说明 |
|------|------|
| `DB_PASSWORD` | MySQL 密码 |
| `WX_APPID` | 微信小程序 AppID |
| `WX_SECRET` | 微信小程序 AppSecret |
| `JWT_SECRET` | JWT 签名密钥（生产环境请使用强密码） |

### 3. 初始化数据库

```sql
CREATE DATABASE IF NOT EXISTS minip_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

```bash
npm run db:sync
```

### 4. 启动后端

```bash
npm run dev    # 开发模式（热重启）
# 或
npm start      # 生产模式
```

验证：`curl http://localhost:3000/health`

### 5. 配置小程序

1. 打开 `config.js`，将 `baseUrl` 改为你的服务器地址
2. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
3. 在微信开发者工具中打开项目根目录
4. 勾选「不校验合法域名」（开发阶段）
5. 编译运行

### 6. 访问管理后台

打开 `http://localhost:3000/admin/login`

- 账号：`admin`
- 密码：`admin123`

> ⚠️ 首次登录后请立即修改默认密码。

## 项目结构

```
minip/
├── app.js / app.json / app.less   # 小程序入口配置
├── config.js                       # 全局配置（baseUrl）
├── pages/                          # 小程序页面
│   ├── home/                       # 首页（步数、BMI、任务、生理期）
│   ├── home/record/                # 运动记录
│   ├── home/plan/                  # 身体数据与计划
│   ├── home/mall/                  # 积分商城
│   ├── home/points/                # 积分历史
│   ├── home/course/                # 课程与视频
│   ├── tcm/                        # 中医体质、药膳、知识
│   ├── my/                         # 个人中心、资料编辑、徽章
│   ├── login/                      # 微信登录
│   ├── setting/                    # 系统设置
│   └── travel/                     # 出行路线
├── api/                            # 网络请求封装
├── utils/                          # 工具库
│   ├── auth.js                     # 微信登录流程
│   ├── points.js                   # 积分同步
│   ├── tasks.js                    # 任务系统
│   ├── badges.js                   # 成就徽章
│   └── eventBus.js                 # 页面间通信
├── components/                     # 公共组件
├── minip-server/                   # 后端服务
│   ├── app.js                      # Express 入口
│   ├── config/                     # 数据库/微信配置
│   ├── controllers/                # 业务控制器
│   ├── middlewares/                # 认证/权限中间件
│   ├── models/                     # Sequelize 数据模型
│   ├── routes/                     # API 路由
│   ├── scripts/                    # 数据库初始化
│   ├── utils/                      # JWT / 微信 / SMS 工具
│   ├── views/admin/                # EJS 管理后台模板
│   └── static/css/admin.css        # 管理后台样式
└── COMPLETE_GUIDE.md               # 详细部署与开发文档
```

## API 概览

### 小程序接口（前缀 `/api`）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/auth/wechat-login` | POST | 微信登录 |
| `/auth/sms-login` | POST | 短信验证码登录 |
| `/auth/refresh` | POST | 刷新 Token |
| `/user/profile` | GET/PUT | 用户资料 |
| `/user/avatar` | PUT | 上传头像 |
| `/user/points` | GET/POST | 积分查询/新增 |
| `/user/points/history` | GET | 积分流水 |
| `/user/daily-task` | GET/POST | 每日任务 |
| `/user/exercise` | GET/POST | 运动记录 |
| `/user/body-data` | GET/POST | 身体数据 |
| `/cart` | GET/POST/PUT/DELETE | 购物车 |
| `/address` | GET/POST/PUT/DELETE | 地址管理 |

## 开源协议

本项目基于 [MIT](LICENSE) 协议开源。
