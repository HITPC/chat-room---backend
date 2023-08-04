module.exports = (type = 'today') => {
  // 获取当前日期
  let timestamp = Date.parse(new Date());
  let date = new Date(timestamp);
  if (type == 'tomorrow') { // 明天
      date.setDate(date.getDate() + 1);

  } else if (type == 'today') { // 今天
      date.setDate(date.getDate());
  }
  //获取年份  
  var Y = date.getFullYear();
  //获取月份  
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  //获取当日日期 
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var H = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var MIN = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var S = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(); 
  let todayDate = Y + '-' + M + '-' + D + " " + H + ":" + MIN + ":" + S;
  return todayDate
};
