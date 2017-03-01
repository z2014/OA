var fs = require('fs'),
    path = require('path'),
    extname = path.extname,
    router = require('koa-router')(),
    formParse = require('co-busboy'),
    Member = require('../models/member.js'),
    Validator = require('validator');

function stat(file) {
  return function(done) {
    fs.stat(file, done);
  };
}

router.get('/:stuid', function *(next) {
  const stuid = this.params.stuid;
  if (stuid && Validator.isNumeric(stuid)) {
    const member = yield Member.findOne({
      where: {
        stuid: stuid
      },
      attributes: ['isavatar']
    });
    if (member) {
      const fpath = path.join(__dirname, '../avatar/avatar_' +stuid+ member.isavatar);
      const fpath_bak = path.join(__dirname, '../avatar/avatar.png');
      try {
        var fstat = yield stat(fpath);
        if (fstat.isFile()) {
          this.type = extname(fpath);
          this.body = fs.createReadStream(fpath);
        } else {
          var fstat_bak = yield stat(fpath_bak);
          if (fstat_bak.isFile()) {
            this.type = extname(fpath_bak);
            this.body = fs.createReadStream(fpath_bak);
          }
        }
      } catch (err) {
        var fstat_bak = yield stat(fpath_bak);
        if (fstat_bak.isFile()) {
          this.type = extname(fpath_bak);
          this.body = fs.createReadStream(fpath_bak);
        }
      }
    } else {

    }
  } else {}
});

router.post('/', function *(next) {
  const parts = formParse(this);
  var part;
  while ((part = yield parts)) {
    // var filename = part.filename;
    var filePath = path.join(__dirname, '../avatar/' + 'test');
    var stream = fs.createWriteStream(filePath);
    part.pipe(stream);
    // console.log('uploading %s -> %s', part.filename, stream.path);
  }
  this.body = {
    success: 'false'
  }
});

module.exports = router;
