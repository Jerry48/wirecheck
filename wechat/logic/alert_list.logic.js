// device list alert api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'alert_list.logic';
var URLPATH = '/v1/alert/list';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../back/model/device_level_info');
var deviceModel = require('../../back/model/device_info');
var alertModel =require('../../back/model/alert_log');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');
var fileserverHelper = require('../../common/fileserverHelper');

var deviceHelper = require('../../back/logic/device/device.logic');

var refModel = {
    deviceId:{
        data: 'deviceId',
        rangeCheck:null,
    },
    alertType:{
        data: 0,
        optional: 1,
        rangeCheck: function(data){
        	return is.inArray(data, [0,1]); 
        },
    },
    processStatus: {
        data: 1,
        optional:1,
        rangeCheck: function(data){
            return is.inArray(data, [0,1,2,3,4]);
        }
    },
    fromTime:{
    	data: 'YYYY-MM-DD HH:mm:ss',
        optional: 1,
    	rangeCheck: function(data){
            return moment(data, 'YYYY-MM-DD HH:mm:ss').isValid();
        },
    },
    endTime:{
    	data: 'YYYY-MM-DD HH:mm:ss',
        optional: 1,
    	rangeCheck: function(data){
            return moment(data, 'YYYY-MM-DD HH:mm:ss').isValid();
        },
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

function parseToResData(inputData)
{
 var resData = {
        id: inputData.alarmed,
        deviceId: inputData.deviceId,
        deviceName: inputData.deviceName,
        alertType: inputData.alarmType,
        happenTime: inputData.happenTimeStr,
        processStatus: inputData.processStatus,
        alertMessage: inputData.alarmText,
    };
    
    if (inputData.alarmType == wxConstants.ALERTTYPE.WORKSTATUS) {
        resData.deviceWorkAlert = {
            temperature: inputData.temperature,
            batteryVoltage: inputData.batteryVoltage,
            chargeVoltage: inputData.chargeVoltage,
        };
    }else {
        resData.picAlert = {
            picId: inputData.pictureID,
            picUrl: fileserverHelper.getFileServerUrl(
                inputData.picPath),
            thumbnailPicUrl: fileserverHelper.getFileServerThumbnailUrl(
                inputData.picPath),
        };
    }
    return resData;
}

function packageResponseData(inputData){
    if(!inputData){
        return {};
    }   
    
    var alerts = inputData;
    var resData = {
        size: alerts.length,
        list: [],
    };
    for (var i = 0; i < alerts.length; i++) {
    	var alert = alerts[i];
    	var data = parseToResData(alert);

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

    var deviceId = param.deviceId || '';
  
    debug('Try to read the alert for device: ' + deviceId);

    async.waterfall([
        function(next){
        	var select = alertModel.dataModel;
            
            var sqlstr = 'select ' ;
            sqlstr += Object.keys(select).join(',');
            sqlstr +=' from '+ alertModel.tableName;
            sqlstr +=' where (deviceId = "'+deviceId+'") ';
            
            if (param.alertType != null) {
                sqlstr +=' and ( alarmType='+param.alertType+') ';
            }
            if (param.processStatus != null) {
                sqlstr +=' and ( processStatus='+param.processStatus+') ';
            }

            if (param.fromTime) {
                var startTime = moment(param.fromTime);
                var endTime = (param.endTime && moment(param.endTime))
                        || moment();

                sqlstr += ' and ( createTime between \'' 
                    + startTime.format('YYYY-MM-DD HH:mm:ss');
                sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\')';
            }
                
            sqlstr +=' order by alarmHappenTime DESC;';

        	var query = {
        		sqlstr:sqlstr
        	};
        	alertModel.query(query, function(err, rows){
        		if (err) {
        			var msg = err.msg || err;
        			console.log(moduleName+msg);
        			next(err);
        		}else{
                    for(var i=0;i<rows.length;i++){
                        rows[i].happenTimeStr = moment(rows[i].alarmHappenTime).format('YYYY-MM-DD HH:mm:ss');
                    }
        			next(null, rows);
        		}
        	});
        },
    ], 
    function(err, alerts){
        if (err) {
            console.error('Failed to read the alert for device: ' + deviceId);
            fn(err);
        }else{
            debug('Success to read the alert for device: ' + deviceId);
            var resData = packageResponseData(alerts);
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