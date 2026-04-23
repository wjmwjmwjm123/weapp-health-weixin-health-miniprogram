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
 * 微信登录 - 优先对接后端，后端不可用时回退到本地模式
 * 后端模式：wx.login 获取 code → 发送到后端 → 后端返回 token + userInfo
 * 本地模式：wx.login → 本地生成 token
 * 
 * 注意：wx.getUserProfile / wx.getUserInfo 已无法获取真实头像昵称（微信隐私策略调整）
 * 头像昵称需通过 chooseAvatar + nickname input 组件由用户主动填写
 * 
 * @param {Object} profileInfo - 可选，用户填写的资料 { nickname, avatarUrl, gender, city, province }
 */
export function wechatLogin(profileInfo) {
  return new Promise((resolve, reject) => {
    // 1. 获取微信登录凭证 code
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          reject({ success: false, error: '获取登录凭证失败' });
          return;
        }

        // 2. 直接传 code + 用户资料请求后端（不再调用 getUserProfile，已无法获取真实信息）
        handleWechatLoginWithBackend(loginRes.code, profileInfo || null, resolve, reject);
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
function handleWechatLoginWithBackend(code, profileInfo, resolve, reject) {
  const request = require('~/api/request').default;
  const config = require('~/config').default;

  // 判断是否配置了后端地址（非 localhost）
  const hasBackend = config.baseUrl && !config.baseUrl.includes('localhost');

  if (hasBackend) {
    // 后端模式：发送 code 到后端
    const postData = { code };
    if (profileInfo) {
      postData.nickname = profileInfo.nickname || '';
      postData.avatarUrl = profileInfo.avatarUrl || '';
      postData.gender = profileInfo.gender !== undefined ? profileInfo.gender : 0;
      postData.city = profileInfo.city || '';
      postData.province = profileInfo.province || '';
    }

    request('/api/auth/wechat-login', 'POST', postData)
      .then((result) => {
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
          fallbackLocalLogin(profileInfo, resolve, reject);
        }
      })
      .catch((err) => {
        // 请求失败，回退到本地模式
        console.warn('后端请求失败，回退到本地模式:', err);
        fallbackLocalLogin(profileInfo, resolve, reject);
      });
  } else {
    // 本地模式（开发/Mock环境）
    fallbackLocalLogin(profileInfo, resolve, reject);
  }
}

/**
 * 本地模式登录（Mock/开发环境）
 */
function fallbackLocalLogin(profileInfo, resolve, reject) {
  const token = `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const savedUserInfo = {
    nickName: profileInfo?.nickname || '',
    avatarUrl: profileInfo?.avatarUrl || '',
    gender: profileInfo?.gender !== undefined ? profileInfo.gender : 0,
    province: profileInfo?.province || '',
    city: profileInfo?.city || '',
    nickname: profileInfo?.nickname || '',
    avatar: profileInfo?.avatarUrl || '',
    openid: `mock_openid_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  wx.setStorageSync('access_token', token);
  wx.setStorageSync('user_info', savedUserInfo);

  resolve({
    success: true,
    userInfo: profileInfo ? { nickName: profileInfo.nickname, avatarUrl: profileInfo.avatarUrl, ...savedUserInfo } : savedUserInfo,
    token,
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

