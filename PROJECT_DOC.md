# TDesign 健康生活小程序 — 项目文档

## 一、项目概述

本项目是一款基于 **微信小程序** 的健康生活综合服务平台，融合了 **健康管理、中医养生、户外旅行、社区互动** 四大核心场景，旨在为用户提供一站式身心健康管理体验。

- **项目名称**：tdesign-miniprogram-starter
- **版本**：0.0.2
- **许可**：MIT
- **基础库版本**：3.11.3
- **AppID**：wx85006c850dc6a477

---

## 二、技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | 微信小程序原生 | 基础框架 |
| UI 组件库 | TDesign Miniprogram v1.8.6 | 腾讯开源企业级组件库 |
| CSS 预处理 | Less | 项目配置启用 Less 编译 |
| 日期处理 | dayjs | 轻量级日期库 |
| 颜色处理 | tinycolor2 | 颜色解析与操作 |
| 地图服务 | 高德地图 SDK (amap-wx) | 定位与地图服务 |
| 代码规范 | ESLint + Airbnb + Prettier | 代码质量保障 |
| Mock 方案 | 自研 WxMock | 拦截 wx.request 实现本地 Mock |

---

## 三、项目结构

```
minip/
├── api/                    # 网络请求封装
│   └── request.js          # 统一请求方法（含 Token 注入）
├── behaviors/              # Behavior 复用逻辑
│   └── useToast.js         # Toast 提示 Behavior
├── components/             # 公共组件
│   ├── card/               # 卡片组件
│   └── nav/                # 顶部导航组件（含侧边栏路由）
├── config/                 # 应用配置
│   └── index.js            # Mock 开关
├── custom-tab-bar/         # 自定义 TabBar
│   ├── index.js/json/less/wxml
├── external/               # 外部模块（高德地图示例）
│   └── gaode_app_js/       # 高德地图小程序 SDK 及示例
├── miniprogram_npm/        # npm 构建产物
│   ├── dayjs/
│   ├── tdesign-miniprogram/
│   └── tinycolor2/
├── mock/                   # Mock 数据层
│   ├── WxMock.js           # wx.request 拦截器
│   ├── mock.js             # Mock.js 库
│   ├── request.js          # Mock 请求封装
│   ├── login/              # 登录模块 Mock
│   ├── home/               # 首页模块 Mock
│   ├── search/             # 搜索模块 Mock
│   ├── dataCenter/         # 数据中心 Mock
│   └── my/                 # 个人中心 Mock
├── pages/                  # 页面目录
│   ├── home/               # 首页模块（主 Tab）
│   ├── tcm/                # 中医模块（主 Tab）
│   ├── travel/             # 旅行模块（主 Tab）
│   ├── my/                 # 个人中心（主 Tab）
│   ├── dataCenter/         # 数据看板
│   ├── login/              # 登录页
│   ├── loginCode/          # 验证码登录页
│   ├── search/             # 搜索页
│   ├── setting/            # 设置页
│   └── release/            # 发布页
├── static/                 # 静态资源（图片）
├── utils/                  # 工具函数
│   ├── auth.js             # 用户认证（登录/登出/状态检查）
│   ├── badges.js           # 成就系统
│   ├── cart.js             # 购物车
│   ├── clearStorage.js     # 缓存清理
│   ├── eventBus.js         # 全局事件总线
│   ├── points.js           # 积分系统
│   ├── tasks.js            # 任务系统
│   └── util.js             # 通用工具函数
├── variable.less           # 全局 Less 变量
├── app.js                  # 应用入口
├── app.json                # 全局配置
├── app.less                # 全局样式
└── config.js               # 后端服务器地址配置
```

---

## 四、核心模块详解

### 4.1 首页模块（Home）

**路径**：`pages/home/`

首页是用户的核心交互入口，整合了健康数据的可视化展示与快捷功能入口。

#### 主要功能

| 功能 | 说明 |
|------|------|
| Dashboard 仪表盘 | 展示用户头像、积分、步数环形进度、卡路里消耗 |
| 步数追踪 | 对接微信运动 API，支持自动同步和手动输入步数 |
| 每日任务系统 | 签到、视频打卡、学习健康知识 3 项每日任务 |
| 身体数据卡片 | 体重/BMI/目标体重状态展示 |
| 今日摄入概览 | 饮食卡路里与运动消耗数据 |
| 女性健康记录 | 生理期智能预测（加权平均周期、趋势分析、预测范围） |
| 功能入口金刚区 | 个性化减脂计划、视频跟练、记录、商城 4 个入口 |

