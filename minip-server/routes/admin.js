const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const admin = require('../controllers/adminController');

// ========== 登录页（无需认证）==========
router.get('/login', (req, res) => {
  res.render('admin/login', { title: '管理员登录' });
});

// ========== 登录接口 ==========
router.post('/login', admin.adminLogin);

// ========== 退出登录 ==========
router.get('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.redirect('/admin/login');
});

// ========== 以下页面需管理员认证 ==========

// 数据看板
router.get('/dashboard', adminAuth, (req, res) => {
  res.render('admin/dashboard', {
    title: '数据看板',
    admin: req.admin,
    activeMenu: 'dashboard',
  });
});

// 用户管理
router.get('/users', adminAuth, (req, res) => {
  res.render('admin/users', {
    title: '用户管理',
    admin: req.admin,
    activeMenu: 'users',
  });
});

// 积分流水
router.get('/points', adminAuth, (req, res) => {
  res.render('admin/points', {
    title: '积分流水',
    admin: req.admin,
    activeMenu: 'points',
  });
});

// 运动数据
router.get('/exercises', adminAuth, (req, res) => {
  res.render('admin/exercises', {
    title: '运动数据',
    admin: req.admin,
    activeMenu: 'exercises',
  });
});

// 商品管理
router.get('/products', adminAuth, (req, res) => {
  res.render('admin/products', {
    title: '商品管理',
    admin: req.admin,
    activeMenu: 'products',
  });
});

// ========== API 接口（需认证）==========

router.get('/api/dashboard-stats', adminAuth, admin.getDashboardStats);
router.get('/api/users', adminAuth, admin.getUserList);
router.put('/api/users/:id', adminAuth, admin.updateUser);
router.delete('/api/users/:id', adminAuth, admin.deleteUser);
router.post('/api/users/:id/points', adminAuth, admin.adjustUserPoints);
router.get('/api/points', adminAuth, admin.getPointsHistory);
router.get('/api/exercises', adminAuth, admin.getExerciseRecords);
router.get('/api/products', adminAuth, admin.getProducts);
router.post('/api/products', adminAuth, admin.createProduct);
router.put('/api/products/:id', adminAuth, admin.updateProduct);
router.delete('/api/products/:id', adminAuth, admin.deleteProduct);

module.exports = router;
