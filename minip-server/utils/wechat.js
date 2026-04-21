const https = require('https');
const wechatConfig = require('../config/wechat');

/**
 * 调用微信 code2Session 接口，用 code 换取 openid 和 session_key
 */
function code2Session(code) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wechatConfig.appid}&secret=${wechatConfig.secret}&js_code=${code}&grant_type=authorization_code`;

    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.errcode) {
              reject(new Error(result.errmsg || '微信登录失败'));
            } else {
              resolve({
                openid: result.openid,
                sessionKey: result.session_key,
                unionid: result.unionid || null,
              });
            }
          } catch (e) {
            reject(new Error('解析微信响应失败'));
          }
        });
      })
      .on('error', (err) => {
        reject(new Error('请求微信服务器失败: ' + err.message));
      });
  });
}

module.exports = { code2Session };
