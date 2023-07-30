module.exports = (req, res, next)=>{ // 检验是否进行了登录
  if(!req.session.username){
    return res.redirect("/login");
  } 
  next();
}