import { wechatLogin } from '~/utils/auth';
import request from '~/api/request';

const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    loading: false,
    isAgree: false,
    avatarUrl: DEFAULT_AVATAR,
    nickname: '',
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

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    if (avatarUrl) {
      this.setData({ avatarUrl });
    }
  },

  // 昵称输入完成
  onNicknameBlur(e) {
    this.setData({ nickname: e.detail.value || '' });
  },

  // 上传头像到后端（base64）
  async uploadAvatar(tempPath) {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      fs.readFile({
        filePath: tempPath,
        encoding: 'base64',
        success: (res) => {
          const base64 = `data:image/png;base64,${res.data}`;
          request('/api/user/avatar', 'PUT', { avatarUrl: base64 })
            .then((result) => {
              if (result.code === 200 && result.data) {
                // 更新本地缓存的头像
                const userInfo = wx.getStorageSync('user_info') || {};
                userInfo.avatarUrl = result.data.avatarUrl;
                userInfo.avatar = result.data.avatarUrl;
                wx.setStorageSync('user_info', userInfo);
              }
              resolve(result);
            })
            .catch(reject);
        },
        fail: reject,
      });
    });
  },

  // 更新昵称到后端
  async updateNickname(nickname) {
    if (!nickname) return;
    try {
      const res = await request('/api/user/profile', 'PUT', { nickname });
      if (res.code === 200) {
        const userInfo = wx.getStorageSync('user_info') || {};
        userInfo.nickname = nickname;
        userInfo.nickName = nickname;
        wx.setStorageSync('user_info', userInfo);
      }
    } catch (err) {
      console.warn('更新昵称失败:', err.message);
    }
  },

  async onWechatLogin() {
    if (this.data.loading) return;

    if (!this.data.isAgree) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none', duration: 2000 });
      return;
    }

    // 检查昵称
    const nickname = this.data.nickname.trim();
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none', duration: 2000 });
      return;
    }

    this.setData({ loading: true });

    try {
      // 登录时只传昵称，头像临时路径后端无法直接使用，登录成功后单独上传
      const result = await wechatLogin({
        nickname: nickname,
      });

      if (result.success) {
        // 同步更新昵称（确保后端和本地一致）
        await this.updateNickname(nickname);

        // 如果头像不是默认的，上传头像到后端
        const isDefaultAvatar = this.data.avatarUrl === DEFAULT_AVATAR;
        if (!isDefaultAvatar) {
          try {
            await this.uploadAvatar(this.data.avatarUrl);
          } catch (err) {
            console.warn('头像上传失败:', err.message);
          }
        }

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
    } catch (error) {
      wx.showToast({ title: error.error || '登录失败，请重试', icon: 'none', duration: 2000 });
    } finally {
      this.setData({ loading: false });
    }
  },

  onShowAgreement() {
    wx.showModal({ title: '用户协议', content: '这里是用户协议内容...', showCancel: false });
  },

  onShowPrivacy() {
    wx.showModal({ title: '隐私政策', content: '这里是隐私政策内容...', showCancel: false });
  },
});
