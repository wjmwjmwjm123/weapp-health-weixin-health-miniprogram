const ARTICLES = {
  'article-1': {
    title: '湿气重的3个信号，附日常调护方案',
    tag: '体质与作息',
    time: '12:20',
    content: [
      {
        type: 'text',
        text: '湿气重是现代人常见的亚健康状态，特别是生活在潮湿环境或饮食不节制的人群。以下是湿气重的三个典型信号：',
      },
      {
        type: 'header',
        text: '1. 舌苔厚腻',
      },
      {
        type: 'text',
        text: '早晨刷牙时观察舌头，如果舌苔白厚或黄厚，且边缘有齿痕，通常是脾虚湿盛的表现。',
      },
      {
        type: 'header',
        text: '2. 身体困重',
      },
      {
        type: 'text',
        text: '早起感觉头昏脑涨，像裹了湿毛巾；小腿酸软沉重，不想动弹，这也是湿气阻滞经络的反应。',
      },
      {
        type: 'header',
        text: '3. 大便粘滞',
      },
      {
        type: 'text',
        text: '大便不成形，粘马桶冲不干净，或者排便不爽，总有排不尽的感觉。',
      },
      {
        type: 'header',
        text: '日常调护方案',
      },
      {
        type: 'list',
        items: [
          '饮食调理：多吃赤小豆、薏米、山药、芡实等健脾祛湿食材。',
          '运动排汗：适度有氧运动，微微出汗即可，帮助排出湿气。',
          '环境调整：保持居住环境干燥通风，避免睡地板。',
        ],
      },
    ],
  },
  'article-2': {
    title: '三伏贴提前准备：适用人群与禁忌',
    tag: '季节调理',
    time: '09:05',
    content: [
      {
        type: 'text',
        text: '三伏贴是冬病夏治的经典疗法，利用夏季阳气最旺盛的时机，通过穴位敷贴来调理体质。',
      },
      {
        type: 'header',
        text: '适用人群',
      },
      {
        type: 'list',
        items: [
          '呼吸系统疾病：慢性支气管炎、哮喘、过敏性鼻炎等。',
          '消化系统疾病：慢性胃炎、胃溃疡、虚寒性腹泻等。',
          '妇科疾病：痛经、月经不调、宫寒等。',
          '骨关节疾病：风湿性关节炎、颈椎病、腰椎病等。',
        ],
      },
      {
        type: 'header',
        text: '禁忌人群',
      },
      {
        type: 'list',
        items: [
          '孕妇及两岁以下婴幼儿。',
          '发热、咽喉肿痛等急性炎症期患者。',
          '皮肤过敏、破损者。',
          '严重心肺功能不全者。',
        ],
      },
    ],
  },
  'article-3': {
    title: '晚上脚凉？3个艾草香囊配方收藏',
    tag: '香囊养生',
    time: '昨天',
    content: [
      {
        type: 'text',
        text: '脚凉通常是阳气不足或气血运行不畅的表现。除了泡脚，使用中药香囊放在枕边或床头，也能起到辅助调理的作用。',
      },
      {
        type: 'header',
        text: '配方一：温阳散寒',
      },
      {
        type: 'text',
        text: '材料：艾绒10g、干姜5g、肉桂3g、细辛3g。\n功效：温通经脉，改善手脚冰凉。',
      },
      {
        type: 'header',
        text: '配方二：安神助眠',
      },
      {
        type: 'text',
        text: '材料：艾绒10g、合欢花5g、酸枣仁5g、薰衣草3g。\n功效：暖身同时帮助放松神经，促进睡眠。',
      },
      {
        type: 'header',
        text: '配方三：活血化瘀',
      },
      {
        type: 'text',
        text: '材料：艾绒10g、红花3g、当归3g、川芎3g。\n功效：促进血液循环，适合久坐人群。',
      },
      {
        type: 'header',
        text: '使用方法',
      },
      {
        type: 'text',
        text: '将药材捣碎混合，装入透气性好的棉布袋中。每半个月更换一次药材，保持香气浓郁。',
      },
    ],
  },
  'article-4': {
    title: '经期低气压指南：饮食+情绪调护',
    tag: '经期护理',
    time: '前天',
    content: [
      {
        type: 'text',
        text: '经期受激素水平波动影响，很多女性会出现情绪低落、烦躁易怒等"低气压"表现。',
      },
      {
        type: 'header',
        text: '饮食调理',
      },
      {
        type: 'list',
        items: [
          '玫瑰花茶：疏肝解郁，缓解经前乳房胀痛和情绪烦躁。',
          '红糖姜水：温经散寒，缓解痛经，提升体温，改善心情。',
          '富含钙镁食物：如香蕉、深绿色蔬菜、豆制品，有助于舒缓神经。',
        ],
      },
      {
        type: 'header',
        text: '情绪调护',
      },
      {
        type: 'text',
        text: '1. 接纳情绪：意识到这是生理现象，不要过度自责。\n2. 适度运动：进行瑜伽、散步等轻缓运动，促进内啡肽分泌。\n3. 充足睡眠：保证每天7-8小时睡眠，避免熬夜加重情绪波动。',
      },
    ],
  },
};

Page({
  data: {
    article: null,
    loading: true,
  },

  onLoad(options) {
    const { id } = options;
    if (id && ARTICLES[id]) {
      this.setData({
        article: ARTICLES[id],
        loading: false,
      });
      wx.setNavigationBarTitle({
        title: '中医知识快报',
      });
    } else {
      // 如果没有 ID 或找不到文章，显示默认列表或错误提示
      // 这里简单处理为显示第一篇文章作为演示
      this.setData({
        article: ARTICLES['article-1'],
        loading: false,
      });
    }
  },
});
