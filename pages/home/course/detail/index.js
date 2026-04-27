import { addPoints } from '~/utils/points';

Page({
  data: {
    courseId: null,
    course: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    completed: false,
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ courseId: id });
    this.loadCourseData();
  },

  loadCourseData() {
    // 从课程列表获取课程数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.data && prevPage.data.courses) {
      const course = prevPage.data.courses.find((c) => c.id === parseInt(this.data.courseId));
      if (course) {
        this.setData({
          course: { ...course, duration: course.duration * 60 }, // 转换为秒
          duration: course.duration * 60,
        });
        return;
      }
    }

    // 如果没有，使用默认数据
    this.setData({
      course: {
        id: parseInt(this.data.courseId),
        title: 'HIIT训练课程',
        desc: '高效燃脂训练',
        duration: 20 * 60,
        calories: 150,
        points: 10,
        difficulty: 'beginner',
      },
      duration: 20 * 60,
    });
  },

  onPlay() {
    this.setData({ isPlaying: true });
  },

  onPause() {
    this.setData({ isPlaying: false });
  },

  onEnded() {
    this.setData({ isPlaying: false });
    if (!this.data.completed) {
      this.completeCourse();
    }
  },

  onTimeUpdate(e) {
    this.setData({ currentTime: e.detail.currentTime });
  },

  // 完成课程
  onComplete() {
    if (this.data.completed) {
      wx.showToast({
        title: '课程已完成',
        icon: 'none',
      });
      return;
    }

    wx.showModal({
      title: '完成课程',
      content: '确定完成本次课程吗？完成后可获得积分。',
      success: (res) => {
        if (res.confirm) {
          this.completeCourse();
        }
      },
    });
  },

  // 完成课程
  completeCourse() {
    const { course } = this.data;
    if (!course) return;

    // 调用上一页的完成方法
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && typeof prevPage.completeCourse === 'function') {
      prevPage.completeCourse(course.id);
    } else {
      // 如果上一页没有completeCourse方法，直接在这里处理
      addPoints(course.points || 10, `完成${course.title}`, {
        source: 'course-detail',
        courseId: course.id,
      });
    }

    this.setData({ completed: true });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
});

