import { addPoints } from '~/utils/points';

const STORAGE_KEYS = {
  ROUTES: 'travel_routes',
  AI_ROUTE: 'travel_ai_route',
  CHALLENGES: 'travel_challenges',
  LOCATION: 'travel_last_location',
  FAVORITES: 'travel_favorites',
};

const DEFAULT_ROUTES = [
  {
    id: 'route_river_walk',
    title: '城市绿道晨跑',
    highlight: '沿江绿道 · 低强度徒步',
    tags: ['徒步', '森林氧吧'],
    distance: 6.5,
    duration: 70,
    calories: 320,
    storyline: '从滨江公园北门出发，途径城市阳台、口袋花园，最后抵达文化广场。',
  },
  {
    id: 'route_forest_cycle',
    title: '森林公园骑行',
    highlight: '湖景环线 · 轻骑行',
    tags: ['骑行', '湖景'],
    distance: 12.2,
    duration: 80,
    calories: 460,
    storyline: '穿梭森林骑行道，串联水杉林、露营草坪与花卉园，适合好友结伴出行。',
  },
  {
    id: 'route_oldtown_walk',
    title: '老街文化漫行',
    highlight: '古村落 · 文化打卡',
    tags: ['文化', '轻徒步'],
    distance: 8.1,
    duration: 95,
    calories: 380,
    storyline: '慢步古街巷，走进中草药博物馆、匠人作坊，体验地方特色小吃与茶饮。',
  },
];

const AI_ROUTE_TEMPLATES = [
  {
    title: '古城慢游线',
    tags: ['文化', '徒步'],
    mode: '徒步',
    distanceRange: [8, 12],
    caloriesRange: [320, 480],
    storyline: '走进古城巷子 + 中医药博物馆体验，沿途安排轻食补给站，适合慢节奏探索。',
    poiList: ['古城北门', '中草药体验馆', '手作市集', '文化广场'],
  },
  {
    title: '城市河畔夜骑',
    tags: ['夜骑', '轻健身'],
    mode: '骑行',
    distanceRange: [10, 16],
    caloriesRange: [420, 560],
    storyline: '顺着河畔灯光骑行，连接音乐公园与咖啡仓，一路皆是夜景与轻音乐。',
    poiList: ['河畔出发点', '音乐公园', '滨江咖啡仓', '月光广场'],
  },
  {
    title: '森林治愈徒步',
    tags: ['森林', '治愈'],
    mode: '徒步',
    distanceRange: [5, 9],
    caloriesRange: [250, 360],
    storyline: '穿梭松林、茶园与雾森步道，途中设瑜伽草坪与冷萃补给点，轻松完成冥想式行走。',
    poiList: ['森林南门', '雾森栈道', '茶香驿站', '冥想草坪'],
  },
];

const DEFAULT_CHALLENGES = [
  {
    id: 'challenge_weekend_walk',
    title: '周末10公里徒步打卡',
    desc: '周末任选一天完成 10 公里城市绿道徒步，沿途拍照记下每个打卡点。',
    distance: 10,
    reward: 25,
    tags: ['周末', '徒步'],
    status: 'idle',
  },
  {
    id: 'challenge_culture_walk',
    title: '古村文化行走',
    desc: '体验古村文化路线 + 中医养生体验馆，完成 3 个文化互动任务。',
    distance: 8,
    reward: 30,
    tags: ['文化', '挑战'],
    status: 'idle',
  },
];

