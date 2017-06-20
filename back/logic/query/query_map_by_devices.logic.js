// query map by devices api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.10, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_device_by_map.logic';
var URLPATH = '/v1/device/map/range';


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
var deviceStatusModel = require('../../model/device_status_info');
var pictureModel = require('../../model/picture_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var latlngHelper = require('../../../common/latlngHelper');
var fileserverHelper = require('../../../common/fileserverHelper');

var deviceHelper = require('../device/device.logic');

var refModel = {
    type:{
        data: 11,
        rangeCheck: null, 
    },
    id:{
        data: [],
        optional: 1,
        rangeCheck: null,
    },
    deviceIds:{
        data: [],
        optional: 1,
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
    
    var devices = inputData.devices;
    var deviceStatus = inputData.deviceStatus;
    var pics = inputData.pics;
    var latitudeLow =  wxConstants.LATITUDE.LEFTDEFAULT;
    var latitudeHigh =  wxConstants.LATITUDE.RIGHTDEFAULT;
    var longitudeLeft =  wxConstants.LONGITUDE.LOWDEFAULT;
    var longitudeRight =  wxConstants.LONGITUDE.HIGHDEFAULT;

    var resData = {
        longitudeLeft: wxConstants.LONGITUDE.LOWDEFAULT,
        longitudeRight: wxConstants.LONGITUDE.HIGHDEFAULT,
        latitudeLow: wxConstants.LATITUDE.LEFTDEFAULT,
        latitudeHigh: wxConstants.LATITUDE.RIGHTDEFAULT,
        size: devices.length,
        list: [],
    };
    if (devices.length > 0) {
        longitudeLeft = devices[0].longitude;
        longitudeRight = devices[0].longitude;
        latitudeLow = devices[0].latitude;
        latitudeHigh = devices[0].latitude;
    }
    for (var i = 0; i < devices.length; i++) {
        var j = 0;

        for (j = i; j < deviceStatus.length; j++) {
            if(deviceStatus[j].id== devices[i].deviceID){
                devices[i].batteryVoltage = deviceStatus[j].batteryVoltage;
                devices[i].chargeVoltage = deviceStatus[j].chargeVoltage;
                devices[i].temperature = deviceStatus[j].temperature;
                devices[i].alert = deviceStatus[j].alert;
                devices[i].alertId = deviceStatus[j].alertId;
                devices[i].status = deviceStatus[j].status;
            }
        }

        if (j==deviceStatus.length) {
            for (j = 0; j < i; j++) {
                if(deviceStatus[j].id== devices[i].deviceID){
                    devices[i].batteryVoltage = deviceStatus[j].batteryVoltage;
                    devices[i].chargeVoltage = deviceStatus[j].chargeVoltage;
                    devices[i].temperature = deviceStatus[j].temperature;
                    devices[i].alert = deviceStatus[j].alert;
                    devices[i].alertId = deviceStatus[j].alertId;
                    devices[i].status = deviceStatus[j].status;
                } 
            }
        }

        for (j = i; j < pics.length; j++) {
            if(pics[j]!=null){
                if(pics[j].deviceID== devices[i].deviceID){
                    devices[i].picUrl= fileserverHelper.getFileServerUrl(pics[j].pictureWebURL);
                    devices[i].thumbnailPicUrl= fileserverHelper.getFileServerThumbnailUrl(pics[j].pictureWebURL);
                }
            }
        }

        if (j==pics.length) {
            for (j = 0; j < i; j++) {
                if(pics[j]!=null){
                  if(pics[j].deviceID== devices[i].deviceID){
                        devices[i].picUrl= fileserverHelper.getFileServerUrl(pics[j].pictureWebURL);
                        devices[i].thumbnailPicUrl= fileserverHelper.getFileServerThumbnailUrl(pics[j].pictureWebURL);
                    }   
                }
            }
        }

        if (longitudeLeft > devices[i].longitude) {
            longitudeLeft = devices[i].longitude;
        }
        if (longitudeRight < devices[i].longitude) {
            longitudeRight = devices[i].longitude;
        }
        if (latitudeLow> devices[i].latitude) {
            latitudeLow = devices[i].latitude;
        }
        if (latitudeHigh < devices[i].latitude) {
            latitudeHigh = devices[i].latitude;
        }
        resData.list.push(devices[i]);
    }
    
    resData.longitudeLeft = longitudeLeft - 0.1;
    resData.longitudeRight = longitudeRight + 0.1;
    resData.latitudeLow = latitudeLow - 0.1;
    resData.latitudeHigh = latitudeHigh +0.1;

    return resData;
}

function findDeviceIdsByLevel(param, fn){
    var levelid = [];
    levelid = param.id;
    var ids = [];
    var len = levelid.length;
    for(var i=0;i<len-1;i++){
        var query = {
            ids: levelid[i] || '',
            select : {deviceID:'deviceId'},
        };
        deviceHelper.findAllDevicesByLevel(query, function(err, rows){
            if (err) {
                fn(err);
            }else{
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].deviceID);
                }
                console.log("``````````````````````````````");
                console.log(ids);
                // fn(null, ids);
            }
        });
    }
    var query = {
        ids: levelid[len-1] || '',
        select : {deviceID:'deviceId'},
    };
    deviceHelper.findAllDevicesByLevel(query, function(err, rows){
        if (err) {
            fn(err);
        }else{
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].deviceID);
            }
            console.log("``````````````````````````````");
            console.log(ids);
            fn(null, ids);
        }
    });

}

