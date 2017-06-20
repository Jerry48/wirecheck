// device socket API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.27, created by Andy
 *  
 */

 require('should');
var net = require('net');
var async = require('async');
var host = 'localhost';
var moment = require('moment');

var port = (process.env.PORT_ENV && 
	parseInt(process.env.PORT_ENV, 10)) || 6178;

var sequence = 1;

describe('device.socket.client', function () {
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

	it('heart beat', function (done){
		this.timeout(50000);
		

		var jsondata = {
			deviceId: 'test1',
			timestamp: moment().format('YYYY-MM-DD hh:mm:ss'),
			data: 0xAA,
		};
		var jsonStr = JSON.stringify(jsondata);
		var buffer = new Buffer(20 + jsonStr.length );
		fillHeader(buffer, jsonStr.length);
		buffer.write(jsonStr, 20);

		var socketClient = new net.Socket();
		socketClient.connect(port, host, function(){
            console.log('Connected to: ' + host + ':' + port);
            socketClient.write(data);
        });

        socketClient.on('data', function(chunk){
            //var json = JSON.parse(chunk.toString());
            console.log(chunk);
            socketClient.destroy();
            done();
        });

        socketClient.on('error', function(err){
            done('tcp error: ' + err);
        });
	});

	function fillHeader(buf, length){
		var header = {
			type: 0,
			seq: sequence++,
			subNos: 1,
			subSeq: 1,
			length: length,
		};

		buf.writeUInt32LE(header.type, 0);
		buf.writeUInt32LE(header.seq, 4);
		buf.writeUInt32LE(header.subNos, 8);
		buf.writeUInt32LE(header.subSeq, 12);
		buf.writeUInt32LE(header.subSeq, 12);
		buf.writeUInt32LE(header.header, 16);
		return buf;
	}
});