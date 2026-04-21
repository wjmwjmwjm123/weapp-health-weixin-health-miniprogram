import { wechatLogin, simpleWechatLogin } from '~/utils/auth';

Page({
  data: {
    loading: false,
  },

  onLoad() {
    // 页面加载时自动尝试登录
  },

  /**
   * 微信登录（完整版，需要用户授权）
   */
  async onWechatLogin() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const result = await wechatLogin();
      if (result.success) {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        });
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/index',
          });
        }, 1500);
      }
    } catch (error) {
      wx.showToast({
        title: error.error || '登录失败',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 简化登录（不需要用户授权，直接使用微信登录凭证）
   */
  async onSimpleLogin() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const result = await simpleWechatLogin();
      if (result.success) {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        });
        
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/index',
          });
        }, 1500);
      }
    } catch (error) {
      wx.showToast({
        title: error.error || '登录失败',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 使用手机号登录（跳转到原有登录页）
   */
  onPhoneLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },
});

