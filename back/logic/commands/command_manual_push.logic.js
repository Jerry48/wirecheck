// manually push pictures
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */

'use strict';  
var moduleName = 'command_manual_push.logic';
var URLPATH = '/v1/command/push/pics';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');
var commandModel = require('../../model/command_info');
var pushModel = require('../../model/manual_push_info');
var pushPicsModel = require('../../model/manual_push_pic_list_info');
var pushTargetModel = require('../../model/manual_push_target_list_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var wechatClient = require('../../../common/wechatClient');

var userLogic = require('../user/user.logic');
var picLogic = require('../picture_analysis/picture_analysis.logic');
var deviceHelper = require('../device/device.logic');

var refModel = {
    deviceId: {
        data: 'device id',
        rangeCheck: null,
    },
    picIds:{
        data: [],
        rangeCheck: function(data){
            return (data.length > 0) ? true: false;
        },
    },
    userIds:{
        data: [],
        rangeCheck: function(data){
            return (data.length > 0) ? true: false;
        }
    },
    userId:{
        data: '',
        optional:1,
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
	
	var resData = {
        id: inputData,
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

	var deviceId = param.deviceId || '';
	var pics = param.picIds || [];
    var users = param.userIds || [];
    var userId = param.userId || '';
    var pushId = dataHelper.createId(deviceId);

    debug('Try to push the pictures of device:'+deviceId
        +' with pushId:'+pushId);

    async.series([
        //0. validate the data
        //0.check the userId exist
        /*
        function(next){
            userLogic.checkUserExist({userId: userId},function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' '+ msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        var msg = ' Err: The user is not exist';
                        console.error(moduleName + msg);
                        next({
                            code: errorCode.DB_NO_MATCH_DATA,
                            msg: msg,
                        });
                    }else {
                        next(null);
                    }
                }
            });
        },*/
        function(next){           
           var values = {
             id: pushId,
             userId: userId,
             deviceId: deviceId,
             comment:'push pictures',
           };
           var query = {
             fields: values,
             values: values,
           };
           pushModel.create(query, next);
        },
        function(next){
            var values = [];
            for (var i = 0; i < pics.length; i++) {
                var pic = pics[i];
                if (!pic.picId) {
                    continue;
                }
                var id = dataHelper.createId(pushId+pic.picId);
                var value = {
                    id: id,
                    pushId: pushId,
                    picId: pic.picId,
                    deviceId: deviceId,
                };
                values.push(value);
                console.log(value);
            }
            console.log(values[0]);

            var query = {
                fields: values[0],
                values:values,
            };
            pushPicsModel.create(query, next);
        },
        function(next){
            var values = [];
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (!user.userId) {
                    continue;
                }
                var id = dataHelper.createId(pushId+user.userId);
                var value = {
                    id: id,
                    pushId: pushId,
                    userId: user.userId,
                };
                values.push(value);
            }
            var query = {
                fields: values[0],
                values: values,
            };
            pushTargetModel.create(query, next);
        },
        //4. notify the wechat server
        function(next){
            var param = {
                pushId: pushId,
            };
            wechatClient.notifyPush(param, next);
        }
    ], function(err){
        if (err) {
            console.error('Failed to set manaul push pictures!');
            fn(err);
        }else {
            debug('Success to set manaul push pictures!');
            var resData = packageResponseData(pushId);
            fn(null, resData);
        }
    });
}

//post interface
router.post(URLPATH, function (req, res, next){
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    debug('req.body:%j', req.body);

    var param = req.body;
    
    param.userId = param.userId || req.session.userId;

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
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    //debug('req.body:%j', req.body);

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