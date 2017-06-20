// socket process device heart beat  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 * 2016.08.22, modified by Tarrega
 */
'use strict';  
var moduleName = 'socket_device_init_connect.logic';
var URLPATH = '/v1/device/klIniConnect';

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
    var buffer = new Buffer(29);
    buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
    buffer.writeInt16LE(23205, 0);  //23205
    buffer.writeInt16LE(2, 2);    // 有效数据长度为2
    //var strt = '06M00001800036603';
    var strt = packet.cmd_id;
    buffer.write(strt,4,17);
    buffer.writeUInt8(0x08,21);
    buffer.writeUInt8(0xE7,22);
    buffer.writeUInt8(0x01,23);
    if (err) {  // fail to regist.
        buffer.writeUInt8(0x00,24);
        buffer.writeUInt8(0x01,25);
    }else{  // success to regist.
        buffer.writeUInt8(0xFF,24);
        buffer.writeUInt8(0x00,25);
    }
    var crc = crcHelper.calCRC(buffer.slice(0,26));
    buffer.writeUInt16LE(crc, 26); 
    buffer.writeUInt8(0x96,28);

    // 再发送一个设置时间的报文
    var buffer2 = new Buffer(32);
    buffer2.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
    buffer2.writeInt16LE(23205, 0);  //23205
    buffer2.writeInt16LE(0x05, 2);    // 有效数据长度为5
    var strt2 = packet.cmd_id;
    buffer2.write(strt2,4,17);
    buffer2.writeUInt8(0x03,21);
    buffer2.writeUInt8(0xA1,22);
    buffer2.writeUInt8(0x01,23);
    buffer2.writeUInt8(0x01,24);  // 设置时间
    var curtick = socketHelper.getCurrentSeconds();
    buffer2.writeInt32LE(curtick, 25);  // timestamp
    var crc2 = crcHelper.calCRC(buffer2.slice(0,29));
    buffer2.writeUInt16LE(crc2, 29); 
    buffer2.writeUInt8(0x96,31);    

    debug('what is buffer2?');
    debug(buffer2);

    // 拼起来一起发送
    var bufferall = new Buffer(29+32);
    buffer.copy(bufferall,0);
    buffer2.copy(bufferall,29);
    return bufferall;
}


function processPayload(dataBuf){
    if (Buffer.isBuffer(dataBuf)!=true){
        console.error('Failed to process the payload for device :' + deviceId);
    }
    var pldata={
        smartequip_name: dataBuf.slice(0,40).toString('ascii').trim(),  // should be 50
        model: dataBuf.slice(50,60).toString('ascii'),
        essential_info_version : dataBuf.slice(60,64).toString('ascii'),
        bs_manufacturer : dataBuf.slice(64,64+40).toString('ascii').trim() , // should be 50
        bs_production_date : dataBuf.readUInt32LE(141,145), 
        bs_identifier : dataBuf.slice(118,118+20).toString('ascii').trim() ,
        reserve : '',
    };
    console.log(pldata);
    debug('the length of device name:' + pldata.smartequip_name.length);
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
    var match1 = {
        id: deviceId,
    };
    var match2 = {
        deviceID: deviceId,
    };
    var pldata = processPayload(packet.data);

	debug('Init connection setting for device:' + deviceId);
    
    //2. do the database update in async way.
    async.series([
    	function(next){
            var productionDate = new Date();
            var utcSeconds = pldata.bs_production_date;
            productionDate.setUTCSeconds(utcSeconds);
    		var update = {
    			deviceName: pldata.smartequip_name,
                deviceManufactorName: pldata.bs_manufacturer,
                deviceProductionDate: productionDate,
                deviceModel: pldata.model,
    		};

    		var query = {
    			update:update,
    			match:match1,
    		};
    		deviceProductModel.update(query, next);
    	},
        function(next){
            var update = {
                nickName: pldata.smartequip_name,
                version: pldata.essential_info_version
            };
            var query = {
                update: update,
                match: match2,
            };
            deviceModel.update(query, next);
        } ], 
    function(err, device){
        if (err) {
    		console.error('Failed to Init connection setting for device:' + deviceId);
    		//fn(err);
    	}else{
    		debug('Success to update the database for device:' + deviceId);
    		//var resData = 'Got your initial data!';
			//fn(null, resData);
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