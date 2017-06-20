// device group edit api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_group_edit.logic';
var URLPATH_GROUP = '/v1/device/group/edit';
var URLPATH_PATROL = '/v1/device/patrol/edit';

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

var deviceHelper = require('./device.logic');

var refModel = {
    id:{
        data: 'id',
        rangeCheck:null,
    },
    name:{
        data: 'name',
        rangeCheck: null,
    },
    comment:{
        data: 'comment',
        rangeCheck: null,
        optional: 1,
    },
    type:{
        data: 1,
        rangeCheck: function(data){
            return is.inArray(data, [
                wxConstants.DEVICEGROUPTYPE.GENERAL,
                wxConstants.DEVICEGROUPTYPE.GROUPPATROL,
                ]);
        },
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
    var type = param.type || wxConstants.DEVICEGROUPTYPE.GENERAL;

	debug('Try to edit the device group ' + id);

    async.series([
    	function(next){
    		deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + ', Err:'+msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        console.error(moduleName+', Err: the device group is not exist!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device group is not exist!'
                        });
                    }else {
                        next(null);
                    }
                }
            });
    	},
        function(next){
            var update= {};
            if (param.name) {
                update.name = param.name;
            }
            if (param.comment) {
                update.comment = param.comment;
            }
            var match = {
                id: id,
                type: type,
            };
            var query = {
                update: update,
                match: match,
            };
            deviceGroupModel.update(query, next);
        },
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to edit device group!'+id);
    		fn(err);
    	}else{
    		debug('Success to edit device group'+id);
    		var resData = packageResponseData(param);
			fn(null, resData);
    	}
    });	
}

//post interface
router.post(URLPATH_GROUP, function (req, res, next){
    var param = req.body;
    // param.type = wxConstants.DEVICEGROUPTYPE.GENERAL;

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

//post interface
router.post(URLPATH_PATROL, function (req, res, next){
    var param = req.body;
    param.type = wxConstants.DEVICEGROUPTYPE.GROUPPATROL;

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
    param.type = wxConstants.DEVICEGROUPTYPE.GENERAL;
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

router.get(URLPATH_GROUP, getCallback);

router.get(URLPATH_PATROL, function(req, res, next){
    var param = req.query;
    param.type = wxConstants.DEVICEGROUPTYPE.GROUPPATROL;
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

module.exports.router = router;