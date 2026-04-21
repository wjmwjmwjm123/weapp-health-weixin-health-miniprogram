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
router.put('/password', user.changePasswordValidation, user.changePassword);

// 收货地址
router.get('/addresses', user.getAddresses);
router.post('/addresses', user.addressValidation, user.createAddress);
router.put('/addresses/:id', user.updateAddressValidation, user.updateAddress);
router.delete('/addresses/:id', user.deleteAddress);

module.exports = router;
