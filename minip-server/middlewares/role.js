/**
 * 角色权限中间件
 * 用法: router.get('/xxx', authMiddleware, roleMiddleware('admin'), handler)
 */
function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未登录', data: null });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '无权限访问', data: null });
    }
    next();
  };
}

module.exports = roleMiddleware;
