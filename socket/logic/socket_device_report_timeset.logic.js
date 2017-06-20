// socket process device heart beat  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 * 2016.08.22, modified by Tarrega
 */
'use strict';  
var moduleName = 'socket_device_report_timeset.logic';
var URLPATH = '/v1/device/reportStatus';

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

//constans & helper
var wxConstants     = require('../../common/constants');
var errorCode       = require('../../common/errorCode');
var logic_helper    = require('../../common/logic_helper');
var dataHelper      = require('../../common/dataHelper');
var socketHelper    = require('./socket.logic');
var crcHelper = require('./calCRC');


function validate(data){  // 因为需要CRC校验，是否就不要验证了。有错误一定是故意为之。
    return true;    
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

function responseBuffer(err, packet){
    return null;
}


function processPayload(dataBuf){
    if (Buffer.isBuffer(dataBuf)!=true){
        console.error('Failed to process the payload for device :' + deviceId);
    }
    var pldata={
        command_status: dataBuf.readUInt8(0),
        clocktime_stamp: dataBuf.readUInt32LE(1),
    };
    debug('the set time command status:' + pldata.command_status);
    debug('the time of the device:' + pldata.clocktime_stamp);
    debug('Get Settime response successfully');
    return pldata;
}


function processRequest(packet, fn){
	//1. check the input data
	//if(!validate(param)){
	//	var msg = 'Invalid data';
	//	console.error(moduleName+': '+msg);
	//	return fn({code:errorCode.PARAM_INVALID, msg: msg});
	//}
	var deviceId = packet.cmd_id || '00000000000000000';
    var match = {
        id: deviceId,
    };
    var pldata = processPayload(packet.data);
	debug('Report settime for device:' + deviceId);
    
    //2. do the database update in async way.
    async.series([
    	function(next){
            next(null);
        } ], 
    function(err, device){
        if (err) {
    		console.error('Failed to Update the status in DB for device:' + deviceId);
    		//fn(err);
    	}else{
    		debug('Get set time response for device:' + deviceId);
    	}
        var resbuf = responseBuffer(err, packet);
        fn(err,resbuf);  // callback function to send the results.
    });	
}

function processPacket(packet, fn){
	debug('in device_report_status_logic, packet:%j', packet.cmd_id);
	processRequest(packet, fn);
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