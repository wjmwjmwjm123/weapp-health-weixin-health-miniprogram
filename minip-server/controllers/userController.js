const bcrypt = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');
const db = require('../models');

// ========== 获取用户资料 ==========
async function getProfile(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }
    res.json({ code: 200, message: 'success', data: user });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 更新用户资料 ==========
const updateProfileValidation = [
  body('nickname').optional().isLength({ max: 50 }).withMessage('昵称最长50字'),
  body('gender').optional().isIn([0, 1, 2]).withMessage('性别值无效'),
  body('birth').optional().isISO8601().withMessage('生日格式无效'),
  body('city').optional().isLength({ max: 50 }),
  body('province').optional().isLength({ max: 50 }),
  body('brief').optional().isLength({ max: 200 }),
  body('star').optional().isLength({ max: 20 }),
];

async function updateProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const allowedFields = ['nickname', 'gender', 'birth', 'city', 'province', 'brief', 'star'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await user.update(updateData);
    res.json({ code: 200, message: '更新成功', data: user });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 更新头像 ==========
async function updateAvatar(req, res) {
  const { avatarUrl } = req.body;
  if (!avatarUrl) {
    return res.status(400).json({ code: 400, message: '请提供头像URL', data: null });
  }

  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }
    await user.update({ avatar_url: avatarUrl });
    res.json({ code: 200, message: '头像更新成功', data: { avatarUrl: user.avatar_url } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 修改密码 ==========
const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('请输入旧密码'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位'),
];

async function changePassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  const { oldPassword, newPassword } = req.body;

  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user || !user.password_hash) {
      return res.status(400).json({ code: 400, message: '该账号未设置密码', data: null });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ code: 400, message: '旧密码错误', data: null });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: newHash });
    // 改密码后递增 token_version，使旧令牌失效
    await user.increment('token_version');
    res.json({ code: 200, message: '密码修改成功', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 获取收货地址列表 ==========
async function getAddresses(req, res) {
  try {
    const addresses = await db.UserAddress.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
    });
    res.json({ code: 200, message: 'success', data: addresses });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 新增收货地址 ==========
const addressValidation = [
  body('name').notEmpty().withMessage('请输入收件人'),
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('province').notEmpty().withMessage('请选择省份'),
  body('city').notEmpty().withMessage('请选择城市'),
  body('district').notEmpty().withMessage('请选择区域'),
  body('detail').notEmpty().withMessage('请输入详细地址'),
];

async function createAddress(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body;

    // 如果设为默认，取消其他默认
    if (isDefault) {
      await db.UserAddress.update({ is_default: 0 }, { where: { user_id: req.user.id } });
    }

    const address = await db.UserAddress.create({
      user_id: req.user.id,
      name,
      phone,
      province,
      city,
      district,
      detail,
      is_default: isDefault ? 1 : 0,
    });
    res.json({ code: 200, message: '添加成功', data: address });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 修改收货地址 ==========
const updateAddressValidation = [
  param('id').isInt().withMessage('地址ID无效'),
];

async function updateAddress(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  try {
    const address = await db.UserAddress.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在', data: null });
    }

    const { isDefault } = req.body;
    if (isDefault) {
      await db.UserAddress.update({ is_default: 0 }, { where: { user_id: req.user.id } });
    }

    const allowedFields = ['name', 'phone', 'province', 'city', 'district', 'detail', 'isDefault'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const dbField = field === 'isDefault' ? 'is_default' : field;
        updateData[dbField] = field === 'isDefault' ? (req.body[field] ? 1 : 0) : req.body[field];
      }
    });

    await address.update(updateData);
    res.json({ code: 200, message: '更新成功', data: address });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 删除收货地址 ==========
async function deleteAddress(req, res) {
  try {
    const address = await db.UserAddress.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!address) {
      return res.status(404).json({ code: 404, message: '地址不存在', data: null });
    }
    await address.destroy();
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = {
  getProfile,
  updateProfileValidation,
  updateProfile,
  updateAvatar,
  changePasswordValidation,
  changePassword,
  getAddresses,
  addressValidation,
  createAddress,
  updateAddressValidation,
  updateAddress,
  deleteAddress,
};
