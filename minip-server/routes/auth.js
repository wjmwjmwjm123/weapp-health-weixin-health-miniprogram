const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// 通用认证速率限制：同一IP 15分钟内最多10次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

// 短信验证码速率限制：同一IP 1分钟内最多1次
const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { code: 429, message: '验证码发送过于频繁，请1分钟后再试', data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

// 手机号注册
router.post('/register', authLimiter, auth.registerValidation, auth.register);

// 密码登录
router.post('/login', authLimiter, auth.loginValidation, auth.login);

// 发送短信验证码
router.post('/sms-code', smsLimiter, auth.smsCodeValidation, auth.sendCode);

// 验证码登录
router.post('/sms-login', authLimiter, auth.smsLoginValidation, auth.smsLogin);

// 微信登录
router.post('/wechat-login', authLimiter, auth.wechatLoginValidation, auth.wechatLogin);

// 刷新令牌
router.post('/refresh', auth.refreshToken);

// 登出（需登录）
router.post('/logout', authMiddleware, auth.logout);

module.exports = router;
