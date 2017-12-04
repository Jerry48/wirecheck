// query device heartbeat log api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.11, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'picture_refpic_get.logic';
var URLPATH = '/v1/picture/ref/get';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picModel = require('../../model/picture_info');
var channelModel = require('../../model/channel_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var latlngHelper = require('../../../common/latlngHelper');
var deviceHelper = require('../device/device.logic');
var fileserverHelper = require('../../../common/fileserverHelper');

var refModel = {
    picId:{
        data: "picId",
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
        refPicId : inputData.refPicId,
        refPicPath: fileserverHelper.getFileServerUrl(inputData.refPicPath)
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

    debug('Try to get the refpic of picId: ' + picId);

    async.waterfall([
        function(next){
            var select = {
                deviceID : "",
                channelNo: ""
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
                    var refPicInfo = {
                        deviceID: rows[0].deviceID,
                        channelNo: rows[0].channelNo,
                    }
                    next(null, refPicInfo);
                }               
            });
        },
        function(refpic,next){
            var select = {
                refPicId : "",
                refPicPath : "",
            };
            var match = {
                deviceId : refpic.deviceID,
                channelNo: refpic.channelNo,
            };
            var query = {
                select: select,
                match : match
            };
            channelModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var refpic = {
                        refPicId: rows[0].refPicId,
                        refPicPath: rows[0].refPicPath
                    };
                    next(null, refpic);
                }
            });
        }
    ], 
    function(err, data){
        if (err) {
            console.error('Failed to get the refpic');
            fn(err);
        }else{
            debug('Success to get the refpic of picId: ' + picId);
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