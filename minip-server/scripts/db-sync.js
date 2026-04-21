// 同步数据库表结构
require('dotenv').config();
const db = require('../models');

async function syncDB() {
  try {
    console.log('开始同步数据库...');
    await db.sequelize.authenticate();
    console.log('数据库连接成功');
    await db.sequelize.sync({ alter: true });
    console.log('数据库表结构同步完成');

    // 创建默认管理员
    const admin = await db.User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      const bcrypt = require('bcryptjs');
      await db.User.create({
        phone: 'admin',
        password_hash: await bcrypt.hash('admin123', 10),
        nickname: '管理员',
        role: 'admin',
      });
      console.log('已创建默认管理员账号: admin / admin123');
    }

    console.log('初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库同步失败:', error);
    process.exit(1);
  }
}

syncDB();
