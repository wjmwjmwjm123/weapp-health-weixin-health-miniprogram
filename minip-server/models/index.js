require('dotenv').config();
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    timezone: config.timezone,
    define: {
      underscored: true,
      freezeTableName: true,
    },
  }
);

const db = {};

// 加载模型
db.User = require('./User')(sequelize);
db.UserAddress = require('./UserAddress')(sequelize);
db.Product = require('./Product')(sequelize);
db.CartItem = require('./CartItem')(sequelize);
db.PointsHistory = require('./PointsHistory')(sequelize);
db.DailyTask = require('./DailyTask')(sequelize);
db.ExerciseRecord = require('./ExerciseRecord')(sequelize);
db.BodyData = require('./BodyData')(sequelize);

// 建立关联
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
