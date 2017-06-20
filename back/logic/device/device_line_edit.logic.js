// device line delete create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_line_edit.logic';
var URLPATH = '/v1/device/line/edit';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLineModel = require('../../model/device_line_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    id: {
        data: 'line id',
        rangeCheck: null,
    },
    name: {
        data: 'da234242',
        rangeCheck: null,
    },
    newName:{
        data: 'new name',
        rangeCheck:null,
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

    var id = param.id || '';
    var name = param.name || '';

    debug('Try to edit the device line:'+name);

    async.waterfall([
        function(next){
            var update = {
                name: param.newName,
            };
            var match = {
                id: param.id,
            };
            var query = {
                update: update,
                match: match,
            };
            deviceLineModel.update(query, next);
        }
    ], 
    function(err, device){
        if (err) {
            console.error('Failed to update device Line!'+name);
            fn(err);
        }else{
            debug('Success to update the device Line:'+name);
            var resData = packageResponseData(id);
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