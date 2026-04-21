const POINTS_KEY = 'user_points';
const HISTORY_KEY = 'points_history';
const HISTORY_LIMIT = 100;

function now() {
  return new Date();
}

function formatDateTime(dateObj = now()) {
  const yyyy = dateObj.getFullYear();
  const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const dd = dateObj.getDate().toString().padStart(2, '0');
  const hh = dateObj.getHours().toString().padStart(2, '0');
  const min = dateObj.getMinutes().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function safeNumber(value, defaultValue = 0) {
  const num = Number(value);
  if (Number.isNaN(num)) return defaultValue;
  return num;
}

function readHistory() {
  return wx.getStorageSync(HISTORY_KEY) || [];
}

function writeHistory(history) {
  wx.setStorageSync(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));
}

function appendHistory(entry) {
  const history = readHistory();
  history.unshift(entry);
  writeHistory(history);
  return history;
}

function buildHistoryEntry({ type = 'earn', amount = 0, desc = '', extra = {} }) {
  const timestamp = Date.now();
  return {
    id: timestamp,
    type,
    amount,
    desc,
    time: formatDateTime(new Date(timestamp)),
    timestamp,
    ...extra,
  };
}

function emitPointsChange(points) {
  try {
    const app = getApp();
    if (app && app.eventBus && typeof app.eventBus.emit === 'function') {
      app.eventBus.emit('points-change', points);
    }
  } catch (err) {
    // getApp 在 App 初始化前可能不可用，静默处理
  }
}

export function getPoints() {
  return safeNumber(wx.getStorageSync(POINTS_KEY), 0);
}

export function setPoints(value) {
  const normalized = Math.max(0, Math.round(safeNumber(value, 0)));
  wx.setStorageSync(POINTS_KEY, normalized);
  emitPointsChange(normalized);
  return normalized;
}

export function addPoints(amount, desc = '获得积分', extra = {}) {
  const delta = safeNumber(amount, 0);
  if (delta <= 0) return getPoints();
  const updated = getPoints() + delta;
  wx.setStorageSync(POINTS_KEY, updated);
  appendHistory(buildHistoryEntry({
    type: 'earn',
    amount: delta,
    desc,
    extra,
  }));
  emitPointsChange(updated);
  return updated;
}

export function deductPoints(amount, desc = '积分扣除', extra = {}) {
  const delta = safeNumber(amount, 0);
  if (delta <= 0) return getPoints();
  const updated = Math.max(0, getPoints() - delta);
  wx.setStorageSync(POINTS_KEY, updated);
  appendHistory(buildHistoryEntry({
    type: 'deduct',
    amount: delta,
    desc,
    extra,
  }));
  emitPointsChange(updated);
  return updated;
}

export function spendPoints(amount, desc = '积分消耗', extra = {}) {
  const delta = safeNumber(amount, 0);
  if (delta <= 0) return getPoints();
  const updated = Math.max(0, getPoints() - delta);
  wx.setStorageSync(POINTS_KEY, updated);
  appendHistory(buildHistoryEntry({
    type: 'spend',
    amount: delta,
    desc,
    extra,
  }));
  emitPointsChange(updated);
  return updated;
}

export function getPointsHistory() {
  return readHistory();
}

export function clearPointsData() {
  wx.removeStorageSync(POINTS_KEY);
  wx.removeStorageSync(HISTORY_KEY);
}

