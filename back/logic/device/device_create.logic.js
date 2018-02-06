// device create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_create.logic';
var URLPATH = '/v1/device/create';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var userDeviceRModel = require('../../model/user_device_r_info');
var deviceStatusModel = require('../../model/device_status_info');
var deviceProductModel = require('../../model/device_product_info');
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
	parentId: {
		data: 'parent level id',
		rangeCheck: null,
	},
    deviceID: {
        data: 'parent level id',
        rangeCheck: null,
    },
    name:{
        data: 'name',
        rangeCheck:null,
    },
    area:{
        data: 'area',
        rangeCheck:null,
    },
    levels:{
        data: 'levels',
        rangeCheck:null,
    },
    deviceDangerID:{
        data: 0,
        rangeCheck: function(data){
            return data >= 0;
        },
    },
    lineName:{
        data: 'lineName',
        rangeCheck:null,
    },
    lineId:{
        data: 'lineId',
        rangeCheck:null,
    },
    deviceMeid:{
        data: 'deviceMeid',
        rangeCheck:null,
    },
    deviceTele:{
        data: 'deviceTele',
        rangeCheck:null,
    },
    nickName:{
        data: 'nickName',
        rangeCheck: null,
        optional: 1,
    },
    latitude:{
        data: 1.0,
        rangeCheck: null,
        optional: 1,
    },
    longitude:{
        data: 1.0,
        rangeCheck: null,
        optional: 1,
    },
    beatInterval:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    photoInterval:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    resolution:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    mac: {
        data: '',
        rangeCheck: null,
        optional: 1,
    },
    batteryVoltageLow:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    chargeVoltageLow:{
        data: 1,
        rangeCheck: function(data){
            return data >= 0;
        },
        optional: 1,
    },
    temperatureLow:{
        data: 1,
        rangeCheck: null,
        optional: 1,
    },
    batteryVoltageHigh:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    chargeVoltageHigh:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    temperatureHigh:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    // deviceWorkBeginTime:{
    //     data: 'date',
    //     rangeCheck: null,
    //     optional: 1,
    // },
    // deviceWorkEndTime:{
    //     data: 'date',
    //     rangeCheck: null,
    //     optional: 1,
    // },
};

var createModel = {
    parentId: {
        data: 'parent level id',
        rangeCheck: null,
    },
    deviceID: {
        data: 'parent level id',
        rangeCheck: null,
    },
    name:{
        data: 'name',
        rangeCheck:null,
    },
    area:{
        data: 'area',
        rangeCheck:null,
    },
    levels:{
        data: 'levels',
        rangeCheck:null,
    },
    lineId:{
        data: 'lineId',
        rangeCheck:null,
    },
    lineName:{
        data: 'lineName',
        rangeCheck:null,
    },
    nickName:{
        data: 'nickName',
        rangeCheck: null,
        optional: 1,
    },
    latitude:{
        data: 1.0,
        rangeCheck: null,
        optional: 1,
    },
    longitude:{
        data: 1.0,
        rangeCheck: null,
        optional: 1,
    },
    beatInterval:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    photoInterval:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    resolution:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    mac: {
        data: '',
        rangeCheck: null,
        optional: 1,
    },
    batteryVoltageLow:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    chargeVoltageLow:{
        data: 1,
        rangeCheck: function(data){
            return data >= 0;
        },
        optional: 1,
    },
    temperatureLow:{
        data: 1,
        rangeCheck: null,
        optional: 1,
    },
    batteryVoltageHigh:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    chargeVoltageHigh:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    temperatureHigh:{
        data: 1,
        rangeCheck: function(data){
            return data > 0;
        },
        optional: 1,
    },
    // deviceWorkBeginTime:{
    //     data: 'date',
    //     rangeCheck: null,
    //     optional: 1,
    // },
    // deviceWorkEndTime:{
    //     data: 'date',
    //     rangeCheck: null,
    //     optional: 1,
    // },
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
        id: inputData.deviceID,
	};

	return resData;
}
 
