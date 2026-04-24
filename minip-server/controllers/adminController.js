const bcryptjs = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const db = require('../models');
const { Op } = require('sequelize');

// ========== 管理员登录 ==========
async function adminLogin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '请输入账号和密码', data: null });
  }

  try {
    const user = await db.User.findOne({
      where: { nickname: username, role: 'admin' },
    });

    if (!user || !user.password_hash) {
      return res.status(401).json({ code: 401, message: '账号或密码错误', data: null });
    }

    const isValid = await bcryptjs.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ code: 401, message: '账号或密码错误', data: null });
    }

    const token = generateToken({ id: user.id, tokenVersion: user.token_version });

    res.cookie('admin_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      sameSite: 'lax',
    });

    res.json({ code: 200, message: '登录成功', data: { nickname: user.nickname } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 数据看板统计 ==========
async function getDashboardStats(req, res) {
  try {
    const totalUsers = await db.User.count({ where: { role: 'user' } });

    const today = new Date().toISOString().slice(0, 10);
    const todayUsers = await db.User.count({
      where: { created_at: { [Op.gte]: `${today} 00:00:00` } },
    });

    const totalPointsResult = await db.User.sum('points') || 0;

    const totalDonated = await db.PointsHistory.sum('amount', {
      where: { type: 'spend', desc: { [Op.like]: '%捐赠%' } },
    }) || 0;

    const totalExercises = await db.ExerciseRecord.count();

    // 最近7天用户增长
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().slice(0, 10));
    }

    const userGrowth = [];
    for (const date of last7Days) {
      const count = await db.User.count({
        where: { created_at: { [Op.lt]: `${date} 23:59:59` } },
      });
      userGrowth.push({ date, count });
    }

    // 积分类型分布
    const pointsStats = await db.PointsHistory.findAll({
      attributes: ['type', [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']],
      group: ['type'],
      raw: true,
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        totalUsers,
        todayUsers,
        totalPoints: totalPointsResult,
        totalDonated,
        totalExercises,
        userGrowth,
        pointsStats,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 用户列表 ==========
async function getUserList(req, res) {
  const { page = 1, pageSize = 20, keyword = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  const where = { role: 'user' };
  if (keyword) {
    where[Op.or] = [
      { nickname: { [Op.like]: `%${keyword}%` } },
      { city: { [Op.like]: `%${keyword}%` } },
    ];
  }

  try {
    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: ['id', 'nickname', 'avatar_url', 'points', 'gender', 'city', 'province', 'created_at'],
      order: [['created_at', 'DESC']],
      offset,
      limit,
    });

    res.json({
      code: 200,
      message: 'success',
      data: { total: count, list: rows, page: parseInt(page), pageSize: limit },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 积分流水 ==========
async function getPointsHistory(req, res) {
  const { page = 1, pageSize = 20, type = '', keyword = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  const where = {};
  if (type) where.type = type;

  try {
    const { count, rows } = await db.PointsHistory.findAndCountAll({
      where,
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar_url'],
        where: keyword ? { nickname: { [Op.like]: `%${keyword}%` } } : undefined,
        required: !!keyword,
      }],
      order: [['created_at', 'DESC']],
      offset,
      limit,
    });

    res.json({
      code: 200,
      message: 'success',
      data: { total: count, list: rows, page: parseInt(page), pageSize: limit },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 运动记录 ==========
async function getExerciseRecords(req, res) {
  const { page = 1, pageSize = 20, keyword = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  try {
    const { count, rows } = await db.ExerciseRecord.findAndCountAll({
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar_url'],
        where: keyword ? { nickname: { [Op.like]: `%${keyword}%` } } : undefined,
        required: !!keyword,
      }],
      order: [['date', 'DESC']],
      offset,
      limit,
    });

    res.json({
      code: 200,
      message: 'success',
      data: { total: count, list: rows, page: parseInt(page), pageSize: limit },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 用户编辑 ==========
async function updateUser(req, res) {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }
    const { nickname, gender, city, province, brief } = req.body;
    await user.update({ nickname, gender, city, province, brief });
    res.json({ code: 200, message: '更新成功', data: user });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 用户删除 ==========
async function deleteUser(req, res) {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }
    await user.destroy();
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 积分调整 ==========
async function adjustUserPoints(req, res) {
  const { amount, type, desc } = req.body;
  const userId = req.params.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ code: 400, message: '请输入有效的积分数量', data: null });
  }
  if (!['earn', 'deduct'].includes(type)) {
    return res.status(400).json({ code: 400, message: '类型只能是 earn 或 deduct', data: null });
  }

  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const delta = type === 'earn' ? amount : -amount;
    const newPoints = Math.max(0, user.points + delta);

    await db.sequelize.transaction(async (t) => {
      await user.update({ points: newPoints }, { transaction: t });
      await db.PointsHistory.create({
        user_id: userId,
        type,
        amount,
        desc: desc || (type === 'earn' ? '管理员手动增加积分' : '管理员手动扣除积分'),
      }, { transaction: t });
    });

    res.json({ code: 200, message: '积分调整成功', data: { points: newPoints } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 商品管理 ==========
async function getProducts(req, res) {
  try {
    const products = await db.Product.findAll({ order: [['created_at', 'DESC']] });
    res.json({ code: 200, message: 'success', data: products });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

async function createProduct(req, res) {
  try {
    const product = await db.Product.create(req.body);
    res.json({ code: 200, message: '创建成功', data: product });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    await product.update(req.body);
    res.json({ code: 200, message: '更新成功', data: product });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    await product.destroy();
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = {
  adminLogin,
  getDashboardStats,
  getUserList,
  updateUser,
  deleteUser,
  adjustUserPoints,
  getPointsHistory,
  getExerciseRecords,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
