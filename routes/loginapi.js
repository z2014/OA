var router = require('koa-router')(),
    Member = require('../models/member.js'),
    MemberPeriod = require('../models/memberPeriod.js'),
    md5 = require('md5'),
    jwt = require('koa-jwt');

// 登录验证
router.post('/', function *(next) {
  const username = this.request.body.username;
  const pwd = this.request.body.pwd;
  var _errInfo = '请输入正确用户名密码';
  var _data = new Object;
  if (username && pwd) {
    const queryRes = yield Member.findOne({
      where: {
        stuid: username
      },
      attributes: ['stuid', 'name', 'pwd', 'depart', 'campus', 'role', 'salt'],
      // attributes: ['stuid', 'name', 'period', 'depart', 'email', 'phone', 'qq', 'pwd', 'status', 'role', 'join_time', 'campus', 'salt'],
    });
    if (queryRes) {
      const cpwd = md5(md5(pwd) + queryRes.salt);
      if (queryRes.pwd == cpwd) { // success
        const checkStatus = yield MemberPeriod.findOne({
          where: {
            stuid: queryRes.stuid,
            period: config.period
          },
          attributes: ['status']
        });
        if (checkStatus.dataValues.status !== 1) {
          _errInfo = '此账号已锁定，所有疑问请联系办公室';
        } else {
          // token有效期三小时
          const token =  jwt.sign({
            stuid: queryRes.stuid,
            name: queryRes.name,
            depart: queryRes.depart,
            campus: queryRes.campus,
            role: queryRes.role
          }, config.secret, { expiresIn: '3h' });
          _data = {
            token: token,
            expires: 3,
            domain: config.host
          }
          _errInfo = false;
        }
      } else {
        _errInfo = '密码错误';
      }
    } else {
      _errInfo = '此用户名不存在';
    }
  }
  this.body = {
    success: _errInfo ? 'false' : 'true',
    data: _errInfo || _data
  }
});

module.exports = router;
