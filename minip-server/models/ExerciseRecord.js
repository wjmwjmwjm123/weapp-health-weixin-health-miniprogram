const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExerciseRecord = sequelize.define('ExerciseRecord', {
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
    type: {
      type: DataTypes.STRING(30),
      defaultValue: 'general',
      comment: '运动类型',
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '时长（分钟）',
    },
    calories: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '消耗卡路里',
    },
    details: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: '其他详情',
    },
  }, {
    tableName: 'exercise_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'date'] },
    ],
  });

  ExerciseRecord.associate = (models) => {
    ExerciseRecord.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return ExerciseRecord;
};
