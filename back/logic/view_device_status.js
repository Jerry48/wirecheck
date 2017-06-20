// user logout api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'view_device_status.logic';
var URLPATH = '/v1/device/klViewStatus';

//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

//model 
var towerModel = require('../model/tower_info');
var lineModel = require('../model/line_info');
var deviceStatusModel = require('../model/heart_beat_info');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');


var refModel = {
	lineName: {
		data: 'line name',
		rangeCheck: null,
	},	
	deviceName: {
		data: 'device name',
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
	var token = dataHelper.createUserTokenId({userId: inputData.userId});

	var resData = {
		token: token,
		userId: inputData.userId,
		rongyunToken: inputData.rongyunToken,
	};
	return resData;
}

function findLine(param, fn){
	var lineName = param.lineName || '';

	var select = {
		id: 'id',
	};
	var match = {
		name: lineName,
	};
	var query = {
		select: select,
		match: match,
	};
	lineModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to search the line'+lineName);
			fn(err);
		}else {
			var line = rows[0];
			if (rows.length==0) {
				console.error('No matched line:'+lineName);
				fn({code:errorCode.DB_NO_MATCH_DATA, msg: 'No this data'});
			}else {
				fn(null, line);
			}					
		}
	});
}

function findDevice(param, fn){
	var deviceName = param.deviceName||'';
	var lId = param.lId || '';

	var select = {
		id: 'device id',
	};
	var match = {
		name: deviceName,
		lId: lId,
	};
	var query = {
		select: select,
		match: match,
	};

	var towerModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to search the device:'+deviceName);
			fn(err);
		}else {
			var device = rows[0];
			if (rows.length==0) {
				console.error('No matched device:'+deviceName);
				fn({code:errorCode.DB_NO_MATCH_DATA, 
					msg: 'No this data'});
			}else {
				fn(null, device);
			}					
		}
	});
}

function findDeviceStatus(param, fn){
	var id = param.id || '';
	var select = {
		id: 'id',
		batteryVoltage: 1,
		chargeVoltage: 1,
		temperature: 1,
		alert:1,
		updateTime: new Date(),
	};
	var match = {
		id: id,
	};
	var query = {
		select: select,
		match: match,
	};
	
	deviceStatusModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to search the status of device:'+id);
			fn(err);
		}else {
			var device = rows[0];
			if (rows.length==0) {
				console.error('No matched device:'+id);
				fn({code:errorCode.DB_NO_MATCH_DATA, 
					msg: 'No this data'});
			}else {
				fn(null, device);
			}					
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

	var lineName = param.lineName || '';
	var deviceName = param.deviceName || '';
	
	debug('Try to read status of line:'+lineName
		+', device:'+deviceName);

	async.waterfall([
		function(next){
			findLine(param, next);
		},
		function(line, next){
			param.lId = line.id;
			findDevice(param, next);
		},
		function(device, next){			
			findDeviceStatus(device, next);
		}
	], 
	function(err, deviceStatus){
		if (err) {
			console.error('Failed to find device status for line:'+lineName
				+', device:'+deviceName);
			fn(err);
		}else{
			debug('Success to find device status for line:'+lineName
				+', device:'+deviceName);
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