const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const merchantRoutes = require('./merchant');
const adminRoutes = require('./admin');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/merchant', merchantRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
