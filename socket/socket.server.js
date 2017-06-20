// socket server 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.22, created by Andy.zhou
 * 2016.08.25, modified by Tarrega
 *  
 */
 
'use strict';  
var moduleName = 'socket_server.app';

//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('./db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var net = require('net');
var crypto = require('crypto');
var fs = require('fs');
var crcHelper = require('./logic/calCRC');

var socketClients = require('./logic/socket_clients.logic');
var socketHelper = require('./logic/socket.logic');

var deviceModel = require('../back/model/device_info');

//logic
var socketHeartbeat = require('./logic/socket_heartbeat.logic');
var socketDeviceCommand = require('./logic/socket_device_commands.logic');
var socketSavePicture = require('./logic/socket_picture_upload.logic');
var socketDeviceStatus = require('./logic/socket_device_report_status.logic');
var socketDeviceInit = require('./logic/socket_device_init_connect.logic');
var socketDevicePic = require('./logic/socket_picture_report.logic');
var socketUploadStart = require('./logic/socket_device_start_upload.logic');
var socketUploading = require('./logic/socket_device_upload.logic');
var socketUploadFinish = require('./logic/socket_device_finish_upload.logic');
var socketSettimeResponse = require('./logic/socket_device_report_timeset.logic');
var socketDeviceLineTemperature = require('./logic/socket_device_line_temperature.logic');
//helper 
var logic_helper = require('../common/logic_helper');
var wxConstants  = require('../common/constants');
var errorCode 	 = require('../common/errorCode');
var dataHelper   = require('../common/dataHelper');

var picuploadTmp = __dirname+ '/picupload/';


function parseSinglePacket(param){
	var header = param.header;
	var dataBuf = param.buf;

	var cipherLen = socketHelper.computeCipherSize(header.length);

	debug('packet data length='+header.length);
	debug('packet data cipher length='+cipherLen);

	//var cipherBuf = Buffer.from(buffs, header.length);
	//FIXME
	var jsonBuf = new Buffer(header.length);//socketHelper.decryptData(cipherBuf);
	dataBuf.copy(jsonBuf, 0, wxConstants.SOCKET.HEADLEN, dataBuf.length);
	var jsonData ;
	if(header.type!=wxConstants.SOCKETTYPE.RAWPICTURE){
		debug('The recv jsonData is :%j', jsonBuf);
		jsonData = JSON.parse(jsonBuf.toString('utf8',
							 0, header.length));
	}

	var packet = {
		header: header,
		jsonData: jsonData,
	};

	return packet;
}

function parseMultiPackets(param){
	var packets = [];
	for (var i = 0; i < param.bufs.length; i++) {
		packets.push(param.bufs[i]);
	}

	return {
		header: param.header,
		packets: packets,
	};
}

function verifyAckPacket(packet, fn){
	debug('Recv confirm packet: %j', packet.header);
	fn(null);
}

function processPacket(packet, fn){
	switch(packet.frame_type)
	{
	case 0x07://工作状态报
		if (packet.packet_type==0xE7){
		  	debug('** process the initial connection. ');	
			socketDeviceInit.processPacket(packet, fn);
		}
	  	if (packet.packet_type==0xE6){
		  	debug('** process the heartbeat. ');	
			socketHeartbeat.processPacket(packet, fn);
		}
		if (packet.packet_type==0xE8){
		  	debug('** process the device status. ');	
			socketDeviceStatus.processPacket(packet, fn);
		}
		if (packet.packet_type==0xE9){
		  	debug('** process the device fault information. ');	
			socketDeviceFault.processPacket(packet, fn);
		}
	  	break;
	case 0x05://远程图像数据报
		if (packet.packet_type==0xCC){
		  	debug('** process the picture upload request. ');	
			socketUploadStart.processPacket(packet, fn);
		}
		if (packet.packet_type==0xCD){
		  	debug('** process the picture uploading. ');	
			socketUploading.processPacket(packet, fn);
		}
		if (packet.packet_type==0xCE){
		  	debug('** process the picture finish upload . ');	
			socketUploadFinish.processPacket(packet, fn);
		}
		if (packet.packet_type==0xC9){
		  	debug('** get the set parameter command feedback. ');	
			fn(null, null);  // no error ,no buffer to sendback
		}
		if (packet.packet_type==0xCA){
		  	debug('** get the capture timer command feedback. ');	
			fn(null, null);  // no error ,no buffer to sendback
		}
		break;
	case 0x04://控制响应报
		if (packet.packet_type==0xA1){
		  	debug('** process settime response from device.');	
			socketSettimeResponse.processPacket(packet, fn);
		}
		if (packet.packet_type==0xAB){
		  	debug('** process settime response from device.');	
			socketFillPacket.processPacket(packet, fn);
		}
		break;
	case 0x01://监测数据报
		if (packet.packet_type==0x21){
		  	debug('** process line temperature from device.');	
			socketDeviceLineTemperature.processPacket(packet, fn);
		}
		break;
	default:
	  	fn('No handle for this kind of Packet!', null);
	}
}

function processInBuf(param){
	var formerBuf = param.formerBuf;
	var dataBuf = param.dataBuf;
	var header ;
	if (formerBuf) {
		if (formerBuf.length >= wxConstants.SOCKET.HEADLEN) {
			header = socketHelper.parserHeader(formerBuf);
		}
	}
}

