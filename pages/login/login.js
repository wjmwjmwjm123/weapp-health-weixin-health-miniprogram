import { wechatLogin } from '~/utils/auth';

Page({
  data: {
    loading: false,
    isAgree: false, // 是否同意协议
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('access_token');
    const userInfo = wx.getStorageSync('user_info');
    
    // 如果已登录，直接跳转（即使昵称是"微信用户"也是正常的，因为这是微信返回的真实数据）
    if (token && userInfo) {
      wx.switchTab({
        url: '/pages/home/index',
      });
    }
  },

  // 协议选择
  onToggleAgree() {
    this.setData({
      isAgree: !this.data.isAgree,
    });
  },

  // 微信登录
  // 注意：这个方法必须在用户点击事件中直接调用，不能有任何延迟或异步操作
  onWechatLogin() {
    if (this.data.loading) return;

    // 检查是否同意协议
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    this.setData({ loading: true });

    wechatLogin()
      .then((result) => {
        if (result.success) {
          console.log('登录成功，用户信息:', result.userInfo);

          const savedUserInfo = wx.getStorageSync('user_info');
          console.log('登录后验证保存的数据:', savedUserInfo);

          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
          });

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/home/index',
              success: () => {
                const app = getApp();
                if (app.eventBus) {
                  app.eventBus.emit('user-login-success', savedUserInfo);
                }
              },
            });
          }, 1500);
        }
      })
      .catch((error) => {
        console.error('登录失败', error);
        wx.showToast({
          title: error.error || '登录失败，请重试',
          icon: 'none',
          duration: 2000,
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 显示用户协议（可选）
  onShowAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议内容...',
      showCancel: false,
    });
  },

  // 显示隐私政策（可选）
  onShowPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策内容...',
      showCancel: false,
        });
  },
});
