import * as cartUtil from '~/utils/cart';
import request from '~/api/request';

// 本地兜底数据
const LOCAL_COURSES = [
  { id: 1, name: '高级HIIT课程包', price: 99.00, originalPrice: 199.00, desc: '包含10个高级HIIT课程，燃脂塑形', image: '', type: 'course' },
  { id: 2, name: '瑜伽完整课程', price: 88.00, originalPrice: 168.00, desc: '30天瑜伽训练计划，柔韧提升', image: '', type: 'course' },
  { id: 3, name: '帕梅拉训练计划', price: 128.00, originalPrice: 258.00, desc: '完整帕梅拉训练体系，全身塑形', image: '', type: 'course' },
  { id: 13, name: '普拉提核心训练', price: 158.00, originalPrice: 298.00, desc: '20节核心力量训练课程', image: '', type: 'course' },
  { id: 14, name: '有氧舞蹈课程', price: 68.00, originalPrice: 128.00, desc: '15节趣味有氧舞蹈，快乐燃脂', image: '', type: 'course' },
  { id: 15, name: '力量训练入门', price: 118.00, originalPrice: 228.00, desc: '新手友好的力量训练指导', image: '', type: 'course' },
  { id: 16, name: '拉伸放松课程', price: 58.00, originalPrice: 108.00, desc: '12节拉伸课程，缓解肌肉紧张', image: '', type: 'course' },
  { id: 17, name: '减脂挑战营', price: 199.00, originalPrice: 399.00, desc: '30天减脂挑战，全程指导', image: '', type: 'course' },
];

const LOCAL_EQUIPMENT = [
  { id: 4, name: '瑜伽垫', price: 89.00, originalPrice: 129.00, desc: '高密度防滑瑜伽垫，10mm厚度', image: '', type: 'equipment' },
  { id: 5, name: '哑铃套装', price: 199.00, originalPrice: 299.00, desc: '可调节重量哑铃，2-20kg', image: '', type: 'equipment' },
  { id: 6, name: '弹力带', price: 49.00, originalPrice: 79.00, desc: '多阻力弹力带套装，5条装', image: '', type: 'equipment' },
  { id: 18, name: '泡沫轴', price: 68.00, originalPrice: 98.00, desc: '肌肉放松泡沫轴，缓解酸痛', image: '', type: 'equipment' },
  { id: 19, name: '跳绳', price: 35.00, originalPrice: 55.00, desc: '计数跳绳，精准计数', image: '', type: 'equipment' },
  { id: 20, name: '健身球', price: 78.00, originalPrice: 118.00, desc: '65cm健身球，核心训练', image: '', type: 'equipment' },
  { id: 21, name: '壶铃', price: 128.00, originalPrice: 188.00, desc: '8kg壶铃，全身训练', image: '', type: 'equipment' },
  { id: 22, name: '运动护膝', price: 45.00, originalPrice: 68.00, desc: '专业运动护膝，保护关节', image: '', type: 'equipment' },
  { id: 23, name: '运动手环', price: 299.00, originalPrice: 399.00, desc: '智能运动手环，监测心率', image: '', type: 'equipment' },
];

