// device level delete create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_level_edit.logic';
var URLPATH = '/v1/device/level/edit';

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
	id: {
		data: 'level id',
		rangeCheck: null,
	},
    level:{
        data: 0,
        rangeCheck: function(data){
            return (data>=0) && (data < wxConstants.DEVICELEVEL);
        },
    },
	name: {
		data: 'da234242',
		rangeCheck: null,
	},
    newName:{
        data: 'new name',
        rangeCheck:null,
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

	var id = param.id || '';
	var name = param.name || '';
    var deviceLevel = param.level || '';

	debug('Try to edit the device level:'+name);

    async.waterfall([
    	function(next){
    		//2. create the new user!
			deviceHelper.checkDeviceLevel(param, function(err, data){
    			if (err) {
    				var msg = err.msg || err;
    				console.error(moduleName+': '+msg);
    				next(err);
    			}else {
    				if (!data.exist) {
    					var msg = 'The device level is not exist';
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
            var update = {
                name: param.newName,
            };
            var match = {
                id: param.id,
            };
    		var query = {
    			update: update,
                match: match,
    		};
    		deviceLevelModel.update(query, next);
    	}
    ], 
    function(err, device){
    	if (err) {
    		console.error('Failed to update device Level!'+name);
    		fn(err);
    	}else{
    		debug('Success to update the device Level:'+name);
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