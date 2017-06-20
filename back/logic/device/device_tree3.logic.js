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
var channelModel = require('../../model/channel_info');

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
    var data = [];
    var result = [];

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
                    next(null,rows);
                }
            });
    	},
        function(result,next){
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
                        data[i] = {
                            deviceId: rows[i].id,
                            temperature : rows[i].temperature,
                            batteryVoltage : rows[i].batteryVoltage,
                        }
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
                        data[i].id = rows[i].deviceID;
                        data[i].text = data[i].temperature +'°C '+rows[i].name;
                        data[i].parentId = rows[i].parentId;  
                        data[i].type = 3;
                    }
                    next(null,data);
                }
            });
        },
        // function(result,next){
        //     var deviceIds = [];
        //     for (var i=0;i<result.length;i++){
        //         deviceIds.push(result[i].deviceId);
        //     }
        //     var sqlstr = 'select id,name, deviceId, channelNo, status,parentId from '+channelModel.tableName;
        //     sqlstr +=' where deviceId in ("';
        //     sqlstr += deviceIds.join('","');
        //     sqlstr +='") and status = 1;';
        //     var query = {
        //         sqlstr: sqlstr,
        //     };
        //     channelModel.query(query, function(err, rows){
        //         if (err) {
        //             var msg = err.msg || err;
        //             console.error(moduleName+'Failed to get the group member for'+msg);
        //             next(err);
        //         }else{
        //             console.log(rows);
        //             for(var i=0;i<rows.length;i++){
        //                 data[i] = {
        //                     id:rows[i].id,
        //                     text:rows[i].name,
        //                     parentId : rows[i].parentId,  
        //                     type : 3,
        //                 }
        //             }
        //             console.log(data);
        //             next(null,data);
        //         }
        //     });
        // },
        //1
        function(data,next){
            var parentIds = [];
            for (var i=0;i<data.length;i++){
                parentIds.push(data[i].parentId);                    
            }

            if(parentIds.length==0){
                next(null,result);
            }else{
                var sqlstr = 'select id, name, parentId from '+deviceLevelModel.tableName;
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
                        var tmp = rows;
                        for(var i=0;i<tmp.length;i++){
                            tmp[i].num = 0;
                            tmp[i].nodes = [];
                            for(var j=0;j<data.length;j++){
                                if(data[j].parentId == tmp[i].id){
                                    tmp[i].num += 1;
                                    tmp[i].type = 1;
                                    tmp[i].selectable = false;
                                    tmp[i].nodes.push(data[j]);
                                }
                            }
                            tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                            tmp[i].tags = ['温测'];
                        }
                        for(var i=0;i<tmp.length;i++){
                            for(var j=0;j<tmp.length;j++){
                                if((tmp[i].id == tmp[j].id)&&(i!=j)){
                                    tmp[i].num += tmp[j].num;
                                    tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                                    tmp[i].tags = ['温测'];
                                    for(var m=0;m<tmp[j].num;m++){
                                        tmp[i].nodes.push(tmp[j].nodes[m])
                                    }
                                    tmp.splice(j,1);
                                }
                            }
                        }
                        var data2 = tmp;

                        next(null,data2);
                    }
                });
            }
        },
        //2
        function(data2,next){
            var parentIds = [];
            for (var i=0;i<data2.length;i++){
                if(data2[i].parentId=='root'){
                    result.push(data2[i]);
                }else{
                    parentIds.push(data2[i].parentId);                    
                }
            }
            
            if(parentIds.length==0){
                for(var i=0;i<result.length;i++){
                    for(var j=0;j<result.length;j++){
                        if((result[i].id == result[j].id)&&(i!=j)){
                            result[i].num += result[j].num;
                            for(var m=0;m<result[j].nodes.length;m++){
                                result[i].nodes.push(result[j].nodes[m])
                            }
                            result.splice(j,1);
                        }
                    }
                }
                next(null,result);
            }else{
                var sqlstr = 'select id, name, parentId from '+deviceLevelModel.tableName;
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
                        var tmp = rows;
                        for(var i=0;i<tmp.length;i++){
                            tmp[i].nodes = [];
                            tmp[i].num = 0;
                            for(var j=0;j<data2.length;j++){
                                if(data2[j].parentId == tmp[i].id){
                                    tmp[i].type = 1;
                                    tmp[i].selectable = false;
                                    tmp[i].num += data2[j].num;
                                    tmp[i].nodes.push(data2[j]);
                                }
                            }
                            tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                            tmp[i].tags = ['温测'];
                        }
                        for(var i=0;i<tmp.length;i++){
                            for(var j=0;j<tmp.length;j++){
                                if((tmp[i].id == tmp[j].id)&&(i!=j)){
                                    tmp[i].num += tmp[j].num;
                                    for(var m=0;m<tmp[j].nodes.length;m++){
                                        tmp[i].nodes.push(tmp[j].nodes[m])
                                    }
                                    tmp.splice(j,1);
                                }
                            }
                        }
                        var data3 = tmp;
                        console.log(data3);
                        next(null,data3);
                    }
                });
            }
        },
        //3
        function(data3,next){
            var parentIds = [];
            for (var i=0;i<data3.length;i++){
                if(data3[i].parentId=='root'){
                    result.push(data3[i]);
                }else{
                    parentIds.push(data3[i].parentId);                    
                }
            }

            if(parentIds.length==0){
                for(var i=0;i<result.length;i++){
                    for(var j=0;j<result.length;j++){
                        if((result[i].id == result[j].id)&&(i!=j)){
                            result[i].num += result[j].num;
                            for(var m=0;m<result[j].num;m++){
                                result[i].nodes.push(result[j].nodes[m])
                            }
                            result.splice(j,1);
                        }
                    }
                }
                next(null,result);
            }else{
                var sqlstr = 'select id, name, parentId from '+deviceLevelModel.tableName;
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
                        var tmp = rows;
                        for(var i=0;i<tmp.length;i++){
                            tmp[i].nodes = [];
                            tmp[i].num = 0;
                            for(var j=0;j<data3.length;j++){
                                if(data3[j].parentId == tmp[i].id){
                                    tmp[i].type = 1;
                                    tmp[i].selectable = false;
                                    tmp[i].num += data3[j].num;
                                    tmp[i].nodes.push(data3[j]);
                                }
                            }
                            tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                            tmp[i].tags = ['温测'];
                        }
                        for(var i=0;i<tmp.length;i++){
                            for(var j=0;j<tmp.length;j++){
                                if((tmp[i].id == tmp[j].id)&&(i!=j)){
                                    tmp[i].num += tmp[j].num;
                                    tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                                    tmp[i].tags = ['温测'];
                                    for(var m=0;m<tmp[j].nodes.length;m++){
                                        tmp[i].nodes.push(tmp[j].nodes[m])
                                    }
                                    tmp.splice(j,1);
                                }
                            }
                        }
                        var data4 = tmp;
                        console.log(data4);
                        next(null,data4);
                    }
                });
            }
        },
        //4
        function(data4,next){
            var parentIds = [];
            for (var i=0;i<data4.length;i++){
                if(data4[i].parentId=='root'){
                    result.push(data4[i]);
                }else{
                    parentIds.push(data4[i].parentId);                    
                }
            }

            console.log('~~~~~~~~~~~~~~');

            if(parentIds.length==0){
                for(var i=0;i<result.length;i++){
                    for(var j=0;j<result.length;j++){
                        if((result[i].id == result[j].id)&&(i!=j)){
                            console.log('result'+i);
                            console.log(result[i]);
                            console.log('result'+j);
                            console.log(result[j]);
                            result[i].num += result[j].num;
                            result[i].text = result[i].name + "(" + result[i].num + ")";
                            result[i].tags = ['温测'];
                            for(var m=0;m<result[j].nodes.length;m++){
                                result[i].nodes.push(result[j].nodes[m])
                            }
                            result.splice(j,1);
                        }
                    }
                }

                console.log(result);
                var tmp = [];
                for(var n=0;n<result.length;n++){
                    var tmp = result[n].nodes;
                    for(var i=0;i<tmp.length;i++){
                        for(var j=0;j<tmp.length;j++){
                            // console.log(i+'+'+j);
                            // console.log(tmp[i]);
                            // console.log(tmp[j]);
                            if(tmp[i].id == tmp[j].id){
                                if(i!=j){
                                    tmp[i].num += tmp[j].num;
                                    tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                                    for(var m=0;m<tmp[j].nodes.length;m++){
                                        tmp[i].nodes.push(tmp[j].nodes[m])
                                    }
                                    tmp.splice(j,1);
                                }    
                            }
                        }
                    }
                }
                // console.log('!!!!!!!!!!!!~~~~~~~~~~~');
                // console.log(result);
                next(null,result);
            }else{
                var sqlstr = 'select id, name, parentId from '+deviceLevelModel.tableName;
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
                        var tmp = rows;
                        for(var i=0;i<tmp.length;i++){
                            tmp[i].nodes = [];
                            tmp[i].num = 0;
                            for(var j=0;j<data4.length;j++){
                                if(data4[j].parentId == tmp[i].id){
                                    tmp[i].type = 1;
                                    tmp[i].selectable = false;
                                    tmp[i].num += data4[j].num;
                                    tmp[i].nodes.push(data4[j]);
                                }
                            }
                            tmp[i].text = tmp[i].name + "(" + tmp[i].num + ")";
                            tmp[i].tags = ['温测'];
                            result.push(tmp[i]);
                        }

                        for(var i=0;i<result.length;i++){
                            for(var j=0;j<result.length;j++){
                                if((result[i].id == result[j].id)&&(i!=j)){
                                    result[i].num += result[j].num;
                                    for(var m=0;m<result[j].num;m++){
                                        result[i].nodes.push(result[j].nodes[m])
                                    }
                                    result.splice(j,1);
                                }
                            }
                        }
                        console.log(result);
                        next(null,result);
                    }
                });
            }
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