function onSocketConnect(socket){
	var socketName = 'socket '+socket.remoteAddress
				+':'+socket.remotePort;
	//set the socket
	//socket.setEncoding('utf8');
	debug('socket connection from :' + socketName);

	
	var size =0;
	var sequence = 1;
	var cacheBuf = new Buffer(800000) ;
	//var formerBuf ;
	var offset = 0;
	var pkdataBuf = null;
	var otherlen = 27;

	socket.on('data', function(dataBuf){	
		debug('socket buffer size :' + socket.bufferSize);
		debug('socket bytes read:'+ socket.bytesRead);
		debug('recv data length:'+ dataBuf.length);		
		if (Buffer.isBuffer(dataBuf)) {
			dataBuf.copy(cacheBuf, offset);
			offset+=dataBuf.length;
		}
		//debug('cacheBuf:');
		//debug(cacheBuf);				
		var chunks = [];
		var pkstartid = cacheBuf.readUInt16LE(0);
		var pkdatalen = cacheBuf.readUInt16LE(2);
		debug('pkid:'+pkstartid+", data len: " + pkdatalen);
		//var pkendid = cacheBuf.readUInt8(pkdatalen+otherlen-1);  // maybe there is not enough data.
		if (pkstartid==23205 && pkdatalen>=1 ){ 
			var cacheind = 0 ;
			while (cacheind + pkdatalen + otherlen<=offset){
				var pklen = pkdatalen + otherlen ;
		  		var pkbuf = new Buffer(pklen);
		  		cacheBuf.copy(pkbuf, 0, cacheind, cacheind + pklen);	
		  		var hid = pkbuf.readUInt16LE(0);
		  		var eid = pkbuf.readUInt8(pklen-1);
		  		var crc1 = pkbuf.readUInt16LE(pklen-3);
		  		var crc2 = crcHelper.calCRC(pkbuf.slice(0, pklen-3));
		  		//debug('get crc:'+crc1+", shouldbe crc: " + crc2);
		  		if (hid==23205 &&  eid == 0x96 && crc1==crc2){
		  			var packet = socketHelper.parserPacket(pkbuf);
					debug("Get packet, device id: " + packet.cmd_id);
					debug('Get packet: ',packet);
		  			chunks.push(packet);
		  		} else {
		  			console.error('Invalid packet format, or invalid crc.')
		  		}
		  		cacheind = cacheind + pklen;
		  		if (cacheind+4<offset){  // cachebuffer中还有足够获取packet长度的信息
		  			pkstartid = cacheBuf.readUInt16LE(cacheind);
		  			pkdatalen = cacheBuf.readUInt16LE(cacheind+2);
		  		}
			}
			cacheBuf.copy(cacheBuf, 0, cacheind, offset);
			offset = offset - cacheind;
			debug('get packet number:'+chunks.length);
		}else{
			console.error("this is an unusal situation. There may exist error in packet length !");	
			offset = 0; // clear the cache.		    
		} 

		if (chunks.length>0) {
			for(var i=0;i<chunks.length;i++){
				packet=chunks[i];
				if (packet.cmd_id) {
					var strt = packet.cmd_id.toString('ascii');
					var deviceId = strt || "00000000000000000";

					//check deviceId exists or not in db
					var select = {deviceID: deviceId};
					var match = {deviceID: deviceId};
					var query = {
						select: select,
						match:match,
					};

					deviceModel.lookup(query, function(err,rows){
						if(err){
							console.error(err);
						}
						if(rows.length){
							//cache the socket
							socketClients.push({					
								socket:socket, 
								deviceId: deviceId
							});
						}
					});
				}

				processPacket(packet, function(err, resPacket){
					if (err) {
						console.error(socketName+err);					
						//socket.write("error in process Packet");
					}				
					if (resPacket) {   // need to send back, if resPacket is not null
						debug('response packet:', resPacket);
						var testSocket = socketClients.find({deviceId: deviceId});
						if (testSocket ) {
							debug('Found socket, sendback buffer length:' + resPacket.length);
							if (resPacket){
								testSocket.write(resPacket);
							}else{
								debug('No response Packet to be sent.')
							}
						}else{
							console.error('Can not find the socket.');
						}
					}				
				});	
			}
		}else {    // not a valid package
			//socket.write(socketHelper.readAckPacket({header:header}));
		}
	});

	socket.on('error', function(err){
		console.error(socketName+err);
	});

	socket.on('close', function(had_error){
		debug('close sockt' + socketName);
		if (had_error) {
			console.error('Err when close '+socketName);
		};
	});
}

function createSocketServer(param, fn){
	var port = param.port || param;
	debug('Try to create the socket server on port:'+port);
	
	var socket_server = net.createServer(onSocketConnect);

	socket_server.on('error', function(err){
		console.error('Server error:'+err);
	});

	socket_server.listen(port , fn);
	
	socketClients.socketServer = socket_server;

	debug('Start the socket sever on port:'+port);
}

function sendData(param, fn){
}

module.exports.createSocketServer = createSocketServer;
module.exports.sendData = sendData;