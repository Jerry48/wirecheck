// query device heartbeat log api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.11, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_heartbeat_logs.logic';
var URLPATH = '/v1/query/heartbeat/logs';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');


var deviceModel = require('../../model/device_info');
var deviceHeartBeatModel = require('../../model/heart_beat_log');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var latlngHelper = require('../../../common/latlngHelper');

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
    var logs = inputData.logs;
    var resData = {
        more: inputData.more,
        size: logs.length,
        list: [],
    };

    for (var i = 0; i < logs.length; i++) {
        var data = logs[i];
        var value = {
            deviceId: data.deviceID,
            deviceName: data.name,
            batteryVoltage: data.batteryVoltageLow,
            chargeVoltage: data.chargeVoltageLow,
            temperature: data.temperatureLow,
            alert: data.standby,
            time: data.updateTime,
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
            deviceInfo.count(query, function(err, total){
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
            var msg = ' There is no more data!';
            console.error(moduleName + msg);
            return next (null, {more:0, logs: []});
        }

        var select = {
            deviceID: 'deviceID',
            name: 'name',
            batteryVoltageLow: 1,
            chargeVoltageLow: 1,
            temperatureLow:1,
            standby: 'standby',
            updateTime: new Date(),
        };
        var sqlstr = 'select ';
        sqlstr += Object.keys(select).join(',');
        sqlstr += ' from '+deviceModel.tableName;
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
        deviceModel.query(query, function(err, rows){
            if (err) {
                var msg = err.msg  || err;
                console.error(moduleName + msg);
                next(err);
            }else{
                var data = {
                    more: more,
                    logs: rows,
                };
                next(null, data);
            }
        });
    }
    ], function(err, data){
        if (err) {
            console.error('Failed to find device heartbeat logs!');
            fn(err);
        }else{
            debug('Success to find device heartbeat logs');
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