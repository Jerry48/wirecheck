var net = require('net');


var client = new net.Socket();


client.connect(8000,function(){
	console.log('start');
	client.write('  I\'m client.');
});




client.on('data',function(data){
	console.log("  Get data from server : "+data.toString());
	if(data.toString() == 'end') client.end();
	else client.write('get' +data);
});

client.on('end',function(){

	console.log("end");
});



// var net = require('net');
// var client = net.connect({port:8000},function(){
// 	console.log('client connected');
// 	client.write('Hello from client !');
// });

// client.on('data',function(data){
// 	console.log(data.toString());
// 	client.end();
// });

// client.on('end',function(){
// 	console.log('end');
// });