const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

// 复制到本地临时路径，方便预览
const getLocalUrl = (path, name) => {
  try {
  const fs = wx.getFileSystemManager();
  const tempFileName = `${wx.env.USER_DATA_PATH}/${name}`;
    // 检查文件是否存在
    try {
      fs.accessSync(path);
  fs.copyFileSync(path, tempFileName);
  return tempFileName;
    } catch (error) {
      // 文件不存在，返回原路径或空字符串
      console.warn(`文件不存在: ${path}`);
      return path; // 返回原路径，让调用方处理
    }
  } catch (error) {
    console.warn(`getLocalUrl 错误: ${error.message}`);
    return path; // 出错时返回原路径
  }
};

export { formatTime, getLocalUrl };
