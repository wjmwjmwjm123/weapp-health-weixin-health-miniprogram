# 纤途无忧 — 小程序后端 + 管理后台 完成清单与部署指南

> 本文档汇总项目全部已实现功能、系统架构与本地部署操作，面向大创项目开发、测试与答辩演示场景。

---

## 一、项目概述

**纤途无忧** 是一款面向健康生活的微信小程序，集中医体质调理、运动健康记录、积分公益体系于一体。项目采用前后端分离架构，配套完整的可视化后端管理后台。

### 技术栈

| 层级 | 技术 |
|------|------|
| 小程序前端 | 微信小程序原生框架 + TDesign 组件库 + Less |
| 后端服务 | Node.js 18+ + Express |
| 数据库 | MySQL 8.0（Sequelize ORM）|
| 管理后台 | Express + EJS 服务端渲染 + 自定义 CSS 设计系统 |
| 认证方式 | JWT Token（小程序端 Bearer / 管理后台 Cookie）|

### 目录结构

```
minip/
├── app.js / app.json / app.less       # 小程序入口
├── pages/                             # 小程序页面
│   ├── home/                          # 首页（Dashboard + 步数）
│   ├── tcm/                           # 中医体质/药膳
│   ├── my/                            # 个人中心（积分/公益/设置）
│   ├── login/                         # 微信登录（头像昵称填写）
│   ├── loginCode/                     # 短信验证码登录
│   └── travel/                        # 旅行模块
├── components/                        # 公共组件（Card、Nav）
├── utils/                             # 前端工具库（auth、points、tasks、badges、eventBus）
├── api/                               # 网络请求封装（request.js）
├── config.js                          # 全局配置（baseUrl 等）
├── minip-server/                      # Node.js 后端服务
│   ├── app.js                         # Express 入口
│   ├── config/                        # 数据库/微信配置
│   ├── controllers/                   # 业务控制器
│   ├── middlewares/                   # 认证/权限中间件
│   ├── models/                        # Sequelize 数据模型（8 张核心表）
│   ├── routes/                        # API 路由
│   ├── scripts/                       # db-sync.js 一键建表+初始化
│   ├── utils/                         # JWT / 微信 / SMS 工具
│   ├── views/admin/                   # EJS 管理后台模板
│   └── static/css/admin.css           # 管理后台设计系统样式
├── mock/                              # 前端 Mock 数据（离线开发）
└── external/gaode_app_js/             # 高德地图 SDK 及示例
```

---

## 二、功能完成清单

### 2.1 后端系统（minip-server）

#### 数据库与模型层（已完成）

| 数据表 | 说明 |
|--------|------|
| `users` | 用户表（openid、nickname、avatar_url、points、gender、session_key、role、password_hash）|
| `merchants` | 商家表 |
| `user_addresses` | 用户地址表 |
| `products` | 商品表 |
| `cart_items` | 购物车表 |
| `points_history` | 积分历史流水表 |
| `daily_tasks` | 每日任务表 |
| `exercise_records` | 运动记录表（含 steps 步数字段）|
| `body_data` | 身体数据表（身高、体重、BMI）|

- 模型关联：User 与 Address、CartItem、PointsHistory、DailyTask、ExerciseRecord、BodyData 建立一对多关联
- 数据同步：`scripts/db-sync.js` 支持一键建表、结构同步、初始化 6 条默认商品数据

#### 认证模块（已完成）

- **JWT 工具**（`utils/jwt.js`）：Token 生成、验证、刷新，支持 `token_version` 版本控制
- **微信登录**（`utils/wechat.js`）：封装 `code2Session`，换取 openid 与 session_key
- **认证中间件**（`middlewares/auth.js`）：Bearer Token 解析、过期校验、版本一致性检查
- **认证控制器**：
  - `POST /api/auth/wechat-login` — 微信一键登录
  - `POST /api/auth/sms-code` — 短信验证码发送（Mock 阶段）
  - `POST /api/auth/sms-login` — 验证码登录
  - `POST /api/auth/refresh` — 刷新 access_token
  - `POST /api/auth/logout` — 登出（递增 token_version 使旧令牌失效）
- **安全加固**：修复 JWT 密钥硬编码、添加 CORS 白名单、补充速率限制

#### 用户业务模块（已完成）

- **用户资料**：`GET /api/user/profile`、`PUT /api/user/profile`（支持 nickname/gender/birth/city/province/brief/star）
- **头像上传**：`PUT /api/user/avatar` 支持 base64 解析与持久化存储，返回完整访问 URL
- **积分体系**：
  - `GET /api/user/points` — 同步积分（本地与后端取较大值）
  - `POST /api/user/points` — 新增积分记录（earn/spend/deduct）
  - `GET /api/user/points/history` — 积分历史查询
