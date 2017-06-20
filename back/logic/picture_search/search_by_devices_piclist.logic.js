// picture search logic
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.19, created by Andy.zhou
 *  
 */
'use strict';
var moduleName = 'search_by_devices_piclist.logic';
var debug = require('debug')(moduleName);
var URLPATH = '/v1/search/pics/devices/piclist';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var pictureModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');
var channelModel = require('../../model/channel_info');
var deviceLevelModel = require('../../model/device_level_info');

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
    ids:{
        data: [],
        optional: 1,
        rangeCheck: null,
    },
    channelIds:{
        data: [],
        optional: 1,
        rangeCheck: null,
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

    var pics = inputData;
    console.log(pics[0]);
    console.log(pics[1]);
    var resData = {
    	size : pics.length,
    	list: [],
    };
    for (var i = 0; i < pics.length; i++) {
    	if(pics[i]!=null){
    		for(var j=0;j<pics[i].length;j++){
    			var data = pics[i];
		        var time = moment(data[j].pictureSaveDT);
		    	var pic = {
		            picId: data[j].pictureID,
		    		deviceId: data[j].deviceID,
		            channelNo: data[j].channelNo,
                    width: data[j].width,
                    height: data[j].height,
                    channelName: data[j].channelName,
		    		// name: data[j].pictureName,
		    		// picType: data[j].type,
		    		picUrl: fileserverHelper.getFileServerUrl(data[j].pictureWebURL),
		            thumbnailPicUrl: fileserverHelper.getFileServerThumbnailUrl(data[j].pictureWebURL),
		            time: time.format('YYYY-MM-DD HH:mm:ss'),
		    	};
		    	resData.list.push(pic);
    		}
    		
    	}
    }

    return resData;
}

function findDevices(param,fn){
	var tmp = {
		ids: param,
	}
	async.waterfall([
		function(next){
			getLevels(tmp,next);
		},
		function(ids,next){
			var sqlstr = 'select deviceID from '+deviceModel.tableName;
            sqlstr +=' where parentId in ("';
            sqlstr +=ids.join('","');
            sqlstr +='");';
            var query = {
                sqlstr:sqlstr,
            };
            deviceModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    var ids = [];
                    for(var i=0;i<rows.length;i++){
                    	ids.push(rows[i].deviceID);
                    }
                    next(null, ids);
                }
            });
		},
	],
	function(err,ids){
		if (err) {
            console.error('Failed to search pictures by device id= ');
            fn(err);
        }else{
            debug('Success to search pictures by device id= ');
            fn(null, ids);
        }
	})
}

function getLevels(param,fn) {
	console.log('findDevices');
	var tmp = {
		result: [],
		ids: param.ids,
	}
	async.waterfall([
		function(next){
			findLevels(tmp,next);
		},
		function(foo,next){
			if(foo.flag==0){
				next(null,foo);
			}else{findLevels(foo,next);}
		},
		function(foo,next){
			if(foo.flag==0){
				next(null,foo);
			}else{findLevels(foo,next);}
		},
		function(foo,next){
			if(foo.flag==0){
				next(null,foo);
			}else{findLevels(foo,next);}
		},
		function(foo,next){
			if(foo.flag==0){
				next(null,foo);
			}else{findLevels(foo,next);}
		},
	],
	function(err,data){
		if (err) {
            console.error('Failed to search pictures by device id= ');
            fn(err);
        }else{
            debug('Success to search pictures by device id= ');
            console.log(data.result);
            fn(null, data.result);
        }
	})
}

function findLevels(param,fn){
	console.log('findDeviceIdsByLevel');
	var result = param.result;
	var ids = param.ids;
	console.log(ids);
	var sqlstr = 'select id from '+deviceLevelModel.tableName+' where parentId in ("';
	if(ids.length==0){
		var tmp = {
			ids: ids,
			result: result,
			flag: 0,
		}
		fn(null,tmp);
	}else{
		if(ids.length==1){
			sqlstr += ids[0];
		}else {
			sqlstr += ids.join('","');
		}
		sqlstr += '");';
		var query = {
			sqlstr: sqlstr,
		}
		deviceLevelModel.query(query,function(err,rows){
			if (err) {
				var msg = err.msg || err;
				console.error(moduleName+msg);
				next(err);
			}else{
				result = ids;
				var data = [];
				for(var i=0;i<rows.length;i++){
					data.push(rows[i].id);
					result.push(rows[i].id);
				}
				var tmp = {
					ids: data,
					result: result,
					flag: 1,
				}
				if(rows.length==0){
					tmp.flag = 0;
				}else{	
					tmp.flag =1;
				}
				console.log(tmp);
				fn(null,tmp);
			}
		})	
	}
}

