// device line delete create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_line_delete.logic';
var URLPATH = '/v1/device/line/delete';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLineModel = require('../../model/device_line_info');
var deviceModel = require('../../model/device_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	list: {
		data: [],
		rangeCheck:null,
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

	debug('Try to delete the device line');
    var ids = [];
    for (var i = 0; i < param.list.length; i++) {
        ids.push(param.list[i].id);
    }

    var flag = 0;

    async.waterfall([
    	function(next){
            var sqlstr = 'delete from '+deviceLineModel.tableName;
            sqlstr+=' where id in ("';
            sqlstr+= ids.join('","');
            sqlstr+='");';

    		//2. create the new user!
            var query = {
                sqlstr:sqlstr,
            };
            deviceLineModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    next(null,ids);
                }
            });
    	},
        function(ids,next){
            var sqlstr = 'update '+deviceModel.tableName;
            sqlstr+=' set lineName="" , lineId="" where lineId in ("';
            sqlstr+= ids.join('","');
            sqlstr+='");';

            //2. create the new user!
            var query = {
                sqlstr:sqlstr,
            };
            deviceModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var ids = [];
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    next(null,ids);
                }
            });
        },
    ], 
    function(err, device){
    	if (err) {
    		console.error('Failed to delete device Line!');
    		fn(err);
    	}else{
    		debug('Success to delete the device line:');
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