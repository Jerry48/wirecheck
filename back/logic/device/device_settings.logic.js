// device create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */

'use strict';
var moduleName = 'device_settings.logic';
var URLPATH = '/v1/device/settings';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var channelModel = require('../../model/channel_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    deviceID: {
        data: 'parent level id',
        rangeCheck: null,
    },
    deviceName: {
        data: 'deviceName',
        rangeCheck: null,
    },
    channel1Name: {
        data: 'channel1Name',
        rangeCheck: null,
        optional: 1,
    },
    channel2Name: {
        data: 'channel2Name',
        rangeCheck: null,
        optional: 1,
    },
    channelNo2: {
        data: 0,
        rangeCheck: null,
    },
    channel3Name: {
        data: 'channel3Name',
        rangeCheck: null,
        optional: 1,
    },
    channelNo3: {
        data: 0,
        rangeCheck: null,
    },
    beginHour: {
        data: 'beginHour',
        rangeCheck: null,
    },
    beginMin: {
        data: 'beginMin',
        rangeCheck: null,
    },
    endHour: {
        data: 'endHour',
        rangeCheck: null,
    },
    endMin: {
        data: 'endMin',
        rangeCheck: null,
    },
    capturePeriod: {
        data: 0,
        rangeCheck: null,
    },
    captureTimes: {
        data: 0,
        rangeCheck: null,
    },
    photoSize: {
        data: 0,
        rangeCheck: null,
    },
    resolution: {
        data: 0,
        rangeCheck: null,
    },
};
//FIXME, better way to implement the edit part
var editModel = {

};

function validate(data) {
    if (!data) {
        return false;
    }

    return logic_helper.validate({
        debug: debug,
        moduleName: moduleName,
        refModel: refModel,
        inputModel: data,
    });
}

function packageResponseData(inputData) {
    if (!inputData) {
        return {};
    }

    var resData = {
        id: inputData,
    };

    return resData;
}


// function editDevice(param, fn){
//     var values = logic_helper.parseEditData({
//             debug: debug,
//             inputData: param,
//             editModel: editModel,
//         });
//     var match = {
//         deviceID: param.deviceID,
//     };
//     var query = {
//         update: values,
//         match: match,
//     };
//     deviceModel.update(query, function(err, rows){
//         if (err) {
//             var msg = err.msg || err;
//             console.error('Failed to edit the device!'+msg);
//             fn(err);
//         }else {
//             fn(null);
//         }
//     });
// }

