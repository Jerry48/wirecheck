// socket device commands  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 * 2016.08.29, modified by Tarrega
 *  
 */
'use strict';  
var moduleName = 'socket_device_commands.logic';

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
var path = require('path')

//models
var deviceModel = require('../../back/model/device_info');
var deviceCharacterModel = require('../../back/model/device_character_info');

//
var socketClients = require('./socket_clients.logic');
var socketHelper = require('./socket.logic');
var crcHelper = require('./calCRC');


//constans & helper
var wxConstants     = require('../../common/constants');
var errorCode       = require('../../common/errorCode');
var logic_helper    = require('../../common/logic_helper');
var dataHelper      = require('../../common/dataHelper');

var sequence = 1;
var date = new Date();


function fillSetParaPacket(deviceid, device){
	var buffer = new Buffer(42);
	buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
	buffer.writeInt16LE(23205, 0);  //23205
	buffer.writeInt16LE(15, 2);  // pay load is 56
	buffer.write(deviceid,4,17);
	buffer.writeUInt8(0x06,21);
	buffer.writeUInt8(0xC9,22);
	buffer.writeUInt8(0x01,23);
	// assemble the payload;
	buffer.writeUInt8(0x01,24);  // 设备配置信息
	buffer.writeUInt8(0x02,25);  // 只设置resolution
	var resolution = device.resolution;
	if (resolution>100){
		resolution = 8; // 如果参数有误，恢复默认值
	}	
	buffer.writeUInt8(resolution,27);
	var crc = crcHelper.calCRC(buffer.slice(0,39));
	buffer.writeUInt16LE(crc, 39); 
	buffer.writeUInt8(0x96,41);
	return buffer;
}


function fillSetTimerPacket(deviceid, device){
	var buffer = new Buffer(38);
	buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
	buffer.writeInt16LE(23205, 0);  //23205
	buffer.writeInt16LE(11, 2);  // pay load 
	buffer.write(deviceid,4,17);
	buffer.writeUInt8(0x06,21);
	buffer.writeUInt8(0xCA,22);
	buffer.writeUInt8(0x01,23);  // 目前都认为一个机器一个摄像头
	// assemble the payload;
	buffer.writeUInt8(0x01,24);  // channel number
	buffer.writeUInt8(0x03,25);  // 设置拍照时间表个数，这里是3个。
	var stahour = device.deviceWorkBeginTime.getHours();
	//debug("stahour"+stahour);
	var stamin = device.deviceWorkBeginTime.getMinutes();
	//debug("stamin"+stamin);
	//debug(device.deviceWorkBeginTime);
	var endhour = device.deviceWorkEndTime.getHours();
	var endmin = device.deviceWorkEndTime.getMinutes();
	var inthour = parseInt(device.photoInterval/60);
	var intmin = device.photoInterval % 60;
	debug(device.photoInterval);
	buffer.writeUInt8(inthour,26);  // 设置拍照时间间隔。
	buffer.writeUInt8(intmin,27);  // 设置拍照时间间隔。
	buffer.writeUInt8(0x01,28);  // 目前都认为一个机器一个摄像头。
	buffer.writeUInt8(stahour,29);  // 设置拍照时间start time。
	buffer.writeUInt8(stamin,30);  // 设置拍照时间start time。
	buffer.writeUInt8(0x01,31);  // 目前都认为一个机器一个摄像头。
	buffer.writeUInt8(endhour,32);  // 设置拍照时间 end time 。
	buffer.writeUInt8(endmin,33);  // 设置拍照时间 end time。
	buffer.writeUInt8(0x01,34);  // 目前都认为一个机器一个摄像头。
	var crc = crcHelper.calCRC(buffer.slice(0,35));
	buffer.writeUInt16LE(crc, 35); 
	buffer.writeUInt8(0x96,37);
	return buffer;
}


