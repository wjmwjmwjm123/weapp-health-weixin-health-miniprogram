import { wechatLogin } from '~/utils/auth';

Page({
  data: {
    loading: false,
  },

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
});
