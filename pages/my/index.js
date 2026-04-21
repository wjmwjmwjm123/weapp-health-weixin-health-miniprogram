import useToastBehavior from '~/behaviors/useToast';
import { getPoints, spendPoints } from '~/utils/points';
import { updateBadgeProgress, triggerBadgeUnlock } from '~/utils/badges';

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoad: false,
    personalInfo: {},
    mbtiProfile: {
      type: 'INFP',
      persona: '纤柔治愈型教练',
      tip: '保持温柔节奏，连结身心并重塑体态。',
      story: '根据你的 MBTI 气质，系统将为你生成专属卡通人物、运动口号与饮食偏好，记录每一次蜕变。',
      emoji: '🧘‍♀️',
    },
    avatarThemes: ['元气晨练', '办公室拉伸', '室外慢跑', '中医养生'],
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
    rechargeOptions: [
      { title: '课程能量包', desc: '包含 7 天会员 + 课程抵扣券', price: 29, tag: '热门' },
      { title: '食谱月卡', desc: '每日推送三餐搭配，支持打印', price: 49, tag: '新' },
      { title: '装备补给礼盒', desc: '跳绳+弹力带+泡沫轴组合', price: 129, tag: '' },
    ],
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
    const userInfo = wx.getStorageSync('user_info');

    console.log('我的页面 - 检查登录状态:', { 
      hasToken: !!token, 
      hasUserInfo: !!userInfo,
      userInfo: userInfo 
    });

    // 检查是否已登录（必须有token和userInfo）
    if (token && userInfo) {
      // 使用微信登录获取的用户信息
      // 官方文档：wx.getUserProfile 返回的字段名是 nickName 和 avatarUrl（注意大小写）
      // 参考：https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserProfile.html
      
      // 优先使用官方字段名
      let nickName = userInfo.nickName || userInfo.nickname || '';
      let avatarUrl = userInfo.avatarUrl || userInfo.avatar || '';
      
      console.log('=== 我的页面 - 解析用户信息 ===');
      console.log('原始 userInfo:', userInfo);
      console.log('nickName (官方):', userInfo.nickName);
      console.log('avatarUrl (官方):', userInfo.avatarUrl);
      console.log('nickname (兼容):', userInfo.nickname);
      console.log('avatar (兼容):', userInfo.avatar);
      console.log('最终 nickName:', nickName);
      console.log('最终 avatarUrl:', avatarUrl);
      
      // 如果还是没有，说明数据有问题
      if (!nickName) {
        console.error('错误：未获取到昵称，所有字段都为空');
        nickName = '微信用户'; // 降级处理
      }
      if (!avatarUrl) {
        console.error('错误：未获取到头像，所有字段都为空');
        // 不设置默认值，让头像显示为默认图标
      }
      
      // 注意：如果 nickName 是"微信用户"，可能是：
      // 1. 用户没有设置微信昵称
      // 2. 用户授权时选择了不提供昵称
      // 3. 这是微信返回的默认值，是正常的
      
      // 显示用户信息（即使昵称是"微信用户"也正常显示，因为这是微信返回的真实数据）
      this.setData({
        isLoad: true,
        personalInfo: {
          name: nickName, // 显示微信返回的昵称（即使是"微信用户"也是真实的）
          image: avatarUrl, // 如果有头像就显示，没有就显示默认图标
          star: userInfo.star || '健身达人',
          city: userInfo.city || userInfo.province || '未知',
        },
      });

      const points = wx.getStorageSync('user_points') || 0;
      this.updatePointsData(points);
      this.loadDisplayedBadges();
      this.loadAllBadges();
      
      console.log('设置后的 personalInfo:', this.data.personalInfo);
    } else {
      // 未登录，不显示用户信息，显示登录提示
      console.log('我的页面 - 未登录状态');
      this.setData({
        isLoad: false,
        personalInfo: {},
        displayedBadges: [], // 未登录时清空成就展示
      });
      this.updatePointsData(0);
    }
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

  onMBTITest() {
    this.onShowToast('#t-toast', '即将开启 MBTI 测试');
  },

  onCustomizeAvatar() {
    this.onShowToast('#t-toast', '已为你创建卡通小人物，稍后可在首页展示');
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
          
          // 获取累计捐赠的积分（从存储中读取，如果没有则使用当前值）
          const totalDonatedKey = 'total_donated_points';
          const currentTotalDonated = wx.getStorageSync(totalDonatedKey) || 0;
          const newTotalDonated = currentTotalDonated + cost;
          wx.setStorageSync(totalDonatedKey, newTotalDonated);
          
          // 更新积分显示（会自动重新计算charity等数据）
          this.updatePointsData(remainingPoints);
          
          // 更新累计捐赠统计
          const newCharityAmount = (newTotalDonated * 0.01).toFixed(2); // 转换为元
          const newDonatedAnimals = Math.max(0, Math.floor(newTotalDonated / 5)); // 每5积分=1只动物
          
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
          
          this.setData({
            pointsPlaybook: {
              ...this.data.pointsPlaybook,
              charityAmount: newCharityAmount,
              donatedAnimals: newDonatedAnimals,
            },
          });
          
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

  // 获取所有成就数据（从成就系统）
  getAllBadges() {
    // 从存储中读取成就进度
    const savedProgress = wx.getStorageSync('badges_progress') || {};
    
    // 成就数据（与成就系统保持一致，只有公益类成才有"喵喵喵喵喵"）
    const badges = [
      { id: 'charity_1', name: '初次捐赠', icon: '🌱', category: 'charity', target: 1, rarity: 'common', message: '第一次捐献，来一个，喵喵喵喵喵（感谢你的帮助）', desc: '完成第一次公益捐赠' },
      { id: 'charity_2', name: '爱心使者', icon: '💝', category: 'charity', target: 10, rarity: 'rare', message: '你的每一次捐赠，都是对流浪小动物最温暖的关怀，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 10 次' },
      { id: 'charity_3', name: '公益达人', icon: '🌟', category: 'charity', target: 50, rarity: 'epic', message: '50次捐赠，50份爱心，你的坚持让世界更美好，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 50 次' },
      { id: 'charity_4', name: '慈善家', icon: '👑', category: 'charity', target: 100, rarity: 'legendary', message: '100次捐赠，你是真正的慈善家！小动物们会永远记住你的恩情，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 100 次' },
      { id: 'charity_5', name: '连续捐赠', icon: '🔥', category: 'charity', target: 7, rarity: 'rare', message: '连续7天的坚持，展现了你的爱心与毅力，喵喵喵喵喵（感谢你的帮助）', desc: '连续 7 天捐赠' },
      { id: 'charity_6', name: '月度捐赠', icon: '💖', category: 'charity', target: 30, rarity: 'epic', message: '累计捐赠30次，你的爱心持续发光，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 30 次' },
      { id: 'charity_7', name: '年度慈善', icon: '🏅', category: 'charity', target: 200, rarity: 'legendary', message: '累计捐赠200次，你是年度慈善之星！小动物们会永远记住你的大爱，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 200 次' },
      { id: 'exercise_1', name: '初出茅庐', icon: '🏃‍♀️', category: 'exercise', target: 1, rarity: 'common', message: '第一次运动打卡，迈出健康生活的第一步，感谢你的努力！', desc: '完成第一次运动打卡' },
      { id: 'exercise_2', name: '运动新星', icon: '⭐', category: 'exercise', target: 10, rarity: 'rare', message: '10次运动打卡，你已经是一颗闪亮的运动新星了，感谢你的坚持！', desc: '完成 10 次运动打卡' },
      { id: 'exercise_3', name: '健身达人', icon: '💪', category: 'exercise', target: 50, rarity: 'epic', message: '50次运动打卡，你已经是真正的健身达人了！继续加油，感谢你的坚持！', desc: '完成 50 次运动打卡' },
      { id: 'exercise_4', name: '运动大师', icon: '🏆', category: 'exercise', target: 100, rarity: 'legendary', message: '100次运动打卡，你是当之无愧的运动大师！你的毅力令人敬佩，感谢你的坚持！', desc: '完成 100 次运动打卡' },
      { id: 'exercise_5', name: '坚持到底', icon: '🔥', category: 'exercise', target: 30, rarity: 'epic', message: '连续30天运动，你的坚持让人感动！这就是真正的毅力，感谢你的坚持！', desc: '连续 30 天运动' },
      { id: 'exercise_6', name: '晨练达人', icon: '🌅', category: 'exercise', target: 14, rarity: 'rare', message: '连续14天晨练，你已经养成了晨练的好习惯！继续坚持，感谢你的努力！', desc: '连续 14 天晨练' },
      { id: 'exercise_7', name: '夜跑健将', icon: '🌙', category: 'exercise', target: 20, rarity: 'rare', message: '完成了20次夜跑，你是真正的夜跑健将！夜晚的坚持更显珍贵，感谢你的坚持！', desc: '完成 20 次夜跑' },
      { id: 'exercise_8', name: '力量训练者', icon: '💪', category: 'exercise', target: 25, rarity: 'epic', message: '完成了25次力量训练，你的力量在不断提升！继续挑战自己，感谢你的坚持！', desc: '完成 25 次力量训练' },
      { id: 'checkin_1', name: '初次签到', icon: '📝', category: 'checkin', target: 1, rarity: 'common', message: '第一次签到，记录生活的美好开始，感谢你的参与！', desc: '完成第一次每日签到' },
      { id: 'checkin_2', name: '签到达人', icon: '📅', category: 'checkin', target: 30, rarity: 'rare', message: '30天签到，你已经养成了良好的习惯，感谢你的坚持！', desc: '累计签到 30 天' },
      { id: 'checkin_3', name: '签到之王', icon: '👑', category: 'checkin', target: 100, rarity: 'epic', message: '100天签到，你是真正的签到之王！这份坚持值得所有人学习，感谢你的坚持！', desc: '累计签到 100 天' },
      { id: 'checkin_4', name: '连续签到', icon: '🔥', category: 'checkin', target: 7, rarity: 'rare', message: '连续7天签到，好习惯正在养成，继续加油，感谢你的坚持！', desc: '连续 7 天签到' },
      { id: 'checkin_5', name: '早起鸟', icon: '🐦', category: 'checkin', target: 14, rarity: 'rare', message: '连续14天早起签到，你是真正的早起鸟！早起的习惯让你更健康，感谢你的坚持！', desc: '连续 14 天早起签到' },
      { id: 'checkin_6', name: '月度签到', icon: '📆', category: 'checkin', target: 60, rarity: 'epic', message: '累计签到60天，你已经坚持了两个月！这份毅力值得称赞，感谢你的坚持！', desc: '累计签到 60 天' },
      { id: 'recipe_1', name: '美食探索者', icon: '🍽️', category: 'recipe', target: 5, rarity: 'common', message: '学习了5道健康食谱，开始探索美食的奥秘，感谢你的探索！', desc: '学习 5 道健康食谱' },
      { id: 'recipe_2', name: '料理大师', icon: '👨‍🍳', category: 'recipe', target: 20, rarity: 'epic', message: '20道健康食谱，你已经是一位料理大师了！继续探索更多美味，感谢你的探索！', desc: '学习 20 道健康食谱' },
      { id: 'recipe_3', name: '营养专家', icon: '🥗', category: 'recipe', target: 50, rarity: 'legendary', message: '50道健康食谱，你是真正的营养专家！你的健康知识让人敬佩，感谢你的探索！', desc: '学习 50 道健康食谱' },
      { id: 'recipe_4', name: '轻食爱好者', icon: '🥙', category: 'recipe', target: 10, rarity: 'rare', message: '学习了10道轻食食谱，你是真正的轻食爱好者！健康饮食从轻食开始，感谢你的探索！', desc: '学习 10 道轻食食谱' },
      { id: 'recipe_5', name: '素食达人', icon: '🥬', category: 'recipe', target: 15, rarity: 'epic', message: '学习了15道素食食谱，你是真正的素食达人！素食让生活更健康，感谢你的探索！', desc: '学习 15 道素食食谱' },
      { id: 'social_1', name: '社交新手', icon: '👥', category: 'social', target: 1, rarity: 'common', message: '加入第一个圈子，开始你的社交之旅，感谢你的参与！', desc: '加入第一个圈子' },
      { id: 'social_2', name: '活跃用户', icon: '💬', category: 'social', target: 10, rarity: 'rare', message: '发布了10条动态，你是社区的活跃用户！继续分享你的生活，感谢你的分享！', desc: '发布 10 条动态' },
      { id: 'social_3', name: '社区之星', icon: '⭐', category: 'social', target: 100, rarity: 'epic', message: '获得100个点赞，你是真正的社区之星！你的内容深受大家喜爱，感谢你的分享！', desc: '获得 100 个点赞' },
      { id: 'social_4', name: '社交达人', icon: '🌟', category: 'social', target: 5, rarity: 'rare', message: '加入了5个圈子，你已经是一位社交达人了！继续拓展你的社交圈，感谢你的参与！', desc: '加入 5 个圈子' },
      { id: 'social_5', name: '互动之王', icon: '💭', category: 'social', target: 50, rarity: 'epic', message: '累计评论50次，你是真正的互动之王！你的参与让社区更活跃，感谢你的分享！', desc: '累计评论 50 次' },
      { id: 'exercise_6', name: '晨练达人', icon: '🌅', category: 'exercise', target: 14, rarity: 'rare', message: '连续14天晨练，你已经养成了晨练的好习惯！继续坚持，感谢你的努力！', desc: '连续 14 天晨练' },
      { id: 'exercise_7', name: '夜跑健将', icon: '🌙', category: 'exercise', target: 20, rarity: 'rare', message: '完成了20次夜跑，你是真正的夜跑健将！夜晚的坚持更显珍贵，感谢你的坚持！', desc: '完成 20 次夜跑' },
      { id: 'exercise_8', name: '力量训练者', icon: '💪', category: 'exercise', target: 25, rarity: 'epic', message: '完成了25次力量训练，你的力量在不断提升！继续挑战自己，感谢你的坚持！', desc: '完成 25 次力量训练' },
      { id: 'checkin_5', name: '早起鸟', icon: '🐦', category: 'checkin', target: 14, rarity: 'rare', message: '连续14天早起签到，你是真正的早起鸟！早起的习惯让你更健康，感谢你的坚持！', desc: '连续 14 天早起签到' },
      { id: 'checkin_6', name: '月度签到', icon: '📆', category: 'checkin', target: 60, rarity: 'epic', message: '累计签到60天，你已经坚持了两个月！这份毅力值得称赞，感谢你的坚持！', desc: '累计签到 60 天' },
      { id: 'recipe_4', name: '轻食爱好者', icon: '🥙', category: 'recipe', target: 10, rarity: 'rare', message: '学习了10道轻食食谱，你是真正的轻食爱好者！健康饮食从轻食开始，感谢你的探索！', desc: '学习 10 道轻食食谱' },
      { id: 'recipe_5', name: '素食达人', icon: '🥬', category: 'recipe', target: 15, rarity: 'epic', message: '学习了15道素食食谱，你是真正的素食达人！素食让生活更健康，感谢你的探索！', desc: '学习 15 道素食食谱' },
      { id: 'charity_6', name: '月度捐赠', icon: '💖', category: 'charity', target: 30, rarity: 'epic', message: '累计捐赠30次，你的爱心持续发光，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 30 次' },
      { id: 'charity_7', name: '年度慈善', icon: '🏅', category: 'charity', target: 200, rarity: 'legendary', message: '累计捐赠200次，你是年度慈善之星！小动物们会永远记住你的大爱，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 200 次' },
    ];

    return badges.map(badge => {
      const saved = savedProgress[badge.id] || {};
      const progress = saved.progress || 0;
      return {
        ...badge,
        progress,
        unlocked: progress >= badge.target,
        message: badge.message || '', // 确保message字段存在
        desc: badge.desc || '', // 确保desc字段存在
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

  onRechargeOption(e) {
    const { title } = e.currentTarget.dataset;
    this.onShowToast('#t-toast', `${title} 已加入购物袋`);
  },

  onRechargeCenter() {
    this.onShowToast('#t-toast', '充值中心即将上线');
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
    const baseCharity = Math.max(0, Math.floor(points * 0.35));
    
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
      if (item.type === 'spend') {
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
