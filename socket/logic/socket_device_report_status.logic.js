// socket process device heart beat  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 * 2016.08.22, modified by Tarrega
 */
'use strict';  
var moduleName = 'socket_device_report_status.logic';
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
    var buffer = new Buffer(28);
    buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
    buffer.writeUInt16LE(23205, 0);  //23205
    buffer.writeUInt16LE(1, 2);    // 有效数据长度为1
    //var strt = '06M00001800036603';
    var strt = packet.cmd_id;
    buffer.write(strt,4,17);
    buffer.writeUInt8(0x08,21);
    buffer.writeUInt8(0xE8,22);
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


function processPayload(dataBuf){
    if (Buffer.isBuffer(dataBuf)!=true){
        console.error('Failed to process the payload for device :' + deviceId);
    }
    var pldata={
        time_stamp: dataBuf.readUInt32LE(0),
        battery_voltage: dataBuf.readUInt32LE(4),
        operation_temperature: dataBuf.readUInt32LE(8),
        battery_capacity: dataBuf.readUInt32LE(12),
        floatingcharge : dataBuf.readUInt8(16),
        total_working_time : dataBuf.readUInt32LE(17),
        working_time : dataBuf.readUInt32LE(21),
        connection_state : dataBuf.readUInt8(25),
        battery_solar_voltage : parseInt(dataBuf.slice(26,26+4).toString('ascii').trim()), 
        capacity_voltage : parseInt(dataBuf.slice(30,30+4).toString('ascii').trim()), 
        network_signal : parseInt(dataBuf.slice(34,34+4).toString('ascii').trim()), 
    };
    
    debug('time_stamp:'+pldata.time_stamp);
    debug('floatingcharge:'+pldata.floatingcharge);
    debug('working_time:'+pldata.working_time);
    debug('connection_state:'+ pldata.connection_state);
    debug('the battery_voltage:' + pldata.battery_voltage);
    debug('the battery_solar_voltage:' + pldata.battery_solar_voltage);
    debug('the capacity_voltage:' + pldata.capacity_voltage);
    debug('the network_signal:' + pldata.network_signal);
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
	debug('Report working status for device:' + deviceId);
    
    //2. do the database update in async way.
    async.series([
    	function(next){
            var update = {
               temperature : pldata.operation_temperature,
               batteryVoltage : pldata.battery_voltage,
               batteryCapacity : pldata.battery_capacity,
               capacityVoltage: pldata.capacity_voltage,
               batterSolarVoltage: pldata.battery_solar_voltage,
               networkSignal: pldata.network_signal
            }
            var query = {
                update:update,
                match:match,
            };
            deviceStatusModel.update(query, next);
        } ], 
    function(err, device){
        if (err) {
    		console.error('Failed to Update the status in DB for device:' + deviceId);
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