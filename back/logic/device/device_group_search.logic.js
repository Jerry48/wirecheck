// device group search api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_group_search.logic';
var URLPATH_GROUP = '/v1/device/group/search';
var URLPATH_PATROL = '/v1/device/patrol/search';

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
var deviceGroupMemModel = require('../../model/device_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    name:{
        data: 'group name',
        rangeCheck:null,
    },
    type:{
        data: 1,
        rangeCheck: function(data){
            return is.inArray(data, [
                wxConstants.DEVICEGROUPTYPE.GENERAL,
                wxConstants.DEVICEGROUPTYPE.GROUPPATROL,
                ]);
        },
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

    var name = param.name || '';
    var type = param.type || wxConstants.DEVICEGROUPTYPE.GENERAL;
    var groups = [];

    debug('Try to search the device group ' + name);

    async.series([
        function(next){
            //1. check the group
            deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        console.error(moduleName+', Err: the device group is not exist!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device group is not exist!'
                        });
                    }else {
                        next(null);
                    }
                }
            });
        },
        function(next){
            var select = {
                id: 'id',
                name: 'name',
            };
            var match = {
                name: name,
            };
            var query = {
                select: select,
                match: match,
            };
            deviceGroupModel.lookup(query, function(err, rows){
                 if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to search the group for'+msg);
                    next(err);
                }else{
                    groups = rows;
                    next(null);
                }
            });
        },
    ], 
    function(err){
        if (err) {
            console.error('Failed to search device group !'+name);
            fn(err);
        }else{
            debug('Success to search device group '+name);
            var resData = packageResponseData(groups);
            fn(null, resData);
        }
    }); 
}

//post interface
router.post(URLPATH_GROUP, function (req, res, next){
    var param = req.body;
    param.type = wxConstants.DEVICEGROUPTYPE.GENERAL;

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

//post interface
router.post(URLPATH_PATROL, function (req, res, next){
    var param = req.body;
    param.type = wxConstants.DEVICEGROUPTYPE.GROUPPATROL;

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
    param.type = wxConstants.DEVICEGROUPTYPE.GENERAL;
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

router.get(URLPATH_GROUP, getCallback);

router.get(URLPATH_PATROL, function(req, res, next){
    var param = req.query;
    param.type = wxConstants.DEVICEGROUPTYPE.GROUPPATROL;
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
module.exports.router = router;