Page({
  data: {
    level: 1,
    totalPoints: 0,
    nextLevelPoints: 100,
    levelProgress: 0,
    currentCategory: 'all',
    categories: [
      { id: 'charity', name: '公益', icon: '🌱' },
      { id: 'exercise', name: '运动', icon: '🔥' },
      { id: 'checkin', name: '打卡', icon: '✅' },
      { id: 'recipe', name: '食谱', icon: '🥗' },
      { id: 'social', name: '社交', icon: '👥' },
    ],
    allBadges: [],
    displayBadges: [],
    showDetail: false,
    selectedBadge: null,
    selectMode: false, // 是否为选择模式
    selectedBadgeIds: [], // 已选择的成就ID（最多6个）
  },

  onLoad(options) {
    // 检查是否为选择模式
    if (options.mode === 'select') {
      this.setData({ selectMode: true });
      const savedDisplayed = wx.getStorageSync('displayed_badges') || [];
      this.setData({ selectedBadgeIds: savedDisplayed });
    }
    
    // 如果有指定成就ID，直接显示详情
    if (options.badgeId) {
      this.initBadges();
      this.loadUserProgress();
      setTimeout(() => {
        const badge = this.data.allBadges.find(b => b.id === options.badgeId);
        if (badge) {
          this.setData({
            selectedBadge: badge,
            showDetail: true,
          });
        }
      }, 100);
      return;
    }
    
    this.initBadges();
    this.loadUserProgress();
  },

  initBadges() {
    // 完整的成就系统数据
    const badges = [
      // 公益类成就
      {
        id: 'charity_1',
        category: 'charity',
        name: '初次捐赠',
        desc: '完成第一次公益捐赠',
        message: '第一次捐献，来一个，喵喵喵喵喵（感谢你的帮助）',
        icon: '🌱',
        target: 1,
        progress: 0,
        rewardPoints: 10,
        rarity: 'common',
      },
      {
        id: 'charity_2',
        category: 'charity',
        name: '爱心使者',
        desc: '累计捐赠 10 次',
        message: '你的每一次捐赠，都是对流浪小动物最温暖的关怀，喵喵喵喵喵（感谢你的帮助）',
        icon: '💝',
        target: 10,
        progress: 0,
        rewardPoints: 50,
        rarity: 'rare',
      },
      {
        id: 'charity_3',
        category: 'charity',
        name: '公益达人',
        desc: '累计捐赠 50 次',
        message: '50次捐赠，50份爱心，你的坚持让世界更美好，喵喵喵喵喵（感谢你的帮助）',
        icon: '🌟',
        target: 50,
        progress: 0,
        rewardPoints: 200,
        rarity: 'epic',
      },
      {
        id: 'charity_4',
        category: 'charity',
        name: '慈善家',
        desc: '累计捐赠 100 次',
        message: '100次捐赠，你是真正的慈善家！小动物们会永远记住你的恩情，喵喵喵喵喵（感谢你的帮助）',
        icon: '👑',
        target: 100,
        progress: 0,
        rewardPoints: 500,
        rarity: 'legendary',
      },
      {
        id: 'charity_5',
        category: 'charity',
        name: '连续捐赠',
        desc: '连续 7 天捐赠',
        message: '连续7天的坚持，展现了你的爱心与毅力，喵喵喵喵喵（感谢你的帮助）',
        icon: '🔥',
        target: 7,
        progress: 0,
        rewardPoints: 100,
        rarity: 'rare',
      },
      // 运动类成就
      {
        id: 'exercise_1',
        category: 'exercise',
        name: '初出茅庐',
        desc: '完成第一次运动打卡',
        message: '第一次运动打卡，迈出健康生活的第一步，感谢你的努力！',
        icon: '🏃‍♀️',
        target: 1,
        progress: 0,
        rewardPoints: 10,
        rarity: 'common',
      },
      {
        id: 'exercise_2',
        category: 'exercise',
        name: '运动新星',
        desc: '完成 10 次运动打卡',
        message: '10次运动打卡，你已经是一颗闪亮的运动新星了，感谢你的坚持！',
        icon: '⭐',
        target: 10,
        progress: 0,
        rewardPoints: 50,
        rarity: 'rare',
      },
      {
        id: 'exercise_3',
        category: 'exercise',
        name: '健身达人',
        desc: '完成 50 次运动打卡',
        message: '50次运动打卡，你已经是真正的健身达人了！继续加油，感谢你的坚持！',
        icon: '💪',
        target: 50,
        progress: 0,
        rewardPoints: 200,
        rarity: 'epic',
      },
      {
        id: 'exercise_4',
        category: 'exercise',
        name: '运动大师',
        desc: '完成 100 次运动打卡',
        message: '100次运动打卡，你是当之无愧的运动大师！你的毅力令人敬佩，感谢你的坚持！',
        icon: '🏆',
        target: 100,
        progress: 0,
        rewardPoints: 500,
        rarity: 'legendary',
      },
      {
        id: 'exercise_5',
        category: 'exercise',
        name: '坚持到底',
        desc: '连续 30 天运动',
        message: '连续30天运动，你的坚持让人感动！这就是真正的毅力，感谢你的坚持！',
        icon: '🔥',
        target: 30,
        progress: 0,
        rewardPoints: 300,
        rarity: 'epic',
      },
      // 打卡类成就
      {
        id: 'checkin_1',
        category: 'checkin',
        name: '初次签到',
        desc: '完成第一次每日签到',
        message: '第一次签到，记录生活的美好开始，感谢你的参与！',
        icon: '📝',
        target: 1,
        progress: 0,
        rewardPoints: 5,
        rarity: 'common',
      },
      {
        id: 'checkin_2',
        category: 'checkin',
        name: '签到达人',
        desc: '累计签到 30 天',
        message: '30天签到，你已经养成了良好的习惯，感谢你的坚持！',
        icon: '📅',
        target: 30,
        progress: 0,
        rewardPoints: 100,
        rarity: 'rare',
      },
      {
        id: 'checkin_3',
        category: 'checkin',
        name: '签到之王',
        desc: '累计签到 100 天',
        message: '100天签到，你是真正的签到之王！这份坚持值得所有人学习，感谢你的坚持！',
        icon: '👑',
        target: 100,
        progress: 0,
        rewardPoints: 300,
        rarity: 'epic',
      },
      {
        id: 'checkin_4',
        category: 'checkin',
        name: '连续签到',
        desc: '连续 7 天签到',
        message: '连续7天签到，好习惯正在养成，继续加油，感谢你的坚持！',
        icon: '🔥',
        target: 7,
        progress: 0,
        rewardPoints: 50,
        rarity: 'rare',
      },
      // 食谱类成就
      {
        id: 'recipe_1',
        category: 'recipe',
        name: '美食探索者',
        desc: '学习 5 道健康食谱',
        message: '学习了5道健康食谱，开始探索美食的奥秘，感谢你的探索！',
        icon: '🍽️',
        target: 5,
        progress: 0,
        rewardPoints: 30,
        rarity: 'common',
      },
      {
        id: 'recipe_2',
        category: 'recipe',
        name: '料理大师',
        desc: '学习 20 道健康食谱',
        message: '20道健康食谱，你已经是一位料理大师了！继续探索更多美味，感谢你的探索！',
        icon: '👨‍🍳',
        target: 20,
        progress: 0,
        rewardPoints: 150,
        rarity: 'epic',
      },
      {
        id: 'recipe_3',
        category: 'recipe',
        name: '营养专家',
        desc: '学习 50 道健康食谱',
        message: '50道健康食谱，你是真正的营养专家！你的健康知识让人敬佩，感谢你的探索！',
        icon: '🥗',
        target: 50,
        progress: 0,
        rewardPoints: 400,
        rarity: 'legendary',
      },
      // 社交类成就
      {
        id: 'social_1',
        category: 'social',
        name: '社交新手',
        desc: '加入第一个圈子',
        message: '加入第一个圈子，开始你的社交之旅，感谢你的参与！',
        icon: '👥',
        target: 1,
        progress: 0,
        rewardPoints: 20,
        rarity: 'common',
      },
      {
        id: 'social_2',
        category: 'social',
        name: '活跃用户',
        desc: '发布 10 条动态',
        message: '发布了10条动态，你是社区的活跃用户！继续分享你的生活，感谢你的分享！',
        icon: '💬',
        target: 10,
        progress: 0,
        rewardPoints: 80,
        rarity: 'rare',
      },
      {
        id: 'social_3',
        category: 'social',
        name: '社区之星',
        desc: '获得 100 个点赞',
        message: '获得100个点赞，你是真正的社区之星！你的内容深受大家喜爱，感谢你的分享！',
        icon: '⭐',
        target: 100,
        progress: 0,
        rewardPoints: 200,
        rarity: 'epic',
      },
      {
        id: 'social_4',
        category: 'social',
        name: '社交达人',
        desc: '加入 5 个圈子',
        message: '加入了5个圈子，你已经是一位社交达人了！继续拓展你的社交圈，感谢你的参与！',
        icon: '🌟',
        target: 5,
        progress: 0,
        rewardPoints: 60,
        rarity: 'rare',
      },
      {
        id: 'social_5',
        category: 'social',
        name: '互动之王',
        desc: '累计评论 50 次',
        message: '累计评论50次，你是真正的互动之王！你的参与让社区更活跃，感谢你的分享！',
        icon: '💭',
        target: 50,
        progress: 0,
        rewardPoints: 150,
        rarity: 'epic',
      },
      // 更多运动类成就
      {
        id: 'exercise_6',
        category: 'exercise',
        name: '晨练达人',
        desc: '连续 14 天晨练',
        message: '连续14天晨练，你已经养成了晨练的好习惯！继续坚持，感谢你的努力！',
        icon: '🌅',
        target: 14,
        progress: 0,
        rewardPoints: 150,
        rarity: 'rare',
      },
      {
        id: 'exercise_7',
        category: 'exercise',
        name: '夜跑健将',
        desc: '完成 20 次夜跑',
        message: '完成了20次夜跑，你是真正的夜跑健将！夜晚的坚持更显珍贵，感谢你的坚持！',
        icon: '🌙',
        target: 20,
        progress: 0,
        rewardPoints: 120,
        rarity: 'rare',
      },
      {
        id: 'exercise_8',
        category: 'exercise',
        name: '力量训练者',
        desc: '完成 25 次力量训练',
        message: '完成了25次力量训练，你的力量在不断提升！继续挑战自己，感谢你的坚持！',
        icon: '💪',
        target: 25,
        progress: 0,
        rewardPoints: 180,
        rarity: 'epic',
      },
      // 更多打卡类成就
      {
        id: 'checkin_5',
        category: 'checkin',
        name: '早起鸟',
        desc: '连续 14 天早起签到',
        message: '连续14天早起签到，你是真正的早起鸟！早起的习惯让你更健康，感谢你的坚持！',
        icon: '🐦',
        target: 14,
        progress: 0,
        rewardPoints: 80,
        rarity: 'rare',
      },
      {
        id: 'checkin_6',
        category: 'checkin',
        name: '月度签到',
        desc: '累计签到 60 天',
        message: '累计签到60天，你已经坚持了两个月！这份毅力值得称赞，感谢你的坚持！',
        icon: '📆',
        target: 60,
        progress: 0,
        rewardPoints: 200,
        rarity: 'epic',
      },
      // 更多食谱类成就
      {
        id: 'recipe_4',
        category: 'recipe',
        name: '轻食爱好者',
        desc: '学习 10 道轻食食谱',
        message: '学习了10道轻食食谱，你是真正的轻食爱好者！健康饮食从轻食开始，感谢你的探索！',
        icon: '🥙',
        target: 10,
        progress: 0,
        rewardPoints: 80,
        rarity: 'rare',
      },
      {
        id: 'recipe_5',
        category: 'recipe',
        name: '素食达人',
        desc: '学习 15 道素食食谱',
        message: '学习了15道素食食谱，你是真正的素食达人！素食让生活更健康，感谢你的探索！',
        icon: '🥬',
        target: 15,
        progress: 0,
        rewardPoints: 120,
        rarity: 'epic',
      },
      // 更多公益类成就
      {
        id: 'charity_6',
        category: 'charity',
        name: '月度捐赠',
        desc: '累计捐赠 30 次',
        message: '累计捐赠30次，你的爱心持续发光，喵喵喵喵喵（感谢你的帮助）',
        icon: '💖',
        target: 30,
        progress: 0,
        rewardPoints: 150,
        rarity: 'epic',
      },
      {
        id: 'charity_7',
        category: 'charity',
        name: '年度慈善',
        desc: '累计捐赠 200 次',
        message: '累计捐赠200次，你是年度慈善之星！小动物们会永远记住你的大爱，喵喵喵喵喵（感谢你的帮助）',
        icon: '🏅',
        target: 200,
        progress: 0,
        rewardPoints: 800,
        rarity: 'legendary',
      },
    ];

    // 从存储中加载用户进度
    const savedProgress = wx.getStorageSync('badges_progress') || {};
    const allBadges = badges.map(badge => {
      const saved = savedProgress[badge.id] || {};
      const oldProgress = saved.progress || 0;
      const progress = saved.progress || 0;
      const wasUnlocked = oldProgress >= badge.target;
      const unlocked = progress >= badge.target;
      
      // 如果刚解锁，触发解锁事件
      if (unlocked && !wasUnlocked) {
        setTimeout(() => {
          try {
            const { triggerBadgeUnlock } = require('~/utils/badges');
            triggerBadgeUnlock({
              ...badge,
              progress,
              unlocked: true,
              unlockTime: saved.unlockTime || new Date().toISOString(),
            });
          } catch (e) {
            console.error('触发成就解锁事件失败:', e);
          }
        }, 100);
      }
      
      return {
        ...badge,
        progress,
        unlocked,
        percent: Math.min(100, Math.round((progress / badge.target) * 100)),
        unlockTime: saved.unlockTime || null,
      };
    });

    this.setData({
      allBadges,
      displayBadges: allBadges,
    });
  },

  loadUserProgress() {
    // 计算总成就点数和等级
    const unlockedBadges = this.data.allBadges.filter(b => b.unlocked);
    const totalPoints = unlockedBadges.reduce((sum, badge) => sum + badge.rewardPoints, 0);
    
    // 计算等级（每100点升一级）
    const level = Math.floor(totalPoints / 100) + 1;
    const nextLevelPoints = level * 100;
    const levelProgress = ((totalPoints % 100) / 100) * 100;

    this.setData({
      totalPoints,
      level,
      nextLevelPoints,
      levelProgress,
    });
  },

  onSwitchCategory(e) {
    const { id } = e.currentTarget.dataset;
    const displayBadges = id === 'all' 
      ? this.data.allBadges 
      : this.data.allBadges.filter(badge => badge.category === id);
    
    this.setData({
      currentCategory: id,
      displayBadges,
    });
  },

  onShowDetail(e) {
    const { id } = e.currentTarget.dataset;
    
    // 如果是选择模式，切换选择状态
    if (this.data.selectMode) {
      this.toggleBadgeSelection(id);
      return;
    }
    
    const badge = this.data.allBadges.find(b => b.id === id);
    if (badge) {
      this.setData({
        selectedBadge: badge,
        showDetail: true,
      });
    }
  },

  toggleBadgeSelection(badgeId) {
    const badge = this.data.allBadges.find(b => b.id === badgeId);
    if (!badge) {
      return;
    }
    
    // 只能选择已解锁的成就
    if (!badge.unlocked) {
      wx.showToast({
        title: '只能选择已解锁的成就',
        icon: 'none',
      });
      return;
    }

    let selectedBadgeIds = [...this.data.selectedBadgeIds];
    const index = selectedBadgeIds.indexOf(badgeId);
    
    if (index > -1) {
      // 取消选择
      selectedBadgeIds.splice(index, 1);
    } else {
      // 添加选择（最多6个）
      if (selectedBadgeIds.length >= 6) {
        wx.showToast({
          title: '最多只能选择6个成就',
          icon: 'none',
        });
        return;
      }
      selectedBadgeIds.push(badgeId);
    }

    this.setData({ selectedBadgeIds });
  },

  onCloseDetail() {
    this.setData({
      showDetail: false,
      selectedBadge: null,
    });
  },

  onCancelSelect() {
    wx.navigateBack();
  },

  onConfirmSelect() {
    const app = getApp();
    if (app.eventBus) {
      app.eventBus.emit('badges-selected', this.data.selectedBadgeIds);
    }
    wx.navigateBack();
  },
});
