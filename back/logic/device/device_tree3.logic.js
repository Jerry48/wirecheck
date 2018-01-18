// device level list child api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_tree3.logic';
var URLPATH = '/v1/device/tree3';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userDeviceRModel = require('../../model/user_device_r_info');
var deviceModel = require('../../model/device_info');
var deviceLevelModel = require('../../model/device_level_info');
var deviceStatusModel = require('../../model/device_status_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	userId: {
		data: 'userId',
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
		data: inputData,
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

	var userId = param.userId || '';
	var data= [];

	debug('Try to list the child of device level of '+userId);

    async.waterfall([
    	function(next){
    		var match = {
                ugId: userId,
            };
            var select = {
                deviceId: 'deviceId',
            };
            var query = {
                select: select,
                match: match,
            };
            userDeviceRModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+' Err:'+msg);
                    next(err);
                }else{
                    console.log('test*****************************************************************8');
                    next(null,rows);
                }
            });
    	},
        function(result,next){
            console.log('test*****************************************************************88');
            var deviceIds = [];
            for (var i=0;i<result.length;i++){
                deviceIds.push(result[i].deviceId);
            }

            var sqlstr = 'select id, temperature, batteryVoltage from '+deviceStatusModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr += deviceIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceStatusModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for(var i=0;i<rows.length;i++){
                        data[i] = {}; 
                    }
                    for(var i=0;i<rows.length;i++){
                        data[i].deviceId = rows[i].id;
                        data[i].temperature = rows[i].temperature; 
                        data[i].batteryVoltage = rows[i].batteryVoltage; 
                    }
                    next(null,data);
                }
            });
        },
        function(data,next){
            var deviceIds = [];
            for (var i=0;i<data.length;i++){
                deviceIds.push(data[i].deviceId);
            }
            console.log(data[66]);
            console.log(data[67]);

            var sqlstr = 'select deviceID, name, parentId from '+deviceModel.tableName;
            sqlstr +=' where deviceID in ("';
            sqlstr += deviceIds.join('","');
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
                        data[i].name = rows[i].name;
                        data[i].parentId = rows[i].parentId;  
                        console.log(data[i]);
                    }
                    for(var i=0;i<rows.length;i++){
                        data[i].parent = []; 
                    }
                    // console.log(data);
                    next(null,data);
                }
            });
        },

        //1
        function(data,next){
            var parentIds = [];
            for (var i=0;i<data.length;i++){
                parentIds.push(data[i].parentId);
            } 
            var sqlstr = 'select id, name, parentId, level from '+deviceLevelModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr += parentIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceLevelModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                	var k = 0;
                    for(var i=0;i<data.length;i++){
                    	console.log(i);
                        for(var j=0;j<rows.length;j++){
                            if(data[i].parentId == rows[j].id){
                                var level = rows[j].level;
                                data[i].parentId = rows[j].parentId;
                                console.log(data[i].parentId);
                                data[i].parent[level] = {
                                    id: rows[j].id,
                                    name: rows[j].name
                                };  
                                
                            }
                        }
                        if(data[i].parentId == 0){
                                data[i].flag = 1;
                        }else{
                                data[i].flag = 0;
                        } 
                    }
                    next(null,data);
                }
            });
        },
        //2
        function(data,next){
            var parentIds = [];
            var tmpData;
            for (var i=0;i<data.length;i++){
                if(data[i].parentId != 0){
                   tmpData = data[i].parentId;
                   break;
                } 
            } 

            for (var i=0;i<data.length;i++){
                if(data[i].parentId == 0){
                   parentIds.push(tmpData); 
                } else{
                    parentIds.push(data[i].parentId); 
                }
            } 

            var sqlstr = 'select id, name, parentId, level from '+deviceLevelModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr += parentIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceLevelModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for(var i=0;i<data.length;i++){
                        if(data[i].flag == 0){
                            for(var j=0;j<rows.length;j++){
                                if(data[i].parentId == rows[j].id){
                                    var level = rows[j].level;
                                    data[i].parent[level] = {
                                        id: rows[j].id,
                                        name: rows[j].name
                                    };  
                                    data[i].parentId = rows[j].parentId;
                                }
                                break;
                            }
                            if(data[i].parentId == 0){
                                data[i].flag = 1;
                            }else{
                                data[i].flag = 0;
                            }
                        }
                    }
                    next(null,data);
                }
            });
        },
        //3
        function(data,next){
            var parentIds = [];
            var tmpData;
            for (var i=0;i<data.length;i++){
                if(data[i].parentId != 0){
                   tmpData = data[i].parentId;
                   break;
                } 
            } 

            for (var i=0;i<data.length;i++){
                if(data[i].parentId == 0){
                   parentIds.push(tmpData); 
                } else{
                    parentIds.push(data[i].parentId); 
                }
            } 

            var sqlstr = 'select id, name, parentId, level from '+deviceLevelModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr += parentIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceLevelModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for(var i=0;i<data.length;i++){
                        if(data[i].flag == 0){
                            for(var j=0;j<rows.length;j++){
                                if(data[i].parentId == rows[j].id){
                                    var level = rows[j].level;
                                    data[i].parent[level] = {
                                        id: rows[j].id,
                                        name: rows[j].name
                                    };  
                                    data[i].parentId = rows[j].parentId;
                                }
                                break;
                            }
                            if(data[i].parentId == 0){
                                data[i].flag = 1;
                            }else{
                                data[i].flag = 0;
                            }
                        }
                    }
                    next(null,data);
                }
            });
        },
        //n...
    ], 
    function(err, result){
    	if (err) {
    		console.error('Failed to list device Level!'+userId);
    		fn(err);
    	}else{
    		debug('Success to list the device Level:'+userId);
    		var resData = packageResponseData(result);
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