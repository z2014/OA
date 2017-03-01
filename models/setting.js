const Sequelize = require('sequelize');
var db = require('../db.js');
var MemberPeriod = db.define('oa_setting', {
  name: {
    type: Sequelize.STRING(50),
    unique: true,
    primaryKey: true
  },
  value: Sequelize.STRING(250),
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = MemberPeriod;