import request from '~/api/request';

// 运动类型配置
const EXERCISE_TYPES = [
  { key: 'walk', label: '步行', icon: '🚶', color: '#4CAF50' },
  { key: 'run', label: '跑步', icon: '🏃', color: '#FF5722' },
  { key: 'ride', label: '骑行', icon: '🚴', color: '#2196F3' },
  { key: 'swim', label: '游泳', icon: '🏊', color: '#00BCD4' },
  { key: 'rope', label: '跳绳', icon: '⛹️', color: '#E91E63' },
  { key: 'yoga', label: '瑜伽', icon: '🧘', color: '#9C27B0' },
  { key: 'fitness', label: '健身', icon: '💪', color: '#FF9800' },
  { key: 'basketball', label: '篮球', icon: '🏀', color: '#795548' },
  { key: 'badminton', label: '羽毛球', icon: '🏸', color: '#607D8B' },
];

// MET 值表（代谢当量）
const MET_VALUES = {
  walk: 3.5,
  run: 8.0,
  ride: 6.0,
  swim: 6.0,
  rope: 10.0,
  yoga: 2.5,
  fitness: 5.0,
  basketball: 6.5,
  badminton: 5.5,
};

// 根据运动类型、时长、体重计算消耗卡路里
function calculateCalories(type, durationMinutes, weightKg = 60) {
  const met = MET_VALUES[type] || 5.0;
  return Math.round(met * weightKg * (durationMinutes / 60));
}

