// 操作数据（主要是获取当前数据）
var express = require('express');
var router = express.Router();
// 拿到user的数据库模型
const UserModel = require("../../DBModels/UserModel");
// 拿到note的数据库模型
const NotesModel = require("../../DBModels/NotesModel");
// 拿到用户的note的数据库模型
const UserNotesModel = require("../../DBModels/UserNotesModel");

// 拿到时间戳
const getDate = require("../../tools/getDate");

// 鉴权
const checkToken = require("../../midwares/checkToken");
// 取消缓存
const disableCache = require("../../midwares/desableCache"); 

// 主页 所有用户列表
router.get("/userList", checkToken, disableCache,  (req, res)=>{
  UserModel.find().then((data)=>{
    if(!data || data.length == 0){
      res.json({
        code: 201,
        msg: "data is empty",
        data: []
      });
      return;
    }
    let resArr = [];
    data.forEach((item)=>{
      resArr.push({
        id: item._id,
        username: item.username,
        userVIP: item.userVIP,
        userTheme: item.userTheme,
        userType: item.userType,
        userTrueName: item.userTrueName,
      });
    });
    res.json({
      code: 200,
      msg: "success",
      data: resArr
    });
  }).catch((error)=>{
    console.log(error);
    res.json({
      code: 500,
      msg: "find error!",
      data: null
    });
  });
});

// 访问某个人的个人中心时使用
router.get("/getUserData", checkToken, disableCache,  (req, res)=>{
  UserModel.findOne({_id: req.query.id}).then((data)=>{
    if(data){
      let obj = {
        id: data._id,
        username: data.username,
        userVIP: data.userVIP,
        userTheme: data.userTheme,
        userType: data.userType,
        userTrueName: data.userTrueName,
      };
      res.json({
        code: 200,
        msg: "success",
        data: obj
      });
      return;
    }else{
      res.json({
        code: 502,
        msg: "not found!",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.json({
      code: 500,
      msg: "find error!",
      data: null
    });
  });
});

// 返回你的信息
router.get("/getMyData", checkToken, disableCache,  (req, res)=>{
  let { _id } = req.user;
  UserModel.findOne({_id}).then((data)=>{
    if(data){
      let obj = {
        id: data._id,
        username: data.username,
        userVIP: data.userVIP,
        userTheme: data.userTheme,
        userType: data.userType,
        userTrueName: data.userTrueName,
      };
      res.json({
        code: 200,
        msg: "success",
        data: obj
      });
      return;
    }else{
      res.json({
        code: 502,
        msg: "not found!",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.json({
      code: 500,
      msg: "find error!",
      data: null
    });
  });
});

// 主页留言板信息
router.get("/getIndexMessageList", checkToken, disableCache, (req, res)=>{
  NotesModel.find().then((data)=>{
    if(!data || data.length == 0){
      res.json({
        code: 201,
        msg: "data is empty",
        data: []
      });
      return;
    }
    res.json({
      code: 200,
      msg: "success",
      data: data
    });
  }).catch((error)=>{
    console.log(error);
  });
});

// 主页留言板新建信息
router.post("/createIndexMessage", checkToken, disableCache, (req, res)=>{
  const { username, _id } = req.user;
  const message = req.body.message || "";
  const date = getDate();
  NotesModel.create({
    userName: username,
    message,
    date
  }).then((data)=>{
    if(data){
      res.json({
        code: 200,
        msg: "success",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.json({
      code: 500,
      msg: "create error",
      data: null
    });
  });
});

// 用户页留言板信息
router.get("/getUserMessageList", checkToken, disableCache, (req, res)=>{
  UserNotesModel.find({belongToId: req.query.belongToId}).then((data)=>{
    if(!data || data.length == 0){
      res.json({
        code: 201,
        msg: "data is empty",
        data: []
      });
      return;
    }
    res.json({
      code: 200,
      msg: "success",
      data: data
    });
  }).catch((error)=>{
    console.log(error);
  });
});

// 创建用户页留言板
router.post("/createUserMessage", checkToken, disableCache, (req, res)=>{
  const { username, _id } = req.user;
  const belongToId = req.body.belongToId || "";
  const message = req.body.message || "";
  const date = getDate();
  UserNotesModel.create({
    belongToId,
    message,
    userName: username,
    date
  }).then((data)=>{
    if(data){
      res.json({
        code: 200,
        msg: "success",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.json({
      code: 500,
      msg: "create error",
      data: null
    });
  });
});




module.exports = router;