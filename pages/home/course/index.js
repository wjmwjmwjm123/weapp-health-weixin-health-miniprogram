import { normalizeTaskState, completeTask } from '~/utils/tasks';
import { addPoints } from '~/utils/points';
import { updateBadgeProgress, triggerBadgeUnlock } from '~/utils/badges';

Page({
  data: {
    currentTab: 0, // 0: 推荐, 1: 初级, 2: 中级, 3: 高级
    difficulty: 'all', // all, beginner, intermediate, advanced
    scene: 'all', // all, home, office, outdoor
    recommendedCourses: [], // 推荐课程（基于用户情况）
    filteredCourses: [], // 筛选后的课程列表
    courses: [
      // 初级课程
      {
        id: 1,
        title: '初级HIIT',
        desc: '适合初学者，20分钟燃脂',
        difficulty: 'beginner',
        scene: 'home',
        duration: 20,
        calories: 150,
        videoUrl: '',
        image: '',
        completed: false,
        points: 10, // 完成获得积分
      },
      {
        id: 2,
        title: '办公室拉伸',
        desc: '办公间隙5分钟放松',
        difficulty: 'beginner',
        scene: 'office',
        duration: 5,
        calories: 30,
        videoUrl: '',
        image: '',
        completed: false,
        points: 5,
      },
      // 中级课程
      {
        id: 3,
        title: '中级HIIT',
        desc: '30分钟高效燃脂',
        difficulty: 'intermediate',
        scene: 'home',
        duration: 30,
        calories: 250,
        videoUrl: '',
        image: '',
        completed: false,
        points: 20,
      },
      {
        id: 4,
        title: '帕梅拉训练',
        desc: '45分钟全身塑形',
        difficulty: 'intermediate',
        scene: 'home',
        duration: 45,
        calories: 350,
        videoUrl: '',
        image: '',
        completed: false,
        points: 30,
      },
      // 高级课程
      {
        id: 5,
        title: '高级HIIT',
        desc: '60分钟高强度训练',
        difficulty: 'advanced',
        scene: 'outdoor',
        duration: 60,
        calories: 500,
        videoUrl: '',
        image: '',
        completed: false,
        points: 50,
      },
    ],
    todayTask: {
      total: 1,
      completed: 0,
    },
  },

  onLoad() {
    this.loadRecommendedCourses();
    this.loadTodayTask();
  },

  onShow() {
    // 每次显示时刷新任务状态
    this.loadTodayTask();
    this.updateFilteredCourses();
  },

  // 加载推荐课程（根据用户难度和未完成任务）
  loadRecommendedCourses() {
    const { courses, todayTask } = this.data;
    // 这里可以根据用户的完成情况智能推荐
    // 如果用户总是完不成，降低难度
    const userDifficulty = this.getUserDifficulty();
    
    const recommended = courses
      .filter((course) => course.difficulty === userDifficulty)
      .filter((course) => !course.completed)
      .slice(0, 3);

    this.setData({
      recommendedCourses: recommended.length > 0 ? recommended : courses.slice(0, 3),
    }, () => {
      this.updateFilteredCourses();
    });
  },

  // 加载今日任务
  loadTodayTask() {
    // 从存储中获取今日任务
    const todayDate = new Date();
    const today = `${todayDate.getFullYear()}-${(todayDate.getMonth() + 1).toString().padStart(2, '0')}-${todayDate.getDate().toString().padStart(2, '0')}`;
    const key = `today_task_${today}`;
    const savedTask = wx.getStorageSync(key);
    const todayTask = normalizeTaskState(savedTask);
    wx.setStorageSync(key, todayTask);
    this.setData({
      todayTask: todayTask,
    });
  },

  // 获取用户适合的难度（根据完成情况智能调整）
  getUserDifficulty() {
    // 获取最近7天的完成率
    const completionRate = this.getRecentCompletionRate();
    
    if (completionRate < 0.3) {
      // 完成率低于30%，降低难度
      return 'beginner';
    } else if (completionRate > 0.8) {
      // 完成率高于80%，提高难度
      return 'advanced';
    }
    return 'intermediate';
  },

  // 获取最近完成率
  getRecentCompletionRate() {
    // 模拟数据，实际应该从后端获取
    // 如果任务不达标，降低难度
    const { todayTask } = this.data;
    if (todayTask.total > 0) {
      return todayTask.completed / todayTask.total;
    }
    return 0.5;
  },

  // 切换标签页
  onTabChange(e) {
    const { value } = e.detail;
    let difficulty = 'all';
    if (value === 1) difficulty = 'beginner';
    else if (value === 2) difficulty = 'intermediate';
    else if (value === 3) difficulty = 'advanced';

    this.setData({
      currentTab: value,
      difficulty,
    }, () => {
      this.updateFilteredCourses();
    });
  },

  // 筛选场景
  onSceneChange(e) {
    const { scene } = e.currentTarget.dataset;
    this.setData({ scene }, () => {
      this.updateFilteredCourses();
    });
  },

  // 更新筛选后的课程
  updateFilteredCourses() {
    const { courses, difficulty, scene, currentTab, recommendedCourses } = this.data;
    
    let filtered = [];
    if (currentTab === 0) {
      // 推荐标签，显示推荐课程
      filtered = recommendedCourses;
    } else {
      filtered = courses.filter((course) => {
        if (difficulty !== 'all' && course.difficulty !== difficulty) return false;
        if (scene !== 'all' && course.scene !== scene) return false;
        return true;
      });
    }
    
    this.setData({
      filteredCourses: filtered,
    });
  },

  // 开始课程
  onCourseTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/home/course/detail/index?id=${id}`,
    });
  },

  // 完成课程
  completeCourse(courseId) {
    const { courses, todayTask } = this.data;
    const course = courses.find((c) => c.id === courseId);
    if (!course || course.completed) return;

    // 标记为完成
    course.completed = true;
    
    // 更新今日任务（使用统一日期格式）
    const todayDate = new Date();
    const today = `${todayDate.getFullYear()}-${(todayDate.getMonth() + 1).toString().padStart(2, '0')}-${todayDate.getDate().toString().padStart(2, '0')}`;
    const newTask = completeTask(todayTask, 'video');

    const rewardPoints = course.points || 10;
    addPoints(rewardPoints, `完成${course.title}`, {
      source: 'course',
      courseId: course.id,
    });

    // 更新成就进度
    const unlockedBadge = updateBadgeProgress('exercise_1'); // 初出茅庐
    if (unlockedBadge) {
      triggerBadgeUnlock(unlockedBadge);
    }
    
    // 获取所有运动打卡次数并更新相关成就
    const exerciseHistory = wx.getStorageSync('exercise_history') || [];
    exerciseHistory.push(today);
    wx.setStorageSync('exercise_history', exerciseHistory);
    
    const exerciseCount = exerciseHistory.length;
    updateBadgeProgress('exercise_2', Math.min(exerciseCount, 10)); // 运动新星
    updateBadgeProgress('exercise_3', Math.min(exerciseCount, 50)); // 健身达人
    updateBadgeProgress('exercise_4', Math.min(exerciseCount, 100)); // 运动大师

    // 保存任务进度
    wx.setStorageSync(`today_task_${today}`, newTask);

    this.setData({
      courses,
      todayTask: newTask,
      filteredCourses: this.data.filteredCourses.map((c) => {
        if (c.id === courseId) {
          return { ...c, completed: true };
        }
        return c;
      }),
    });

    // 重新加载推荐课程（可能调整难度）
    this.loadRecommendedCourses();

    wx.showToast({
      title: `完成！获得${rewardPoints}积分`,
      icon: 'success',
    });
  },
});

