// user login api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_check.logic';
var URLPATH = '/v1/user/check';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var session = require('../../model/session');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');

var refModel = {
	userName: {
		data: 'username',
		rangeCheck: null,
	},	
	password: {
		data: 'da234242',
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
		userId: inputData.userId,
		userType: inputData.userType,
		userName: inputData.userName,
	};
	return resData;
}

function processRequest(param,fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

    async.waterfall([
    	function(next){
		//1.1. set the data
			var select = {
				userId: '',
				password: '',
				portrait:'',
				userName:'',
			};
			var match = {
				userName: param.userName || '',
				userType: 1,
			}; 
			var query = {
				select: select, 
				match: match,
			};
			//2. check whether this user exist and the passwd
			userModel.lookup(query, function(err, user_result) {
				if(err){					
					console.error('Failed to check the user: %j',  err);
					return next(err);
				}else{
					if(user_result.length==0){
						var msg = ' No this user';
						console.error(moduleName+ msg);
						return next({code: errorCode.USER_INVALID, 
							msg: 'Invalid user name or password'});
					}

					var user = user_result[0];

					//2.1 check the password
					var password = user.password;
					//we may use other way to verify the password
					if(password !== param.password){
						var msg = 'Invalid password';
						console.error(moduleName+ msg);
						return next({code: errorCode.USER_INVALID, 
							msg: 'Invalid user name or password'});
					}else {
						next(null, user);
					}
				}
			});
    	},
    ], 
    function(err, user){
    	if (err) {
    		fn(err);
    	}else{
    		var resData = packageResponseData(user);
			fn(null, resData);
    	}
    });
	
}

//post interface

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