/**
 * 短信发送工具
 * 开发阶段使用 mock 模式，验证码固定为 123456
 */

const provider = process.env.SMS_PROVIDER || 'mock';

// 内存存储验证码（生产环境应使用 Redis）
const smsCodeStore = {};

/**
 * 发送短信验证码
 */
async function sendSmsCode(phone) {
  if (provider === 'mock') {
    // 生产环境禁止使用 Mock 短信
    if (process.env.NODE_ENV === 'production') {
      throw new Error('生产环境不可使用 Mock 短信服务，请配置 SMS_PROVIDER');
    }
    const code = generateCode();
    console.log(`[Mock短信] 手机号: ${phone}, 验证码: ${code}`);
    smsCodeStore[phone] = { code, expiresAt: Date.now() + 5 * 60 * 1000 };
    return { success: true, message: '发送成功（Mock模式）' };
  }

  // 生产环境接入真实短信服务商
  // TODO: 接入阿里云短信 / 腾讯云短信
  throw new Error('短信服务暂未配置');
}

/**
 * 验证短信验证码
 */
function verifySmsCode(phone, code) {
  const record = smsCodeStore[phone];
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    delete smsCodeStore[phone];
    return false;
  }
  if (record.code !== code) return false;
  delete smsCodeStore[phone];
  return true;
}

function generateCode() {
  return '123456'; // Mock模式固定验证码
}

module.exports = { sendSmsCode, verifySmsCode };