function fillSetCaptureTimePacket(deviceid, device){
	var buffer = new Buffer(38);
	buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
	buffer.writeInt16LE(23205, 0);  //23205
	buffer.writeInt16LE(11, 2);  // pay load 
	buffer.write(deviceid,4,17);
	buffer.writeUInt8(0x06,21);
	buffer.writeUInt8(0xCA,22);
	buffer.writeUInt8(0x01,23);  // 目前都认为一个机器一个摄像头
	// assemble the payload;
	buffer.writeUInt8(0x01,24);  // channel number
	buffer.writeUInt8(0x03,25);  // 设置拍照时间表个数，这里是3个。
	var stahour = device.deviceWorkBeginTime.getHours();
	//debug("stahour"+stahour);
	var stamin = device.deviceWorkBeginTime.getMinutes();
	//debug("stamin"+stamin);
	//debug(device.deviceWorkBeginTime);
	var endhour = device.deviceWorkEndTime.getHours();
	var endmin = device.deviceWorkEndTime.getMinutes();
	var inthour = parseInt(device.photoInterval/60);
	var intmin = device.photoInterval % 60;
	debug(device.photoInterval);
	buffer.writeUInt8(inthour,26);  // 设置拍照时间间隔。
	buffer.writeUInt8(intmin,27);  // 设置拍照时间间隔。
	buffer.writeUInt8(0x01,28);  // 目前都认为一个机器一个摄像头。
	buffer.writeUInt8(stahour,29);  // 设置拍照时间start time。
	buffer.writeUInt8(stamin,30);  // 设置拍照时间start time。
	buffer.writeUInt8(0x01,31);  // 目前都认为一个机器一个摄像头。
	buffer.writeUInt8(endhour,32);  // 设置拍照时间 end time 。
	buffer.writeUInt8(endmin,33);  // 设置拍照时间 end time。
	buffer.writeUInt8(0x01,34);  // 目前都认为一个机器一个摄像头。
	var crc = crcHelper.calCRC(buffer.slice(0,35));
	buffer.writeUInt16LE(crc, 35); 
	buffer.writeUInt8(0x96,37);
	return buffer;
}

/*  设置设备的拍照参数。 */
function setDevice(param, fn) {
	var deviceId = param.deviceId;
	var socket = socketClients.find(deviceId);
	if (!socket) {
		var msg = 'Err: Cannot find the socket for device!';
		return fn({code: errorCode.NO_SOCKET, msg:msg});
	}
	// do the job in async way.
	async.waterfall([
		function(next){  // this function get the config information.
			var select = {
				resolution: 1,
				deviceWorkBeginTime: date,
				deviceWorkEndTime: date,
				photoInterval: 1,
				standby:1,				
			};
			var match= {
				deviceID: deviceId,
			};
			var query = {
				select: select,
				match: match,
			};
			deviceModel.lookup(query, function(err, rows){
				if (err) {
					next(err);
				}else {
					if (rows.length==0) {
						var msg = 'Err: DB Not found the data!';
						next({code: errorCode.NO_DATA_MATCH, msg:msg});
					}else {
						next(null, rows[0]);
					}
				}
			});
		},
		function(device, next){  // send the config command 
			debug("In set Parameter, what is device:");
			debug(device);
			debug(device.resolution);	
			var buffer = fillSetParaPacket(deviceId, device);
			if (socket){
				socket.write(buffer);	
				debug("sent set parameter command.");
				debug(buffer);
				next(null,device);
			}else{
				next("error in send set parameter command through socket.", device);
			}
			
		},
		function(device, next){  // send the capture timer command 
			debug("In set capture timer, what is device:");
			debug(device);
			debug(typeof(device.deviceWorkBeginTime));
			var buffer = fillSetTimerPacket(deviceId, device);
			if (socket){
				socket.write(buffer);	
				debug("sent set capture timer command.");
				debug(buffer);
				next(null, device);
			}else{
				next("error in send capture timer command through socket.", device);
			}
		}], 
		// ],
		function(err, device){
			if (err) {
				var msg = err.msg || err;
				console.error(moduleName + ' Failed to get the command for'+msg);
			}else {
				debug('Success to send command to device:'+deviceId);
				fn(null);
			}
	});
}

