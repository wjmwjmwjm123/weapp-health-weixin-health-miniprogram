import useToastBehavior from '~/behaviors/useToast';
import { clearCacheOnly, clearLoginData } from '~/utils/clearStorage';

Page({
  behaviors: [useToastBehavior],
  data: {
    menuData: [
      [
        {
          title: '通用设置',
          url: '',
          icon: 'app',
        },
        {
          title: '通知设置',
          url: '',
          icon: 'notification',
        },
      ],
      [
        {
          title: '深色模式',
          url: '',
          icon: 'image',
        },
        {
          title: '字体大小',
          url: '',
          icon: 'chart',
        },
        {
          title: '播放设置',
          url: '',
          icon: 'sound',
        },
      ],
      [
        {
          title: '账号安全',
          url: '',
          icon: 'secured',
        },
        {
          title: '隐私',
          url: '',
          icon: 'info-circle',
        },
      ],
      [
        {
          title: '清除缓存',
          url: '',
          icon: 'delete',
          type: 'clearCache',
        },
        {
          title: '退出登录',
          url: '',
          icon: 'logout',
          type: 'logout',
        },
      ],
    ],
  },

  onEleClick(e) {
    const { title, url, type } = e.currentTarget.dataset.data;
    
    // 如果有URL，直接跳转
    if (url) return;
    
    // 处理特殊操作
    if (type === 'clearCache') {
      this.onClearCache();
      return;
    }
    
    if (type === 'logout') {
      this.onLogout();
      return;
    }
    
    // 其他情况显示提示
    this.onShowToast('#t-toast', title);
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？清除后您的登录状态将保留，但所有本地记录、任务、积分历史等数据将被删除。',
      confirmText: '确定清除',
      cancelText: '取消',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '清除中...',
            mask: true,
          });
          
          // 只清除缓存数据，保留登录信息
          const success = clearCacheOnly();
          
          setTimeout(() => {
            wx.hideLoading();
            
            if (success) {
              wx.showToast({
                title: '清除成功',
                icon: 'success',
                duration: 2000,
              });
              
              // 延迟刷新页面
              setTimeout(() => {
                // 重新加载当前页面
                this.onLoad();
                // 触发全局事件，通知其他页面刷新
                const app = getApp();
                if (app.eventBus) {
                  app.eventBus.emit('cache-cleared');
                }
              }, 1500);
            } else {
              wx.showToast({
                title: '清除失败',
                icon: 'none',
                duration: 2000,
              });
            }
          }, 500);
        }
      },
    });
  },

  // 退出登录
  onLogout() {
    const token = wx.getStorageSync('access_token');
    if (!token) {
      wx.showToast({
        title: '您尚未登录',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？退出后需要重新登录。',
      confirmText: '确定退出',
      cancelText: '取消',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          // 清除登录数据
          clearLoginData();
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500,
          });
          
          // 延迟跳转到首页
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/home/index',
            });
          }, 1500);
        }
      },
    });
  },
});
