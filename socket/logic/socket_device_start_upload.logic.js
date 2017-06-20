// socket process device heart beat  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 * 2016.08.22, modified by Tarrega
 */
'use strict';  
var moduleName = 'socket_device_start_upload.logic';
var URLPATH = '/v1/device/klStartUpload';

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
    // 原样回复，所以返回一个长度为一的Buffer。
    //var pldata = processPayload(packet.data);
    var buflen = 39;
    var buffer = new Buffer(buflen);
    buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
    buffer.writeUInt16LE(23205, 0);  //23205
    buffer.writeUInt16LE(12, 2);    // 有效数据长度
    //var strt = '06M00001800036603';
    var strt = packet.cmd_id;
    buffer.write(strt,4,17);
    buffer.writeUInt8(packet.frame_type,21);
    buffer.writeUInt8(packet.packet_type,22);
    buffer.writeUInt8(packet.frame_no,23);
    packet.data.copy(buffer,24,0,12);
    var crc = crcHelper.calCRC(buffer.slice(0,buflen-3));
    buffer.writeUInt16LE(crc, buflen-3); 
    buffer.writeUInt8(0x96,buflen-1);
    return buffer;
}


function processPayload(dataBuf){
    /*
    if (Buffer.isBuffer(dataBuf)!=true){
        console.error('Failed to process the payload for device :' + deviceId);
    }
    var pldata={
        smartequip_name: dataBuf.slice(0,40).toString('ascii').trim(),  // should be 50
        model: dataBuf.slice(50,60).toString('ascii'),
        essential_info_version : 0 ,
        bs_manufacturer : dataBuf.slice(64,64+40).toString('ascii').trim() , // should be 50
        bs_production_date : 10000, 
        bs_identifier : dataBuf.slice(118,118+20).toString('ascii').trim() ,
        reserve : '',
    };
    debug('the length of device name:' + pldata.smartequip_name.length);
    return pldata; */
}


function processRequest(packet, fn){
	//1. check the input data
	//if(!validate(param)){
	//	var msg = 'Invalid data';
	//	console.error(moduleName+': '+msg);
	//	return fn({code:errorCode.PARAM_INVALID, msg: msg});
	//}

	var deviceId = packet.cmd_id || '00000000000000000';
    //var pldata = processPayload(packet.data);
	debug('Start upload, set picture buffer for device:' + deviceId);
    
    //2. do the jobs in async way.
    async.series([
    	function(next){
    		pictureHelper.resetBuffer(deviceId);
            next();
    	}], 
        function(err, device){
        if (err) {
    		console.error('Failed to setup picuture buffer for  device:' + deviceId);
    	}else{
    		debug('Success set up picture buffer for device:' + deviceId);
    	}
        var resbuf = responseBuffer(err, packet);
        fn(err,resbuf);  // callback function to send the results.
    });	
}


function processPacket(packet, fn){
	debug('in device_init_logic, packet:%j', packet.cmd_id);
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