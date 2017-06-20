// device view status api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_view_status.logic';
var URLPATH = '/v1/device/klViewStatus';

//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var db = require('../../../common/db');

//model 
var deviceModel = require('../../model/device_info');
var deviceStatusModel = require('../../model/device_status_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');


var refModel = {
	deviceId: {
		data: 'device id',
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
	var device = inputData.device;
	var status = inputData.status;
	var resData = {
		deviceId: device.id,
		deviceName: device.name,
		batteryVoltage: status.batteryVoltage,
		chargeVoltage: status.chargeVoltage,
		temperature: status.temperature,
		alert: status.alert,
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
		
	debug('Try to read status of device:'+deviceId);

	async.waterfall([
		function(next){
			deviceHelper.checkDeviceExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                    	var msg = ' Err: The device is not exist';
                        console.error(moduleName+msg);
                        next({code: errorCode.NO_DATA_MATCH, msg: msg});
                    }else {
                       var device = data.device;
                        next(null, device);
                    }
                }
            });
		},
		function(device, next){
			var match = {
				id: deviceId,
			};
			var query = {
				select: deviceStatusModel.dataModel,
				match: match,
			};
			deviceStatusModel.lookup(query, function(err, rows){
				if (err) {
					var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
				}else{
					if (rows.length==0) {
						var msg = ' Err: no this data!';
						console.error(moduleName+msg);
                        next({code: errorCode.NO_DATA_MATCH, msg: msg});
					}else{
						var deviceStatus = {
							device: device,
							status: rows[0],
						};
						next(null, deviceStatus);
					}
				}
			});
		},
	], 
	function(err, deviceStatus){
		if (err) {
			console.error('Failed to find device status for device:'+deviceId);
			fn(err);
		}else{
			debug('Success to find device status for device:'+deviceId);
			var resData = packageResponseData(deviceStatus);
			fn(null, resData);
		}
	});
}

//post interface
router.post(URLPATH, function (req, res, next){
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    debug('req.body:%j', req.body);

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
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    //debug('req.body:%j', req.body);

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