/*  就是手动拍照的意思，不知道为什么取这个名字*/
function setPhotos(param, fn){
	debug('start to call set photo command to device.');
	var deviceId = param.deviceId;
	var channelNo = param.channelNo;
	var socket = socketClients.find(deviceId);
	if (!socket) {
		var msg = 'Err: Cannot find the socket for device!';
		return fn({code: errorCode.NO_SOCKET, msg:msg});
	}

	debug('found the socket for device:' + deviceId);
	// assenble the packet
	var buffer = new Buffer(39);
	debug('write the set photo command to devce1.');
	buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
	debug('write the set photo command to devce1.');
	buffer.writeInt16LE(23205, 0);  //23205
	debug('write the set photo command to devce1.');
	buffer.writeInt16LE(12, 2);  // pay load is 56
	debug('write the set photo command to devce1.');
	//var strt = '06M00001800036603';
	buffer.write(deviceId,4,17);
	debug('write the set photo command to devce1.');
	buffer.writeUInt8(0x06,21);
	debug('write the set photo command to devce1.');
	buffer.writeUInt8(0xCB,22);
	debug('write the set photo command to devce1.');
	buffer.writeUInt8(0x01,23);
	debug('write the set photo command to devce1.');
	buffer.writeUInt8(channelNo,24);
	debug('write the set photo command to devce1.');
	// buffer.writeUInt8(0x02,24);
	buffer.writeUInt8(0x01,25);
	debug('write the set photo command to devce1.');
	var crc = crcHelper.calCRC(buffer.slice(0,36));
	debug('write the set photo command to devce1.');
	buffer.writeUInt16LE(crc, 36); 
	debug('write the set photo command to devce1.');
	buffer.writeUInt8(0x96,38);

	// write back
	try {
		debug('write the set photo command to devce.');
	   	socket.write(buffer);
	} catch (err) {
		var msg =  'not able to send packet through client socket!';
		// 3004 error means can't use the socket to send packet.
	  	return fn({code:3004, msg:msg});
	}
	
	fn(null);
}

/*  设置设备的拍照参数。 */
function setCaptureTime(param, fn) {
	var deviceId = param.deviceId;
	var socket = socketClients.find(deviceId);
	if (!socket) {
		var msg = 'Err: Cannot find the socket for device!';
		return fn({code: errorCode.NO_SOCKET, msg:msg});
	}
	// do the job in async way.
	async.waterfall([
		function(next){  // this function get the config information.
			var select = {
				resolution: 1,
				deviceWorkBeginTime: date,
				deviceWorkEndTime: date,
				photoInterval: 1,
				standby:1,				
			};
			var match= {
				deviceID: deviceId,
			};
			var query = {
				select: select,
				match: match,
			};
			deviceModel.lookup(query, function(err, rows){
				if (err) {
					next(err);
				}else {
					if (rows.length==0) {
						var msg = 'Err: DB Not found the data!';
						next({code: errorCode.NO_DATA_MATCH, msg:msg});
					}else {
						next(null, rows[0]);
					}
				}
			});
		},
		function(device, next){  // send the config command 
			debug("In set Parameter, what is device:");
			debug(device);
			debug(device.resolution);	
			var buffer = fillSetParaPacket(deviceId, device);
			if (socket){
				socket.write(buffer);	
				debug("sent set parameter command.");
				debug(buffer);
				next(null,device);
			}else{
				next("error in send set parameter command through socket.", device);
			}
			
		},
		function(device, next){  // send the capture timer command 
			debug("In set capture timer, what is device:");
			debug(device);
			debug(typeof(device.deviceWorkBeginTime));
			var buffer = fillSetTimerPacket(deviceId, device);
			if (socket){
				socket.write(buffer);	
				debug("sent set capture timer command.");
				debug(buffer);
				next(null, device);
			}else{
				next("error in send capture timer command through socket.", device);
			}
		}], 
		function(err, device){
			if (err) {
				var msg = err.msg || err;
				console.error(moduleName + ' Failed to get the command for'+msg);
			}else {
				debug('Success to send command to device:'+deviceId);
				fn(null);
			}
	});
}

