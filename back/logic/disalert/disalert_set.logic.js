'use strict';
var moduleName = 'disalert_set.logic';
var URLPATH = '/v1/disalert/set';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var alertInfoModel = require('../../model/alert_disable_info');
var deviceModel = require('../../model/device_info');
//helper
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var refModel = {
    id: {
        data: "1",
        rangeCheck: null,
    },
    type:{
        data:1,
        rangeCheck:function(data){
            return is.inArray(data, [0,1]);
        }
    },
    fullDisable:{
        data:1,
        rangeCheck:function(data){
            return is.inArray(data, [0,1]);
        }
    },
    list:{
        data:[],
        rangeCheck:null
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

function packageResponseData(id){
    if(!id){
        return {};
    }

    var resData = {
        id : id
    };
    return resData;
}

function setDisalertInfo(params, fn) {



}

function processRequest(param, fn){
    //1. check the input data
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var id =  param.id ;
    var type = param.type;
    var fullDisable = param.fullDisable;
    var list = param.list;
    list = JSON.parse(list);
    var match = {};



    async.waterfall(
        [
        function(next){
            if (type == 0) {
                var tmpres = {};
                tmpres[id] = 1;
                match.deviceId = id;
                return next(null,tmpres);
            }
            var mm = {};
            var ss = deviceModel.dataModel;
            mm.parentId = id;

            var query = {
                select:ss,
                match:mm
            }
            deviceModel.lookup(query,function(err,rows){
                if (err) {
                    console.error('Failed to check the alert info!' + err);
                    fn(err);
                }else {
                    var data = {};

                    if (rows.length==0)
                    {
                        debug('Cannot find the alert info, %j', match);
                        data.exist = false;
                        fn(null, data);
                    }else {
                        var x;
                        var res = {};
                        for (x in rows){
                            var current = rows[x];
                            var dId = current.deviceID;
                            res[dId] = 1;
                        }
                        next(null,res);
                    }
                }
            })
        },
        function(res,next){
            if (type ==0){
                var update = {
                    disableAlert: fullDisable
                };
                var match = {
                    deviceID: id
                };
                var query = {
                    update: update,
                    match: match,
                };
                deviceModel.update(query, function(err, rows){
                    if (err) {
                        console.error('Failed to update the device!');
                        fn(err);
                    }else {
                        debug('Success to update the device:');


                    }
                });
                return next(null,res);
            }
            var j;
            for (j in res) {

                var update = {
                    disableAlert: fullDisable
                };
                var match = {
                    deviceID: j,
                };
                var query = {
                    update: update,
                    match: match,
                };
                deviceModel.update(query, function(err, rows){
                    if (err) {
                        console.error('Failed to update the device!');
                        fn(err);
                    }else {
                        debug('Success to update the device:');


                    }
                });
            }
            next(null,res);
        },
        function(res, next){
            var y;
            for (y in res){
                var x;

                for (x in list) {
                    var current = list[x];
                    var values = {
                        deviceId: y,
                        dayOfWeek:current.dayOfWeek,
                        fromTime:new Date(),
                        toTime:new Date(),
                        startHour:current.startTime.hour,
                        startMinute:current.startTime.minute,
                        endHour:current.endTime.hour,
                        endMinute:current.endTime.minute,
                        state:0
                    };
                    var select = alertInfoModel.dataModel;
                    var query = {
                        fields: values,
                        values: values,
                    };

                    alertInfoModel.create(query, function (err, rows) {
                        if (err) {
                            console.error('Failed to remove the alert info!' + err);
                            fn(err);
                        } else {
                            var data = {};

                            if (rows.length == 0) {
                                debug('Cannot find the alert info, %j', match);
                                data.exist = false;
                                next(null, {});
                            } else {


                            }
                        }
                    });
                }
            }
            next(null, id);
        },

    ],
        function(err, data){
            if (err) {
                console.error('Failed to set alertinfo!');
                fn(err);
            }else{
                debug('Success to set alertinfo');
                var resData = packageResponseData(data);
                fn(null, resData);
            }
        }
    );


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
