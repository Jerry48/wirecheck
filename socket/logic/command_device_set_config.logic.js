// device create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'command_device_set_config.logic';
var URLPATH = '/v1/device/setdevice';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var socketHelper = require('./socket_device_commands.logic');

var refModel = {
	deviceId: {
		data: 'parent level id',
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
        id: inputData.id,
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

    var deviceId = param.deviceId || '';
    param.photoInterval = 15;
    param.deviceWorkBeginTime = new Date('2010-01-01 08:00:00');
    param.deviceWorkEndTime = new Date('2010-01-01 20:00:00');
    console.log(param);
	debug('Try to set the device ' + deviceId);

    socketHelper.setDevice(param, function(err){
    	if (err) {
    		console.error('Failed to set the device ' + deviceId);
    		fn(err);
    	}else{
    		debug('Success to set the device ' + deviceId);
    		var resData = packageResponseData(deviceId);
			fn(null, resData);
    	}
    });	
}


//post interface
router.post(URLPATH, function (req, res, next){
    var param = req.body;
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
});

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