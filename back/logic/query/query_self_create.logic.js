// self query create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.12, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_self_create.logic';
var URLPATH = '/v1/query/self/create';

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
var deviceGroupMemberModel = require('../../model/device_group_member_info');

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
 /*   size:{
        data: 1,
        rangeCheck: function(data){
            return data>0;
        },
    },*/
    list:{
        data: [],
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

function createSelfQueryGroup(param, fn){
    var value = logic_helper.createData({
            debug: debug,
            inputData: param,
            refModel: refModel,
        });
    var values = {} ;
    values.name = value.name ;
    values.state = value.state ;
    values.comment = value.comment ;
    values.id = dataHelper.createId(param.name + param.comment);
    values.type = wxConstants.DEVICEGROUPTYPE.SELFPATROL;

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
    param.type = wxConstants.DEVICEGROUPTYPE.SELFPATROL;

    debug('Try to create the device self query ' + name);

    async.waterfall([
        function(next){
            deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (data.exist) {
                        console.error(moduleName+', Err: The self query group name duplicated!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The self query group name is duplicated!'
                        });
                    }else {
                        next(null, data);
                    }
                }
            });
        },
        function(data, next){
            createSelfQueryGroup(param, function(err, deviceGroup){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    next(null, deviceGroup);
                }
            });
        },
        function(deviceGroup, next){
            if (param.list.length) {
                console.error('The input device list is empty!');
                return next(null, deviceGroup);
            }
            var values = [];
            for (var i = 0; i < param.list.length; i++) {
                var deviceId = param.list[i].deviceId;
                var id = dataHelper.createId(deviceGroup.id + deviceId);
                var data = {
                    id: id,
                    groupId: deviceGroup.id,
                    deviceId: deviceId,
                } ;
                values.push(data);
            }
            var query = {
                values: values,
                fields: values[0],
            };
            deviceGroupMemberModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    next(null, deviceGroup);
                }
            })
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