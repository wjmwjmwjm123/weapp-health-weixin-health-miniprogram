const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PointsHistory = sequelize.define('PointsHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('earn', 'deduct', 'spend'),
      allowNull: false,
      comment: 'earn-获得 deduct-扣除 spend-消耗',
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '积分数量（正数）',
    },
    desc: {
      type: DataTypes.STRING(200),
      defaultValue: '',
      comment: '描述',
    },
  }, {
    tableName: 'points_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  });

  PointsHistory.associate = (models) => {
    PointsHistory.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return PointsHistory;
};
