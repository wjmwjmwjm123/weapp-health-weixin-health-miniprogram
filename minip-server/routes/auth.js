const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// 登录速率限制：同一IP 15分钟内最多10次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

// 微信登录
router.post('/wechat-login', authLimiter, auth.wechatLoginValidation, auth.wechatLogin);

// 刷新令牌
router.post('/refresh', auth.refreshToken);

// 登出（需登录）
router.post('/logout', authMiddleware, auth.logout);

module.exports = router;
