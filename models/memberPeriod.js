const Sequelize = require('sequelize');
var db = require('../db.js');
var MemberPeriod = db.define('oa_period', {
  stuid: Sequelize.INTEGER,
  period: Sequelize.INTEGER,
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = MemberPeriod;