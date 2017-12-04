// user delete api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_delete.logic';
var URLPATH = '/v1/user/delete';

//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

//model 
var userModel = require('../../model/user_info');
var userDeviceRModel = require('../../model/user_device_r_info');
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');
var wechatModel = require('../../model/wechat_info');


//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');


var refModel = {
	list: {
		data: [],
		rangeCheck: null,
	},
};


function validate(data){
	if(!data){
		return false;
	}

	return logic_helper.validate({
		debug: debug,
		moduleName: moduleName,
		refModel: refModel,
		inputModel: data,
	});
}

function packageResponseData(inputData){
	if(!inputData){
		return {};
	}
	
	var resData = {
		userId: inputData,
	};
	return resData;
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var list = param.list || [];
	
	debug('Try to delelte user whose userId = '+list[0]);

	async.series([
		function(next){
			var sqlstr = 'delete from '+userModel.tableName+' where userId in ("';
                sqlstr += list.join('","');
                sqlstr +='");';
			var query = {
				sqlstr: sqlstr,
			};

			userModel.query(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error(moduleName+'Failed to get the group member for'+msg);
					next(err);
				}else{
					next(null);
				}
			});
		},
		function(next){
			var sqlstr = 'delete from '+wechatModel.tableName+' where userId in ("';
                sqlstr += list.join('","');
                sqlstr +='");';
			var query = {
				sqlstr: sqlstr,
			};

			wechatModel.query(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error(moduleName+'Failed to get the group member for'+msg);
					next(err);
				}else{
					next(null);
				}
			});
		},
		function(next){
			var sqlstr = 'delete from '+userDeviceGroupRModel.tableName+' where userId in ("';
                sqlstr += list.join('","');
                sqlstr +='");';
			var query = {
				sqlstr: sqlstr,
			};

			userDeviceGroupRModel.query(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error(moduleName+'Failed to get the group member for'+msg);
					next(err);
				}else{
					next(null);
				}
			});
		},
		function(next){
			var sqlstr = 'delete from '+userDeviceRModel.tableName+' where ugId in ("';
                sqlstr += list.join('","');
                sqlstr +='");';
			var query = {
				sqlstr: sqlstr,
			};

			userDeviceRModel.query(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error(moduleName+'Failed to get the group member for'+msg);
					next(err);
				}else{
					next(null);
				}
			});
		},			
	], 
	function(err){
		if (err) {
			console.error('Failed to update the user model for user:'+list[0]);
			fn(err);
		}else{
			debug('Success to delelte user id ='+list[0]);
			var resData = packageResponseData(list[0]);
			fn(null, resData);
		}

	});
}

//post interface
router.post(URLPATH, function (req, res, next){
    var param = req.body;

    logic_helper.responseHttp({
    	res: res,
    	req: req,
    	next: next,
    	moduleName: moduleName,
    	processRequest: processRequest,
    	debug : debug,
    	param: param,    	
    });
});

//get interface for mocha testing
function getCallback(req, res, next){
    var param = req.query;
 
    logic_helper.responseHttp({
    	res: res,
    	req: req,
    	next: next,
    	moduleName: moduleName,
    	processRequest: processRequest,
    	debug : debug,
    	param: param,    	
    });
}

router.get(URLPATH, getCallback);

module.exports.router = router;
