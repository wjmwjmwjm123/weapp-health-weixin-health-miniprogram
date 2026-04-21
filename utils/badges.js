// 成就系统工具函数

/**
 * 更新成就进度
 * @param {string} badgeId 成就ID
 * @param {number} progress 进度值（可选，默认+1）
 * @returns {object|null} 返回解锁的成就信息，如果未解锁则返回null
 */
export function updateBadgeProgress(badgeId, progress = null) {
  const savedProgress = wx.getStorageSync('badges_progress') || {};
  const current = savedProgress[badgeId] || { progress: 0 };
  
  // 如果传入了progress，直接设置；否则+1
  const newProgress = progress !== null ? progress : (current.progress || 0) + 1;
  
  // 获取成就目标（需要从成就数据中获取）
  const allBadges = getAllBadgesData();
  const badge = allBadges.find(b => b.id === badgeId);
  if (!badge) return null;
  
  const wasUnlocked = (current.progress || 0) >= badge.target;
  const isUnlocked = newProgress >= badge.target;
  
  // 更新进度
  savedProgress[badgeId] = {
    progress: newProgress,
    unlockTime: isUnlocked && !wasUnlocked ? new Date().toISOString() : current.unlockTime,
  };
  
  wx.setStorageSync('badges_progress', savedProgress);
  
  // 如果刚解锁，返回成就信息
  if (isUnlocked && !wasUnlocked) {
    return {
      ...badge,
      progress: newProgress,
      unlocked: true,
      unlockTime: savedProgress[badgeId].unlockTime,
    };
  }
  
  return null;
}

/**
 * 获取所有成就数据（简化版，用于工具函数）
 */
function getAllBadgesData() {
  return [
    { id: 'charity_1', name: '初次捐赠', target: 1, rewardPoints: 10 },
    { id: 'charity_2', name: '爱心使者', target: 10, rewardPoints: 50 },
    { id: 'charity_3', name: '公益达人', target: 50, rewardPoints: 200 },
    { id: 'charity_4', name: '慈善家', target: 100, rewardPoints: 500 },
    { id: 'charity_5', name: '连续捐赠', target: 7, rewardPoints: 100 },
    { id: 'charity_6', name: '月度捐赠', target: 30, rewardPoints: 150 },
    { id: 'charity_7', name: '年度慈善', target: 200, rewardPoints: 800 },
    { id: 'exercise_1', name: '初出茅庐', target: 1, rewardPoints: 10 },
    { id: 'exercise_2', name: '运动新星', target: 10, rewardPoints: 50 },
    { id: 'exercise_3', name: '健身达人', target: 50, rewardPoints: 200 },
    { id: 'exercise_4', name: '运动大师', target: 100, rewardPoints: 500 },
    { id: 'exercise_5', name: '坚持到底', target: 30, rewardPoints: 300 },
    { id: 'exercise_6', name: '晨练达人', target: 14, rewardPoints: 150 },
    { id: 'exercise_7', name: '夜跑健将', target: 20, rewardPoints: 120 },
    { id: 'exercise_8', name: '力量训练者', target: 25, rewardPoints: 180 },
    { id: 'checkin_1', name: '初次签到', target: 1, rewardPoints: 5 },
    { id: 'checkin_2', name: '签到达人', target: 30, rewardPoints: 100 },
    { id: 'checkin_3', name: '签到之王', target: 100, rewardPoints: 300 },
    { id: 'checkin_4', name: '连续签到', target: 7, rewardPoints: 50 },
    { id: 'checkin_5', name: '早起鸟', target: 14, rewardPoints: 80 },
    { id: 'checkin_6', name: '月度签到', target: 60, rewardPoints: 200 },
    { id: 'recipe_1', name: '美食探索者', target: 5, rewardPoints: 30 },
    { id: 'recipe_2', name: '料理大师', target: 20, rewardPoints: 150 },
    { id: 'recipe_3', name: '营养专家', target: 50, rewardPoints: 400 },
    { id: 'recipe_4', name: '轻食爱好者', target: 10, rewardPoints: 80 },
    { id: 'recipe_5', name: '素食达人', target: 15, rewardPoints: 120 },
    { id: 'social_1', name: '社交新手', target: 1, rewardPoints: 20 },
    { id: 'social_2', name: '活跃用户', target: 10, rewardPoints: 80 },
    { id: 'social_3', name: '社区之星', target: 100, rewardPoints: 200 },
    { id: 'social_4', name: '社交达人', target: 5, rewardPoints: 60 },
    { id: 'social_5', name: '互动之王', target: 50, rewardPoints: 150 },
  ];
}

/**
 * 触发成就解锁事件
 */
export function triggerBadgeUnlock(badge) {
  try {
    const app = getApp();
    if (app && app.eventBus) {
      app.eventBus.emit('badge-unlocked', badge);
    }
  } catch (e) {
    console.error('触发成就解锁事件失败:', e);
  }
}

