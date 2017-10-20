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
var channelModel = require('../../model/channel_info');
var deviceLineModel = require('../../model/device_line_info');
var pictureModel = require('../../model/picture_info');
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');


//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./device.logic');
var fileserverHelper = require('../../../common/fileserverHelper');

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
    deviceDangerID: {
        data: 'deviceDangerID',
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

function countPicDay(ids, result,fn){
    var countlist = [];
    var dayStr = moment().format("YYYY-MM-DD HH:mm:ss").toString().slice(0,10);
    async.map(ids,function(item,next){
        var sqlstr = "select count(*) as total";
        sqlstr += ' from '+pictureModel.tableName+' where ';
        sqlstr += 'createTime like "'+dayStr+'%" and deviceID = "' + item +'"';
        var query = {
            sqlstr: sqlstr
        }
        pictureModel.query(query,function(err,rows){
            if (err) {
                var msg = err.msg  || err;
                console.error(moduleName + msg);
                next(err);
            }else{
                countlist.push({id: item,total:JSON.parse(JSON.stringify(rows[0])).total});
                next(null, rows);
            }
        });
    },
    function(err,data){
        if (err) {
            console.error('Failed to search user info!');
            fn(err);
        }else{
            if (err) {
                console.error('Failed to search user info!');
                fn(err);
            }else{
                for(var i=0;i<result.devices.length;i++){
                    for(var j=0;j<ids.length;j++){
                        if(result.devices[i].deviceID == countlist[j].id){
                            result.devices[i].countPicDay= countlist[j].total;
                        }
                    }
                    
                }
                debug('Success to search user info!');
                fn(null, result);
            }
        }
    })
}

function countPicMonth(ids, result,fn){
    var countlist = [];
    var monthStr = moment().format("YYYY-MM-DD HH:mm:ss").toString().slice(0,7);
    async.map(ids,function(item,next){
        var sqlstr = "select count(*) as total";
        sqlstr += ' from '+pictureModel.tableName+' where ';
        sqlstr += 'createTime like "'+monthStr+'%" and deviceID = "' + item +'"';
        var query = {
            sqlstr: sqlstr
        }
        pictureModel.query(query,function(err,rows){
            if (err) {
                var msg = err.msg  || err;
                console.error(moduleName + msg);
                next(err);
            }else{
                countlist.push({id: item,total:JSON.parse(JSON.stringify(rows[0])).total});
                next(null, rows);
            }
        });
    },
    function(err,data){
        if (err) {
            console.error('Failed to search user info!');
            fn(err);
        }else{
            for(var i=0;i<result.devices.length;i++){
                for(var j=0;j<ids.length;j++){
                    if(result.devices[i].deviceID == countlist[j].id){
                        result.devices[i].countPicMonth = countlist[j].total;
                    }
                }
                
            }
            debug('Success to search user info!');
            fn(null, result);
        }
    })
}

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
        total: inputData.total,
        list: list,
    };

    for (var i = 0; i < inputData.devices.length; i++) {
        var devices = inputData.devices[i];
        var products = inputData.products[i];
        var status = inputData.status[i];
        var channel1 = inputData.channel1[i];
        var channel2 = inputData.channel2[i];
        var channel3 = inputData.channel3[i];
        var time = moment(status.heartBeatTime).format('YYYY-MM-DD HH:mm:ss');

        var value = {
            deviceId: devices.deviceID,
            deviceName: devices.deviceName,
            deviceTele: devices.deviceTele,
            area: devices.area,
            // deviceWorkBeginTime: devices.deviceWorkBeginTime,
            // deviceWorkEndTime: devices.deviceWorkEndTime,
            capturePeriod: devices.capturePeriod,
            photoSize: devices.photoSize,
            resolution: devices.resolution,
            lineName: devices.lineName,
            lineId: devices.lineId,
            latitude: devices.latitude,
            longitude: devices.longitude,
            version:devices.version,
            countPicDay: devices.countPicDay,
            countPicMonth: devices.countPicMonth,

            deviceTele: products.deviceTele,
            deviceMeid: products.deviceMeid,
            deviceDangerID: products.deviceDangerID,

            status: status.status,
            batteryVoltage: status.batteryVoltage,
            temperature: status.temperature,
            batterySolarVoltage: status.batterySolarVoltage,
            capacityVoltage: status.capacityVoltage,
            networkSignal: status.networkSignal,
            heartBeatTime: time,
            
            channelNo1: channel1.channelNo1,
            channel1Name: channel1.channel1Name,
            channelNo2: channel2.channelNo2,
            channel2Name: channel2.channel2Name,
            channelNo3: channel3.channelNo3,
            channel3Name: channel3.channel3Name,

            picUrl1: '',
            thumbnailPicUrl1: '',
            picUrl2: '',
            thumbnailPicUrl2: '',
            picUrl3: '',
            thumbnailPicUrl3: '',
        };
        var beginHour = new Date(devices.deviceWorkBeginTime).getHours();
        var beginMinutes = new Date(devices.deviceWorkBeginTime).getMinutes();
        var endHour = new Date(devices.deviceWorkEndTime).getHours();
        var endMinutes = new Date(devices.deviceWorkEndTime).getMinutes();
        value.beginHour = beginHour;
        value.beginMinutes = beginMinutes;
        value.endHour = endHour;
        value.endMinutes = endMinutes;

        if(channel1.refPicPath1 != null){
            value.picUrl1 = fileserverHelper.getFileServerUrl(channel1.refPicPath1);
            value.thumbnailPicUrl1 = fileserverHelper.getFileServerThumbnailUrl(channel1.refPicPath1);
        }

        if(channel2.refPicPath2 != null){
            value.picUrl2 = fileserverHelper.getFileServerUrl(channel2.refPicPath2);
            value.thumbnailPicUrl2 = fileserverHelper.getFileServerThumbnailUrl(channel2.refPicPath2);
        }

        if(channel3.refPicPath3 != null){
            value.picUrl3 = fileserverHelper.getFileServerUrl(channel3.refPicPath3);
            value.thumbnailPicUrl3 = fileserverHelper.getFileServerThumbnailUrl(channel3.refPicPath3);
        }

        resData.list.push(value);
    }

    return resData;
}

