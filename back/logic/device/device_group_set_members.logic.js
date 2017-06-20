// device group list members api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_group_set_members.logic';
var URLPATH_GROUP = '/v1/device/group/setmembers';
var URLPATH_PATROL = '/v1/device/patrol/setmembers';

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
        data: 'group id',
        rangeCheck:null,
    },
    deviceIds:{
        data: [],
        rangeCheck: null,
    },
    ids: {
        data: [],
        rangeCheck: null,
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

function findDeviceIdsByLevel(param, fn){
    var levelid = [];
    levelid = param.ids;
    var ids = [];
    var len = levelid.length;
    for(var i=0;i<len-1;i++){
        var query = {
            ids: levelid[i] || '',
            select : {deviceID:'deviceId'},
        };
        deviceHelper.findAllDevicesByLevel(query, function(err, rows){
            if (err) {
                fn(err);
            }else{
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].deviceID);
                }

                console.log(ids);
                // fn(null, ids);
            }
        });
    }
    var query = {
        ids: levelid[len-1] || '',
        select : {deviceID:'deviceId'},
    };
    deviceHelper.findAllDevicesByLevel(query, function(err, rows){
        if (err) {
            fn(err);
        }else{
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].deviceID);
            }
            console.log(ids);
            fn(null, ids);
        }
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

	var groupId = param.id || '';
    var type = param.type || wxConstants.DEVICEGROUPTYPE.GENERAL;
    var ids = [];

	debug('Try to edit the device group ' + groupId);

    async.waterfall([
    	function(next){
            //0. check the input params
            // if (!param.ids || param.ids.length==0) {
            //     var msg = 'The device id list is empty!';
            //     console.error(moduleName+ msg);
            //     var err = {
            //         code: errorCode.PARAM_INVALID,
            //         msg: msg,
            //     };
            //     return next(err);
            // }

            //1. check the group
    		deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        console.error(moduleName+', Err: the device group is not exist!');
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: 'The device group is not exist!'
                        });
                    }else {
                        next(null,data);
                    }
                }
            });
    	},
        function(tmp,next){
            //2. remove all the old data
            var match = {
                groupId: groupId,
                type: type,
            };
            var query = {
                match: match,
            };
            deviceGroupMemModel.remove(query, next);
        },
        function(tmp,next){
            findDeviceIdsByLevel(param, next);
        },
        function(ids,next){
            var deviceIds = param.deviceIds || [];
            //pend the device Ids
            for (var i = 0; i < deviceIds.length; i++) {
                ids.push(deviceIds[i]);
            }
            var values = [];
            for (var i = 0; i < ids.length; i++) {
                 var deviceId = ids[i];
                 var data = {
                    id: dataHelper.createId(deviceId + groupId),
                    type: type,
                    deviceId: deviceId,
                    groupId: groupId,
                 };
                 values.push(data);
            }

            var query = {
                values: values,
                fields: values[0],
            };
            deviceGroupMemModel.create(query, next);
        }
    ], 
    function(err){
    	if (err) {
    		console.error('Failed to set device group members !'+groupId);
    		fn(err);
    	}else{
    		debug('Success to set device group members'+groupId);
    		var resData = packageResponseData(param);
			fn(null, resData);
    	}
    });	
}

//post interface
router.post(URLPATH_GROUP, function (req, res, next){
    var param = req.body;
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