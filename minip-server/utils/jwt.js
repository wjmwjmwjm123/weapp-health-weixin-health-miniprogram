const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET 环境变量未设置，服务拒绝启动');
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET 环境变量未设置，服务拒绝启动');
  return secret;
}

/**
 * 生成访问令牌
 */
function generateToken(payload) {
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * 生成刷新令牌
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
}

/**
 * 验证访问令牌
 */
function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

/**
 * 验证刷新令牌
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, getRefreshSecret());
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