function findPic(param,fn) {
	var arr  = param.tmp;
	var startTime = param.startTime;
	var endTime  = param.endTime;
    console.log('findpic!');
    var result = [];
    async.mapSeries(arr,
        function(item,next){
            var sqlstr = 'select deviceID,channelNo,pictureID,pictureWebURL,pictureSaveDT,width,height from '+pictureModel.tableName+' where deviceID in ("'+item.deviceId;
            sqlstr+= '") and channelNo in ("'+item.channelNo;
            if (startTime) {
        		sqlstr += '")  and ( createTime between \'' 
        			+ startTime.format('YYYY-MM-DD HH:mm:ss');
        		sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\')';
        	}
            sqlstr+= ' order by pictureSaveDT DESC;';
        	
            var query = {
                sqlstr:sqlstr,
            };
            pictureModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    if(rows.length==0){
                        next(null);
                    }else{
                        var foo = JSON.parse(JSON.stringify(rows));
                        for(var i=0;i<foo.length;i++){
                            foo[i].channelName = item.name;
                        }
                        next(null,foo);
                    }
                }
            });
        },
        function(err,result){
            fn(null,result);
    });
}

function processRequest(param, fn){
    //1. check the input data
    if(!validate(param)){
        var msg = 'invalid data';
        console.error(moduleName+': '+msg);
        return fn({code:errorCode.PARAM_INVALID, msg: msg});
    }

    var type = param.type || 0;
    var channelIds = [];
    var startTime;
    var endTime;
    if (param.startTime) {
    	startTime = moment(param.startTime);
    	endTime = moment(); //now
    }
    if (param.endTime) {
    	endTime = moment(param.endTime);
    }

    debug('Try to search pictures by device id= ' );
    var globalIds = [];
    async.waterfall([
        function(next){
            if (type==0) {
                next(null, []);
            }else if (param.type==1) {
            	console.log('main');
                findDevices(param.ids, next);
            }else if (param.type==2) {
                // deviceHelper.findDeviceIdsByGroup(param, next);
            }
        },
        function(ids,next){
        	var sqlstr = 'select id from '+channelModel.tableName;
            sqlstr +=' where deviceId in ("';
            sqlstr +=ids.join('","');
            sqlstr +='") and status = 1;';
            var query = {
                sqlstr:sqlstr,
            };
            channelModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                	for(var i=0;i<rows.length;i++){
                		channelIds.push(rows[i].id);
                	}
                    next(null, channelIds);
                }
            });
        },
        function(ids, next){
            var tmp = param.channelIds || [];
            //pend the device Ids
            for (var i = 0; i < tmp.length; i++) {
                ids.push(tmp[i]);
            }
            console.log("&&&&&&&&&&&&&&&&&&&&&&"+ids);
            next(null, ids);
        },
        function(ids, next){
            var sqlstr = 'select deviceId,channelNo,name from '+channelModel.tableName;
            sqlstr +=' where id in ("';
            sqlstr +=ids.join('","');
            sqlstr +='");';
            var query = {
                sqlstr:sqlstr,
            };
            channelModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    next(null, rows);
                }
            });
        },
        function(tmp,next){
        	var data = {
        		tmp: tmp,
        		startTime: startTime,
        		endTime: endTime,
        	}
        	findPic(data,next);
        },
    ], 
    function(err, pics){
        if (err) {
            console.error('Failed to search pictures by device id= ');
            fn(err);
        }else{
            debug('Success to search pictures by device id= ' + globalIds);
            console.log(pics);
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
 