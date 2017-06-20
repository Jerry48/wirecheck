// device alert view details api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'alert_view_detail.logic';
var URLPATH = '/v1/alert/details';

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
    id:{
        data: 'id',
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
    
    var processTime = '';
    if (inputData.processStatus == wxConstants.ALERTPROCESSSTATE.CLEARALERT) {
        processTime = inputData.alarmCancelTime;
    }else if (inputData.processStatus== wxConstants.ALERTPROCESSSTATE.CONFIRMRIGHT
     || inputData.processStatus== wxConstants.ALERTPROCESSSTATE.CONFIRMFAKE) {
        processTime = inputData.confirmTime;
    }

    var resData = {
        id: inputData.alarmed,
        deviceId: inputData.deviceId,
        deviceName: inputData.deviceName,
        alertType: inputData.alarmType,
        happenTime: moment(inputData.alarmHappenTime).format('YYYY-MM-DD HH:mm:ss'),
        processStatus: inputData.processStatus,
        alertMessage: inputData.alarmText,
        processTime: moment(inputData.processTime).format('YYYY-MM-DD HH:mm:ss'),
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


function processRequest(param, fn){
    //1. check the input data
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var id = param.id || '';
  
    debug('Try to read the details of alert: ' + id);

    async.waterfall([
        function(next){
            var select = alertModel.dataModel;
            var match = {
                alarmed: id,
            };
            var query = {
                select: select,
                match: match,
            };
            alertModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console(moduleName+msg);
                    next(err);
                }else{
                    if (rows.length==0) {
                        var msg = ' Err: Cannot find the alert!';
                        console.error(moduleName+msg);
                        next({code: errorCode.NO_DATA_MATCH, msg: msg});
                    }else {
                         next(null, rows[0]);
                     }                   
                }
            });
        },
    ], 
    function(err, alert){
        if (err) {
            console.error('Failed to read the details of alert: ' + id);
            fn(err);
        }else{
            debug('Success to read the details of alert: ' + id);
            var resData = packageResponseData(alert);
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