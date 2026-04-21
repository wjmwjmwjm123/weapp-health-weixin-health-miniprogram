const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const merchant = require('../controllers/merchantController');

// 公开接口 - 不需要登录
router.get('/:id', merchant.getPublicInfo);

// 以下接口需要登录
router.use(authMiddleware);

// 申请成为商家
router.post('/apply', merchant.applyValidation, merchant.apply);

// 查询审核状态
router.get('/status', merchant.getStatus);

// 获取商家信息（需商家身份）
router.get('/profile', merchant.getProfile);

// 更新商家信息
router.put('/profile', merchant.updateProfileValidation, merchant.updateProfile);

module.exports = router;