Page({
  data: {
    currentDate: '',
    currentTab: 0,
    records: {
      weight: '',
      calories: '',
      sleep: '',
      period: false,
      exercises: [],
    },
    historyRecords: [],
    totalExerciseCalories: 0,
    totalExerciseDuration: 0,
    exerciseTypes: EXERCISE_TYPES,
    // 添加运动弹窗
    showExerciseModal: false,
    selectedExerciseType: '',
    exerciseDuration: '',
    exerciseCaloriesPreview: 0,
    userWeight: 60,
  },

  // 计算并更新运动统计数据（总消耗 + 总时长）
  updateExerciseStats(exercises) {
    const list = exercises || [];
    const totalCalories = list.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
    const totalDuration = list.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
    this.setData({ totalExerciseCalories: totalCalories, totalExerciseDuration: totalDuration });
  },

  // 阻止事件冒泡（弹窗用）
  preventBubble() {
    // do nothing
  },

  onLoad() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    this.setData({ currentDate: dateStr });
    this.loadUserWeight();
    this.loadTodayRecord();
    this.loadHistory();
  },

  // 加载用户体重（用于卡路里计算）
  async loadUserWeight() {
    try {
      const planData = wx.getStorageSync('user_plan_data') || {};
      if (planData.weight) {
        this.setData({ userWeight: parseFloat(planData.weight) || 60 });
        return;
      }
      const res = await request('/api/user/body-data', 'GET', { limit: 1 });
      if (res.code === 200 && res.data && res.data.length > 0 && res.data[0].weight) {
        this.setData({ userWeight: parseFloat(res.data[0].weight) || 60 });
      }
    } catch (err) {
      console.warn('获取体重失败，使用默认值 60kg');
    }
  },

  // 加载今日记录
  async loadTodayRecord() {
    const { currentDate } = this.data;

    try {
      const res = await request('/api/user/exercise', 'GET', { start: currentDate, end: currentDate });
      if (res.code === 200 && res.data && res.data.length > 0) {
        const backendRecord = res.data[0];
        const details = backendRecord.details || {};

        // 兼容旧数据：如果 details 中没有 exercises，但后端有 duration，则生成单条记录
        let exercises = details.exercises || [];
        if (exercises.length === 0 && backendRecord.duration > 0) {
          exercises = [{
            type: backendRecord.type || 'general',
            duration: backendRecord.duration,
            calories: backendRecord.calories || 0,
          }];
        }

        const records = { exercises };
        this.setData({ records });
        this.updateExerciseStats(exercises);
        wx.setStorageSync(`record_${currentDate}`, records);
        return;
      }
    } catch (err) {
      console.warn('后端获取运动记录失败，使用本地缓存');
    }

    const savedRecord = wx.getStorageSync(`record_${currentDate}`);
    if (savedRecord) {
      // 兼容旧数据格式
      const records = this.migrateOldRecord(savedRecord);
      this.setData({ records });
      this.updateExerciseStats(records.exercises);
    }
  },

  // 兼容旧数据格式迁移
  migrateOldRecord(savedRecord) {
    const records = { ...savedRecord };
    if (!records.exercises) {
      records.exercises = [];
      // 旧数据中有 exercise 和 exerciseCalories
      if (savedRecord.exercise && Number(savedRecord.exercise) > 0) {
        records.exercises.push({
          type: 'general',
          duration: Number(savedRecord.exercise) || 0,
          calories: Number(savedRecord.exerciseCalories) || 0,
        });
      }
      delete records.exercise;
      delete records.exerciseCalories;
    }
    return records;
  },

  // 加载历史记录
  async loadHistory() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    const startDate = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;
    const endDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    try {
      const res = await request('/api/user/exercise', 'GET', { start: startDate, end: endDate });
      if (res.code === 200 && res.data && res.data.length > 0) {
        const history = res.data.map(r => {
          const details = r.details || {};
          const exercises = details.exercises || [];
          const totalDuration = exercises.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
          const totalCalories = exercises.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
          return {
            date: r.date,
            exerciseDuration: totalDuration,
            exerciseCalories: totalCalories,
            exerciseCount: exercises.length,
          };
        });
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
      const migrated = this.migrateOldRecord(record);
      const totalDuration = migrated.exercises.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
      const totalCalories = migrated.exercises.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
      history.push({
        date: dateStr,
        exerciseDuration: totalDuration,
        exerciseCalories: totalCalories,
        exerciseCount: migrated.exercises.length,
      });
    }
    this.setData({ historyRecords: history });
  },

  // 切换标签页
  onTabChange(e) {
    this.setData({ currentTab: e.detail.value });
  },

  // ========== 运动记录弹窗 ==========
  openExerciseModal() {
    this.setData({
      showExerciseModal: true,
      selectedExerciseType: '',
      exerciseDuration: '',
      exerciseCaloriesPreview: 0,
    });
  },

  closeExerciseModal() {
    this.setData({ showExerciseModal: false });
  },

  // 选择运动类型
  onSelectExerciseType(e) {
    const type = e.currentTarget.dataset.type;
    const { exerciseDuration, userWeight } = this.data;
    const preview = exerciseDuration
      ? calculateCalories(type, Number(exerciseDuration) || 0, userWeight)
      : 0;
    this.setData({
      selectedExerciseType: type,
      exerciseCaloriesPreview: preview,
    });
  },

  // 输入运动时长
  onExerciseDurationInput(e) {
    const duration = e.detail.value;
    const { selectedExerciseType, userWeight } = this.data;
    const preview = selectedExerciseType && duration
      ? calculateCalories(selectedExerciseType, Number(duration) || 0, userWeight)
      : 0;
    this.setData({
      exerciseDuration: duration,
      exerciseCaloriesPreview: preview,
    });
  },

  // 确认添加运动
  confirmAddExercise() {
    const { selectedExerciseType, exerciseDuration, exerciseCaloriesPreview, userWeight } = this.data;
    if (!selectedExerciseType) {
      wx.showToast({ title: '请选择运动类型', icon: 'none' });
      return;
    }
    if (!exerciseDuration || Number(exerciseDuration) <= 0) {
      wx.showToast({ title: '请输入有效时长', icon: 'none' });
      return;
    }

    const calories = exerciseCaloriesPreview || calculateCalories(selectedExerciseType, Number(exerciseDuration), userWeight);
    const exerciseItem = {
      type: selectedExerciseType,
      duration: Number(exerciseDuration),
      calories,
    };

    const exercises = [...this.data.records.exercises, exerciseItem];
    this.setData({
      'records.exercises': exercises,
      showExerciseModal: false,
    });
    this.updateExerciseStats(exercises);

    this.saveRecord();
    wx.showToast({ title: '添加成功', icon: 'success', duration: 1000 });
  },

  // 删除某条运动记录
  removeExercise(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定删除这条运动记录吗？',
      success: (res) => {
        if (res.confirm) {
          const exercises = [...this.data.records.exercises];
          exercises.splice(index, 1);
          this.setData({ 'records.exercises': exercises });
          this.updateExerciseStats(exercises);
          this.saveRecord();
        }
      },
    });
  },

  // 获取运动类型信息
  getExerciseTypeInfo(type) {
    return EXERCISE_TYPES.find(t => t.key === type) || { label: '其他', icon: '🏃', color: '#999' };
  },

  // ========== 保存记录 ==========
  saveRecord() {
    const { currentDate, records, userWeight } = this.data;

    // 计算运动总时长和总消耗
    const totalDuration = records.exercises.reduce((sum, e) => sum + (Number(e.duration) || 0), 0);
    const totalCalories = records.exercises.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);

    const recordData = { exercises: records.exercises };
    wx.setStorageSync(`record_${currentDate}`, recordData);

    // 异步同步到后端
    try {
      // 确定主运动类型（取时长最长的）
      let mainType = 'general';
      if (records.exercises.length > 0) {
        const mainExercise = records.exercises.reduce((max, e) =>
          (e.duration > max.duration ? e : max), records.exercises[0]);
        mainType = mainExercise.type;
      }

      request('/api/user/exercise', 'POST', {
        date: currentDate,
        type: mainType,
        duration: totalDuration,
        calories: totalCalories,
        details: { exercises: records.exercises, weight: userWeight },
      }).then((res) => {
        if (res.code !== 200) {
          console.error('运动记录同步后端失败:', res.message);
        } else {
          console.log('运动记录同步后端成功');
        }
      }).catch(err => {
        console.warn('运动记录同步后端失败:', err.message);
      });
    } catch (e) { /* ignore */ }

    const app = getApp();
    if (app.eventBus) {
      app.eventBus.emit('record-updated', recordData);
    }
  },
});
