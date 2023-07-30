// 禁用缓存中间件，及时更新文档
module.exports = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};
