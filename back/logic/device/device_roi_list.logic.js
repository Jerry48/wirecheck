// device roi list api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_roi_list.logic';
var URLPATH = '/v1/device/roi/list';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceRoiModel =require('../../model/device_roi_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	id: {
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
	
	var resData = {
        size: inputData.length,
        list: inputData,
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

	var deviceId = param.id || '';

	debug('Try to list roi setting of device ' + deviceId);

    async.waterfall([
        //0.find roi setting of device
        function(next){
            var select = {
                roiPx: 1,
                roiPy: 1,
                roiWidth: 1,
                roiHeight:1,
                priority: 1,
            };
            var match = {
                deviceId: deviceId,
            };
            var query = {
                select: select,
                match: match,
            };
            deviceRoiModel.query(query, next);
        }
    ], 
    function(err, rois){
    	if (err) {
    		console.error('Failed to list roi setting of device '+deviceId);
    		fn(err);
    	}else{
    		debug('Success to list roi setting of device '+deviceId);
    		var resData = packageResponseData(rois);
			fn(null, resData);
    	}
    });	
}

//post interface


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