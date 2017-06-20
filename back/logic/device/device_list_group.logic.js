// device list group api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_list_group.logic';
var URLPATH = '/v1/device/listgroup';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceGroupModel = require('../../model/device_group_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    id:{
        data: 'device id',
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
        size: inputData.length,
        list: [],
    };

    for (var i = 0; i < inputData.length; i++) {
        var data = {
            id: inputData[i].id,
            name: inputData[i].name,
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

    var deviceId = param.id || '';
    var groupIds = [];
    var groups = [];

    debug('Try to find the groups of device:' + deviceId);

    async.series([
        function(next){
            //1. check the group
            deviceHelper.checkDeviceExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        console.error(moduleName+', Err: the device is not exist!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device is not exist!'
                        });
                    }else {
                        next(null);
                    }
                }
            });
        },
        function(next){
            var select = {
                gId: 'id',
            };
            var match = {
                deviceId: deviceId,
            };
            var query = {
                select: select,
                match: match,
            };
            deviceGroupMemModel.query(query, function(err, rows){
                 if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to search the group member for'+msg);
                    next(err);
                }else{
                    for (var i = 0; i < rows.length; i++) {
                        groupIds.push(rows[i].gId);
                    }
                    next(null);
                }
            });
        },
        function(next){
            var sqlstr = 'select id, name from '+deviceGroupModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr += groupIds.join('","');
            sqlstr += '");';
            var query = {
                sqlstr:sqlstr,
            };
            deviceGroupModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to search the group for'+msg);
                    next(err);
                }else{
                    groups = rows;
                    next(null);
                }
            });
        }
    ], 
    function(err){
        if (err) {
            console.error('Failed to search device\'s group !'+deviceId);
            fn(err);
        }else{
            debug('Success to search device \'s group '+deviceId);
            var resData = packageResponseData(groups);
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