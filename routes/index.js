var router = require('koa-router')();

router.get('/', function *(next) {
  const currentUser = this.state.jwtdata;
  yield this.render('index', {
    title: 'OA系统',
    currentUser,
    currentPeriod: 11
  });
});

module.exports = router;
