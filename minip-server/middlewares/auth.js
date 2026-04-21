const { verifyToken } = require('../utils/jwt');
const db = require('../models');

/**
 * JWT 认证中间件
 * 从 Authorization 头提取 Bearer token 并验证
 * 同时校验 tokenVersion 防止已登出的令牌继续使用
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录，请先登录', data: null });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    // 校验 tokenVersion
    const user = await db.User.findByPk(decoded.id, { attributes: ['id', 'token_version'] });
    if (!user || decoded.tokenVersion !== user.token_version) {
      return res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null });
    }
    req.user = decoded; // { id, role, tokenVersion }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '登录已过期，请重新登录', data: null });
    }
    return res.status(401).json({ code: 401, message: '无效的登录凭证', data: null });
  }
}

module.exports = authMiddleware;