function findDeviceIdsByGroup(param, fn){
    var groupid = [];
    groupid = param.id;
    var ids = [];
    var len = groupid.length;
    for(var i=0;i<len-1;i++){
        var select = {
           deviceId: '',
        };
        var match = {
            groupId: groupid[i],
        };
        var query = {
            select: select,
            match: match,
        };
        deviceGroupMemModel.lookup(query, function(err, rows){
            if (err) {
                var msg = err.msg||err;
                console.error(moduleName+ msg);
                fn(err);
            }else {
                for (var i = 0; i < rows.length; i++) {
                     ids.push(rows[i].deviceId);
                }
            }
        });
    }
    var select = {
        deviceId: '',
    };
    
    var match = {
        groupId: groupid[len-1],
    };
    var query = {
        select: select,
        match: match,
    };
    deviceGroupMemModel.lookup(query, function(err, rows){
        if (err) {
            var msg = err.msg||err;
            console.error(moduleName+ msg);
            fn(err);
        }else {
            for (var i = 0; i < rows.length; i++) {
               ids.push(rows[i].deviceId);
           }
           fn(null, ids);
       }
    }); 
}

function findPic(param,fn) {
    console.log('findpic!');
    var result = [];
    async.mapSeries(param,
        function(item,next){
            var sqlstr = 'select deviceID,pictureID,pictureWebURL from '+pictureModel.tableName+' where deviceID in ("'+item;
            sqlstr+= '") order by pictureSaveDT DESC LIMIT 0,1;';
            var query = {
                sqlstr:sqlstr,
            };
            pictureModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    if(rows.length==0){
                        next(null);
                    }else{
                        next(null,JSON.parse(JSON.stringify(rows[0])));
                    }
                }
            });
        },
        function(err,result){
            fn(null,result);
    });
}

function processRequest(param, fn){
    //1. check the input data
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var type = param.type || 0;
    var ids = [];
    var devices = [];
    var deviceStatus = [];
    debug('Try to get the device by map');

    async.waterfall([
        function(next){
            //devices
            if (type==0) {
                next(null, []);
            }else if (type==1) {
                findDeviceIdsByLevel(param, next);
            }else if (type==2) {
                findDeviceIdsByGroup(param, next);
            }
        },
        function(ids, next){
            var deviceIds = param.deviceIds || [];
            //pend the device Ids
            for (var i = 0; i < deviceIds.length; i++) {
                ids.push(deviceIds[i]);
            }
            console.log("&&&&&&&&&&&&&&&&&&&&&&"+ids);
            next(null, ids);
        },
        function(ids, next){
            if (ids.length==0) {
                return next(null, []);
            }
            var sqlstr = 'select deviceID, name, latitude,longitude from '+deviceModel.tableName;
            sqlstr +=' where deviceID in ("';
            sqlstr +=ids.join('","');
            sqlstr +='");';
            var query = {
                sqlstr:sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    devices = rows;
                    next(null, ids);
                }
            });
        },
        function(ids, next){
            if (ids.length==0) {
                return next(null, []);
            }

            var sqlstr = 'select * from '+deviceStatusModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr += ids.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceStatusModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    deviceStatus = rows;
                    next(null,ids);
                }
            });
        },
        function(ids,next){
            findPic(ids,next);
        },
    ], 
    function(err,pics){
        if (err) {
            console.error('Failed to find query map by devices!');
            fn(err);
        }else{
            debug('Success to find query map by devices!');
            var resData = packageResponseData({
                devices: devices,
                deviceStatus: deviceStatus,
                pics: pics,
            });
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