// user logout api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'report_device_heart_beat.logic';
var URLPATH = '/v1/device/klHeartBeat';

//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

//model 
var towerModel = require('../model/tower_info');
var heartBeatModel = require('../model/heart_beat_info');
var heartBeatLogModel = require('../model/heart_beat_log');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var refModel = {
	deviceId: {
		data: 'deviceId',
		rangeCheck: null,
	},	
	batteryVoltage: {
		data: 1,
		rangeCheck: null,
	},
	chargeVoltage:{
		data: 1,
		rangeCheck: null,
	},
	temperature: {
		data: 1,
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

function findDevice(param, fn){
	var deviceId = param.deviceId||'';
	
	var select = {
		id: 'device id',
		name: 'device name'
	};
	var match = {
		mac: deviceId,
	};
	var query = {
		select: select,
		match: match,
	};

	var towerModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to search the device:'+deviceId);
			fn(err);
		}else {
			var device = rows[0];
			if (rows.length==0) {
				console.error('No matched device:'+deviceId);
				fn({code:errorCode.DB_NO_MATCH_DATA, 
					msg: 'No this data'});
			}else {
				fn(null, device);
			}					
		}
	});
}
function packageResponseData(inputData){
	if(!inputData){
		return {};
	}
	
	var resData = {

	};
	return resData;
}

function updateHeartBeatStatus(param, fn){
	var update = {
		batteryVoltage: param.batteryVoltage || 0,
		chargeVoltage: param.chargeVoltage || 0,
		temperature: param.temperature || 0,
	};
	var match = {
		id: param.id||'',
	};
	var query = {
		update: update,
		match: match,
	};
	heartBeatModel.update(query, function(err, rows){
		if (err) {
			console.error('Failed to update the heart_beat_info');
			fn(err);
		}else{
			fn(null, param);
		}
	});
}

function createHeartBeatLog(param, fn){
	var seed = param.id + param.name + param.batteryVoltage
		+ param.chargeVoltage + param.temperature;

	var values = {
		id: dataHelper.createId(seed),
		tId: param.id,
		tName: param.name,
		batteryVoltage: param.batteryVoltage || 0,
		chargeVoltage: param.chargeVoltage || 0,
		temperature: param.temperature || 0,
	};
	var query = {
		fields: values,
		values: values,
	};
	heartBeatLogModel.create(query, function(err, rows){
		if (err) {
			console.error('Failed to create the heart_beat_log');
			fn(err);
		}else{
			fn(null, param);
		}
	});
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var deviceId = param.deviceId || '';
	debug('Device '+deviceId+' Report the status!');

	async.waterfall([
		function(next){
			findDevice(param, next);
		},
		function(device, next){
			param.id = device.id;
			param.name = device.name;
			updateHeartBeatStatus(param, next);
		},
		function(device, next){
			createHeartBeatLog(param, next);
		}
	], function(err, device){
		if (err) {
			console.error('Failed to report the status for device:'+deviceId);
			fn(err);
		}else{
			debug('Success to report the status for device:'+deviceId);
			var resData = packageResponseData(param);
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