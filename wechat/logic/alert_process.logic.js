// device create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'alert_process.logic';
var URLPATH = '/v1/alert/process';

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

var deviceHelper = require('../../back/logic/device/device.logic');


var refModel = {
    userId:{
        data: 'userId',
        rangeCheck:null,
    },
    alertId:{
        data: 'alertId',
        rangeCheck: null,
    },
    confirm:{
        data: 0,
        optional: 1,
        rangeCheck: function(data){
            return is.inArray(data, [0, 1, 2]);
        },
    },
    clear:{
        data: 0,
        optional: 1,
        rangeCheck: function(data){
            return is.inArray(data, [0, 1]);
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

function packageResponseData(inputData){
    if(!inputData){
        return {};
    }   
    
    var resData = {
        alertId: inputData.alarmed,
        processStatus: inputData.processStatus,
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

    var alertId = param.alertId || '';
    var userId = param.userId || '';
    debug('Try to process the alert: ' + alertId);

    async.waterfall([
        function(next){
            var select = {
                processStatus: '',
            };
            var match = {
                alarmed: alertId,
            };
            var query = {
                select: select,
                match: match,
            };
            alertModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (rows.length==0) {
                        var msg = ' Err: not found the alert!';
                        console.error(moduleName+msg);
                        next(err);
                    }else {
                        next(null, rows[0]);
                    }
                }
            });
        },
        function(alert, next){
            if (param.clear==0) {
                return next(null, alert);
            }

            if (alert.processStatus
                >= wxConstants.ALERTPROCESSSTATE.CLEARALERT) {
                var msg = ' Err: the alert has been cleared!';
                console.error(moduleName + msg);
                return next({code: errorCode.INVALID_DATA, msg: msg});
            }            

            var update = {
                processStatus: wxConstants.ALERTPROCESSSTATE.CLEARALERT,
                cancelFlag: 1,
                clearlUserId: userId
            };
            var match = {
                alarmed: alertId,
            };
            var query = {
                update: update,
                match: match,
            };
            alertModel.update(query, function(err, rows){
                 if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{                    
                    next(null, update);
                }
            });
        },
        function(alert, next){
            if (param.confirm == 0) {
               return next(null, alert);
            }
            if (alert.processStatus
                != wxConstants.ALERTPROCESSSTATE.CLEARALERT) {
                var msg = ' Err: the alert should been cleared beform confirm!';
                console.error(moduleName + msg);
                return next({code: errorCode.INVALID_DATA, msg: msg});
            }

            var update = {
                processStatus: 0,
                confirmFlag: 1,
                confirmUserId: userId
            };
            if (param.confirm == 1) {
                update.processStatus = wxConstants.ALERTPROCESSSTATE.CONFIRMRIGHT;
            }else {
                update.processStatus = wxConstants.ALERTPROCESSSTATE.CONFIRMFAKE;
            }
            var match = {
                alarmed: alertId,
            };
            var query = {
                update: update,
                match: match,
            };
            alertModel.update(query, function(err, rows){
                 if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    console.log('aaaaaaaaaaaaaaaa');
                    next(null, update);
                }
            });
        }
    ], 
    function(err, alert){
        if (err) {
            console.error('Failed to process the alert: ' + alertId);
            fn(err);
        }else{
            debug('Success to process the alert: ' + alertId);
            alert.alarmed = alertId;
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