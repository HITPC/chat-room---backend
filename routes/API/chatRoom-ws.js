// 可惜Websocket不知道为什么就是用不了
// const express = require('express');
// const router = express.Router();
// // const expressWs = require('express-ws');
// console.log(router.ws);

// // 房间文档对象
// const RoomModel = require("../../DBModels/RoomModel");

// // 用户对象模型
// const UserModel = require("../../DBModels/UserModel");

// // 消息对象模型
// const MessageModel = require("../../DBModels/MessageModel");

// // 鉴权
// const checkToken = require("../../midwares/checkToken");
// // 取消缓存
// const disableCache = require("../../midwares/desableCache"); 

// // 为路由器实例启用 WebSocket 服务
// // expressWs(router);

// // 接收信息
// router.ws('/submessage', function(ws, req) {
//     ws.on('message', function(msg) {
//         // 处理从客户端接收到的消息
        
//     });
//     // 向客户端发送消息
//     ws.send('Hello from the server!');
// });
// // router.post("/submessage", checkToken, disableCache, (req, res)=>{

// // });

// // 用户进入 ++人数，并通知客户端更新用户列表

// // 用户离开 --此聊天室的在线人数，从用户身上的belongRoom删掉本聊天室的id ，并通知客户端更新用户列表，当用户为0的时候，删除此聊天室