function updateDevice(param, fn){
	// var file=path.resolve('/home/yzhou51/workspace/wire_check-dev-yzhou51/updateFiles/'+param.filename);  
	// var rs=fs.createReadStream(file,{highWaterMark:5});  
	// var dataArr=[],//存储读取的结果集合  
	//     len=0;  
	// /* 
	// *  1.读取结果为Buffer对象 
	//  */  
	// rs.on('data',function(chunk){  
	//     // console.log(Buffer.isBuffer(chunk));  
	//     dataArr.push(chunk);  
	//     len+=chunk.length;  
	// });  
	// rs.on('end',function(){  
	//     var result=Buffer.concat(dataArr,len);  
	//     console.log(result);  
	fs.readFile('/home/yzhou51/workspace/wire_check-dev-yzhou51/back/uploads/update/'+param.filename, function(err, data){
	    console.log(data);
	    console.log(data.length);

	    var result = data;

	    debug('start to update device.');
		var deviceId = param.deviceId;
		var filename = param.filename;

		var socket = socketClients.find(deviceId);
		if (!socket) {
			var msg = 'Err: Cannot find the socket for device!';
			return fn({code: errorCode.NO_SOCKET, msg:msg});
		}

		debug('found the socket for device:' + deviceId);

		// assenble the packet
		var namelen = filename.length;

		var filenamebuffer = new Buffer(20);
		var namebuffer = new Buffer(filename);
		var fillbuffer = new Buffer(20-namelen);
		fillbuffer.fill(0);

		// fillbuffer.copy(filenamebuffer,0);
		// namebuffer.copy(filenamebuffer,20-namelen-2);

		namebuffer.copy(filenamebuffer,0);
		fillbuffer.copy(filenamebuffer,namelen);

		console.log(filenamebuffer);
		var contentbuffer = result;
		var len = contentbuffer.length;
		console.log('file size: '+len);
		var packet_no = Math.ceil(len/60000);

		if(len>60000) {
			console.log('*******************'+packet_no);
			for(var i=0;i<packet_no;i++){
				if(i == packet_no-1){
					var last_len = len-60000*(packet_no-1)
					var slicebuffer = contentbuffer.slice(60000*i,60000*i+last_len);
					console.log('packet_no:'+i+' packet_size:'+slicebuffer.length);
					var packet_len = 28+last_len;
					var buffer = new Buffer(last_len+55);
					buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
					buffer.writeUInt16LE(23205, 0);  //23205
					buffer.writeUInt16LE(packet_len, 2);  // pay load is 56
					buffer.write(deviceId,4,17);
					buffer.writeUInt8(0x03,21);
					buffer.writeUInt8(0xA9,22);
					buffer.writeUInt8(0x01,23);
					filenamebuffer.copy(buffer,24);
					buffer.writeUInt32LE(packet_no,44);
					buffer.writeUInt32LE(i+1,48);
					slicebuffer.copy(buffer,52);
					var crc = crcHelper.calCRC(buffer.slice(0,52+last_len));
					buffer.writeUInt16LE(crc, 52+last_len); 
					buffer.writeUInt8(0x96,54+last_len);
				}else{
					var slicebuffer = contentbuffer.slice(60000*i,60000*(i+1));
					console.log('packet_no:'+i+' packet_size:'+slicebuffer.length);
					var packet_len = 28+60000;
					var buffer = new Buffer(60000+55);
					buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
					buffer.writeUInt16LE(23205, 0);  //23205
					buffer.writeUInt16LE(packet_len, 2);  // pay load is 56
					buffer.write(deviceId,4,17);
					buffer.writeUInt8(0x03,21);
					buffer.writeUInt8(0xA9,22);
					buffer.writeUInt8(0x01,23);
					filenamebuffer.copy(buffer,24);
					buffer.writeUInt32LE(packet_no,44);
					buffer.writeUInt32LE(i+1,48);
					slicebuffer.copy(buffer,52);
					var crc = crcHelper.calCRC(buffer.slice(0,52+60000));
					buffer.writeUInt16LE(crc, 52+60000); 
					buffer.writeUInt8(0x96,54+60000);
				}
				
				
				// write back
				try {
					debug('write the set photo command to devce.');
				   	socket.write(buffer);
				} catch (err) {
					var msg =  'not able to send packet through client socket!';
					// 3004 error means can't use the socket to send packet.
				  	return fn({code:3004, msg:msg});
				}
			}
		}else{
			var slicebuffer = contentbuffer;
			console.log('packet_no:'+i+' packet_size:'+slicebuffer.length);
			var packet_len = 28+len;
			var buffer = new Buffer(len+55);
			buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
			buffer.writeUInt16LE(23205, 0);  //23205
			buffer.writeUInt16LE(packet_len, 2);  // pay load is 56
			buffer.write(deviceId,4,17);
			buffer.writeUInt8(0x03,21);
			buffer.writeUInt8(0xA9,22);
			buffer.writeUInt8(0x01,23);
			filenamebuffer.copy(buffer,24);
			buffer.writeUInt32LE(1,44);
			buffer.writeUInt32LE(1,48);
			slicebuffer.copy(buffer,52);
			var crc = crcHelper.calCRC(buffer.slice(0,52+len));
			console.log(crc);
			buffer.writeUInt16LE(crc, 52+len); 
			buffer.writeUInt8(0x96,54+len);

			// write back
			try {
				debug('write the set photo command to devce.');
				socket.write(buffer);
			} catch (err) {
				var msg =  'not able to send packet through client socket!';
					// 3004 error means can't use the socket to send packet.
					return fn({code:3004, msg:msg});
			}
		}

		console.log('***********finish part');
		var finishbuffer = new Buffer(55);
		finishbuffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
		finishbuffer.writeUInt16LE(23205, 0);  //23205
		finishbuffer.writeUInt16LE(28, 2);  // pay load is 56
		finishbuffer.write(deviceId,4,17);
		finishbuffer.writeUInt8(0x03,21);
		finishbuffer.writeUInt8(0xAA,22);
		finishbuffer.writeUInt8(0x01,23);
		filenamebuffer.copy(buffer,24);
		finishbuffer.writeUInt32LE(packet_no,44);

		var time = new Date().getTime();

		finishbuffer.writeUInt32LE(200,48);
		var crc = crcHelper.calCRC(finishbuffer.slice(0,52));
		console.log(crc);
		finishbuffer.writeUInt16LE(crc, 52); 
		finishbuffer.writeUInt8(0x96,54);

		try {
			debug('write the finish command to devce.');
			socket.write(buffer);
		} catch (err) {
			var msg =  'not able to send packet through client socket!';
					// 3004 error means can't use the socket to send packet.
					return fn({code:3004, msg:msg});
		}

		console.log(buffer);

		fn(null);

	});  
	
	
}

