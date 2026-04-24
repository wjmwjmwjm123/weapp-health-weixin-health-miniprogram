/**
 * 成就/徽章数据定义（单一数据源）
 * 所有成就的 id/name/icon/category/target/rarity/message/desc/rewardPoints 在此统一定义
 */

const BADGES = [
  // ========== 公益类 ==========
  { id: 'charity_1', name: '初次捐赠', icon: '🌱', category: 'charity', target: 1, rarity: 'common', message: '第一次捐献，来一个，喵喵喵喵喵（感谢你的帮助）', desc: '完成第一次公益捐赠', rewardPoints: 10 },
  { id: 'charity_2', name: '爱心使者', icon: '💝', category: 'charity', target: 10, rarity: 'rare', message: '你的每一次捐赠，都是对流浪小动物最温暖的关怀，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 10 次', rewardPoints: 50 },
  { id: 'charity_3', name: '公益达人', icon: '🌟', category: 'charity', target: 50, rarity: 'epic', message: '50次捐赠，50份爱心，你的坚持让世界更美好，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 50 次', rewardPoints: 200 },
  { id: 'charity_4', name: '慈善家', icon: '👑', category: 'charity', target: 100, rarity: 'legendary', message: '100次捐赠，你是真正的慈善家！小动物们会永远记住你的恩情，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 100 次', rewardPoints: 500 },
  { id: 'charity_5', name: '连续捐赠', icon: '🔥', category: 'charity', target: 7, rarity: 'rare', message: '连续7天的坚持，展现了你的爱心与毅力，喵喵喵喵喵（感谢你的帮助）', desc: '连续 7 天捐赠', rewardPoints: 100 },
  { id: 'charity_6', name: '月度捐赠', icon: '💖', category: 'charity', target: 30, rarity: 'epic', message: '累计捐赠30次，你的爱心持续发光，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 30 次', rewardPoints: 150 },
  { id: 'charity_7', name: '年度慈善', icon: '🏅', category: 'charity', target: 200, rarity: 'legendary', message: '累计捐赠200次，你是年度慈善之星！小动物们会永远记住你的大爱，喵喵喵喵喵（感谢你的帮助）', desc: '累计捐赠 200 次', rewardPoints: 800 },

  // ========== 运动类 ==========
  { id: 'exercise_1', name: '初出茅庐', icon: '🏃‍♀️', category: 'exercise', target: 1, rarity: 'common', message: '第一次运动打卡，迈出健康生活的第一步，感谢你的努力！', desc: '完成第一次运动打卡', rewardPoints: 10 },
  { id: 'exercise_2', name: '运动新星', icon: '⭐', category: 'exercise', target: 10, rarity: 'rare', message: '10次运动打卡，你已经是一颗闪亮的运动新星了，感谢你的坚持！', desc: '完成 10 次运动打卡', rewardPoints: 50 },
  { id: 'exercise_3', name: '健身达人', icon: '💪', category: 'exercise', target: 50, rarity: 'epic', message: '50次运动打卡，你已经是真正的健身达人了！继续加油，感谢你的坚持！', desc: '完成 50 次运动打卡', rewardPoints: 200 },
  { id: 'exercise_4', name: '运动大师', icon: '🏆', category: 'exercise', target: 100, rarity: 'legendary', message: '100次运动打卡，你是当之无愧的运动大师！你的毅力令人敬佩，感谢你的坚持！', desc: '完成 100 次运动打卡', rewardPoints: 500 },
  { id: 'exercise_5', name: '坚持到底', icon: '🔥', category: 'exercise', target: 30, rarity: 'epic', message: '连续30天运动，你的坚持让人感动！这就是真正的毅力，感谢你的坚持！', desc: '连续 30 天运动', rewardPoints: 300 },
  { id: 'exercise_6', name: '晨练达人', icon: '🌅', category: 'exercise', target: 14, rarity: 'rare', message: '连续14天晨练，你已经养成了晨练的好习惯！继续坚持，感谢你的努力！', desc: '连续 14 天晨练', rewardPoints: 150 },
  { id: 'exercise_7', name: '夜跑健将', icon: '🌙', category: 'exercise', target: 20, rarity: 'rare', message: '完成了20次夜跑，你是真正的夜跑健将！夜晚的坚持更显珍贵，感谢你的坚持！', desc: '完成 20 次夜跑', rewardPoints: 120 },
  { id: 'exercise_8', name: '力量训练者', icon: '💪', category: 'exercise', target: 25, rarity: 'epic', message: '完成了25次力量训练，你的力量在不断提升！继续挑战自己，感谢你的坚持！', desc: '完成 25 次力量训练', rewardPoints: 180 },

  // ========== 签到类 ==========
  { id: 'checkin_1', name: '初次签到', icon: '📝', category: 'checkin', target: 1, rarity: 'common', message: '第一次签到，记录生活的美好开始，感谢你的参与！', desc: '完成第一次每日签到', rewardPoints: 5 },
  { id: 'checkin_2', name: '签到达人', icon: '📅', category: 'checkin', target: 30, rarity: 'rare', message: '30天签到，你已经养成了良好的习惯，感谢你的坚持！', desc: '累计签到 30 天', rewardPoints: 100 },
  { id: 'checkin_3', name: '签到之王', icon: '👑', category: 'checkin', target: 100, rarity: 'epic', message: '100天签到，你是真正的签到之王！这份坚持值得所有人学习，感谢你的坚持！', desc: '累计签到 100 天', rewardPoints: 300 },
  { id: 'checkin_4', name: '连续签到', icon: '🔥', category: 'checkin', target: 7, rarity: 'rare', message: '连续7天签到，好习惯正在养成，继续加油，感谢你的坚持！', desc: '连续 7 天签到', rewardPoints: 50 },
  { id: 'checkin_5', name: '早起鸟', icon: '🐦', category: 'checkin', target: 14, rarity: 'rare', message: '连续14天早起签到，你是真正的早起鸟！早起的习惯让你更健康，感谢你的坚持！', desc: '连续 14 天早起签到', rewardPoints: 80 },
  { id: 'checkin_6', name: '月度签到', icon: '📆', category: 'checkin', target: 60, rarity: 'epic', message: '累计签到60天，你已经坚持了两个月！这份毅力值得称赞，感谢你的坚持！', desc: '累计签到 60 天', rewardPoints: 200 },

  // ========== 食谱类 ==========
  { id: 'recipe_1', name: '美食探索者', icon: '🍽️', category: 'recipe', target: 5, rarity: 'common', message: '学习了5道健康食谱，开始探索美食的奥秘，感谢你的探索！', desc: '学习 5 道健康食谱', rewardPoints: 30 },
  { id: 'recipe_2', name: '料理大师', icon: '👨‍🍳', category: 'recipe', target: 20, rarity: 'epic', message: '20道健康食谱，你已经是一位料理大师了！继续探索更多美味，感谢你的探索！', desc: '学习 20 道健康食谱', rewardPoints: 150 },
  { id: 'recipe_3', name: '营养专家', icon: '🥗', category: 'recipe', target: 50, rarity: 'legendary', message: '50道健康食谱，你是真正的营养专家！你的健康知识让人敬佩，感谢你的探索！', desc: '学习 50 道健康食谱', rewardPoints: 400 },
  { id: 'recipe_4', name: '轻食爱好者', icon: '🥙', category: 'recipe', target: 10, rarity: 'rare', message: '学习了10道轻食食谱，你是真正的轻食爱好者！健康饮食从轻食开始，感谢你的探索！', desc: '学习 10 道轻食食谱', rewardPoints: 80 },
  { id: 'recipe_5', name: '素食达人', icon: '🥬', category: 'recipe', target: 15, rarity: 'epic', message: '学习了15道素食食谱，你是真正的素食达人！素食让生活更健康，感谢你的探索！', desc: '学习 15 道素食食谱', rewardPoints: 120 },

  // ========== 社交类 ==========
  { id: 'social_1', name: '社交新手', icon: '👥', category: 'social', target: 1, rarity: 'common', message: '加入第一个圈子，开始你的社交之旅，感谢你的参与！', desc: '加入第一个圈子', rewardPoints: 20 },
  { id: 'social_2', name: '活跃用户', icon: '💬', category: 'social', target: 10, rarity: 'rare', message: '发布了10条动态，你是社区的活跃用户！继续分享你的生活，感谢你的分享！', desc: '发布 10 条动态', rewardPoints: 80 },
  { id: 'social_3', name: '社区之星', icon: '⭐', category: 'social', target: 100, rarity: 'epic', message: '获得100个点赞，你是真正的社区之星！你的内容深受大家喜爱，感谢你的分享！', desc: '获得 100 个点赞', rewardPoints: 200 },
  { id: 'social_4', name: '社交达人', icon: '🌟', category: 'social', target: 5, rarity: 'rare', message: '加入了5个圈子，你已经是一位社交达人了！继续拓展你的社交圈，感谢你的参与！', desc: '加入 5 个圈子', rewardPoints: 60 },
  { id: 'social_5', name: '互动之王', icon: '💭', category: 'social', target: 50, rarity: 'epic', message: '累计评论50次，你是真正的互动之王！你的参与让社区更活跃，感谢你的分享！', desc: '累计评论 50 次', rewardPoints: 150 },
];

export default BADGES;
