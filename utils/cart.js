/**
 * 购物车工具类
 * 后端优先 + 本地回退
 */
import request from '~/api/request';

const CART_STORAGE_KEY = 'shopping_cart';

function getLocalCart() {
  try {
    const cart = wx.getStorageSync(CART_STORAGE_KEY) || [];
    return Array.isArray(cart) ? cart : [];
  } catch (e) {
    console.error('获取购物车数据失败', e);
    return [];
  }
}

function saveLocalCart(cart) {
  try {
    wx.setStorageSync(CART_STORAGE_KEY, cart);
    return true;
  } catch (e) {
    console.error('保存购物车数据失败', e);
    return false;
  }
}

/**
 * 尝试后端操作，失败则回退本地
 */
async function tryBackend(method, path, data) {
  try {
    const res = await request(path, method, data);
    return res;
  } catch (err) {
    console.warn('购物车后端操作失败，回退本地:', err.message);
    return null;
  }
}

/**
 * 获取购物车数据
 */
async function getCart() {
  const res = await tryBackend('GET', '/api/user/cart');
  if (res && res.code === 200 && res.data) {
    const items = res.data.map(item => ({
      id: item.product_id || item.id,
      productId: item.product_id,
      cartItemId: item.id,
      name: item.product ? item.product.name : '',
      price: item.product ? Number(item.product.price) : 0,
      image: item.product ? item.product.image : '',
      type: item.product ? item.product.type : '',
      quantity: item.quantity,
    }));
    saveLocalCart(items); // 同步到本地
    return items;
  }
  return getLocalCart();
}

/**
 * 添加商品到购物车
 */
async function addToCart(product) {
  const res = await tryBackend('POST', '/api/user/cart', {
    productId: product.id,
    quantity: 1,
  });

  if (res && res.code === 200) {
    // 后端成功，重新拉取购物车
    await getCart();
    return true;
  }

  // 回退本地
  const cart = getLocalCart();
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  return saveLocalCart(cart);
}

/**
 * 从购物车中移除商品
 */
async function removeFromCart(productId) {
  // 后端用 product_id 查找对应的 cart item
  const cart = getLocalCart();
  const localItem = cart.find(item => item.id === productId || item.productId === productId);

  if (localItem && localItem.cartItemId) {
    await tryBackend('DELETE', `/api/user/cart/${localItem.cartItemId}`);
  }

  const index = cart.findIndex(item => item.id === productId || item.productId === productId);
  if (index > -1) {
    cart.splice(index, 1);
    return saveLocalCart(cart);
  }
  return false;
}

/**
 * 更新商品数量
 */
async function updateQuantity(productId, quantity) {
  const cart = getLocalCart();
  const localItem = cart.find(item => item.id === productId || item.productId === productId);

  if (localItem && localItem.cartItemId) {
    await tryBackend('PUT', `/api/user/cart/${localItem.cartItemId}`, { quantity });
  }

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  if (localItem) {
    localItem.quantity = quantity;
    return saveLocalCart(cart);
  }
  return false;
}

/**
 * 清空购物车
 */
async function clearCart() {
  await tryBackend('DELETE', '/api/user/cart');
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
  const cart = getLocalCart();
  return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * 获取购物车总金额
 */
function getCartTotalPrice() {
  const cart = getLocalCart();
  return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
}

/**
 * 获取购物车中的商品列表
 */
function getCartItems() {
  return getLocalCart();
}

export {
  getCart,
  saveLocalCart as saveCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartItemCount,
  getCartTotalPrice,
  getCartItems,
};
