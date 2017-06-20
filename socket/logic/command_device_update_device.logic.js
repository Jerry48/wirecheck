// device create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 * 2016.08.29, modified by Tarrega
 *  
 */
 
'use strict';  
var moduleName = 'command_device_update_device.logic';
var URLPATH = '/v1/device/updatedevice';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var fs = require('fs');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var socketHelper = require('./socket_device_commands.logic');



var refModel = {
    deviceId: {
        data: 'parent level id',
        rangeCheck: null,
    },
    filename: {
        data: '',
        rangeCheck: null,
    },
    content:{
        data: '',
        rangeCheck: null,
        optional:1,
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
        id: inputData,
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
    var filename = param.filename || '';
    var content = param.content || '';
    debug('Try to set the device photo ' + deviceId);

    async.waterfall([
        // function(next){
        //     fs.readFile('/home/yzhou51/workspace/wire_check-dev-yzhou51/updateFiles' + '/'+ filename, {flag: 'r+', encoding: 'utf8'}, function (err, data) {
        //     if(err) {
        //             console.error(err);
        //             return;
        //         }
        //         next(null,data);
        //     });
        // },
        // function(content,next){
        //     console.log(content);
        //     param.content = content;
        function(next){
            socketHelper.updateDevice(param, function(err){
                if (err) {
                    console.error('Failed to set the device photo' + deviceId);
                    next(err);
                }else{
                    debug('Success to set the device photo' + deviceId);
                    var resData = packageResponseData(deviceId);
                    next(null, resData);
                }
            });
        },
    ],function(err,result){
        if(err){
            fn(err);
        }else{
            fn(null,result)
        }
    })
}

//post interface
router.post(URLPATH, function (req, res, next){
    var param = req.body;
    debug('post query data is: %j ', param);
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
    debug('get/1.1 query data is: %j ', param);

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