#### 子页面

- **个性化减脂计划** (`pages/home/plan/index`) — 输入身高/体重/目标体重/饮食偏好/运动水平，自动计算 BMI、BMR，生成周计划
- **视频跟练课程** (`pages/home/course/index`) — 按难度（初/中/高）和场景（家/办公室/户外）分类，智能推荐，完成后获积分
- **课程详情** (`pages/home/course/detail/index`) — 单个课程的详情页
- **每日记录** (`pages/home/record/index`) — 记录体重、饮食卡路里、睡眠、运动、生理期
- **商城** (`pages/home/mall/index`) — 课程/设备/中医商品三级分类，支持购物车
- **购物车** (`pages/home/mall/cart`) — 购物车管理
- **积分中心** (`pages/home/points/index`) — 积分余额与历史记录

---

### 4.2 中医模块（TCM）

**路径**：`pages/tcm/`

提供中医养生服务，涵盖体质测评、药膳食谱、理疗服务、健康知识等。

#### 主要功能

| 功能 | 说明 |
|------|------|
| 健康概览 | 显示体质类型、调理建议、聚焦提醒 |
| 快捷操作 | 体质测评、当日药膳、图文问诊、调护课堂 |
| 当日药膳推荐 | 5 道药膳随机推荐（黄芪山药燕麦粥、荷叶陈皮清脂茶等） |
| 理疗方案 | 艾灸/足浴/刮痧/拔罐/淋巴排浊等服务展示 |
| 健康知识流 | 文章列表（湿气信号、三伏贴、艾草配方等） |
| 生活调护 | 晚睡护肝、手脚冰凉调护、久坐护眼等实用指南 |

#### 子页面

- **药膳食谱** (`pages/tcm/medicated-diet/index`) — 详细药膳制作教学
- **理疗服务** (`pages/tcm/therapy/index`) — 理疗项目预约
- **健康知识** (`pages/tcm/knowledge/index`) — 健康文章详情
- **生活调护** (`pages/tcm/life/index`) — 调护方案详情
- **图文问诊** (`pages/tcm/consult/index`) — 在线中医问诊

---

### 4.3 旅行模块（Travel）

**路径**：`pages/travel/`

健康旅行与户外运动服务，结合运动数据与地理位置推荐路线。

#### 主要功能

| 功能 | 说明 |
|------|------|
| 定位与路线推荐 | 基于微信定位，推荐附近徒步/骑行路线 |
| AI 路线生成 | 随机生成古城慢游、河畔夜骑、森林徒步等路线 |
| 路线收藏 | 收藏/取消收藏路线 |
| 旅行挑战 | 周末徒步打卡、古村文化行走等挑战任务，完成获积分 |
| 路线汇总 | 统计总距离和总卡路里消耗 |

#### 默认路线

1. 城市绿道晨跑 — 6.5km / 70min / 320kcal
2. 森林公园骑行 — 12.2km / 80min / 460kcal
3. 老街文化漫行 — 8.1km / 95min / 380kcal

---

### 4.4 个人中心（My）

**路径**：`pages/my/`

用户个人信息、积分体系、社区互动和成就系统。

#### 主要功能

| 功能 | 说明 |
|------|------|
| 用户信息展示 | 微信头像/昵称、城市、积分、成就徽章 |
| 积分手册 | 积分收支、公益捐赠统计、周增长、排名 |
| 公益捐赠 | 积分捐赠给流浪动物保护项目（1积分=0.01元） |
| MBTI 测试 | 人格类型与运动匹配（INFP 等） |
| 社区圈子 | 中医养生组/徒步爱好者组/力量燃脂组 |
| 公益直播 | 流浪动物救助直播预约 |
| 充值中心 | 课程能量包/食谱月卡/装备补给礼盒 |
| 成就徽章 | 按稀有度展示（普通/稀有/史诗/传说） |

#### 子页面

- **个人信息编辑** (`pages/my/info-edit/index`) — 修改昵称/头像等
- **社区互动** (`pages/my/community/index`) — 圈子详情与动态
- **成就系统** (`pages/my/badges/index`) — 全部成就列表与解锁状态

---

