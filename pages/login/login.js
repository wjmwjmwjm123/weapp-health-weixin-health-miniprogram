import { wechatLogin } from '~/utils/auth';

Page({
  data: {
    loading: false,
    isAgree: false,
  },

  onLoad() {
    const token = wx.getStorageSync('access_token');
    const userInfo = wx.getStorageSync('user_info');
    if (token && userInfo) {
      wx.switchTab({ url: '/pages/home/index' });
    }
  },

  onToggleAgree() {
    this.setData({ isAgree: !this.data.isAgree });
  },

  onWechatLogin() {
    if (this.data.loading) return;

    if (!this.data.isAgree) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none', duration: 2000 });
      return;
    }

    this.setData({ loading: true });

    wechatLogin()
      .then((result) => {
        if (result.success) {
          wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/home/index',
              success: () => {
                const app = getApp();
                if (app.eventBus) {
                  const savedUserInfo = wx.getStorageSync('user_info');
                  app.eventBus.emit('user-login-success', savedUserInfo);
                }
              },
            });
          }, 1500);
        }
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '登录失败，请重试', icon: 'none', duration: 2000 });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  onShowAgreement() {
    wx.showModal({ title: '用户协议', content: '这里是用户协议内容...', showCancel: false });
  },

  onShowPrivacy() {
    wx.showModal({ title: '隐私政策', content: '这里是隐私政策内容...', showCancel: false });
  },
});
