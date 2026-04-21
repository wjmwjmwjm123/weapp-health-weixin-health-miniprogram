Page({
  data: {
    acupoints: [
      {
        id: 1,
        name: '足三里',
        location: '膝盖外侧下方四指宽处',
        effect: '促进消化，增强免疫力',
        method: '用拇指按压，每次3-5分钟',
      },
      {
        id: 2,
        name: '三阴交',
        location: '内踝尖上四指宽处',
        effect: '调理脾胃，帮助减肥',
        method: '用拇指按压，每次3-5分钟',
      },
      {
        id: 3,
        name: '中脘穴',
        location: '肚脐上方四指宽处',
        effect: '促进消化，减少腹部脂肪',
        method: '用掌心顺时针按摩，每次5-10分钟',
      },
    ],
    exercises: [
      {
        id: 1,
        title: '拉伸运动',
        desc: '减肥后的拉伸放松',
        steps: ['双手上举，拉伸侧腰', '保持30秒', '换另一侧'],
      },
      {
        id: 2,
        title: '穴位按摩',
        desc: '通过按摩穴位放松身体',
        steps: ['找到穴位', '用指腹按压', '顺时针按摩'],
      },
    ],
  },

  onLoad() {},
});

