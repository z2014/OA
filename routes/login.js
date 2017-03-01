var router = require('koa-router')();

// 登录页
router.get('/', function *(next) {
  yield this.render('login', {
    title: '工大学子OA系统登录',
    head_title: '工大学子办公系统'
  });
});

module.exports = router;
