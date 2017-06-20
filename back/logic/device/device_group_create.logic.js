// device group create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_group_create.logic';
var URLPATH_GROUP = '/v1/device/group/create';
var URLPATH_PATROL = '/v1/device/patrol/create';

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
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    // userId:{
    //     data: 'userId',
    //     rangeCheck: null,
    // },
    // userType:{
    //     data: 0,
    //     rangeCheck: null,
    // },
    name:{
        data: 'name',
        rangeCheck:null,
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

function createDeviceGroup(param, fn){
    var values = logic_helper.createData({
            debug: debug,
            inputData: param,
            refModel: refModel,
        });
    
    values.id = dataHelper.createId(
        param.name +param.type+ param.parentId);

    var query = {
        fields: values,
        values: values,
    };

    deviceGroupModel.create(query, function(err, rows){
        if (err) {
            var msg = err.msg || err;
            console.error(moduleName+' Failed to create the device group!'+msg);
            fn(err);
        }else {
            debug('Create device group %j', rows);
            fn(null, values);
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

	var name = param.name || '';
    var type = param.type || wxConstants.DEVICEGROUPTYPE.GENERAL;
	debug('Try to create the device group ' + name);

    async.waterfall([
    	function(next){
    		deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + ', Err:'+msg);
                    next(err);
                }else{
                    if (data.exist) {
                        console.error(moduleName+', Err: the name duplicated!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device group name is duplicated!'
                        });
                    }else {
                        next(null, data);
                    }
                }
            });
    	},
        function(deviceGroup, next){
            createDeviceGroup(param, function(err, data){
                if (err) {
                    next(err);
                }else{
                    next(null, data);
                }
            });
        },
        function(result,next){
            var groupId = result.id;
            var userId = param.userId;
            var id = dataHelper.createId(userId+groupId);
            var value = {
                id: id,
                groupId: groupId,
                groupType: param.type,
                userId: param.userId,
                userType: param.userType,
                comment: 'create',
            }
            var query = {
                fields: value,
                values: value,
            };

            userDeviceGroupRModel.create(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Failed to create the device group!'+msg);
                    next(err);
                }else {
                    debug('Create device group %j', rows);
                    next(null, rows);
                }
            });
        },
    ], 
    function(err, deviceGroup){
    	if (err) {
    		console.error('Failed to create device group!'+name);
    		fn(err);
    	}else{
    		debug('Success to create device group %j', deviceGroup);
    		var resData = packageResponseData(deviceGroup);
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