### 4.5 其他页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | `pages/login/login` | 手机号+密码登录 |
| 微信登录 | `pages/login/wechat-login` | 微信快捷登录 |
| 验证码登录 | `pages/loginCode/` | 手机验证码登录 |
| 搜索页 | `pages/search/` | 热门搜索+历史记录 |
| 设置页 | `pages/setting/` | 通用设置与缓存清理 |
| 数据看板 | `pages/dataCenter/` | 区域统计/完成率/互动数据/成员管理 |

---

## 五、核心系统

### 5.1 积分系统（Points）

**文件**：`utils/points.js`

基于本地 Storage 的积分管理，支持获得、消耗、扣除三种类型。

| API | 说明 |
|-----|------|
| `getPoints()` | 获取当前积分 |
| `setPoints(value)` | 设置积分值 |
| `addPoints(amount, desc, extra)` | 获得积分 |
| `deductPoints(amount, desc, extra)` | 扣除积分（任务未达标等） |
| `spendPoints(amount, desc, extra)` | 消耗积分（公益捐赠等） |
| `getPointsHistory()` | 获取历史记录（最多100条） |
| `clearPointsData()` | 清除积分数据 |

**积分来源**：每日签到(+5)、课程完成(+5~+50)、学习知识(+8)、挑战任务(+20~+30)

**积分变化事件**：通过 `eventBus.emit('points-change', newPoints)` 全局通知

---

### 5.2 任务系统（Tasks）

**文件**：`utils/tasks.js`

每日 3 项任务：签到(`checkin`)、视频打卡(`video`)、学习健康知识(`knowledge`)。

| API | 说明 |
|-----|------|
| `getTaskDefinitions()` | 获取任务定义 |
| `normalizeTaskState(rawTask)` | 标准化任务状态 |
| `completeTask(rawTask, taskId)` | 完成指定任务 |
| `buildTaskList(rawTask)` | 构建任务列表（含完成状态） |
| `calculateTaskProgress(rawTask)` | 计算完成百分比 |

**任务检查机制**：每次启动时检查昨日任务是否达标，未达标扣除 1 积分。

---

### 5.3 成就系统（Badges）

**文件**：`utils/badges.js`

5 大类 30+ 个成就，按稀有度分为 4 级。

| 类别 | 成就示例 | 稀有度 |
|------|---------|--------|
| 🌱 公益（charity） | 初次捐赠、爱心使者、慈善家、连续捐赠 | 普通 → 传说 |
| 🏃 运动（exercise） | 初出茅庐、运动新星、健身达人、运动大师 | 普通 → 传说 |
| 📝 签到（checkin） | 初次签到、签到达人、签到之王、连续签到 | 普通 → 史诗 |
| 🍽️ 食谱（recipe） | 美食探索者、料理大师、营养专家 | 普通 → 传说 |
| 👥 社交（social） | 社交新手、活跃用户、社区之星 | 普通 → 史诗 |

| API | 说明 |
|-----|------|
| `updateBadgeProgress(badgeId, progress)` | 更新成就进度，解锁时返回成就信息 |
| `triggerBadgeUnlock(badge)` | 触发成就解锁事件 |

---

### 5.4 认证系统（Auth）

**文件**：`utils/auth.js`

支持 3 种登录方式：

| 方式 | API | 说明 |
|------|-----|------|
| 微信官方登录 | `wechatLogin()` | wx.getUserProfile + wx.login |
| 简化登录 | `simpleWechatLogin()` | 仅 wx.login 获取 code |
| 手机号登录 | `phoneLogin(phone, code)` | 手机号+验证码 |

| API | 说明 |
|-----|------|
| `isLoggedIn()` | 检查是否已登录 |
| `getUserInfo()` | 获取用户信息 |
| `saveUserInfo(info)` | 保存用户信息 |
| `clearUserInfo()` | 清除登录信息 |
| `checkLoginAndRedirect(url)` | 未登录时弹窗提示跳转 |

---

### 5.5 事件总线（EventBus）

**文件**：`utils/eventBus.js`

全局事件通信机制，挂在 `App.eventBus` 上。

| API | 说明 |
|-----|------|
| `on(event, callback)` | 监听事件 |
| `once(event, callback)` | 监听一次 |
| `off(event, callback)` | 取消监听 |
| `emit(event, ...args)` | 触发事件 |

**主要事件**：

