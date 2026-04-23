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
  async loadTodayRecord() {
    const { currentDate } = this.data;

    // 尝试从后端获取
    try {
      const request = require('~/api/request').default;
      const res = await request('/api/user/exercise', 'GET', { start: currentDate, end: currentDate });
      if (res.code === 200 && res.data && res.data.length > 0) {
        const backendRecord = res.data[0];
        const records = {
          weight: backendRecord.details?.weight || '',
          calories: backendRecord.details?.calories || '',
          sleep: backendRecord.details?.sleep || '',
          period: backendRecord.details?.period || false,
          exercise: String(backendRecord.duration || ''),
          exerciseCalories: String(backendRecord.calories || ''),
        };
        this.setData({ records });
        wx.setStorageSync(`record_${currentDate}`, records);
        return;
      }
    } catch (err) {
      console.warn('后端获取运动记录失败，使用本地缓存');
    }

    const savedRecord = wx.getStorageSync(`record_${currentDate}`);
    if (savedRecord) {
      this.setData({ records: savedRecord });
    }
  },

  // 加载历史记录
  async loadHistory() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    const startDate = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
    const endDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    // 尝试从后端获取
    try {
      const request = require('~/api/request').default;
      const res = await request('/api/user/exercise', 'GET', { start: startDate, end: endDate });
      if (res.code === 200 && res.data && res.data.length > 0) {
        const history = res.data.map(r => ({
          date: r.date,
          weight: r.details?.weight || '',
          calories: r.details?.calories || '',
          exercise: String(r.duration || ''),
        }));
        this.setData({ historyRecords: history });
        return;
      }
    } catch (err) {
      console.warn('后端获取历史记录失败，使用本地缓存');
    }

    // 回退本地
    const history = [];
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
    
    const recordData = {
      weight: records.weight || '',
      calories: records.calories || '',
      sleep: records.sleep || '',
      period: records.period || false,
      exercise: records.exercise || '',
      exerciseCalories: records.exerciseCalories || '',
    };
    
    wx.setStorageSync(`record_${currentDate}`, recordData);
    
    // 异步同步到后端
    try {
      const request = require('~/api/request').default;
      request('/api/user/exercise', 'POST', {
        date: currentDate,
        type: 'general',
        duration: Number(records.exercise) || 0,
        calories: Number(records.exerciseCalories) || 0,
        details: recordData,
      }).catch(err => console.warn('运动记录同步后端失败:', err.message));
      // 同时同步身体数据
      if (records.weight) {
        request('/api/user/body-data', 'POST', {
          date: currentDate,
          weight: Number(records.weight) || null,
        }).catch(err => console.warn('身体数据同步后端失败:', err.message));
      }
    } catch (e) { /* ignore */ }
    
    // 如果记录了生理期，同步到全局记录中
    if (records.period) {
      const periodRecords = wx.getStorageSync('period_records') || [];
      if (periodRecords.indexOf(currentDate) === -1) {
        periodRecords.push(currentDate);
        periodRecords.sort();
        wx.setStorageSync('period_records', periodRecords);
      }
    } else {
      const periodRecords = wx.getStorageSync('period_records') || [];
      const index = periodRecords.indexOf(currentDate);
      if (index > -1) {
        periodRecords.splice(index, 1);
        wx.setStorageSync('period_records', periodRecords);
      }
    }
    
    wx.showToast({ title: '已保存', icon: 'success', duration: 1000 });
    
    const app = getApp();
    if (app.eventBus) {
      app.eventBus.emit('record-updated', recordData);
    }
  },
});

