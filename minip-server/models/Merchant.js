const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      comment: '关联用户ID',
    },
    shop_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '店铺名称',
    },
    shop_logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: '',
      comment: '店铺Logo',
    },
    shop_desc: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
      comment: '店铺描述',
    },
    contact_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '联系人姓名',
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话',
    },
    business_license: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: '',
      comment: '营业执照图片URL',
    },
    category: {
      type: DataTypes.ENUM('course', 'equipment', 'tcm'),
      allowNull: false,
      comment: '经营类目：course-课程 equipment-设备 tcm-中医商品',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disabled'),
      defaultValue: 'pending',
      comment: '审核状态',
    },
    reject_reason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: '',
      comment: '驳回原因',
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: '',
      comment: '商家地址',
    },
  }, {
    tableName: 'merchants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  Merchant.associate = (models) => {
    Merchant.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Merchant;
};
