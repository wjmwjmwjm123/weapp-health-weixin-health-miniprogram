// 同步数据库表结构
require('dotenv').config();
const db = require('../models');
const bcryptjs = require('bcryptjs');

async function syncDB() {
  try {
    console.log('开始同步数据库...');
    await db.sequelize.authenticate();
    console.log('数据库连接成功');
    await db.sequelize.sync({ alter: true });
    console.log('数据库表结构同步完成');

    // 初始化商品数据（如果表为空）
    const productCount = await db.Product.count();
    if (productCount === 0) {
      await db.Product.bulkCreate([
        { name: '高级HIIT课程包', price: 99.00, original_price: 199.00, desc: '包含10个高级HIIT课程，燃脂塑形', type: 'course' },
        { name: '瑜伽完整课程', price: 88.00, original_price: 168.00, desc: '30天瑜伽训练计划，柔韧提升', type: 'course' },
        { name: '智能手环', price: 199.00, original_price: 299.00, desc: '运动心率监测，睡眠分析', type: 'equipment' },
        { name: '瑜伽垫加厚款', price: 68.00, original_price: 128.00, desc: '6mm加厚防滑，环保TPE材质', type: 'equipment' },
        { name: '黄芪山药燕麦粥料包', price: 35.00, desc: '健脾益气，适合早晨空腹', type: 'tcm' },
        { name: '荷叶陈皮清脂茶', price: 28.00, desc: '祛湿化浊，午后代谢茶', type: 'tcm' },
      ]);
      console.log('已初始化默认商品数据');
    }

    // 初始化管理员账号（如果不存在）
    let adminUser = await db.User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      await db.User.create({
        openid: `admin_${Date.now()}`,
        nickname: 'admin',
        avatar_url: '',
        role: 'admin',
        password_hash: hashedPassword,
      });
      console.log('已初始化管理员账号：admin / admin123（请在首次登录后立即修改密码）');
    } else if (adminUser.nickname !== 'admin') {
      await adminUser.update({ nickname: 'admin' });
      console.log('已更新管理员账号用户名为：admin');
    }

    console.log('初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库同步失败:', error);
    process.exit(1);
  }
}

syncDB();
