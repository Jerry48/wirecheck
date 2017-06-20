// device level list child api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_find_update_files.logic';
var URLPATH = '/v1/device/find/updateFiles';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var fs=require('fs');  
var path = require('path');


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
	userId: {
		data: 'userId',
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
		list: inputData,
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

	var userId = param.userId || '';

	debug('Try to list the child of device level of '+userId);

    
    var fileArray = [];  
    console.log(__dirname);
    function ls(ff)  
    {  
        var files=fs.readdirSync(ff);  
        for(var file in files)  
        {  
            var fname = ff+path.sep+files[file];  
            var stat = fs.lstatSync(fname);  
            if(stat.isDirectory() == true)  
            {  
                ls(fname);  
            }  
            else  
            {  
                console.log(fname); 
                fileArray.push(fname.split('\/').slice(-1)[0]);
            }  
        }  
    }  

    ls('../back/uploads/update');  
    console.log(fileArray);

    debug('Success to list the device Level:'+userId);
    var resData = packageResponseData(fileArray);
	fn(null, resData);
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