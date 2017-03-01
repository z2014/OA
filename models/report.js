const Sequelize = require('sequelize');
var db = require('../db.js');
var Member = db.define('oa_report', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true
  },
  stuid: Sequelize.INTEGER,
  start_date: Sequelize.INTEGER,
  end_date: Sequelize.INTEGER,
  content: Sequelize.TEXT,
  suggestion: Sequelize.TEXT,
  comment: Sequelize.STRING(500),
  rate: Sequelize.FLOAT,
  salary_sug: Sequelize.INTEGER,
  salary: Sequelize.INTEGER,
  time_report: Sequelize.INTEGER,
  ip: Sequelize.STRING(30),
  status: Sequelize.INTEGER
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = Member;