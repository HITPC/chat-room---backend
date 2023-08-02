//导包
const mongoose = require("mongoose");
//创建文档结构对象 声明各属性都是什么数据类型的(约束本集合中文档的属性及属性值的类型)
let VIPCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  isUsed: {
    type: Boolean,
    required: true,
  },
});
//创建模型对象 对文档操作的封装对象(增删改查均可) 第一个参数要求集合名称 第二个参数要求文档结构对象
let VIPCodeModel = new mongoose.model("VIPCode", VIPCodeSchema);

module.exports = VIPCodeModel;