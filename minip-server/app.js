require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const app = express();

// 模板引擎配置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（头像等上传资源）
app.use('/static', express.static(path.join(__dirname, 'static')));

// 请求日志
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 路由
app.use('/api', routes);
app.use('/admin', require('./routes/admin'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ code: 200, message: 'ok', data: { status: 'running', timestamp: new Date().toISOString() } });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

// 全局错误处理
app.use((err, req, res, _next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ code: 500, message: err.message || '服务器内部错误', data: null });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
