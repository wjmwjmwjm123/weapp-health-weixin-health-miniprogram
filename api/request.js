import config from '~/config';

const { baseUrl } = config;

// 防止并发刷新
let isRefreshing = false;
let pendingRequests = [];

function request(url, method = 'GET', data = {}) {
  const header = {
    'content-type': 'application/json',
  };
  // 获取token，有就丢进请求头
  const tokenString = wx.getStorageSync('access_token');
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }
  
  return new Promise((resolve, reject) => {
    const requestUrl = baseUrl + url;
    
    wx.request({
      url: requestUrl,
      method,
      data,
      dataType: 'json',
      header,
      success(res) {
        // 后端返回的业务数据在 res.data 中
        // 格式: { code: 200, message: '...', data: {...} }
        const responseData = res.data;
        if (res.statusCode === 200) {
          // HTTP 200 正常返回
          if (responseData && responseData.code === 401) {
            // token 过期，尝试刷新
            handleTokenExpired(url, method, data, resolve, reject);
            return;
          }
          resolve(responseData);
        } else if (res.statusCode === 401) {
          // 未授权，尝试刷新
          handleTokenExpired(url, method, data, resolve, reject);
        } else {
          reject(responseData || { code: res.statusCode, message: '请求失败' });
        }
      },
      fail(err) {
        reject({ code: -1, message: err.errMsg || '网络请求失败' });
      },
    });
  });
}

/**
 * Token 过期时尝试用 refreshToken 刷新，成功后重试原请求
 */
function handleTokenExpired(url, method, data, resolve, reject) {
  const refreshTokenValue = wx.getStorageSync('refresh_token');
  
  if (!refreshTokenValue) {
    // 没有 refreshToken，直接清除登录
    clearLoginState();
    reject({ code: 401, message: '未登录或登录已过期' });
    return;
  }

  if (isRefreshing) {
    // 已有刷新请求进行中，排队等待
    pendingRequests.push({ url, method, data, resolve, reject });
    return;
  }

  isRefreshing = true;

  wx.request({
    url: baseUrl + '/api/auth/refresh',
    method: 'POST',
    data: { refreshToken: refreshTokenValue },
    header: { 'content-type': 'application/json' },
    success(res) {
      if (res.statusCode === 200 && res.data && res.data.code === 200) {
        // 刷新成功，保存新 token
        wx.setStorageSync('access_token', res.data.data.token);
        wx.setStorageSync('refresh_token', res.data.data.refreshToken);
        
        // 重试原请求
        request(url, method, data).then(resolve).catch(reject);
        
        // 重试排队的请求
        pendingRequests.forEach(({ url: u, method: m, data: d, resolve: r, reject: j }) => {
          request(u, m, d).then(r).catch(j);
        });
        pendingRequests = [];
      } else {
        // 刷新失败，清除登录
        clearLoginState();
        reject({ code: 401, message: '登录已过期，请重新登录' });
        pendingRequests.forEach(({ reject: j }) => {
          j({ code: 401, message: '登录已过期，请重新登录' });
        });
        pendingRequests = [];
      }
    },
    fail() {
      clearLoginState();
      reject({ code: 401, message: '网络请求失败' });
      pendingRequests.forEach(({ reject: j }) => {
        j({ code: 401, message: '网络请求失败' });
      });
      pendingRequests = [];
    },
    complete() {
      isRefreshing = false;
    },
  });
}

function clearLoginState() {
  wx.removeStorageSync('access_token');
  wx.removeStorageSync('refresh_token');
  wx.removeStorageSync('user_info');
}

// 导出请求和服务地址
export default request;
