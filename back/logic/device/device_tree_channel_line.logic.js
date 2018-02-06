// device level list child api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_tree_channel_line.logic';
var URLPATH = '/v1/device/tree/channel/line';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userDeviceRModel = require('../../model/user_device_r_info');
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');
var deviceGroupMemberModel = require('../../model/device_group_member_info');

var deviceModel = require('../../model/device_info');
var deviceLevelModel = require('../../model/device_level_info');
var deviceLineModel = require('../../model/device_line_info');
var deviceStatusModel = require('../../model/device_status_info');
var channelModel = require('../../model/channel_info');

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
        data: inputData,
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

    var userId = param.userId || '';
    var data = [];
    var result = [];

    debug('Try to list the child of device level of '+userId);

    async.waterfall([
        function(next){
            var match = {
                userId: userId,
            };
            var select = {
                groupId: 'groupId',
            };
            var query = {
                select: select,
                match: match,
            };
            userDeviceGroupRModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Err:'+msg);
                    next(err);
                }else{
                    console.log(rows[0].groupId);
                    next(null,rows[0].groupId);
                }
            });
        },
        function(groupId,next){
            if(groupId === '1'){
                var sqlstr = 'select deviceID from tb_device_info where deviceID <> ""';
                var query = {
                    sqlstr: sqlstr
                };
                deviceModel.query(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        console.log(rows);
                        next(null,rows);
                    }
                })
            }else{
                var match = {
                    groupId: groupId,
                };
                var select = {
                    deviceId: 'deviceId',
                };
                var query = {
                    select: select,
                    match: match,
                };
                deviceGroupMemberModel.lookup(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        console.log(rows);
                        next(null,rows);
                    }
                });
            }
        },
        function(result,next){
            var deviceIds = [];
            for (var i=0;i<result.length;i++){
                deviceIds.push(result[i].deviceId || result[i].deviceID);
            }
            var sqlstr = 'select id,name, deviceId, channelNo, status,lineId from '+channelModel.tableName;
            sqlstr +=' where deviceId in ("';
            sqlstr += deviceIds.join('","');
            sqlstr +='") and status = 1;';
            var query = {
                sqlstr: sqlstr,
            };
            channelModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for(var i=0;i<rows.length;i++){
                        data[i] = {
                            id:rows[i].id,
                            text:rows[i].name,
                            deviceId: rows[i].deviceId,
                            lineId: rows[i].lineId,
                            type : 3,
                        }
                    }
                    next(null,data);
                }
            });
        },
        //search for lines
        function(data2,next){
            var lineIds = [];
            for (var i=0;i<data2.length;i++){
                lineIds.push(data2[i].lineId);                    
            }
            
            if(lineIds.length==0){
                next(null,result);
            }else{
                var sqlstr = 'select id, name, parentId from '+deviceLineModel.tableName;
                sqlstr +=' where id in ("';
                sqlstr += lineIds.join('","');
                sqlstr +='");';
                var query = {
                    sqlstr: sqlstr,
                };
                deviceLineModel.query(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+'Failed to get the group member for'+msg);
                        next(err);
                    }else{
                        var tmp = rows;
                        for(var i=0;i<tmp.length;i++){
                            tmp[i].nodes = [];
                            tmp[i].num = 0;
                            for(var j=0;j<data2.length;j++){
                                if(data2[j].lineId == tmp[i].id){
                                    tmp[i].type = 1;
                                    tmp[i].num += 1;
                                    tmp[i].nodes.push(data2[j]);
                                }
                            }
                            tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                            tmp[i].tags = ['温测'];
                        }
                        for(var i=0;i<tmp.length;i++){
                            for(var j=0;j<tmp.length;j++){
                                if((tmp[i].id == tmp[j].id)&&(i!=j)){
                                    tmp[i].num += tmp[j].num;
                                    for(var m=0;m<tmp[j].nodes.length;m++){
                                        tmp[i].nodes.push(tmp[j].nodes[m])
                                    }
                                    tmp.splice(j,1);
                                }
                            }
                        }
                        var data3 = tmp;
                        console.log(data3);
                        next(null,data3);
                    }
                });
            }
        },
        //search for roots
        function(data3,next){
            var parentIds = [];
            for (var i=0;i<data3.length;i++){
                parentIds.push(data3[i].parentId);                    
            }
            
            if(parentIds.length==0){
                next(null,result);
            }else{
                var sqlstr = 'select id, name from '+deviceLevelModel.tableName;
                sqlstr +=' where id in ("';
                sqlstr += parentIds.join('","');
                sqlstr +='");';
                var query = {
                    sqlstr: sqlstr,
                };
                deviceLevelModel.query(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+'Failed to get the group member for'+msg);
                        next(err);
                    }else{
                        var tmp = rows;
                        for(var i=0;i<tmp.length;i++){
                            tmp[i].nodes = [];
                            tmp[i].num = 0;
                            for(var j=0;j<data3.length;j++){
                                if(data3[j].parentId == tmp[i].id){
                                    tmp[i].type = 1;
                                    tmp[i].num += data3[j].num;
                                    tmp[i].nodes.push(data3[j]);
                                }
                            }
                            tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                            tmp[i].tags = ['温测'];
                        }
                        for(var i=0;i<tmp.length;i++){
                            for(var j=0;j<tmp.length;j++){
                                if((tmp[i].id == tmp[j].id)&&(i!=j)){
                                    tmp[i].num += tmp[j].num;
                                    for(var m=0;m<tmp[j].nodes.length;m++){
                                        tmp[i].nodes.push(tmp[j].nodes[m])
                                    }
                                    tmp.splice(j,1);
                                }
                            }
                        }
                        var data4 = tmp;
                        console.log(data4);
                        next(null,data4);
                    }
                });
            }
        },
    ], 
    function(err, result){
        if (err) {
            console.error('Failed to list device Level!'+userId);
            fn(err);
        }else{
            debug('Success to list the device Level:'+userId);
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