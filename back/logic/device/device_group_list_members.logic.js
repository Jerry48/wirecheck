// device group list members api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_group_list_members.logic';
var URLPATH_GROUP = '/v1/device/group/listmembers';
var URLPATH_PATROL = '/v1/device/patrol/listmembers';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceProductModel = require('../../model/device_product_info');
var deviceStatusModel = require('../../model/device_status_info');
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
        size: inputData.length,
        list: [],
	};
    for (var i = 0; i < inputData.length; i++) {
        var data ={
            id: inputData[i].deviceID,
            name: inputData[i].deviceName,
            area: inputData[i].area,
            lineName: inputData[i].lineName,
            deviceTele: inputData[i].deviceTele,
            deviceMeid: inputData[i].deviceMeid,
            danger: inputData[i].danger,
            latitude: inputData[i].latitude,
            longitude: inputData[i].longitude,
            status: inputData[i].status,
        };
        resData.list.push(data);
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

	var id = param.id || '';
    var type = param.type || wxConstants.DEVICEGROUPTYPE.GENERAL;
    var ids = [];
    var devices = [];

	debug('Try to get the device members of group:' + id);

    async.waterfall([
    	function(next){
    		deviceHelper.checkDeviceGroupExist(param, function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        var msg = ' Err: the device group is not exist!';

                        console.error(moduleName+msg);
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: msg
                        });
                    }else {
                        next(null,data);
                    }
                }
            });
    	},
        function(tmp,next){
            var match = {
               groupId: id,
               type: type,
            };
            var select = {
                deviceId:'deviceId',
            };
            var query = {
                match: match,
                select: select,
            };
            deviceGroupMemModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for (var i = 0; i < rows.length; i++) {
                       ids.push(rows[i].deviceId);
                    }
                    next(null,rows);
                }
            });
        },
        function(tmp,next){
            var sqlstr = 'select deviceID,name,area,lineName,latitude,longitude,danger from '+deviceModel.tableName;
            sqlstr +=' where deviceID in ("';
            sqlstr += ids.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for(var i=0;i<rows.length;i++){
                        devices[i] = {
                            deviceID: rows[i].deviceID,
                            latitude: rows[i].latitude,
                            longitude: rows[i].longitude,
                            area: rows[i].area,
                            danger: rows[i].danger,
                            deviceName: rows[i].name,
                            deviceTele: '',
                            deviceMeid: '',
                            lineName: rows[i].lineName,
                            status: 1,
                        }
                    }
                    next(null,devices);
                }
            });
        },
        function(tmp,next){
            var sqlstr = "select id,deviceMeid,deviceTele";
            sqlstr += ' from '+deviceProductModel.tableName+' where ';
            sqlstr += 'id in("' + ids.join('","') +'")';
            var query = {
                sqlstr: sqlstr
            }
            deviceProductModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    for(var i=0;i<devices.length;i++){
                        for(var j=0;j<rows.length;j++){
                            if(devices[i].deviceID==rows[j].id){
                                devices[i].deviceTele = rows[j].deviceTele;
                                devices[i].deviceMeid = rows[j].deviceMeid;
                            }
                        }
                    }
                    next(null,devices);                      
                }
            })
        },
        function(devices,next){
            var sqlstr = "select id,status";
            sqlstr += ' from '+deviceStatusModel.tableName+' where ';
            sqlstr += 'id in("' + ids.join('","') +'")';
            var query = {
                sqlstr: sqlstr
            }
            deviceStatusModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    for(var i=0;i<devices.length;i++){
                        for(var j=0;j<rows.length;j++){
                            if(devices[i].deviceID==rows[j].id){
                                devices[i].status = rows[j].status;
                            }
                        }
                    }
                    next(null,devices);                      
                }
            })
        },
    ], 
    function(err,devices){
    	if (err) {
    		console.error('Failed to find device group members !'+id);
    		fn(err);
    	}else{
    		debug('Success to find device group members'+id);
    		var resData = packageResponseData(devices);
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