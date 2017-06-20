// user create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_ifbind.logic';
var URLPATH = '/v1/user/ifbind';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../back/model/user_info');
var wechatModel = require('../../back/model/wechat_info');

//helper 
var logic_helper = require('../../common/logic_helper');
var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

var refModel = {
	openid: {
		data: 'openid',
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
	var bindFlag = inputData.bindFlag;
    if (bindFlag == 1) {
        var resData = {
            bindFlag: bindFlag,
            userId: inputData.info.userId,
            userName: inputData.info.userName,
            name: inputData.info.name,
            mobile: inputData.info.mobile,
            department: inputData.info.department,
            gender: inputData.info.gender,
        };
    }else{
        var resData = {
            bindFlag: bindFlag,
        };
    }
	
	return resData;
}

function checkUserName(param, fn){
	var select = {
		userName: 'userName',
	};
	var match = {
		userName: param.userName || '',
	};

	var query = {
		select: select,
		match: match,
	};

	userModel.lookup(query, function(err, rows){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to check the userName duplicated!');
			fn(err);
		}else{
			if (rows.length) {
				console.error('duplicated userName:'+param.userName);
				fn({code: errorCode.USER_INVALID,
				    msg: 'duplicated userName!'});
			}else {
				fn(null);
			}
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
	var openid = param.openid;
		
	debug('Try to search the user:'+openid);

	var result = {};

    async.waterfall([
        function(next){
            var select = {
            	userId: "",
            };
            var match = {openid: openid};
            var query = {
                match:match,
                select: select
            };
            wechatModel.lookup(query,function(err,rows){
                if(err)
                    next(err);
                else{
                    if(rows.length == 0){
                        result.bindFlag = 0;
                    }else{
                        result.bindFlag = 1;
                        result.userId = rows[0].userId;
                    }
                    next(null,result);
                }
            });
        },
        function(result,next){
            if(result.bindFlag == 1){
                var select = {
                    userId: "",
                    userName:"",
                    name:"",
                    mobile:"",
                    department:"",
                    gender: 0,
                }
                var match = {
                    userId : result.userId,
                }
                var query = {
                    match:match,
                    select: select
                };
                userModel.lookup(query,function(err,rows){
                    if(err)
                        next(err);
                    else{
                        result.info = rows[0];
                        next(null,result);
                    }
                });
            }else{
                next(null,result);
            } 
        },
    ], 
    function(err,result){
    	if (err) {
    		console.error('Failed to search user!'+openid);
    		fn(err);
    	}else{
    		debug('Success to search the user:'+openid);
    		var resData = packageResponseData(result);
			fn(null, resData);
    	}
    })
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