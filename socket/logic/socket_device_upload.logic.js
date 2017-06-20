// socket process device heart beat  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 * 2016.08.22, modified by Tarrega
 */
'use strict';  
var moduleName = 'socket_device_upload.logic';
var URLPATH = '/v1/device/klUpload';

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
var pictureHelper    = require('./picture_buffer.logic');

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
    // 不用回复，所以返回一个长度为2的Buffer。
    //var buffer = new Buffer(2);
    //buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
    var buffer = null;
    return buffer;
}


function processPayload(dataBuf){
    if (Buffer.isBuffer(dataBuf)!=true){
        console.error('Failed to process the picture payload for device :' + deviceId);
    }
    var pldata={
        channel_no : dataBuf.readUInt8(0), 
        presetting_no : dataBuf.readUInt8(1),
        packet_no : dataBuf.readUInt16LE(2),
        subpacket_no: dataBuf.readUInt16LE(4),
        sample : dataBuf.slice(6, dataBuf.length),
    };
    debug('packet_no:' + pldata.packet_no + ' , subpacket_no:' + pldata.subpacket_no + ', length:' + pldata.sample.length);
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
    var pldata = processPayload(packet.data);
	debug('uploading , sub_packet:' + pldata.subpacket_no +' ,length' + pldata.sample.length);
    
    //2. do the jobs in async way.
    async.series([
    	function(next){
    		pictureHelper.addBuffer(deviceId, pldata.packet_no, pldata.sample);
            next();
    	}], 
        function(err, device){
        if (err) {
    		console.error('Failed to append picuture buffer for device:' + deviceId);
    	}else{
    		debug('Success append picture buffer for device:' + deviceId);
    	}
        var resbuf = responseBuffer(err, packet);
        fn(err,resbuf);  // callback function to send the results.
    });	
}

function processPacket(packet, fn){
	debug('in upload picture logic, packet:%j', packet.cmd_id);
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