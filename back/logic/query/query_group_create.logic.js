// query group create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.11, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_group_create.logic';
var URLPATH = '/v1/query/group/create';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceGroupModel = require('../../model/device_group_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('../device/device.logic');

var refModel = {
    name:{
        data: 'name',
        rangeCheck:null,
    },
    comment:{
        data: 'comment',
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
        id: inputData.id,
    };

    return resData;
}

function createDeviceQueryGroup(param, fn){
    var values = logic_helper.createData({
            debug: debug,
            inputData: param,
            refModel: refModel,
        });
    
    values.id = dataHelper.createId(param.name + param.comment);
    values.type = wxConstants.DEVICEGROUPTYPE.GROUPPATROL;

    var query = {
        fields: values,
        values: values,
    };

    deviceGroupModel.create(query, function(err, rows){
        if (err) {
            var msg = err.msg || err;
            console.error(moduleName+' Failed to create the device group!'+msg);
            fn(err);
        }else {
            fn(null, values);
        }
    });
}


function processRequest(param, fn){
    //1. check the input data
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var name = param.name || '';
    var groupQuery = {
        type : wxConstants.DEVICEGROUPTYPE.GROUPPATROL,
        name : param.name,
    };
   // param.type = wxConstants.DEVICEGROUPTYPE.GROUPPATROL;

    debug('Try to create the device query group ' + name);

    async.waterfall([
        function(next){
            deviceHelper.checkDeviceGroupExist(groupQuery, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (data.exist) {
                        console.error(moduleName+', Err: The query group name duplicated!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device query group name is duplicated!'
                        });
                    }else {
                        next(null, data);
                    }
                }
            });
        },
        function(deviceGroup, next){
            createDeviceQueryGroup(param, next);
        }
    ], 
    function(err, deviceGroup){
        if (err) {
            console.error('Failed to create device query group!'+name);
            fn(err);
        }else{
            debug('Success to create device query group'+name);
            var resData = packageResponseData(deviceGroup);
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