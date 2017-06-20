// user floww device api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_follow_device.logic';
var URLPATH = '/v1/user/device/follow';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../back/model/device_level_info');
var deviceModel = require('../../back/model/device_info');
var userDeviceModel = require('../../back/model/user_device_r_info');
//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var deviceHelper = require('../../back/logic/device/device.logic');

var refModel = {
    userId:{
        data: 'name',
        rangeCheck:null,
    },
    deviceId:{
        data: 'comment',
        rangeCheck: null,
    },
    follow: {
        data: 0,
        rangeCheck: function(data){
            return is.inArray(data, [0, 1]);
        }
    }
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
        deviceId: inputData.deviceId,
        userId: inputData.userId,
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

    var deviceId = param.deviceId || '';
    var follow = param.follow && Number(param.follow) || 0;
    var userId = param.userId || '';

    debug('Try to follow device: ' + deviceId);

    async.series([
        function(next){
            var update = {
                follow: follow,
            };
            var match = {
                deviceId: deviceId,
                ugId: userId,
                userType: wxConstants.USERGROUPTYPE.USER,
            };
            var query = {
                update: update,
                match: match,
            };

            userDeviceModel.update(query, next);
        },
    ], 
    function(err, device){
        if (err) {
            console.error('Failed to follow device: ' + deviceId);
            fn(err);
        }else{
            debug('Success to change the follow state to: ' + follow);
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