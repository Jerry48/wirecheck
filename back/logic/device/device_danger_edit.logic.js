// user edit api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_danger_edit.logic';
var URLPATH = '/v1/device/danger/edit';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceModel = require('../../model/device_info');
var deviceDangerModel = require('../../model/device_danger_info');
var deviceProductModel = require('../../model/device_product_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./device.logic');

var refModel = {
	list:{
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
	
    var list = [];

	var resData = {
		list: inputData,
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

    var list = param.list || [];

    async.series([
        function(next){       
            var sqlstr = 'delete from '+deviceDangerModel.tableName;
            var query = {
                sqlstr: sqlstr,
            };
            deviceDangerModel.query(query,next);
        },
        function(next){
            if(list.length!=0){
                var values = [];
                for (var i = 0; i < list.length; i++) {
                    var value = {};
                    value.id=list[i].id;
                    value.dangerName=list[i].dangerName;
                    values.push(value);
                }
                var query = {
                    fields: values[0],
                    values: values,
                };
                deviceDangerModel.create(query, next);
            }          
        },
    ], 
    function(err,list){
    	if (err) {
    		console.error('Failed to search user info!');
    		fn(err);
    	}else{
    		debug('Success to search user info!');
    		var resData = packageResponseData(list);
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