- **每日任务**：`GET /api/user/daily-task`、`POST /api/user/daily-task/complete`
- **运动记录**：`GET /api/user/exercise`、`POST /api/user/exercise`（支持 steps 字段）
- **身体数据**：`GET /api/user/body-data`、`POST /api/user/body-data`
- **购物车**：完整增删改查接口
- **地址管理**：完整增删改查接口

#### 管理后台模块（已完成）

| 功能 | 说明 |
|------|------|
| 管理员登录 | Cookie 存储 JWT，EJS 渲染登录页 |
| 数据看板 | 用户总数、今日新增、积分总量、公益捐赠总额、运动统计、近7天用户增长趋势图（ECharts）|
| 用户管理 | 列表查询（搜索/分页）、编辑用户（昵称/性别/城市/省份/简介）、删除用户（级联删除关联数据）、手动调整积分（增加/扣除，同步写入积分流水）|
| 积分流水 | 查看全部用户积分变动记录，支持类型筛选与用户昵称搜索 |
| 运动数据 | 查看用户运动记录列表，支持用户昵称搜索 |
| 商品管理 | 商品的增删查改，模态框表单交互 |

- 管理后台采用统一 CSS 设计系统（`admin.css`），暖色调配色，支持模态框动画、表格行悬停、响应式布局

#### 静态资源服务（已完成）

- `express.static` 提供 `/static/avatars/` 目录访问，支持头像文件持久化

---

### 2.2 小程序前端（已完成）

#### 网络请求层

- **request.js**：统一封装 `wx.request`，自动附加 Authorization Header、处理 401 自动刷新、标准化返回 `{ code, message, data }`
- **配置迁移**：`baseUrl` 支持 localhost / 局域网 IP 切换，关闭 `urlCheck` 支持真机调试

#### 认证与登录

- **微信登录**（`utils/auth.js`）：后端优先 + 本地回退双模式；修复 `res.data || res` 重复解包 Bug；适配微信隐私策略，移除失效的 `wx.getUserProfile`
- **短信登录**（`pages/loginCode/index.js`）：对接 `POST /api/auth/sms-code` 与 `POST /api/auth/sms-login`
- **退出登录**（`pages/setting/index.js`）：对接 `POST /api/auth/logout`，清除本地 token 及用户缓存

#### 用户资料同步

- **我的页面**（`pages/my/index.js`）：`onShow` 优先调用 `GET /api/user/profile` 获取最新资料，失败回退本地缓存；同步更新积分数据
- **资料编辑**（`pages/my/info-edit/index.js`）：对接 `PUT /api/user/profile`，失败时仅存本地

#### UI 重构（已完成）

| 页面 | 改造内容 |
|------|----------|
| 首页（home）| 顶部 Dashboard 浅蓝渐变、自定义头像组件（加载失败降级）、步数圆环展示 |
| 中医（tcm）| 去除卡片堆积 → 扁平列表；Hero 区改为 CSS 渐变；当日药膳移除图片依赖；统一棕褐+暖金配色 |
| 登录（login）| Hero 背景图 + 渐变遮罩；功能亮点标签；绿色胶囊登录按钮；chooseAvatar + nickname 输入 |
| 我的（my）| 去卡片化 → 顶部淡蓝渐变、模块扁平列表；头像空时渐变圆形 + 昵称首字母降级 |

---

### 2.3 积分与公益体系（已完成）

- **积分同步**：`utils/points.js` 统一入口；`syncPointsFromBackend()` 取本地与后端较大值
- **积分兑换**：`pages/my/index.js` 实现完整兑换流程（检查余额 → 弹窗确认 → 扣除积分 → 刷新页面）
- **公益捐赠**：每 80 积分 = 1 份物资；`onDonate()` 实现扣除积分 → 更新累计捐赠 → 触发成就徽章
- **数据一致性修复**：
  - 公益余额取消 `Math.floor(points * 0.35)` 截断，改为 `charity = Math.max(0, points)`
  - 修复 `onDonate` 更新时序错误（先 `setStorageSync` 再 `updatePointsData`）
  - `calculateWeeklyGrowth` 补充处理 `deduct` 类型

---

### 2.4 运动数据后端化（已完成）

- **移除微信运动依赖**：彻底删除 `wx.getWeRunData` 相关逻辑
- **模型扩展**：`ExerciseRecord` 新增 `steps` 字段
- **前端同步**：
  - `loadStepsFromBackend()`：`onShow` 自动拉取今日步数
  - `refreshSteps()`：顶部刷新按钮触发后端同步
  - `setManualSteps()`：手动输入步数后 POST 到后端持久化

