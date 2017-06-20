// back server notify wechat that there is alert happen list alert api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'message_notify_alert.logic';
var URLPATH = '/v1/notify/alert';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var async = require('async');
var API = require('wechat-api');
var config = require('../config');
var moment = require('moment');
var conf = require('../../config');

var userDeviceRModel = require('../../back/model/user_device_r_info');
var wechatInfo = require('../../back/model/wechat_info');
var alertPushModel = require('../../back/model/alert_push_log');
var alertModel = require('../../back/model/alert_log');
var deviceModel = require('../../back/model/device_info');
var channelModel = require('../../back/model/channel_info');
var pictureModel = require('../../back/model/picture_info');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var deviceHelper = require('../../back/logic/device/device.logic');

var refModel = {
    deviceId:{
        data: 'deviceId',
        rangeCheck:null,
    },
    alertId:{
        data: 'alertId',
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
        alertId : inputData.alertId,
        openid : inputData.openids,
        deviceId: inputData.deviceId,
        deviceName: inputData.deviceName,
        alertType: inputData.alertType,
        happenTime: inputData.alertHappenTime,
        channelName: inputData.name,
    };

    var alertId = inputData.alertId;
    var channelName = inputData.channelName;
    var deviceId = inputData.deviceId;
    var deviceName = inputData.deviceName;
    var happenTime = moment(inputData.alertHappenTime).format('YYYY-MM-DD HH:mm:ss');
    var alertType = '';
    switch(inputData.alertType){
        case 0:
        alertType = "工况告警";
        break;
        case 1: 
        alertType = "图片告警";
        break;
        default:
        break;
    }
    var puling = [];
    puling = inputData.openids;
    var templateId = '3a4-SWPr9-qGlCOKxFyhhDQAcHac2yzjfEjSWk8zq3U';//模板id

    var api = new API(config.appid, config.appsecret);

    api.getAccessToken(function(err,result){
        console.log(result);
    });

    var data = {
        "first": {
          "value":"您的设备触发报警！",
          "color":"#173177"
    },
      "keyword1":{
            "value": deviceId,//设备id
            "color":"#173177"
        },
        "keyword2": {
            "value": channelName,//设备名称
            "color":"#173177"
        },
        "keyword3": {
            "value": alertType,//报警类型
            "color":"#173177"
        },
        "keyword4": {
            "value": happenTime,//报警时间
            "color":"#173177"
        },
        "remark":{
            "value":"请尽快处理！",
            "color":"#173177"
        }
    };

    var pushurl = 'http://'+conf.domain+'/details?id='+alertId+'&event=fromweixin';

    for(var i=0;i<puling.length;i++){
        api.sendTemplate(puling[i], templateId, pushurl, data, function (err, result) {
          console.log(result);
      });
    }
    return resData;
}


function processRequest(param, fn){
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var deviceId = param.deviceId || '';
    var alertId = param.alertId || '';

    debug('Try to notify the alert: ' + alertId);

    var result = {};
    result.deviceId = deviceId;
    result.alertId = alertId;

    async.waterfall([
        function(next){
            //find users following the alerting devices
            var select = {
                ugId: 'ugId',                
            };
            var match = {
                deviceId: deviceId,
                // userType: wxConstants.USERTYPE.GENERAL,
                follow: 1,
            };
            var query = {
                select: select,
                match: match,
            };
            userDeviceRModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, rows);
                }
            });
        },
        function(rows, next){
            //find wechat users
            var userIds = [];
            for(var i=0;i<rows.length;i++){
                userIds.push(rows[i].ugId);
            }
            var sqlstr = 'select openid from '+ wechatInfo.tableName;
            sqlstr +=' where userId in ("' + userIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };

            wechatInfo.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    var openids = [];
                    for(var i=0;i<rows.length;i++){
                        openids.push(rows[i].openid);
                    }
                    result.openids = openids;
                    next(null, result);
                }
            });
        },
        
        function(result,next){
            var select = {
                deviceName : "",
                alarmType : "",
                alarmHappenTime :Date(),
                pictureID: '',
            };
            var match = {
                alarmed: alertId
            };
            var query = {
                select : select,
                match : match
            };
            alertModel.lookup(query,function(err,rows){
                if(err){
                    next(err);
                }else{
                    result.deviceName = rows[0].deviceName;
                    result.alertType = rows[0].alarmType;
                    result.alertHappenTime = rows[0].alarmHappenTime;
                    result.pictureID = rows[0].pictureID;
                    next(null,result);
                }
            })
        },

        function(result,next){
            var select = {
                channelNo: 0,
            };
            var match = {
                pictureID: result.pictureID
            };
            var query = {
                select : select,
                match : match
            };
            pictureModel.lookup(query,function(err,rows){
                if(err){
                    next(err);
                }else{
                    result.channelNo = rows[0].channelNo;
                    next(null,result);
                }
            })
        },
        function(result,next){
            console.log(result);
            var select = {
                name: '',
            };
            var match = {
                channelNo: result.channelNo,
                deviceId: deviceId,
            };
            var query = {
                select : select,
                match : match
            };
            channelModel.lookup(query,function(err,rows){
                if(err){
                    next(err);
                }else{
                    result.name = rows[0].name;
                    next(null,result);
                }
            })
        },
        function(result,next){
            console.log(result);
            var openids = result.openids;
            var values = [];
            for(var i=0;i<openids.length;i++){
                var id = dataHelper.createId(deviceId);
                var targetId = openids[i];

                var value = {
                    id : id,
                    deviceId :deviceId,
                    alertId : alertId,
                    idType : 0,
                    targetId : targetId,
                    targetType : 0,
                };
                values.push(value);
            }

            var query = {
                fields: values[0],
                values: values,
            };
            alertPushModel.create(query,function(err,rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error('Failed to create the log entry!'+msg);
                    next(err);
                }else {
                    next(null,result);
                }
            });
        },
        function(result,next){
            //update the alert information table
            var update = {
                processStatus: wxConstants.ALERTPROCESSSTATE.PUSH
            };
            var match = {
                alarmed: alertId,
            };
            var query = {
                update: update,
                match: match,
            };
            alertModel.update(query, function(err,rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error('Failed to create the user!'+msg);
                    next(err);
                }else {
                    next(null,result);
                }
            });
        }
    ], 
    function(err, result){
        if (err) {
            console.error('Failed to read the alert for device: ');
            fn(err);
        }else{
            debug('Success to read the alert for device: ');
            console.log('``````````````````````````````````'+result);
            var resData = packageResponseData(result);
            fn(null, resData);
        }
    }); 
}

module.exports.processRequest = processRequest;