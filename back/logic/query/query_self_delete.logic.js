// device self query group delete api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.12, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_self_delete.logic';
var URLPATH = '/v1/query/self/delete';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceGroupModel = require('../../model/device_group_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('../device/device.logic');

var refModel = {
    id:{
        data: 'id',
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
	
	var resData = {
        id: inputData.id,
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

	var id = param.id || '';
    param.type = wxConstants.DEVICEGROUPTYPE.SELFPATROL;

	debug('Try to delete the self device query group ' + id);

    async.series([
    	function(next){
    		deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        var msg = 'Err: the device self query group is not exist!';
                        console.error(moduleName+ msg);
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: msg
                        });
                    }else {
                        next(null);
                    }
                }
            });
    	},
        function(next){
            var match = {
                id: id,
                type: wxConstants.DEVICEGROUPTYPE.SELFPATROL,
            };
            var query = {
                match: match,
            };
            deviceGroupModel.remove(query, next);
        },
        function(next){
            var match = {
                groupId: id,
            };
            var query = {
                match: match,
            };
            deviceGroupMemModel.remove(query, next);
        }
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to delete device self query!'+id);
    		fn(err);
    	}else{
    		debug('Success to delete device self query'+id);
    		var resData = packageResponseData(param);
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