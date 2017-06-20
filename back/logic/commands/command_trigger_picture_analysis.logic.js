// picture manually analysis api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.24, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'command_trigger_picture_analysis.logic';
var URLPATH = '/v1/device/klSetAnalysis';

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

var refModel = {
    deviceId: {
        data: 'device id',
        rangeCheck: null,
    },
    picId:{
        data: 'pictureId',
        rangeCheck: null,
    },
    channelNo: {
        data: 1,
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
	var picId = param.picId || '';
    var channelNo = param.channelNo || 1;
    var id = '';

    debug('Try to trigger photo analysis for pic' + picId);

    async.waterfall([
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
                            code: errorCode.NO_DATA_MATCH,
                            msg: msg,
                        });
                    }else {
                        next(null, data.device);
                    }
                }
            });
        },
        function(device, next){
            //2. get the picture data
            var select = picModel.dataModel;
            var match = {
                pictureID: picId,
                deviceID: deviceId,
                state:0,
            };
            var query = {
                select: select,
                match: match,
            };
            picModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (rows.length==0) {
                        var msg = 'Err: the picture is not exist!';
                        console.error(moduleName+msg);
                        next({
                            code: errorCode.NO_DATA_MATCH,
                            msg: msg,
                        });
                    }else {
                        if (pic.type != wxConstants.PICTYPE.ORIGINAL) {
                            var msg = 'Err: This picture is not original pic!';
                            console.error(moduleName+msg);
                            next({ code: errorCode.INVALID_DATA, msg: msg});
                        }else{
                            var picData ={
                                device: device,
                                pic: rows[0],
                            };                       
                            next(null, picData);                            
                        }
                    }
                }
            });
        },
        function(picData, next){
            //3. create the picture process in the database
            id = dataHelper.createId(deviceId + picId);
            var values = {
                id: id,
                deviceId: deviceId,
                channelNo: channelNo,
                originalPicId: picId,
                originalPicPath: picData.pic.path,
                refPicId: picData.device.refPicId,
                refPicPath: picData.device.refPicPath,
                status: 0,
                result: 0, 
            };
            var query = {
                fields: values,
                values: [values],
            }; 
            picProcessModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, values);
                }
            });
        },
    ], function(err, command){
        if (err) {
            console.error('Failed to trigger photo analysis!');
            fn(err);
        }else {
            debug('Success to trigger photo analysis!');
            var resData = packageResponseData(id);
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