---

### 2.5 模板残留清理（已完成）

- **彻底删除**：`pages/dataCenter/`、`pages/search/` 整个目录及页面文件
- **组件清理**：`components/nav/index.js` 移除搜索导航项与 `t-search` 引用
- **Mock 清理**：删除 `mock/login/` 全部文件；清理 `mock/my/getServiceList.js` 中重复入口
- **冗余代码**：`utils/auth.js` 删除 Mock 登录函数；`pages/home/index.js` 删除 `getWeChatSteps`

---

## 三、关键 Bug 修复记录

| 问题 | 根因 | 修复方案 |
|------|------|----------|
| 后端登录成功但前端提示失败 | `auth.js` 对 request.js 已标准化响应重复解包 (`res.data \|\| res`) | 直接使用 `result` 对象 |
| 积分与公益余额不一致 | `charity` 错误按 `points * 0.35` 截断 | 改为 `charity = points` |
| 捐赠后数据未刷新 | `updatePointsData` 在 `totalDonated` 更新前调用 | 调整更新顺序 |
| weeklyGrowth 计算错误 | 仅处理 `spend`，未处理 `deduct` | 条件改为 `spend \|\| deduct` |
| 头像加载显示空白 | `t-avatar` 加载失败无降级 | 自定义 image + `binderror` + 昵称首字母降级 |
| 退出登录积分不清0 | `clearLoginData` 未清除 `user_points` | 扩展清除全部积分缓存 |
| auth.js 变量未定义 | 重构后 4 处 `wxUserInfo` 未改为 `profileInfo` | 全局修正变量名 |
| 管理后台用户统计不一致 | `getDashboardStats` 未过滤 `role='user'` | `User.count` 增加 `where: { role: 'user' }` |
| 管理员账号无法登录 | db-sync 初始化时 nickname 为 `管理员` 而非 `admin` | 修正为 `nickname='admin'`，并增加已有账号更新逻辑 |

---

## 四、部署方式

### 4.1 环境要求

| 软件 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18 LTS | 运行后端服务 |
| MySQL | >= 8.0 | 数据持久化 |
| npm | >= 8 | 包管理 |
| 微信开发者工具 | 最新版 | 小程序调试与预览 |

验证安装：

```bash
node -v
npm -v
```

### 4.2 MySQL 安装与配置

1. 运行 MySQL Installer，选择 **"Server only"** 模式安装
2. 记住 root 密码（如 `123456`）
3. 确保 MySQL 服务正在运行

创建数据库：

```sql
CREATE DATABASE IF NOT EXISTS minip_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 4.3 后端部署步骤（本地 / 服务器通用）

```bash
# 1. 进入后端目录
cd minip-server

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 用记事本编辑 .env，填写以下关键配置：
#   DB_PASSWORD=你的MySQL密码
#   WX_APPID=你的小程序AppID
#   WX_SECRET=你的小程序AppSecret
#   JWT_SECRET=随机强密码（生产环境务必复杂）

# 4. 同步数据库（建表 + 初始化商品数据 + 创建默认管理员）
npm run db:sync

# 5. 启动服务
npm start          # 生产模式
# 或
npm run dev        # 开发模式（代码修改自动重启）
```

启动后验证：

```bash
curl http://localhost:3000/health
# 预期返回：{ "code": 200, "message": "ok", "data": { "status": "running" } }
```

### 4.4 小程序配置与真机调试

1. **修改后端地址**：打开 `minip/config.js`，将 `baseUrl` 改为电脑局域网 IP：

```javascript
baseUrl: 'http://192.168.x.x:3000'
```

> 获取 IP：CMD 执行 `ipconfig`，查看 `IPv4 地址`

2. **微信开发者工具设置**：
   - 右上角 **详情** → **本地设置** → 勾选 **"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"**
   - 确保手机和电脑连接 **同一 WiFi**

3. **真机预览**：点击开发者工具顶部 **真机调试** → 扫码即可

### 4.5 管理后台访问

```
http://localhost:3000/admin/login
```

默认管理员账号：

- 账号：`admin`
- 密码：`admin123`

> 首次登录后建议通过数据库或后续扩展功能修改默认密码。

---

## 五、API 接口速查

### 小程序端接口（前缀 `/api`）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/wechat-login` | POST | 微信一键登录 |
| `/api/auth/sms-code` | POST | 发送短信验证码 |
| `/api/auth/sms-login` | POST | 验证码登录 |
| `/api/auth/refresh` | POST | 刷新 access_token |
| `/api/auth/logout` | POST | 登出 |
| `/api/user/profile` | GET/PUT | 获取/更新用户信息 |
| `/api/user/avatar` | PUT | 上传头像（base64）|
| `/api/user/points` | GET/POST | 同步积分 / 新增积分记录 |
| `/api/user/points/history` | GET | 积分历史 |
| `/api/user/daily-task` | GET | 获取每日任务 |
| `/api/user/daily-task/complete` | POST | 完成任务 |
| `/api/user/exercise` | GET/POST | 运动记录查询/新增 |
| `/api/user/body-data` | GET/POST | 身体数据查询/新增 |
| `/api/cart` | GET/POST/PUT/DELETE | 购物车 CRUD |
| `/api/address` | GET/POST/PUT/DELETE | 地址管理 CRUD |

