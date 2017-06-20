// back server notify wechat that there is alert happen list alert api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'manual_notify_push.logic';
var URLPATH = '/v1/notify/push';

var debug = require('debug')(moduleName);
var express = require('express');
var async = require('async');
var API = require('wechat-api');
var config = require('../config');
var moment = require('moment');
var conf = require('../../config');

var pictureModel = require('../../back/model/picture_info');

var channelModel = require('../../back/model/channel_info');
var userModel = require('../../back/model/user_info');
var wechatInfo = require('../../back/model/wechat_info');
var manualPushModel = require('../../back/model/manual_push_pic_list_info');
var pushTarget = require('../../back/model/manual_push_target_list_info');
var pushModel = require('../../back/model/manual_push_info');

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
        pushId: data.pushId,
        openid: data.openid
    };

    var puling = data.openid;
    var pushId = data.pushId; 
    var channelName = inputData.channelName; 
    var name = inputData.name; 

    console.log('**' + puling);
    var createTime = inputData.createTime;

    var deviceId = inputData.deviceId;
    var deviceName = inputData.deviceId;
    var alertType = 0;
    var happenTime = moment(createTime).format('YYYY-MM-DD HH:mm:ss');

    var templateId = '3a4-SWPr9-qGlCOKxFyhhDQAcHac2yzjfEjSWk8zq3U';//模板id
    
    var api = new API(config.appid, config.appsecret);

    api.getAccessToken(function(err,result){
        console.log(result);
    });

    var data = {
        "first": {
          "value":name+"  推送了一张图片给您！",
          "color":"#173177"
    },
    "keyword1":{
            "value": deviceId,//设备id
            "color":"#173177"
        },
        "keyword2": {
            "value": channelName,//设备名称
            "color":"#173177"
        },
        "keyword3": {
            "value": alertType,//报警类型
            "color":"#173177"
        },
        "keyword4": {
            "value": happenTime,//报警时间
            "color":"#173177"
        },
        "remark":{
            "value":"请点击查看！",
            "color":"#173177"
        }
    };

    var pushurl = 'http://'+conf.domain+'/manualPush?id='+pushId;

    for(var i=0;i<puling.length;i++){
        api.sendTemplate(puling[i], templateId, pushurl, data, function (err, result) {
          console.log(result);
      });
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

    var pushId = param.pushId || '';

    debug('Try to push: '+pushId);
    var deviceId = '';
    var createTime = new Date();
    var name = '';
    var channelName = '';
    async.waterfall([
        //find device info
        function(next){
            var select = {
                picId: 'deviceId',
                deviceId : 'deviceId',
                createTime: new Date(),
            };

            var match = {
                pushId : pushId
            };

            var query = {
                select : select,
                match : match
            };

            manualPushModel.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    console.log(rows);
                    deviceId = rows[0].deviceId;
                    createTime = rows[0].createTime;
                    
                    next(null, rows);
                }
            });
        },
        function(tmp,next){
            var select = {
                channelNo: 0,
                deviceID : 'deviceId',
            };

            var match = {
                pictureID : tmp[0].picId
            };

            var query = {
                select : select,
                match : match
            };

            pictureModel.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, rows);
                }
            });
        },
        function(result,next){
            var select = {
                name: '',
            };
            var match = {
                channelNo: result[0].channelNo,
                deviceId: result[0].deviceID,
            };
            var query = {
                select : select,
                match : match
            };
            channelModel.lookup(query,function(err,rows){
                if(err){
                    next(err);
                }else{
                    channelName = rows[0].name;
                    next(null,result);
                }
            })
        },
        function(tmp,next){
            var select = {
                userId : 'userId',
            };

            var match = {
                id : pushId,
            };

            var query = {
                select : select,
                match : match
            };

            pushModel.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, rows);
                }
            });
        },
        function(tmp,next){
            var select = {
                name : 'name',
            };

            var match = {
                userId : tmp[0].userId,
            };

            var query = {
                select : select,
                match : match
            };

            userModel.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    name = rows[0].name;
                    next(null, rows);
                }
            });
        },
        //find users
        function(tmp,next){
            var select = {
                userId : 'userId',
            };

            var match = {
                pushId : pushId
            };

            var query = {
                select : select,
                match : match
            };

            pushTarget.lookup(query,function(err,rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, rows);
                }
            });
        },
        
        function(rows,next){
            //find wechat user
            var userIds = [];
            for(var i = 0;i<rows.length;i++){
                userIds.push(rows[i].userId);
            }
            var sqlstr = 'select openid from '+ wechatInfo.tableName;
            sqlstr +=' where userId in ( "' + userIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };

            wechatInfo.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    var openid = [];
                    for(var i=0;i<rows.length;i++){
                        openid[i] = rows[i].openid;
                    }
                    var result = {
                        pushId : pushId,
                        openid : openid
                    };
                    next(null, result);
                }
            });
        },   
    ], 
    function(err, result){
        if (err) {
            console.error('Failed to push : '+pushId);
            fn(err);
        }else{
            debug('Success to push: '+pushId);
            var data = {
                result: result,
                deviceId: deviceId,
                createTime: createTime,
                name: name,
                channelName: channelName,
            }
            var resData = packageResponseData(data);
            fn(null, resData);
        }
    }); 
}

module.exports.processRequest = processRequest;