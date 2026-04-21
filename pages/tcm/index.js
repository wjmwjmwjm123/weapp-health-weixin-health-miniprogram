const MEDICATED_RECIPES = [
  {
    id: 'qi-boost-porridge',
    title: '黄芪山药燕麦粥',
    focus: '健脾益气 · 适合早晨空腹',
    timing: '早餐',
    season: '全年',
    ingredients: ['黄芪15g', '山药30g', '燕麦片80g', '枸杞10g'],
    method: '黄芪煎水取汁，与山药、燕麦同煮15分钟，出锅前加入枸杞焖2分钟。',
    benefits: '补气固表、稳定血糖，适合易疲乏、怕冷的体质。',
  },
  {
    id: 'slim-tea',
    title: '荷叶陈皮清脂茶',
    focus: '祛湿化浊 · 午后代谢茶',
    timing: '午后',
    season: '夏季',
    ingredients: ['荷叶干5g', '陈皮3g', '山楂8g', '决明子6g'],
    method: '所有材料清洗后放入杯中，以90℃热水冲泡8分钟即可饮用，可续水2次。',
    benefits: '缓解油腻、助排湿气，适合久坐或饮食油腻人群。',
  },
  {
    id: 'blood-soup',
    title: '当归红枣乌鸡汤',
    focus: '养血暖宫 · 晚餐补给',
    timing: '晚餐',
    season: '秋冬',
    ingredients: ['乌鸡半只', '当归10g', '红枣6颗', '姜片3片', '黄芪10g'],
    method: '乌鸡焯水后与药材一同炖煮60分钟，调入少许盐即可。',
    benefits: '补血调经、改善怕冷手脚凉，适合体寒体质。',
  },
  {
    id: 'sleepy-soup',
    title: '百合酸枣仁安心羹',
    focus: '安神助眠 · 睡前小食',
    timing: '睡前',
    season: '春秋',
    ingredients: ['百合20g', '酸枣仁10g', '莲子15g', '冰糖适量'],
    method: '酸枣仁拍碎煎水，去渣后与百合、莲子继续小火煮20分钟，调味即可。',
    benefits: '缓解焦虑、改善浅眠，配合泡脚更佳。',
  },
  {
    id: 'detox-salad',
    title: '紫苏藜麦暖沙拉',
    focus: '调理脾胃 · 晚间轻食',
    timing: '傍晚',
    season: '春夏',
    ingredients: ['藜麦50g', '紫苏叶6片', '南瓜80g', '鹰嘴豆50g'],
    method: '藜麦、鹰嘴豆煮熟，与蒸好的南瓜、紫苏叶拌匀，淋入少许芝麻酱。',
    benefits: '提升饱腹感、和胃理气，适合易腹胀、饮食不规律者。',
  },
];

const QUICK_ACTIONS = [
  { id: 'constitution', title: '体质测评', desc: '同步计划', icon: '🌿', url: '/pages/home/plan/index' },
  { id: 'diet', title: '当日药膳', desc: '点击查看', icon: '🥣', url: '' },
  { id: 'consult', title: '图文问诊', desc: '医生回复', icon: '👩‍⚕️', url: '/pages/tcm/consult/index' },
  { id: 'classroom', title: '调护课堂', desc: '精选调理方案', icon: '📚', url: '' },
];

const NAV_MODULES = [];

const LIFE_TIPS = [
  {
    id: 'sleep-routine',
    title: '晚睡体质的护肝作息',
    summary: '23:00前入睡，配合酸枣仁百合茶，连续7天观察心率与精神。',
    sections: [
      {
        title: '作息建议',
        content: '22:00开始减少蓝光刺激，23:00前入睡；晚间保持卧室24℃左右，辅助香薰。',
      },
      {
        title: '搭配茶饮',
        content: '酸枣仁10g、柏子仁6g、百合10g，开水冲泡后闷5分钟，睡前半小时饮用。',
      },
    ],
  },
  {
    id: 'cold-feet',
    title: '手脚冰凉的日常调护',
    summary: '每天晚间泡脚15分钟，配合艾草姜片，提升末梢循环。',
    sections: [
      {
        title: '泡脚配方',
        content: '艾草15g、生姜3片、桂枝6g，煮水后倒入泡脚桶，水温40℃左右。',
      },
      {
        title: '日间动作',
        content: '午后热敷命门穴10分钟，或做30次提踵动作，改善下肢血液循环。',
      },
    ],
  },
  {
    id: 'office-eyes',
    title: '久坐办公的护眼妙招',
    summary: '遵循20-20-20法则，搭配菊花枸杞茶，缓解眼涩与干痒。',
    sections: [
      {
        title: '桌面动作',
        content: '每工作20分钟，抬头望20英尺远处20秒；肩颈扩胸运动3组。',
      },
      {
        title: '护眼茶饮',
        content: '菊花3g、枸杞6g、决明子3g，沸水冲泡后代茶饮，帮助清肝明目。',
      },
    ],
  },
];