Page({
  data: {
    loading: false,
    aiGenerating: false,
    location: {
      city: '定位中',
      tagline: '正在获取附近路线',
    },
    summary: {
      totalDistance: 0,
      totalCalories: 0,
    },
    recommendedRoutes: [],
    aiRoute: null,
    challenges: [],
    favoriteRoutes: [],
  },

  onLoad() {
    this.initializePage();
  },

  onShow() {
    this.loadRoutesFromStorage();
    this.loadChallengesFromStorage();
    this.loadFavoriteRoutes();
  },

  async initializePage(isRefresh = false) {
    if (!isRefresh) {
      this.setData({ loading: true });
    }
    await this.fetchLocation();
    this.loadRoutesFromStorage();
    this.loadChallengesFromStorage();
    this.setData({ loading: false });
  },

  fetchLocation() {
    return new Promise((resolve) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const userInfo = wx.getStorageSync('user_info') || {};
          const location = {
            city: userInfo.city || userInfo.province || '本地',
            latitude: res.latitude,
            longitude: res.longitude,
            tagline: '附近路线已更新',
          };
          wx.setStorageSync(STORAGE_KEYS.LOCATION, location);
          this.setData({ location });
          resolve();
        },
        fail: () => {
          const fallback = wx.getStorageSync(STORAGE_KEYS.LOCATION) || {
            city: '本地',
            tagline: '随时出发探索',
          };
          this.setData({ location: fallback });
          resolve();
        },
      });
    });
  },

  buildDefaultRoutes(city) {
    const favorites = this.getFavorites();
    return DEFAULT_ROUTES.map((route) => ({
      ...route,
      city,
      saved: false,
      favorited: favorites.includes(route.id),
    }));
  },

  loadRoutesFromStorage() {
    const storedRoutes = wx.getStorageSync(STORAGE_KEYS.ROUTES);
    const aiRoute = wx.getStorageSync(STORAGE_KEYS.AI_ROUTE) || null;
    const baseCity = this.data.location.city || '本地';
    const favorites = this.getFavorites();
    let routes = (storedRoutes && storedRoutes.length > 0)
      ? storedRoutes
      : this.buildDefaultRoutes(baseCity);
    // 同步收藏状态
    routes = routes.map(route => ({
      ...route,
      favorited: favorites.includes(route.id),
    }));
    // 同步AI路线的收藏状态
    if (aiRoute) {
      aiRoute.favorited = favorites.includes(aiRoute.id);
    }
    this.setData({
      recommendedRoutes: routes,
      aiRoute,
    }, () => {
      this.updateSummary(routes);
    });
  },

  persistRoutes(routes) {
    wx.setStorageSync(STORAGE_KEYS.ROUTES, routes);
    this.updateSummary(routes);
  },

  updateSummary(routes) {
    const totalDistance = routes.reduce((sum, item) => sum + (item.distance || 0), 0);
    const totalCalories = routes.reduce((sum, item) => sum + (item.calories || 0), 0);
    this.setData({
      summary: {
        totalDistance: Math.round(totalDistance),
        totalCalories: Math.round(totalCalories),
      },
    });
  },

  createAIRoute() {
    const template = AI_ROUTE_TEMPLATES[Math.floor(Math.random() * AI_ROUTE_TEMPLATES.length)];
    const [minDistance, maxDistance] = template.distanceRange;
    const [minCalories, maxCalories] = template.caloriesRange;
    const distance = Number((Math.random() * (maxDistance - minDistance) + minDistance).toFixed(1));
    const calories = Math.round(Math.random() * (maxCalories - minCalories) + minCalories);
    const city = this.data.location.city || '本地';
    const generatedAt = this.formatTimeLabel();
    const favorites = this.getFavorites();
    const routeId = `ai_${Date.now()}`;
    return {
      id: routeId,
      title: `${city}${template.title}`,
      highlight: template.storyline,
      tags: template.tags,
      distance,
      duration: Math.round(distance * 12),
      calories,
      city,
      mode: template.mode,
      storyline: template.storyline,
      poiList: template.poiList,
      generatedAt,
      saved: true,
      favorited: favorites.includes(routeId),
      isAi: true,
    };
  },

  onGenerateAIRoute() {
    if (this.data.aiGenerating) return;
    this.setData({ aiGenerating: true });
    wx.showLoading({ title: 'AI 生成中', mask: true });

    setTimeout(() => {
      const aiRoute = this.createAIRoute();
      const routes = [aiRoute, ...this.data.recommendedRoutes.filter((item) => item.id !== aiRoute.id)].slice(0, 6);
      this.setData({
        aiRoute,
        recommendedRoutes: routes,
        aiGenerating: false,
      });
      wx.setStorageSync(STORAGE_KEYS.AI_ROUTE, aiRoute);
      this.persistRoutes(routes);
      wx.hideLoading();
      wx.showToast({ title: 'AI 路线已生成', icon: 'success' });
      this.notifyTravelUpdate(aiRoute);
    }, 900);
  },

  onSaveRoute(e) {
    const { id } = e.currentTarget.dataset;
    const routes = this.data.recommendedRoutes.map((route) => {
      if (route.id === id) {
        if (route.saved) {
          wx.showToast({ title: '已加入计划', icon: 'none' });
          return route;
        }
        wx.showToast({ title: '已加入行程', icon: 'success' });
        return { ...route, saved: true };
      }
      return route;
    });
    this.setData({ recommendedRoutes: routes });
    this.persistRoutes(routes);
    const updatedRoute = routes.find((route) => route.id === id);
    if (updatedRoute) {
      this.notifyTravelUpdate(updatedRoute);
    }
  },

  getFavorites() {
    return wx.getStorageSync(STORAGE_KEYS.FAVORITES) || [];
  },

  saveFavorites(favorites) {
    wx.setStorageSync(STORAGE_KEYS.FAVORITES, favorites);
  },

  onToggleFavorite(e) {
    const { id } = e.currentTarget.dataset;
    const favorites = this.getFavorites();
    const isFavorited = favorites.includes(id);
    
    let newFavorites;
    if (isFavorited) {
      newFavorites = favorites.filter(favId => favId !== id);
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      newFavorites = [...favorites, id];
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
    
    this.saveFavorites(newFavorites);
    
    // 更新推荐路线的收藏状态
    const routes = this.data.recommendedRoutes.map((route) => ({
      ...route,
      favorited: newFavorites.includes(route.id),
    }));
    
    // 更新AI路线的收藏状态
    let aiRoute = this.data.aiRoute;
    if (aiRoute && aiRoute.id === id) {
      aiRoute = { ...aiRoute, favorited: !isFavorited };
    }
    
    this.setData({
      recommendedRoutes: routes,
      aiRoute,
    });
    
    this.persistRoutes(routes);
    if (aiRoute) {
      wx.setStorageSync(STORAGE_KEYS.AI_ROUTE, aiRoute);
    }
    
    // 更新收藏列表
    this.loadFavoriteRoutes();
  },

    loadFavoriteRoutes() {
        const favorites = this.getFavorites();
        if (favorites.length === 0) {
          this.setData({ favoriteRoutes: [] });
          return;
        }
        
        // 从推荐路线和AI路线中筛选出收藏的路线
        const allRoutes = [...this.data.recommendedRoutes];
        if (this.data.aiRoute) {
          allRoutes.push(this.data.aiRoute);
        }
        
        // 去重处理，避免重复显示
        const uniqueRoutes = [];
        const routeIds = new Set();
        
        allRoutes.forEach(route => {
          if (favorites.includes(route.id) && !routeIds.has(route.id)) {
            uniqueRoutes.push(route);
            routeIds.add(route.id);
          }
        });
        
        this.setData({ favoriteRoutes: uniqueRoutes });
      },
    

  onStartRoute(e) {
    const { id } = e.currentTarget.dataset;
    const route = this.data.recommendedRoutes.find((item) => item.id === id) || this.data.aiRoute;
    if (!route) return;
    wx.showModal({
      title: '导航示例',
      content: '将接入高德/AI 生成的导航路线，当前展示示例数据。',
      confirmText: '知道了',
      showCancel: false,
    });
  },

  loadChallengesFromStorage() {
    const stored = wx.getStorageSync(STORAGE_KEYS.CHALLENGES);
    const challenges = (stored && stored.length > 0)
      ? stored
      : DEFAULT_CHALLENGES;
    this.setData({ challenges });
  },

  persistChallenges(challenges) {
    wx.setStorageSync(STORAGE_KEYS.CHALLENGES, challenges);
  },

  onJoinChallenge(e) {
    const { id } = e.currentTarget.dataset;
    const challenges = this.data.challenges.map((item) => {
      if (item.id === id) {
        wx.showToast({ title: '已加入挑战', icon: 'success' });
        return {
          ...item,
          status: 'joined',
          joinedAt: Date.now(),
        };
      }
      return item;
    });
    this.setData({ challenges });
    this.persistChallenges(challenges);
    const joined = challenges.find((item) => item.id === id);
    if (joined) {
      this.notifyTravelUpdate({
        type: 'challenge',
        challengeId: joined.id,
        status: joined.status,
      });
    }
  },

  onCompleteChallenge(e) {
    const { id } = e.currentTarget.dataset;
    const target = this.data.challenges.find((item) => item.id === id);
    if (!target) return;
    if (target.status !== 'joined') {
      wx.showToast({ title: '请先加入挑战', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '完成挑战',
      content: `确认完成「${target.title}」并领取积分吗？`,
      success: (res) => {
        if (!res.confirm) return;
        const updatedChallenges = this.data.challenges.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              status: 'completed',
              completedAt: Date.now(),
            };
          }
          return item;
        });
        this.setData({ challenges: updatedChallenges });
        this.persistChallenges(updatedChallenges);
        const reward = target.reward || 20;
        addPoints(reward, `完成${target.title}`, {
          source: 'travel-challenge',
          challengeId: target.id,
        });
        wx.showToast({ title: `+${reward} 积分`, icon: 'success' });
        this.notifyTravelUpdate({
          type: 'challenge',
          challengeId: target.id,
          status: 'completed',
        });
      },
    });
  },

  notifyTravelUpdate(payload) {
    const app = getApp();
    if (app && app.eventBus) {
      app.eventBus.emit('travel-plan-updated', payload);
    }
  },

  formatTimeLabel() {
    const date = new Date();
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm} 更新`;
  },

  onRefresh() {
    this.initializePage(true);
  },
});

