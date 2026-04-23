const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DailyTask = sequelize.define('DailyTask', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '日期 YYYY-MM-DD',
    },
    tasks: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '任务完成状态，如 { checkin: true, video: false }',
    },
  }, {
    tableName: 'daily_tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'date'] },
    ],
  });

  DailyTask.associate = (models) => {
    DailyTask.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return DailyTask;
};
