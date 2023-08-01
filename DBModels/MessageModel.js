//导包
const mongoose = require("mongoose");
//创建文档结构对象 声明各属性都是什么数据类型的(约束本集合中文档的属性及属性值的类型)
let MessageSchema = new mongoose.Schema({
  fromName: {
    type: String,
    required: true,
  },
  fromId: {
    type: String,
    required: true,
  },
  fromVIP: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  }
});
//创建模型对象 对文档操作的封装对象(增删改查均可) 第一个参数要求集合名称 第二个参数要求文档结构对象
let MessageModel = new mongoose.model("notes", MessageSchema);

module.exports = MessageModel;