// device list all users  api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.10, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_list_users.logic';
var URLPATH = '/v1/device/list/users';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var deviceModel = require('../../model/device_info');
var wechatModel = require('../../model/wechat_info');
var userDeviceModel = require('../../model/user_device_r_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    deviceId: {
        data: 'deivce id',
        rangeCheck: null,
    },
    userId: {
        data: 'userId',
        rangeCheck:null,
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
        list: [],
	};

    for (var i = 0; i < inputData.length; i++) {
       var data = {
            userId: inputData[i].userId,
            userName: inputData[i].userName,
            nickname: inputData[i].nickname,
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

	var deviceId = param.deviceId || '';
    var userId = param.userId || '';
    var users = [];

	debug('Try to find the users for device:' + deviceId);

    async.waterfall([
        //0.check the device ID
        function(next){
            deviceHelper.checkDeviceExist({id: deviceId}, 
                function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + ', Err:'+msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        console.error(moduleName+', Err: The device is not exist');
                        next({
                            code: errorCode.NO_DATA_MATCH,
                            msg: 'The device is not exist!'
                        });
                    }else {
                        var device = data.device;
                        next(null, device);
                    }
                }
            });
        },
        //1find the user ids
        function(device, next){
            var match = {
                deviceId: deviceId,
                // userType: wxConstants.USERGROUPTYPE.USER,
                state: 0,
            };
            var select = {
                ugId: '',
            };
            var query = {
                select: select,
                match: match,
            };
            userDeviceModel.lookup(query, function(err, rows){
                if(err){
                    var msg = err.msg || err;
                    console.error(moduleName+' '+msg);
                    next(err);
                }else{
                    next(null, rows);
                }
            });
        },
        function(users, next){
            if (users.length==0) {
                next(null, []);
                return ;
            }
            var userIds = [];
            for (var i = 0; i < users.length; i++) {
                userIds.push(users[i].ugId);
            }
            var sqlstr = 'select userId,nickname from '+ wechatModel.tableName;
            sqlstr += ' where userId in ("';
            sqlstr += userIds.join('","');
            sqlstr += '");';
            // sqlstr += '") and userId != "'+userId+'";';
            var query = {
                sqlstr: sqlstr,
            };
            userModel.query(query,function(err, rows){
                if(err){
                    var msg = err.msg || err;
                    console.error(moduleName+' '+msg);
                    next(err);
                }else{
                    var data = [];
                    for(var i=0;i<rows.length;i++){
                        data.push ( {
                            userId: rows[i].userId,
                            nickname: rows[i].nickname,
                            userName: '',
                        });
                    }
                    next(null, data);
                }
            });
        },
        function(data, next){
            if (data.length==0) {
                next(null, []);
                return ;
            }
            var userIds = [];
            for (var i = 0; i < data.length; i++) {
                userIds.push(data[i].userId);
            }
            var sqlstr = 'select userId, userName from '+ userModel.tableName;
            sqlstr += ' where userId in ("';
            sqlstr += userIds.join('","');
            sqlstr += '");';
            // sqlstr += '") and userId != "'+userId+'";';
            var query = {
                sqlstr: sqlstr,
            };
            userModel.query(query, function(err, rows){
                if(err){
                    var msg = err.msg || err;
                    console.error(moduleName+' '+msg);
                    next(err);
                }else{
                    for(var i=0;i<rows.length;i++){
                        data[i].userName = rows[i].userName;
                    }
                    next(null, data);
                }
            });
        },
    ], 
    function(err, users){
    	if (err) {
    		console.error('Failed to find the users of device'+deviceId);
    		fn(err);
    	}else{
    		debug('Success to find the users of device'+deviceId);
    		var resData = packageResponseData(users);
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