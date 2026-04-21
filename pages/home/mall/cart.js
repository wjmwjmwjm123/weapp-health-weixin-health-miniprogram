const cartUtil = require('~/utils/cart');

Page({
  data: {
    cartItems: [],
    totalPrice: 0,
    selectedItems: [], // 已选中的商品ID
    isEditing: false, // 是否处于编辑状态
  },

  onLoad() {
    this.loadCartData();
  },

  onShow() {
    this.loadCartData();
  },

  // 加载购物车数据
  loadCartData() {
    const cartItems = cartUtil.getCartItems();
    const totalPrice = cartUtil.getCartTotalPrice();
    
    this.setData({
      cartItems,
      totalPrice,
      selectedItems: cartItems.map(item => item.id), // 默认全部选中
    });
  },

  // 选择商品
  onSelectItem(e) {
    const { id } = e.currentTarget.dataset;
    const { selectedItems } = this.data;
    const index = selectedItems.indexOf(id);
    
    // 创建新数组，确保视图更新
    let newSelectedItems = [...selectedItems];
    
    if (index > -1) {
      // 取消选中
      newSelectedItems.splice(index, 1);
    } else {
      // 选中
      newSelectedItems.push(id);
    }
    
    this.setData({
      selectedItems: newSelectedItems,
    }, () => {
      this.calculateTotalPrice();
    });
  },

  // 全选/取消全选
  onSelectAll() {
    const { cartItems, selectedItems } = this.data;
    
    let newSelectedItems;
    if (selectedItems.length === cartItems.length) {
      // 当前是全选状态，取消全选
      newSelectedItems = [];
    } else {
      // 当前不是全选状态，全选
      newSelectedItems = cartItems.map(item => item.id);
    }
    
    this.setData({
      selectedItems: newSelectedItems,
    }, () => {
      this.calculateTotalPrice();
    });
  },

  // 计算选中商品的总价格
  calculateTotalPrice() {
    const { cartItems, selectedItems } = this.data;
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    const totalPrice = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    this.setData({
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
  },

  // 增加商品数量
  onIncreaseQuantity(e) {
    const { id } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    const item = cartItems.find(item => item.id === id);
    
    if (item) {
      cartUtil.updateQuantity(id, item.quantity + 1);
      this.loadCartData();
    }
  },

  // 减少商品数量
  onDecreaseQuantity(e) {
    const { id } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    const item = cartItems.find(item => item.id === id);
    
    if (item && item.quantity > 1) {
      cartUtil.updateQuantity(id, item.quantity - 1);
      this.loadCartData();
    }
  },

  // 删除商品
  onDeleteItem(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要从购物车中删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          cartUtil.removeFromCart(id);
          this.loadCartData();
          wx.showToast({
            title: '已删除',
            icon: 'success',
          });
        }
      },
    });
  },

  // 清空购物车
  onClearCart() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          cartUtil.clearCart();
          this.setData({
            cartItems: [],
            totalPrice: 0,
            selectedItems: [],
          });
          wx.showToast({
            title: '已清空',
            icon: 'success',
          });
        }
      },
    });
  },

  // 切换编辑状态
  onToggleEdit() {
    this.setData({
      isEditing: !this.data.isEditing,
    });
  },

  // 结算
  onCheckout() {
    const { selectedItems, cartItems } = this.data;
    
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
      });
      return;
    }
    
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    
    // 这里可以跳转到结算页面或调用支付接口
    wx.showModal({
      title: '结算',
      content: `共${selectedItems.length}件商品，总计${this.data.totalPrice}元`,
      confirmText: '去支付',
      success: (res) => {
        if (res.confirm) {
          // 模拟支付成功
          // 实际项目中这里应该调用支付接口
          wx.showToast({
            title: '支付成功',
            icon: 'success',
          });
          
          // 从购物车中移除已购买的商品
          selectedItems.forEach(id => {
            cartUtil.removeFromCart(id);
          });
          
          // 重新加载购物车数据
          this.loadCartData();
        }
      },
    });
  },

  // 去商城
  onGoToMall() {
    wx.navigateBack();
  },
});