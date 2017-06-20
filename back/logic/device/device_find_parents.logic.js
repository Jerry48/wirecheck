// device level list child api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_find_parents.logic';
var URLPATH = '/v1/device/find/parents';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userDeviceRModel = require('../../model/user_device_r_info');
var deviceModel = require('../../model/device_info');
var deviceLevelModel = require('../../model/device_level_info');
var deviceStatusModel = require('../../model/device_status_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	deviceId: {
		data: 'deviceId',
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
		data: inputData,
    }
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
	var data= [];

	debug('Try to list the child of device level of '+deviceId);

    async.waterfall([
    	function(next){
    		var match = {
                deviceID: deviceId,
            };
            var select = {
                parentId: '',
            };
            var query = {
                select: select,
                match: match,
            };
            deviceModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Err:'+msg);
                    next(err);
                }else{
                    next(null,rows[0]);
                }
            });
    	},
        function(parentId,next){
            var match = {
                id: parentId.parentId,
            };
            var select = {
                parentId: '',
                name: 'name'
            };
            var query = {
                select: select,
                match: match,
            };
            deviceLevelModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Err:'+msg);
                    next(err);
                }else{
                    data.push(rows[0].name);
                    console.log(data);
                    next(null,rows[0].parentId);
                }
            });
        },
        function(parentId,next){
            if(parentId != 'root'){
              var match = {
                    id: parentId,
                    
                };
                var select = {
                    parentId: '',
                    name: 'name'
                };
                var query = {
                    select: select,
                    match: match,
                };
                deviceLevelModel.lookup(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        data.push(rows[0].name);
                        console.log(data);
                        next(null,rows[0].parentId);
                    }
                });  
            }else{
                next(null,data);
            }
        },
        function(parentId,next){
            if(parentId != 'root'){
              var match = {
                    id: parentId,
                    
                };
                var select = {
                    parentId: '',
                    name: 'name'
                };
                var query = {
                    select: select,
                    match: match,
                };
                deviceLevelModel.lookup(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        data.push(rows[0].name);
                        console.log(data);
                        next(null,data);
                    }
                });  
            }else{
                next(null,data);
            }
        },
    ], 
    function(err, result){
    	if (err) {
    		console.error('Failed to list device Level!'+deviceId);
    		fn(err);
    	}else{
    		debug('Success to list the device Level:'+deviceId);
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