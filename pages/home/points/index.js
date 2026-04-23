import request from '~/api/request';

Page({
  data: {
    points: 0,
    pointsHistory: [
      {
        id: 1,
        type: 'earn',
        amount: 10,
        desc: '完成HIIT课程',
        time: '2024-01-15 10:30',
      },
      {
        id: 2,
        type: 'earn',
        amount: 5,
        desc: '完成拉伸课程',
        time: '2024-01-14 18:20',
      },
      {
        id: 3,
        type: 'deduct',
        amount: 10,
        desc: '任务未达标扣除',
        time: '2024-01-13 23:59',
      },
    ],
  },

  onLoad() {
    this.loadPoints();
    this.loadPointsHistory();
    this.listenPointsChange();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadPoints();
    this.loadPointsHistory();
  },

  // 监听积分变化事件
  listenPointsChange() {
    const app = getApp();
    if (app.eventBus) {
      app.eventBus.on('points-change', (newPoints) => {
        this.setData({
          points: newPoints,
        });
        this.loadPointsHistory(); // 刷新历史记录
      });
    }
  },

  loadPoints() {
    const points = wx.getStorageSync('user_points') || 0;
    this.setData({ points });
  },

  async loadPointsHistory() {
    // 优先从后端获取积分历史
    try {
      const res = await request('/api/user/points/history', 'GET');
      if (res.code === 200 && Array.isArray(res.data)) {
        const history = res.data.map((item) => ({
          id: item.id,
          type: item.type,
          amount: item.amount,
          desc: item.desc,
          time: item.created_at ? item.created_at.replace('T', ' ').substring(0, 16) : '',
        }));
        this.setData({ pointsHistory: history });
        wx.setStorageSync('points_history', history);
        return;
      }
    } catch (err) {
      console.warn('后端获取积分历史失败，使用本地缓存:', err.message);
    }
    // 回退本地缓存
    const history = wx.getStorageSync('points_history') || this.data.pointsHistory;
    this.setData({ pointsHistory: history });
  },
});

