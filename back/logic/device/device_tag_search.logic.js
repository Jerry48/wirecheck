// device tag search api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.06, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_tag_search.logic';
var URLPATH = '/v1/device/tag/searchdevice';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceTagModel = require('../../model/device_tag_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    tag: {
        data: 'tag',
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
        size: inputData.length,
        list: [],
	};

    for (var i = 0; i < inputData.length; i++) {
       var data = {
            id: inputData[i].deviceID,
            name: inputData[i].name,
       };
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

	var tag = param.tag || '';
    var deviceTags = [];

	debug('Try to find the device whose tag ' + tag);

    async.waterfall([
        function( next){
            var match = {
                tag: tag, 
            };
            var select = deviceTagModel.dataModel;
            var query = {
                select: select,
                match: match,
            };
            deviceTagModel.lookup(query, function(err, rows){
                if(err){
                    var msg = err.msg || err;
                    console.error(moduleName+' Failed to find the deivce whose tag:'+msg);
                    next(err);
                }else{
                    var ids = [];
                    for (var i = 0; i < rows.length; i++) {
                       ids.push(rows[i].targetId);
                    }
                    next(null,ids);
                }
            });
        },
        function(deviceIds, next){
            var sqlstr = 'select deviceID name from '+deviceModel.tableName;
            sqlstr += ' where deviceID in ("';
            sqlstr += deviceIds.join('","');
            sqlstr += '");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+ 
                        'Failed to find the deviceModel');
                    next(err);
                }else{
                    next(null, rows);
                }
            });
        }
    ], 
    function(err, devices){
    	if (err) {
    		console.error('Failed to find the device whose tag!'+tag);
    		fn(err);
    	}else{
    		debug('Success to find the device whose tag'+tag);
    		var resData = packageResponseData(devices);
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