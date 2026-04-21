// app.js
import createBus from './utils/eventBus';
import { deductPoints } from './utils/points';

App({
  onLaunch() {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      // console.log(res.hasUpdate)
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    // 启动时检查昨日任务是否达标
    this.checkYesterdayTask();
    
    // 设置定时检查（每日23:59检查任务是否达标）
    this.setupDailyTaskCheck();
  },

  // 检查昨日任务是否达标
  checkYesterdayTask() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;
    
    // 检查是否已经检查过昨日任务
    const lastCheckDate = wx.getStorageSync('last_task_check_date');
    if (lastCheckDate === yesterdayStr) {
      // 已经检查过，不再重复检查
      return;
    }

    const yesterdayTask = wx.getStorageSync(`today_task_${yesterdayStr}`);
    if (yesterdayTask && yesterdayTask.total > 0) {
      // 判断任务是否达标
      if (yesterdayTask.completed < yesterdayTask.total) {
        // 任务未达标，扣除1分
        deductPoints(1, `昨日任务未达标（完成${yesterdayTask.completed}/${yesterdayTask.total}）`, {
          source: 'task-check',
        });
      }
      
      // 标记已检查
      wx.setStorageSync('last_task_check_date', yesterdayStr);
    }
  },

  // 设置每日定时检查任务
  setupDailyTaskCheck() {
    // 微信小程序不支持后台定时任务，所以每次进入小程序时检查
    // 这里设置一个标志，在首页显示时检查
    // 实际场景中，应该在用户进入小程序时检查昨日任务
  },

  globalData: {
    userInfo: null,
  },

  /** 全局事件总线 */
  eventBus: createBus(),
});
