const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商品名称',
    },
    desc: {
      type: DataTypes.STRING(500),
      defaultValue: '',
      comment: '商品描述',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '售价',
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '原价',
    },
    image: {
      type: DataTypes.STRING(500),
      defaultValue: '',
      comment: '商品图片URL',
    },
    type: {
      type: DataTypes.ENUM('course', 'equipment', 'tcm'),
      defaultValue: 'course',
      comment: '类型: 课程/设备/中医商品',
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 999,
      comment: '库存',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 0-下架 1-上架',
    },
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  Product.associate = (models) => {
    Product.hasMany(models.CartItem, { foreignKey: 'product_id', as: 'cartItems' });
  };

  return Product;
};