Page({
  data: {
    loading: false,
    summary: {
      city: '定位中',
      focus: '今日继续调理脾胃',
      points: 0,
      lastCheck: '未检测',
    },
    diagnosis: {
      constitution: '平和质',
      advice: '保持规律作息，适度运动，注意早晚温差。',
    },
    focusTips: [],
    quickActions: QUICK_ACTIONS,
    dailyRecipe: null,
    medicatedLessons: [],
    lifeTips: [],
    therapyPackages: [],
    knowledgeFeeds: [],
    modules: NAV_MODULES,
  },

  onLoad() {
    this.loadPageData();
  },

  onShow() {
    // 返回页面后刷新一次关键数据
    this.loadPageData(true);
  },

  onPullDownRefresh() {
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadPageData(isSilent = false) {
    if (!isSilent) {
      this.setData({ loading: true });
    }
    const todayDate = this.getTodayKey();
    const planData = wx.getStorageSync('user_plan_data') || {};
    const todayRecord = wx.getStorageSync(`record_${todayDate}`) || {};
    const userInfo = wx.getStorageSync('user_info') || {};
    const summary = this.buildSummary(planData, todayRecord, userInfo);
    const diagnosis = this.buildDiagnosis(planData, todayRecord);
    const focusTips = this.buildFocusTips(todayRecord);
    const medicatedLessons = this.buildMedicatedLessons();
    const dailyRecipe = this.pickDailyRecipe(medicatedLessons);
    const therapyPackages = this.buildTherapyPackages(diagnosis.constitution);
    const knowledgeFeeds = this.buildKnowledgeFeeds();
    const lifeTips = this.buildLifeTips();
    const quickActions = QUICK_ACTIONS.map((action) => {
      if (action.id === 'diet' && dailyRecipe) {
        return { ...action, desc: dailyRecipe.title };
      }
      if (action.id === 'classroom' && therapyPackages.length) {
        return { ...action, desc: `${therapyPackages.length} 个方案` };
      }
      return action;
    });

    this.setData({
      summary,
      diagnosis,
      focusTips,
      quickActions,
      dailyRecipe,
      medicatedLessons,
      lifeTips,
      therapyPackages,
      knowledgeFeeds,
      loading: false,
    });
  },

  buildSummary(planData = {}, todayRecord = {}, userInfo = {}) {
    const city = userInfo.city || userInfo.province || '本地';
    const focus = todayRecord.period
      ? '今日聚焦气血调理'
      : (planData.focus || '今日继续调理脾胃');
    return {
      city,
      focus,
      points: wx.getStorageSync('user_points') || 0,
      lastCheck: planData.constitutionCheckDate || '近期未测',
    };
  },

  buildDiagnosis(planData = {}, todayRecord = {}) {
    const constitution = planData.constitution || '平和质';
    const advice = todayRecord.period
      ? '当前处于生理期，建议温补气血、保持心情舒畅。'
      : '保持规律作息、适度运动，餐食中加入健脾食材。';
    return { constitution, advice };
  },

  buildFocusTips(todayRecord = {}) {
    const tips = [];
    if (todayRecord.calories && todayRecord.calories > 1600) {
      tips.push('饮食偏高，可加入山楂决明子茶');
    }
    if ((todayRecord.sleep || 0) < 7) {
      tips.push('睡眠不足，建议晚上泡脚+艾草香包');
    }
    if (!tips.length) {
      tips.push('今日状态稳步向好，继续保持轻松节奏');
    }
    return tips;
  },

  buildMedicatedLessons() {
    return MEDICATED_RECIPES.map((item) => ({
      ...item,
      techniques: item.techniques || [
        '提前处理好药材，注意煎煮顺序',
        '控制火候，保持温润口感',
      ],
    }));
  },

  pickDailyRecipe(list = []) {
    if (!list.length) return null;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  },

  buildTherapyPackages(constitution = '平和质') {
    const base = [
      {
        id: 'moxibustion',
        title: '温阳艾灸',
        desc: '背部督脉+神阙温灸，提升气血循环，改善手脚冰冷。',
        duration: '40min',
        seats: '今日余2席',
        tag: '线下',
      },
      {
        id: 'herbal-bath',
        title: '草本足浴',
        desc: '黄芪+当归+桂枝配方，舒缓疲劳、助眠放松。',
        duration: '30min',
        seats: '可预约',
        tag: '在家可做',
      },
      {
        id: 'gua-sha',
        title: '经络舒缓',
        desc: '肩颈刮痧+耳穴按压，释放久坐累积的紧绷感。',
        duration: '25min',
        seats: '热门',
        tag: constitution,
      },
      {
        id: 'cupping',
        title: '肩颈拔罐+刮痧',
        desc: '肩胛、风池、夹脊组合，疏通僵硬筋膜，缓解久坐酸痛。',
        duration: '35min',
        seats: '晚间余3席',
        tag: '筋膜舒缓',
      },
      {
        id: 'lymph',
        title: '淋巴排浊',
        desc: '腿部经络按压+红外热敷，配合香薰呼吸，改善下肢水肿。',
        duration: '45min',
        seats: '可拼团',
        tag: '线下',
      },
    ];
    return base;
  },

  buildKnowledgeFeeds() {
    return [
      {
        id: 'article-1',
        title: '湿气重的3个信号，附日常调护方案',
        tag: '体质与作息',
        time: '12:20',
      },
      {
        id: 'article-2',
        title: '三伏贴提前准备：适用人群与禁忌',
        tag: '季节调理',
        time: '09:05',
      },
      {
        id: 'article-3',
        title: '晚上脚凉？3个艾草香囊配方收藏',
        tag: '香囊养生',
        time: '昨天',
      },
      {
        id: 'article-4',
        title: '经期低气压指南：饮食+情绪调护',
        tag: '经期护理',
        time: '前天',
      },
    ];
  },

  buildLifeTips() {
    return LIFE_TIPS;
  },

  getTodayKey() {
    const todayDate = new Date();
    const yyyy = todayDate.getFullYear();
    const mm = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const dd = todayDate.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  onHeroTap() {
    wx.navigateTo({
      url: '/pages/tcm/consult/index',
    });
  },

  onModuleTap(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  onActionTap(e) {
    const { url, id } = e.currentTarget.dataset;
    if (id === 'diet') {
      this.onDailyRecipeTap();
      return;
    }
    if (id === 'classroom') {
      this.openClassroom();
      return;
    }
    if (url) {
      wx.navigateTo({ url });
    }
  },

  onDailyRecipeTap() {
    const { dailyRecipe } = this.data;
    if (!dailyRecipe) return;
    wx.showModal({
      title: dailyRecipe.title,
      content: `${dailyRecipe.focus}\n\n做法：${dailyRecipe.method}`,
      confirmText: '查看教学',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/tcm/medicated-diet/index',
          });
        }
      },
    });
  },

  onLifeTipTap(e) {
    const { index } = e.currentTarget.dataset;
    const tip = this.data.lifeTips[index];
    if (!tip) return;
    wx.setStorageSync('life_tip_detail', tip);
    wx.navigateTo({
      url: '/pages/tcm/life/index',
    });
  },

  onKnowledgeTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/tcm/knowledge/index?id=${id}`,
    });
  },

  onTeachingTap() {
    wx.navigateTo({
      url: '/pages/tcm/medicated-diet/index',
    });
  },

  openClassroom() {
    const { therapyPackages } = this.data;
    if (!therapyPackages.length) {
      wx.showToast({
        title: '暂无方案',
        icon: 'none',
      });
      return;
    }
    wx.showActionSheet({
      itemList: therapyPackages.map((pkg) => pkg.title),
      success: ({ tapIndex }) => {
        const pkg = therapyPackages[tapIndex];
        if (!pkg) return;
        wx.showModal({
          title: pkg.title,
          content: `${pkg.desc}\n\n时长：${pkg.duration}\n预约：${pkg.seats}`,
          confirmText: '去理疗',
          cancelText: '知道了',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/tcm/therapy/index',
              });
            }
          },
        });
      },
    });
  },
});