// socket picture report interface  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 *  
 */
'use strict';  
var moduleName = 'socket_picture_report.logic';
var URLPATH = '/v1/device/reportPicture';

//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var net = require('net');
var crypto = require('crypto');
var fs = require('fs');

//model
var deviceStatusModel = require('../../back/model/device_status_info');
var deviceModel = require('../../back/model/device_info');
var deviceProductModel = require('../../back/model/device_product_info');
var pictureModel = require('../../back/model/picture_info');
var pictureProcessModel = require('../../back/model/picture_process_info');

//constans & helper
var wxConstants     = require('../../common/constants');
var errorCode       = require('../../common/errorCode');
var logic_helper    = require('../../common/logic_helper');
var dataHelper      = require('../../common/dataHelper');
var socketHelper    = require('./socket.logic');

//helper
var socketHelper = require('./socket.logic');

var refModel = {
	deviceID: {
		data: 'parent level id',
		rangeCheck: null,
	},
    pictureID:{
        data: '1',
        rangeCheck: null,
    },
    pictureCaptureDT:{
        data: '0',
        rangeCheck: null,
    },
    pictureFileSize:{
        data: 0,
        rangeCheck: function(data){
            return data > 0;
        },
    },
    resolution:{
        data: 0,
        rangeCheck: function(data){
            return is.inArray(data, [0,1,2,3,4,5,6,7]);
        },
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
        deviceID: inputData,
        timestamp: socketHelper.getCurrentSeconds(),
        data: wxConstants.SOCKET.ACK,
	};

	return resData;
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'Invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var deviceId = param.deviceID || '';
    var pictureId = param.pictureID || '';

	debug('Try to save the picture :' + pictureId);

    async.waterfall([
        function(next){
            var select = pictureModel.dataModel;
            var match = {
                id: pictureId,
            };
            var query = {
                select: select,
                match: match,
            };
            pictureModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    if (rows.length==0) {
                        var msg = 'Err: No this picture id='+pictureId;
                        console.error(moduleName + msg);
                        next({code: errorCode.NO_DATA_MATCH, msg:msg});
                    }else {
                        next(null, rows[0]);
                    }
                }
            });
        },
    	function(pic, next){
    		var update = {
    			deviceId: deviceId,
                pictureCaptureDT: moment(param.pictureCaptureDT,
                         'YYYY-MM-DDhh:mm:ss'),
                pictureFileSize: Number(param.pictureFileSize),
                resolution: Number(param.resolution),
                pictureSaveDT: new Date(),
    		};
            var match = {
                id: pictureId,
            };
    		var query = {
    			update:update,
    			match:match,
    		};
    		pictureModel.update(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    next(null, pic);
                }
            });
    	},
        function(pic, next){
            var select = {
                refPicPath: '',
            };
            var match = {
                id: deviceId,
            };
            var query = {
                select: select,
                match: match,
            };
            deviceModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else {
                    if (rows.length) {
                        pic.refPicPath = rows[0].refPicPath;
                    }
                    next(null, pic);
                }
            });
        },
        function(pic, next){
            var id = dataHelper.createId(deviceId + pictureId);
            var values = {
                id: id,
                deviceId: deviceId,
                originalPicId: pictureId,
                originalPicPath: pic.path,
                refPicPath: pic.refPicPath,
                status: 0,
            };
            var query = {
                fields: values,
                values: [values],
            };
            pictureProcessModel.create(query, next);
        }
    ], 
    function(err, device){
    	if (err) {
    		console.error('Failed to save the picture :' + pictureId);
    		fn(err);
    	}else{
    		debug('Success to save the picture :' + pictureId);
    		var resData = packageResponseData(deviceId);
			fn(null, resData);
    	}
    });	
}

function processPacket(packet, fn){
	debug('socket.header:%j', packet.header);
	debug('socket.jsonData:%j', packet.jsonData);

	var param = packet.jsonData;

	processRequest(param, fn);
}

//post interface
router.post(URLPATH, function (req, res, next){
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    debug('req.body:%j', req.body);

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
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    //debug('req.body:%j', req.body);

    var param = req.query;
    debug(moduleName+ 'query data is: %j ', param);

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
module.exports.processPacket = processPacket;