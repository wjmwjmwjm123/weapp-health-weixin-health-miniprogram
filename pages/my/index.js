import useToastBehavior from '~/behaviors/useToast';
import request from '~/api/request';
import { getPoints, spendPoints, syncPointsFromBackend } from '~/utils/points';
import BADGES from '~/utils/badgesData';
import { updateBadgeProgress, triggerBadgeUnlock } from '~/utils/badges';

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoad: false,
    avatarError: false,
    personalInfo: {},
    pointsPlaybook: {
      total: 328,
      charity: 128,
      charityAmount: '1.28',
      donatedAnimals: 20,
      weeklyGrowth: 45,
      weeklyGrowthText: '+45',
      ranking: '15%',
      earnList: [
        { title: '每日签到', desc: '记录体重、心情', points: '+5', icon: '🗓' },
        { title: '运动打卡', desc: '完成课程或户外步数', points: '+15', icon: '🏃‍♀️' },
        { title: '学习健康知识', desc: '阅读中医/营养文章', points: '+8', icon: '📚' },
        { title: '挑战任务', desc: '减脂挑战 / 团队PK', points: '+20', icon: '⚡️' },
      ],
      redeemList: [
        { title: '小程序会员', desc: '解锁全部训练营', cost: '199积分' },
        { title: '课程抵扣券', desc: '可抵扣20元课程', cost: '120积分' },
        { title: '中医咨询优惠', desc: '线上问诊立减20%', cost: '150积分' },
        { title: '公益捐赠', desc: '转化为公益金', cost: '1积分=0.01元' },
      ],
      charityProject: {
        title: '流浪动物保护联合计划',
        desc: '积分将定向用于购买饲料、疫苗与绝育手术。',
        cost: 80,
      },
      playIdeas: ['公益积分排行榜', '团队PK赛', '公益直播打赏', '社交拼团徒步'],
    },
    communityData: {
      groups: [
        { name: '中医养生组', desc: '体质调理 / 湿气治理 / 食疗分享', members: 1820, status: '热聊', icon: '🌿' },
        { name: '徒步爱好者组', desc: '周末山野徒步，结伴打卡', members: 960, status: '组队中', icon: '🥾' },
        { name: '力量燃脂组', desc: '帕梅拉+HIIT，一起冲积分', members: 1430, status: '火热', icon: '💪' },
      ],
      live: {
        title: '流浪动物救助公益直播',
        time: '本周五 20:00',
        desc: '跟随救助团队走进基地，积分可实时“打赏”物资。',
        action: '预约直播',
      },
    },
    displayedBadges: [], // 展示的成就徽章（最多6个）
    allBadges: [], // 所有成就数据
  },

  onLoad() {
    // 监听事件
    const app = getApp();
    if (app.eventBus) {
      // 监听缓存清除事件
      app.eventBus.on('cache-cleared', () => {
        // 缓存被清除后，刷新页面
        this.onShow();
      });
      
      // 监听登录成功事件
      app.eventBus.on('user-login-success', (userInfo) => {
        console.log('收到登录成功事件，刷新用户信息:', userInfo);
        // 登录成功后，刷新页面显示用户信息
        this.onShow();
      });
    }
  },

  async onShow() {
    const token = wx.getStorageSync('access_token');

    if (!token) {
      // 未登录，显示登录提示
      this.setData({ isLoad: false, personalInfo: {}, displayedBadges: [] });
      this.updatePointsData(0);
      return;
    }

    // 尝试从后端获取最新用户信息
    let profile = null;
    try {
      const res = await request('/api/user/profile');
      if (res.code === 200 && res.data) {
        profile = res.data;
      }
    } catch (err) {
      console.warn('后端获取用户信息失败，使用本地缓存:', err.message);
    }

    // 后端失败则回退到本地缓存
    let userInfo;
    if (profile) {
      userInfo = {
        nickname: profile.nickname || '',
        nickName: profile.nickname || '',
        avatarUrl: profile.avatar_url || '',
        avatar: profile.avatar_url || '',
        gender: profile.gender || 0,
        city: profile.city || '',
        province: profile.province || '',
        star: profile.star || '',
        brief: profile.brief || '',
        birth: profile.birth || '',
        points: profile.points || 0,
        role: profile.role || 'user',
      };
      // 同步更新本地缓存
      wx.setStorageSync('user_info', userInfo);
    } else {
      userInfo = wx.getStorageSync('user_info') || {};
    }

    if (userInfo && (userInfo.nickName || userInfo.nickname)) {
      const nickName = userInfo.nickName || userInfo.nickname || '微信用户';
      const avatarUrl = userInfo.avatarUrl || userInfo.avatar || '';

      this.setData({
        isLoad: true,
        avatarError: false,
        personalInfo: {
          name: nickName,
          image: avatarUrl,
          star: userInfo.star || '健身达人',
          city: userInfo.city || userInfo.province || '未知',
        },
      });

      // 优先读取本地积分，再同步后端
      let points = getPoints();
      try {
        points = await syncPointsFromBackend();
      } catch (err) {
        console.warn('积分同步失败:', err.message);
      }
      this.updatePointsData(points);
      this.loadDisplayedBadges();
      this.loadAllBadges();
    } else {
      this.setData({ isLoad: false, personalInfo: {}, displayedBadges: [] });
      this.updatePointsData(getPoints());
    }
  },

  onAvatarError() {
    this.setData({ avatarError: true, 'personalInfo.image': '' });
  },

  onLogin(e) {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },

  onNavigateTo() {
    wx.navigateTo({ url: `/pages/my/info-edit/index` });
  },

  onCheckPoints() {
    wx.navigateTo({
      url: '/pages/home/points/index',
      fail: () => {
        this.onShowToast('#t-toast', '功能开发中，敬请期待');
      },
    });
  },

  onDonate() {
    const currentPoints = getPoints();
    const cost = this.data.pointsPlaybook.charityProject.cost || 80; // 每份物资需要的积分
    
    if (currentPoints < cost) {
      this.onShowToast('#t-toast', `积分不足，需要${cost}积分，当前只有${currentPoints}积分`);
      return;
    }
    
    wx.showModal({
      title: '确认捐赠',
      content: `确定要捐赠${cost}积分（1份物资）吗？`,
      confirmText: '确认捐赠',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 扣除积分
          const remainingPoints = spendPoints(cost, '公益捐赠', {
            source: 'charity-donate',
            project: this.data.pointsPlaybook.charityProject.title,
          });

          // 更新累计捐赠
          const totalDonatedKey = 'total_donated_points';
          const currentTotalDonated = wx.getStorageSync(totalDonatedKey) || 0;
          const newTotalDonated = currentTotalDonated + cost;
          wx.setStorageSync(totalDonatedKey, newTotalDonated);

          // 更新页面数据（此时 totalDonated 已是最新）
          this.updatePointsData(remainingPoints);
          
          // 更新成就进度
          // 获取累计捐赠次数
          const donationCountKey = 'total_donation_count';
          const currentDonationCount = wx.getStorageSync(donationCountKey) || 0;
          const newDonationCount = currentDonationCount + 1;
          wx.setStorageSync(donationCountKey, newDonationCount);
          
          // 初次捐赠成就
          const unlockedBadge1 = updateBadgeProgress('charity_1'); // 初次捐赠
          if (unlockedBadge1) {
            triggerBadgeUnlock(unlockedBadge1);
          }
          
          // 累计捐赠成就
          const unlockedBadge2 = updateBadgeProgress('charity_2', newDonationCount); // 爱心使者
          if (unlockedBadge2) {
            triggerBadgeUnlock(unlockedBadge2);
          }
          updateBadgeProgress('charity_3', newDonationCount); // 公益达人
          updateBadgeProgress('charity_4', newDonationCount); // 慈善家
          updateBadgeProgress('charity_6', newDonationCount); // 月度捐赠
          updateBadgeProgress('charity_7', newDonationCount); // 年度慈善
          
          // 检查连续捐赠（需要检查最近7天的捐赠记录）
          const donationHistory = wx.getStorageSync('donation_history') || [];
          const today = new Date().toISOString().split('T')[0];
          donationHistory.push(today);
          // 只保留最近7天的记录
          const recent7Days = donationHistory.slice(-7);
          wx.setStorageSync('donation_history', recent7Days);
          
          // 如果最近7天都有捐赠，更新连续捐赠成就
          if (recent7Days.length >= 7) {
            const uniqueDays = [...new Set(recent7Days)];
            if (uniqueDays.length >= 7) {
              const unlockedBadge = updateBadgeProgress('charity_5', 7);
              if (unlockedBadge) {
                triggerBadgeUnlock(unlockedBadge);
              }
            }
          }
          
          this.onShowToast('#t-toast', `捐赠成功！已扣除${cost}积分，感谢你的善意！`);
        }
      },
    });
  },

  onJoinGroup(e) {
    const { name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/my/community/index?name=${name}`,
    });
  },

  onWatchLive() {
    this.onShowToast('#t-toast', '已预约公益直播，会在开播前提醒你');
  },

  onViewAllBadges() {
    wx.navigateTo({
      url: '/pages/my/badges/index',
    });
  },

  // 加载展示的成就徽章
  loadDisplayedBadges() {
    try {
      const savedDisplayed = wx.getStorageSync('displayed_badges') || [];
      const allBadges = this.getAllBadges();
      
      if (savedDisplayed.length > 0) {
        // 从成就系统中获取完整的成就信息（只显示已解锁的）
        const displayedBadges = savedDisplayed
          .map(id => allBadges.find(b => b.id === id))
          .filter(b => b && b.unlocked) // 只保留已解锁的成就
          .slice(0, 6); // 最多显示6个
        
        this.setData({ displayedBadges });
      } else {
        // 如果没有保存的，自动选择前几个已解锁的成就
        this.autoSelectDisplayedBadges();
      }
    } catch (error) {
      console.error('加载成就展示失败:', error);
      this.setData({ displayedBadges: [] });
    }
  },

  // 获取所有成就数据（从共享数据源 + 本地进度合并）
  getAllBadges() {
    const savedProgress = wx.getStorageSync('badges_progress') || {};

    return BADGES.map(badge => {
      const saved = savedProgress[badge.id] || {};
      const progress = saved.progress || 0;
      return {
        ...badge,
        progress,
        unlocked: progress >= badge.target,
        message: badge.message || '',
        desc: badge.desc || '',
      };
    });
  },

  // 自动选择要展示的成就
  autoSelectDisplayedBadges() {
    const allBadges = this.getAllBadges();
    const unlockedBadges = allBadges.filter(b => b.unlocked);
    
    if (unlockedBadges.length === 0) {
      this.setData({ displayedBadges: [] });
      return;
    }
    
    // 按稀有度排序，优先展示高稀有度成就
    const rarityOrder = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
    const sorted = unlockedBadges.sort((a, b) => {
      const aRarity = rarityOrder[a.rarity] || 0;
      const bRarity = rarityOrder[b.rarity] || 0;
      return bRarity - aRarity;
    });
    
    const displayed = sorted.slice(0, 6);
    const displayedIds = displayed.map(b => b.id);
    wx.setStorageSync('displayed_badges', displayedIds);
    this.setData({ displayedBadges: displayed });
  },

  // 编辑展示的成就
  onEditBadges() {
    wx.navigateTo({
      url: '/pages/my/badges/index?mode=select',
      success: () => {
        // 监听成就选择完成事件
        const app = getApp();
        if (app.eventBus) {
          app.eventBus.once('badges-selected', (selectedIds) => {
            const allBadges = this.getAllBadges();
            const displayedBadges = selectedIds
              .map(id => allBadges.find(b => b.id === id))
              .filter(b => b && b.unlocked) // 只保留已解锁的成就
              .slice(0, 6);
            
            wx.setStorageSync('displayed_badges', displayedBadges.map(b => b.id));
            this.setData({ displayedBadges });
          });
        }
      },
    });
  },

  // 加载所有成就数据
  loadAllBadges() {
    const allBadges = this.getAllBadges();
    this.setData({ allBadges });
  },

  // 查看成就详情
  onViewBadgeDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/my/badges/index?badgeId=${id}`,
    });
  },

  // 显示成就解锁弹窗
  showBadgeUnlockPopup(badge) {
    wx.showModal({
      title: '🎉 成就解锁！',
      content: `${badge.icon} ${badge.name}\n\n${badge.message || badge.desc}\n\n奖励：${badge.rewardPoints} 积分`,
      showCancel: false,
      confirmText: '太棒了！',
      confirmColor: '#667eea',
    });
  },

  onRedeem(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.pointsPlaybook.redeemList[index];
    if (!item) return;

    // 解析所需积分
    let cost = 0;
    const costMatch = item.cost.match(/(\d+)/);
    if (costMatch) {
      cost = parseInt(costMatch[1], 10);
    }
    if (cost <= 0) {
      this.onShowToast('#t-toast', '兑换项暂不可用');
      return;
    }

    const currentPoints = getPoints();
    if (currentPoints < cost) {
      this.onShowToast('#t-toast', `积分不足，需要${cost}积分，当前只有${currentPoints}积分`);
      return;
    }

    wx.showModal({
      title: '确认兑换',
      content: `确定要兑换「${item.title}」吗？\n将消耗 ${cost} 积分`,
      confirmText: '确认兑换',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const remaining = spendPoints(cost, `兑换：${item.title}`, {
            source: 'redeem',
            item: item.title,
          });
          this.updatePointsData(remaining);
          this.onShowToast('#t-toast', `兑换成功！已扣除${cost}积分`);
        }
      },
    });
  },

  onGoSetting() {
    wx.navigateTo({
      url: '/pages/setting/index',
    });
  },

  onContact() {
    this.onShowToast('#t-toast', '客服微信：Ksbsds-0  电话：15559219227');
  },

  updatePointsData(points) {
    // 公益余额 = 总积分（所有积分均可用于公益/兑换）
    const baseCharity = Math.max(0, points);

    // 累计捐赠的积分和金额（从存储中读取）
    const totalDonatedKey = 'total_donated_points';
    const totalDonated = wx.getStorageSync(totalDonatedKey) || 0;
    const charityAmount = (totalDonated * 0.01).toFixed(2);
    const donatedAnimals = Math.max(0, Math.floor(totalDonated / 5));

    const history = wx.getStorageSync('points_history') || [];
    const weeklyGrowthValue = this.calculateWeeklyGrowth(history);
    const weeklyGrowthText = `${weeklyGrowthValue >= 0 ? '+' : ''}${weeklyGrowthValue}`;
    const ranking = this.calculateRanking(points);

    this.setData({
      pointsPlaybook: {
        ...this.data.pointsPlaybook,
        total: points,
        charity: baseCharity,
        charityAmount,
        donatedAnimals,
        weeklyGrowth: weeklyGrowthValue,
        weeklyGrowthText,
        ranking,
      },
    });
  },

  calculateWeeklyGrowth(history) {
    const now = Date.now();
    const sevenDaysAgo = now - 6 * 24 * 60 * 60 * 1000;
    return history.reduce((sum, item) => {
      const timestamp = this.parseHistoryTimestamp(item);
      if (!timestamp || timestamp < sevenDaysAgo) return sum;
      const amount = Number(item.amount) || 0;
      if (item.type === 'earn') {
        return sum + amount;
      }
      if (item.type === 'spend' || item.type === 'deduct') {
        return sum - amount;
      }
      return sum;
    }, 0);
  },

  parseHistoryTimestamp(item) {
    if (item.timestamp) return item.timestamp;
    if (item.time) {
      const normalized = item.time.replace(/-/g, '/');
      const parsed = Date.parse(normalized);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return 0;
  },

  calculateRanking(points) {
    if (points >= 600) return '5%';
    if (points >= 300) return '15%';
    if (points >= 150) return '25%';
    return '40%';
  },
});
