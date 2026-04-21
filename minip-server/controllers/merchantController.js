const { body, validationResult } = require('express-validator');
const db = require('../models');

// ========== 申请成为商家 ==========
const applyValidation = [
  body('shop_name').notEmpty().withMessage('请输入店铺名称'),
  body('contact_name').notEmpty().withMessage('请输入联系人姓名'),
  body('contact_phone').isMobilePhone('zh-CN').withMessage('请输入正确的联系电话'),
  body('category').isIn(['course', 'equipment', 'tcm']).withMessage('请选择经营类目'),
];

async function apply(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  try {
    // 检查是否已申请
    const existing = await db.Merchant.findOne({ where: { user_id: req.user.id } });
    if (existing) {
      return res.status(400).json({
        code: 400,
        message: existing.status === 'rejected'
          ? '您之前的申请已被驳回，请联系管理员或重新申请'
          : '您已提交过商家申请，请勿重复提交',
        data: { status: existing.status },
      });
    }

    const { shop_name, shop_logo, shop_desc, contact_name, contact_phone, business_license, category, address } = req.body;

    const merchant = await db.Merchant.create({
      user_id: req.user.id,
      shop_name,
      shop_logo: shop_logo || '',
      shop_desc: shop_desc || '',
      contact_name,
      contact_phone,
      business_license: business_license || '',
      category,
      address: address || '',
      status: 'pending',
    });

    // 更新用户角色为 merchant
    await db.User.update({ role: 'merchant' }, { where: { id: req.user.id } });

    res.json({ code: 200, message: '申请已提交，等待审核', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 获取当前商家信息 ==========
async function getProfile(req, res) {
  try {
    const merchant = await db.Merchant.findOne({
      where: { user_id: req.user.id },
      include: [{ model: db.User, as: 'user', attributes: ['id', 'nickname', 'avatar_url', 'phone'] }],
    });
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '您还不是商家', data: null });
    }
    res.json({ code: 200, message: 'success', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 更新商家信息 ==========
const updateProfileValidation = [
  body('shop_name').optional().isLength({ max: 100 }),
  body('shop_desc').optional().isLength({ max: 2000 }),
  body('contact_name').optional().notEmpty(),
  body('contact_phone').optional().isMobilePhone('zh-CN'),
];

async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  try {
    const merchant = await db.Merchant.findOne({ where: { user_id: req.user.id } });
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家信息不存在', data: null });
    }

    if (merchant.status === 'disabled') {
      return res.status(403).json({ code: 403, message: '商家已被禁用', data: null });
    }

    const allowedFields = ['shop_name', 'shop_logo', 'shop_desc', 'contact_name', 'contact_phone', 'business_license', 'address'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await merchant.update(updateData);
    res.json({ code: 200, message: '更新成功', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 查询审核状态 ==========
async function getStatus(req, res) {
  try {
    const merchant = await db.Merchant.findOne({
      where: { user_id: req.user.id },
      attributes: ['id', 'status', 'reject_reason', 'created_at'],
    });
    if (!merchant) {
      return res.json({ code: 200, message: '未申请', data: { status: 'none' } });
    }
    res.json({ code: 200, message: 'success', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 获取商家公开信息 ==========
async function getPublicInfo(req, res) {
  try {
    const merchant = await db.Merchant.findOne({
      where: { id: req.params.id, status: 'approved' },
      attributes: ['id', 'shop_name', 'shop_logo', 'shop_desc', 'category', 'address'],
    });
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: merchant });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = {
  applyValidation,
  apply,
  getProfile,
  updateProfileValidation,
  updateProfile,
  getStatus,
  getPublicInfo,
};
