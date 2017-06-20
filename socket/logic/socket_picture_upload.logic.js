// socket picture upload interface  
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


var picuploadTmp = __dirname+ '/picupload/';

//helper
var socketHelper = require('./socket.logic');

var refModel = {
	packets: {
		data: [],
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

function packageResponseData(param){
	if(!param){
		return {};
	}	
	
	var data = {
        pictureId: param.pictureId,
        timestamp: socketHelper.getCurrentSeconds(),
        data: wxConstants.SOCKET.ACK,
	};

	var resData = null;// socketHelper.createResPacket({header: param.header, data: data});

	return resData;
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'Invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var packets = param.packets;
	var now = moment();
	var pictureId = dataHelper.createId(now.toString());

	debug('Try to save the picture raw data:'+pictureId);

	var fd = fs.openSync( picuploadTmp + pictureId, 'w');
	
	var sequence = param.header.sequence;
	for (var i = 0; i < packets.length; i++) {
		var packet = packets[i];
		if (!Buffer.isBuffer(packet)) {
			var msg = 'Err: Try to save the data which is not buffer!';
			console.error(msg);
			fn({code: errorCode.SOCKET_INVALID_BUFFER, msg: msg});
			return ;
		}
		var header = socketHelper.parserHeader(packet);
		if (header.sequence != sequence) {
			var msg = 'Err: Try to save the data from different sequence!';
			console.error(msg);
			fn({code: errorCode.SOCKET_INVALID_BUFFER, msg: msg});
			return ;
		}
		if (header.subSeq != i+1) {
			var msg = 'Err: Try to save the data from invalid sub sequence packets!';
			console.error(msg);
			fn({code: errorCode.SOCKET_INVALID_BUFFER, msg: msg});
			return ;
		}
		fs.writeSync(fd, packet, wxConstants.SOCKET.HEADLEN, packet.length - wxConstants.SOCKET.HEADLEN);
	}

    debug('Success to save the picture resData:' + pictureId);
    var resData = packageResponseData({header:packet.header, pictureId:pictureId});
	fn(null, resData);
}

function processPacket(packet, fn){
	debug('socket.header:%j', packet.header);
	debug('socket.jsonData:%j', packet.jsonData);

	var param = packet;

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