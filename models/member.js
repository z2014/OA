const Sequelize = require('sequelize');
var db = require('../db.js');
var Member = db.define('oa_member', {
  stuid: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true
  },
  name: Sequelize.STRING(50),
  depart: Sequelize.INTEGER,
  email: Sequelize.STRING(30),
  phone: Sequelize.CHAR(11),
  qq: Sequelize.STRING(15),
  debitcard: Sequelize.CHAR(20),
  pwd: Sequelize.CHAR(32),
  role: Sequelize.INTEGER,
  join_time: Sequelize.INTEGER,
  regip: Sequelize.STRING(15),
  campus: Sequelize.INTEGER,
  salt: Sequelize.CHAR(6),
  isavatar: Sequelize.INTEGER
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = Member;