function resetDevice(param, fn){
	debug('start to call reset command to device.');
	var deviceId = param.deviceId;
	var mode = param.mode;
	var socket = socketClients.find(deviceId);
	if (!socket) {
		var msg = 'Err: Cannot find the socket for device!';
		return fn({code: errorCode.NO_SOCKET, msg:msg});
	}

	debug('found the socket for device:' + deviceId);
	// assenble the packet
	var buffer = new Buffer(33);
	buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
	// debug('write the set photo command to devce1.');
	buffer.writeInt16LE(23205, 0);  //23205
	// debug('write the set photo command to devce1.');
	buffer.writeInt16LE(6, 2);  // pay load is 56
	// debug('write the set photo command to devce1.');
	//var strt = '06M00001800036603';
	buffer.write(deviceId,4,17);
	// debug('write the set photo command to devce1.');
	buffer.writeUInt8(0x03,21);
	// debug('write the set photo command to devce1.');
	buffer.writeUInt8(0xAD,22);
	// debug('write the set photo command to devce1.');
	buffer.writeUInt8(0x01,23);
	// debug('write the set photo command to devce1.');
	buffer.writeInt16LE(mode,24);
	// debug('write the set photo command to devce1.');
	var crc = crcHelper.calCRC(buffer.slice(0,30));
	// debug('write the set photo command to devce1.');
	buffer.writeUInt16LE(crc, 30); 
	// debug('write the set photo command to devce1.');
	buffer.writeUInt8(0x96,32);

	console.log(buffer);
	// write back
	try {
		debug('write the set photo command to devce.');
	   	socket.write(buffer);
	} catch (err) {
		var msg =  'not able to send packet through client socket!';
		// 3004 error means can't use the socket to send packet.
	  	return fn({code:3004, msg:msg});
	}
	
	fn(null);
}

module.exports.setDevice = setDevice;
module.exports.setPhotos = setPhotos;
module.exports.setCaptureTime = setCaptureTime;
module.exports.updateDevice = updateDevice;
module.exports.resetDevice = resetDevice;