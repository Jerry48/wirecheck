// query device alert log api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.11, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_device_alert_log.logic';
var URLPATH = '/v1/query/device/alert/logs';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');


var deviceModel = require('../../model/device_info');
var deviceAlertModel = require('../../model/alert_log');
var picProcessModel = require('../../model/picture_process_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var latlngHelper = require('../../../common/latlngHelper');
var fileserverHelper = require('../../../common/fileserverHelper');

var deviceHelper = require('../device/device.logic');

var refModel = {
    index:{
        data: 11,
        rangeCheck: function(data){
            return data >=0;
        },
    },
    size:{
        data: 11,
        rangeCheck: function(data){
            return data > 0;
        },
    },
    deviceId:{
        data: 11,
        optional: 1,
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

    var alerts = inputData.alerts;
    var resData = {
        more: inputData.more,
        total: inputData.total,
        size: alerts.length,
        list: [],
    };

    for (var i = 0; i < alerts.length; i++) {
        var data = alerts[i];
        var value = {
            alertId: data.alarmed,
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            alertType: data.alarmType,
            alertMessage: data.alarmText,
            processStatus: data.processStatus,
            time: data.createTimeStr,
            processTime:data.updateTimeStr,
            
        };
        if (data.refPicPath == null || data.refPicPath == undefined) {
        	value.refPicUrl = '';
        	value.processedPicUrl = '';
        	value.refPicId = '';
        	value.processedPicId = '';
        }else{
        	value.refPicUrl=fileserverHelper.getFileServerUrl(data.refPicPath);
            value.processedPicUrl=fileserverHelper.getFileServerUrl(data.processedPicPath);
            value.refPicId=data.refPicId;
            value.processedPicId=data.processedPicId;
        }
        

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

    debug('Try to get the device heartbeat log');
    async.waterfall([
        function(next){
            var match = {
                state: 0,
            };
            if (param.deviceId) {
                match.deviceId = param.deviceId;
            }
            var query = {
                match: match,
            };
            deviceAlertModel.count(query, function(err, total){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    next(null, total);
                }               
            });
        },
        function(total, next){
            var index = param.index && Number(param.index) || 0;
            var limit = param.size && Number(param.size) || 10;
            var offset = index * limit;
            if (offset >= total) {
                var msg = 'There is no more data!';
                console.error(moduleName + msg);
                return next (null, {more:0, alerts: []});
            }

            var select = {
                alarmed: 'id',
                deviceId: 'deviceId',
                deviceName: 'deviceName',
                alarmType: 1,
                alarmText: '1',
                pictureID: 'pid',
                processStatus:1,
                createTime: new Date(),
                updateTime: new Date(),
            };
            var sqlstr = 'select ';
            sqlstr += Object.keys(select).join(',');
            sqlstr += ' from '+deviceAlertModel.tableName;
            if (param.deviceId) {
                sqlstr += ' where (deviceId="'+param.deviceId+'" ) ';
            }
            sqlstr += ' ORDER BY createTime DESC';
            sqlstr += ' LIMIT ' + offset +', '+limit;
            sqlstr +=';';
            var query = {
                sqlstr: sqlstr
            };

            var more = total - offset - limit;
            if (more < 0) {
                more = 0;
            }
            deviceAlertModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var data = {
                        more: more,
                        alerts: rows,
                        total: total,
                    };
                    for(var i=0;i<data.alerts.length;i++){
                        data.alerts[i].createTimeStr = moment(data.alerts[i].createTime).format('YYYY-MM-DD HH:mm:ss');
                        data.alerts[i].updateTimeStr = moment(data.alerts[i].updateTime).format('YYYY-MM-DD HH:mm:ss');
                    }
                    next(null, data);
                }
            });
        },
        function(result, next){
            var ids = []
            for(var i=0;i<result.alerts.length;i++){
                ids.push(result.alerts[i].pictureID);
            }

            var sqlstr = 'select ';
            sqlstr += 'refPicId,refPicPath,processedPicId,processedPicPath from '+picProcessModel.tableName;
            sqlstr += ' where processedPicId in ("' + ids.join('","') +'")';
            sqlstr +=';';
            var query = {
                sqlstr: sqlstr
            };

            picProcessModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    for(var i=0;i<ids.length;i++){
                       for(var j=0;j<rows.length;j++){
                            if(rows[j].processedPicId == ids[i]){
                                result.alerts[i].refPicPath = rows[j].refPicPath;
                                result.alerts[i].refPicId = rows[j].refPicId;
                                result.alerts[i].processedPicId = rows[j].processedPicId;
                                result.alerts[i].processedPicPath = rows[j].processedPicPath;
                            }
                        } 
                    }
                    next(null, result);
                }
            });
        }
    ], 
    function(err, data){
        if (err) {
            console.error('Failed to find device alert logs!');
            fn(err);
        }else{
            debug('Success to find device alert logs');
            var resData = packageResponseData(data);
            fn(null, resData);
        }
    });
}

//post interface


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