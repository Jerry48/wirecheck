// user edit api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_info_search.logic';
var URLPATH = '/v1/user/info/search';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var userGroupModel = require('../../model/user_group_info');
var groupMemberModel = require('../../model/user_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

var refModel = {
	search:{
		data: 'search',
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
	
	var userList = [];
	var groupList = [];

	var resData = {
		userList: userList,
		groupList: groupList
	};

	for (var i = 0; i < inputData.userList.length; i++) {
        var data = inputData.userList[i];
        var value = {
            userId: data.userId,
            userName: data.userName,
            name: data.name,
            mobile: data.mobile,
            department: data.department,
        };

        resData.userList.push(value);
    }

    for (var i = 0; i < inputData.groupList.length; i++) {
        var data = inputData.groupList[i];
        var value = {
            name: data.name,
            id: data.id,
        };

        resData.groupList.push(value);
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

	var search = param.search || '';

	debug('Try to search the user info:' + search);

	var result = {};

    async.waterfall([
    	function(next){
    		var sqlstr = "select * from "+ userModel.tableName + " where (name like \"%"+search+"%\" or mobile like \"%"+search+"%\" or department like \"%"+search+"%\")";
    		sqlstr += " and (userType = 0)";
    		var query = {
    			sqlstr: sqlstr
    		}
			userModel.query(query,function(err,rows){
				if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                	result.userList = rows;
                    next(null,result);                		
                }
			})
    	},
    	function(result,next){
    		var sqlstr = "select * from "+ userGroupModel.tableName + " where name like \"%"+search+"%\"";
    		var query = {
    			sqlstr: sqlstr
    		}
			userGroupModel.query(query,function(err,rows){
				if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                	result.groupList = rows;
                    next(null,result);                		
                }
			})
    	},
    ], 
    function(err,result){
    	if (err) {
    		console.error('Failed to search user info!'+search);
    		fn(err);
    	}else{
    		debug('Success to search user info!'+search);
    		var resData = packageResponseData(result);
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