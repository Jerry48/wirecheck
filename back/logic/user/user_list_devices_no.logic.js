// user list devices api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.20, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_list_devices_no.logic';
var URLPATH = '/v1/user/device/list/no';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var groupModel = require('../../model/user_group_info');
var groupMemberModel =require('../../model/user_group_member_info');
var userDeviceRModel = require('../../model/user_device_r_info');
var deviceHelper = require('../device/device.logic');
var deviceModel = require('../../model/device_info');
//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

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
            deviceName: 'deviceName',
           };
           var match = {
            ugId: userId,
            userType: wxConstants.USERGROUPTYPE.USER,
            state: 0,
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
                    devices = rows;
                    next(null,devices);
                }
           });
        },
        function(devices, next){
            var buf = [];
            var len = devices.length;

            for(var i = 0;i<len;i++){
                buf[i] = devices[i].deviceId;
            }
            var sqlstr = 'select deviceID, name from '+ deviceModel.tableName;
            sqlstr +=' where deviceID not in ( "' + buf.join('","');
            sqlstr +='");';
            // sqlstr += ';';
            var query = {
                sqlstr: sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    next(err);
                }else {
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