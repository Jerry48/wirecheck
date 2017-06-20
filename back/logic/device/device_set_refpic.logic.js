// device set reference pic api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_set_refpic.logic';
var URLPATH = '/v1/device/klSetReference';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceGroupModel = require('../../model/device_group_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');
var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var deviceHelper = require('../device/device.logic');
var picHelper = require('../picture_analysis/picture_analysis.logic');

var refModel = {
    deviceId:{
        data: 'device id',
        rangeCheck:null,
    },
    refPicId:{
        data: 'refPicId',
        rangeCheck: null,
    }
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

	var deviceId = param.deviceId || '';

	debug('Try to set the refPicId for device' + deviceId);

    async.series([
    	function(next){
            //1. check the device
    		deviceHelper.checkDeviceExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        var msg = 'Err: the device is not exist!';
                        console.error(moduleName+msg);
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: msg,
                        });
                    }else {
                        next(null);
                    }
                }
            });
    	},
        function(next){
            var match = {
                id: param.refPicId || '',
            };
            picHelper.checkPicExist(match, next);
        },
        function(next){
            //2. remove all the old data
            var match = {
                id: deviceId,
            };
            var update = {
                refPicId: param.refPicId||'',
            };
            var query ={
                update: update,
                match:match,
            };
            deviceModel.update(query, next);
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