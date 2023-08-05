var express = require('express');
var router = express.Router();
//拿到user的数据库模型
const UserModel = require("../../DBModels/UserModel");
// 邀请码模型
const InviteCodeModel = require("../../DBModels/InviteCodeModel");
//用于加密
const md5 = require("md5");
//引入jwt  将
const jwt = require("jsonwebtoken");
//导入自己写的密钥
const serect = require("../../config/tokenSerect");
// 导入检验验证码
const eic = require("../../tools/easyInviteCode");
// 导入invitecode.config
const icConfig = require("../../config/inviteCode.config");

//进行登录
router.post("/login", (req, res)=>{
  //查询数据库，检测有无匹配记录
  //获取用户名和密码
  let {username, password} = req.body;
  UserModel.findOne({username: username, password: md5(password)})
  .then((data)=>{
    //正确匹配上，data是数据对象，匹配不上，data就是null
    if(data){
      let token = jwt.sign(
        {
          username: data.username, 
          _id: data._id
        }, 
        serect, 
        {
          expiresIn: 60*60*24*7
        }
      );
      //对上之后返回token
      res.cookie('token', token, {maxAge: 7 * 24 * 3600 * 1000});
      // req.session.username = data.username; // 保存session 好像没用的
      res.status(200).json({
        code: 200,
        msg: "success",
        data: token
      });
    }else{
      //这里要加return防止两个end冲突
      return res.status(202).json({
        code: 202,
        msg: "wrong username or password",
        data: null
      });
    }
  })
  .catch((err)=>{
    console.log(err);
    res.status(500).json({
      code: 500,
      msg: "server error",
      data: null
    });
  });
});

router.post("/register", (req, res) => {
  let { username, password, inviteCode } = req.body;
  inviteCode = inviteCode || "";
  let parsedCode = eic.decodeOne(inviteCode);
  InviteCodeModel.find({name: parsedCode}).then((data)=>{
    if(data){
      if(data.isUsed){
        res.status(205).json({
          code: 205,
          msg: "used inviteCode!",
          data: null
        });
      }else{
        InviteCodeModel.updateOne({name: parsedCode}, {isUsed: true}).then((data)=>{
          UserModel.findOne({ username: username }).then(data => {
            console.log(data);
            if (data) {
              // 匹配上了，那么用户已存在，告知用户
              res.status(201).json({
                code: 201,
                msg: "user exist! Please change username!",
                data: null
              });
            } else {
              // 没有匹配上，代表着可以注册
              UserModel.create({
                // 数据库中插入对象
                username,
                password: md5(password),
                userVIP: false,
                userTheme: 9,
                userType: "normal",
                userTrueName: eic.decode([inviteCode])[0],
                belongRoom: [],
              })
                .then(data => {
                  // 创建成功，发回注册成功
                  icConfig.isUsed[eic.decode([inviteCode])[0]] = true;
                  res.status(200).json({
                    code: 200,
                    msg: "success!",
                    data: null
                  });
                })
                .catch(err => {
                  // 插入失败，发回注册失败
                  res.status(502).json({
                    code: 502,
                    msg: "database insert failed!",
                    data: null
                  });
                });
            }
          }).catch((err)=>{
            console.log(err);
            res.status(503).json({
              code: 503,
              msg: "find failed!",
              data: null
            });
          });
        }).catch((error)=>{
          console.log(error);
          res.status(510).json({
            code: 510,
            msg: "update invitecode error!",
            data: null,
          });
        });
      }
    }else{
      res.status(204).json({
        code: 204,
        msg: "wrong inviteCode!",
        data: null
      });
    }
  }).catch((error)=>{
    res.status(509).json({
      code: 509,
      msg: "find invitecode error!",
      data: null,
    });
  });
  
});


//进行退出登录
// router.post("/logout", (req, res)=>{
//   //只需要销毁session即可达到退出登录的目的
//   req.session.destroy(()=>{
//     res.status(200).json(
//       {
//         code: 200,
//         msg: "success",
//         data: null
//       }
//     );
//   });
//   // 不知道具体如何解决掉失败的问题。
// });

module.exports = router;
