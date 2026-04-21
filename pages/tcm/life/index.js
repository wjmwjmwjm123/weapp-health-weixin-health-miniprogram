Page({
  data: {
    detail: null,
  },

  onLoad() {
    const detail = wx.getStorageSync('life_tip_detail');
    this.setData({
      detail: detail || {
        title: '生活常识',
        summary: '保持规律作息，饮食清淡，适度运动。',
        sections: [],
      },
    });
  },

  onUnload() {
    wx.removeStorageSync('life_tip_detail');
  },
});


