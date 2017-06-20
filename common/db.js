// mySql connection pool
// mySql connection pool
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */

var database =  (process.env.DB_ENV && 'wirecheck') || 'wirecheck';
var config = require('../config.json');

var mysql = require('mysql');
var pool  = mysql.createPool({
	host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.schema,
	connectionLimit: 20,
	queueLimit     : 100
});

module.exports = pool;
