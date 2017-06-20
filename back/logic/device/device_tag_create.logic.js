// device tag create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_tag_create.logic';
var URLPATH = '/v1/device/tag/add';

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
	id: {
		data: 'device id',
		rangeCheck: null,
	},
    tag:{
        data: 'name',
        rangeCheck:null,
    },
    comment:{
        data: 'tag description',
        rangeCheck: null,
    },
    type:{
        data: 0,
        rangeCheck: function(data){
            return is.inArray(data, [0,1]); 
        }
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
        id: inputData.id,
	};

	return resData;
}

function createDeviceTag(param, fn){
    var values = logic_helper.createData({
            debug: debug,
            inputData: param,
            refModel: refModel,
        });
    
    values.id = dataHelper.createId(param.tag + param.id);
    values.targetId = param.id;

    var query = {
        fields: values,
        values: values,
    };

    deviceTagModel.create(query, function(err, rows){
        if (err) {
            var msg = err.msg || err;
            console.error(moduleName+' Failed to create the device tag!'+msg);
            fn(err);
        }else {
            fn(null, values);
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

	var tag = param.tag || '';

	debug('Try to create the device tag ' + tag);

    async.waterfall([
    	function(next){
            //set the target id
            var deviceTag = {
                targetId: param.id,
                tag: param.tag,
                type: param.type,
            };
    		deviceHelper.checkDeviceTagExist(deviceTag, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (data.exist) {
                        console.error(moduleName+', Err: the tag duplicated!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device tag is duplicated!'
                        });
                    }else {
                        next(null, data);
                    }
                }
            });
    	},
        function(device, next){
            createDeviceTag(param, next);
        }
    ], 
    function(err, device){
    	if (err) {
    		console.error('Failed to create device tag!'+tag);
    		fn(err);
    	}else{
    		debug('Success to create the device tag'+tag);
    		var resData = packageResponseData(device);
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