// device set reference pic api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_refpic_info.logic';
var URLPATH = '/v1/device/refpic/info';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var channelModel = require('../../model/channel_info');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceGroupModel = require('../../model/device_group_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');
var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var deviceHelper = require('../device/device.logic');
var picHelper = require('../picture_analysis/picture_analysis.logic');

var refModel = {
    deviceID:{
        data: 'device ID',
        rangeCheck:null,
    },
    channelNo:{
        data: 1,
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
	
    var result = inputData.result;
    var info = inputData.info;

    if(!result){
        var picpath = '';
    }else{
        if(result.path == null || result.path == undefined){
            var picpath = '';        
        }else{
            var picpath = result.path;
        }
    }
    
    var resData = {
        path: picpath,
        width: result.width,
        height: result.height,
        sensitivity: info.sensitivity,
        X1: info.X1,
        Y1: info.Y1,
        endX1: info.endX1,
        endY1: info.endY1,
        X2: info.X2,
        Y2: info.Y2,
        endX2: info.endX2,
        endY2: info.endY2,
        X3: info.X3,
        Y3: info.Y3,
        endX3: info.endX3,
        endY3: info.endY3,
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

	var deviceId = param.deviceID || '';
    var channelNo = param.channelNo || 1;

    var result = {};
	debug('Try to set the refPicId for device' + deviceId);

    async.waterfall([
        function(next){
            var match = {
                deviceId: deviceId,
                channelNo: channelNo,
            };
            var select = {
                refPicId: '',
                sensitivity: 0,
                X1: 0,
                Y1: 0,
                endX1: 0,
                endY1: 0,
                X2: 0,
                Y2: 0,
                endX2: 0,
                endY2: 0,
                X3: 0,
                Y3: 0,
                endX3: 0,
                endY3: 0,
            };
            var query ={
                select: select,
                match:match,
            };
            channelModel.lookup(query, function(err,rows){
                if(err){
                    next(err);
                }else{
                    var refPicId = rows[0].refPicId;
                    var sensitivity = rows[0].sensitivity;
                    console.log(sensitivity);
                   next(null,{
                    refPicId: refPicId,
                    sensitivity:sensitivity,
                    X1: rows[0].X1,
                    Y1: rows[0].Y1,
                    endX1: rows[0].endX1,
                    endY1: rows[0].endY1,
                    X2: rows[0].X2,
                    Y2: rows[0].Y2,
                    endX2: rows[0].endX2,
                    endY2: rows[0].endY2,
                    X3: rows[0].X3,
                    Y3: rows[0].Y3,
                    endX3: rows[0].endX3,
                    endY3: rows[0].endY3,
                    });
                }
            });
        },
        function(tmp,next){
            var match = {
                pictureID: tmp.refPicId,
            };
            var select = {
                path: '',
                width: 0,
                height: 1,
            };
            var query ={
                select: select,
                match:match,
            };
            picModel.lookup(query, function(err,rows){
                if(err){
                    next(err);
                }else{
                    if(rows.length){
                        var result = rows[0];
                        next(null,{result:result,info:tmp});
                    }else{
                        var result = 0;
                         next(null,{result:result,info:tmp});
                    }
                    
                }
            });
        }
    ], 
    function(err,result){
    	if (err) {
    		console.error('Failed to set the refPicId for device '+deviceId);
    		fn(err);
    	}else{
    		debug('Success to set the refPicId for device'+deviceId);
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