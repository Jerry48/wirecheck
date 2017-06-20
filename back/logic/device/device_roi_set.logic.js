// device roi set api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_roi_set.logic';
var URLPATH = '/v1/device/roi/set';

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

var roiRefModel = {
    roiPx: {
        data: 1,
        rangeCheck: function(data){
            return data >= 0;
        },
    },
    roiPy : {
        data: 1,
        rangeCheck: function(data){
            return data >= 0;
        },
    },
    roiWidth:{
        data : 1,
        rangeCheck: function(data){
            return data>0;
        },
    },
    roiHeight:{
        data:1,
        rangeCheck: function(data){
            return data >0;
        },
    },
    priority: {
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        }
    }
};

var refModel = {
	id: {
		data: 'device id',
		rangeCheck: null,
	},
    temperatureHigh:{
        list: [],
        rangeCheck: function(datas){
            if(!datas || !Array.isArray(datas)
                || datas.length<1){
                return false;
            }
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                var check =  logic_helper.validate({
                    debug: debug,
                    moduleName: moduleName,
                    refModel: roiRefModel,
                    inputModel: data,
                });
                if (!check) {
                    return false;
                }
            }
            return true;
        },
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

	var deviceId = param.id || '';

	debug('Try to set roi for device ' + deviceId);

    async.series([
        //0.check whether the device exist
    	function(next){
    		deviceHelper.checkDeviceExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + ', Err:'+msg);
                    next(err);
                }else{
                    if (data.exist) {
                        console.error(moduleName+', Err: the name duplicated!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device name is duplicated!'
                        });
                    }else {
                        next(null, data);
                    }
                }
            });
    	},
        //1.clear old setting
        function(next){
            var match = {
                deviceId: param.id,
            };
            var query = {
                match: match,
            };
            deviceRoiModel.remove(query, next); 
        },
        //2.create new setting
        function(next){
            var values = [];
            for (var i = 0; i < param.list.length; i++) {
                var roi = param.list[i];
                var seed = deviceId + roi.roiPx + roi.roiPy 
                        + roi.roiWidth + roi.roiHeight;
                var value = {
                    id: dataHelper.createId(seed ),
                    deviceId: deviceId,
                    roiPx: roi.roiPx,
                    roiPy: roi.roiPy,
                    roiWidth: roi.roiWidth,
                    roiHeight: roi.roiHeight,
                    priority: roi.priority,
                };
                values.push(value);
            }
            var query = {
                values: values,
                fields: values[0],
            };
            deviceRoiModel.create(query, next);
        }
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to set roi for device '+deviceId);
    		fn(err);
    	}else{
    		debug('Success to set roi for device '+deviceId);
    		var resData = packageResponseData(param);
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