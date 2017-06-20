'use strict';
var moduleName = 'disalert_clear.logic';
var URLPATH = '/v1/disalert/clear';

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
        list: id
    };
    return resData;
}

function removeDisalertInfo(params, fn) {






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
    var match = {};
    async.waterfall([
        function(next){
            if (type == 0){
                var tmpres = {};
                tmpres[id] = 1;
                return next(null, tmpres);
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
                    console.error('Failed to check the device info!' + err);
                    fn(err);
                }else {
                    var data = {};

                    if (rows.length==0)
                    {
                        debug('Cannot find the device info, %j', mm);
                        data.exist = false;
                        next(null, data);
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
            var i;
            for (i in res){
                var select = alertInfoModel.dataModel;
                match = {};
                match.deviceId = i;
                debug(match);
                var query = {
                    select: select,
                    match: match,
                };

                alertInfoModel.remove(query, function(err, rows){
                    if (err) {
                        console.error('Failed to remove the alert info!' + err);
                        fn(err);
                    }else {
                        var data = {};

                        if (rows.length==0)
                        {
                            debug('Cannot find the alert info, %j', match);
                            data.exist = false;
                            return next(null, data);
                        }
                    }
                });
            }
            next(null,id);
        }],


    function(err, data ){
        if (err) {
            console.error('Failed to get disalertinfo'+id);
            fn(err);
        }else{
            debug('Success to get disalertinfo:'+data);
            var resData = packageResponseData(data);
            fn(null, resData);
        }}
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
