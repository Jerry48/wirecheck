// device call this interface to set the device params
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_init_connect.logic';
var URLPATH = '/v1/device/klIniConnect';

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

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');

var refModel = {
	deviceId: {
		data: 'device id',
		rangeCheck: null,
	},	
	deviceName: {
		data: 'device name',
		rangeCheck: null,
	},
	time:{
		data: 'time',
		rangeCheck: null,
	},
	ip: {
		data: 'ip',
		rangeCheck: null,
	},
	latitude: {
		data: 1,
		rangeCheck: null,
	},
	longitude: {
		data: 1,
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

	debug('Try to init the params for device:'+deviceId);

	var update = {		
		name: param.deviceName || '',
		ip: param.ip || '',
		latitude: param.latitude || 0,
		longitude: param.longitude || 0,
	};
	var match = {
		mac: deviceId,
	};
	var query = {
		update: update,
		match: match,
	};
	towerModel.update(query, function(err, rows){
		if (err) {
			console.error('Failed to init the device!');
			fn(err);
		}else {
			debug('Success to init the device:'+deviceId);
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