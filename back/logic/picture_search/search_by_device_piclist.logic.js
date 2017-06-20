// picture search logic
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.19, created by Andy.zhou
 *  
 */
'use strict';
var moduleName = 'search_by_device_piclist.logic';
var debug = require('debug')(moduleName);
var URLPATH = '/v1/search/pics/device/piclist';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var fileserverHelper = require('../../../common/fileserverHelper');

var deviceHelper = require('./../device/device.logic');
var searchLogic = require('./search.logic');

var refModel = {
    type: {
        data: 1,
        rangeCheck: function(data) {
            return is.inArray(data, [0,1,2]);
        }
    },
    id:{
        data: 'name',
        rangeCheck:null,
    },
    channelNo:{
        data: 'channelNo',
        rangeCheck:null,
    },
    size:{
        data: 0,
        rangeCheck: function(data){
        	return data > 0;
        },
    },
    index:{
    	data:0,
    	rangeCheck: function(data){
    		return data >=0;
    	},
    },
    startTime: {
        data: '',
        optional: 1,
        rangeCheck: function(data){
            return moment(data, "YYYY-MM-DD HH:mm:ss").isValid();
        }
    },
    endTime:{
        data: '',
        optional: 1,
        rangeCheck: function(data){
             return moment(data, "YYYY-MM-DD HH:mm:ss").isValid();
        }
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
    var pics = inputData.pics;
    var all = inputData.all;
    var asc = inputData.asc;
    var resData = {
        total: inputData.total,
    	size : pics.length,
    	list: [],
        sizeall: all.length,
        listall: [],
        // sizeasc: asc.length,
        // listasc: [],
    };
    for (var i = 0; i < pics.length; i++) {
    	var data = pics[i];
        var time = moment(data.createTime);
    	var pic = {
            picId: data.pictureID,
    		deviceId: data.deviceID,
            channelNo: data.channelNo,
    		name: data.pictureName,
    		picType: data.type,
    		picUrl: fileserverHelper.getFileServerUrl(data.pictureWebURL),
            thumbnailPicUrl: fileserverHelper.getFileServerThumbnailUrl(data.pictureWebURL),
            time: time.format('YYYY-MM-DD HH:mm:ss'),
    	};
    	resData.list.push(pic);
    }

    for (var i = 0; i < all.length; i++) {
        var data = all[i];
        var time = moment(data.createTime);
        var pic = {
            picId: data.pictureID,
            deviceId: data.deviceID,
            channelNo: data.channelNo,
            name: data.pictureName,
            picType: data.type,
            picUrl: fileserverHelper.getFileServerUrl(data.pictureWebURL),
            thumbnailPicUrl: fileserverHelper.getFileServerThumbnailUrl(data.pictureWebURL),
            time: time.format('YYYY-MM-DD HH:mm:ss'),
        };
        resData.listall.push(pic);
    }

    // for (var i = 0; i < asc.length; i++) {
    //     var data = asc[i];
    //     var time = moment(data.createTime);
    //     var pic = {
    //         picId: data.pictureID,
    //         deviceId: data.deviceID,
    //         channelNo: data.channelNo,
    //         name: data.pictureName,
    //         picType: data.type,
    //         picUrl: fileserverHelper.getFileServerUrl(data.pictureWebURL),
    //         thumbnailPicUrl: fileserverHelper.getFileServerThumbnailUrl(data.pictureWebURL),
    //         time: time.format('YYYY-MM-DD HH:mm:ss'),
    //     };
    //     resData.listasc.push(pic);
    // }

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
    var channelNo = param.channelNo || '';
    var index = param.index && Number(param.index) || 0;
    var size = param.size && Number(param.size) || 10;
    var startTime;
    var endTime;
    if (param.startTime) {
    	startTime = moment(param.startTime);
    	endTime = moment(); //now
    }
    if (param.endTime) {
    	endTime = moment(param.endTime);
    }

    debug('Try to search pictures by device id= ' + id);
    var globalIds = [];
    async.waterfall([
        function(next){
            if (param.type==0) {
                var ids = [];
                ids.push(id);
                next(null, ids);
            }else if (param.type==1) {
                deviceHelper.findDeviceIdsByLevel(param, next);
            }else if (param.type==2) {
                deviceHelper.findDeviceIdsByGroup(param, next);
            }else{
                next(null, []);
            }
        },
        function(ids, next){
            if (ids.length==0) {
               return next(null, 0);
            }
            globalIds = ids;
        	var sqlstr = 'select count(*) as total ';       
        	sqlstr += ' from '+picModel.tableName+' where ';
        	sqlstr += ' (deviceID in("' + ids.join('","') +'"))';
            
        	if (startTime) {
        		sqlstr += ' and ( createTime between \'' 
        			+startTime.format('YYYY-MM-DD HH:mm:ss');
        		sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\') and channelNo = '+channelNo+' order by pictureName DESC';
        	}
        	sqlstr += ';';
        	var query = {
        		sqlstr: sqlstr,
        	};
            picModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                	if (rows.length==0) {
                		var msg = 'Err: Failed to find the pictures!';
                		console.error(moduleName+msg);
                		next({code:errorCode.DB_ERROR, 
                			msg: msg});
                	}else {
						var data = rows[0];
						next(null, data.total);
                	}
                }
            });
        },
        function(total, next){
        	var offset = index * size;
            var limit = size;
        	if (offset>total) {
        		var msg = 'Err: The required index is out of range!';
        		console.error(moduleName+msg);
                debug('index='+index+', size='+size +',total='+total);
        		return next({code:errorCode.PARAM_INVALID, msg: msg});
        	}

        	var sqlstr = 'select * from ' + picModel.tableName;
        	sqlstr += '  where (deviceID in("' + globalIds.join('","') +'"))';
        	if (startTime) {
        		sqlstr += ' and ( createTime between \'' 
        			+ startTime.format('YYYY-MM-DD HH:mm:ss');
        		sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\')';
        	}
        	sqlstr += ' and channelNo = '+channelNo+' order by createTime DESC ';
            sqlstr += ' LIMIT ' + offset +', '+limit;
            sqlstr += ' ; ' ;
        	var query = {
        		sqlstr: sqlstr,
        	};
        	picModel.query(query, function(err, rows){
        		if (err) {
        			var msg = err.msg || err;
        			console.error(moduleName + msg);
        			next(err);
        		}else{
                    var pics = {
                        total: total,
                        pics: rows,
                    };
        			next(null, pics);
        		}
        	});
        },
        function(pics,next){
            var sqlstr = 'select * from ' + picModel.tableName;
            sqlstr += '  where (deviceID in("' + globalIds.join('","') +'"))';
            if (startTime) {
                sqlstr += ' and ( createTime between \'' 
                    + startTime.format('YYYY-MM-DD HH:mm:ss');
                sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\')';
            }
            sqlstr += ' and channelNo = '+channelNo+' order by createTime DESC;';
            var query = {
                sqlstr: sqlstr,
            };
            picModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    pics.all = rows;
                    next(null, pics);
                }
            });
        },
        function(pics,next){
            var sqlstr = 'select * from ' + picModel.tableName;
            sqlstr += '  where (deviceID in("' + globalIds.join('","') +'"))';
            if (startTime) {
                sqlstr += ' and ( createTime between \'' 
                    + startTime.format('YYYY-MM-DD HH:mm:ss');
                sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\')';
            }
            sqlstr += ' and channelNo = '+channelNo+' order by createTime ASC;';
            var query = {
                sqlstr: sqlstr,
            };
            picModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    pics.asc = rows;
                    next(null, pics);
                }
            });
        },
    ], 
    function(err, pics){
        if (err) {
            console.error('Failed to search pictures by device id= ' + id);
            fn(err);
        }else{
            debug('Success to search pictures by device id= ' + globalIds);
            var resData = packageResponseData(pics);
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
