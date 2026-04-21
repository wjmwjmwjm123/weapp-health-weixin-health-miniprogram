const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const admin = require('../controllers/adminController');

// 所有管理接口需要 admin 角色
router.use(authMiddleware, roleMiddleware('admin'));

// 商家管理
router.get('/merchants', admin.getMerchants);
router.put('/merchants/:id/approve', admin.approveMerchant);
router.put('/merchants/:id/reject', admin.rejectValidation, admin.rejectMerchant);
router.put('/merchants/:id/disable', admin.disableMerchant);

// 用户管理
router.get('/users', admin.getUsers);

module.exports = router;
