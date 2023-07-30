// // 这个文件仅仅用于展示数据库常用增删改查相关操作
// var express = require('express');
// var router = express.Router();
// // 导入鉴权
// const tokenVerify = require("../../midwares/checkToken");
// // 导入博客文档对象
// const BlogModel = require("../../DBModels/blogModel");
// // 导入获取日期工具
// const getDate = require("../../tools/getDate");
// // 导入禁用缓存
// const disableCache = require("../../midwares/desableCache");

// // 获取博客列表
// router.get("/getBlogList", disableCache, (req, res)=>{
//   BlogModel.find()
//   .then((data)=>{
//     let blogList = data.reverse();
//     let returnArr = [];
//     let length = blogList.length;
//     // let length = 30; // 假数据 测试用
//     if(length === 0){
//       res.status(200).json({
//         code: 200,
//         msg: "success",
//         data: []
//       });
//       return;
//     }else{
//       let pageSize = req.query.pageSize || 
//         (length > 5 ? 5 : length);
//       let page = req.query.page || 1;
//       // 做分页 (约束限制，防止越界)
//       pageSize = pageSize > length ? length : pageSize;
//       let add = Number.isInteger(length / pageSize) ? 0 : 1;
//       let maxPage = Number.parseInt(length / pageSize);
//       maxPage += add;
//       page = page > maxPage ? maxPage : page;
//       // 分页
//       for(let i = (page - 1) * pageSize; i < (page - 1) * pageSize + pageSize && i < length; ++i){
//         returnArr.push({
//           id: blogList[i]._id,
//           title: blogList[i].title,
//           description: blogList[i].description,
//           date: blogList[i].date,
//           type: blogList[i].type,
//           visistorNumber: blogList[i].visistorNumber
//         });
//       }
//       res.status(200).json({
//         code: 200,
//         msg: "success",
//         data: {
//           list: returnArr, 
//           maxLength: blogList.length
//         } // 倒序一下，使得创建日期靠后的在前面
//       });
//     }
//   })
//   .catch((error)=>{
//     res.status(500).json({
//       code: 500,
//       msg: "server error!",
//       data: null
//     });
//   });
// });


// // 获取博客详情
// router.get("/getBlog", disableCache, (req, res)=>{
//   let { id } = req.query;
//   BlogModel.findOne({_id: id})
//   .then((data)=>{
//     if(data){
//       // 将其浏览次数+1
//       BlogModel.updateOne({_id: data._id}, {visistorNumber: data.visistorNumber+1})
//       .then((data)=>{}).catch((error)=>{
//         console.log("update visistorNumber error: " + error);
//       });
//       let temp = data.content;
//       res.status(200).json({
//         code: 200,
//         msg: "success",
//         data: temp 
//       });
//     }else{
//       res.status(502).json({
//         code: 502,
//         msg: "not found",
//         data: null
//       })
//     }
//   })
//   .catch((error)=>{
//     res.status(500).json({
//       code: 500,
//       msg: "found error",
//       data: null
//     });
//   });
// });

// // 新增博客
// router.post("/addBlog", tokenVerify, (req, res)=>{
//   let { title, content } = req.body;
//   let description = req.body.description || "暂未添加说明";
//   description = description === "" ? "暂未添加说明" : description;
//   // 考虑不允许标题重复？
//   BlogModel.create({
//     title,
//     description,
//     content,
//     date: getDate("today"),
//     type: "blog",
//     visistorNumber: 0
//   }).then((data)=>{
//     if(data){
//       res.status(200).json({
//         code: 200,
//         msg: "success",
//         data: null
//       });
//     }else{
//       res.status(501).json({
//         code: 501,
//         msg: "create error",
//         data: null
//       });
//     }
//   }).catch((error)=>{
//     res.status(500).json({
//       code: 500,
//       msg: "server error",
//       data: null
//     });
//   });
// });

// // 修改博客
// router.post("/changeBlog", tokenVerify, (req, res)=>{
//   let { id } = req.body;
//   BlogModel.findOne({_id: id})
//   .then((data)=>{
//     if(data){
//       let title = req.body.title || data.title;
//       let content = req.body.content || data.content;
//       let description = req.body.description || data.description;
//       BlogModel.updateOne({_id: data._id}, {title, content, description, date: getDate("today")})
//       .then((data)=>{
//         res.status(200).json({
//           code: 200,
//           msg: "success",
//           data: null
//         });
//       })
//       .catch((error)=>{
//         res.status(503).json({
//           code: 503,
//           msg: "update error!",
//           data: null
//         }); 
//       })
//     }else{
//       res.status(502).json({
//         code: 502,
//         msg: "blog not found",
//         data: null
//       });
//     }
//   })
//   .catch((error)=>{
//     res.status(500).json({
//       code: 500,
//       msg: "server error",
//       data: null
//     });
//   })
// });

// // 删除博客
// router.delete("/deleteBlog", tokenVerify, (req, res)=>{
//   let { id } = req.query;
//   BlogModel.deleteOne({_id: id}).then((data)=>{
//     if(data.deletedCount === 1){
//       res.status(200).json({
//         code: 200,
//         msg: "success",
//         data: null
//       });
//     }else{
//       res.status(502).json({
//         code: 502,
//         msg: "delete error or not found",
//         data: null
//       });
//     }
//   }).catch((error)=>{
//     res.status(500).json({
//       code: 500,
//       msg: "server error!",
//       data: null
//     });
//   });
// });

// router.get("/search", disableCache, (req, res)=>{
//   let title = req.query.title || "";
//   let type = req.query.type || "blog";
//   if(type === "blog"){
//     BlogModel.findOne({title})
//     .then((data)=>{
//       if(data){
//         let temp = {
//           id: data._id,
//           title: data.title,
//           description: data.description,
//           date: data.date,
//           type: data.type,
//           content: data.content,
//           visistorNumber: data.visistorNumber
//         }
//         res.status(200).json({
//           code: 200,
//           msg: "success",
//           data: temp
//         });
//       }else{
//         res.status(250).json({
//           code: 250,
//           msg: "not found!",
//           data: null
//         });
//       }
//     })
//     .catch((error)=>{
//       console.log(error);
//       res.status(502).json({
//         code: 502,
//         msg: "find blog error!",
//         data: null
//       });
//     });
//   }else if(type === "example"){
//     ExampleModel.findOne({title})
//     .then((data)=>{
//       if(data){
//         let temp = {
//           id: data._id,
//           title: data.title,
//           description: data.description,
//           date: data.date,
//           type: data.type,
//           visistorNumber: data.visistorNumber
//         }
//         res.status(200).json({
//           code: 200,
//           msg: "success",
//           data: temp
//         });
//       }else{
//         res.status(250).json({
//           code: 250,
//           msg: "not found!",
//           data: null
//         });
//       }
//     })
//     .catch((error)=>{
//       res.status(503).json({
//         code: 503,
//         msg: "find example error!",
//         data: null
//       });
//     });
//   }else{
//     res.status(500).json({
//       code: 500,
//       msg: "pamras error!",
//       data: null
//     });
//   }
// });

// module.exports = router;