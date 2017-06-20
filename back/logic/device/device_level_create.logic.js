// device level create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_level_create.logic';
var URLPATH = '/v1/device/level/create';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	parentId: {
		data: 'parentID',
		rangeCheck: null,
	},
    parentLevel: {
        data: 0,
        rangeCheck: function(data){
            return (data < wxConstants.DEVICELEVEL);
        },
    },
	name: {
		data: 'da234242',
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
	
	var resData = inputData;
	return resData;
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var parentId = param.parentId || '';
	var name = param.name || '';
    var parentLevel = param.parentLevel && Number(param.parentLevel) || 0;
	var id = '';
    var comment = param.comment || "";
	debug('Try to create the device level:'+name);

    console.log('!!!!$#$$$$$$$$$$$$$$$$$$$$$$$'+parentLevel + '+' + parentId);

    async.waterfall([
    	function(next){
            //root is 0
            if (parentLevel==-1) {
                var deviceLevel = {
                    level: -1,
                    id:0,
                };
                parentId = 'root';
                return next(null, deviceLevel);
            }

    		//1. check whether parent is exist!
    		deviceHelper.checkParentExist(param, function(err, data){
    			if (err) {
    				var msg = err.msg || err;
    				console.error(moduleName+msg);
    				next(err);
    			}else {
    				if (!data.exist) {
    					var msg = 'The parent is not exist';
    					console.error(moduleName+': '+msg);
    					next({
    						code: errorCode.DB_NO_MATCH_DATA,
    						msg: msg,
    					});
    				}else {
    					next(null, data.deviceLevel);
    				}
    			}
    		});
    	},
    	function(deviceLevel, next){
    		var level = deviceLevel.level + 1;
    		var values = {
    			level: level,
    			name: name,
    		};

    		//2. create the new user!
			deviceHelper.checkDeviceLevel(values, function(err, data){
    			if (err) {
    				var msg = err.msg || err;
    				console.error(moduleName+msg);
    				next(err);
    			}else {
    				if (data.exist) {
    					var msg = 'The device is exist';
    					console.error(moduleName+': '+msg);
    					next({
    						code: errorCode.DB_NO_MATCH_DATA,
    						msg: msg,
    					});
    				}else {
    					next(null, deviceLevel);
    				}
    			}
			});
    	},
    	function(deviceLevel, next){
    		id = dataHelper.createId(parentId + name);
    		var values = {
    			id: id,
    			name:name,
    			level: deviceLevel.level +1,
    			parentId: parentId,
    			comment: param.comment ||'',
    		};
    		var query = {
    			fields: values,
    			values: values,
    		};
    		deviceLevelModel.create(query, next);
    	}
    ], 
    function(err, device){
    	if (err) {
    		console.error('Failed to create device Level!'+name);
    		fn(err);
    	}else{
    		debug('Success to create the device Level:'+name);
    		var resData = packageResponseData({id:id,comment:comment});
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