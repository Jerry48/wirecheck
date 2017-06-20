// picture search logic
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.19, created by Andy.zhou
 *  
 */
'use strict';
var moduleName = 'search_by_processstatus.logic';
var debug = require('debug')(moduleName);
var URLPATH = '/v1/search/pics/processStatus';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var fileserverHelper = require('../../../common/fileserverHelper');

var deviceHelper = require('./../device/device.logic');
var searchLogic = require('./search.logic');

var refModel = {
    status: {
        data: 1,
        rangeCheck: function(data) {
            return is.inArray(data, [0,1,2]);
        }
    },
    processId:{
        data: 'processId',
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
        processedPicId: inputData.processedPicId,
        processedPicPath: inputData.processedPicPath,
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

    var processId = param.processId || '';
    var status = param.status || 2;

    debug('Try to search pictures by processid= ' + processId);

    async.waterfall([
        function(next){
            var select = {
                processedPicId:'',
                processedPicPath:'',
            };
            var match = {
                id : processId,
                status : 2
            };
            var query = {
                select : select,
                match : match
            };
            picProcessModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (rows.length==0) {
                        var msg = 'Err: Failed to find the pictures!';
                        console.error(moduleName+msg);
                        next({code:errorCode.DB_ERROR, 
                            msg: msg});
                    }else {
                        next(null, rows[0]);
                    }
                }
            });
        },
    ], 
    function(err, result){
        if (err) {
            console.error('Failed to search pictures by processid= ' + processId);
            fn(err);
        }else{
            debug('Success to search pictures by processid= ' + processId);
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