| 事件名 | 触发场景 |
|--------|---------|
| `points-change` | 积分变动 |
| `record-updated` | 记录更新 |
| `plan-updated` | 计划更新 |
| `travel-plan-updated` | 旅行计划更新 |
| `badge-unlocked` | 成就解锁 |
| `cache-cleared` | 缓存清除 |
| `user-login-success` | 登录成功 |

---

### 5.6 购物车系统（Cart）

**文件**：`utils/cart.js`

基于 Storage 的购物车，支持增删改查。

| API | 说明 |
|-----|------|
| `addToCart(product)` | 添加商品 |
| `removeFromCart(productId)` | 移除商品 |
| `updateQuantity(productId, quantity)` | 更新数量 |
| `clearCart()` | 清空购物车 |
| `getCartItemCount()` | 商品总数 |
| `getCartTotalPrice()` | 总金额 |

---

## 六、API 接口文档

### 6.1 通用说明

**基础 URL**：在 `config.js` 中配置，默认 `http://localhost:3000`

**请求封装**：所有接口通过 `api/request.js` 统一发送，自动注入 `Authorization: Bearer {token}` 请求头。

**响应格式**：

```json
{
  "code": 200,
  "message": "请求成功",
  "data": { ... }
}
```

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 非200 | 请求失败，进入 reject 回调 |

**Mock 模式**：`config/index.js` 中 `useMock: true` 时，WxMock 拦截 `wx.request` 返回本地模拟数据，无需后端服务。

---

### 6.2 登录认证模块

#### POST `/login/postPasswordLogin`

密码登录接口。

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |
| password | String | 是 | 密码 |

**响应数据**：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "message": "登录成功",
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

---

#### POST `/login/getSendMessage`

发送短信验证码。

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |

