// 操作数据（主要是获取当前数据）
var express = require('express');
var router = express.Router();

// 房间文档对象
const RoomModel = require("../../DBModels/RoomModel");

// 用户对象模型
const UserModel = require("../../DBModels/UserModel");

// 消息对象模型
const MessageModel = require("../../DBModels/MessageModel");

// 鉴权
const checkToken = require("../../midwares/checkToken");
// 取消缓存
const disableCache = require("../../midwares/desableCache"); 
// 获取日期
const getDate = require("../../tools/getDate");

// 主页 房间列表
router.get("/roomList", checkToken, disableCache,  (req, res)=>{
  RoomModel.find().then((data)=>{
    if(!data || data.length == 0){
      res.status(201).json({
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
        roomName: item.roomName,
        creatorName: item.creatorName,
        roomPeopleNumber: item.roomPeopleNumber,
      });
    });
    res.status(200).json({
      code: 200,
      msg: "success",
      data: resArr
    });
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "find error!",
      data: null
    });
  });
});

// 创建房间
router.post("/createRoom", checkToken, disableCache, (req, res)=>{
  let { username, _id } = req.user;
  const  { roomName } = req.body;
  if(!roomName){
    res.status(503).json({
      code: 503,
      msg: "wrong prop!",
      data: null,
    });
    return;
  }
  // 判断重名
  RoomModel.findOne({roomName}).then((data)=>{
    if(data){
      res.status(210).json({
        code: 210,
        msg: "repeated name!",
        data: null,
      });
      return;
    }
    // 鉴权：
    UserModel.findOne({_id}).then((data)=>{
      if(data){
        if(data.userVIP){
          // 执行创建
          RoomModel.create({
            creatorName: username,
            roomName,
            roomPeopleNumber: 1,
          }).then((roomData)=>{ // 记得一定要转成string，不然生成的id是出大问题的
            UserModel.updateOne({_id}, { $push: { belongRoom: roomData._id.toString() } }).then(()=>{
              res.status(200).json({
                code: 200,
                msg: "success!",
                data: {
                  id: roomData._id,
                },
              });
            }).catch((error)=>{
              console.log(error);
              res.status(505).json({
                code: 505,
                msg: "update user error!",
                data: null,
              });
            });
          }).catch((error)=>{
            res.status(506).json({
              code: 506,
              msg: "create error!",
              data: null,
            });
          });
        }else{
          res.status(503).json({
            code: 503,
            msg: "no vip!",
            data: null,
          });
        }
      }else{
        res.status(504).json({
          code: 504,
          msg: "no user!",
          data: null,
        });
      }
    }).catch((error)=>{
      console.log(error);
      res.status(500).json({
        code: 500,
        msg: "find user error!",
        data: null,
      });
    });
  }).catch((error)=>{
    console.log(error);
    res.status(510).json({
      code: 510,
      msg: "find room vip!",
      data: null,
    });
  });
});

// 获取房间信息
router.get("/roomData", checkToken, disableCache,  (req, res)=>{
  let { roomId } = req.query;
  if(!roomId){
    res.status(503).json({
      code: 503,
      msg: "wrong prop!",
      data: null,
    });
    return;
  }
  RoomModel.findOne({_id: roomId}).then((data)=>{
    if(!data){
      res.status(501).json({
        code: 501,
        msg: "id no data!",
        data: null
      });
      return;
    }
    let resObj = {};
    resObj["creatorName"] = data.creatorName;
    resObj["roomName"] = data.roomName;
    res.status(200).json({
      code: 200,
      msg: "success",
      data: resObj
    });
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "find error!",
      data: null
    });
  });
});

// 获取房间用户列表
router.get("/roomUserList", checkToken, (req, res) => {
  let { roomId } = req.query;
  if (!roomId) {
    res.status(503).json({
      code: 503,
      msg: "wrong prop!",
      data: null,
    });
    return;
  }
  UserModel.find({ belongRoom: { $in: [roomId] } })
    .then((data) => {
      let peopleInRoom = [];
      if (data) {
        data.forEach((item) => {
          peopleInRoom.push({
            id: item._id,
            userName: item.username,
            userVIP: item.userVIP,
          });
        });
        res.status(200).json({
          code: 200,
          msg: "success",
          data: peopleInRoom,
        });
      } else {
        res.status(501).json({
          code: 501,
          msg: "room no people",
          data: null,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(504).json({
        code: 504,
        msg: "get room userlist error",
        data: null,
      });
    });
});

// 获取消息信息
router.get("/messageList", checkToken, (req, res)=>{
  const roomId = req.query.roomId || "";
  MessageModel.find({roomId}).then((data)=>{
    let resArr = [];
    data.forEach((item)=>{
      resArr.push({
        id: item._id,
        fromId: item.fromId,
        fromName: item.fromName,
        fromVIP: item.fromVIP,
        message: item.message,
        date: item.date
      });
    });
    res.status(200).json({
      code: 200,
      msg: "success",
      data: resArr
    });
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "server error!",
      data: null
    });
  });
});

// 创建消息
router.post("/sendMessage", checkToken, disableCache, async (req, res)=>{
  let { _id, username } = req.user;
  let { roomId, message } = req.body;
  if(!roomId || !message){
    res.status(506).json({
      code: 506,
      msg: "no prop needed!",
      data: null
    });
    return;
  }
  // 找到用户信息
  let isVIP;
  await UserModel.findOne({_id}).then((data)=>{
    if(data){
      isVIP = data.userVIP;
    }else{
      res.status(501).json({
        code: 501,
        msg: "find user error",
        data: null
      });
    }
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "find error!",
      data: null
    });
  });
  let date = getDate();
  MessageModel.create({
    roomId,
    fromName: username,
    fromId: _id,
    fromVIP: isVIP,
    message,
    date
  }).then((data)=>{
    res.status(200).json({
      code: 200,
      msg: "success",
      data: null
    });
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({
      code: 500,
      msg: "create error!",
      data: null
    });
  });
});

