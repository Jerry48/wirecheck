// user edit api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_edit.logic';
var URLPATH = '/v1/user/edit';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

var refModel = {
	userId:{
		data: 'id',
		rangeCheck: null,
	},
	userName: {
		data: 'username',
		rangeCheck: null,
	},	
	password: {
		data: 'password',
		rangeCheck: null,
	},
	// gender:{
	// 	data: 1,
	// 	rangeCheck: null,
	// },
	mobile:{
		data: 'mobile',
		rangeCheck: null,
	},
	name: {
		data: 'name',
		rangeCheck: null,
	},
	department: {
		data: 'department',
		rangeCheck: null,
	},
	userType: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
	},
	groupId: {
		data: 'groupId',
		rangeCheck: null,
	},
};

var editModel = {
	userName: {
		data: 'username',
		rangeCheck: null,
	},	
	password: {
		data: 'password',
		rangeCheck: null,
	},
	gender:{
		data: 1,
		rangeCheck: null,
	},
	mobile:{
		data: 'mobile',
		rangeCheck: null,
	},
	name: {
		data: 'name',
		rangeCheck: null,
	},
	department: {
		data: 'department',
		rangeCheck: null,
	},
	userType: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
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
		userId: inputData.userId,
	};
	return resData;
}

function editUser(param, fn){
	var values = logic_helper.parseEditData({
			debug: debug,
			inputData: param,
			editModel: editModel,
		});
	var match = {
		userId: param.userId,
	};
	var query = {
		update: values,
		match: match,
	};
	userModel.update(query, function(err, rows){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to edit the user!'+msg);
			fn(err);
		}else {
			fn(null);
		}
	});
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var userId = param.userId || '';
	var groupId = param.groupId || '';
	debug('Try to edit the user:'+userId);

    async.series([
    	function(next){
    		//1. check whether the user exist
    		userLogic.checkUserExist(param, function(err, data){
    			if (err) {
    				var msg = err.msg || err;
    				console.error(msg);
    				next(err);
    			}else{
    				if (!data.exist) 
    				{
    					var msg = 'The user is not exist';
    					console.error(msg);
    					next({
    						code: errorCode.DB_NO_MATCH_DATA,
    						msg: msg,
    					});
    				}else {
    					next(null);
    				}
    			}
    		});
    	},
    	function(next){
    		//2. edit the  user!
			editUser(param, next);
    	},
    	function(next){
    		var sqlstr = "delete from "+userDeviceGroupRModel.tableName+" where userId = '"+userId+"'";
    		var query = {
    			sqlstr: sqlstr,
    		}
    		userDeviceGroupRModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Err:'+msg);
                    next(err);
                }else{
                    next(null);
                }
            });
    	},
    	function(next){
    		var id = dataHelper.createId(param.userId +param.deviceID);
    		var values = {
    			id: id,
    			groupId: groupId,
    			userType: 0,
    			groupType: 0,
    			userId: userId,
    			comment: 'privilege',
    		}
    		var query = {
		        fields: values,
		        values: values,
		    };
    		userDeviceGroupRModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Err:'+msg);
                    next(err);
                }else{
                    next(null);
                }
            });
    	},
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to edit user!'+userId);
    		fn(err);
    	}else{
    		debug('Success to edit the user:'+userId);
    		var resData = packageResponseData(userId);
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