**响应数据**：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "message": "发送成功"
  }
}
```

---

#### GET `/login/postCodeVerify`

验证码校验登录。

**请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | String | 是 | 短信验证码 |

**响应数据**：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "message": "验证码正确",
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**调用方**：`pages/loginCode/loginCode.js`

---

#### 微信登录（客户端直接处理）

微信登录不经过后端接口，由客户端 `utils/auth.js` 直接调用微信 API：

- `wechatLogin()` — 调用 `wx.getUserProfile` + `wx.login`，本地生成 token
- `simpleWechatLogin()` — 仅调用 `wx.login`，简化登录

> **注意**：生产环境需将 `wx.login` 返回的 `code` 发送到后端，换取 `openid` 和 `session_key`。

---

### 6.3 首页模块

#### GET `/home/cards`

获取首页卡片列表（信息流内容）。

**请求参数**：无

**响应数据**：

```json
{
  "code": 200,
  "message": "请求成功",
  "data": [
    {
      "url": "/static/home/card0.png",
      "desc": "少年,星空与梦想",
      "tags": [
        { "text": "AI绘画", "theme": "primary" },
        { "text": "版权素材", "theme": "success" }
      ]
    }
  ]
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| url | String | 卡片图片路径 |
| desc | String | 卡片描述文字 |
| tags | Array | 标签列表 |
| tags[].text | String | 标签文本 |
| tags[].theme | String | 标签主题色（primary/success/warning/danger） |

---

#### GET `/home/swipers`

获取首页轮播图列表。

**请求参数**：无

**响应数据**：

```json
{
  "code": 200,
  "message": "请求成功",
  "data": [
    "/static/home/swiper0.png",
    "/static/home/swiper0.png",
    "/static/home/swiper0.png",
    "/static/home/swiper0.png",
    "/static/home/swiper0.png",
    "/static/home/swiper0.png"
  ]
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| data | Array\<String\> | 轮播图图片路径数组 |

---

#### GET `/api/user/info`（预留）

获取用户信息接口。**当前未启用**（代码中已注释），数据从本地 Storage 读取。

**预期请求参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | String | 是 | 通过 Header 传入 |

**预期响应数据**：

```json
{
  "code": 200,
  "data": {
    "userInfo": {
      "nickName": "微信用户",
      "avatarUrl": "https://...",
      "gender": 0,
      "city": "深圳"
    },
    "points": 100,
    "todayTask": {
      "completed": 1,
      "total": 3
    }
  }
}
```

---

### 6.4 搜索模块

#### GET `/api/searchHistory`

获取搜索历史记录。

**请求参数**：无（需登录 Token）

**响应数据**：

```json
{
  "code": 200,
  "message": "请求成功",
  "data": {
    "historyWords": ["AI绘画", "Stable Diffusion", "版权素材", "星空", "illustration", "原创"]
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| historyWords | Array\<String\> | 搜索历史关键词列表 |

**调用方**：`pages/search/index.js`

---

#### GET `/api/searchPopular`

获取热门搜索词。

**请求参数**：无

**响应数据**：

```json
{
  "code": 200,
  "message": "请求成功",
  "data": {
    "popularWords": [
      "考研和靠边同时上岸应该怎么选？有哪些参考建议",
      "日常饮食中，如何选择优质蛋白",
      "你有没有网购维权成功的经历？求分享经验",
      "夏季带孩子旅游，你的必备物品有哪些",
      "在海外越卖越贵，中国汽车做对了什么",
      "当HR问你离职原因，怎么回答最能被接受"
    ]
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| popularWords | Array\<String\> | 热门搜索关键词列表 |

**调用方**：`pages/search/index.js`

---

### 6.5 数据看板模块

#### GET `/dataCenter/member`

获取整体情况（成员概览）数据。

**请求参数**：无（需登录 Token）

**响应数据**：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "template": {
      "succ": {
        "data": {
          "list": [
            { "name": "浏览量", "number": "202W" },
            { "name": "PV", "number": "233W" },
            { "name": "UV", "number": "102W" }
          ]
        },
        "statusCode": 200
      }
    }
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| list[].name | String | 指标名称 |
| list[].number | String | 指标数值（带单位） |

**调用方**：`pages/dataCenter/index.js`

---

#### GET `/dataCenter/interaction`

获取互动情况数据。

**请求参数**：无（需登录 Token）

**响应数据**：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "template": {
      "succ": {
        "data": {
          "list": [
            { "name": "浏览量", "number": "919" },
            { "name": "点赞量", "number": "887" },
            { "name": "分享量", "number": "104" },
            { "name": "收藏", "number": "47" }
          ]
        }
      }
    }
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| list[].name | String | 互动指标名称 |
| list[].number | String | 互动指标数值 |

**调用方**：`pages/dataCenter/index.js`

---

#### GET `/dataCenter/complete-rate`

获取完播率数据。

**请求参数**：无（需登录 Token）

**响应数据**：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "template": {
      "succ": {
        "data": {
          "list": [
            { "time": "12:00", "percentage": "80" },
            { "time": "14:00", "percentage": "60" },
            { "time": "16:00", "percentage": "85" },
            { "time": "18:00", "percentage": "43" },
            { "time": "20:00", "percentage": "60" },
            { "time": "22:00", "percentage": "95" }
          ]
        }
      }
    }
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| list[].time | String | 时间点 |
| list[].percentage | String | 完播率百分比 |

**调用方**：`pages/dataCenter/index.js`

---

#### GET `/dataCenter/area`

获取按区域统计数据。

**请求参数**：无（需登录 Token）

**响应数据**：

```json
{
  "code": 200,
  "success": true,
  "data": {
    "template": {
      "succ": {
        "data": {
          "list": [
            { "标题": "视频A", "全球": "4442", "华北": "456", "华东": "456" }
          ]
        }
      }
    }
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| list[].标题 | String | 数据项标题 |
| list[].全球 | String | 全球数据量 |
| list[].华北 | String | 华北区域数据量 |
| list[].华东 | String | 华东区域数据量 |

**调用方**：`pages/dataCenter/index.js`

---

### 6.6 个人中心模块

#### GET `/api/getServiceList`

获取服务列表（个人中心快捷入口）。

**请求参数**：无

**响应数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "service": [
      { "image": "/static/icon_wx.png", "name": "微信", "type": "weixin", "url": "" },
      { "image": "/static/icon_qq.png", "name": "QQ", "type": "QQ", "url": "" },
      { "image": "/static/icon_doc.png", "name": "腾讯文档", "type": "document", "url": "" },
      { "image": "/static/icon_map.png", "name": "腾讯地图", "type": "map", "url": "" },
      { "image": "/static/icon_td.png", "name": "数据中心", "type": "data", "url": "/pages/dataCenter/index" }
    ]
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| service[].image | String | 图标图片路径 |
| service[].name | String | 服务名称 |
| service[].type | String | 服务类型标识 |
| service[].url | String | 跳转路径（空表示外部服务） |

---

#### GET `/api/genPersonalInfo`

获取个人资料信息。

**请求参数**：无（需登录 Token）

**响应数据**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "image": "/static/avatar1.png",
    "name": "小小轩",
    "star": "天枰座",
    "gender": 0,
    "birth": "1994-09-27",
    "address": ["440000", "440300"],
    "brief": "在你身边，为你设计",
    "photos": [
      { "url": "/static/img_td.png", "name": "uploaded1.png", "type": "image" },
      { "url": "/static/img_td.png", "name": "uploaded2.png", "type": "image" }
    ]
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| image | String | 头像图片路径 |
| name | String | 昵称 |
| star | String | 星座 |
| gender | Number | 性别（0-男，1-女，2-保密） |
| birth | String | 生日（YYYY-MM-DD） |
| address | Array\<String\> | 地区编码 [省级编码, 市级编码] |
| brief | String | 个人简介 |
| photos | Array | 相册照片列表 |
| photos[].url | String | 照片路径 |
| photos[].name | String | 照片文件名 |
| photos[].type | String | 文件类型 |

---

### 6.7 AI 中医问诊接口

#### POST `https://api.moonshot.cn/v1/chat/completions`

中医咨询页面直接调用 **Moonshot AI (Kimi)** 接口，不经过项目后端。

**请求头**：

```
Content-Type: application/json
Authorization: Bearer {API_KEY}
```

**请求参数**：

```json
{
  "model": "kimi-k2-turbo-preview",
  "messages": [
    { "role": "system", "content": "你是一位专业的中医健康顾问..." },
    { "role": "user", "content": "减肥期间可以吃什么？" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**请求参数说明**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | String | 是 | 模型名称，当前使用 `kimi-k2-turbo-preview` |
| messages | Array | 是 | 对话消息列表 |
| messages[].role | String | 是 | 角色（system/user/assistant） |
| messages[].content | String | 是 | 消息内容 |
| temperature | Number | 否 | 生成温度，默认 0.7 |
| max_tokens | Number | 否 | 最大生成 token 数，默认 1000 |

**响应数据**：

```json
{
  "choices": [
    {
      "message": {
        "content": "建议多吃高蛋白、低脂肪的食物..."
      }
    }
  ]
}
```

**调用方**：`pages/tcm/consult/index.js`

> **注意**：该接口直接从小程序端调用第三方 API，生产环境建议通过后端代理转发，避免 API Key 泄露。

---

### 6.8 接口总览

| 模块 | 方法 | 路径 | 说明 | 是否需要 Token | Mock 状态 |
|------|------|------|------|----------------|-----------|
| 登录 | POST | `/login/postPasswordLogin` | 密码登录 | 否 | ✅ |
| 登录 | POST | `/login/getSendMessage` | 发送验证码 | 否 | ✅ |
| 登录 | GET | `/login/postCodeVerify` | 验证码校验 | 否 | ✅ |
| 首页 | GET | `/home/cards` | 卡片列表 | 否 | ✅ |
| 首页 | GET | `/home/swipers` | 轮播图列表 | 否 | ✅ |
| 首页 | GET | `/api/user/info` | 用户信息 | 是 | ❌ 预留 |
| 搜索 | GET | `/api/searchHistory` | 搜索历史 | 是 | ✅ |
| 搜索 | GET | `/api/searchPopular` | 热门搜索 | 否 | ✅ |
| 数据看板 | GET | `/dataCenter/member` | 成员概览 | 是 | ✅ |
| 数据看板 | GET | `/dataCenter/interaction` | 互动数据 | 是 | ✅ |
| 数据看板 | GET | `/dataCenter/complete-rate` | 完播率 | 是 | ✅ |
| 数据看板 | GET | `/dataCenter/area` | 区域统计 | 是 | ✅ |
| 个人中心 | GET | `/api/getServiceList` | 服务列表 | 否 | ✅ |
| 个人中心 | GET | `/api/genPersonalInfo` | 个人资料 | 是 | ✅ |
| AI问诊 | POST | `https://api.moonshot.cn/v1/chat/completions` | AI对话 | Bearer Token | ❌ 直连 |

---

### 6.9 本地数据接口说明

以下功能当前通过 **本地 Storage** 实现，未调用后端接口。后端开发时需补充对应 API：

| 功能 | 当前方案 | 建议后端接口 |
|------|---------|-------------|
| 积分查询/变动 | `utils/points.js` 读 Storage | `GET /api/points` / `POST /api/points/change` |
| 每日任务 | `utils/tasks.js` 读 Storage | `GET /api/tasks/today` / `POST /api/tasks/complete` |
| 成就系统 | `utils/badges.js` 读 Storage | `GET /api/badges` / `POST /api/badges/update` |
| 购物车 | `utils/cart.js` 读 Storage | `GET /api/cart` / `POST /api/cart/add` / `DELETE /api/cart/remove` |
| 减脂计划 | Storage `user_plan_data` | `GET /api/plan` / `POST /api/plan/save` |
| 每日记录 | Storage `record_{date}` | `GET /api/record/today` / `POST /api/record/save` |
| 生理期记录 | Storage `period_records` | `GET /api/period` / `POST /api/record/period` |
| 步数数据 | Storage `steps_{date}` | `GET /api/steps/today` / `POST /api/steps/sync` |
| 旅行路线 | Storage `travel_routes` | `GET /api/travel/routes` / `POST /api/travel/ai-generate` |
| 旅行挑战 | Storage `travel_challenges` | `GET /api/travel/challenges` / `POST /api/travel/challenge/complete` |
| 微信登录 | `utils/auth.js` 本地生成 token | `POST /api/auth/wechat`（code换openid） |
| 个人信息编辑 | Storage `user_info` | `POST /api/user/update` |

---

## 七、数据流与存储

### 7.1 本地存储键名规范

| 键名 | 类型 | 说明 |
|------|------|------|
| `access_token` | String | 登录凭证 |
| `user_info` | Object | 用户信息 |
| `user_points` | Number | 积分余额 |
| `points_history` | Array | 积分历史（≤100条） |
| `user_plan_data` | Object | 减脂计划数据 |
| `period_records` | Array | 生理期记录 |
| `badges_progress` | Object | 成就进度 |
| `displayed_badges` | Array | 展示的成就ID |
| `shopping_cart` | Array | 购物车数据 |
| `today_task_{date}` | Object | 每日任务状态 |
| `record_{date}` | Object | 每日记录数据 |
| `steps_{date}` | Number | 每日步数 |
| `travel_routes` | Array | 旅行路线 |
| `travel_ai_route` | Object | AI 生成的路线 |
| `travel_challenges` | Array | 旅行挑战 |
| `travel_favorites` | Array | 收藏的路线ID |
| `total_donated_points` | Number | 累计捐赠积分 |
| `donation_history` | Array | 捐赠日期记录 |
| `checkin_history` | Array | 签到日期记录 |
| `exercise_history` | Array | 运动日期记录 |

### 7.2 数据流架构

```
用户操作 → Page 事件处理
         → 更新 Storage 数据
         → EventBus 全局通知
         → 相关页面监听并刷新视图
```

---

## 八、网络请求与 Mock

### 8.1 请求封装

**文件**：`api/request.js`

- 自动注入 Bearer Token（从 Storage 读取 `access_token`）
- 统一 Promise 封装
- 基础 URL 在 `config.js` 中配置（默认 `http://localhost:3000`）

### 8.2 Mock 系统

**文件**：`mock/`

通过 `WxMock.js` 拦截 `wx.request`，在 `config/index.js` 中设置 `useMock: true` 启用。

Mock 数据按模块组织：
- `mock/login/` — 登录接口 Mock
- `mock/home/` — 首页接口 Mock
- `mock/search/` — 搜索接口 Mock
- `mock/dataCenter/` — 数据看板 Mock
- `mock/my/` — 个人中心 Mock

---

## 九、自定义 TabBar

**文件**：`custom-tab-bar/`

4 个 Tab 页：

| Tab | 图标 | 页面 |
|-----|------|------|
| 首页 | TDesign `home` | `pages/home/index` |
| 中医 | 自定义图片 | `pages/tcm/index` |
| 旅游 | 自定义图片 | `pages/travel/index` |
| 我的 | TDesign `user` | `pages/my/index` |

---

## 十、分包配置

采用微信小程序分包加载，主包包含 4 个 Tab 页，子包按功能模块拆分：

| 分包名 | 根路径 | 包含页面 |
|--------|--------|---------|
| edit | pages/my/info-edit | 个人信息编辑 |
| community | pages/my/community | 社区互动 |
| badges | pages/my/badges | 成就系统 |
| login | pages/login | 登录、微信登录 |
| setting | pages/setting | 设置 |
| medicated-diet | pages/tcm/medicated-diet | 药膳食谱 |
| therapy | pages/tcm/therapy | 理疗服务 |
| knowledge | pages/tcm/knowledge | 健康知识 |
| life | pages/tcm/life | 生活调护 |
| consult | pages/tcm/consult | 图文问诊 |
| plan | pages/home/plan | 减脂计划 |
| course | pages/home/course | 课程列表+详情 |
| record | pages/home/record | 每日记录 |
| mall | pages/home/mall | 商城+购物车 |
| points | pages/home/points | 积分中心 |

---

## 十一、公共组件

### 11.1 导航组件（Nav）

**路径**：`components/nav/`

- 支持标题模式和搜索模式
- 集成侧边栏路由导航（首页/搜索/发布/个人中心/信息编辑/设置/数据看板/登录）
- 自动获取状态栏高度适配

### 11.2 卡片组件（Card）

**路径**：`components/card/`

- 属性：`url`（链接）、`desc`（描述）、`tags`（标签数组）

### 11.3 Toast Behavior

**路径**：`behaviors/useToast.js`

- 封装 TDesign Toast 的显示/隐藏方法
- 页面通过 `behaviors: [useToastBehavior]` 引入

---

## 十二、全局样式变量

**文件**：`variable.less`

| 变量 | 值 | 说明 |
|------|----|------|
| `@navbar-padding-top` | 20px | 导航栏顶部间距 |
| `@nav-bar-height` | 60px | 导航栏高度 |
| `@tab-bar-height` | 112rpx | TabBar 高度 |
| `@font-size-default` | 16px | 默认字号 |
| `@font-size-small` | 14px | 小字号 |
| `@font-size-mini` | 12px | 迷你字号 |
| `@bg-color` | #f3f3f3 | 页面背景色 |
| `@bg-color-white` | #ffffff | 白色背景 |
| `@brand7-normal` | #0052d9 | 品牌主色 |
| `@headline-medium` | 28px | 标题字号 |
| `@body-large` | 16px | 正文字号 |
| `@body-small` | 12px | 小正文字号 |

---

## 十三、路径别名

项目在 `app.json` 中配置了路径别名：

```json
"resolveAlias": {
  "~/*": "/*"
}
```

引用规范：使用 `~/` 作为根目录前缀，如 `import request from '~/api/request'`。

---

## 十四、开发与构建

### 14.1 开发环境

1. 使用微信开发者工具打开项目目录
2. 执行 `npm install` 安装依赖
3. 在开发者工具中点击「工具 → 构建 npm」
4. Mock 模式默认开启（`config/index.js` 中 `useMock: true`）

### 14.2 代码规范

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix
```

- ESLint 配置：Airbnb Base + Prettier
- Husky + lint-staged：提交时自动格式化

### 14.3 部署说明

1. 修改 `config.js` 中的 `baseUrl` 为线上后端地址
2. 关闭 Mock：`config/index.js` 中设置 `useMock: false`
3. 在微信开发者工具中上传代码并提交审核

---

## 十五、功能架构图

```
┌─────────────────────────────────────────────────┐
│                   微信小程序                       │
├─────────┬─────────┬──────────┬──────────────────┤
│  首页    │  中医    │  旅行    │    个人中心       │
├─────────┼─────────┼──────────┼──────────────────┤
│ 步数追踪 │ 体质测评 │ 路线推荐 │ 积分体系         │
│ 每日任务 │ 药膳食谱 │ AI路线   │ 公益捐赠         │
│ 身体数据 │ 理疗服务 │ 旅行挑战 │ 成就系统         │
│ 健康记录 │ 健康知识 │ 路线收藏 │ 社区圈子         │
│ 减脂计划 │ 生活调护 │          │ MBTI测试         │
│ 视频课程 │ 图文问诊 │          │ 充值中心         │
│ 商城     │          │          │                  │
├─────────┴─────────┴──────────┴──────────────────┤
│                  公共服务层                        │
├──────────┬───────────┬───────────┬───────────────┤
│ 事件总线  │ 积分系统   │ 认证系统   │ 购物车系统    │
│ EventBus │ Points    │ Auth      │ Cart          │
├──────────┴───────────┴───────────┴───────────────┤
│                  数据存储层                        │
├──────────────────────────────────────────────────┤
│           微信本地 Storage + Mock 数据             │
└──────────────────────────────────────────────────┘
```
