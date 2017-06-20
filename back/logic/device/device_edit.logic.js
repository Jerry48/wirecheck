// device create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_edit.logic';
var URLPATH = '/v1/device/edit';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceProductModel = require('../../model/device_product_info');
var channelModel = require('../../model/channel_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    parentId: {
        data: 'parent level id',
        rangeCheck: null,
    },
    deviceID: {
        data: 'parent level id',
        rangeCheck: null,
    },
    name:{
        data: 'name',
        rangeCheck:null,
    },
    area:{
        data: 'area',
        rangeCheck:null,
        optional: 1,
    },
    deviceDangerID :{
        data: 'deviceDangerID',
        rangeCheck:null,
    },
    lineName:{
        data: 'lineName',
        rangeCheck:null,
    },
    lineId :{
        data: 'lineId',
        rangeCheck:null,
    },
};
//FIXME, better way to implement the edit part
var editModel = {
    parentId: {
        data: 'parent level id',
        rangeCheck: null,
    },
    deviceID: {
        data: 'parent level id',
        rangeCheck: null,
    },
    name:{
        data: 'name',
        rangeCheck:null,
    },
    area:{
        data: 'area',
        rangeCheck:null,
        optional: 1,
    },
    lineId: {
        data: 'lineId',
        rangeCheck:null,
    },
    lineName:{
        data: 'lineName',
        rangeCheck:null,
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


function editDevice(param, fn){
    var values = logic_helper.parseEditData({
            debug: debug,
            inputData: param,
            editModel: editModel,
        });
    console.log(values);
    var match = {
        deviceID: param.deviceID,
    };
    var query = {
        update: values,
        match: match,
    };
    deviceModel.update(query, function(err, rows){
        if (err) {
            var msg = err.msg || err;
            console.error('Failed to edit the device!'+msg);
            fn(err);
        }else {
            fn(null);
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

	var id = param.id || '';
    var deviceID = param.deviceID || '';
    var deviceDangerID = param.deviceDangerID || '';
    var lineName = param.lineName || '';

	debug('Try to edit the device ' + id);

    async.series([
    	// function(next){
    	// 	deviceHelper.checkDeviceExist(param, function(err, data){
     //            if (err) {
     //                var msg = err.msg || err;
     //                console.error(moduleName + msg);
     //                next(err);
     //            }else{
     //                if (!data.exist) {
     //                    console.error(moduleName+
     //                        ', Err: The device is not exist');

     //                    next({
     //                        code: errorCode.NO_DATA_MATCH,
     //                        msg: 'The device is not exist!'
     //                    });
     //                }else {
     //                    next(null);
     //                }
     //            }
     //        });
    	// },
        function(next){
            editDevice(param, next);
        },
        function(next){
            var update = {
                deviceDangerID: deviceDangerID,
                lineName: lineName,
            }
            var match = {
                deviceID: param.deviceID,
            };
            var query = {
                update: update,
                match: match,
            };
            deviceProductModel.update(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error('Failed to edit the device!'+msg);
                    next(err);
                }else {
                    next(null,rows);
                }
            });
        },
        function(tmp,next){
            var update = {
                lineId: param.lineId,
                parentId: param.parentId,
            }
            var match = {
                deviceId: param.deviceID,
            };
            var query = {
                update: update,
                match: match,
            };
            channelModel.update(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error('Failed to edit the device!'+msg);
                    fn(err);
                }else {
                    fn(null);
                }
            });
        },
    ], 
    function(err, device){
    	if (err) {
    		console.error(moduleName+', Failed to edit device '+id);
    		fn(err);
    	}else{
    		debug('Success to edit the device'+id);
    		var resData = packageResponseData(id);
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