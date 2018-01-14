// user create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_create.logic';
var URLPATH = '/v1/user/create';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var deviceModel = require('../../model/device_info');
var deviceGroupModel = require('../../model/device_group_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');
var userDeviceRModel = require('../../model/user_device_r_info');
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');


//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var refModel = {
	userName: {
		data: 'username',
		rangeCheck: null,
	},	
	// password: {
	// 	data: 'da234242',
	// 	rangeCheck: null,
	// },
	// gender:{
	// 	data: 1,
	// 	rangeCheck: null,
	// },
	password:{
		data: 'password',
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
	// groupId: {
	// 	data: 'groupid',
	// 	rangeCheck: null,
	// },
	usrEdit: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
	},
	pwdEdit: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
	},
	deviceOp: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
	},
	channelSet: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
	},
	wechatPush: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
	},
	createGroup: {
		data: 1,
		rangeCheck: function(data){
			return is.inArray(data, [0,1]);	
		}
	},
	logoFile: {
		data: 'logoFile',
		rangeCheck: null,
	}
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

function checkUserName(param, fn){
	var select = {
		userName: 'userName',
	};
	var match = {
		userName: param.userName || '',
	};

	var query = {
		select: select,
		match: match,
	};

	userModel.lookup(query, function(err, rows){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to check the userName duplicated!');
			fn(err);
		}else{
			if (rows.length) {
				console.error('duplicated userName:'+param.userName);
				fn({code: errorCode.USER_INVALID,
				    msg: 'duplicated userName!'});
			}else {
				fn(null);
			}
		}
	});
}

function createUser(param, fn){
	var values = logic_helper.createData({
			debug: debug,
			inputData: param,
			refModel: refModel,
		});
	
	values.userId = param.userId;

	var query = {
		fields: values,
		values: values,
	};
	userModel.create(query, function(err, rows){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create the user!'+msg);
			fn(err);
		}else {
			fn(null, values);
		}
	});
}

function findAllDevices(param,fn){
	var sqlstr = 'select deviceID,name from tb_device_info;'
	var query = {sqlstr:sqlstr,};
	deviceModel.query(query, function(err, rows){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to check the userName duplicated!');
			fn(err);
		}else{
			var result= [];
			for(var i=0;i<rows.length;i++){
				var tmp = JSON.parse(JSON.stringify(rows[i]));
				result.push(tmp);
			}
			console.log(result);
			fn(null,result);
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
	var userName = param.userName || param.name;
	var userId = dataHelper.createId(userName);
	
	param.userId = userId;
	var userType = param.userType;
	var groupId = param.groupId;
	var groupType = param.groupType;
	
	debug('Try to create the user:'+userId);
	var ids = [];

    async.waterfall([
    	function(next){
    		//1. check whether user is duplicated!
    		// checkUserName(param, next);
    		var select = {
				userName: 'userName',
			};
			var match = {
				userName: param.userName || '',
			};

			var query = {
				select: select,
				match: match,
			};

			userModel.lookup(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error('Failed to check the userName duplicated!');
					next(err);
				}else{
					if (rows.length) {
						console.error('duplicated userName:'+param.userName);
						next({code: errorCode.USER_INVALID,
						    msg: 'duplicated userName!'});
					}else {
						next(null,rows);
					}
				}
			});
    	},
    	function(tmp,next){
    		//2. create the new user!
			// createUser(param, next);
			var values = logic_helper.createData({
					debug: debug,
					inputData: param,
					refModel: refModel,
				});
			
			values.userId = param.userId;

			var query = {
				fields: values,
				values: values,
			};
			userModel.create(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error('Failed to create the user!'+msg);
					next(err);
				}else {
					next(null, rows);
				}
			});
    	},
    	function(tmp,next){
    		if(groupId=='1'){
    			findAllDevices(tmp,next);
    		}else{
    			var match = {
	    			groupId: groupId,
	    		};
	    		var select = {
	    			deviceId: ''
	    		};
	    		var query = {
	    			match: match,
	    			select: select,
	    		};
	    		deviceGroupMemModel.lookup(query,function(err,rows){
	    			if(err){next(err);}
	    			else{
	    				next(null,rows);
	    			}
	    		})
    		}
    	},
    	function(result,next){
    		var values = [];
    		if(groupId=='1'){
    			for(var i=0;i<result.length;i++){
	    			var id = dataHelper.createId(userId+result[i].deviceID);
	    			var value = {
	    				id: id,
	    				deviceId: result[i].deviceID,
	    				userType: userType,
	    				ugId: userId,
	    			}
	    			values.push(value);
	    		}
    		}else{
    			for(var i=0;i<result.length;i++){
	    			var id = dataHelper.createId(userId+result[i].deviceId);
	    			var value = {
	    				id: id,
	    				deviceId: result[i].deviceId,
	    				userType: userType,
	    				ugId: userId,
	    			}
	    			values.push(value);
	    		}
    		}
    		console.log(values);
    		var query = {
				fields: values[0],
				values: values,
			};
			userDeviceRModel.create(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error('Failed to create the user!'+msg);
					next(err);
				}else {
					next(null,rows);
				}
			});
    	},
    	function(result,next){
    		var id = dataHelper.createId(userId+groupId);
    		var value = {
    			id: id,
    			groupId: groupId,
    			groupType: groupType,
    			userId: userId,
    			userType: userType,
    			comment: 'privilege',
    		}
    		var query = {
				fields: value,
				values: value,
			};
			userDeviceGroupRModel.create(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
					console.error('Failed to create the user!'+msg);
					next(err);
				}else {
					next(null);
				}
			});
    	}
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to insert new user!'+userName);
    		fn(err);
    	}else{
    		debug('Success to create the new user:'+userName);
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