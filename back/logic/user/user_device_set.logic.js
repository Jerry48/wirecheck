// administrator set user device access right api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_device_set.logic';
var URLPATH = '/v1/user/device/set';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var deviceModel = require('../../model/device_info');
var userDeviceRModel = require('../../model/user_device_r_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

var refModel = {
	userId: {
		data: 'userId',
		rangeCheck: null,
	},
    list:{
        data: [],
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
		userId: inputData,
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

	var userId = param.userId || '';

	debug('Try to set device access right for user:'+userId);

    async.series([
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
    					next(null);
    				}
    			}
    		});
    	},
        function( next){
            //3. create the new device access right map
            var deviceList = param.list || [];
            var values = [];
            for (var i = 0; i < deviceList.length; i++) {
                var value = {};
                var deviceId = deviceList[i].deviceId;
                var seed= userId + deviceId;
                
                value.id = dataHelper.createId(seed);
                value.deviceId = deviceId;
                value.ugId = userId;
                value.userType = wxConstants.USERGROUPTYPE.USER;
                value.privilege = wxConstants.USERDEVICEPRIVILEGE.ACCESSRIGHT;
                values.push(value);
            }
            var query = {
                fields: values[0],
                values: values,
            };
            userDeviceRModel.create(query, next);
        }
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to read user for'+userId);
    		fn(err);
    	}else{
    		debug('Success to read user for:'+userId);
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