function processRequest(param, fn) {
    //1. check the input data
    if (!validate(param)) {
        var msg = 'invalid data';
        console.error(moduleName + ': ' + msg);
        return fn({
            code: errorCode.PARAM_INVALID,
            msg: msg
        });
    }

    var deviceID = param.deviceID || '';
    var deviceName = param.deviceName || '';
    var channel1Name = param.channel1Name || ''
    var channel2Name = param.channel2Name || '';
    var channelNo2 = param.channelNo2 || 0;
    var channel3Name = param.channel3Name || '';
    var channelNo3 = param.channelNo3 || 0;
    var beginHour = param.beginHour || '';
    var beginMin = param.beginMin || '';
    var endHour = param.endHour || '';
    var endMin = param.endMin || '';
    var photoSize = param.photoSize || 0;
    var capturePeriod = param.capturePeriod || 0;
    var captureTimes = param.captureTimes || 0;
    var resolution = param.resolution || 0;

    beginHour = parseInt(beginHour) < 10 ? ('0' + parseInt(beginHour)) : (beginHour);
    beginMin = parseInt(beginMin) < 10 ? ('0' + parseInt(beginMin)) : (beginMin);
    endHour = parseInt(endHour) < 10 ? ('0' + parseInt(endHour)) : (endHour);
    endMin = parseInt(endMin) < 10 ? ('0' + parseInt(endMin)) : (endMin);

    var deviceWorkBeginTime = new Date();
    deviceWorkBeginTime.setFullYear('2017');
    deviceWorkBeginTime.setMonth('01');
    deviceWorkBeginTime.setDate('01');
    deviceWorkBeginTime.setHours(beginHour);
    deviceWorkBeginTime.setMinutes(beginMin);
    deviceWorkBeginTime.setSeconds('00');

    var deviceWorkEndTime = new Date();
    deviceWorkEndTime.setFullYear('2017');
    deviceWorkEndTime.setMonth('01');
    deviceWorkEndTime.setDate('01');
    deviceWorkEndTime.setHours(endHour);
    deviceWorkEndTime.setMinutes(endMin);
    deviceWorkEndTime.setSeconds('00');

    debug('Try to edit the device ' + deviceID);

    async.series([
            // function(next){
            //  deviceHelper.checkDeviceExist(param, function(err, data){
            //            if (err) {
            //                var msg = err.msg || err;
            //                console.error(moduleName + msg);
            //                next(err);
            //            }else{
            //                if (!data.exist) {
            //                    console.error(moduleName+
            //                        ', Err: The device is not exist');

            //                    next({
            //                        code: errorCode.NO_DATA_MATCH,
            //                        msg: 'The device is not exist!'
            //                    });
            //                }else {
            //                    next(null);
            //                }
            //            }
            //        });
            // },
            function(next) {
                var match = {
                    deviceID: deviceID,
                };
                var values = {
                    deviceWorkBeginTime: deviceWorkBeginTime,
                    deviceWorkEndTime: deviceWorkEndTime,
                    photoSize: photoSize,
                    capturePeriod: capturePeriod,
                    captureTimes: captureTimes,
                    resolution: resolution,
                    name: deviceName,
                    channel1Name: channel1Name,
                    channel2Name: channel2Name,
                    channelNo2: channelNo2,
                    channel3Name: channel3Name,
                    channelNo3: channelNo3,
                }
                var query = {
                    update: values,
                    match: match,
                };
                deviceModel.update(query, function(err, rows) {
                    if (err) {
                        var msg = err.msg || err;
                        console.error('Failed to edit the device!' + msg);
                        fn(err);
                    } else {
                        next(null);
                    }
                });
            },
            function(next) {
                var match = {
                    deviceId: deviceID,
                    channelNo: 2,
                };
                var values = {
                    name: channel2Name,
                    status: channelNo2,
                }
                var query = {
                    update: values,
                    match: match,
                };
                channelModel.update(query, function(err, rows) {
                    if (err) {
                        var msg = err.msg || err;
                        console.error('Failed to edit the device!' + msg);
                        fn(err);
                    } else {
                        next(null);
                    }
                });
            },
            function(next) {
                var match = {
                    deviceId: deviceID,
                    channelNo: 3,
                };
                var values = {
                    name: channel3Name,
                    status: channelNo3,
                }
                var query = {
                    update: values,
                    match: match,
                };
                channelModel.update(query, function(err, rows) {
                    if (err) {
                        var msg = err.msg || err;
                        console.error('Failed to edit the device!' + msg);
                        fn(err);
                    } else {
                        next(null);
                    }
                });
            },
            function(next) {
                var match = {
                    deviceId: deviceID,
                    channelNo: 1,
                };
                var values = {
                    name: channel1Name,
                }
                var query = {
                    update: values,
                    match: match,
                };
                channelModel.update(query, function(err, rows) {
                    if (err) {
                        var msg = err.msg || err;
                        console.error('Failed to edit the device!' + msg);
                        fn(err);
                    } else {
                        next(null);
                    }
                });
            }
        ],
        function(err, device) {
            if (err) {
                console.error(moduleName + ', Failed to edit device ' + deviceID);
                fn(err);
            } else {
                debug('Success to edit the device' + deviceID);
                var resData = packageResponseData(deviceID);
                fn(null, resData);
            }
        });
}

//post interface
router.post(URLPATH, function(req, res, next) {
    var param = req.body;

    logic_helper.responseHttp({
        res: res,
        req: req,
        next: next,
        moduleName: moduleName,
        processRequest: processRequest,
        debug: debug,
        param: param,
    });
});

//get interface for mocha testing
function getCallback(req, res, next) {
    var param = req.query;

    logic_helper.responseHttp({
        res: res,
        req: req,
        next: next,
        moduleName: moduleName,
        processRequest: processRequest,
        debug: debug,
        param: param,
    });
}

router.get(URLPATH, getCallback);

module.exports.router = router;