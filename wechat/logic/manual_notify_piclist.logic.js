// back server notify wechat that there is alert happen list alert api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'manual_notify_piclist.logic';
var URLPATH = '/v1/notify/piclist';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../back/model/device_level_info');
var deviceModel = require('../../back/model/device_info');
var alertModel =require('../../back/model/alert_log');
var userDeviceRModel = require('../../back/model/user_device_r_info');
var wechatInfo = require('../../back/model/wechat_info');
var alertPushModel = require('../../back/model/alert_push_log');
var manualPushModel = require('../../back/model/manual_push_info');
var piclistInfo = require('../../back/model/manual_push_pic_list_info')                
var picInfo = require('../../back/model/picture_info')  

var pushModel = require('../../back/model/manual_push_info') 
var userModel = require('../../back/model/user_info') 
var channelModel = require('../../back/model/channel_info') 

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var deviceHelper = require('../../back/logic/device/device.logic');

var refModel = {
    pushId:{
        data: 'pushId',
        rangeCheck:null,
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
    
    var data = inputData.result;

    var resData = {
        pics: data.pics,
        deviceId: data.deviceId,
        time : moment(data.time).format('YYYY-MM-DD HH:mm:ss'),
        name: inputData.name,
        channelName: data.channelName,
    };
    return resData;
}


function processRequest(param, fn){
    //1. check the input data
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var pushId = param.pushId || '';
    var time = new Date();

    debug('Try to find the piclist of pushid: ' + pushId);

    var userId = '';
    var name = '';

    async.waterfall([
        function(next){
            //find who pushed
            var select = {
                userId: '',
            };

            var match = {
                id : pushId,
            } ;
            
            var query = {
                select : select,
                match : match
            };

            pushModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    userId = rows[0].userId;
                    next(null, userId);
                }
            });
        },  
        function(userId,next){
            //find who pushed
            var select = {
                name: '',
            };

            var match = {
                userId : userId,
            } ;
            
            var query = {
                select : select,
                match : match
            };

            userModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    name = rows[0].name;
                    next(null, name);
                }
            });
        }, 
        function(tmp,next){
            //find piclist
            var select = {
                picId : '',
                updateTime: new Date(),
            };

            var match = {
                pushId : pushId,
            } ;
            
            var query = {
                select : select,
                match : match
            };

            piclistInfo.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    time = rows[0].updateTime;
                    next(null, rows);
                }
            });
        },   
        function(rows,next){
            var picIds = [];
            for(var i=0;i<rows.length;i++){
                picIds.push(rows[i].picId);
            }
            var sqlstr = 'select pictureID,deviceID,channelNo,pictureWebURL from '+ picInfo.tableName;
            sqlstr +=' where pictureID in ( "' + picIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };

            picInfo.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    var pics = [];
                    for(var i=0;i<rows.length;i++){
                        pics.push({pictureWebURL:rows[i].pictureWebURL,picId: rows[i].pictureID,});
                    }
                    var deviceId = rows[0].deviceID;
                    var result = {
                        pics: pics,
                        deviceId: deviceId,
                        time: time,
                        channelNo: rows[0].channelNo,
                    }
                    next(null, result);
                }
            });
        },   
        function(result,next){
            var sqlstr = 'select name from '+ channelModel.tableName;
            sqlstr +=' where deviceId = "'+result.deviceId+'" and channelNo='+result.channelNo+';';
            var query = {
                sqlstr: sqlstr,
            };

            channelModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    var tmp = {
                        pics: result.pics,
                        deviceId: result.deviceId,
                        time: result.time,
                        channelNo: result.channelNo,
                        channelName: rows[0].name,
                    }
                    console.log(tmp.channelName);
                    next(null, tmp);
                }
            });
        },
    ], 
    function(err, result){
        if (err) {
            console.error('Failed to get the picURL of pushid:' + pushId);
            fn(err);
        }else{
            debug('Success get the picURL of pushid:' + pushId);
            var data = {
                result: result,
                name: name,
            }
            var resData = packageResponseData(data);
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