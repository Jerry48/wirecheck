// device set reference pic api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_set_refarea.logic';
var URLPATH = '/v1/device/setRefArea';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var channelModel = require('../../model/channel_info');
var picProcessModel = require('../../model/picture_process_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var deviceHelper = require('../device/device.logic');
var picHelper = require('../picture_analysis/picture_analysis.logic');

var refModel = {
    deviceID:{
        data: 'device ID',
        rangeCheck:null,
    },
    channelNo:{
        data: 0,
        rangeCheck: null,
    },
    points:{
    	data: [],
    	rangeCheck: null,
    },
    sensitivity: {
        data: 0,
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
        id: inputData,
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

	var deviceId = param.deviceID || '';
	var channelNo = param.channelNo || 1;
	var points = param.points || [];

	debug('Try to set the refPicId for device' + deviceId);

    async.series([
        function(next){
            var match = {
                deviceId: deviceId,
                channelNo: channelNo,
            };

            var len = points.length;
            var update = {
               X1: points[0].x || 0,
               Y1: points[0].y || 0,
               endX1: points[0].endX || 0, 
               endY1: points[0].endY || 0,
               X2: points[1].x || 0,
               Y2: points[1].y || 0,
               endX2: points[1].endX || 0, 
               endY2: points[1].endY || 0,
               X3: points[2].x || 0,
               Y3: points[2].y || 0,
               endX3: points[2].endX || 0, 
               endY3: points[2].endY || 0,
               sensitivity: param.sensitivity,
           };
            // switch(len){
            // 	case 1:
            // 		var update = {
            // 			X1: points[0].x,
            // 			Y1: points[0].y,
            // 			endX1: points[0].endX, 
            // 			endY1: points[0].endY,
            // 		};
            // 		break;
            // 	case 2:
            // 		var update = {
            // 			X1: points[0].x,
            // 			Y1: points[0].y,
            // 			endX1: points[0].endX, 
            // 			endY1: points[0].endY,
            // 			X2: points[1].x,
            // 			Y2: points[1].y,
            // 			endX2: points[1].endX, 
            // 			endY2: points[1].endY,
            // 		};
            // 		break;
            // 	case 3:
            // 		var update = {
            // 			X1: points[0].x,
            // 			Y1: points[0].y,
            // 			endX1: points[0].endX, 
            // 			endY1: points[0].endY,
            // 			X2: points[1].x,
            // 			Y2: points[1].y,
            // 			endX2: points[1].endX, 
            // 			endY2: points[1].endY,
            // 			X3: points[2].x,
            // 			Y3: points[2].y,
            // 			endX3: points[2].endX, 
            // 			endY3: points[2].endY,
            // 		};
            // 		break;
            // 	default:
            // 		break;
            // } 
            var query ={
                update: update,
                match:match,
            };
            channelModel.update(query, next);
        },
        function(next){
            var match = {
                deviceId: deviceId,
                channelNo: channelNo,
            };

            var update = {
               X1: points[0].x || 0,
               Y1: points[0].y || 0,
               endX1: points[0].endX || 0, 
               endY1: points[0].endY || 0,
               X2: points[1].x || 0,
               Y2: points[1].y || 0,
               endX2: points[1].endX || 0, 
               endY2: points[1].endY || 0,
               X3: points[2].x || 0,
               Y3: points[2].y || 0,
               endX3: points[2].endX || 0, 
               endY3: points[2].endY || 0,
               sensitivity: param.sensitivity,
            };
            var query ={
                update: update,
                match: match,
            };
            picProcessModel.update(query, next);
        },
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to set the refPicId for device '+deviceId);
    		fn(err);
    	}else{
    		debug('Success to set the refPicId for device'+deviceId);
    		var resData = packageResponseData(deviceId);
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