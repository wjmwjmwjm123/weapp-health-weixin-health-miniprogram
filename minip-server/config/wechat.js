require('dotenv').config();

module.exports = {
  appid: process.env.WX_APPID || '',
  secret: process.env.WX_SECRET || '',
};
