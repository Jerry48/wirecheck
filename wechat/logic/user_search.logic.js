// user create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_search.logic';
var URLPATH = '/v1/user/search';

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
	mobile: {
		data: 'mobile',
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
		userId: inputData.userId,
        userName : inputData.userName
	};
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
	var mobile = param.mobile;
		
	debug('Try to search the user:'+mobile);

    async.waterfall([
    	function(next){
    		//1. check whether user is duplicated!
    		//checkUserName(param, next);
    		var select = {
    			userId : "",
                userName : ""
    		};
    		var match = {
    			mobile : mobile
    		};
    		var query = {
    			select : select,
    			match : match
    		};
    		userModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console(moduleName+msg);
                    next(err);
                }else{
                    if (rows.length==0) {
                        var msg = ' Err: Cannot find the alert!';
                        console.error(moduleName+msg);
                        next({code: errorCode.NO_DATA_MATCH, msg: msg});
                    }else {
                         next(null, rows[0]);
                    }                   
                }
            });
        },
        // function(userinfo,next){
        //     var match = {userId: userinfo.userId};
        //     var select = {openId: ""};
        //     var query = {
        //         match:match,
        //         select: select
        //     };
        //     wechatModel.lookup(query,function(err,rows){
        //         if(err)
        //             next(err);
        //         else{
        //             if(rows.length == 0){
        //                 var userinfo.bindFlag = 0;
        //             }else{
        //                 var userinfo.bindFlag = 1;
        //             }
        //             next(null,userinfo);
        //         }
        //     });
        // },
    ], 
    function(err,result){
    	if (err) {
    		console.error('Failed to search user!'+mobile);
    		fn(err);
    	}else{
    		debug('Success to search the user:'+mobile);
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