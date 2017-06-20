// back server notify wechat that there is alert happen list alert api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
// back server notify wechat that there is alert happen list alert api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'alert_list.logic';
var URLPATH = '/v1/alert/search';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../back/model/device_level_info');
var deviceModel = require('../../back/model/device_info');
var alertModel =require('../../back/model/alert_log');
var wechatInfo = require('../../back/model/wechat_info');
var wechatClient = require('../../common/wechatClient');

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
        openid : inputData.openid,
        deviceId: inputData.deviceId,
        deviceName: inputData.deviceName,
        alertType: inputData.alertType,
        happenTime: inputData.alarmHappenTime,
    };
    return resData;
}


function processRequest(fn){
    async.waterfall([
        function(next){
            var select = {
                alarmed : '',
                deviceId : '',
                deviceName : '',
                alertType : '',
                alarmHappenTime : ''
            };

            var match = {
                processState : wxConstants.ALERTPROCESSSTATE.NOTPUSH,
            };

            var query = {
                select : select,
                match : match
            };

            alertModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, rows[0]);
                }
            });
        },
        function(result,next){
            //find users following the alerting devices
            var alertId = result.alarmed;
            var deviceId = result.deviceId; 
            var param = {
                alertId : alertId,
                deivceId : deviceId
            };
            wechatClient.notifyAlert(param, next);
        }
    ], 
    function(err, result){
        if (err) {
            console.error('Failed to push the alert for device: ');
            fn(err);
        }else{
            debug('Success to read the alert for device: ');
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