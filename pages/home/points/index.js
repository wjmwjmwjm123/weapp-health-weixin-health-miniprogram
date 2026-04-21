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

  loadPointsHistory() {
    // 从存储加载积分历史
    const history = wx.getStorageSync('points_history') || this.data.pointsHistory;
    this.setData({ pointsHistory: history });
  },
});

