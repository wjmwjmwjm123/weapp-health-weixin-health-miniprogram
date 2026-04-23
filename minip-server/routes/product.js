const express = require('express');
const router = express.Router();
const db = require('../models');

// 商品列表（公开）
router.get('/', async (req, res) => {
  try {
    const { type, page = 1, pageSize = 20 } = req.query;
    const where = { status: 1 };
    if (type) where.type = type;

    const { count, rows } = await db.Product.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: Number(pageSize),
      order: [['created_at', 'DESC']],
    });

    res.json({
      code: 200,
      message: 'success',
      data: { list: rows, total: count, page: Number(page), pageSize: Number(pageSize) },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

// 商品详情（公开）
router.get('/:id', async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product || product.status !== 1) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: product });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
});

module.exports = router;
