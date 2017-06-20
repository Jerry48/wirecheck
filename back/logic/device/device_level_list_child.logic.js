// device level list child api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_level_list_childs.logic';
var URLPATH = '/v1/device/level/childs';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    id: {
        data: 'level id',
        rangeCheck: null,
    },
    level:{
        data: 0,
        rangeCheck: function(data){
            return (data>=0) && (data < wxConstants.DEVICELEVEL);
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
        size: inputData.length,
        list:[],
    };
    for (var i = 0; i < inputData.length; i++) {
        var data = {
            id: inputData[i].id,
            name: inputData[i].name,
            level: inputData[i].level,
            parentId: inputData[i].parentId,
        } ;
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

    var id = param.id || '';
    var datas= [];

    debug('Try to list the child of device level of '+id);

    async.series([
        function(next){
            var match = {
                parentId: id,
            };
            var select = {
                id: 'id',
                name: 'name',
                level: 1,
                parentId: 'parentId',
            };
            var query = {
                select: select,
                match: match,
            };
            deviceLevelModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Err:'+msg);
                    next(err);
                }else{
                    datas = rows;
                    next(null);
                }
            });
        },
    ], 
    function(err, device){
        if (err) {
            console.error('Failed to list device Level!'+id);
            fn(err);
        }else{
            debug('Success to list the device Level:'+id);
            var resData = packageResponseData(datas);
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