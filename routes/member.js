var router = require('koa-router')(),
    Member = require('../models/member.js'),
    MemberPeriod = require('../models/memberPeriod.js'),
    Validator = require('validator'),
    randomstring = require('randomstring'),
    md5 = require('md5'),
    jwt = require('koa-jwt');

var _errorBody = function(ctx, data) {
  ctx.body = {
    success: 'false',
    data
  }
}

// get memberinfo
router.get('/', function *(next) {
  // current-user's info from cookie
  const currentUser = this.state.jwtdata;
  const conditions = this.request.query;
  const query = new Object;
  var stuids = null;

  if (conditions.stuid) {
    // get members by stuid if stuid exists
    if (isNaN(parseInt(conditions.stuid))) {
      this.body = {
        success: 'false',
        data: 'invalid params'
      };
      return false;
    }
    query.stuid = parseInt(conditions.stuid);
    if ( currentUser.role < 1 && currentUser.stuid !== query.stuid) {
      return _errorBody(this, '无访问权限');
    } else {
      const student = yield MemberPeriod.findOne({
        where: {
          stuid: query.stuid
        },
        attributes: ['stuid', 'status']
      });
      if (student) {
        stuids = new Array();
        stuids.push(student);
      } else {
        return _errorBody(this, '此学号不存在');
      }
    }
  } else {
    if (currentUser.role < 1) {
      // 部长及以上角色才有权限获取成员信息列表
      return _errorBody(this, '无访问权限');
    }
    // get members by conditions
    const period = parseInt(conditions.period) || config.period;
    stuids = yield MemberPeriod.findAll({
      where: {
        period: period
      },
      attributes: ['stuid', 'status']
    });
    if (stuids) {
      const stuidArr = new Array();
      for (var i = 0; i < stuids.length; i++) {
        stuidArr.push(stuids[i].dataValues.stuid);
      };
      query.stuid = stuidArr;
    }
    conditions.period = isNaN(period) ? period : period.toString();

    if (conditions.depart && conditions.depart !== 'all') {
      const departKey = config.depart.indexOf(conditions.depart);
      if (0 <= departKey) {
        query.depart = departKey;
      }
    }
    if (conditions.campus) {
      const campusKey = config.campus.indexOf(conditions.campus);
      if (0 <= campusKey) {
        query.campus = campusKey;
      }
    };
  }

  const queryRes = !query ? null : yield Member.findAll({
    where: query,
    attributes: ['stuid', 'name', 'depart', 'email', 'phone', 'qq', 'debitcard', 'role', 'join_time', 'campus', 'isavatar'],
    order: 'join_time'
  });

  const data = !queryRes ? [] : queryRes.map((item) => {
    // transform params
    item.depart = config.depart[item.depart];
    item.campus = config.campus[item.campus];
    item.role = config.memberRole[item.role];

    const one = stuids.filter(one => {
      return one.stuid == item.stuid ? true : false
    });
    item.dataValues.status = config.memberStatus[one[0].dataValues.status];

    item.dataValues.avatar = (item.isavatar == 1) ? 'default' : '/api/avatar/' + item.stuid;
    // fotmat the join_time Y-M-D
    const date = new Date(item.join_time * 1000);
    item.join_time = date.toLocaleDateString();
    // hide the debitcard
    item.debitcard = item.debitcard
                      ? item.debitcard.substring(0, 4) + '****' + item.debitcard.substring(item.debitcard.length - 4, item.debitcard.length)
                      : '-';
    return item;
  });

  const success = data[0] ? 'true' : 'false';
  const resp = data[0]
               ? {
                   conditions,
                   members: conditions.stuid ? data[0] : data
                 }
               : '哇哦，没找到数据';

  this.body = {
    success,
    data: resp
  };
});

// update memberinfo
router.post('/', function *(next) {
  const params = this.request.body;
  const update = new Object;

  // stuid is necessary
  if (!params.stuid || !Validator.isNumeric(params.stuid)) {
    return _errorBody(this, '学号不正常');
  }

  if (params.email) {
    // check the format of email
    if (Validator.isEmail(params.email)) {
      Object.assign(update, { email: params.email });
    } else {
      return _errorBody(this, '邮箱格式不正确');
    }
  }
  if (params.phone) {
    if (Validator.isMobilePhone(params.phone, 'zh-CN')) {
      Object.assign(update, { phone: params.phone });
    } else {
      return _errorBody(this, '手机号格式不正确');
    }
  }
  if (params.qq) {
    if (Validator.isNumeric(params.qq)) {
      Object.assign(update, { qq: params.qq });
    } else {
      return _errorBody(this, 'QQ号格式不正确');
    }
  }
  if (params.depart) {
    // config.depart: the list of department
    const depart = config.depart.indexOf(params.depart);
    if (depart >= 0) {
      Object.assign(update, { depart: depart });
    } else {
      return _errorBody(this, '请选择正确的部门');
    }
  }
  if (params.role) {
    const role = config.memberRole.indexOf(params.role);
    if (role >= 0) {
      Object.assign(update, { role: role });
    } else {
      return _errorBody(this, '请选择正确角色');
    }
  }
  if (params.campus) {
    const campus = config.campus.indexOf(params.campus);
    if (campus >= 0) {
      Object.assign(update, { campus: campus });
    } else {
      return _errorBody(this, '请选择正确校区');
    }
  }
  if (params.status) {
    const status = config.memberStatus.indexOf(params.status);
    if (status >= 0) {
      Object.assign(update, { status: status });
    } else {
      return _errorBody(this, '状态不正确');
    }
  }
  if (params.debitcard && Validator.isNumeric(params.debitcard)) {
    Object.assign(update, { debitcard: params.debitcard });
  }

  if (params.password && params.password.length == 32) {
    const salt = randomstring.generate(6);
    const pwd = md5(md5(params.password) + salt);
    Object.assign(update, { pwd, salt });
  }

  if (JSON.stringify(update) !== '{}') {
    const updateRes = yield Member.update(
      update,
      {
        where: {
          stuid: params.stuid
        }
      }
    );
    const success = updateRes[0] ? 'true' : 'false';
    const data = updateRes[0] ? '已更新' : '已提交，但并未做出更新';

    this.body = {
      success,
      data
    };
  } else {
    return _errorBody(this, '未更改');
  }

});

module.exports = router;
