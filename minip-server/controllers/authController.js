const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSmsCode, verifySmsCode } = require('../utils/sms');
const { code2Session } = require('../utils/wechat');

/**
 * 生成令牌对
 */
function generateTokenPair(user) {
  const payload = { id: user.id, role: user.role, tokenVersion: user.token_version };
  return {
    token: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * 返回用户安全信息（不含密码）
 */
function safeUserInfo(user) {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatar_url,
    gender: user.gender,
    phone: user.phone,
    city: user.city,
    province: user.province,
    role: user.role,
    points: user.points,
  };
}

// ========== 手机号注册 ==========
const registerValidation = [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('code').isLength({ min: 4, max: 6 }).withMessage('请输入验证码'),
];

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  const { phone, password, code } = req.body;

  // 验证验证码
  if (!verifySmsCode(phone, code)) {
    return res.status(400).json({ code: 400, message: '验证码错误或已过期', data: null });
  }

  // 检查手机号是否已注册
  const existing = await db.User.findOne({ where: { phone } });
  if (existing) {
    return res.status(400).json({ code: 400, message: '该手机号已注册', data: null });
  }

  // 创建用户
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.User.create({
    phone,
    password_hash: passwordHash,
    nickname: `用户${phone.slice(-4)}`,
  });

  const tokens = generateTokenPair(user);
  res.json({
    code: 200,
    message: '注册成功',
    data: { token: tokens.token, refreshToken: tokens.refreshToken, userInfo: safeUserInfo(user) },
  });
}

// ========== 密码登录 ==========
const loginValidation = [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('password').notEmpty().withMessage('请输入密码'),
];

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  const { phone, password } = req.body;

  const user = await db.User.findOne({ where: { phone } });
  if (!user || !user.password_hash) {
    return res.status(400).json({ code: 400, message: '手机号或密码错误', data: null });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ code: 400, message: '手机号或密码错误', data: null });
  }

  const tokens = generateTokenPair(user);
  res.json({
    code: 200,
    message: '登录成功',
    data: { token: tokens.token, refreshToken: tokens.refreshToken, userInfo: safeUserInfo(user) },
  });
}

// ========== 发送验证码 ==========
const smsCodeValidation = [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
];

async function sendCode(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  const { phone } = req.body;

  try {
    await sendSmsCode(phone);
    res.json({ code: 200, message: '发送成功', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 验证码登录 ==========
const smsLoginValidation = [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('code').isLength({ min: 4, max: 6 }).withMessage('请输入验证码'),
];

async function smsLogin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  const { phone, code } = req.body;

  if (!verifySmsCode(phone, code)) {
    return res.status(400).json({ code: 400, message: '验证码错误或已过期', data: null });
  }

  // 查找或创建用户
  let user = await db.User.findOne({ where: { phone } });
  if (!user) {
    user = await db.User.create({ phone, nickname: `用户${phone.slice(-4)}` });
  }

  const tokens = generateTokenPair(user);
  res.json({
    code: 200,
    message: '登录成功',
    data: { token: tokens.token, refreshToken: tokens.refreshToken, userInfo: safeUserInfo(user) },
  });
}

// ========== 微信登录 ==========
const wechatLoginValidation = [
  body('code').notEmpty().withMessage('缺少微信登录凭证code'),
  body('nickname').optional().isLength({ max: 50 }).withMessage('昵称最长50字'),
  body('avatarUrl').optional().isLength({ max: 500 }).withMessage('头像URL过长'),
  body('gender').optional().isIn([0, 1, 2]).withMessage('性别值无效'),
  body('city').optional().isLength({ max: 50 }).withMessage('城市名过长'),
  body('province').optional().isLength({ max: 50 }).withMessage('省份名过长'),
];

async function wechatLogin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, message: errors.array()[0].msg, data: null });
  }

  const { code } = req.body;
  // 可选：用户资料（昵称、头像等，从小程序端传过来）
  const { nickname, avatarUrl, gender, city, province } = req.body;

  try {
    // 用 code 换 openid
    const wxResult = await code2Session(code);

    // 查找或创建用户
    let user = await db.User.findOne({ where: { openid: wxResult.openid } });
    if (!user) {
      user = await db.User.create({
        openid: wxResult.openid,
        unionid: wxResult.unionid,
        session_key: wxResult.sessionKey,
        nickname: nickname || '微信用户',
        avatar_url: avatarUrl || '',
        gender: gender || 0,
        city: city || '',
        province: province || '',
      });
    } else {
      // 更新用户资料和session_key（如果传了的话）
      const updateData = { session_key: wxResult.sessionKey };
      if (nickname) updateData.nickname = nickname;
      if (avatarUrl) updateData.avatar_url = avatarUrl;
      if (gender !== undefined) updateData.gender = gender;
      if (city) updateData.city = city;
      if (province) updateData.province = province;
      await user.update(updateData);
    }

    const tokens = generateTokenPair(user);
    res.json({
      code: 200,
      message: '登录成功',
      data: { token: tokens.token, refreshToken: tokens.refreshToken, userInfo: safeUserInfo(user) },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 刷新令牌 ==========
async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  if (!token) {
    return res.status(400).json({ code: 400, message: '缺少刷新令牌', data: null });
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await db.User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在', data: null });
    }

    // 校验 tokenVersion，防止已登出/改密码的令牌被刷新
    if (decoded.tokenVersion !== user.token_version) {
      return res.status(401).json({ code: 401, message: '令牌已失效，请重新登录', data: null });
    }

    const newTokens = generateTokenPair(user);
    res.json({
      code: 200,
      message: '刷新成功',
      data: { token: newTokens.token, refreshToken: newTokens.refreshToken },
    });
  } catch (err) {
    res.status(401).json({ code: 401, message: '刷新令牌无效或已过期', data: null });
  }
}

// ========== 登出 ==========
async function logout(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (user) {
      // 递增 token_version，使所有已发出的令牌失效
      await user.increment('token_version');
    }
    res.json({ code: 200, message: '已退出登录', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = {
  registerValidation,
  register,
  loginValidation,
  login,
  smsCodeValidation,
  sendCode,
  smsLoginValidation,
  smsLogin,
  wechatLoginValidation,
  wechatLogin,
  refreshToken,
  logout,
  safeUserInfo,
};