function createDevice(param, fn){
    var values = logic_helper.createData({
            debug: debug,
            inputData: param,
            refModel: createModel,
        });
    
    //values.deviceID = dataHelper.createId(param.name + param.parentId);
    values.disableAlert = 0;

    var query = {
        fields: values,
        values: values,
    };

    deviceModel.create(query, function(err, rows){
        if (err) {
            var msg = err.msg || err;
            console.error(moduleName+' Failed to create the device!'+msg);
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
    // var beginTime = param.deviceWorkBeginTime || '';
    // var time = [];
    // time = beginTime.slice(':');
    // var deviceWorkBeginTime = new Date();
    // deviceWorkBeginTime.setFullYear('2016');
    // deviceWorkBeginTime.setMonth('01');
    // deviceWorkBeginTime.setDate('01');
    // deviceWorkBeginTime.setHours(time[0]);
    // deviceWorkBeginTime.setMinutes(time[1]);
    // deviceWorkBeginTime.setSeconds('00');

    // var endTime = param.deviceWorkEndTime || '';
    // var time = [];
    // time = endTime.slice(':');
    // var deviceWorkEndTime = new Date();
    // deviceWorkEndTime.setFullYear('2016');
    // deviceWorkEndTime.setMonth('01');
    // deviceWorkEndTime.setDate('01');
    // deviceWorkEndTime.setHours(time[0]);
    // deviceWorkEndTime.setMinutes(time[1]);
    // deviceWorkEndTime.setSeconds('00');

    // param.deviceWorkBeginTime = deviceWorkBeginTime;
    // param.deviceWorkEndTime = deviceWorkEndTime;

	debug('Try to create the device ' + name);

    async.waterfall([
    	function(next){
    		deviceHelper.checkDeviceExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + ', Err:'+msg);
                    next(err);
                }else{
                    if (data.exist) {
                        console.error(moduleName+', Err: the name duplicated!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device name is duplicated!'
                        });
                    }else {
                        next(null, data);
                    }
                }
            });
    	},
        function(device, next){
            createDevice(param, next);
        },
        function(tmp,next){
            var id = dataHelper.createId(param.userId +param.deviceID);
            var values = {
                id: id,
                deviceId: param.deviceID,
                ugId: param.userId,
                userType: 1,
                privilege: 1,
                follow: 1
            }
            var query = {
                fields: values,
                values: values,
            };
            userDeviceRModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Failed to create the device!'+msg);
                    fn(err);
                }else {
                    next(null, values);
                }
            });
        },
        function(tmp,next){
            var values = {
                id: param.deviceID,
            }
            var query = {
                fields: values,
                values: values,
            };
            deviceStatusModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Failed to create the device!'+msg);
                    fn(err);
                }else {
                    next(null, values);
                }
            });
        },
        function(tmp,next){
            var values = {
                id: param.deviceID,
                deviceID: param.deviceID,
                deviceName: param.name,
                deviceTele: param.deviceTele,
                deviceMeid: param.deviceMeid,
                deviceDangerID: param.deviceDangerID,
                lineName: param.lineName,
            }
            var query = {
                fields: values,
                values: values,
            };
            deviceProductModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Failed to create the device!'+msg);
                    fn(err);
                }else {
                    next(null, values);
                }
            });
        },
        function(tmp,next){
            var values = [];
            for(var i=0;i<3;i++){
                var value = {
                    id: param.deviceID+'_'+(i+1),
                    name: param.name+'_'+(i+1),
                    deviceId: param.deviceID,
                    channelNo: i+1,
                    status: (i+1<3)?1:0,
                    parentId: param.parentId,
                    lineId: param.lineId,
                }
                values.push(value);
            }
            
            var query = {
                fields: values[0],
                values: values,
            };
            channelModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Failed to create the device!'+msg);
                    fn(err);
                }else {
                    next(null, values);
                }
            });
        },
    ], 
    function(err, device){
    	if (err) {
    		console.error('Failed to create device !'+name);
    		fn(err);
    	}else{
    		debug('Success to create the device'+name);
    		var resData = packageResponseData(device);
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
    debug(moduleName+ 'query data is: %j ', param);

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