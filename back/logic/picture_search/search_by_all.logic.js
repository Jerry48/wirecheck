// picture search logic
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.19, created by Andy.zhou
 *  
 */
'use strict';
var moduleName = 'search_by_all.logic';
var debug = require('debug')(moduleName);
var URLPATH = '/v1/search/pics/all';

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
var channelModel = require('../../model/channel_info');
var deviceProductModel = require('../../model/device_product_info');
var userDeviceGroupRModel = require('../../model/user_device_group_r_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');
//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var fileserverHelper = require('../../../common/fileserverHelper');

var deviceHelper = require('./../device/device.logic');

var refModel = {
    userId:{
        data: 'userId',
        rangeCheck: null
    },
    userType : {
        data: 0,
        rangeCheck: null
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
    var resData = {
        total: inputData.total,
    	size : pics.length,
    	list: [],
    };
    for (var i = 0; i < pics.length; i++) {
    	var data = pics[i];
        var time = moment(data.createTime);
    	var pic = {
            picId: data.pictureID,
    		deviceId: data.deviceID,
            deviceTele: data.deviceTele,
            deviceName: data.deviceName,
            channelNo: data.channelNo,
    		name: data.pictureName,
            width: data.width,
            height: data.height,
    		picType: data.type,
    		picUrl: fileserverHelper.getFileServerUrl(data.pictureWebURL),
            thumbnailPicUrl: fileserverHelper.getFileServerThumbnailUrl(data.pictureWebURL),
            time: time.format('YYYY-MM-DD HH:mm:ss'),
    	};
    	resData.list.push(pic);
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

    var index = param.index && Number(param.index) || 0;
    var size = param.size && Number(param.size) || 10;
    var startTime = param.startTime || '1970-01-01 00:00:00';
    var endTime = param.endTime || '2970-01-01 00:00:00';
    var userId = param.userId;
    var userType = param.userType;

    debug('Try to search pictures of all devices');
    var globalIds = [];
    async.waterfall([
        function(next){
            if(userType){
                next(null,0);
            }else{
                var match = {
                    userId: userId,
                    comment: 'privilege'
                };
                var select = {
                    groupId: 'groupId',
                };
                var query = {
                    select: select,
                    match: match,
                };
                userDeviceGroupRModel.lookup(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        next(null,rows);
                    }
                });
            }
        },
        function(result,next){
            if(userType){
                var sqlstr = 'select * from tb_device_info;';
                var query = {
                    sqlstr: sqlstr,
                }
                deviceModel.query(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        next(null,rows);
                    }
                });
            }else{
                var match = {
                    groupId: result[0].groupId,
                };
                var select = {
                    deviceId: 'deviceId',
                };
                var query = {
                    select: select,
                    match: match,
                };
                deviceGroupMemModel.lookup(query, function(err, rows){
                    if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName+' Err:'+msg);
                        next(err);
                    }else{
                        next(null,rows);
                    }
                });
            }
        },
        function(result,next){
            var deviceIds = [];
            for (var i=0;i<result.length;i++){
                if(userType){
                    deviceIds.push(result[i].deviceID);
                }else{
                    deviceIds.push(result[i].deviceId);
                }
            }
            var sqlstr = 'select count(*) as total ';       
            sqlstr += ' from '+picModel.tableName;
        	// sqlstr += ';';
              sqlstr += ' where ( createTime between \'' 
                 +startTime;
             sqlstr += '\' and \''+endTime+'\') and deviceID in ("' +deviceIds.join('","')+'") order by createTime DESC';

            console.log(sqlstr);

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
						next(null, {total:data.total,idlist: deviceIds});
                	}
                }
            });
        },
        function(result, next){
            var total = result.total;
            var deviceIds = result.idlist;
        	var offset = index * size;
            var limit = size;
        	if (offset>=total) {
        		var msg = 'Err: The required index is out of range!';
        		console.error(moduleName+msg);
                debug('index='+index+', size='+size +'total='+total);
        		return next({code:errorCode.PARAM_INVALID, msg: msg});
        	}

        	var sqlstr = 'select * ';       
            sqlstr += ' from '+picModel.tableName;
            // sqlstr += ';';
             sqlstr += ' where ( createTime between \'' 
                 +startTime;
             sqlstr += '\' and \''+endTime+'\') and deviceID in ("' +deviceIds.join('","')+'") order by createTime DESC';
        	// sqlstr += ' order by createTime DESC ';
            sqlstr += ' LIMIT ' + offset +', '+limit;
            sqlstr += ' ; ' ;
            console.log(sqlstr);
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
        function(data,next){
            var pics = data.pics;
            var ids = [];
            for(var i=0;i<pics.length;i++){
                ids.push(pics[i].deviceID+'_'+pics[i].channelNo);
            }
            var sqlstr = 'select name,deviceId,channelNo from '+channelModel.tableName+' where id in("';
            sqlstr += ids.join('","');
            sqlstr+='");'
            channelModel.query({sqlstr:sqlstr}, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+': '+msg);
                    next(err);
                }else{
                   for(var i=0;i<rows.length;i++){
                        for(var j=0;j<pics.length;j++){
                            if((rows[i].deviceId+'_'+rows[i].channelNo)==ids[j])
                            {
                                pics[j].deviceName = rows[i].name;
                            }
                        }
                        
                   }
                   data.pics = pics;
                   next(null,data);
                }
            });
        },
        function(data,next){
            var pics = data.pics;
            var ids = [];
            for(var i=0;i<pics.length;i++){
                ids.push(pics[i].deviceID);
            }
            var sqlstr = 'select id,deviceTele from '+deviceProductModel.tableName+' where id in("';
            sqlstr += ids.join('","');
            sqlstr+='");'
            deviceProductModel.query({sqlstr:sqlstr}, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+': '+msg);
                    next(err);
                }else{
                   for(var i=0;i<rows.length;i++){
                        for(var j=0;j<pics.length;j++){
                            if(rows[i].id==ids[j])
                            {
                                pics[j].deviceTele = rows[i].deviceTele;
                            }
                        }
                        
                   }
                   data.pics = pics;
                   next(null,data);
                }
            });
        },
    ], 
    function(err, pics){
        if (err) {
            console.error('Failed to search pictures of all devices');
            fn(err);
        }else{
            debug('Success to search pictures of all devices');
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