function findLineInfo(result,fn){
    var lineids = [];
    for(var i=0;i<result.devices.length;i++){
        lineids.push(result.devices[i].lineId);
    }
    var sqlstr = "select id,name";
    sqlstr += ' from '+deviceLineModel.tableName+' where ';
    sqlstr += 'id in("' + lineids.join('","') +'");';
    var query = {
        sqlstr: sqlstr
    }
    deviceLineModel.query(query,function(err,rows){
        if (err) {
            var msg = err.msg  || err;
            console.error(moduleName + msg);
            fn(err);
        }else{
            for(var i=0;i<lineids.length;i++){
                // console.log(rows[i]);
                for(var j=0;j<rows.length;j++){
                    if(lineids[i]==rows[j].id){
                        var tmp = JSON.parse(JSON.stringify(rows[j]));
                        result.devices[i].lineName = tmp.name;
                    }
                }
            }
            console.log(result);
            fn(null,result);
        }
    })
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
    var deviceDangerID = param.deviceDangerID === "0" ? "" : param.deviceDangerID;
    var status = param.status || 0;
    var order = param.order || 'deviceID';
    var userId = param.userId;
    var userType = (param.userType === undefined) ? 1 : param.userType;

    var info = [];
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
            // console.log(userType);
            if(parseInt(userType)){

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
                            ids.push(rows[i].deviceID)
                        }
                        // console.log("all devices: ");
                        // console.log(ids);
                        next(null,ids);
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
                            ids.push(rows[i].deviceId)
                        }
                        // console.log("privilege devices: ");
                        // console.log(ids);
                        next(null,ids);
                    }
                });
            }
        },
        // function(ids,next){
        //     //count all the devices
        //     var sqlstr = 'select count(*) as total ';       
        //     sqlstr += ' from '+deviceModel.tableName+';';            
        //     var query = {
        //         sqlstr: sqlstr,
        //     };
        //     deviceModel.query(query, function(err, rows){
        //         if (err) {
        //             var msg = err.msg || err;
        //             console.error(moduleName + msg);
        //             next(err);
        //         }else{
        //             if (rows.length==0) {
        //                 var msg = 'Err: Failed to find the devices!';
        //                 console.error(moduleName+msg);
        //                 next({code:errorCode.DB_ERROR, 
        //                     msg: msg});
        //             }else {
        //                 var data = rows[0];
        //                 next(null, data.total);
        //             }
        //         }
        //     });
        // },
        function(ids,next){
            ids = ids.sort();
            var total = ids.length;
            // console.log(ids.length);
            var offset = index * size;
            var limit = size;
            if (offset>total) {
                var msg = 'Err: The required index is out of range!';
                console.error(moduleName+msg);
                debug('index='+index+', size='+size +',total='+total);
                return next({code:errorCode.PARAM_INVALID, msg: msg});
            }

            // var tmpids = ids.slice(offset,offset+limit);
            
            var sqlstr = "select deviceID,name,area,lineId,deviceWorkBeginTime,deviceWorkEndTime,photoSize,capturePeriod,resolution,latitude,longitude,version";
            sqlstr += ' from '+deviceModel.tableName + ' where deviceID in("' +ids.join('","')+'")';
            sqlstr += ' and name like "%' + name + '%"';
            sqlstr += ' and lineId like "%' + lineId + '%"';
            sqlstr += ' and area like "%' + area + '%"';
            // sqlstr += ' and name like "%' + name + '%"';
            // sqlstr += ' and name like "%' + name + '%"';
            sqlstr += ' order by deviceID ASC ';
            sqlstr += ' LIMIT ' + offset +', '+limit;
            sqlstr += ' ; ' ;
            // console.log(sqlstr)
            var query = {
                sqlstr: sqlstr
            }
            deviceModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    ids = [];
                    var devices = [];
                    for(var i=0;i<rows.length;i++){
                        devices[i] = {
                            deviceID: rows[i].deviceID,
                            latitude: rows[i].latitude,
                            longitude: rows[i].longitude,
                            area: rows[i].area,
                            deviceWorkBeginTime: rows[i].deviceWorkBeginTime.toString(),
                            deviceWorkEndTime: rows[i].deviceWorkEndTime.toString(),
                            photoSize: rows[i].photoSize,
                            resolution: rows[i].resolution,
                            capturePeriod: rows[i].capturePeriod,
                            deviceName: rows[i].name,
                            lineId: rows[i].lineId,
                            version: rows[i].version,
                        }
                        ids.push(rows[i].deviceID);
                    }
                    var result = {
                        total: total,
                        devices: devices,
                        ids: ids
                    };
                    // console.log(result);
                    next(null,result);                        
                }
            })
        },
        function(result,next){
            findLineInfo(result,next);
        },
        function(result,next){
            ids = result.ids;
            console.log('@@@@@@@@@@@@@@@ product',result.ids.length);
            var sqlstr = "select id,deviceMeid,deviceTele,deviceDangerID";
            sqlstr += ' from '+deviceProductModel.tableName+' where ';
            sqlstr += ' deviceTele like "%'+deviceTele+'%" and';
            sqlstr += ' deviceDangerID like "%'+deviceDangerID+'%" and';
            sqlstr += ' id in("' + ids.join('","') +'") order by id ASC';
            console.log(sqlstr);
            var query = {
                sqlstr: sqlstr
            }
            deviceProductModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var products = [];
                    var devices2 = [];
                    var ids2 = [];
                    for(var i=0;i<ids.length;i++){
                        for(var j=0;j<rows.length;j++){
                            if(ids[i]==rows[j].id){
                                ids2.push(rows[j].id);
                                devices2.push(result.devices[i]);
                                products.push({
                                    deviceid: rows[j].id,
                                    deviceTele:rows[j].deviceTele,
                                    deviceMeid:rows[j].deviceMeid,
                                    deviceDangerID:rows[j].deviceDangerID,
                                });
                            }
                        }
                    }
                    
                    result.devices = devices2;
                    result.ids = ids2;
                    result.products = products;
                    console.log(result);
                    next(null,result);                      
                }
            })
        },
        function(result,next){
            ids = result.ids;
            console.log(result.ids.length);
            var sqlstr = "select id,status,batteryVoltage,temperature,heartBeatTime,batterySolarVoltage,capacityVoltage,networkSignal";
            sqlstr += ' from '+deviceStatusModel.tableName+' where ';
            sqlstr += 'id in("' + ids.join('","') +'")';
            if (status !== 2) {
                sqlstr += ' and status like "%' + status + '%"';
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
                    var status = [];
                    var products2 = [];
                    var devices2 = [];
                    var ids2 = [];
                    for(var i=0;i<ids.length;i++){
                        for(var j=0;j<rows.length;j++){
                            if(ids[i]==rows[j].id){
                                ids2.push(rows[j].id);
                                devices2.push(result.devices[i]);
                                products2.push(result.products[i]);
                                status.push({
                                    status:rows[j].status,
                                    batteryVoltage:rows[j].batteryVoltage,
                                    temperature:rows[j].temperature,
                                    heartBeatTime:rows[j].heartBeatTime,
                                    batterySolarVoltage:rows[j].batterySolarVoltage,
                                    capacityVoltage:rows[j].capacityVoltage,
                                    networkSignal:rows[j].networkSignal,
                                });
                            }
                        }
                    }
                    result.products = products2;
                    result.devices = devices2;
                    result.ids = ids2;
                    result.status = status;
                    next(null,result);                      
                }
            })
        },
        function(result,next){
            var sqlstr = "select deviceId,name,status,refPicId,refPicPath";
            sqlstr += ' from '+channelModel.tableName+' where ';
            sqlstr += 'deviceId in("' + ids.join('","') +'") and channelNo = 1';
            var query = {
                sqlstr: sqlstr
            }
            channelModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var channel1 = [];
                    for(var i=0;i<ids.length;i++){
                        for(var j=0;j<rows.length;j++){
                            var tmp = JSON.parse(JSON.stringify(rows[j]))
                            if(ids[i]==tmp.deviceId){
                                channel1.push({
                                    channelNo1:rows[j].status,
                                    channel1Name:rows[j].name,
                                    refPicId1:rows[j].refPicId,
                                    refPicPath1:rows[j].refPicPath,
                                });
                            }
                        }
                    }
                    result.channel1 = channel1;
                    next(null,result);                      
                }
            })
        },
        function(result,next){
            var sqlstr = "select deviceId,name,status,refPicId,refPicPath";
            sqlstr += ' from '+channelModel.tableName+' where ';
            sqlstr += 'deviceId in("' + ids.join('","') +'") and channelNo = 2';
            var query = {
                sqlstr: sqlstr
            }
            channelModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var channel2 = [];
                    for(var i=0;i<ids.length;i++){
                        for(var j=0;j<rows.length;j++){
                            var tmp = JSON.parse(JSON.stringify(rows[j]))
                            if(ids[i]==tmp.deviceId){
                                channel2.push({
                                    channelNo2:rows[j].status,
                                    channel2Name:rows[j].name,
                                    refPicId2:rows[j].refPicId,
                                    refPicPath2:rows[j].refPicPath,
                                });
                            }
                        }
                    }
                    result.channel2 = channel2;
                    // console.log(channel2);
                    next(null,result);                      
                }
            })
        },
        function(result,next){
            var sqlstr = "select deviceId,name,status,refPicId,refPicPath";
            sqlstr += ' from '+channelModel.tableName+' where ';
            sqlstr += 'deviceId in("' + ids.join('","') +'") and channelNo = 3';
            var query = {
                sqlstr: sqlstr
            }
            channelModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    var channel3 = [];
                    for(var i=0;i<ids.length;i++){
                        for(var j=0;j<rows.length;j++){
                            var tmp = JSON.parse(JSON.stringify(rows[j]))
                            if(ids[i]==tmp.deviceId){
                                channel3.push({
                                    channelNo3:rows[j].status,
                                    channel3Name:rows[j].name,
                                    refPicId3:rows[j].refPicId,
                                    refPicPath3:rows[j].refPicPath,
                                });
                            }
                        }
                    }
                    result.channel3 = channel3;
                    next(null,result);                      
                }
            })
        },
        function(result,next){
            countPicDay(ids,result,next);
        },
        function(result,next){
            countPicMonth(ids,result,next);
        }
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