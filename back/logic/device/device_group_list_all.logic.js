// device list all groups api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_group_list_all.logic';
var URLPATH_GROUP = '/v1/device/allgroups';
var URLPATH_PATROL = '/v1/device/allpatrols';

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
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    userId: {
        data: 'userId',
        rangeCheck: null,
    },
    userType: {
        data: 0,
        rangeCheck: null,
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

    var groups = [];
    var type = param.type || wxConstants.DEVICEGROUPTYPE.GENERAL;
    var userId = param.userId;
    var userType = param.userType;
    var ids = [];
    var result = [];

    debug('Try to find all groups for type:'+type);

    async.waterfall([
        // function(next){
        //     var select  = {
        //         id: '',
        //         groupId: '',
        //     };
        //     var match = {
        //         // userId: userId,
        //         userType: userType,
        //         groupType: type,
        //         comment: 'create',
        //     };
        //     var query = {
        //         select: select,
        //         match : match,
        //     };
        //     userDeviceGroupRModel.lookup(query, function(err, rows){
        //         if (err) {
        //             var msg = err.msg || err;
        //             console.error(moduleName+'Failed to search the group for'+msg);
        //             next(err);
        //         }else{
        //             groups = rows;
        //             next(null,groups);
        //         }
        //     });
        // },
        // function(groups,next){
        function(next){
            // for(var i=0;i<groups.length;i++){
            //     ids.push(groups[i].groupId);
            // }
            // var sqlstr = 'select id,name from '+deviceGroupModel.tableName+' where id in ';
            // sqlstr+='("'+ids.join('","')+'")';
            var sqlstr = 'select id,name from '+deviceGroupModel.tableName;
            var query = {
                sqlstr: sqlstr,
            }
            deviceGroupModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to search the group for'+msg);
                    next(err);
                }else{
                    next(null,rows);
                }
            });
        }
    ], 
    function(err,result){
        if (err) {
            console.error('Failed to search device groups');
            fn(err);
        }else{
            debug('Success to search device groups ');
            var resData = packageResponseData(result);
            fn(null, resData);
        }
    }); 
}

//post interface
router.post(URLPATH_GROUP, function (req, res, next){
    var param = req.body;
    // param.type = wxConstants.DEVICEGROUPTYPE.GENERAL;

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