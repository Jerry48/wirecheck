// user edit api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_info_search.logic';
var URLPATH = '/v1/device/info/search';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceModel = require('../../model/device_info');
var deviceProductModel = require('../../model/device_product_info');
var deviceStatusModel = require('../../model/device_status_info');
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./device.logic');

var refModel = {
    size:{
        data: 0,
        rangeCheck: function(data){
            return data > 0;
        },
    },
    index:{
        data:0,
        rangeCheck: function(data){
            return data >=0;
        },
    },
    area: {
        data: 'area',
        rangeCheck: null,
        optional:1,
    },
    name: {
        data: 'name',
        rangeCheck: null,
        optional:1,
    },
    deviceTele: {
        data: 'deviceTele',
        rangeCheck: null,
        optional:1,
    },
    lineId: {
        data: 'lineId',
        rangeCheck: null,
        optional:1,
    },
    danger: {
        data: 'danger',
        rangeCheck: null,
        optional:1,
    },
    status: {
        data: 0,
        rangeCheck: null,
        optional:1,
    },
    order: {
        data: 'order',
        rangeCheck:null,
        optional:1,
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
    
    var list = [];

    var resData = {
        list: list,
    };

    for (var i = 0; i < inputData.length; i++) {
        var data = inputData[i];
        var value = {
            deviceId: data.deviceID,
            deviceName: data.deviceName,
            deviceTele: data.deviceTele,
            area: data.area,
            lineName: data.lineName,
            danger: data.danger,
            status: data.status,
            latitude: data.latitude,
            longitude: data.longitude,
            deviceMeid: data.deviceMeid,           
        };

        resData.list.push(value);
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

    var index = param.index && Number(param.index) || 0;
    var size = param.size && Number(param.size) || 10;
    var area = param.area || '';
    var name = param.name || '';
    var deviceTele = param.deviceTele || '';
    var lineId = param.lineId || '';
    var danger = param.danger || '';
    var status = param.status || 0;
    var order = param.order || 'deviceID';
    var userId = param.userId;
    var userType = (param.userType === undefined) ? 1 : param.userType;

    var info = [];
    var tmpids = [];
    var ids = [];
    async.waterfall([
        function(next){
            if(userType){
                next(null,0);
            }else{
                var match = {
                    userId: userId,
                    comment: 'privilege'
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
                        next(null,rows);
                    }
                });
            }
        },
        function(result,next){
            if(userType){
                var sqlstr = 'select * from tb_device_info;';
                var query = {
                    sqlstr: sqlstr,
                }
                deviceModel.query(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        for(var i=0;i<rows.length;i++){
                            tmpids.push(rows[i].deviceID)
                        }
                        next(null,tmpids);
                    }
                });
            }else{
                var match = {
                    groupId: result[0].groupId,
                };
                var select = {
                    deviceId: 'deviceId',
                };
                var query = {
                    select: select,
                    match: match,
                };
                deviceGroupMemModel.lookup(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        for(var i=0;i<rows.length;i++){
                            tmpids.push(rows[i].deviceId)
                        }
                        next(null,tmpids);
                    }
                });
            }
        },
        function(tmpids, next){
            var sqlstr = 'select deviceID,name,area,lineName,danger,latitude,longitude from '+deviceModel.tableName+' where';  
                sqlstr += ' name like "%'+name+'%" and danger like "%'+danger+'%" and area like "%'+area+'%" and lineId like "%'+lineId+'%" and deviceID in ("' +tmpids.join('","')+'");';              
            
            console.log(sqlstr);
            var query = {
                sqlstr: sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    console.log(rows.length);
                    for(var i=0;i<rows.length;i++){
                        var tmp = {
                            deviceID: rows[i].deviceID,
                            deviceName: rows[i].name,
                            deviceTele: 'deviceTele',                            
                            area: rows[i].area,
                            lineName: rows[i].lineName,
                            danger: rows[i].danger,
                            status: 2,
                            latitude: rows[i].latitude,
                            longitude: rows[i].longitude,
                            deviceMeid: 'deviceMeid',
                        }
                        info.push(tmp);
                        console.log(tmp);
                    }
                    console.log('************ 1 ************'+info);
                    next(null, info);
                }
            });
        },
        function(data,next){
            for(var i=0;i<data.length;i++){
                ids.push(data[i].deviceID);
            }
            var sqlstr = "select id,deviceMeid,deviceTele";
            sqlstr += ' from '+deviceProductModel.tableName+' where ';
            sqlstr += 'id in("' + ids.join('","') +'") and deviceTele like "%'+deviceTele+'%"';
            var query = {
                sqlstr: sqlstr
            }
            deviceProductModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var info2 = [];
                    for(var i=0;i<ids.length;i++){
                        for(var j=0;j<rows.length;j++){
                            if(ids[i]==rows[j].id){
                                data[i].deviceTele = rows[j].deviceTele;
                                data[i].deviceMeid = rows[j].deviceMeid;
                                info2.push(data[i]);
                                console.log(data[i]);
                            }
                        }
                    }
                    console.log('************ 2 ************'+info2);
                    next(null,info2);                      
                }
            })
        },
        function(data,next){
        	var data2 = [];
        	var ids2 = [];
            for(var i=0;i<data.length;i++){
                ids2.push(data[i].deviceID);
                data2.push(data[i])
            }
            var sqlstr = "select id,status";
            sqlstr += ' from '+deviceStatusModel.tableName+' where ';
            sqlstr += 'id in("' + ids2.join('","') +'")';
            if(status == 2){
                sqlstr += ';'; 
            }else{
                sqlstr += ' and status = '+status+';';
            }
            
            var query = {
                sqlstr: sqlstr
            }
            deviceStatusModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var info3 = [];
                    for(var i=0;i<ids2.length;i++){
                        for(var j=0;j<rows.length;j++){
                            if(ids2[i]==rows[j].id){
                            	data2[i].status = rows[j].status;
                                info3.push(data2[i]);
                            }
                        }
                    }
                    console.log('************ 3 ************'+info3);
                    next(null,info3);                      
                }
            })
        },
        // function(total,next){
        //     var offset = index * size;
        //     var limit = size;
        //     if (offset>total) {
        //         var msg = 'Err: The required index is out of range!';
        //         console.error(moduleName+msg);
        //         debug('index='+index+', size='+size +',total='+total);
        //         return next({code:errorCode.PARAM_INVALID, msg: msg});
        //     }
            
        //     var sqlstr = 'select deviceID,name,area,danger,lineName,channelNo2,channel2Name,deviceWorkBeginTime,deviceWorkEndTime,photoSize,capturePeriod,resolution,latitude,longitude';
        //     if(lineId=='0'){
        //         sqlstr += ' from '+deviceModel.tableName+ ' where name like "%'+name+'%" and danger like "%'+danger+'%" and area like "%'+area+'%"';
        //     }else{
        //         sqlstr += ' from '+deviceModel.tableName+ ' where name like "%'+name+'%" and danger like "%'+danger+'%" and area like "%'+area+'%" and lineId like "%'+lineId+'%"';
        //     }
            
        //     sqlstr += ' order by '+order+' ASC ';
        //     sqlstr += ' LIMIT ' + offset +', '+limit;
        //     sqlstr += ' ; ' ;
        //     var query = {
        //         sqlstr: sqlstr
        //     }
        //     deviceModel.query(query,function(err,rows){
        //         if (err) {
        //             var msg = err.msg  || err;
        //             console.error(moduleName + msg);
        //             next(err);
        //         }else{
        //             for(var i=0;i<rows.length;i++){
        //                 info[i] = {
        //                     deviceID: rows[i].deviceID,
        //                     latitude: rows[i].latitude,
        //                     longitude: rows[i].longitude,
        //                     area: rows[i].area,
        //                     danger: rows[i].danger,
        //                     channelNo2: rows[i].channelNo2,
        //                     channel2Name: rows[i].channel2Name,
        //                     deviceWorkBeginTime: rows[i].deviceWorkBeginTime.toString(),
        //                     deviceWorkEndTime: rows[i].deviceWorkEndTime.toString(),
        //                     photoSize: rows[i].photoSize,
        //                     resolution: rows[i].resolution,
        //                     capturePeriod: rows[i].capturePeriod,
        //                     deviceName: rows[i].name,
        //                     deviceTele: 'deviceTele',
        //                     deviceMeid: 'deviceMeid',
        //                     lineName: rows[i].lineName,
        //                 }
        //                 ids.push(rows[i].deviceID);
        //             }
        //             var result = {
        //                 total: total,
        //                 info: info,
        //             };
        //             console.log(result);
        //             next(null,result);                        
        //         }
        //     })
        // },
        
    ], 
    function(err,result){
        if (err) {
            console.error('Failed to search user info!');
            fn(err);
        }else{
            debug('Success to search user info!');
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