// device socket API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.27, created by Andy
 * 2016.08.24, modified by Tarrega
 */

require('should');
var net = require('net');
var async = require('async');
var host = '139.196.202.6';
var moment = require('moment');
var crcHelper = require('../logic/calCRC');
var socketHelper = require('../logic/socket.logic');

var port = (process.env.PORT_ENV && 
	parseInt(process.env.PORT_ENV, 10)) || 2000;

var sequence = 1;

describe('device.socket.report.status', function () {
	beforeEach(function (done) {
		done();
	});

	afterEach(function (done){
		done();
	});

	before(function (done) {
		done();
	});

	after(function (done){
		done();
	});

	it('report status data', function (done){
		this.timeout(5000);
		buffer = new Buffer(83);
		buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
		buffer.writeInt16LE(23205, 0);  //23205
		buffer.writeInt16LE(56, 2);  // pay load is 56
		var strt = '06M00001800036603';
		buffer.write(strt,4,17);
		buffer.writeUInt8(0x07,21);
		buffer.writeUInt8(0xE8,22);
		buffer.writeUInt8(0x01,23);
		buffer.writeInt32LE(1000000, 24);
		buffer.writeFloatLE(5.55,28);
		buffer.writeFloatLE(35.55,32);
		buffer.writeFloatLE(1000.0,36);
		buffer.writeUInt8(0x01,40);
		var curtick = socketHelper.getCurrentSeconds();
		buffer.writeInt32LE(curtick, 41);
		buffer.writeInt32LE(1000000, 45);
		buffer.writeUInt8(0x01,49);
		var crc = crcHelper.calCRC(buffer.slice(0,80));
		buffer.writeUInt16LE(crc, 80); 
		buffer.writeUInt8(0x96,82);

		var socketClient = new net.Socket();
		//socketClient.setEncoding('ascii');

		socketClient.connect(port, host, function(){
            console.log('Connected to: ' + host + ':' + port);
            console.log("sending buffer:");
            console.log(buffer);
            socketClient.write(buffer);
        });

        socketClient.on('data', function(chunk){
            //var json = JSON.parse(chunk.toString());
            console.log('recv data length:'+ chunk.length);
            console.log('recv data:');
            console.log(chunk);
            socketClient.destroy();
            done();
        });

        socketClient.on('error', function(err){
            done('tcp error: ' + err);
        });
	});
	
});