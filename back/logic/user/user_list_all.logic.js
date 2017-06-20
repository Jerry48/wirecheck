// user list all users api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.12, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_list_all.logic';
var URLPATH = '/v1/user/all';

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
var userDeviceGroupModel = require('../../model/user_device_group_r_info');
var deviceGroupModel = require('../../model/device_group_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

var refModel = {
    userId:{
        data: 'userId',
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
        size: inputData.length,
        list:[],
	};
    for (var i = 0; i < inputData.length; i++) {
        var data = {};
        data.userId = inputData[i].userId;
        data.userName = inputData[i].userName;
        data.mobile = inputData[i].mobile;
        data.name = inputData[i].name;
        data.userType = inputData[i].userType;
        data.department = inputData[i].department;
        data.groupId = inputData[i].groupId;
        data.groupName = inputData[i].groupName;
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

	debug('Try to get all the users!');
    var users = [];
    var ids = [];
    async.waterfall([
    	function(next){
    	   var select = {
            userId: 'userId',
            userName: 'userName',
            mobile: 'mobile',
            name: 'name',
            department: 'department',
            userType: 0,
           };
           var match = {
            state: 0,
           };
           var query = {
            select:select,
            match: match,
           };
           userModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+err);
                    next(err);
                }else{
                    for(var i=0;i<rows.length;i++){
                        users[i] = {
                            userId: rows[i].userId,
                            userName: rows[i].userName,
                            mobile: rows[i].mobile,
                            name: rows[i].name,
                            department: rows[i].department,
                            userType: rows[i].userType,
                            groupId: '',
                            groupName: '',
                        }
                   }
                    next(null,users);
                }
           });
    	},
        function(data,next){
            for(var i=0;i<data.length;i++){
                ids.push(data[i].userId);
            }
            var sqlstr = 'select groupId,userId from '+userDeviceGroupModel.tableName+' where userId in("';
            sqlstr += ids.join('","');
            sqlstr+='") and groupType = 0;'
            userDeviceGroupModel.query({sqlstr:sqlstr}, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+': '+msg);
                    next(err);
                }else{
                    console.log(rows);
                   for(var i=0;i<rows.length;i++){
                        for(var j=0;j<data.length;j++){
                            if(rows[i].userId==data[j].userId)
                            {
                                data[j].groupId = rows[i].groupId;
                            }
                        }
                        
                   }
                   next(null,data);
                }
            });
        },
        function(data,next){
            for(var i=0;i<data.length;i++){
                ids.push(data[i].groupId);
            }
            var sqlstr = 'select id,name from '+deviceGroupModel.tableName+' where id in("';
            sqlstr += ids.join('","');
            sqlstr+='");'
            deviceGroupModel.query({sqlstr:sqlstr}, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+': '+msg);
                    next(err);
                }else{
                   for(var i=0;i<rows.length;i++){
                        for(var j=0;j<data.length;j++){
                            if(rows[i].id==data[j].groupId)
                            {
                                data[j].groupName = rows[i].name;
                            }
                        }
                        
                   }
                   next(null,data);
                }
            });
        },
    ], 
    function(err,users){
    	if (err) {
    		console.error('Failed to get all the users!');
    		fn(err);
    	}else{
    		debug('Success to get all the users!');           
    		var resData = packageResponseData(users);
			fn(null, resData);
    	}
    });	
}

//get interface for mocha testing
function getCallback(req, res, next){
    var param = req.query;
    debug(moduleName+ 'query data is: %j ', param);

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