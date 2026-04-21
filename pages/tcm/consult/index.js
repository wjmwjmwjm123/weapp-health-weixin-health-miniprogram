import request from '~/api/request';
import config from '~/config';

Page({
  data: {
    inputValue: '',
    messages: [
      {
        id: 1,
        type: 'system',
        content: '您好，我是中医健康助手，可以为您解答减肥相关问题。',
        time: '10:00',
      },
    ],
    quickQuestions: [
      '减肥期间可以吃什么？',
      '如何防止减肥反弹？',
      '减肥后如何调理身体？',
      '中药减肥安全吗？',
    ],
    loading: false, // AI回复加载状态
    aiProvider: 'custom', // 'mock'=模拟回复, 'custom'=真实API
  },

  onLoad() {
    // 可以从配置中读取AI提供商设置
    // this.setData({ aiProvider: config.aiProvider || 'mock' });
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },

  async onSend() {
    const { inputValue, messages } = this.data;
    if (!inputValue.trim()) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none',
      });
      return;
    }

    // 添加用户消息
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      time: this.getCurrentTime(),
    };
    messages.push(userMessage);

    this.setData({
      messages,
      inputValue: '',
      loading: true,
    });

    try {
      // 调用Moonshot AI接口
      let aiResponse;
      if (this.data.aiProvider === 'custom') {
        aiResponse = await this.callCustomAI(inputValue);
      } else {
        // 模拟回复（备用）
        aiResponse = this.getMockAIResponse(inputValue);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const aiMessage = {
        id: messages.length + 1,
        type: 'ai',
        content: aiResponse,
        time: this.getCurrentTime(),
      };
      messages.push(aiMessage);
      this.setData({ messages, loading: false });
    } catch (error) {
      console.error('AI回复失败:', error);
      const errorMessage = {
        id: messages.length + 1,
        type: 'ai',
        content: '抱歉，我现在无法回复您的问题，请稍后再试。' + (this.data.aiProvider === 'mock' ? '（当前为演示模式）' : ''),
        time: this.getCurrentTime(),
      };
      messages.push(errorMessage);
      this.setData({ messages, loading: false });
    }
  },

  onQuickQuestion(e) {
    const { question } = e.currentTarget.dataset;
    this.setData({ inputValue: question });
    this.onSend();
  },

  getCurrentTime() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  },

  // ============ AI API 调用方法 ============

  /**
   * 直接调用Moonshot AI接口
   */
  async callCustomAI(question) {
    try {
      // Moonshot API 配置
      const API_KEY = 'YOUR_DEEPSEEK_API_KEY';
      const API_URL = 'https://api.moonshot.cn/v1/chat/completions';

      // 构建消息历史

      const messages = [
        {
          role: 'system',
          content: '你是一位专业的中医健康顾问，专门为减肥人群提供中医调理建议。请用简洁、专业、易懂的语言回答问题。',
        },
        // 添加历史对话
        ...this.getRecentMessages(5),
        // 添加当前问题
        {
          role: 'user',
          content: question,
        },
      ];

      // 调用 Moonshot AI API
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: API_URL,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          data: {
            model: 'kimi-k2-turbo-preview',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
              const answer = res.data.choices[0].message.content || '抱歉，我无法理解您的问题。';
              resolve({ code: 200, data: { answer } });
            } else {
              reject(new Error(res.data?.error?.message || 'AI接口调用失败'));
            }
          },
          fail: (err) => {
            reject(new Error(err.errMsg || '网络请求失败'));
          },
        });
      });

      return res.data.answer || '抱歉，我无法理解您的问题。';
    } catch (error) {
      throw new Error('AI接口调用失败：' + error.message);
    }
  },

  /**
   * 模拟AI回复（关键词匹配）- 备用方案
   */
  getMockAIResponse(question) {
    // 简单的关键词匹配回复
    if (question.includes('吃什么') || question.includes('食物')) {
      return '建议多吃高蛋白、低脂肪的食物，如鸡胸肉、鱼肉、蔬菜等。可以配合一些药膳，如山楂荷叶茶、茯苓薏米粥等。';
    } else if (question.includes('反弹')) {
      return '防止反弹需要保持规律作息，适量运动，控制饮食。可以配合中医调理，增强脾胃功能，提高新陈代谢。';
    } else if (question.includes('调理') || question.includes('身体')) {
      return '减肥后可以通过中医理疗、穴位按摩、药膳调理等方式来恢复身体机能。建议咨询专业中医师制定个性化方案。';
    } else if (question.includes('安全') || question.includes('中药')) {
      return '中药减肥需要在专业中医师指导下进行，根据个人体质选择合适的中药。不建议自行用药，以免产生副作用。';
    } else {
      return '感谢您的提问。建议您详细描述您的问题，我会根据您的情况提供更专业的建议。如有需要，也可以咨询专业中医师。';
    }
  },

  /**
   * 获取最近的对话历史（用于上下文）
   */
  getRecentMessages(count = 5) {
    const { messages } = this.data;
    return messages
      .slice(-count)
      .filter((msg) => msg.type !== 'system')
      .map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
  },
});
