// device tag search api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.06, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'picture_alert.logic';
var URLPATH = '/v1/picture/analysis/klAlert';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picModel = require('../../model/picture_info');
var deviceModel = require('../../model/device_info');
var alertModel = require('../../model/alert_log');
var processModel = require('../../model/picture_process_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var wechatClient = require('../../../common/wechatClient');

var refModel = {
    id: {
        data: 'id',
        rangeCheck: null,
    }
};

moment().format('YYYY-MM-DD HH:MM:SS');

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
        picId: inputData.picId,
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

	var picId = param.id || '';

	debug('Try to alert the pic ' + picId);
    var alarmInfo = {};
    alarmInfo.alarmType = 1;
    alarmInfo.alarmHappenTime = new Date();

    async.waterfall([
        // function(next){

        // },
        function(next){
            var sqlstr = 'select processedPicId,processedPicPath,deviceId from tb_picture_process_info where originalPicId = "'+picId+'" and status = 2 order by createTime Desc;'
            var query = {
                sqlstr: sqlstr,
            };
            processModel.query(query, function(err, rows){
                if(err){
                    var msg = err.msg || err;
                    console.error(moduleName+' Failed to find the deivce whose picId:'+picId);
                    next(err);
                }else{
                    alarmInfo.deviceId = rows[0].deviceId;
                    alarmInfo.pictureID = rows[0].processedPicId;
                    alarmInfo.picPath = rows[0].processedPicPath;
                    next(null,alarmInfo);
                }
            });
        },
        function(alarmInfo,next){
            var select = {name : ""};
            var match = {deviceID: alarmInfo.deviceId};
            var query = {
                select : select,
                match : match,
            };
            deviceModel.lookup(query,function(err,rows){
                if(err)
                    next(err);
                else{
                    alarmInfo.deviceName = rows[0].name;
                    console.log(alarmInfo);
                    next(null,alarmInfo);
                }                  
            })
        },
        function(alarmInfo,next){
            var alertId = dataHelper.createId(alarmInfo.deviceId);
            alarmInfo.alarmed = alertId;
            var values = {
                alarmed : alarmInfo.alarmed,
                deviceId : alarmInfo.deviceId,
                pictureID : alarmInfo.pictureID,
                deviceName : alarmInfo.deviceName,
                alarmType : alarmInfo.alarmType,
                alarmHappenTime : alarmInfo.alarmHappenTime,
                heartId : "heart ID",
                clearlUserId:'',
                confirmUserId: '',
                picPath: alarmInfo.picPath,
                state :0,
            };
            var query = {
                fields : values,
                values : [values]
            };
            alertModel.create(query,function(err,rows){
                if(err)
                    next(err);
                else{
                    next(null,alarmInfo);
                }           
            });
        },
        function(alarmInfo, next){
            
            var param = {
                alertId : alarmInfo.alarmed,
                deviceId: alarmInfo.deviceId
            };
            wechatClient.notifyAlert(param,function(err,rows){
                if(err){
                    next(err);
                }else{
                    console.log(alarmInfo);
                    next(null,alarmInfo)
                }
            });
        },
        
    ], 
    function(err, result){
    	if (err) {
    		console.error('Failed to find the device whose picId!'+picId);
    		fn(err);
    	}else{
    		debug('Success to find the device whose picId'+picId);
    		var resData = packageResponseData(picId);
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