const { query, body, param, validationResult } = require('express-validator');
const db = require('../models');
const { Op } = require('sequelize');

// ========== 商家列表（分页+筛选） ==========
async function getMerchants(req, res) {
  try {
    const { page = 1, pageSize = 10, status, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const { count, rows } = await db.Merchant.findAndCountAll({
      where,
      include: [{ model: db.User, as: 'user', attributes: ['id', 'nickname', 'phone', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize)),
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 审核通过 ==========
async function approveMerchant(req, res) {
  try {
    const merchant = await db.Merchant.findByPk(req.params.id);
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在', data: null });
    }
    if (merchant.status !== 'pending') {
      return res.status(400).json({ code: 400, message: '只能审核待审核状态的商家', data: null });
    }
    await merchant.update({ status: 'approved', reject_reason: '' });
    res.json({ code: 200, message: '审核通过', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 审核驳回 ==========
const rejectValidation = [
  body('reason').notEmpty().withMessage('请输入驳回原因'),
];

async function rejectMerchant(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  try {
    const merchant = await db.Merchant.findByPk(req.params.id);
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在', data: null });
    }
    await merchant.update({ status: 'rejected', reject_reason: req.body.reason });
    // 将用户角色恢复为普通用户
    await db.User.update({ role: 'user' }, { where: { id: merchant.user_id } });
    res.json({ code: 200, message: '已驳回', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 禁用商家 ==========
async function disableMerchant(req, res) {
  try {
    const merchant = await db.Merchant.findByPk(req.params.id);
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在', data: null });
    }
    await merchant.update({ status: 'disabled' });
    await db.User.update({ role: 'user' }, { where: { id: merchant.user_id } });
    res.json({ code: 200, message: '已禁用', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 用户列表（分页） ==========
async function getUsers(req, res) {
  try {
    const { page = 1, pageSize = 10, role, keyword } = req.query;
    const where = {};
    if (role) where.role = role;
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize)),
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = {
  getMerchants,
  approveMerchant,
  rejectValidation,
  rejectMerchant,
  disableMerchant,
  getUsers,
};
