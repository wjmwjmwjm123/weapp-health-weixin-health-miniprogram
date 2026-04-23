const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const productRoutes = require('./product');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/product', productRoutes);

module.exports = router;
