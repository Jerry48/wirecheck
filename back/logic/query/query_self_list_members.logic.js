
// device self query list members api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.11, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_self_list_members.logic';
var URLPATH = '/v1/query/self/listmembers';

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

var deviceHelper = require('../device/device.logic');

var refModel = {
    id:{
        data: 'group query id',
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
        size: inputData.length,
        list: [],
    };
    for (var i = 0; i < inputData.length; i++) {
        var data ={
            id: inputData[i].deviceID,
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

    var id = param.id || '';
    param.type = wxConstants.DEVICEGROUPTYPE.SELFPATROL;
    var ids = [];
    var devices = [];

    debug('Try to get the device members of self query:' + id);

    async.series([
        function(next){
            deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + ', Err:'+msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        var msg = ' Err: the device query group is not exist!';

                        console.error(moduleName+msg);
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: msg
                        });
                    }else {
                        next(null);
                    }
                }
            });
        },
        function(next){
            var match = {
                id: id,
            };
            var select = {
                deviceId:'deviceId',
            };
            var query = {
                match: match,
                select: select,
            };
            deviceGroupMemModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for (var i = 0; i < rows.length; i++) {
                       ids.push(rows[i].deviceId);
                    }
                    next(null);
                }
            });
        },
        function(next){
            var sqlstr = 'select deviceID, name from '+deviceModel.tableName;
            sqlstr +=' where deviceID in ("';
            sqlstr += ids.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    devices = rows;
                    next(null);
                }
            });
        }
    ], 
    function(err){
        if (err) {
            console.error('Failed to find device group members !'+id);
            fn(err);
        }else{
            debug('Success to find device group members'+id);
            var resData = packageResponseData(devices);
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