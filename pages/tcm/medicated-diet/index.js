Page({
  data: {
    categories: [
      { id: 1, name: '减肥药膳', icon: '🍲' },
      { id: 2, name: '中药认识', icon: '🌿' },
      { id: 3, name: '食补调理', icon: '🥗' },
    ],
    recipes: [
      {
        id: 1,
        title: '山楂荷叶茶',
        desc: '适合减肥人群，帮助消食化积',
        ingredients: ['山楂', '荷叶', '决明子'],
        steps: ['将材料洗净', '加水煮沸', '小火煮15分钟'],
        effect: '促进消化，降脂减肥',
      },
      {
        id: 2,
        title: '茯苓薏米粥',
        desc: '健脾祛湿，适合水肿型肥胖',
        ingredients: ['茯苓', '薏米', '大米'],
        steps: ['材料提前浸泡', '加水煮粥', '煮至软烂'],
        effect: '利水消肿，健脾养胃',
      },
    ],
    herbs: [
      { id: 1, name: '山楂', desc: '消食化积，降脂减肥', image: '' },
      { id: 2, name: '荷叶', desc: '清热利湿，降脂', image: '' },
      { id: 3, name: '茯苓', desc: '健脾祛湿，利水', image: '' },
      { id: 4, name: '薏米', desc: '利水渗湿，健脾', image: '' },
    ],
    currentTab: 0,
  },

  onLoad() {},

  onTabChange(e) {
    this.setData({
      currentTab: e.detail.value,
    });
  },
});

