// device details api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_details.logic';
var URLPATH = '/v1/device/details';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceStatusModel = require('../../model/device_status_info');
var deviceProductModel = require('../../model/device_product_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	id: {
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
        deviceID: inputData.deviceID,
        name: inputData.name,
        area:inputData.area,
        latitude: inputData.latitude,
        longitude: inputData.longitude,
        danger: inputData.danger,
        lineName: inputData.lineName,
        status: inputData.status,
        deviceMeid : inputData.deviceMeid,
        deviceTele: inputData.deviceTele,
        temperature: inputData.temperature,
        batteryVoltage: inputData.batteryVoltage,
        deviceDangerID: inputData.deviceDangerID,
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

	var id = param.id || '';
    var device = {
        deviceID: id,
    };
    var result = {};

	debug('Try to read the details of device ' + id);

    async.waterfall([
    	function(next){
    		deviceHelper.checkDeviceExist(param, function(err, data){
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
                        device = data.device;
                        next(null,device);
                    }
                }
            });
    	},
        function(tmp,next){
            var select = {
                deviceID: '',
                name: '',
                area: '',
                danger: '',
                lineName: '',
                latitude: 0,
                longitude: 0,
            };
            var match = {
                deviceID: id
            };
            var query = {
                select: select,
                match: match,
            };
            deviceModel.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    result = rows[0];
                    next(null,rows);
                }   
            });
        },
        function(tmp,next){
            var select = {
                deviceMeid: '',
                deviceTele: '',
                deviceDangerID: 0,
            };
            var match = {
                id: id
            };
            var query = {
                select: select,
                match: match,
            };
            deviceProductModel.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    result.deviceMeid = rows[0].deviceMeid;
                    result.deviceTele = rows[0].deviceTele;
                    result.deviceDangerID = rows[0].deviceDangerID;
                    next(null,rows);
                }   
            });
        },
        function(tmp,next){
            var select = {
                status: 0,
                batteryVoltage:0,
                temperature:0,
            };
            var match = {
                id: id
            };
            var query = {
                select: select,
                match: match,
            };
            deviceStatusModel.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    result.status = rows[0].status;
                    result.batteryVoltage = rows[0].batteryVoltage;
                    result.temperature = rows[0].temperature;
                    next(null,rows);
                }   
            });
        },
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to delete device:'+id);
    		fn(err);
    	}else{
    		debug('Success to delete the device:'+id);
    		var resData = packageResponseData(result);
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