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

var crcHelper = require('../logic/calCRC');

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
		this.timeout(50000);
		var socketClient = new net.Socket();
		//socketClient.setEncoding('utf8');
		console.log('buffer size:'+net.Socket.bufferSize);

		socketClient.connect(port, host, function(){
            console.log('Connected to: ' + host + ':' + port);
           // console.log('buffer:'+buffer.toString());
           sendPicture();
        });

		
        socketClient.on('data', function(chunk){
            //var json = JSON.parse(chunk.toString());
            console.log('recv data length:'+chunk.length);
            console.log('recv data:%', chunk);
            var code = chunk.readUInt8(22);
            if (code  == 0xCF){
            	done();
            }
        });

        function sendPicture(){
        	// send the start upload
	        var sbuf = startPacket();
			socketClient.write(sbuf);        

			// send the pictre
			var packetSize = 60000;
			var fileBuf = fs.readFileSync('./test7.jpg');
			var offset = 0;
			
			var subNos = parseInt(fileBuf.length / packetSize);
			if (fileBuf.length % packetSize) {
				subNos +=1;
			}
			console.log('file size:'+fileBuf.length);
			console.log('subNos:'+subNos);
			var seqno = 999;
			var end = packetSize;
			if (end>fileBuf.length){
				end = fileBuf.length;
			}
			//subNos = 1 ;
			for (var i=0;i<subNos;i++){
				var pksize = end-offset;
				var segbuf = new Buffer(pksize);
				fileBuf.copy(segbuf, 0, offset, end); 	
				sbuf = fillPacket(seqno, i, subNos, pksize , segbuf);
				socketClient.write(sbuf);
				offset = end;
				end = offset+packetSize;
	        	if (end>fileBuf.length) {
	        		end = fileBuf.length;
	        	}
			}

			// send the finish packet
			setTimeout(function(){
               console.log('send finish packet.');
				sbuf = endPacket();
				socketClient.write(sbuf);
	          }, 1000)
        }
        
        socketClient.on('drain', function(chunk){
            console.log(' on drain:');
        });
        socketClient.on('error', function(err){
            done('tcp error: ' + err);
        });

	    function fillPacket(seqno, curno, subnos, pksize, segbuf){
			var totlen = pksize + 8 + 6 + 27;
			console.log('totlen:' + totlen);
			var buffer = new Buffer(totlen);
			console.log('picture buffer length:'+buffer.length );
			buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
			buffer.writeUInt16LE(23205, 0);  //23205
			buffer.writeUInt16LE(pksize+8+6, 2);  
			var strt = '06M00001800036603';
			buffer.write(strt,4,17);
			buffer.writeUInt8(0x05,21);
			buffer.writeUInt8(0xCD,22);
			buffer.writeUInt8(0x01,23);
			buffer.writeUInt8(0x01,24);
			buffer.writeUInt8(0xff,25);
			buffer.writeUInt16LE(subnos,26);
			buffer.writeUInt16LE(curno,28);
			buffer.writeUInt32LE(seqno,30);
			// ignore the offset in picture.
			segbuf.copy(buffer,38);
			var crc = crcHelper.calCRC(buffer.slice(0, buffer.length-3));
			buffer.writeUInt16LE(crc, buffer.length-3); 
			buffer.writeUInt8(0x96,totlen-1);
			return buffer;
		}

		function endPacket(){
			var buffer = new Buffer(41);
			buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
			buffer.writeInt16LE(23205, 0);  //23205
			buffer.writeInt16LE(14, 2);  
			var strt = '06M00001800036603';
			buffer.write(strt,4,17);
			buffer.writeUInt8(0x05,21);
			buffer.writeUInt8(0xCE,22);
			buffer.writeUInt8(0x01,23);
			buffer.writeUInt8(0x01,24);
			buffer.writeUInt8(0xff,25);
			// ignore the timestamp
			var crc = crcHelper.calCRC(buffer.slice(0,38));
			buffer.writeUInt16LE(crc, 38); 
			buffer.writeUInt8(0x96,40);
			return buffer;
		}

		function startPacket(){
			var buffer = new Buffer(39);
			buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
			buffer.writeInt16LE(23205, 0);  //23205
			buffer.writeInt16LE(12, 2);  
			var strt = '06M00001800036603';
			buffer.write(strt,4,17);
			buffer.writeUInt8(0x05,21);
			buffer.writeUInt8(0xCC,22);
			buffer.writeUInt8(0x01,23);
			buffer.writeUInt8(0x01,24);
			buffer.writeUInt8(0xff,25);
			var crc = crcHelper.calCRC(buffer.slice(0,36));
			buffer.writeUInt16LE(crc, 36); 
			buffer.writeUInt8(0x96,38);
			return buffer;
		}    
	});

	
	
});
