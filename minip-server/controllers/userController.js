const { body, validationResult } = require('express-validator');
const db = require('../models');

// ========== 获取用户资料 ==========
async function getProfile(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'session_key', 'token_version'] },
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

// ========== 积分 ==========

// 同步积分（前端本地积分 → 后端，取较大值）
async function syncPoints(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }
    const localPoints = req.query.points ? Number(req.query.points) : undefined;
    if (typeof localPoints === 'number' && localPoints > user.points) {
      await user.update({ points: localPoints });
    }
    res.json({ code: 200, message: 'success', data: { points: user.points } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 获取积分历史
async function getPointsHistory(req, res) {
  try {
    const list = await db.PointsHistory.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json({ code: 200, message: 'success', data: list });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 新增积分历史记录（前端调用 addPoints 时同步）
async function addPointsRecord(req, res) {
  try {
    const { type, amount, desc } = req.body;
    const numAmount = Number(amount);
    if (!type || !Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ code: 400, message: '参数无效', data: null });
    }

    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    // 更新积分余额
    let newPoints = user.points;
    if (type === 'earn') {
      newPoints += numAmount;
    } else {
      newPoints = Math.max(0, newPoints - numAmount);
    }
    await user.update({ points: newPoints });

    const record = await db.PointsHistory.create({
      user_id: req.user.id,
      type,
      amount: numAmount,
      desc: desc || '',
    });

    res.json({ code: 200, message: 'success', data: { record, points: newPoints } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 每日任务 ==========

// 获取今日任务状态
async function getDailyTask(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const task = await db.DailyTask.findOne({
      where: { user_id: req.user.id, date },
    });
    res.json({ code: 200, message: 'success', data: task || { tasks: {} } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 完成任务
async function completeTask(req, res) {
  try {
    const { date, taskId, points: taskPoints } = req.body;
    const taskDate = date || new Date().toISOString().slice(0, 10);

    let task = await db.DailyTask.findOne({
      where: { user_id: req.user.id, date: taskDate },
    });

    const tasks = task ? { ...task.tasks } : {};
    tasks[taskId] = true;

    if (task) {
      await task.update({ tasks });
    } else {
      task = await db.DailyTask.create({
        user_id: req.user.id,
        date: taskDate,
        tasks,
      });
    }

    // 如果任务带积分奖励，给用户加积分
    let newPoints = null;
    if (taskPoints && taskPoints > 0) {
      const user = await db.User.findByPk(req.user.id);
      newPoints = user.points + taskPoints;
      await user.update({ points: newPoints });
      await db.PointsHistory.create({
        user_id: req.user.id,
        type: 'earn',
        amount: taskPoints,
        desc: `完成任务: ${taskId}`,
      });
    }

    res.json({ code: 200, message: 'success', data: { task, points: newPoints } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 运动记录 ==========

// 获取运动记录
async function getExerciseRecords(req, res) {
  try {
    const { start, end } = req.query;
    const where = { user_id: req.user.id };
    if (start && end) {
      where.date = { [db.Sequelize.Op.between]: [start, end] };
    }
    const records = await db.ExerciseRecord.findAll({
      where,
      order: [['date', 'DESC']],
    });
    res.json({ code: 200, message: 'success', data: records });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 保存运动记录
async function saveExerciseRecord(req, res) {
  try {
    const { date, type, duration, calories, details } = req.body;
    if (!date) {
      return res.status(400).json({ code: 400, message: '缺少日期', data: null });
    }

    const [record, created] = await db.ExerciseRecord.upsert({
      user_id: req.user.id,
      date,
      type: type || 'general',
      duration: duration || 0,
      calories: calories || 0,
      details: details || {},
    });

    res.json({ code: 200, message: created ? '创建成功' : '更新成功', data: record });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 身体数据 ==========

// 获取身体数据
async function getBodyData(req, res) {
  try {
    const { start, end } = req.query;
    const where = { user_id: req.user.id };
    if (start && end) {
      where.date = { [db.Sequelize.Op.between]: [start, end] };
    }
    const records = await db.BodyData.findAll({
      where,
      order: [['date', 'DESC']],
    });
    res.json({ code: 200, message: 'success', data: records });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 保存身体数据
async function saveBodyData(req, res) {
  try {
    const { date, weight, height, bmi, bodyFat } = req.body;
    if (!date) {
      return res.status(400).json({ code: 400, message: '缺少日期', data: null });
    }

    const [record, created] = await db.BodyData.upsert({
      user_id: req.user.id,
      date,
      weight: weight || null,
      height: height || null,
      bmi: bmi || null,
      body_fat: bodyFat || null,
    });

    res.json({ code: 200, message: created ? '创建成功' : '更新成功', data: record });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// ========== 购物车 ==========

// 获取购物车
async function getCart(req, res) {
  try {
    const items = await db.CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: db.Product, as: 'product' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ code: 200, message: 'success', data: items });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 添加到购物车
async function addToCart(req, res) {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ code: 400, message: '缺少商品ID', data: null });
    }

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }

    let item = await db.CartItem.findOne({
      where: { user_id: req.user.id, product_id: productId },
    });

    if (item) {
      await item.update({ quantity: item.quantity + (quantity || 1) });
    } else {
      item = await db.CartItem.create({
        user_id: req.user.id,
        product_id: productId,
        quantity: quantity || 1,
      });
    }

    res.json({ code: 200, message: 'success', data: item });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 更新购物车数量
async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body;
    const item = await db.CartItem.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!item) {
      return res.status(404).json({ code: 404, message: '购物车项不存在', data: null });
    }

    if (quantity <= 0) {
      await item.destroy();
      res.json({ code: 200, message: '已移除', data: null });
    } else {
      await item.update({ quantity });
      res.json({ code: 200, message: 'success', data: item });
    }
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 删除购物车项
async function removeCartItem(req, res) {
  try {
    const item = await db.CartItem.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!item) {
      return res.status(404).json({ code: 404, message: '购物车项不存在', data: null });
    }
    await item.destroy();
    res.json({ code: 200, message: '已移除', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 清空购物车
async function clearCart(req, res) {
  try {
    await db.CartItem.destroy({ where: { user_id: req.user.id } });
    res.json({ code: 200, message: '已清空', data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = {
  getProfile,
  updateProfileValidation,
  updateProfile,
  updateAvatar,
  // 积分
  syncPoints,
  getPointsHistory,
  addPointsRecord,
  // 每日任务
  getDailyTask,
  completeTask,
  // 运动记录
  getExerciseRecords,
  saveExerciseRecord,
  // 身体数据
  getBodyData,
  saveBodyData,
  // 购物车
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
