// miniERP entry for wechat
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.09, created by Andy.zhou
 *  
 */
'use strict';
var debug = require('debug')('socket_server.app');
const net = require('net');
const server = net.createServer((c) => {
  // 'connection' listener
  console.log('client connected');
  c.on('end', () => {
    console.log('client disconnected');
  });
  c.on('data', (buf)=>{
    console.log(c.remoteAddress);
    console.log('recv data'+buf);
  });

  c.pipe(c);
});
server.on('data', function(buf){
  console.log(buf.toString());
});
server.on('error', (err) => {
  throw err;
});
server.listen(2000, () => {
  console.log('socket server listen on 2000 bound');
});