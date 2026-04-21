/**
 * 只清除缓存数据，保留登录信息
 */
export function clearCacheOnly() {
  try {
    // 需要保留的键（登录相关）
    const preserveKeys = ['access_token', 'user_info'];
    
    // 清除缓存相关的存储键
    const cacheKeys = [
      'user_points',
      'user_plan_data',
      'period_records',
      'points_history',
      'last_task_check_date',
      'total_donated_points', // 捐赠累计积分
      'travel_routes',
      'travel_ai_route',
      'travel_challenges',
      'travel_favorites',
      'travel_last_location',
    ];
    
    // 清除所有日期相关的记录（最近90天）
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      cacheKeys.push(`today_task_${dateStr}`);
      cacheKeys.push(`record_${dateStr}`);
      cacheKeys.push(`steps_${dateStr}`);
    }
    
    // 清除所有缓存键
    let clearedCount = 0;
    cacheKeys.forEach(key => {
      try {
        wx.removeStorageSync(key);
        clearedCount++;
      } catch (e) {
        console.warn(`清除 ${key} 失败:`, e);
      }
    });
    
    // 尝试清除其他缓存数据（排除登录信息）
    try {
      const info = wx.getStorageInfoSync();
      if (info && info.keys) {
        info.keys.forEach(key => {
          // 跳过登录相关的键
          if (!preserveKeys.includes(key)) {
            try {
              wx.removeStorageSync(key);
              clearedCount++;
            } catch (e) {
              // 忽略错误
            }
          }
        });
      }
    } catch (e) {
      // 如果 getStorageInfoSync 不支持，忽略
    }
    
    console.log(`已清除 ${clearedCount} 个缓存项，保留登录信息`);
    return true;
  } catch (error) {
    console.error('清除缓存数据失败:', error);
    return false;
  }
}

/**
 * 清除所有存储数据（包括登录信息，用于测试或完全重置）
 * 注意：此函数会清除登录信息，请谨慎使用
 */
export function clearAllStorage() {
  try {
    // 清除所有可能的存储键
    const keys = [
      'access_token',
      'user_info',
      'user_points',
      'user_plan_data',
      'period_records',
      'points_history',
      'last_task_check_date',
      'total_donated_points',
      'travel_routes',
      'travel_ai_route',
      'travel_challenges',
      'travel_favorites',
      'travel_last_location',
    ];
    
    // 清除所有日期相关的记录（最近90天）
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      keys.push(`today_task_${dateStr}`);
      keys.push(`record_${dateStr}`);
      keys.push(`steps_${dateStr}`);
    }
    
    // 清除所有存储的键
    let clearedCount = 0;
    keys.forEach(key => {
      try {
        wx.removeStorageSync(key);
        clearedCount++;
      } catch (e) {
        console.warn(`清除 ${key} 失败:`, e);
      }
    });
    
    // 尝试清除所有存储（如果微信支持）
    try {
      const info = wx.getStorageInfoSync();
      if (info && info.keys) {
        info.keys.forEach(key => {
          try {
            wx.removeStorageSync(key);
            clearedCount++;
          } catch (e) {
            // 忽略错误
          }
        });
      }
    } catch (e) {
      // 如果 getStorageInfoSync 不支持，忽略
    }
    
    console.log(`已清除 ${clearedCount} 个存储项（包括登录信息）`);
    return true;
  } catch (error) {
    console.error('清除存储数据失败:', error);
    return false;
  }
}

/**
 * 清除登录相关数据
 */
export function clearLoginData() {
  try {
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('user_info');
    console.log('已清除登录数据');
    return true;
  } catch (error) {
    console.error('清除登录数据失败:', error);
    return false;
  }
}

