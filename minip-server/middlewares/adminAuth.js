const { verifyToken } = require('../utils/jwt');
const db = require('../models');

/**
 * 管理员认证中间件
 * 从 Cookie 中提取 admin_token 并验证
 * 同时校验 role === 'admin'
 */
async function adminAuth(req, res, next) {
  const token = req.cookies?.admin_token;

  if (!token) {
    if (req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ code: 401, message: '未登录', data: null });
    }
    return res.redirect('/admin/login');
  }

  try {
    const decoded = verifyToken(token);
    const user = await db.User.findByPk(decoded.id, {
      attributes: ['id', 'token_version', 'role', 'nickname'],
    });

    if (!user || decoded.tokenVersion !== user.token_version) {
      res.clearCookie('admin_token');
      if (req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ code: 401, message: '登录已过期', data: null });
      }
      return res.redirect('/admin/login');
    }

    if (user.role !== 'admin') {
      res.clearCookie('admin_token');
      if (req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ code: 403, message: '无权限访问', data: null });
      }
      return res.status(403).send('无权限访问');
    }

    req.admin = { id: user.id, nickname: user.nickname, role: user.role };
    next();
  } catch (err) {
    res.clearCookie('admin_token');
    if (req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ code: 401, message: '无效的登录凭证', data: null });
    }
    return res.redirect('/admin/login');
  }
}

module.exports = adminAuth;
