//导包  这个文件是房间列表的，具体房间的新建去
const mongoose = require("mongoose");
//创建文档结构对象 声明各属性都是什么数据类型的(约束本集合中文档的属性及属性值的类型)
let RoomSchema = new mongoose.Schema({
  creatorName: {
    type: String,
    required: true,
  },
  roomName:{
    type: String,
    required: true,
  }, 
  roomPeopleNumber: {
    type: Number,
    required: true,
  }
});
//创建模型对象 对文档操作的封装对象(增删改查均可) 第一个参数要求集合名称 第二个参数要求文档结构对象
let RoomModel = new mongoose.model("rooms", RoomSchema);

module.exports = RoomModel;