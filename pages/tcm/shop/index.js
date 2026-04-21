Page({
  data: {
    categories: [
      { id: 1, name: '全部', active: true },
      { id: 2, name: '减肥类', active: false },
      { id: 3, name: '调理类', active: false },
      { id: 4, name: '滋补类', active: false },
    ],
    products: [
      {
        id: 1,
        name: '山楂',
        price: 28.00,
        originalPrice: 35.00,
        image: '',
        desc: '消食化积，降脂减肥',
        category: '减肥类',
      },
      {
        id: 2,
        name: '荷叶',
        price: 32.00,
        originalPrice: 40.00,
        image: '',
        desc: '清热利湿，降脂',
        category: '减肥类',
      },
      {
        id: 3,
        name: '茯苓',
        price: 45.00,
        originalPrice: 55.00,
        image: '',
        desc: '健脾祛湿，利水',
        category: '调理类',
      },
      {
        id: 4,
        name: '薏米',
        price: 38.00,
        originalPrice: 48.00,
        image: '',
        desc: '利水渗湿，健脾',
        category: '调理类',
      },
      {
        id: 5,
        name: '枸杞',
        price: 52.00,
        originalPrice: 65.00,
        image: '',
        desc: '滋补肝肾，明目',
        category: '滋补类',
      },
      {
        id: 6,
        name: '决明子',
        price: 25.00,
        originalPrice: 30.00,
        image: '',
        desc: '润肠通便，降脂',
        category: '减肥类',
      },
    ],
    currentCategory: '全部',
  },

  onLoad() {
    this.updateFilteredProducts();
  },

  onCategoryTap(e) {
    const { name } = e.currentTarget.dataset;
    const categories = this.data.categories.map((item) => ({
      ...item,
      active: item.name === name,
    }));
    this.setData({
      categories,
      currentCategory: name,
    });
    this.updateFilteredProducts();
  },

  updateFilteredProducts() {
    const { products, currentCategory } = this.data;
    let filteredProducts;
    if (currentCategory === '全部') {
      filteredProducts = products;
    } else {
      filteredProducts = products.filter((item) => item.category === currentCategory);
    }
    this.setData({ filteredProducts });
  },

  onProductTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: '演示功能，暂不支持购买',
      icon: 'none',
    });
  },
});

