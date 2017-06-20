// set device to take photo api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.20, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'command_update_device.logic';
var URLPATH = '/v1/device/klUpdateDevice';

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

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('../user/user.logic');
var picLogic = require('../picture_analysis/picture_analysis.logic');
var deviceHelper = require('../device/device.logic');
var socketClient = require('../../../common/socketClient');

var refModel = {
    deviceId: {
        data: 'device id',
        rangeCheck: null,
    },
    filename: {
        data: 'filename',
        rangeCheck: null,
    },
    content: {
        data:'content',
        rangeCheck:null,
        optional: 1,
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
    var filename = param.filename || '';
    var content = param.content || '';
    var id = '';

    debug('Try to trigger photo' + deviceId);

    async.waterfall([
        function(next){
            //create the command in the database
            var id = dataHelper.createId(deviceId);
            var command = '';
            var values = {
                id: id,
                name: 'update device:'+deviceId,
                targetId: deviceId,
                targetType: 0,
                command: command,
                sourceId: '',
                sourceType: 0,
                pushState: 0,
            };
            var query = {
                fields: values,
                values: values,
            }; 
            commandModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    console.log(content);
                    next(null, values);
                }
            });
        },
        function(command, next){
            var param = {
                deviceId : deviceId,
                filename: filename,
                content : content,
            };
            socketClient.updateDevice(param,function(err,result){
                if(err){next(err);}else{
                    console.log(result);
                    next(null,result);
                }
            });          
        }
    ], function(err, result){
        if (err) {
            console.error('Failed to trigger photo!');
            fn(err);
        }else {
            debug('Success to trigger photo!');
            var result = result;
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