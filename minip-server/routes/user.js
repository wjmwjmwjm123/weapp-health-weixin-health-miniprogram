const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const user = require('../controllers/userController');

// 所有接口需要登录
router.use(authMiddleware);

// 用户资料
router.get('/profile', user.getProfile);
router.put('/profile', user.updateProfileValidation, user.updateProfile);
router.put('/avatar', user.updateAvatar);

// 积分
router.get('/points', user.syncPoints);
router.post('/points', user.addPointsRecord);
router.get('/points/history', user.getPointsHistory);

// 每日任务
router.get('/daily-task', user.getDailyTask);
router.post('/daily-task/complete', user.completeTask);

// 运动记录
router.get('/exercise', user.getExerciseRecords);
router.post('/exercise', user.saveExerciseRecord);

// 身体数据
router.get('/body-data', user.getBodyData);
router.post('/body-data', user.saveBodyData);

// 购物车
router.get('/cart', user.getCart);
router.post('/cart', user.addToCart);
router.put('/cart/:id', user.updateCartItem);
router.delete('/cart/:id', user.removeCartItem);
router.delete('/cart', user.clearCart);

module.exports = router;