### 管理后台接口（前缀 `/admin/api`，需管理员 Cookie 认证）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin/login` | POST | 管理员登录（返回 Cookie）|
| `/admin/logout` | GET | 登出并清除 Cookie |
| `/admin/api/dashboard-stats` | GET | 数据看板统计 |
| `/admin/api/users` | GET | 用户列表（分页/搜索）|
| `/admin/api/users/:id` | PUT | 编辑用户信息 |
| `/admin/api/users/:id` | DELETE | 删除用户（级联关联数据）|
| `/admin/api/users/:id/points` | POST | 调整用户积分（增加/扣除）|
| `/admin/api/points` | GET | 积分流水（分页/筛选/搜索）|
| `/admin/api/exercises` | GET | 运动数据（分页/搜索）|
| `/admin/api/products` | GET/POST | 商品列表/创建 |
| `/admin/api/products/:id` | PUT/DELETE | 编辑/删除商品 |

---

## 六、常见问题排查

| 问题 | 排查步骤 |
|------|----------|
| `npm install` 报错 | 检查 `node -v`；Windows 以管理员运行 PowerShell；尝试 `npm install --registry=https://registry.npmmirror.com` |
| `db:sync` 提示 `Access denied` | 检查 `.env` 中 `DB_PASSWORD` 是否与 MySQL 安装时设置的一致 |
| 小程序真机预览接口报错 | 检查手机和电脑是否同一 WiFi；防火墙是否放行 3000 端口；`config.js` 的 `baseUrl` 是否为局域网 IP；开发者工具是否勾选「不校验合法域名」|
| 微信登录失败 | 检查 `.env` 中 `WX_APPID` 和 `WX_SECRET` 是否正确；`WX_SECRET` 不是 AppID；后端服务是否正常运行 |
| 管理后台登录 401 | 检查 `db-sync` 是否正常执行；数据库中 `users` 表是否有 `role='admin'` 且 `nickname='admin'` 的记录 |
| 如何重启后端 | `npm start` 启动的按 `Ctrl + C` 停止，再重新执行 `npm start` |
| 如何更新表结构 | 修改模型后重新执行 `npm run db:sync`（不会删除已有数据）|
| 积分调整不生效 | 检查 `users` 表 `points` 字段是否为整数；`points_history` 是否正常写入记录 |

---

## 七、开发注意事项

1. **数据库**：项目使用 MySQL，生产环境请确保 MySQL 服务已启动且数据库已创建。配置位于 `config/database.js`，通过 `.env` 读取连接信息。
2. **Token 失效**：管理员修改密码或调用登出后，Cookie 中的 `admin_token` 会失效，需重新登录。
3. **跨域**：本地调试时开启微信开发者工具「不校验合法域名」；如需上线，需在微信公众平台配置 HTTPS 合法域名。
4. **高德地图**：如需使用地图功能，请在 `external/gaode_app_js/libs/config.js` 中配置高德 Key。
5. **路径别名**：小程序端统一使用 `~/*` 映射到项目根目录，避免相对路径混乱。
6. **Storage 规范**：本地存储键名统一为 `user_points`、`points_history`、`steps_YYYY-MM-DD` 等。
7. **事件总线**：`utils/eventBus.js` 实现页面间通信（登录成功、积分变化、缓存清除等）。
8. **Mock 机制**：保留 `mock/` 目录用于离线开发，线上自动切换后端接口。

---

## 八、后续可扩展方向

- [ ] 管理员账号管理页面（在后台直接增删改管理员）
- [ ] 订单管理模块
- [ ] 数据导出（Excel / CSV）
- [ ] 操作日志审计
- [ ] 小程序端消息推送（订阅消息）
- [ ] 高德地图完整集成（定位、导航）

---

> 本文档由项目现有 `README.md`、`DEPLOY_GUIDE.md`、`PROJECT_SUMMARY.md` 整合而成，覆盖功能清单、Bug 修复、部署流程与运维指南。
