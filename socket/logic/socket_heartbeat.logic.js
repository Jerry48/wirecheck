// socket process device heart beat  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 *  
 */
'use strict';  
var moduleName = 'socket_heaerbeat.logic';
var URLPATH = '/v1/device/reportheartbeat';

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


function processPayload(dataBuf){
    if (Buffer.isBuffer(dataBuf)!=true){
        console.error('Failed to process the payload for device :' + deviceId);
    }
    var pldata={
        clocktime_stamp: dataBuf.readUInt32LE(0),
    };
    //debug('the length of device name:' + pldata.smartequip_name.length);
    return pldata;
}

function getDatetimeFromSeconds(iseconds){
    var utcSeconds = iseconds;
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(utcSeconds);
    // d.setHours(d.getHours() + 8); 
    return d;
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
	return null;
}

function responseBuffer(err, packet){
    var buffer = new Buffer(28);
    buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
    buffer.writeUInt16LE(23205, 0);  //23205
    buffer.writeUInt16LE(1, 2);    // 有效数据长度为1
    //var strt = '06M00001800036603';
    var strt = packet.cmd_id;
    buffer.write(strt,4,17);
    buffer.writeUInt8(0x08,21);
    buffer.writeUInt8(0xE6,22);
    buffer.writeUInt8(0x01,23);
    if (err) {  // fail to report.
        buffer.writeUInt8(0x00,24);
    }else{  // success to regist.
        buffer.writeUInt8(0xFF,24);
    }
    var crc = crcHelper.calCRC(buffer.slice(0,25));
    buffer.writeUInt16LE(crc, 25); 
    buffer.writeUInt8(0x96,27);
    return buffer;
}


function processRequest(packet, fn){
	//1. check the input data
	var deviceId = packet.cmd_id || '00000000000000000';
    var match = {
        id: deviceId,
    };
    var pldata = processPayload(packet.data);
	debug('Try to update the heart beat for device:' + deviceId);
    console.log(pldata.clocktime_stamp);
    var curtime = getDatetimeFromSeconds(pldata.clocktime_stamp);
    console.log(curtime);
    async.waterfall([
    	function(next){
    		var update = {
    			heartBeat: 1,
    			heartBeatTime: curtime,
    		};
    		var match = {
    			id: deviceId,
    		};
    		var query = {
    			update:update,
    			match:match,
    		};
    		deviceStatusModel.update(query, next);
    	},
    ], 
    function(err, device){
        if (err) {
            console.error('Failed to update heartbeat for device:' + deviceId);
        }else{
            debug('Success to update heartbeat in database for device:' + deviceId);
        }
        var resbuf = responseBuffer(err, packet);  // no return data
        // var resbuf = null;
        fn(err,resbuf);  // callback function to send the results.
    });	
}

function processPacket(packet, fn){
    debug('process heartbeat packet for:'+packet.cmd_id);
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