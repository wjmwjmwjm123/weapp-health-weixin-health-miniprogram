const { body, validationResult } = require('express-validator');
const db = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { code2Session } = require('../utils/wechat');

/**
 * 生成令牌对
 */
function generateTokenPair(user) {
  const payload = { id: user.id, tokenVersion: user.token_version };
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
    points: user.points,
  };
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
  const { nickname, avatarUrl, gender, city, province } = req.body;

  try {
    const wxResult = await code2Session(code);

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
      await user.increment('token_version');
    }
    res.json({ code: 200, message: '已退出登录', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = {
  wechatLoginValidation,
  wechatLogin,
  refreshToken,
  logout,
  safeUserInfo,
};
