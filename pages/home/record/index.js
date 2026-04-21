Page({
  data: {
    currentDate: '',
    currentTab: 0, // 0: 今日, 1: 历史
    records: {
      weight: '', // 体重
      calories: '', // 摄入卡路里
      sleep: '', // 睡眠时长(小时)
      period: false, // 是否生理期
      exercise: '', // 运动时长(分钟)
      exerciseCalories: '', // 运动消耗卡路里
    },
    historyRecords: [],
  },

  onLoad() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    this.setData({
      currentDate: dateStr,
    });
    this.loadTodayRecord();
    this.loadHistory();
  },

  // 加载今日记录
  loadTodayRecord() {
    const { currentDate } = this.data;
    const savedRecord = wx.getStorageSync(`record_${currentDate}`);
    if (savedRecord) {
      this.setData({
        records: savedRecord,
      });
    }
  },

  // 加载历史记录
  loadHistory() {
    // 获取最近7天的记录
    const history = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const record = wx.getStorageSync(`record_${dateStr}`) || {};
      history.push({
        date: dateStr,
        weight: record.weight || '',
        calories: record.calories || '',
        exercise: record.exercise || '',
      });
    }
    this.setData({ historyRecords: history });
  },

  // 切换标签页
  onTabChange(e) {
    this.setData({
      currentTab: e.detail.value,
    });
  },

  // 输入体重
  onWeightInput(e) {
    this.setData({
      'records.weight': e.detail.value,
    });
    this.saveRecord();
  },

  // 输入卡路里
  onCaloriesInput(e) {
    this.setData({
      'records.calories': e.detail.value,
    });
    this.saveRecord();
  },

  // 输入睡眠时长
  onSleepInput(e) {
    this.setData({
      'records.sleep': e.detail.value,
    });
    this.saveRecord();
  },

  // 输入运动时长
  onExerciseInput(e) {
    this.setData({
      'records.exercise': e.detail.value,
    });
    this.saveRecord();
  },

  // 输入运动消耗卡路里
  onExerciseCaloriesInput(e) {
    this.setData({
      'records.exerciseCalories': e.detail.value,
    });
    this.saveRecord();
  },

  // 切换生理期
  onPeriodChange(e) {
    this.setData({
      'records.period': e.detail.value,
    });
    this.saveRecord();
  },

  // 保存记录
  saveRecord() {
    const { currentDate, records } = this.data;
    
    // 确保数据格式正确
    const recordData = {
      weight: records.weight || '',
      calories: records.calories || '',
      sleep: records.sleep || '',
      period: records.period || false,
      exercise: records.exercise || '',
      exerciseCalories: records.exerciseCalories || '',
    };
    
    wx.setStorageSync(`record_${currentDate}`, recordData);
    
    // 如果记录了生理期，同步到全局记录中
    if (records.period) {
      const periodRecords = wx.getStorageSync('period_records') || [];
      if (periodRecords.indexOf(currentDate) === -1) {
        periodRecords.push(currentDate);
        periodRecords.sort();
        wx.setStorageSync('period_records', periodRecords);
      }
    } else {
      // 如果取消，从记录中移除
      const periodRecords = wx.getStorageSync('period_records') || [];
      const index = periodRecords.indexOf(currentDate);
      if (index > -1) {
        periodRecords.splice(index, 1);
        wx.setStorageSync('period_records', periodRecords);
      }
    }
    
    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1000,
    });
    
    // 触发全局事件，通知首页更新
    const app = getApp();
    if (app.eventBus) {
      app.eventBus.emit('record-updated', recordData);
    }
  },
});

