const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BodyData = sequelize.define('BodyData', {
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
    weight: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      comment: '体重(kg)',
    },
    height: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      comment: '身高(cm)',
    },
    bmi: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      comment: 'BMI',
    },
    body_fat: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      comment: '体脂率(%)',
    },
  }, {
    tableName: 'body_data',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'date'] },
    ],
  });

  BodyData.associate = (models) => {
    BodyData.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return BodyData;
};
