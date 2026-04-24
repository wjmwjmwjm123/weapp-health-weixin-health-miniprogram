import BADGES from './badgesData';

/**
 * 获取所有成就数据
 */
export function getAllBadges() {
  return BADGES;
}

/**
 * 更新成就进度
 * @param {string} badgeId 成就ID
 * @param {number} progress 进度值（可选，默认+1）
 * @returns {object|null} 返回解锁的成就信息，如果未解锁则返回null
 */
export function updateBadgeProgress(badgeId, progress = null) {
  const savedProgress = wx.getStorageSync('badges_progress') || {};
  const current = savedProgress[badgeId] || { progress: 0 };

  const newProgress = progress !== null ? progress : (current.progress || 0) + 1;

  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return null;

  const wasUnlocked = (current.progress || 0) >= badge.target;
  const isUnlocked = newProgress >= badge.target;

  savedProgress[badgeId] = {
    progress: newProgress,
    unlockTime: isUnlocked && !wasUnlocked ? new Date().toISOString() : current.unlockTime,
  };

  wx.setStorageSync('badges_progress', savedProgress);

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

