// device device set api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.10, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_defend_set.logic';
var URLPATH = '/v1/device/defend/set';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var alertModel = require('../../model/alert_disable_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('../device/device.logic');
var deviceMonitorHelper = require('./device_monitor.logic');


var refModel = {
    id: {
        data: 'level or device id',
        rangeCheck: null,
    },
    level:{
        data: 1,
        rangeCheck: function(data){
            return data>=0 && data <= wxConstants.DEVICELEVEL;
        }
    },
    fullDisable:{
        data: 0,
        rangeCheck: function(data){
            return is.inArray(data, [0,1]); 
        }
    },
    list: {
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
    
    var resData = {
        id: inputData.id,
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


    debug('Try to set defend policy for device ');

    async.waterfall([
        //1. find the device parent ids
        function(next){
            deviceHelper.findAllDeviceLevelIds(param, function(err, parentIds){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                  next(null, parentIds)
                }
            });
        },
        //2 find the device ids
        function(parentIds, next){
            var deviceIds = [];
            if (parentIds.length) {    
                deviceIds.push(param.id);
                next(null, deviceIds);
            }else{
                var sqlstr = 'select deviceID from '+deviceModel.tableName;
                sqlstr += ' where parentId in ("';
                sqlstr += parentIds.join('","');
                sqlstr += '");';
                var query = {
                    sqlstr: sqlstr,
                };
                deviceModel.query(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+msg);
                        next(err);
                    }else{
                        for (var i = 0; i < rows.length; i++) {
                            deviceIds.push(rows[i].deviceID);
                        }
                        next(null, deviceIds);
                    }
                });
            }
        },
        //3. set the device alert status
        function(deviceIds, next){
            var sqlstr = 'update ' + deviceModel.tableName;
            sqlstr += ' set disableAlert ='+ Number(param.fullDisable);
            sqlstr += ' where deviceID in("';
            sqlstr += deviceIds.join('","');
            sqlstr += '");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    next(null, deviceIds);
                }
            });
        },
        //4. clear the device old alert 
        function(deviceIds, next){
            var sqlstr = 'delete from '+alertModel.tableName;            
            sqlstr +=' where deviceId in ("';
            sqlstr += deviceIds.join('","');
            sqlstr += '");';
            var query = {
                sqlstr: sqlstr,
            };
            alertModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    next(null, deviceIds);
                }
            });
        },
        //5.set the new device alerts
        function(deviceIds, next){
            var values = [];
            var list = param.list;
            if (!Array.isArray(list)) {
                list = [list];
            }

            for (var j = 0; j < list.length; j++) {
                var data = {
                    id: '',
                    deviceId: '',
                    dayOfWeek: Number(list[j].dayOfWeek),
                    startHour: Number(list[j].startHour),
                    startMinute: Number(list[j].startMinute),
                    endHour: Number(list[j].endHour),
                    endMinute: Number(list[j].endMinute),
                };
                var seed = data.dayOfWeek + data.startHour
                    + data.startMinute + data.endHour + data.endMinute;

                for (var i = 0; i < deviceIds.length; i++) {
                    var deviceId = deviceIds[i];

                    data.id = dataHelper.createId(deviceId + seed);
                    data.deviceId = deviceId;

                    values.push(data);
                }
            }
            var query = {
                fields: values[0],
                values: values,
            };
            alertModel.create(query, next);
        }
    ], 
    function(err){
        if (err) {
            console.error('Failed to set defend policy for device!');
            fn(err);
        }else{
            debug('Success to set defend policy for device');
            var resData = packageResponseData(param);
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