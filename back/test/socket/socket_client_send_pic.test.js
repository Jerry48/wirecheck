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
var fs = require('fs');
var port = (process.env.PORT_ENV && 
	parseInt(process.env.PORT_ENV, 10)) || 2000;

var sequence = 1;

describe('device.socket.client.sendpic', function () {
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

	it('send pic data', function (done){
		this.timeout(5000000);
		var packetSize = 4096;

		var buffer = new Buffer(packetSize +20);
		
		var fileBuf = fs.readFileSync('./test.jpg');

		var socketClient = new net.Socket();
		//socketClient.setEncoding('utf8');
		console.log('buffer size:'+net.Socket.bufferSize);

		var offset = 0;
		var end = offset+packetSize;
		var subNos = parseInt(fileBuf.length / packetSize);
		if (fileBuf.length % packetSize) {
			subNos +=1;
		}
		
		console.log('file size:'+fileBuf.length);
		console.log('subNos:'+subNos);

		socketClient.connect(port, host, function(){
            console.log('Connected to: ' + host + ':' + port);
           // console.log('buffer:'+buffer.toString());

            fillHeader(buffer, subNos, packetSize);           
            fileBuf.copy(buffer, 20, offset, end); 
            //console.log("last data:"+buffer[4110]+buffer[4111]+buffer[4112]+buffer[4113]);

            socketClient.write(buffer);
            console.log("buffersize:"+socketClient.bufferSize);
            offset = end;
        });

        socketClient.on('data', function(chunk){
            //var json = JSON.parse(chunk.toString());
            console.log('recv data length:'+chunk.length);
            console.log('recv data:%j', chunk.toString());
            //socketClient.destroy();
            //socketClient.destroy();
            if (offset>=fileBuf.length) {
            	console.log('Transfer data done!');
            	done();
            	return;
            }
                   
        	end = offset+packetSize;
        	if (end>fileBuf.length) {
        		end = fileBuf.length;
        	}

            fillHeader(buffer, subNos, end - offset);
            fileBuf.copy(buffer, 20, offset, end);
			socketClient.write(buffer);
        	offset = end;
        });
        socketClient.on('drain', function(chunk){

            console.log(' on drain:');


        });
        socketClient.on('error', function(err){
            done('tcp error: ' + err);
        });
	});

	function fillHeader(buf, subNos, length){
		var header = {
			type: 0x00020000,
			seq: 1,
			subNos: subNos,
			subSeq: sequence++,
			length: length,
		};

		buf.writeUInt32LE(header.type, 0);
		buf.writeUInt32LE(header.seq, 4);
		buf.writeUInt32LE(header.subNos, 8);
		buf.writeUInt32LE(header.subSeq, 12);
		buf.writeUInt32LE(header.length, 16);
		console.log("header:%j", header);
		return buf;
	}
});
