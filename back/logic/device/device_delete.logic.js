// device delete api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_delete.logic';
var URLPATH = '/v1/device/delete';

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
var deviceStatusModel = require('../../model/device_status_info');
var userDeviceRModel = require('../../model/user_device_r_info');
var channelModel = require('../../model/channel_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	ids: {
		data: [],
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
        ids: inputData,
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

	var ids = param.ids;

	debug('Try to delete the device ' + ids);

    async.series([
    	// function(next){
    	// 	deviceHelper.checkDeviceExist(param, function(err, data){
     //            if (err) {
     //                var msg = err.msg || err;
     //                console.error(moduleName + ', Err:'+msg);
     //                next(err);
     //            }else{
     //                if (!data.exist) {
     //                    console.error(moduleName+', Err: The device is not exist');
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
            var sqlstr =  'delete from '+deviceModel.tableName+' where ';
            sqlstr += ' (deviceID in("' + ids.join('","') +'"))';
            var query = {
                sqlstr: sqlstr
            };
            deviceModel.query(query,next);
        },
        function(next){
            var sqlstr =  'delete from '+userDeviceRModel.tableName+' where ';
            sqlstr += ' (deviceId in("' + ids.join('","') +'"))';
            var query = {
                sqlstr: sqlstr
            };
            userDeviceRModel.query(query,next);
        },
        function(next){
            var sqlstr =  'delete from '+deviceProductModel.tableName+' where ';
            sqlstr += ' (id in("' + ids.join('","') +'"))';
            var query = {
                sqlstr: sqlstr
            };
            deviceProductModel.query(query,next);
        },
        function(next){
            var sqlstr =  'delete from '+deviceStatusModel.tableName+' where ';
            sqlstr += ' (id in("' + ids.join('","') +'"))';
            var query = {
                sqlstr: sqlstr
            };
            deviceStatusModel.query(query,next);
        },
        function(next){
            var sqlstr =  'delete from '+channelModel.tableName+' where ';
            sqlstr += ' (deviceId in("' + ids.join('","') +'"))';
            var query = {
                sqlstr: sqlstr
            };
            channelModel.query(query,next);
        },
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to delete device:'+ids);
    		fn(err);
    	}else{
    		debug('Success to delete the device:'+ids);
    		var resData = packageResponseData(ids);
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