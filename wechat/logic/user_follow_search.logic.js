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
var moduleName = 'user_follow_search.logic';
var URLPATH = '/v1/user/follow/search';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userDeviceRModel = require('../../back/model/user_device_r_info');
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
        follow : inputData.follow
    };
    return resData;
}


function processRequest(param,fn){
    //1. check the input data
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var userId = param.userId || '';
    var deviceId = param.deviceId || '';

    debug('Try to get the device list of user id='+userId);
    async.waterfall([
        function(next){
            var select = {
                follow : ''
            };

            var match = {
                ugId : userId,
                deviceId : deviceId,
            };

            var query = {
                select : select,
                match : match
            };

            userDeviceRModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, rows[0]);
                }
            });
        },
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