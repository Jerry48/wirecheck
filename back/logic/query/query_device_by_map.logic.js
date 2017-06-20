// query device by map api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.12, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_device_by_map.logic';
var URLPATH = '/v1/device/query/map';
var URLPATH_2 = '/v1/device/query/map2';

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
    latitudeLow:{
        data: 11,
        rangeCheck: null,
    },
    latitudeHigh:{
        data: 11,
        rangeCheck: null,
    },
    longitudeLeft:{
        data: 11,
        rangeCheck: null,
    },
    longitudeRight:{
        data: 11,
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

    var resData = {
        size: devices.length,
        list: [],
    };
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

        resData.list.push(devices[i]);
    }
    return resData;
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

    var latitudeLow = param.latitudeLow && Number(param.latitudeLow) || wxConstants.LATITUDE.LEFTDEFAULT;
    var latitudeHigh = param.latitudeHigh && Number(param.latitudeHigh) || wxConstants.LATITUDE.RIGHTDEFAULT;
    var longitudeLeft = param.longitudeLeft && Number(param.longitudeLeft) || wxConstants.LONGITUDE.LOWDEFAULT;
    var longitudeRight = param.longitudeRight && Number(param.longitudeRight) || wxConstants.LONGITUDE.HIGHDEFAULT;

    var ids = [];
    var devices = [];
    var deviceStatus = [];
    var pics = [];
    debug('Try to get the device by map');

    async.waterfall([
        function(next){
            var sqlstr = 'select deviceID, name, latitude,longitude from '+deviceModel.tableName;
            sqlstr +=' where ( latitude >'+latitudeLow+') and ';
            sqlstr +=' (latitude < '+latitudeHigh+') and ';
            sqlstr +=' (longitude > '+longitudeLeft+') and ';
            sqlstr +=' (longitude < '+longitudeRight+');';
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
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].deviceID);
                    }
                    next(null,rows);
                }
            });
        },
        function(tmp,next){
            var sqlstr = 'select * from '+deviceStatusModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr += ids.join('","');
            sqlstr +='");';
            console.log('111111111111111');
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
                    next(null,rows);
                }
            });
        },
        function(tmp,next){
            console.log('tmp');
            findPic(ids,next);
        },
    ], 
    function(err,pics){
        if (err) {
            console.error('Failed to find device by map !');
            fn(err);
        }else{
            debug('Success to find device by map!');
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

router.get(URLPATH_2, function(req, res, next){
    var param = req.query;
    debug( ' req.param:%j', param);

    var point = {
        latitude: param.latitude && Number(param.latitude) || 0,
        longitude: param.longitude && Number(param.longitude) || 0,
        distance: param.radius && Number(param.radius) || 2,
    };
   
    var range = latlngHelper.getLatLngRange(point);
    param.latitudeLow = range.min_lat;
    param.latitudeHigh = range.max_lat;
    param.longitudeLeft = range.min_lng;
    param.longitudeRight = range.max_lng;

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