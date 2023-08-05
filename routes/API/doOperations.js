// 操作 激活什么的
var express = require('express');
var router = express.Router();
// 拿到user的数据库模型
const UserModel = require("../../DBModels/UserModel");
// 邀请码模型
const InviteCodeModel = require("../../DBModels/InviteCodeModel");
// VIP码模型
const VIPCodeModel = require("../../DBModels/VIPCodeMedel");

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
        InviteCodeModel.findOne({name: realName}).then((data)=>{
          if(data){
            res.status(208).json({
              code: 208,
              msg: "this name already get one",
              data: null,
            });
          }else{
            InviteCodeModel.create(
              {name: realName, isUsed: false}
            ).then((data)=>{
              res.status(200).json({
                code: 200,
                msg: "success",
                data: inviteCode.encodeOne(realName)
              });
            }).catch((error)=>{
              res.status(503).json({
                code: 503,
                msg: "invite create error",
                data: null
              });
            });
          }
        }).catch((error)=>{
          res.status(504).json({
            code: 504,
            msg: "invite find error",
            data: null
          });
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
        let code = vipCodeVerifier.getCode();
        // 存进去
        VIPCodeModel.create({code, isUsed: false}).then((data)=>{
          res.status(200).json({
            code: 200,
            msg: "success",
            data: code
          });
        }).catch((error)=>{
          console.log(error);
          res.status(507).json({
            code: 507,
            msg: "insert code in db error!",
            data: null
          })
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
        VIPCodeModel.findOne({code}).then((data)=>{
          if(data){
            if(data.isUsed){
              res.status(250).json({
                code: 250,
                msg: "used code!",
                data: null
              });
            }else{
              UserModel.updateOne({_id}, {userVIP: true}).then((data)=>{
                res.status(200).json({
                  code: 200,
                  msg: "success!",
                  data: null
                });
                VIPCodeModel.updateOne({code}, {isUsed: true}).then(()=>{

                }).catch((error)=>{
                  console.log(error);
                  res.status(509).json({
                    code: 509,
                    msg: "update code state error!",
                    data: null
                  });
                })
              }).catch((error)=>{
                console.log(error);
                res.status(505).json({
                  code: 505,
                  msg: "update error!",
                  data: null
                });
              });
            }
          }else{
            res.status(203).json({
              code: 203,
              msg: "wrong code!",
              data: null
            });
          }
        }).catch((error)=>{
          console.log(error);
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