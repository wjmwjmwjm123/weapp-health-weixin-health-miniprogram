/**
 * 购物车工具类
 */
const CART_STORAGE_KEY = 'shopping_cart';

/**
 * 获取购物车数据
 */
function getCart() {
  try {
    const cart = wx.getStorageSync(CART_STORAGE_KEY) || [];
    return Array.isArray(cart) ? cart : [];
  } catch (e) {
    console.error('获取购物车数据失败', e);
    return [];
  }
}

/**
 * 保存购物车数据
 */
function saveCart(cart) {
  try {
    wx.setStorageSync(CART_STORAGE_KEY, cart);
    return true;
  } catch (e) {
    console.error('保存购物车数据失败', e);
    return false;
  }
}

/**
 * 添加商品到购物车
 */
function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    // 如果商品已存在，增加数量
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    // 如果商品不存在，添加新商品
    cart.push({
      ...product,
      quantity: 1
    });
  }
  
  return saveCart(cart);
}

/**
 * 从购物车中移除商品
 */
function removeFromCart(productId) {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === productId);
  
  if (index > -1) {
    cart.splice(index, 1);
    return saveCart(cart);
  }
  
  return false;
}

/**
 * 更新商品数量
 */
function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      // 如果数量小于等于0，移除商品
      return removeFromCart(productId);
    } else {
      item.quantity = quantity;
      return saveCart(cart);
    }
  }
  
  return false;
}

/**
 * 清空购物车
 */
function clearCart() {
  try {
    wx.removeStorageSync(CART_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('清空购物车失败', e);
    return false;
  }
}

/**
 * 获取购物车商品总数
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * 获取购物车总金额
 */
function getCartTotalPrice() {
  const cart = getCart();
  return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
}

/**
 * 获取购物车中的商品列表
 */
function getCartItems() {
  return getCart();
}

module.exports = {
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartItemCount,
  getCartTotalPrice,
  getCartItems
};