// user create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_bind.logic';
var URLPATH = '/v1/user/bind';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var wechatModel = require('../../back/model/wechat_info');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var refModel = {
    userId: {
        data: 'userId',
        rangeCheck: null,
    },  
    accessToken: {
        data: 'accessToken',
        rangeCheck: null,
    },
    refreshToken:{
        data: 'refreshToken',
        rangeCheck: null,
    },
    expiresIn:{
        data: 'expiresIn',
        rangeCheck: null,
    },
    openid:{
        data: 'openid',
        rangeCheck: null,
    },
    nickname: {
        data: 'nickname',
        rangeCheck: null,
    },
    sex: {
        data: 1,
        rangeCheck: function(data){
            return is.inArray(data, [0,1,2]); 
        }
    },
    language: {
        data: 'language',
        rangeCheck: null,
    },
    city: {
        data: 'city',
        rangeCheck: null,
    },
    province: {
        data: 'province',
        rangeCheck: null,
    },
    country: {
        data: 'country',
        rangeCheck: null,
    },
    // headimageurl: {
        // data: 'headimageurl',
        // rangeCheck: null,
    // }
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
        userId: inputData,
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

    var userId = param.userId;

    debug('Try to bind the user:'+ userId);

    async.series([
        function(next){
            var sqlstr = 'delete from ' + wechatModel.tableName+' where userId = "'+userId + '"';
            wechatModel.query(sqlstr,next);
        },
        function(next){
            var values = logic_helper.createData({
                debug: debug,
                inputData: param,
                refModel: refModel,
            });

            var query = {
                fields: values,
                values: values,
            };
            wechatModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error('Failed to create the user!'+msg);
                    next(err);
                }else {
                    next(null, rows);
                }
            });
        }
    ], 
    function(err){
        if (err) {
            console.error('Failed to bind user!'+userId);
            fn(err);
        }else{
            debug('Success to bind user:'+userId);
            var resData = packageResponseData(userId);
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