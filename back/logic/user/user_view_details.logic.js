// get the user details api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_view_details.logic';
var URLPATH = '/v1/user/details';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

var refModel = {
	userName: {
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
        userName: inputData.userName,
        gender: inputData.gender,
        mobile: inputData.mobile,
        password: inputData.password,
        name: inputData.name,
        department: inputData.department,
        userType: inputData.userType,
        usrEdit: inputData.usrEdit,
        pwdEdit: inputData.pwdEdit,
        deviceOp: inputData.deviceOp,
        channelSet: inputData.channelSet,
        wechatPush: inputData.wechatPush,
        createGroup: inputData.createGroup,
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

	var userName = param.userName || '';

	debug('Try to view details for user:'+userName);

    async.waterfall([
    	function(next){
    		//1. check whether the user exist
    		userLogic.checkUserExist(param, function(err, data){
    			if (err) {
    				var msg = err.msg || err;
    				console.error(msg);
    				next(err);
    			}else{
    				if (!data.exist) {
    					var msg = 'The user is not exist';
    					console.error(msg);
    					next({
    						code: errorCode.DB_NO_MATCH_DATA,
    						msg: msg,
    					});
    				}else {
    					next(null, data.user);
    				}
    			}
    		});
    	},
    ], 
    function(err, user){
    	if (err) {
    		console.error('Failed to read user for'+userName);
    		fn(err);
    	}else{
    		debug('Success to read user for:'+userName);
    		var resData = packageResponseData(user);
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