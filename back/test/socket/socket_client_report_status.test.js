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
var host = '139.196.202.6';
var moment = require('moment');

var port = (process.env.PORT_ENV && 
	parseInt(process.env.PORT_ENV, 10)) || 2000;

var sequence = 1;

describe('device.socket.client.init', function () {
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
		
		var data = {
			dataType: 2 ,
			deviceID: 'device1',
			disk:{
				memory:75,
				state:2,  
			    },
			temperature: 36.3,
			battery:{
				solarVoltage: 4,
				windVoltage:6,
				batteryVoltage:5,
				capacity:6,
				boardTemperature: 7,
			   },
			network:{
				signal: 5,
   			},
		};

		var jsondata = {
			deviceID: 'device1',
			timestamp: 133333311,
			data: data,
		};
		var jsonStr = JSON.stringify(jsondata);
		var buffer = new Buffer(20 + jsonStr.length );
		fillHeader(buffer, jsonStr.length);
		buffer.write(jsonStr, 20);

		var socketClient = new net.Socket();
		socketClient.setEncoding('utf8');

		socketClient.connect(port, host, function(){
            console.log('Connected to: ' + host + ':' + port);
            console.log('buffer:'+buffer.toString());
            socketClient.write(buffer);
        });

        socketClient.on('data', function(chunk){
            //var json = JSON.parse(chunk.toString());
            console.log('recv data length:'+chunk.length);
            console.log('recv data:%j', chunk.toString());
            socketClient.destroy();
            done();
        });

        socketClient.on('error', function(err){
            done('tcp error: ' + err);
        });
	});

	function fillHeader(buf, length){
		var header = {
			type: 0x00010002,
			seq: sequence++,
			subNos: 1,
			subSeq: 1,
			length: length,
		};

		buf.writeUInt32LE(header.type, 0);
		buf.writeUInt32LE(header.seq, 4);
		buf.writeUInt32LE(header.subNos, 8);
		buf.writeUInt32LE(header.subSeq, 12);
		buf.writeUInt32LE(header.length, 16);
		return buf;
	}
});
