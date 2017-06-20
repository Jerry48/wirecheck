// user list devices api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.20, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_follow_list.logic';
var URLPATH = '/v1/user/follow/list';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../back/model/device_level_info');
var deviceModel = require('../../back/model/device_info');
var userDeviceRModel = require('../../back/model/user_device_r_info');
//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var deviceHelper = require('../../back/logic/device/device.logic');
var refModel = {
    userId:{
        data: 'userId',
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
        size: inputData.length,
        list:[],
    };
    for (var i = 0; i < inputData.length; i++) {
        var data = {
            deviceId: inputData[i].deviceID,
        deviceName: inputData[i].name,
        };
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

    var userId = param.userId || '';

    debug('Try to get the device list of user id='+userId);
    var devices = [];
    var test = [];

    async.waterfall([
        function(next){
           var select = {
            deviceId: 'deviceId',
           };
           var match = {
            ugId: userId,
            // userType: wxConstants.USERGROUPTYPE.USER,
            follow: 1,
           };
           var query = {
            select:select,
            match: match,
           };
           userDeviceRModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+err);
                    next(err);
                }else{
                    if (rows.length==0) {
                        var msg = ' Err: no this data!';
                        console.error(moduleName+msg);
                        next({code: errorCode.NO_DATA_MATCH, msg: msg});
                    }else{
                    devices = rows;
            //console.error("/////////////"+devices[1].deviceId);
                    next(null,devices);
                }
            }
           });
        },

    function(devices, next){
        var buf = [];
        var len = devices.length;
        
        console.error("/////////////"+len);

        for(var i = 0;i<len;i++){
            buf[i] = devices[i].deviceId;
        }
            var sqlstr = 'select deviceID, name from '+ deviceModel.tableName;
            sqlstr +=' where deviceID in ( "' + buf.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    //console.error(moduleName + msg);
                    next(err);
                }else {
                    //console.error("/////////////"+rows[1].name);
                    test = rows;
                    next (null, test);
                }
            });
        }
    ], 
    function(err,result){
        if (err) {
            console.error('Failed to get the device list of user id='+userId);
            fn(err);
        }else{
            debug('Success to get the device list of user id='+userId);           
            var resData = packageResponseData(result);
            fn(null, resData);
        }
    }); 
}

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