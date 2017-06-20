//  user Logic helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */

 'use strict';

var moduleName = 'user.logic';
var debug = require('debug')(moduleName);

var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var groupModel = require('../../model/user_group_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

function checkUserExist(params, fn) {
	var userId = params.userId || params.id ;
	var userName = params.userName;
	var match = {};

	//set the match
	if (userId) {
		match.userId = userId;
	}else {
		match.userName = userName;
	}

	var select = userModel.dataModel;	
	var query = {
		select: select,
		match: match,
	};

	userModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to check the user!');
			fn(err);
		}else {
			var data = {};

			if (rows.length==0)
			{
				debug('Cannot find the user, %j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.user = rows[0];
				fn(null, data);
			}
		}
	});
}

function checkUserGroupExist(params, fn){
	var groupId = params.groupId || params.id;
	var name = params.name;
	var match = {};
	if (groupId) {
		match.id = groupId;
	}else{
		match.name = name;
	}

	var select = groupModel.dataModel;
	var query = {
		select: select,
		match: match,
	};
	groupModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to check the group!');
			fn(err);
		}else {
			var data = {};

			if (rows.length==0)
			{
				debug('Cannot find the group:%j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.group = rows[0];
				fn(null, data);
			}
		}
	});
}

module.exports.checkUserExist = checkUserExist;
module.exports.checkUserGroupExist = checkUserGroupExist;
