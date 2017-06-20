// manually push pictures
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */

'use strict';  
var moduleName = 'command_reset_device.logic';
var URLPATH = '/v1/command/klResetDevice';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');
var commandModel = require('../../model/command_info');
var pushModel = require('../../model/manual_push_info');
var pushPicsModel = require('../../model/manual_push_pic_list_info');
var pushTargetModel = require('../../model/manual_push_target_list_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var socketClient = require('../../../common/socketClient');

var userLogic = require('../user/user.logic');
var picLogic = require('../picture_analysis/picture_analysis.logic');
var deviceHelper = require('../device/device.logic');

var refModel = {
    deviceId: {
        data: 'device id',
        rangeCheck: null,
    },
    mode: {
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
        deviceId: inputData,
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
	var mode = param.mode || 0;

    debug('Try to set device:'+deviceId);

    async.series([
        function(next){
            var param = {
                deviceId: deviceId,
                mode: mode,
            };
            socketClient.resetDevice(param,function(err,result){
                if(err){next(err);}else{
                    console.log(result);
                    next(null,result);
                }
            });  
        }
    ], function(err,result){
        if (err) {
            console.error('Failed to set device:'+deviceId);
            fn(err);
        }else {
            debug('Success to set device!');
            var result = result[0];
            if(result.code!=0){
                return fn({code:result.code,msg: result.msg,})
            }
            fn(null, result);
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
    
    param.userId = param.userId || req.session.userId;

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