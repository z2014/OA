var router = require('koa-router')(),
    Meeting = require('../models/meeting.js'),
    qs = require('qs');
require('date-util');

router.get('/',function *() {
  const conditions = qs.parse(this.request.query);
  const where = new Object();
  where.depart = conditions.depart;
  if (conditions.role) {
    where.role = conditions.role;
  }
  if (conditions.time1 && conditions.time2) {
    var start_date = conditions.time1;
    var end_date = conditions.time2;
    where.date = {
      $gte:new Date().strtotime(start_date),
      $lte:new Date().strtotime(end_date)
    };
  }
  var data = yield Meeting.findAll({
    where
  });
  for (var i = 0; i < data.length; i++) {
    var time = new Date(data[i].date*1000);
    // console.log(new Date(time).format("yyyy-mm-dd hh:mm:ss"));
    data[i].date = new Date(time).format("yyyy-mm-dd hh:mm:ss")
  }
  this.body = {
    success:true,
    data:data.reverse(),
    page:1
  }
});
router.post('/',function *(next) {
	const param = this.request.body;
  param.meeting.date = new Date(param.meeting.date).getTime()/1000;
	var updateData = yield Meeting.update(
	  {
	    'date':param.meeting.date,
	    'role':param.meeting.role,
	    'status':param.meeting.status,
	    'meeting':param.meeting.meeting,
	    'people':param.meeting.people,
	    'text':param.meeting.text
    },
    {
    	'where':{
    		'id':param.meeting.id
    	}
    }
	);
	this.body = {
    stat:'success'
  };
});
router.put('/',function *(next) {
	const param = qs.parse(this.request.body);
  param.date = new Date(param.date).getTime()/1000;
	var NewData = yield Meeting.create(param);
	this.body = {
		stat:'success'
	}
});
module.exports = router;