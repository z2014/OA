var app = require('koa')(),
    router = require('koa-router')(),
    logger = require('koa-logger'),
    json = require('koa-json'),
    onerror = require('koa-onerror'),
    jwt = require('koa-jwt');

// 全局配置
global.config = require('./config.js');

global.debug = true;

process.env.TZ = 'Asia/Shanghai';

var index = require('./routes/index'),
    member = require('./routes/member'),
    login = require('./routes/login'),
    loginapi = require('./routes/loginapi'),
    avatar = require('./routes/avatar'),
    meeting = require('./routes/meeting'),
    report = require('./routes/report');


// 配置中间件

//xtemplate模板渲染
var xtpl = require('xtpl/lib/koa');
xtpl(app,{
    views: __dirname + '/views'
});
console.log("dir",__dirname);
app.use(require('koa-bodyparser')());
app.use(json());
// app.use(logger());

app.use(function *(next){
  var start = new Date;
  try {
    this.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (debug) {
      this.set('Access-Control-Allow-Origin', '*');
    } else {
      this.set('Access-Control-Allow-Origin', config.host);
    }
    yield next;
  } catch (err) {
    if (401 == err.status) {
      // 登录Token不合法时跳转至登录页
      this.status = 401;
      this.redirect('/login');
    } else {
      if (debug) {
        throw err;
      } else {
        this.body = {
          success: 'false',
          data: 'error'
        }
      }
    }
  }
  // var ms = new Date - start;
  // console.log('%s %s - %s', this.method, this.url, ms);
});

// 设置静态资源目录
app.use(require('koa-static')(__dirname + '/public'));

// 除登录页之外的路由需要验证jwt
app.use(jwt({cookie: config.authCookie, secret: config.secret, key: 'jwtdata' }).unless({ path: [/^\/login/,/^\/api\/login/] }));

// 路由设置
router.use('/', index.routes());
router.use('/login', login.routes());
router.use('/api/login', loginapi.routes());
router.use('/api/member', member.routes());
router.use('/api/avatar', avatar.routes());
router.use('/api/report', report.routes());
router.use('/api/meeting', meeting.routes());


app.use(router.routes()).use(router.allowedMethods());

//error日志
app.on('error', function(err, ctx){
  logger.error('server error', err, ctx);
});

module.exports = app;
