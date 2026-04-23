import request from '~/api/request';
import { isLoggedIn, checkLoginAndRedirect } from '~/utils/auth';
import {
  normalizeTaskState,
  completeTask,
  buildTaskList,
  calculateTaskProgress,
} from '~/utils/tasks';
import { addPoints, getPoints } from '~/utils/points';
import { updateBadgeProgress, triggerBadgeUnlock } from '~/utils/badges';

const app = getApp();

// 工具函数：格式化日期为 YYYY-MM-DD
function formatDateStr(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

// 工具函数：计算两个日期之间的天数差
function getDaysDiff(startDate, endDate) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

// 工具函数：计算持续天数（包含首尾两天）
function calculateDuration(startDate, endDate) {
  return getDaysDiff(startDate, endDate) + 1;
}

// 工具函数：根据身体数据计算目标步数
function calculateTargetSteps(bodyData) {
  if (bodyData.targetWeight > 0 && bodyData.weight > 0) {
    const weightDiff = bodyData.weight - bodyData.targetWeight;
    if (weightDiff > 5) return 12000;
    if (weightDiff > 2) return 10000;
  }
  return 8000;
}

// 工具函数：排序生理期记录（按开始日期）
function sortPeriodRecords(records, ascending = true) {
  return [...records].sort((a, b) => {
    const diff = new Date(a.startDate) - new Date(b.startDate);
    return ascending ? diff : -diff;
  });
}

Page({
  data: {
    userInfo: null,
    avatarUrl: '',
    displayName: '保持健康',
    points: 0, // 用户积分
    todayTask: {
      completed: 0, // 今日完成任务数
      total: 3, // 今日总任务数
    },
    taskProgress: 0, // 任务完成百分比
    taskList: [],
    // 身体数据
    bodyData: {
      height: 0, // 身高 (cm)
      weight: 0, // 体重 (kg)
      bmi: 0, // BMI
      targetWeight: 0, // 目标体重
      bmiStatus: '', // BMI状态
    },
    // 今日数据
    todayData: {
      caloriesIn: 0, // 摄入卡路里
      caloriesOut: 0, // 消耗卡路里
      exerciseTime: 0, // 运动时长（分钟）
      sleep: 0, // 睡眠时长（小时）
    },
    // 生理期数据
    periodData: {
      isPeriod: false, // 今日是否生理期
      lastPeriodStart: '', // 最近一次生理期开始日期
      lastPeriodEnd: '', // 最近一次生理期结束日期
      lastPeriodDuration: 0, // 最近一次生理期持续天数
      avgDuration: 5, // 平均持续天数（默认5天）
      cycleDays: 28, // 平均周期天数（默认28天）
      nextPeriodStart: '', // 预测下一次生理期开始日期
      nextPeriodStartRange: '', // 预测范围（最早-最晚）
      daysUntilNext: 0, // 距离下一次还有多少天
      predictionAccuracy: 0, // 预测准确度（基于历史记录数量，0-100）
      recordCount: 0, // 历史记录数量
      cycleStability: 0, // 周期稳定性（方差越小越稳定，0-100）
    },
    showPeriodModal: false, // 是否显示添加生理期记录的弹窗
    showPeriodHistory: false, // 是否显示历史记录列表
    periodStartDate: '', // 选中的开始日期
    periodEndDate: '', // 选中的结束日期
    periodHistory: [], // 历史记录列表
    editingRecordIndex: -1, // 正在编辑的记录索引（-1表示新增）
    // 运动数据
    stepData: {
      currentSteps: 0, // 当前步数
      targetSteps: 8000, // 目标步数（默认8000）
      targetCalories: 0, // 目标卡路里
      predictedCalories: 0, // 预测消耗卡路里
      weeklySteps: [], // 一周步数数据（用于热力图）
    },
    modules: [
      {
        id: 1,
        title: '个性化减脂计划',
        desc: '定制专属减脂方案',
        icon: 'file-paste', // 修改为 TDesign 存在的图标
        url: '/pages/home/plan/index',
      },
      {
        id: 2,
        title: '视频跟练课程',
        desc: '分难度场景的健身视频',
        icon: 'play-circle',
        url: '/pages/home/course/index',
      },
      {
        id: 3,
        title: '记录',
        desc: '记录身体变化和运动情况',
        icon: 'chart-analytics',
        url: '/pages/home/record/index',
      },
      {
        id: 4,
        title: '商城',
        desc: '课程和设备购买',
        icon: 'shop',
        url: '/pages/home/mall/index',
      },
    ],
    // 进度条渐变色
    progressColor: {
      '0%': '#43e97b',
      '100%': '#38f9d7',
    },
  },

  getTodayTaskKey(dateStr) {
    const today = dateStr || formatDateStr();
    return `today_task_${today}`;
  },

  onTaskAction(e) {
    const { action } = e.currentTarget.dataset;
    if (!action) return;
    if (!checkLoginAndRedirect()) return;
    if (action === 'course') {
      this.onGoCourses();
    } else if (action === 'knowledge') {
      this.onLearnHealth();
    }
  },

  onGoCourses() {
    wx.navigateTo({
      url: '/pages/home/course/index',
    });
  },

  onLearnHealth() {
    this.markTaskComplete('knowledge');
    wx.navigateTo({
      url: '/pages/tcm/consult/index',
    });
  },

  addTaskPoints(amount, desc) {
    return addPoints(amount, desc, {
      source: 'home-task',
    });
  },

  markTaskComplete(taskId) {
    const prevTask = this.data.todayTask || normalizeTaskState();
    const alreadyDone = prevTask.tasks && prevTask.tasks[taskId];
    const updatedTask = completeTask(prevTask, taskId);
    const taskList = buildTaskList(updatedTask);
    const taskProgress = calculateTaskProgress(updatedTask);
    wx.setStorageSync(this.getTodayTaskKey(), updatedTask);
    const newData = {
      todayTask: updatedTask,
      taskList,
      taskProgress,
    };
    if (!alreadyDone && taskId === 'checkin') {
      const newPoints = this.addTaskPoints(5, '每日签到');
      newData.points = newPoints;
    }
    this.setData(newData);

    // 异步同步任务完成状态到后端
    if (!alreadyDone) {
      const today = formatDateStr();
      const taskPoints = taskId === 'checkin' ? 5 : 0;
      try {
        request('/api/user/daily-task/complete', 'POST', {
          date: today,
          taskId,
          points: taskPoints,
        }).catch(err => console.warn('任务同步后端失败:', err.message));
      } catch (e) { /* ignore */ }
    }
  },

  onLoad() {
    // 不强制登录，允许用户先浏览
    this.loadUserData();
    this.listenPointsChange();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadUserData();
    // 刷新步数数据
    this.updateStepData();
    // 从后端同步步数
    this.loadStepsFromBackend();
    // 检查昨日任务是否达标（每日检查）
    this.checkYesterdayTask();
  },

  // 检查昨日任务是否达标（在每日开始时检查）
  checkYesterdayTask() {
    const app = getApp();
    if (app && typeof app.checkYesterdayTask === 'function') {
      app.checkYesterdayTask();
    }
  },

  // 监听积分变化事件
  listenPointsChange() {
    const app = getApp();
    if (app.eventBus) {
      app.eventBus.on('points-change', (newPoints) => {
        this.setData({
          points: newPoints,
        });
      });
      
      // 监听记录更新事件
      app.eventBus.on('record-updated', () => {
        // 重新加载今日数据
        this.loadUserData();
      });
      
      // 监听计划更新事件
      app.eventBus.on('plan-updated', () => {
        // 重新加载身体数据
        this.loadUserData();
      });
      
      // 监听旅行计划更新事件
      app.eventBus.on('travel-plan-updated', () => {
        this.loadUserData();
      });
      
      // 监听缓存清除事件
      app.eventBus.on('cache-cleared', () => {
        // 缓存被清除后，重新加载所有数据
        this.loadUserData();
      });
    }
  },

  async loadUserData() {
    // 获取用户信息和积分
    // const userData = await request('/api/user/info');
    // this.setData({
    //   userInfo: userData.data.userInfo,
    //   points: userData.data.points || 0,
    //   todayTask: userData.data.todayTask || { completed: 0, total: 3 },
    // });

    // 从存储中读取积分和任务数据（未登录时积分显示为0）
    const points = isLoggedIn() ? getPoints() : 0;
    const today = formatDateStr();
    const taskKey = this.getTodayTaskKey(today);

    // 尝试从后端获取今日任务
    let todayTask = null;
    if (isLoggedIn()) {
      try {
        const res = await request('/api/user/daily-task', 'GET', { date: today });
        if (res.code === 200 && res.data && res.data.tasks) {
          todayTask = normalizeTaskState(res.data);
          wx.setStorageSync(taskKey, todayTask);
        }
      } catch (err) {
        console.warn('后端获取任务失败，使用本地缓存:', err.message);
      }
    }

    if (!todayTask) {
      const savedTask = wx.getStorageSync(taskKey);
      todayTask = normalizeTaskState(savedTask);
    }
    let pointsAfterTask = points;
    if (isLoggedIn()) {
      const alreadyCheckin = todayTask.tasks && todayTask.tasks.checkin;
      todayTask = completeTask(todayTask, 'checkin');
      if (!alreadyCheckin) {
        pointsAfterTask = this.addTaskPoints(5, '每日签到');

        // 同步签到状态到后端
        try {
          request('/api/user/daily-task/complete', 'POST', {
            date: today,
            taskId: 'checkin',
            points: 5,
          }).catch((err) => console.warn('签到同步后端失败:', err.message));
        } catch (e) {
          /* ignore */
        }

        // 更新成就进度
        const unlockedBadge = updateBadgeProgress('checkin_1'); // 初次签到
        if (unlockedBadge) {
          triggerBadgeUnlock(unlockedBadge);
        }

        // 获取累计签到天数
        const checkinHistory = wx.getStorageSync('checkin_history') || [];
        checkinHistory.push(today);
        // 去重并排序
        const uniqueCheckins = [...new Set(checkinHistory)].sort();
        wx.setStorageSync('checkin_history', uniqueCheckins);

        const checkinCount = uniqueCheckins.length;
        updateBadgeProgress('checkin_2', Math.min(checkinCount, 30)); // 签到达人
        updateBadgeProgress('checkin_3', Math.min(checkinCount, 100)); // 签到之王

        // 检查连续签到
        if (uniqueCheckins.length >= 2) {
          const last7Days = uniqueCheckins.slice(-7);
          let consecutiveDays = 1;
          for (let i = last7Days.length - 1; i > 0; i--) {
            const current = new Date(last7Days[i]);
            const previous = new Date(last7Days[i - 1]);
            const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              consecutiveDays++;
            } else {
              break;
            }
          }
          if (consecutiveDays >= 7) {
            const unlockedBadge = updateBadgeProgress('checkin_4', 7);
            if (unlockedBadge) {
              triggerBadgeUnlock(unlockedBadge);
            }
          }
        }
      }
    }
    const taskList = buildTaskList(todayTask);
    const taskProgress = calculateTaskProgress(todayTask);
    wx.setStorageSync(taskKey, todayTask);

    // 读取身体数据（从计划页面）
    const planData = wx.getStorageSync('user_plan_data') || {};
    const bodyData = this.calculateBodyData(planData);

    // 读取今日记录数据（使用相同格式的日期）
    const todayRecord = wx.getStorageSync(`record_${today}`) || {};
    const todayData = {
      caloriesIn: parseFloat(todayRecord.calories) || 0,
      caloriesOut: parseFloat(todayRecord.exerciseCalories) || 0,
      exerciseTime: parseFloat(todayRecord.exercise) || 0,
      sleep: parseFloat(todayRecord.sleep) || 0,
    };

      // 读取并计算生理期数据（从今日记录中读取，如果没有则从全局记录中计算）
    const periodData = this.calculatePeriodData(todayRecord.period);

    // 读取步数数据
    const stepData = this.loadStepData(bodyData);

    // 调试日志（开发时查看）
    // console.log('首页加载数据:', { planData, bodyData, todayRecord, todayData, todayTask });

    const userInfo = isLoggedIn() ? (wx.getStorageSync('user_info') || null) : null;
    const avatarUrl = userInfo ? (userInfo.avatarUrl || userInfo.avatar || '') : '';
    const displayName = userInfo ? (userInfo.nickName || userInfo.nickname || '保持健康') : '保持健康';

    this.setData({
      userInfo,
      avatarUrl,
      displayName,
      avatarError: false,
      points: pointsAfterTask,
      todayTask,
      taskList,
      taskProgress,
      bodyData: bodyData,
      todayData: todayData,
      stepData: stepData,
      periodData: periodData,
    });
  },

  // 计算生理期数据
  calculatePeriodData(isTodayPeriod) {
    const periodRecords = wx.getStorageSync('period_records') || [];
    const today = formatDateStr();
    const todayObj = new Date(today);
    
    // 检查今日是否在某个生理期范围内
    let isPeriod = false;
    if (isTodayPeriod === true || isTodayPeriod === 'true' || isTodayPeriod === 1) {
      isPeriod = true;
    } else {
      for (const record of periodRecords) {
        if (record.startDate && record.endDate) {
          const startDate = new Date(record.startDate);
          const endDate = new Date(record.endDate);
          if (todayObj >= startDate && todayObj <= endDate) {
            isPeriod = true;
            break;
          }
        }
      }
    }

    let lastPeriodStart = '';
    let lastPeriodEnd = '';
    let lastPeriodDuration = 0;
    let avgDuration = 5; // 默认5天
    let cycleDays = 28; // 默认28天
    let nextPeriodStart = '';
    let nextPeriodStartRange = ''; // 预测范围（最早-最晚）
    let daysUntilNext = 0;

    if (periodRecords.length > 0) {
      // 获取最近一次生理期记录（按开始日期排序）
      const sortedRecords = [...periodRecords].sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
      });
      const lastRecord = sortedRecords[sortedRecords.length - 1];
      
      if (lastRecord && lastRecord.startDate) {
        lastPeriodStart = lastRecord.startDate;
        lastPeriodEnd = lastRecord.endDate || '';
        
        // 计算最近一次持续天数
        if (lastRecord.endDate) {
          lastPeriodDuration = calculateDuration(lastRecord.startDate, lastRecord.endDate);
        }
        
        // 计算平均持续天数（使用加权平均，更近的记录权重更高）
        const durations = [];
        const durationWeights = [];
        for (let i = 0; i < sortedRecords.length; i++) {
          const record = sortedRecords[i];
          if (record.startDate && record.endDate) {
            const duration = calculateDuration(record.startDate, record.endDate);
            durations.push(duration);
            durationWeights.push(sortedRecords.length - i); // 权重：最近的一次权重最高
          }
        }
        if (durations.length > 0) {
          // 使用加权平均（最多使用最近6次）
          const recentCount = Math.min(durations.length, 6);
          const recentDurations = durations.slice(-recentCount);
          const recentWeights = durationWeights.slice(-recentCount);
          const totalWeight = recentWeights.reduce((a, b) => a + b, 0);
          const weightedSum = recentDurations.reduce((sum, duration, index) => {
            return sum + (duration * recentWeights[index]);
          }, 0);
          avgDuration = Math.round(weightedSum / totalWeight);
          // 确保在合理范围内（3-8天）
          avgDuration = Math.max(3, Math.min(8, avgDuration));
        }
        
        // 如果有多条记录，计算平均周期（使用加权平均和趋势分析）
        if (sortedRecords.length >= 2) {
          const cycles = [];
          const cycleWeights = [];
          for (let i = 1; i < sortedRecords.length; i++) {
            const date1 = new Date(sortedRecords[i - 1].startDate);
            const date2 = new Date(sortedRecords[i].startDate);
            const diffTime = date2 - date1;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            cycles.push(diffDays);
            // 权重：更近的周期权重更高
            const weight = sortedRecords.length - i;
            cycleWeights.push(weight);
          }
          
          if (cycles.length > 0) {
            // 使用加权平均（最多使用最近6个周期）
            const recentCount = Math.min(cycles.length, 6);
            const recentCycles = cycles.slice(-recentCount);
            const recentWeights = cycleWeights.slice(-recentCount);
            const totalWeight = recentWeights.reduce((a, b) => a + b, 0);
            const weightedSum = recentCycles.reduce((sum, cycle, index) => {
              return sum + (cycle * recentWeights[index]);
            }, 0);
            cycleDays = Math.round(weightedSum / totalWeight);
            
            // 趋势分析：如果最近的周期有变化趋势，进行微调
            if (recentCycles.length >= 3) {
              const trend = recentCycles[recentCycles.length - 1] - recentCycles[0];
              // 如果趋势明显（变化超过2天），进行小幅调整（最多±2天）
              if (Math.abs(trend) > 2) {
                const trendAdjustment = Math.round(trend / recentCycles.length);
                cycleDays += Math.max(-2, Math.min(2, trendAdjustment));
              }
            }
            
            // 确保周期在合理范围内（21-35天）
            cycleDays = Math.max(21, Math.min(35, cycleDays));
            
            // 计算周期稳定性（基于方差）
            const avg = recentCycles.reduce((a, b) => a + b, 0) / recentCycles.length;
            const variance = recentCycles.reduce((sum, cycle) => {
              return sum + Math.pow(cycle - avg, 2);
            }, 0) / recentCycles.length;
            const stdDev = Math.sqrt(variance);
            // 稳定性：标准差越小越稳定（转换为0-100分）
            const maxStdDev = 7; // 最大标准差（7天）
            const stability = Math.max(0, Math.min(100, 100 - (stdDev / maxStdDev * 100)));
            
            // 计算下一次生理期开始日期（基于最近一次开始日期 + 加权平均周期）
            const lastStartDate = new Date(lastPeriodStart);
            const nextStartDate = new Date(lastStartDate);
            nextStartDate.setDate(nextStartDate.getDate() + cycleDays);
            nextPeriodStart = formatDateStr(nextStartDate);
            
            // 计算预测范围（最早-最晚，基于标准差）
            const earliestDate = new Date(lastStartDate);
            earliestDate.setDate(earliestDate.getDate() + Math.round(cycleDays - stdDev));
            const latestDate = new Date(lastStartDate);
            latestDate.setDate(latestDate.getDate() + Math.round(cycleDays + stdDev));
            
            const earliestStr = formatDateStr(earliestDate);
            const latestStr = formatDateStr(latestDate);
            
            if (earliestStr !== latestStr && stability < 80) {
              nextPeriodStartRange = `${earliestStr} ~ ${latestStr}`;
            }
            
            // 计算距离下一次还有多少天
            daysUntilNext = getDaysDiff(todayObj, nextStartDate);
            
            // 计算预测准确度（基于记录数量）
            const recordCount = sortedRecords.length;
            const predictionAccuracy = Math.min(100, Math.round(30 + (recordCount - 1) * 10)); // 1条记录30%，每多1条+10%，最多100%
            
            return {
              isPeriod: isPeriod,
              lastPeriodStart: lastPeriodStart,
              lastPeriodEnd: lastPeriodEnd,
              lastPeriodDuration: lastPeriodDuration,
              avgDuration: avgDuration,
              cycleDays: cycleDays,
              nextPeriodStart: nextPeriodStart,
              nextPeriodStartRange: nextPeriodStartRange || '',
              daysUntilNext: daysUntilNext,
              predictionAccuracy: predictionAccuracy,
              recordCount: recordCount,
              cycleStability: Math.round(stability),
            };
          }
        } else {
          // 只有1条记录，使用默认值预测
          const lastStartDate = new Date(lastPeriodStart);
          const nextStartDate = new Date(lastStartDate);
          nextStartDate.setDate(nextStartDate.getDate() + cycleDays);
          nextPeriodStart = formatDateStr(nextStartDate);
          daysUntilNext = getDaysDiff(todayObj, nextStartDate);
        }
      }
    }

    return {
      isPeriod: isPeriod,
      lastPeriodStart: lastPeriodStart,
      lastPeriodEnd: lastPeriodEnd,
      lastPeriodDuration: lastPeriodDuration,
      avgDuration: avgDuration,
      cycleDays: cycleDays,
      nextPeriodStart: nextPeriodStart || '',
      nextPeriodStartRange: nextPeriodStartRange || '',
      daysUntilNext: daysUntilNext,
      predictionAccuracy: periodRecords.length > 0 ? Math.min(100, Math.round(30 + (periodRecords.length - 1) * 10)) : 0,
      recordCount: periodRecords.length,
      cycleStability: 0,
    };
  },

  // 打开添加生理期记录弹窗
  onRecordPeriod() {
    const { periodData } = this.data;
    
    // 如果有历史记录，智能推荐：基于最近一次记录和平均周期/持续天数
    let defaultStartDate = new Date();
    let defaultEndDate = new Date();
    
    if (periodData.lastPeriodStart && periodData.avgDuration > 0) {
      // 如果最近一次记录已过去超过平均周期，推荐新的日期
      const lastStart = new Date(periodData.lastPeriodStart);
      const today = new Date();
      const daysSinceLast = Math.ceil((today - lastStart) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLast >= periodData.cycleDays) {
        // 已经过了周期，推荐今天开始
        defaultStartDate = new Date(today);
      } else {
        // 还没到周期，推荐基于上次的开始日期
        defaultStartDate = new Date(lastStart);
        defaultStartDate.setDate(defaultStartDate.getDate() + periodData.cycleDays);
      }
      
      defaultEndDate = new Date(defaultStartDate);
      defaultEndDate.setDate(defaultEndDate.getDate() + periodData.avgDuration - 1);
    } else {
      // 没有历史记录，默认今天开始，5天后结束
      defaultEndDate.setDate(defaultEndDate.getDate() + 5);
    }
    
    const startStr = formatDateStr(defaultStartDate);
    const endStr = formatDateStr(defaultEndDate);
    
    this.setData({
      showPeriodModal: true,
      periodStartDate: startStr,
      periodEndDate: endStr,
      editingRecordIndex: -1,
    });
  },

  // 打开历史记录列表
  onShowPeriodHistory() {
    const periodRecords = wx.getStorageSync('period_records') || [];
    const sortedRecords = sortPeriodRecords(periodRecords, false); // 倒序
    
    this.setData({
      showPeriodHistory: true,
      periodHistory: sortedRecords.map((record, index) => ({
          ...record,
        duration: record.duration || (record.startDate && record.endDate 
          ? calculateDuration(record.startDate, record.endDate) 
          : 0),
        index,
      })),
    });
  },

  // 关闭历史记录列表
  onClosePeriodHistory() {
    this.setData({
      showPeriodHistory: false,
    });
  },

  // 编辑历史记录
  onEditPeriodRecord(e) {
    const { index } = e.currentTarget.dataset;
    const { periodHistory } = this.data;
    const record = periodHistory[index];
    
    // 找到原始记录在存储数组中的索引
    const periodRecords = wx.getStorageSync('period_records') || [];
    const sortedRecords = sortPeriodRecords(periodRecords, false);
    const originalIndex = sortedRecords.findIndex(r => r.startDate === record.startDate);
    
    this.setData({
      showPeriodModal: true,
      showPeriodHistory: false,
      periodStartDate: record.startDate,
      periodEndDate: record.endDate,
      editingRecordIndex: originalIndex >= 0 ? originalIndex : index,
    });
  },

  // 删除历史记录
  onDeletePeriodRecord(e) {
    const { index } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const periodRecords = wx.getStorageSync('period_records') || [];
          const sortedRecords = sortPeriodRecords(periodRecords, false);
          sortedRecords.splice(index, 1);
          
          // 重新排序保存（正序）
          const savedRecords = sortPeriodRecords(sortedRecords, true);
          wx.setStorageSync('period_records', savedRecords);
          
          // 重新加载所有用户数据（包括生理期数据）
          this.loadUserData();
          
          // 重新加载历史记录列表（倒序）
          const updatedSortedRecords = sortPeriodRecords(savedRecords, false);
          this.setData({
            periodHistory: updatedSortedRecords.map((record, idx) => ({
                ...record,
              duration: record.duration || (record.startDate && record.endDate 
                ? calculateDuration(record.startDate, record.endDate) 
                : 0),
                index: idx,
            })),
          });
          
          wx.showToast({
            title: '已删除',
            icon: 'success',
          });
        }
      },
    });
  },

  // 关闭弹窗
  onClosePeriodModal() {
    this.setData({
      showPeriodModal: false,
      editingRecordIndex: -1,
    });
  },

  // 选择开始日期
  onPeriodStartDateChange(e) {
    const { value } = e.detail;
    // 阻止默认行为和事件冒泡
    e.stopPropagation && e.stopPropagation();
    this.setData({
      periodStartDate: value,
      showPeriodModal: true, // 确保弹窗保持打开状态
    });
  },

  // 选择结束日期
  onPeriodEndDateChange(e) {
    const { value } = e.detail;
    // 阻止默认行为和事件冒泡
    e.stopPropagation && e.stopPropagation();
    this.setData({
      periodEndDate: value,
      showPeriodModal: true, // 确保弹窗保持打开状态
    });
  },

  // 保存生理期记录
  onSavePeriodRecord() {
    const { periodStartDate, periodEndDate } = this.data;
    
    if (!periodStartDate || !periodEndDate) {
      wx.showToast({
        title: '请选择开始和结束日期',
        icon: 'none',
      });
      return;
    }
    
    // 验证日期逻辑
    const startDate = new Date(periodStartDate);
    const endDate = new Date(periodEndDate);
    
    if (endDate < startDate) {
      wx.showToast({
        title: '结束日期不能早于开始日期',
        icon: 'none',
      });
      return;
    }
    
    // 计算持续天数
    const duration = calculateDuration(startDate, endDate);
    
    if (duration > 10) {
      wx.showToast({
        title: '生理期持续时间应在10天以内',
        icon: 'none',
      });
      return;
    }
    
    // 读取所有记录
    const periodRecords = wx.getStorageSync('period_records') || [];
    
    const { editingRecordIndex } = this.data;
    const newRecord = {
      startDate: periodStartDate,
      endDate: periodEndDate,
      duration: duration,
    };
    
    if (editingRecordIndex >= 0) {
      // 编辑已有记录
      const sortedRecords = sortPeriodRecords(periodRecords, false);
      sortedRecords[editingRecordIndex] = newRecord;
      wx.setStorageSync('period_records', sortPeriodRecords(sortedRecords, true));
    } else {
      // 添加新记录
      const existingIndex = periodRecords.findIndex(r => r.startDate === periodStartDate);
      if (existingIndex > -1) {
        periodRecords[existingIndex] = newRecord;
      } else {
        periodRecords.push(newRecord);
      }
      wx.setStorageSync('period_records', sortPeriodRecords(periodRecords, true));
    }
    
    // 重新加载用户数据（包括生理期数据）
    this.loadUserData();
    
    // 关闭弹窗
      this.setData({
      showPeriodModal: false,
      editingRecordIndex: -1,
    });
    
    // 触发事件通知记录页面更新
    const app = getApp();
    if (app.eventBus) {
      app.eventBus.emit('record-updated', { period: true });
    }
    
    wx.showToast({
      title: '已保存生理期记录',
      icon: 'success',
      duration: 1500,
    });
  },

  // 加载步数数据
  loadStepData(bodyData) {
    const today = formatDateStr();
    const savedSteps = wx.getStorageSync(`steps_${today}`) || 0;
    const targetSteps = calculateTargetSteps(bodyData);

    // 计算目标卡路里（基于步数估算：10000步约消耗300-400卡路里）
    const targetCalories = Math.round((targetSteps / 10000) * 350);

    // 计算预测卡路里（基于当前步数）
    const predictedCalories = savedSteps > 0 
      ? Math.round((savedSteps / 10000) * 350)
      : 0;

    // 加载一周步数数据（用于热力图，传入目标步数避免重复计算）
    const weeklySteps = this.loadWeeklySteps(targetSteps);

    // 计算当前步数进度百分比
    const stepsProgress = targetSteps > 0 
      ? Math.min((savedSteps / targetSteps) * 100, 100) 
      : 0;

    return {
      currentSteps: savedSteps,
      targetSteps: targetSteps,
      targetCalories: targetCalories,
      predictedCalories: predictedCalories,
      weeklySteps: weeklySteps,
      stepsProgress: stepsProgress, // 步数完成百分比
    };
  },

  // 加载一周步数数据
  loadWeeklySteps(targetSteps) {
    const weekly = [];
    const today = new Date();
    // 如果未传入目标步数，则计算（避免重复计算）
    if (!targetSteps) {
      const bodyData = this.data.bodyData || this.calculateBodyData(wx.getStorageSync('user_plan_data') || {});
      targetSteps = calculateTargetSteps(bodyData);
    }
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDateStr(date);
      const steps = wx.getStorageSync(`steps_${dateStr}`) || 0;
      
      // 计算热力图颜色等级（基于目标步数）
      let level = 'inactive';
      if (steps >= targetSteps) {
        level = 'active-high';
      } else if (steps >= targetSteps * 0.8) {
        level = 'active-medium';
      } else if (steps >= targetSteps * 0.5) {
        level = 'active-low';
      }

      // 格式化步数显示
      let displayValue = '';
      if (steps > 0) {
        displayValue = steps >= 10000 ? (steps / 1000).toFixed(0) + 'k' : steps.toString();
      }

      weekly.push({
        date: dateStr,
        day: date.getDate(),
        weekday: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        steps: steps,
        level: level,
        displayValue: displayValue,
      });
    }
    
    return weekly;
  },

  // 从后端加载步数
  async loadStepsFromBackend() {
    if (!isLoggedIn()) return;
    try {
      const today = formatDateStr();
      const res = await request('/api/user/exercise', 'GET', { start: today, end: today });
      if (res.code === 200 && res.data && res.data.length > 0) {
        const record = res.data[0];
        if (record.steps && record.steps > 0) {
          wx.setStorageSync(`steps_${today}`, record.steps);
          this.updateStepData();
        }
      }
    } catch (err) {
      console.warn('从后端加载步数失败:', err.message);
    }
  },

  // 头像加载失败
  onAvatarError() {
    this.setData({ avatarError: true, avatarUrl: '' });
  },

  // 刷新步数（从后端同步）
  refreshSteps() {
    wx.showLoading({ title: '同步中...', mask: true });
    this.loadStepsFromBackend().finally(() => {
      wx.hideLoading();
    });
  },

  // 更新步数数据
  updateStepData() {
    const { bodyData } = this.data;
    const stepData = this.loadStepData(bodyData);
    this.setData({ stepData });
  },

  // 手动设置步数
  setManualSteps() {
    wx.showModal({
      title: '设置步数',
      editable: true,
      placeholderText: '请输入今日步数',
      success: (res) => {
        if (res.confirm && res.content) {
          const steps = parseInt(res.content) || 0;
          if (steps >= 0) {
            const today = formatDateStr();
            wx.setStorageSync(`steps_${today}`, steps);
            this.updateStepData();

            // 同步到后端
            if (isLoggedIn()) {
              request('/api/user/exercise', 'POST', {
                date: today,
                type: 'steps',
                steps: steps,
              }).catch((err) => console.warn('步数同步后端失败:', err.message));
            }

            wx.showToast({
              title: '设置成功',
              icon: 'success',
            });
          } else {
            wx.showToast({
              title: '请输入有效数字',
              icon: 'none',
            });
          }
        }
      },
    });
  },

  // 计算身体数据
  calculateBodyData(planData) {
    // 确保从字符串正确转换为数字
    const height = planData.height ? parseFloat(String(planData.height).trim()) || 0 : 0;
    const weight = planData.weight ? parseFloat(String(planData.weight).trim()) || 0 : 0;
    const targetWeight = planData.targetWeight ? parseFloat(String(planData.targetWeight).trim()) || 0 : 0;

    let bmi = 0;
    let bmiStatus = '未设置';
    if (height > 0 && weight > 0 && !isNaN(height) && !isNaN(weight)) {
      const heightM = height / 100;
      bmi = (weight / (heightM * heightM)).toFixed(1);
      const bmiNum = parseFloat(bmi);
      
      if (bmiNum < 18.5) {
        bmiStatus = '偏瘦';
      } else if (bmiNum < 24) {
        bmiStatus = '正常';
      } else if (bmiNum < 28) {
        bmiStatus = '偏胖';
      } else {
        bmiStatus = '肥胖';
      }
    }

    return {
      height: height,
      weight: weight,
      bmi: parseFloat(bmi) || 0,
      targetWeight: targetWeight,
      bmiStatus: bmiStatus,
    };
  },

  // 点击模块
  onModuleTap(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({
        url,
      });
    }
  },

  // 查看积分详情
  onPointsTap() {
    wx.navigateTo({
      url: '/pages/home/points/index',
    });
  },
});
