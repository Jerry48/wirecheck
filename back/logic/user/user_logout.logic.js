// user logout api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_logout.logic';
var URLPATH = '/v1/user/logout';

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

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');


var refModel = {
	userId: {
		data: 'username',
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

	var userId = param.userId ||'';
	
	debug('Try to logout for userId:'+userId);

	var update = {
		loginState: wxConstants.LOGINSTATE.LOGOUT, 
	};
	var match = {
		userId: userId,
	};
	var query = {
		update:update,
		match:match,
	};
	userModel.update(query, function(err, rows){
		if (err) {
			console.error('Failed to update the user model for user:'+userId);
			fn(err);
		}else{
			debug('Success to logout!');
			var resData = packageResponseData(userId);
			fn(null, resData);
		}
	});
}

//post interface
router.post(URLPATH, function (req, res, next){
    var param = req.body;

    var json = {};
    
	req.session = null;
    
    try{
		processRequest(param, function(err, result){
		 	if (err) {
		 		var code = err.code || 1;
		 		var message = err.msg || err;
		 		console.error(moduleName + ' data process failed: %j', message);
		 			
		 		json.code = code; //0-success, 1-fail, 2-timeout, 3-need login
		 		json.message = message;
		 		json.result = {};
		 	}else {
		 		debug(moduleName + ' data process success: %j', result);
		 		json.code = 0;
		 		json.message = 'CCFLab@SJTUServerMessagezctest';
		 		json.result = result || {}; //accept the empty result

		 		var match = {userId:param.userId};
		 		var update = {sessionId: '0'};
		 		var query = {
		 			match:match,
		 			update:update,
		 		};
		 		userModel.update(query, function(err, result) {});
		 	}

		 	res.json(json);
		 });
    }catch(e){
 		console.error(moduleName +", responseHttp:" +e);	 			
	 	json.code = 404; //0-success, 1-fail, 2-timeout, 3-need login
	 	json.message = e.toString();
	 	json.result = {};
		res.json(json);
    }
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
