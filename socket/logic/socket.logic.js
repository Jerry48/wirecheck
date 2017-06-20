// socket logic 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.22, created by Andy.zhou
 * 2016.08.22, modified by Tarrega
 * 帮助解析数据帧  
 */
 
'use strict';
var moduleName = 'socket.logic';

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

//constans & helper
var wxConstants     = require('../../common/constants');
var errorCode       = require('../../common/errorCode');
var logic_helper    = require('../../common/logic_helper');
var dataHelper      = require('../../common/dataHelper');

var sysHeaderBuf = new Buffer(wxConstants.SOCKET.HEADLEN);
var password = fs.readFileSync(__dirname+'/../des.key');
var DESKEY = null;





/**********************************************/
/** local functions						      */
/**********************************************/
function computeCipherSize(dataLen){
	var length = dataLen;
	//safe way to compuate the length
	var mod = dataLen % wxConstants.SOCKET.BLOCKSIZE;
	if (mod) {
		length += wxConstants.SOCKET.BLOCKSIZE - mod;
	}
	return length;
}

function getDESKey(argument) {
	if (!DESKEY) {
		DESKEY = new Buffer(password.substr(0,8));
	}
	return DESKEY;
}

// 输入任意长度的Buffer，输出2个Uint8.
function calCRC(inbuf){
	if (inbuf.length>0){
		return;
	}
}

/**********************************************/
/** public help functions					  */
/**********************************************/

/** process the packet according to I1 socket Interface ***/
function parserPacket(dataBuf){
	// check the CRC
	var inlen = dataBuf.length;
	var idbuf = new Buffer(17);
	var data = new Buffer(inlen-27);
	//dataBuf.copy(tBuf,0,0,inlen-3)
	//var crc = calCRC(dataBuf.slice(0,inlen-3));
	dataBuf.copy(idbuf,0,4,4+17);
	dataBuf.copy(data,0,24,24+inlen-27);
	var packet = {
		sync: dataBuf.readUInt16LE(0),
		packet_length: dataBuf.readUInt16LE(2),
		cmd_id: idbuf.toString(),
		frame_type: dataBuf.readUInt8(21),
		packet_type: dataBuf.readUInt8(22),
		frame_no: dataBuf.readUInt8(23),
		data:data,
	};
	return packet;
}


function parserHeader(headerBuf){
	var packetHeader = {
		type: headerBuf.readInt32LE(
			wxConstants.SOCKET.TYPEOFFSET),
		sequence: headerBuf.readInt32LE(
			wxConstants.SOCKET.SEQUENCEOFFSET),
		subPacketsNums: headerBuf.readInt32LE(
			wxConstants.SOCKET.SUBPACKETNUMSOFFSET),
		subSeq: headerBuf.readInt32LE(
			wxConstants.SOCKET.SUBSEQOFFSET),
		length: headerBuf.readInt32LE(
			wxConstants.SOCKET.LENGTHOFFSET),
	};
	return packetHeader;
}

function writeHeader(header){
	//fixme, confilct?
	var headerBuf = sysHeaderBuf;//new Buffer(wxConstants.SOCKET.HEADLEN);
	
	headerBuf.writeInt32LE(header.type,
			wxConstants.SOCKET.TYPEOFFSET);
	headerBuf.writeInt32LE(header.sequence,
			wxConstants.SOCKET.SEQUENCEOFFSET);
	headerBuf.writeInt32LE(header.subPacketsNums,
			wxConstants.SOCKET.SUBPACKETNUMSOFFSET);
	headerBuf.writeInt32LE(header.subSeq,
			wxConstants.SOCKET.SUBSEQOFFSET);
	headerBuf.writeInt32LE(header.length,
			wxConstants.SOCKET.LENGTHOFFSET);
	return headerBuf;
}

function decryptData(cipherBuf){
	try{
		var decipher = crypto.createDecipher('des', getDESKey());
		decipher.setAutoPadding(false);
		decipher.update(cipherBuf);
		var output = decipher.final();
		return output;
	}catch(e){
		console.error(moduleName+ e.toString);
		return null;
	}
}

function encryptData(plain){
	//we can improve this by use PKCS padding
	var padLen =  computeCipherSize(plain.length) - plain.length;
	var padBuf = new Buffer(padLen);
	var offset = 0;
	while(offset < padLen) {
		padBuf.writeUInt8(0xCC, offset++);
	}

	try
	{
		var cipher = crypto.createCipher('des', getDESKey());
		cipher.setAutoPadding(false);
		cipher.update(plain, 'utf8');
		cipher.update(padBuf);
		var cipherStr = cipher.final('utf8');
		return cipherStr;
	}catch(e){
		console.error(moduleName+ e.toString);
		return null;
	}
}

function createResPacket(param){
	var header = param.header;
	var data = param.data;

	var jsonData = JSON.stringify(data);

	var headerBuf = param.headerBuf;
	if (!headerBuf) {
		headerBuf = writeHeader(param.header || param);
	}
	
	//update the length
	headerBuf.writeInt32LE(jsonData.length, 
		wxConstants.SOCKET.LENGTHOFFSET);

	var cipher = encryptData(jsonData);

	var packet = headerBuf.toString('utf8', 0, wxConstants.SOCKET.HEADLEN);
	packet +=cipher;
	debug('ack packet length:'+packet.length);
	debug('ack packet:%j', packet);
	return packet;
}

function readAckPacket(param) {	
	var deviceID = 0;
	if (param) {
		deviceID = param.deviceID || param.deviceId || 0;
	}
	var data = {
		deviceID: deviceID,
		timestamp: getCurrentSeconds(),
		data: '0x55',
	};

	var jsonData = JSON.stringify(data);

	var headerBuf = param.headerBuf;
	if (!headerBuf) {
		headerBuf = writeHeader(param.header || param);
	}
	
	//update the length
	headerBuf.writeInt32LE(jsonData.length, 
		wxConstants.SOCKET.LENGTHOFFSET);

	var cipher = encryptData(jsonData);

	var packet = headerBuf.toString('utf8', 0, wxConstants.SOCKET.HEADLEN);
	packet +=cipher;
	debug('ack packet length:'+packet.length);
	debug('ack packet header:%j', param.header);
	return packet;
}

/* get seconds since epoch*/
function getCurrentSeconds(){
	var now = new Date();
	return parseInt (now.getTime() / 1000);
}

function getDatetimeFromSeconds(iseconds){
	var utcSeconds = iseconds;
	var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
	d.setUTCSeconds(utcSeconds);
	return d;
}



module.exports.parserPacket = parserPacket;
module.exports.parserHeader = parserHeader;
module.exports.writeHeader = writeHeader;
module.exports.decryptData = decryptData;
module.exports.encryptData = encryptData;
module.exports.readAckPacket = readAckPacket;
module.exports.computeCipherSize = computeCipherSize;
module.exports.getCurrentSeconds = getCurrentSeconds;
module.exports.getDatetimeFromSeconds = getDatetimeFromSeconds;