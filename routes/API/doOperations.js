// 操作 激活什么的
var express = require('express');
var router = express.Router();
// 拿到user的数据库模型
const UserModel = require("../../DBModels/UserModel");

// 鉴权
const checkToken = require("../../midwares/checkToken");
// 取消缓存
const disableCache = require("../../midwares/desableCache"); 

// vip激活码工具
const vipCodeVerifier = require("../../tools/oneTimeCode");
// 邀请码工具
const inviteCode = require("../../tools/easyInviteCode");


// 获取邀请码
router.get("/getInviteCode", checkToken, disableCache, (req, res)=>{
  const { _id } = req.user;
  const { realName } = req.query;
  if(!realName){
    res.status(504).json({
      code: 504,
      msg: "no realname prop!",
      data: null
    });
  }
  UserModel.findOne({_id}).then((data)=>{
    if(data){
      if(data.userType === "admin"){
        res.status(200).json({
          code: 200,
          msg: "success",
          data: inviteCode.encodeOne(realName)
        });
      }else{
        res.status(502).json({
          code: 502,
          msg: "error, no authority!",
          data: null
        });
      }
    }else{
      res.status(503).json({
        code: 503,
        msg: "find error, no such user!",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "db find error, no authority!",
      data: null
    });
  });

});


// 获取vip激活码
router.get("/getVIPCode", checkToken, disableCache, (req, res)=>{
  const { _id } = req.user;
  UserModel.findOne({_id}).then((data)=>{
    if(data){
      if(data.userType === "admin"){
        res.status(200).json({
          code: 200,
          msg: "success",
          data: vipCodeVerifier.getCode()
        });
      }else{
        res.status(502).json({
          code: 502,
          msg: "error, no authority!",
          data: null
        });
      }
    }else{
      res.status(502).json({
        code: 502,
        msg: "find error, no such user!",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "db find error, no authority!",
      data: null
    });
  });
});


// 激活VIP
router.post("/enableVIP", checkToken, disableCache, (req, res)=>{
  const { _id } = req.user;
  const code = req.body.code || "";
  UserModel.findOne({_id}).then((data)=>{
    if(data){
      if(data.userVIP){
        res.status(202).json({
          code: 202,
          msg: "already VIP!",
          data: null
        });
      }else{
        if(vipCodeVerifier.verifyCode(code)){
          UserModel.updateOne({_id}, {userVIP: true}).then((data)=>{
            res.status(200).json({
              code: 200,
              msg: "success!",
              data: null
            });
          }).catch((error)=>{
            console.log(error);
            res.status(505).json({
              code: 505,
              msg: "update error!",
              data: null
            });
          });
        }else{
          res.status(503).json({
            code: 503,
            msg: "wrong code!",
            data: null
          });
        }
      }
    }else{
      res.status(502).json({
        code: 502,
        msg: "find error, no such user!",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "db find error, no authority!",
      data: null
    });
  });
});

// 修改用户主题
router.post("/changeTheme", checkToken, disableCache, (req, res)=>{
  const { _id } = req.user;
  const theme = req.body.theme || 9;
  UserModel.findOne({_id}).then((data)=>{
    if(data){
      UserModel.updateOne({_id}, {userTheme: theme}).then((data)=>{
        res.status(200).json({
          code: 200,
          msg: "success!",
          data: null
        });
      }).catch((error)=>{
        console.log(error);
        res.status(503).json({
          code: 503,
          msg: "update error!",
          data: null
        });
      });
    }else{
      res.json({
        code: 501,
        msg: "not find!",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "unknow error!",
      data: null
    });
  });
});

module.exports = router;