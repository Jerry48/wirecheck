// mySql connection pool
// mySql connection pool
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */

var database =  (process.env.DB_ENV && 'wirecheck') || 'wirecheck';

var mysql = require('mysql');
var pool  = mysql.createPool({
	host     : 'localhost',
	user     : 'ccflab',
	password : 'CCFLabSJTUB06',
	database       : database,
	connectionLimit: 20,
	queueLimit     : 30
});

module.exports = pool;
