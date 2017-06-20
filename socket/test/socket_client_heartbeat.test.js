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
var socketHelper = require('../logic/socket.logic');
var crcHelper = require('../logic/calCRC');

var port = (process.env.PORT_ENV && 
	parseInt(process.env.PORT_ENV, 10)) || 2000;

var sequence = 1;

describe('device.socket.client.heartbeat', function () {
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

	it('report init data', function (done){
		this.timeout(50000);
		var buffer = new Buffer(31);
		buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
		buffer.writeInt16LE(23205, 0);  //23205
		buffer.writeInt16LE(4, 2);  //23205
		var strt = '06M00001800036603';
		buffer.write(strt,4,17);
		buffer.writeUInt8(0x07,21);
		buffer.writeUInt8(0xE6,22);
		buffer.writeUInt8(0x01,23);
		var curtick = socketHelper.getCurrentSeconds();
		buffer.writeInt32LE(curtick, 24);
		var crc = crcHelper.calCRC(buffer.slice(0,28));
		buffer.writeUInt16LE(crc, 28); 
		buffer.writeUInt8(0x96,30);

		var socketClient = new net.Socket();
		//socketClient.setEncoding('ascii');
		socketClient.connect(port, host, function(){
            console.log('Connected to: ' + host + ':' + port);
            console.log('buffer length:'+buffer.length);
            console.log(buffer);
            
        });

        socketClient.write(buffer);

        var getdatacount = 0;
        socketClient.on('data', function(chunk){
            //var json = JSON.parse(chunk.toString());
            console.log('recv data length:'+ chunk.length);
            console.log(chunk);
            console.log(typeof(chunk));
            getdatacount+=1;
            if (getdatacount>5){
            	socketClient.destroy();
            	done();
            }
            
        });

        socketClient.on('error', function(err){
            done('tcp error: ' + err);
        });
	});
	
});