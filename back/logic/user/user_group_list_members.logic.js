// user group list members api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_group_list_members.logic';
var URLPATH = '/v1/user/group/members';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var groupModel = require('../../model/user_group_info');
var groupMemberModel =require('../../model/user_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

var refModel = {
    id: {
        data: 'id',
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
	
    var userList = inputData.userList;

	var resData = {
		id: inputData.id,
        size: userList.length,
        list:[],
	};
    for (var i = 0; i < userList.length; i++) {
        var user = userList[i];
        var data = {
            userId: user.userId,
            userName: user.userName,
            name: user.name,
            mobile: user.mobile,
            department: user.department,
        };
   
        resData.list.push(data);
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

	var groupId = param.id || '';
	debug('Try to list members of group:'+groupId);
    var userIds = [];
    var userList = [];
    async.series([
    	function(next){
    		//1. check whether the group exist
    		userLogic.checkUserGroupExist(param, function(err, data){
    			if (err) {
    				var msg = err.msg || err;
    				console.error(msg);
    				next(err);
    			}else{
    				if (!data.exist) {
    					var msg = 'Err: The group is not exist!';
    					console.error(moduleName+ msg);
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
    		var select = {
    			userId: 'userId',
    		};
            var match = {
                groupId: groupId,
                state:0,
            };
    		var query = {
    			select: select,
    			match: match,
    		};
    		groupMemberModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+': '+msg);
                    next(err);
                }else {

                    for (var i = 0; i < rows.length; i++) {
                        userIds.push(rows[i].userId);
                    }
                    next(null);
                }
            });
    	},
        function(next){
            if (userIds.length==0) {
                return next(null);
            }

            var sqlstr = 'select userId, userName, name, mobile, department from tb_user_info where userId in("';
            sqlstr += userIds.join('","');
            sqlstr+='");'
            userModel.query({sqlstr:sqlstr}, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+': '+msg);
                    next(err);
                }else{
                   userList = rows;
                   next(null);
                }
            });
        }
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to read members of group:'+groupId);
    		fn(err);
    	}else{
    		debug('Success to read members of group:'+groupId);
            var data = {
                id: groupId,
                userList: userList,
            };
    		var resData = packageResponseData(data);
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