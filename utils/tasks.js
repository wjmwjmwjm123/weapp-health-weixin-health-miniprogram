const TASK_DEFINITIONS = [
  {
    id: 'checkin',
    title: '每日签到',
    desc: '打开小程序签到并同步当日状态，获取基础积分。',
    icon: '📍',
    action: '',
    buttonText: '',
    points: 5,
  },
  {
    id: 'video',
    title: '视频打卡',
    desc: '完成任意一次视频课程，记录运动时长并获取额外积分。',
    icon: '🎬',
    action: 'course',
    buttonText: '去完成',
    points: 0,
  },
  {
    id: 'knowledge',
    title: '学习健康知识',
    desc: '阅读一篇中医/营养知识或完成健康测验，增强自我管理能力。',
    icon: '📚',
    action: 'knowledge',
    buttonText: '去学习',
    points: 0,
  },
];

const TASK_IDS = TASK_DEFINITIONS.map((task) => task.id);

function cloneTasksMap(tasks = {}) {
  const map = {};
  TASK_IDS.forEach((id) => {
    map[id] = !!tasks[id];
  });
  return map;
}

function countCompleted(tasksMap) {
  return TASK_IDS.reduce((sum, id) => (tasksMap[id] ? sum + 1 : sum), 0);
}

export function getTaskDefinitions() {
  return TASK_DEFINITIONS;
}

export function normalizeTaskState(rawTask = {}) {
  const normalized = {
    total: TASK_IDS.length,
    completed: 0,
    tasks: {},
  }

  if (rawTask && rawTask.tasks) {
    normalized.tasks = cloneTasksMap(rawTask.tasks);
  } else if (rawTask && typeof rawTask.completed === 'number') {
    const temp = {};
    TASK_IDS.forEach((id, index) => {
      temp[id] = index < rawTask.completed;
    });
    normalized.tasks = temp;
  } else {
    normalized.tasks = cloneTasksMap();
  }

  normalized.completed = countCompleted(normalized.tasks);
  return normalized;
}

export function completeTask(rawTask, taskId) {
  const state = normalizeTaskState(rawTask);
  if (state.tasks[taskId]) {
    return state;
  }

  const tasks = { ...state.tasks, [taskId]: true };
  return {
    total: TASK_IDS.length,
    tasks,
    completed: countCompleted(tasks),
  };
}

export function buildTaskList(rawTask) {
  const state = normalizeTaskState(rawTask);
  return TASK_DEFINITIONS.map((task) => ({
    ...task,
    done: !!state.tasks[task.id],
  }));
}

export function calculateTaskProgress(rawTask) {
  const state = normalizeTaskState(rawTask);
  if (state.total <= 0) return 0;
  return Math.round((state.completed / state.total) * 100);
}

