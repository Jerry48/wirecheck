// device set reference pic api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'picture_set_refpic.logic';
var URLPATH = '/v1/device/klSetReference';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
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
    path:{
        data: 'ref path',
        rangeCheck: null,
    },
    name: {
        data: 'pic name',
        rangeCheck: null,
    },
    resolution:{
        data: 1,
        rangeCheck: function(data){
            return data>=0;
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
        id: inputData,
	};

	return resData;
}

function createPicData(param, fn){
    var pic = {
        pictureID: param.picId,
        deviceID: param.deviceId,
        type: wxConstants.PICTYPE.REFERENCE,
        pictureName: param.name,
        pictureWebURL: param.path,
        path: param.path,
        resolution: Number(param.resolution),
    };
    var query = {
        values: pic,
        fields: pic,
    };
    picModel.create(query, function(err, rows){
        if (err) {
            fn(err);
        }else{
            fn(null, pic);
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
    var path = param.path || '';
    var picId = '';

	debug('Try to set the refPicId for device' + deviceId);

    async.series([
    	 function(next){
            //1. check the device
            deviceHelper.checkDeviceExist({deviceId:param.deviceId},
             function(err, data){
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
            if (param.picId) {
                var match = {
                    id: picId,
                };
                picHelper.checkPicExist(match, function(err, data){
                    if(err){
                        var msg = err.msg || err;
                        console.error(moduleName+ msg);
                        next(err);
                    }else {
                        if (!data.exist) {
                            var msg = 'Error: This pic is not exist';
                            console.error(moduleName+msg);
                            next({
                                code: errorCode.NO_DATA_MATCH,
                                msg: msg,
                            });
                        }else{
                            next(null);
                        }
                    }
                });
            }else {
                picId = dataHelper.createId(param.path + param.deviceId);
                param.picId = picId;
                createPicData(param, next);
            } 
        },
        function(next){
            //2. remove all the old data
            var match = {
                deviceID: deviceId,
            };
            var update = {
                refPicId: picId,
                refPicPath: path,
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