// device level list child api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_delete_update_files.logic';
var URLPATH = '/v1/device/delete/updateFiles';

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
	filename: {
		data: 'filename',
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
		fla: inputData,
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

	var filename = param.filename || '';

	debug('Try to list the child of device level of '+filename);
    var flag = 1;

    // function deleteFolderRecursive(url) {
    //   var files = [];
    //   //判断给定的路径是否存在
    //   if( fs.existsSync(url) ) {
    //     //返回文件和子目录的数组
    //     files = fs.readdirSync(url);
    //     files.forEach(function(file,index){
    //       // var curPath = url + "/" + file;
    //       var curPath = path.join(url,file);
    //       //fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
    //       if(fs.statSync(curPath).isDirectory()) { // recurse
    //         deleteFolderRecursive(curPath);
    //       // 是文件delete file
    //       } else {
    //         fs.unlinkSync(curPath);
    //       }
    //     });
    //     //清除文件夹
    //     fs.rmdirSync(url);
    //   }else{
    //     console.log("给定的路径不存在，请给出正确的路径");
    //     flag = 0;
    //   }
    // };
    // deleteFolderRecursive('../back/uploads/update/'+filename);
    fs.unlinkSync('../back/uploads/update/'+filename);

    debug('Success to list the device Level:'+filename);
    var resData = packageResponseData(flag);
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