// device defend policy details api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.10, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_defend_details.logic';
var URLPATH = '/v1/device/defend/details';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var alertModel = require('../../model/alert_disable_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('../device/device.logic');
var deviceMonitorHelper = require('./device_monitor.logic');


var refModel = {
	id: {
		data: 'level or device id',
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
        deviceId: inputData.deviceId,
        fullDisable: inputData.disableAlert,
        size: inputData.alerts.length,
        list:[],
	};
    var alerts = inputData.alerts;
    for (var i = 0; i < alerts.length; i++) {
        var alert = {
            dayOfWeek: alerts[i].dayOfWeek,
            startHour: alerts[i].startHour,
            startMinute: alerts[i].startMinute,
            endHour: alerts[i].endHour,
            endMinute: alerts[i].endMinute,
        }
        resData.list.push(alert); 
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

    var id = param.id;

	debug('Try to find defend policy for device '+id);

    async.waterfall([
        //1. check device exist
    	function(next){
            deviceHelper.checkDeviceExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        console.error(moduleName+', Err: The device is not exist');
                        next({
                            code: errorCode.NO_DATA_MATCH,
                            msg: 'The device is not exist!'
                        });
                    }else {
                        next(null, data.device);
                    }
                }
            });
    	},
        //2 find the device ids
        function(device, next){
            device.deviceId = param.id;
           if (device.disableAlert 
               == wxConstants.DEVICEDEFENDSET.DISABLEYES) {
                device.alerts = [];
                next(null, device);
           }else {
                var select =alertModel.refModel;
                var match = {
                    deviceId: param.id,
                };
                var query ={
                    select: select,
                    match: match,
                };
                alertModel.lookup(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+', err:'+msg);
                        next(err);
                    }else{
                        device.alerts = rows;
                        next(null, device);
                    }
                });
           }
        },
    ], 
    function(err, device){
    	if (err) {
    		console.error('Failed to find device defend policy details!'+id);
    		fn(err);
    	}else{
    		debug('Success to find device defend policy details:'+id);
    		var resData = packageResponseData(device);

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