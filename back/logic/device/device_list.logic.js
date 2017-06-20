// list device by level id api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.06, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_list.logic';
var URLPATH = '/v1/device/list';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');

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
		size: inputData.length,
        list:[],
	};
    for (var i = 0; i < inputData.length; i++) {
        var data = {
            id: inputData[i].deviceID,
            name: inputData[i].name,
        } ;
        resData.list.push(data);
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

	var id = param.id || '';
	
	debug('Try to list devices by level '+id);

    async.waterfall([
    	function(next){
            var ids = [];
            ids.push(param.id);
            var select = {
                deviceID: 'id',
                name: 'name',
            };
            deviceHelper.findAllDevicesByLevel(
                {ids: ids, select: select},
                next);
    	},
    ], 
    function(err, datas){
    	if (err) {
    		console.error('Failed to list device Level!'+id);
    		fn(err);
    	}else{
    		debug('Success to list the device Level:'+id);
    		var resData = packageResponseData(datas);
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