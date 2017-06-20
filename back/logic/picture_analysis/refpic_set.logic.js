// query device heartbeat log api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.11, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'refpic_set.logic';
var URLPATH = '/v1/picture/ref/set';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');


var deviceModel = require('../../model/device_info');
var deviceHeartBeatModel = require('../../model/heart_beat_log');
var picModel = require('../../model/picture_info');
var pictureProcessModel = require('../../model/picture_process_info');
var channelModel = require('../../model/channel_info');
//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var latlngHelper = require('../../../common/latlngHelper');

var deviceHelper = require('../device/device.logic');

var refModel = {
    picId:{
        data: "picId",
        rangeCheck: null
    },
    deviceId:{
        data: "deviceId",
        rangeCheck: null
    },
    channelNo:{
        data: 1,
        rangeCheck: null
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
        picId : inputData.refPicId
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

    var picId = param.picId || "";
    var deviceId = param.deviceId || "";
    var channelNo = param.channelNo || 1;

    debug('Try to set the pic ' + picId+'to be refpic');

    async.waterfall([
        function(next){
            var select = {
                path : ""
            };

            var match = {
                pictureID: picId,
            };
            var query = {
                select : select,
                match: match,
            };
            picModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var pic = {
                        pictureID: picId,
                        path: rows[0].path,
                        channelNo: channelNo,
                    }
                    next(null, pic);
                }               
            });
        },
        function(refpic, next){
            if(channelNo == 1){
                var update = {
                    refPicId1 : refpic.pictureID,
                    refPicPath1 : refpic.path,
                };
                var match = {
                    deviceID : deviceId
                };
                var query = {
                    update: update,
                    match : match
                };
                deviceModel.update(query, function(err, rows){
                    if (err) {
                        var msg = err.msg  || err;
                        console.error(moduleName + msg);
                        next(err);
                    }else{
                        next(null, refpic);
                    }
                });
            }else if(channelNo == 2){
                var update = {
                    refPicId2 : refpic.pictureID,
                    refPicPath2 : refpic.path,
                };
                var match = {
                    deviceID : deviceId
                };
                var query = {
                    update: update,
                    match : match
                };
                deviceModel.update(query, function(err, rows){
                    if (err) {
                        var msg = err.msg  || err;
                        console.error(moduleName + msg);
                        next(err);
                    }else{
                        next(null, refpic);
                    }
                });
            }else{
                var update = {
                    refPicId3 : refpic.pictureID,
                    refPicPath3 : refpic.path,
                };
                var match = {
                    deviceID : deviceId
                };
                var query = {
                    update: update,
                    match : match
                };
                deviceModel.update(query, function(err, rows){
                    if (err) {
                        var msg = err.msg  || err;
                        console.error(moduleName + msg);
                        next(err);
                    }else{
                        next(null, refpic);
                    }
                });
            }
        },
        function(refpic,next){
            var update = {
                refPicId : refpic.pictureID,
                refPicPath : refpic.path,
            };
            var match = {
                deviceId : deviceId,
                channelNo: channelNo,
            };
            var query = {
                update: update,
                match : match
            };
            channelModel.update(query, function(err, rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    next(null, refpic);
                }
            });
        },
        function(refpic,next){
            var update = {
                refPicId : refpic.pictureID,
                refPicPath : refpic.path,
            };
            var match = {
                deviceId : deviceId,
                channelNo : channelNo,
                status: 0,
            };
            var query = {
                update: update,
                match : match
            };
            pictureProcessModel.update(query, function(err, rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    next(null, refpic);
                }
            });
        },
    ], 
    function(err, data){
        if (err) {
            console.error('Failed to set the pic ' + picId+'to be refpic');
            fn(err);
        }else{
                debug('Success to set the pic ' + picId+'to be refpic');
                var resData = packageResponseData(data);
                fn(null, resData);
        }
    })
}

//post interface


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