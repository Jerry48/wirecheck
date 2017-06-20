var net = require('net');

var cacheBuf = new Buffer(9000+20) ;
var offset = 0;

var server = net.createServer(function(socket){
	socket.on('connect',function(){
		console.log('  Client connected.');
		//socket.write("hello");

	});

		socket.write('hello');

	socket.on('data',function(data){
		if (Buffer.isBuffer(data)) {
			data.copy(cacheBuf, offset);
			offset+=data.length;
		}
		console.log('  Get data from client : '+data.toString()+' length: '+offset);
		if(offset>50)  socket.end('end');
		else socket.write('ok');
	});

	socket.on('end',function(){
		console.log('disconnected');
	});

});

server.listen(8000,function(){
	console.log("server Start");
});