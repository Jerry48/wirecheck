// get the user details api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_info_by_session.logic';
var URLPATH = '/v1/user/info/session';

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
	sessionId: {
		data: 'sessionId',
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
	if(inputData==0){
		var resData = {
			flag: 0,
		}
	}else{
		var tmp = inputData.split('\"');

        if(tmp[38] != undefined){
            var resData = {
                userId: tmp[31],
                userName: tmp[35],
                userType: tmp[38].slice(1,2),
            };
        }else{
            var resData = {
                flag: 0,
            }
        }
	}
	
	return resData;
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var sessionId = param.sessionId || '';

	debug('Try to view details for user:'+sessionId);

    async.waterfall([
    	function(next){
    		//1. check whether the user exist
    		var sqlstr = 'select * from sessions where session_id = "'+sessionId+'";';
    		var query = {sqlstr:sqlstr,};
    		userModel.query(query, function(err, rows) {
    			if(err){next(err);}else{
    				if(rows.length==0){
    					next(null,0);
    				}else{
    					console.log(rows[0].data);
    					next(null,rows[0].data);
    				}
    				
    			}
    		});
    	},
    ], 
    function(err, user){
    	console.log(user);
    	if (err) {
    		console.error('Failed to read user for'+sessionId);
    		fn(err);
    	}else{
    		debug('Success to read user for:'+sessionId);
            console.log(user);
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