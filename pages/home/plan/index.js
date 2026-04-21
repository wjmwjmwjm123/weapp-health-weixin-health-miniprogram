Page({
  data: {
    formData: {
      height: '', // 身高 (cm)
      weight: '', // 体重 (kg)
      dietPreference: '', // 饮食偏好
      targetWeight: '', // 目标体重 (kg)
      exerciseLevel: '', // 运动水平
    },
    dietPreferences: ['清淡', '正常', '偏重口味', '素食', '低碳水'],
    exerciseLevels: ['久坐不动', '轻度运动', '中度运动', '高强度运动'],
    plan: null, // 生成的计划
    showPlan: false, // 是否显示计划
  },

  onLoad() {
    // 尝试加载已有数据
    this.loadSavedData();
  },

  loadSavedData() {
    const savedData = wx.getStorageSync('user_plan_data');
    if (savedData) {
      this.setData({
        formData: savedData,
      });
    }
  },

  // 输入身高
  onHeightInput(e) {
    this.setData({
      'formData.height': e.detail.value,
    });
  },

  // 输入体重
  onWeightInput(e) {
    this.setData({
      'formData.weight': e.detail.value,
    });
  },

  // 输入目标体重
  onTargetWeightInput(e) {
    this.setData({
      'formData.targetWeight': e.detail.value,
    });
  },

  // 选择饮食偏好
  onDietPreferenceChange(e) {
    const { value } = e.detail;
    this.setData({
      'formData.dietPreference': value,
    });
  },

  // 选择运动水平
  onExerciseLevelChange(e) {
    const { value } = e.detail;
    this.setData({
      'formData.exerciseLevel': value,
    });
  },

  // 生成计划
  async generatePlan() {
    const { formData } = this.data;

    // 验证必填项
    if (!formData.height || !formData.weight || !formData.targetWeight) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '正在生成计划...',
    });

    // 保存数据
    wx.setStorageSync('user_plan_data', formData);
    
    // 触发全局事件，通知首页更新身体数据
    const app = getApp();
    if (app.eventBus) {
      app.eventBus.emit('plan-updated', formData);
    }

    // 计算BMI和基础代谢
    const heightM = formData.height / 100;
    const bmi = (formData.weight / (heightM * heightM)).toFixed(1);
    const bmr = this.calculateBMR(formData.weight, formData.height);
    const targetCalories = this.calculateTargetCalories(bmr, formData.exerciseLevel);

    // 生成计划
    setTimeout(() => {
      const plan = {
        bmi,
        currentStatus: this.getBMIStatus(bmi),
        targetWeight: formData.targetWeight,
        targetCalories,
        exerciseIntensity: this.getExerciseIntensity(formData.exerciseLevel),
        dietSuggestion: this.getDietSuggestion(formData.dietPreference, targetCalories),
        weeklyPlan: this.generateWeeklyPlan(),
      };

      this.setData({
        plan,
        showPlan: true,
      });

      wx.hideLoading();
      wx.showToast({
        title: '计划生成成功',
        icon: 'success',
      });
    }, 1500);
  },

  // 计算基础代谢率 (BMR)
  calculateBMR(weight, height) {
    // 简化计算：BMR = 10 * weight + 6.25 * height - 5 * age + 5 (假设年龄25)
    return Math.round(10 * weight + 6.25 * height - 5 * 25 + 5);
  },

  // 计算目标卡路里
  calculateTargetCalories(bmr, exerciseLevel) {
    const multipliers = {
      '久坐不动': 1.2,
      '轻度运动': 1.375,
      '中度运动': 1.55,
      '高强度运动': 1.725,
    };
    const multiplier = multipliers[exerciseLevel] || 1.2;
    // 减脂建议：每日摄入 = TDEE - 500卡
    return Math.round(bmr * multiplier - 500);
  },

  // 获取BMI状态
  getBMIStatus(bmi) {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 24) return '正常';
    if (bmi < 28) return '偏胖';
    return '肥胖';
  },

  // 获取运动强度建议
  getExerciseIntensity(level) {
    const intensityMap = {
      '久坐不动': '建议从初级强度开始，每周3-4次，每次30分钟',
      '轻度运动': '可以尝试中级强度，每周4-5次，每次30-45分钟',
      '中度运动': '适合中高级强度，每周5-6次，每次45-60分钟',
      '高强度运动': '可以进行高强度训练，每周6次，每次60分钟以上',
    };
    return intensityMap[level] || intensityMap['久坐不动'];
  },

  // 获取饮食建议
  getDietSuggestion(preference, calories) {
    const suggestions = {
      清淡: `建议每日摄入约${calories}卡，以清淡食物为主，多吃蔬菜、水果、瘦肉。`,
      正常: `建议每日摄入约${calories}卡，保持营养均衡，控制油盐摄入。`,
      '偏重口味': `建议每日摄入约${calories}卡，可适量调味，但要控制总量和盐分。`,
      素食: `建议每日摄入约${calories}卡，素食为主，注意补充蛋白质（豆类、坚果）。`,
      低碳水: `建议每日摄入约${calories}卡，减少碳水，增加蛋白质和健康脂肪。`,
    };
    return suggestions[preference] || suggestions.正常;
  },

  // 生成周计划
  generateWeeklyPlan() {
    return [
      { day: '周一', exercise: 'HIIT训练', calories: '400卡' },
      { day: '周二', exercise: '瑜伽拉伸', calories: '250卡' },
      { day: '周三', exercise: '力量训练', calories: '350卡' },
      { day: '周四', exercise: '有氧运动', calories: '300卡' },
      { day: '周五', exercise: '帕梅拉训练', calories: '400卡' },
      { day: '周六', exercise: '户外慢跑', calories: '350卡' },
      { day: '周日', exercise: '休息日', calories: '0卡' },
    ];
  },

  // 编辑计划
  editPlan() {
    this.setData({
      showPlan: false,
    });
  },
});