const LOCAL_TCM = [
  { id: 7, name: '山楂', price: 28.00, originalPrice: 35.00, image: '', desc: '消食化积，降脂减肥', category: '减肥类', type: 'tcm' },
  { id: 8, name: '荷叶', price: 32.00, originalPrice: 40.00, image: '', desc: '清热利湿，降脂', category: '减肥类', type: 'tcm' },
  { id: 9, name: '茯苓', price: 45.00, originalPrice: 55.00, image: '', desc: '健脾祛湿，利水', category: '调理类', type: 'tcm' },
  { id: 10, name: '薏米', price: 38.00, originalPrice: 48.00, image: '', desc: '利水渗湿，健脾', category: '调理类', type: 'tcm' },
  { id: 11, name: '枸杞', price: 52.00, originalPrice: 65.00, image: '', desc: '滋补肝肾，明目', category: '滋补类', type: 'tcm' },
  { id: 12, name: '决明子', price: 25.00, originalPrice: 30.00, image: '', desc: '润肠通便，降脂', category: '减肥类', type: 'tcm' },
  { id: 24, name: '当归', price: 68.00, originalPrice: 85.00, image: '', desc: '补血活血，调经止痛', category: '滋补类', type: 'tcm' },
  { id: 25, name: '黄芪', price: 58.00, originalPrice: 72.00, image: '', desc: '补气固表，增强免疫力', category: '滋补类', type: 'tcm' },
  { id: 26, name: '党参', price: 48.00, originalPrice: 60.00, image: '', desc: '补中益气，健脾益肺', category: '滋补类', type: 'tcm' },
  { id: 27, name: '红枣', price: 35.00, originalPrice: 45.00, image: '', desc: '补中益气，养血安神', category: '滋补类', type: 'tcm' },
  { id: 28, name: '桂圆', price: 42.00, originalPrice: 55.00, image: '', desc: '补心脾，益气血', category: '滋补类', type: 'tcm' },
  { id: 29, name: '陈皮', price: 38.00, originalPrice: 48.00, image: '', desc: '理气健脾，燥湿化痰', category: '调理类', type: 'tcm' },
  { id: 30, name: '玫瑰花', price: 55.00, originalPrice: 70.00, image: '', desc: '疏肝解郁，美容养颜', category: '调理类', type: 'tcm' },
  { id: 31, name: '菊花', price: 32.00, originalPrice: 42.00, image: '', desc: '清热解毒，清肝明目', category: '调理类', type: 'tcm' },
  { id: 32, name: '金银花', price: 45.00, originalPrice: 58.00, image: '', desc: '清热解毒，疏散风热', category: '调理类', type: 'tcm' },
  { id: 33, name: '艾草', price: 28.00, originalPrice: 38.00, image: '', desc: '温经止血，散寒止痛', category: '调理类', type: 'tcm' },
  { id: 34, name: '生姜', price: 18.00, originalPrice: 25.00, image: '', desc: '温中散寒，解表发汗', category: '调理类', type: 'tcm' },
  { id: 35, name: '百合', price: 48.00, originalPrice: 62.00, image: '', desc: '养阴润肺，清心安神', category: '滋补类', type: 'tcm' },
  { id: 36, name: '莲子', price: 52.00, originalPrice: 68.00, image: '', desc: '补脾止泻，益肾涩精', category: '滋补类', type: 'tcm' },
  { id: 37, name: '银耳', price: 38.00, originalPrice: 50.00, image: '', desc: '滋阴润燥，美容养颜', category: '滋补类', type: 'tcm' },
];

Page({
  data: {
    currentTab: 0,
    tabs: [
      { id: 0, name: '课程' },
      { id: 1, name: '设备' },
      { id: 2, name: '中医商品' },
    ],
    courses: LOCAL_COURSES,
    equipment: LOCAL_EQUIPMENT,
    tcmProducts: LOCAL_TCM,
    products: [],
    cartItemCount: 0,
  },

  onLoad() {
    this.fetchProducts();
    this.updateCartItemCount();
  },

  onShow() {
    this.updateCartItemCount();
  },

  // 从后端获取商品列表
  async fetchProducts() {
    try {
      const res = await request('/api/product', 'GET');
      if (res.code === 200 && res.data && res.data.list && res.data.list.length > 0) {
        const courses = [];
        const equipment = [];
        const tcmProducts = [];
        res.data.list.forEach(item => {
          const product = {
            id: item.id,
            name: item.name,
            price: Number(item.price),
            originalPrice: item.original_price ? Number(item.original_price) : undefined,
            desc: item.desc || '',
            image: item.image || '',
            type: item.type,
          };
          if (item.type === 'course') courses.push(product);
          else if (item.type === 'equipment') equipment.push(product);
          else if (item.type === 'tcm') tcmProducts.push(product);
        });
        this.setData({ courses, equipment, tcmProducts });
        this.updateProducts();
        return;
      }
    } catch (err) {
      console.warn('后端获取商品失败，使用本地数据');
    }
    this.updateProducts();
  },

  onTabChange(e) {
    const tabValue = typeof e.detail.value === 'string' ? parseInt(e.detail.value, 10) : e.detail.value;
    this.setData({ currentTab: tabValue }, () => {
      this.updateProducts();
    });
  },

  updateProducts() {
    const { currentTab, courses, equipment, tcmProducts } = this.data;
    const tabIndex = typeof currentTab === 'string' ? parseInt(currentTab, 10) : currentTab;
    let products;
    switch (tabIndex) {
      case 0: products = courses; break;
      case 1: products = equipment; break;
      case 2: products = tcmProducts; break;
      default: products = courses;
    }
    this.setData({ products });
  },

  async onAddToCart(e) {
    const { product } = e.currentTarget.dataset;
    await cartUtil.addToCart(product);
    wx.showToast({ title: '已添加到购物车', icon: 'success' });
    this.updateCartItemCount();
  },

  updateCartItemCount() {
    const count = cartUtil.getCartItemCount();
    this.setData({ cartItemCount: count });
  },

  onGoToCart() {
    wx.navigateTo({ url: '/pages/home/mall/cart' });
  },

  onPurchase(e) {
    wx.showToast({ title: '演示功能，暂不支持购买', icon: 'none' });
  },
});