// 进入房间 ++房间人数 加自己到列表上
router.get("/inRoom", checkToken, disableCache, (req, res)=>{
  let { _id, username } = req.user;
  let { roomId } = req.query;
  if(!roomId){
    res.status(500).json({
      code: 500,
      msg: "server error!",
      data: null
    });
    return;
  }
  RoomModel.findOne({_id: roomId}).then((data)=>{
    if(data){
      // 如果已经在里面了，就不加了？还是不用处理？
      // 别的人记得加到自己属于这个房间里
      UserModel.findOne({_id}).then((data)=>{
        if(data){
          UserModel.updateOne({_id}, { $push: { belongRoom: roomId } }).then(()=>{}).catch((error)=>{
            res.status(504).json({
              code: 504,
              msg: "update user failed!",
              data: null
            });
          });
        }else{
          res.status(503).json({
            code: 503,
            msg: "find user failed!",
            data: null
          });
        }
      }).catch((error)=>{
        console.log(error);
        res.status(502).json({
          code: 502,
          msg: "find user failed!",
          data: null
        });
      });
      RoomModel.updateOne({_id: data._id}, {roomPeopleNumber: data.roomPeopleNumber+1})
        .then((d)=>{
          res.status(200).json({
            code: 200,
            msg: "success!",
            data: null
          });
        }).catch((e)=>{
          console.log(e);
          res.status(501).json({
            code: 501,
            msg: "update failed!",
            data: null
          });
        });
    }else{  
      //
      res.status(204).json({
        code: 204,
        msg: "room deleted!",
        data: null
      });
    }
  }).catch((err)=>{
    console.log(err);
    res.status(500).json({
      code: 500,
      msg: "failed!",
      data: null
    });
  });
});

// 离开房间 --房间人数
router.get("/leaveRoom", checkToken, disableCache, (req, res)=>{
  let { _id } = req.user;
  let { roomId } = req.query;
  if(!roomId){
    res.status(500).json({
      code: 500,
      msg: "server error!",
      data: null
    });
    return;
  }
  RoomModel.findOne({_id: roomId}).then((data)=>{
    if(data){
      if(data.roomPeopleNumber - 1 == 0){// 人走完房间里没人了
        // 移除这个人不再属于这个房间
        UserModel.updateOne({_id}, {$pull: {belongRoom: roomId}}).then((data)=>{
        }).catch((error)=>{
          console.log(error);
          res.status(503).json({
            code: 503,
            msg: "people failed",
            data: null
          });
        });
        // 删了这个房间就好
        RoomModel.deleteOne({_id: roomId}).then((data)=>{
          if(data.deletedCount === 1){
            res.status(200).json({
              code: 200,
              msg: "success",
              data: null
            });
          }else{
            res.status(206).json({
              code: 206,
              msg: "delete no one",
              data: null
            });
          }
        }).catch((error)=>{
          console.log(error);
          res.status(502).json({
            code: 502,
            msg: "delete room failed!",
            data: null
          });
        });
        return;
      }
      // 人走完房间里还有人
      RoomModel.updateOne({_id: data._id}, {roomPeopleNumber: data.roomPeopleNumber-1})
        .then((d)=>{
          // 移除这个人不再属于这个房间
          UserModel.updateOne({_id}, {$pull: {belongRoom: roomId}}).then((data)=>{
            res.status(200).json({
              code: 200,
              msg: "success!",
              data: null
            });
          }).catch((error)=>{
            console.log(error);
            res.status(503).json({
              code: 503,
              msg: "people failed",
              data: null
            });
          });
        }).catch((e)=>{
          console.log(e);
          res.status(501).json({
            code: 501,
            msg: "update failed!",
            data: null
          });
        });
    }else{  
      res.status(500).json({
        code: 500,
        msg: "failed!",
        data: null
      });
    }
  }).catch((err)=>{
    console.log(err);
    res.status(500).json({
      code: 500,
      msg: "failed!",
      data: null
    });
  });
});

module.exports = router;