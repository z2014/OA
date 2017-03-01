var router = require('koa-router')(),
    Member = require('../models/member.js'),
    Report = require('../models/report.js'),
    Setting = require('../models/setting.js');
require('date-util');

var _errorBody = function(ctx, data) {
  ctx.body = {
    success: 'false',
    data
  }
}

// 请求工作汇报列表
router.get('/', function *(next) {
  const query = this.request.query;
  const currentUser = this.state.jwtdata; // current-user's info from cookie
  const where = new Object;
  var stuids = new Array;
  if (query.stuid) {
    // 当请求参数包含stuid时表示请求个人工作汇报
    if (currentUser.stuid == query.stuid && currentUser.role > 0) {
      // 检查学号是否存在
      const student = yield Member.findOne({
        where: {
          stuid: query.stuid
        },
        attributes: ['stuid', 'name']
      });
      if (student) {
        stuids.push(student);
        where.stuid = query.stuid;
      } else {
        return _errorBody(this, '此学号不存在');
      }
    }
  } else {
    // 当请求参数不包含stuid时表示请求按条件查询工作汇报
    query.start_date = query.start_date || '2016-01-15';
    query.end_date = query.end_date || '2017-02-15';
    query.depart = query.depart || config.depart[currentUser.depart];
    query.campus = query.campus || config.campus[currentUser.campus];
    const start_date = new Date().strtotime(query.start_date);
    const end_date = new Date().strtotime(query.end_date);
    where.start_date = {
      $gte: start_date
    }
    where.end_date = {
      $lte: end_date
    }
    if (query.contact) {
      contactOne = yield Member.findOne({
        where: {
          $or: [
            { stuid: query.contact },
            { name: query.contact }
          ]
        },
        attributes: ['stuid', 'name']
      });
      if (contactOne) {
        stuids.push(contactOne);
        where.stuid = contactOne.dataValues.stuid;
      } else {
        return _errorBody(this, '没找到此姓名/学号对应的信息');
      }
    } else {
      const stuConditions = new Object;
      if (query.depart) {
        const departKey = config.depart.indexOf(query.depart);
        if (0 <= departKey) {
          stuConditions.depart = departKey;
        }
      }
      if (query.campus) {
        const campusKey = config.campus.indexOf(query.campus);
        if (0 <= campusKey) {
          stuConditions.campus = campusKey;
        }
      }
      if (JSON.stringify(stuConditions) !== '{}') {
        stuids = yield Member.findAll({
          where: stuConditions,
          attributes: ['stuid', 'name']
        });
        const stuNum = stuids.length;
        const stuArr = new Array();
        for (var i = 0; i < stuNum; i++) {
          stuArr.push(stuids[i].dataValues.stuid);
        }
        where.stuid = stuArr;
      }
    }
  }
  const findReport = yield Report.findAll({
    where,
    attributes: ['id', 'stuid', 'start_date', 'end_date', 'content', 'suggestion', 'comment', 'rate', 'salary']
  });
  var reports = new Array();
  const totalNum = findReport.length;
  for (var i = 0; i < totalNum; i++) {
    reports[i] = new Object;
    reports[i].id = findReport[i].dataValues.id;
    reports[i].stuid = findReport[i].dataValues.stuid;
    var _stuItem = stuids.filter(item => {
      if (findReport[i].dataValues.stuid == item.dataValues.stuid) {
        return true;
      }
      return false;
    });
    reports[i].username = _stuItem[0].dataValues.name;
    reports[i].start_date = new Date(findReport[i].dataValues.start_date*1000).format("yyyy-mm-dd");
    reports[i].end_date = new Date(findReport[i].dataValues.end_date*1000).format("yyyy-mm-dd");
    reports[i].content = findReport[i].dataValues.content;
    reports[i].suggestion = findReport[i].dataValues.suggestion;
    reports[i].comment = findReport[i].dataValues.comment;
    reports[i].rate = findReport[i].dataValues.rate;
    reports[i].salary = findReport[i].dataValues.salary;
  };
  this.body = {
    success: 'true',
    data: reports,
    conditions: query
  }
});

// 请求汇报填写开启状态
router.get('/status', function *(next) {
  const values = yield Setting.findAll({
    where: {
      name: ['report_stat', 'report_start_date', 'report_end_date', 'review_start_date', 'review_end_date', 'work_start_date', 'work_end_date']
    }
  });
  const reportStatus = new Object;
  values.map(item => {
    if (item.dataValues.name == 'report_stat') {
      reportStatus.stat = item.dataValues.value;
    } else {
      reportStatus[item.dataValues.name] = item.dataValues.value
    }
  });
  // console.log('reportStatus', reportStatus);
  this.body = {
    success: 'true',
    data: reportStatus
  }
});

router.post('/status', function *(next) {
  const params = this.request.body;
  const newValues = params.stat == 'open' ? [
    {
      name: 'report_stat',
      value: params.stat
    },
    {
      name: 'report_start_date',
      value: params.report_start_date
    },
    {
      name: 'report_end_date',
      value: params.report_end_date
    },
    {
      name: 'review_start_date',
      value: params.review_start_date
    },
    {
      name: 'review_end_date',
      value: params.review_end_date
    },
    {
      name: 'work_start_date',
      value: params.work_start_date
    },
    {
      name: 'work_end_date',
      value: params.review_end_date
    }
  ] : [
    {
      name: 'report_stat',
      value: params.stat
    }
  ];
  try {
    const setting = yield Setting.bulkCreate(newValues, {
      fields: ['name', 'value'],
      updateOnDuplicate: ['name', 'value']
    });
    if (setting) {
      this.body = {
        success: 'true'
      }
    } else {
      this.body = {
        success: 'false'
      }
    }
  } catch(err) {
    this.body = {
      success: 'false'
    }
  }
});

router.post('/', function *(next) {
});

module.exports = router;