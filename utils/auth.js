/**
 * 用户登录认证工具
 * 支持多种登录方式
 */

/**
 * 检查用户是否已登录
 */
export function isLoggedIn() {
  const token = wx.getStorageSync('access_token');
  return !!token;
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return wx.getStorageSync('user_info') || null;
}

/**
 * 保存用户信息
 */
export function saveUserInfo(userInfo) {
  wx.setStorageSync('user_info', userInfo);
}

/**
 * 清除用户信息（退出登录）
 */
export function clearUserInfo() {
  wx.removeStorageSync('access_token');
  wx.removeStorageSync('refresh_token');
  wx.removeStorageSync('user_info');
}

/**
 * 方案一：微信官方登录（推荐）
 * 使用 wx.getUserProfile + wx.login
 * 注意：wx.getUserProfile 必须在用户点击事件中直接调用
 */
/**
 * 微信登录 - 优先对接后端，后端不可用时回退到本地模式
 * 后端模式：wx.login 获取 code → 发送到后端 → 后端返回 token + userInfo
 * 本地模式：wx.login + wx.getUserProfile → 本地生成 token
 */
export function wechatLogin() {
  return new Promise((resolve, reject) => {
    // 1. 获取微信登录凭证 code
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          reject({ success: false, error: '获取登录凭证失败' });
          return;
        }

        const code = loginRes.code;

        // 2. 先尝试获取用户资料（如果用户拒绝则用默认值）
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: (profileRes) => {
            // 获取到用户资料，带资料请求后端
            handleWechatLoginWithBackend(code, profileRes.userInfo, resolve, reject);
          },
          fail: () => {
            // 用户拒绝授权资料，用默认值请求后端
            handleWechatLoginWithBackend(code, null, resolve, reject);
          },
        });
      },
      fail: (err) => {
        reject({ success: false, error: err.errMsg || '获取登录凭证失败' });
      },
    });
  });
}

/**
 * 尝试通过后端登录，失败则回退到本地模式
 */
function handleWechatLoginWithBackend(code, wxUserInfo, resolve, reject) {
  const request = require('~/api/request').default;
  const config = require('~/config').default;

  // 判断是否配置了后端地址（非 localhost）
  const hasBackend = config.baseUrl && !config.baseUrl.includes('localhost');

  if (hasBackend) {
    // 后端模式：发送 code 到后端
    const postData = { code };
    if (wxUserInfo) {
      postData.nickname = wxUserInfo.nickName || '';
      postData.avatarUrl = wxUserInfo.avatarUrl || '';
      postData.gender = wxUserInfo.gender || 0;
      postData.city = wxUserInfo.city || '';
      postData.province = wxUserInfo.province || '';
    }

    request('/api/auth/wechat-login', 'POST', postData)
      .then((res) => {
        const result = res.data || res;
        if (result.code === 200 && result.data) {
          const { token, userInfo } = result.data;
          // 保存后端返回的 token 和用户信息
          wx.setStorageSync('access_token', token);
          wx.setStorageSync('refresh_token', result.data.refreshToken);
          wx.setStorageSync('user_info', {
            ...userInfo,
            nickname: userInfo.nickname || '',
            nickName: userInfo.nickname || '',
            avatar: userInfo.avatarUrl || '',
            loginTime: new Date().toISOString(),
          });
          resolve({ success: true, userInfo: result.data.userInfo, token });
        } else {
          // 后端返回错误，回退到本地模式
          console.warn('后端登录失败，回退到本地模式:', result.message);
          fallbackLocalLogin(wxUserInfo, resolve, reject);
        }
      })
      .catch((err) => {
        // 请求失败，回退到本地模式
        console.warn('后端请求失败，回退到本地模式:', err);
        fallbackLocalLogin(wxUserInfo, resolve, reject);
      });
  } else {
    // 本地模式（开发/Mock环境）
    fallbackLocalLogin(wxUserInfo, resolve, reject);
  }
}

/**
 * 本地模式登录（Mock/开发环境）
 */
function fallbackLocalLogin(wxUserInfo, resolve, reject) {
  const token = `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const savedUserInfo = {
    nickName: wxUserInfo?.nickName || '',
    avatarUrl: wxUserInfo?.avatarUrl || '',
    gender: wxUserInfo?.gender || 0,
    province: wxUserInfo?.province || '',
    city: wxUserInfo?.city || '',
    nickname: wxUserInfo?.nickName || '',
    avatar: wxUserInfo?.avatarUrl || '',
    openid: `mock_openid_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  wx.setStorageSync('access_token', token);
  wx.setStorageSync('user_info', savedUserInfo);

  resolve({
    success: true,
    userInfo: wxUserInfo || savedUserInfo,
    token,
  });
}

/**
 * 方案二：简化登录（仅使用微信授权，不需要手机号）
 * ⚠️ 仅限开发环境使用，生产环境请使用 wechatLogin()
 */
export function simpleWechatLogin() {
  if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion !== 'develop') {
    console.warn('simpleWechatLogin 仅限开发环境使用，生产环境请使用 wechatLogin()');
  }
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 直接使用 code 作为标识（实际应该发送到后端）
          const token = `simple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          wx.setStorageSync('access_token', token);
          wx.setStorageSync('user_info', {
            nickname: '微信用户',
            avatarUrl: '',
            loginTime: new Date().toISOString(),
            loginType: 'simple',
          });
          
          resolve({
            success: true,
            token,
          });
        } else {
          reject({
            success: false,
            error: '获取登录凭证失败',
          });
        }
      },
      fail: (err) => {
        reject({
          success: false,
          error: err.errMsg || '登录失败',
        });
      },
    });
  });
}

/**
 * 方案三：手机号登录
 * ⚠️ 仅限开发环境使用，生产环境请走后端验证
 */
export function phoneLogin(phoneNumber, code) {
  if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion !== 'develop') {
    console.warn('phoneLogin 仅限开发环境使用，生产环境请走后端验证');
  }
  return new Promise((resolve, reject) => {
    // 实际应该调用后端 API
    // 这里只是示例
    const token = `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    wx.setStorageSync('access_token', token);
    wx.setStorageSync('user_info', {
      phoneNumber,
      loginTime: new Date().toISOString(),
      loginType: 'phone',
    });
    resolve({
      success: true,
      token,
    });
  });
}

/**
 * 检查登录状态，如果未登录则跳转到登录页
 */
export function checkLoginAndRedirect(redirectUrl = '/pages/login/login') {
  if (!isLoggedIn()) {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: true,
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: redirectUrl,
          });
        }
      },
    });
    return false;
  }
  return true;
}

