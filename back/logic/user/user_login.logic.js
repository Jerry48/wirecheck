// user login api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_login.logic';
var URLPATH = '/v1/user/login';

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
	
	var portraitUrl = wxConstants.SERVER.FILESERVER + inputData.portrait;
	var resData = {
		userId: inputData.userId,
		userType: inputData.userType,
		sessionId: inputData.sessionId,
		portrait: portraitUrl,
		userName: inputData.userName,
		name: inputData.name,
	};
	return resData;
}

function processRequest(param,sessionId,fn){
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
			userType: 0,
			loginState: 0,
			userName:'',
		};
		var match = {
			userName: param.userName || '',
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
				}else if(user.loginState == wxConstants.LOGINSTATE.LOGIN){
					var msg = 'Err: User has login in other place!';
					console.error(moduleName+ msg);
					//return next({code: errorCode.USER_INVALID_LOGINSTATE, msg: msg});
					next(null, user);
				}else {
					next(null, user);
					console.log(user);
				}
			}
		} );
    	},
    	function(user, next){
    		console.log(user);
    		var update = {
    			loginState: wxConstants.LOGINSTATE.LOGIN
    		};
    		var match = {
				userName: param.userName || '',
			}; 
    		var query = {
    			match:match,
    			update: update,
    		};
    		userModel.update(query, function(err, rows){
    			if (err) {
    				console.error('Failed to update the user login state');
    				next(err);
    			}else {
    				user.sessionId = sessionId;
    				next(null, user);
    				console.log(user);
    			}
    		});
    	}
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
router.post(URLPATH, function (req, res, next){
    var param = req.body;
    var sessionId = req.session.id;
    console.log(req);

    var json = {};
    try{
		processRequest(param,sessionId,function(err, result){
		 	if (err) {
		 		var code = err.code || 1;
		 		var message = err.msg || err;
		 		console.error(moduleName + ' data process failed: %j', message);
		 			
		 		json.code = code; //0-success, 1-fail, 2-timeout, 3-need login
		 		json.message = message;
		 		json.result = {};
		 	}else {
		 		debug('Data process success: %j', result);
		 		json.code = 0;
		 		json.message = 'CCFLab@SJTUServerMessage';
		 		json.result = result || {}; //accept the empty result
		 		
		 		req.session.sessionId = sessionId;
		 		req.session.auth = true;
		 		req.session.userId = result.userId;
		 		req.session.userInfo = {
		 			userId:result.userId,
		 			userName:result.userName,
		 			userType:result.userType,
		 		};
		 		var match = {userId:result.userId};
		 		var update = {sessionId: req.session.id};
		 		var query = {
		 			match:match,
		 			update:update,
		 		};
		 		userModel.update(query, function(err, result) {});
		 	}

		 	res.json(json);
		 	// console.log(res);
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