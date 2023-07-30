// 该文件仅用于打个样子
// var express = require('express');
// var router = express.Router();
// //拿到user的数据库模型
// const UserModel = require("../../DBModels/UserModel");
// //用于加密
// const md5 = require("md5");
// //引入jwt  将
// const jwt = require("jsonwebtoken");
// //导入自己写的密钥
// const serect = require("../../config/tokenSerect");

// //进行登录
// router.post("/login", (req, res)=>{
//   //查询数据库，检测有无匹配记录
//   //获取用户名和密码
//   let {username, password} = req.body;
//   UserModel.findOne({username: username, password: md5(password)})
//   .then((data)=>{
//     //正确匹配上，data是数据对象，匹配不上，data就是null
//     if(data){
//       let token = jwt.sign(
//         {
//           username: data.username, 
//           _id: data._id
//         }, 
//         serect, 
//         {
//           expiresIn: 60*60*24*7
//         }
//       );
//       //对上之后返回token
//       res.cookie('token', token, {maxAge: 7 * 24 * 3600 * 1000});
//       req.session.username = data.username; // 保存session
//       res.status(200).json({
//         code: 200,
//         msg: "success",
//         data: token
//       });
//     }else{
//       //这里要加return防止两个end冲突
//       return res.status(502).json({
//         code: 502,
//         msg: "wrong username or password",
//         data: null
//       });
//     }
//   })
//   .catch((err)=>{
//     console.log(err);
//     res.status(500).json({
//       code: 500,
//       msg: "server error",
//       data: null
//     });
//   });
// });

// router.post("/register", (req, res) => {
//   let { username, password, isOnline } = req.body;
//   if(!isOnline){ // 未开放注册
//     res.status(505).json({
//       code: 505,
//       msg: "register is offline",
//       data: null
//     });
//   }
//   UserModel.findOne({ username: username }).then(data => {
//     if (data) {
//       // 匹配上了，那么用户已存在，告知用户
//       res.status(501).json({
//         code: 501,
//         msg: "user exist! Please change username!",
//         data: null
//       });
//     } else {
//       // 没有匹配上，代表着可以注册
//       UserModel.create({
//         // 数据库中插入对象
//         username,
//         password: md5(password)
//       })
//         .then(data => {
//           // 创建成功，发回注册成功
//           res.status(200).json({
//             code: 200,
//             msg: "success!",
//             data: null
//           });
//         })
//         .catch(err => {
//           // 插入失败，发回注册失败
//           res.status(502).json({
//             code: 502,
//             msg: "database insert failed!",
//             data: null
//           });
//         });
//     }
//   }).catch((err)=>{
//     console.log(err);
//     res.status(503).json({
//       code: 503,
//       msg: "find failed!",
//       data: null
//     });
//   });
// });


// //进行退出登录
// // router.post("/logout", (req, res)=>{
// //   //只需要销毁session即可达到退出登录的目的
// //   req.session.destroy(()=>{
// //     res.status(200).json(
// //       {
// //         code: 200,
// //         msg: "success",
// //         data: null
// //       }
// //     );
// //   });
// //   // 不知道具体如何解决掉失败的问题。
// // });

// module.exports = router;
