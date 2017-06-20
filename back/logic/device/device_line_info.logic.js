// user edit api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_line_info.logic';
var URLPATH = '/v1/device/line/info';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceModel = require('../../model/device_info');
var deviceLineModel = require('../../model/device_line_info');
var deviceProductModel = require('../../model/device_product_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./device.logic');

var refModel = {
	userId:{
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
	
    var list = [];

	var resData = {
		list: list,
	};

	for (var i = 0; i < inputData.length; i++) {
        var data = inputData[i];
        var value = {
            lineId: data.id,
            lineName: data.name,
        };

        resData.list.push(value);
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

    var result = [];

    async.waterfall([
        function(next){
            var sqlstr = 'select id,name';       
            sqlstr += ' from '+deviceLineModel.tableName+' order by createTime DESC;';            
            var query = {
                sqlstr: sqlstr,
            };
            deviceLineModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (err) {
                        var msg = 'Err: Failed to find the devices!';
                        console.error(moduleName+msg);
                        next({code:errorCode.DB_ERROR, 
                            msg: msg});
                    }else {
                        for(var i=0;i<rows.length;i++){
                            result[i] = {
                                id : rows[i].id,
                                name : rows[i].name,
                            }
                        }
                        next(null, result);
                    }
                }
            });
        },
    ], 
    function(err,result){
    	if (err) {
    		console.error('Failed to search user info!');
    		fn(err);
    	}else{
    		debug('Success to search user info!');
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