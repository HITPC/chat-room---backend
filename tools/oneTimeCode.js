// 一次性激活码库
const { authenticator } = require('otplib');

const secret = authenticator.generateSecret();

class oneTimeCode{
  getCode(){
    // 使用密钥生成一个激活码
    return authenticator.generate(secret);
  }

  verifyCode(code){
    return authenticator.verify({ token: code, secret });
  }
}

module.exports = new oneTimeCode();