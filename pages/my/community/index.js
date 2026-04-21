Page({
  data: {
    group: {},
    posts: [],
    isJoined: false,
    showPublish: false,
    publishContent: '',
  },

  onLoad(options) {
    const { name } = options;
    this.initData(name);
  },

  initData(groupName) {
    // 模拟圈子数据
    const group = {
      name: groupName || '运动打卡圈',
      desc: '一起运动，一起进步，分享你的运动时刻',
      icon: '🏃‍♀️',
      members: 1250,
      posts: 328,
    };

    // 模拟帖子数据
    const posts = [
      {
        id: 1,
        userName: '运动达人小A',
        avatar: 'https://tdesign.gtimg.com/mobile/demos/avatar1.png',
        time: '10分钟前',
        content: '今天完成了5公里晨跑，感觉整个人都清醒了！打卡第30天，继续加油！💪',
        images: ['https://tdesign.gtimg.com/mobile/demos/example1.png'],
        likes: 24,
        comments: 5,
        isLiked: false,
      },
      {
        id: 2,
        userName: '养生专家',
        avatar: 'https://tdesign.gtimg.com/mobile/demos/avatar2.png',
        time: '1小时前',
        content: '分享一个减脂餐食谱：鸡胸肉沙拉 + 燕麦拿铁。低卡又饱腹，强烈推荐给大家！🥗☕️',
        images: [
          'https://tdesign.gtimg.com/mobile/demos/example2.png',
          'https://tdesign.gtimg.com/mobile/demos/example3.png'
        ],
        likes: 56,
        comments: 12,
        isLiked: true,
      },
      {
        id: 3,
        userName: '初学者小C',
        avatar: 'https://tdesign.gtimg.com/mobile/demos/avatar3.png',
        time: '3小时前',
        content: '第一次尝试瑜伽，身体好僵硬啊，但是做完很舒服。有没有一起练习的小伙伴？🧘‍♀️',
        likes: 15,
        comments: 8,
        isLiked: false,
      },
    ];

    this.setData({
      group,
      posts,
      isJoined: true, // 默认已加入，可以根据实际情况判断
    });
  },

  onToggleJoin() {
    this.setData({
      isJoined: !this.data.isJoined,
    });
    wx.showToast({
      title: this.data.isJoined ? '已加入圈子' : '已退出圈子',
      icon: 'none',
    });
  },

  onPreviewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current,
      urls,
    });
  },

  onLikePost(e) {
    const { id } = e.currentTarget.dataset;
    const posts = this.data.posts.map(post => {
      if (post.id === id) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1,
        };
      }
      return post;
    });
    this.setData({ posts });
  },

  onShowPublish() {
    this.setData({ showPublish: true });
  },

  onClosePublish() {
    this.setData({ showPublish: false });
  },

  onContentChange(e) {
    this.setData({ publishContent: e.detail.value });
  },

  onPublishPost() {
    const content = this.data.publishContent.trim();
    if (!content) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
      });
      return;
    }

    // 模拟发布
    const newPost = {
      id: Date.now(),
      userName: '我',
      avatar: 'https://tdesign.gtimg.com/mobile/demos/avatar_user.png', // 使用默认头像
      time: '刚刚',
      content,
      images: [],
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    this.setData({
      posts: [newPost, ...this.data.posts],
      showPublish: false,
      publishContent: '',
      'group.posts': this.data.group.posts + 1,
    });

    wx.showToast({
      title: '发布成功',
      icon: 'success',
    });
  },
});
