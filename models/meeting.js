const Sequelize = require('sequelize');
var db = require('../db.js');
var Meeting = db.define('oa_meeting',{
	id: {
		type:Sequelize.INTEGER,
		primaryKey:true,
		unique:true
	},
  date:Sequelize.INTEGER,
  meeting:Sequelize.STRING(30),
  role:Sequelize.STRING(10),
  status:Sequelize.STRING(10),
  owner:Sequelize.STRING(10),
  people:Sequelize.STRING(100),
  text:Sequelize.STRING(100),
  depart:Sequelize.STRING(10)
},{
  timestamps: false,
  freezeTableName: true
});
module.exports = Meeting;