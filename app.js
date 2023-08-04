var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//为写入session准备的导包
const session = require("express-session");
const MongoStore = require("connect-mongo");
//导入数据库的配置文件
const dbConfig = require("./config/databaseConfig.js");

// 引入mongoose
const mongoose = require('mongoose');

// 导入cors配置跨域
const cors = require("cors");

var app = express();
// 导入websocket
const expressWs = require('express-ws')(app);
app.use(function (req, res, next) {
  req.ws = expressWs.getWss();
  next();
})
// 导入路由
// var test = require('./routes/API/test.js');
var loginAndRegister = require("./routes/API/loginAndRegister.js");
var getData = require("./routes/API/getData.js");
var operations = require("./routes/API/doOperations");
var roomHttp = require("./routes/API/chatRoom-http.js");
// var roomWS = require("./routes/API/chatRoom-ws.js");

// 连接到数据库，必须要做的一步！
mongoose.connect(`mongodb://${dbConfig.DBHOST}:${dbConfig.DBPORT}/${dbConfig.DBNAME}`, { useNewUrlParser: true, useUnifiedTopology: true });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());// 配置跨域

// 设置session中间件
app.use(session({
  name: "session_id", //Scookie里存着session_id的那个key的名字
  secret: "MYBLOG", //设置密钥(参加加密的字符串)(又叫加盐)（这个字符串又叫签名）必须设置，禁止空字符串
  saveUninitialized: false, //是否每次请求都设置一个cookie来存储session的id（用户如果没session，我也给他创建一个session对象）(记录匿名用户的信息的时候可以给成true)
  resave: true, //是否在每次请求的时候重新保存session 因为session也是有生命周期的，和cookie很像，就像长时间不操作自动退出登录那里
  store: MongoStore.create({//设置数据库/什么存数据的东西 将session数据保存在这里面
    //这里用的一个包
    mongoUrl: `mongodb://${dbConfig.DBHOST}:${dbConfig.DBPORT}/${dbConfig.DBNAME}`
  }),
  cookie: {
    httpOnly: false, //对cookie设置，开启后前端无法对这个cookie进行JS操作（比如document.cookie来进行访问cookie）
    maxAge: 60 * 1000 * 60 * 24 * 7 //设置cookie和session的生命周期，单位依然是毫秒
  }
}));

// 注册路由 允许同一个根路径，不同的不会顶替，相同的谁在前面谁有效
// app.use('/', test);
app.use("/", loginAndRegister);
app.use("/", getData);
app.use("/", operations);
app.use("/", roomHttp);
// app.use("/", roomWS);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
