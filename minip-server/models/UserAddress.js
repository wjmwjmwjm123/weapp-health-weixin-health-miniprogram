const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAddress = sequelize.define('UserAddress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收件人',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话',
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '省',
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '市',
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '区',
    },
    detail: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '详细地址',
    },
    is_default: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否默认 0-否 1-是',
    },
  }, {
    tableName: 'user_addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  UserAddress.associate = (models) => {
    UserAddress.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return UserAddress;
};
