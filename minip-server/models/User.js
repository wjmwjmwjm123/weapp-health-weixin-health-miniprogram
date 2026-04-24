const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    openid: {
      type: DataTypes.STRING(64),
      unique: true,
      allowNull: true,
      comment: '微信openid',
    },
    unionid: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '微信unionid',
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '微信用户',
      comment: '昵称',
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: '',
      comment: '头像URL',
    },
    gender: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '性别 0-未知 1-男 2-女',
    },
    birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '生日',
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '',
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '',
    },
    brief: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: '',
      comment: '个人简介',
    },
    star: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '',
      comment: '星座',
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '积分余额',
    },
    token_version: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '令牌版本，登出时递增使旧令牌失效',
    },
    session_key: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '微信session_key',
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      comment: '用户角色',
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '管理员密码哈希',
    },
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  User.associate = (models) => {
    User.hasMany(models.UserAddress, { foreignKey: 'user_id', as: 'addresses' });
    User.hasMany(models.CartItem, { foreignKey: 'user_id', as: 'cartItems' });
    User.hasMany(models.PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' });
    User.hasMany(models.DailyTask, { foreignKey: 'user_id', as: 'dailyTasks' });
    User.hasMany(models.ExerciseRecord, { foreignKey: 'user_id', as: 'exerciseRecords' });
    User.hasMany(models.BodyData, { foreignKey: 'user_id', as: 'bodyData' });
  };

  return User;
};
