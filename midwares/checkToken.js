//导入jwt做token校验 记得这里导包 在要导入到的文件里的导入中间件之前的部分导包没有意义的。
const jwt = require("jsonwebtoken");
const serect = require("../config/tokenSerect");

module.exports = (req, res, next)=>{
  //获取token
  let token = req.get("token");
  if(!token){
    res.json({
      code: "503",
      msg: "without token",
      data: null
    });
    return;
  }
  //校验token token的位置（放哪里）是由服务端所决定的，一般放到请求头里
  jwt.verify(token, serect, (err, data)=>{
    if(err){
      res.json({
        code: "503",
        msg: "wrong token",
        data: null
      });
      return;
    } 
    //保存用户的信息(为了实现一人一个账户，防止读取全部的直接把所有的都读了) 这样就可以在后续的路由回调中拿到当前用户的数据
    req.user = data;
    next();//都过了才响应下面的信息
  });

}