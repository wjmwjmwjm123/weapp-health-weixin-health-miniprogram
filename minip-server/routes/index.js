const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const productRoutes = require('./product');
const adminRoutes = require('./admin');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/product', productRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
