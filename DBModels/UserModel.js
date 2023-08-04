//导包
const mongoose = require("mongoose");
//创建文档结构对象 声明各属性都是什么数据类型的(约束本集合中文档的属性及属性值的类型)
let UserSchema = new mongoose.Schema({
  username: {//用户名
    type: String,
    required: true,
  }, 
  password: {//密码
    type: String,
    required: true,
  }, 
  userVIP: {
    type: Boolean,
    required: true,
  },
  userTheme: {
    type: Number,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  userTrueName: {
    type: String,
    required: true,
  },
  VIPEndTime: {
    type: String,
    default: "",
  },
  belongRoom: {
    type: Array,
    default: [],
  }
});
//创建模型对象 对文档操作的封装对象(增删改查均可) 第一个参数要求集合名称 第二个参数要求文档结构对象
let UserModel = new mongoose.model("users", UserSchema);

module.exports = UserModel;