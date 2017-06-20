/* Tarrega Test java scripts */
var debug = require('debug')('temptest');

var buf1 = new Buffer([05, 00, 00, 00, 00, 01, 00 , 02]);
var buf2 = new Buffer([21, 22, 30, 40, 50]);
var buf3 = new Buffer("www.runoob.com", "utf-8");
console.log(buf2)
console.log(buf3)
buf3.copy(buf2, 0);  // buffer的长度如果不够，不会出错，会扔掉数据。
console.log(buf2);  
// test read int
console.log(buf1.readInt32LE(0))
console.log(buf1.readInt16LE(4))
console.log(buf1.readInt16LE(6))
//console.log("this is outout bound" +  buf1.readInt16LE(8))  // 会出错的。

var buf4 = buf3.slice(0,3);
console.log("is sliced buff a buffer?" + Buffer.isBuffer(buf4));  

var buf5 = new Buffer("ABCDEFGabcdefg",'ascii');
console.log(buf5);
var buf2 = new Buffer([0x41, 0x42, 0x43, 0x45, 0x50, 0x50, 0x50]);
console.log('tostring:'+buf2.toString('ascii'));

// test datetime
var socketlogic = require('./logic/socket.logic');
var si = socketlogic.getCurrentSeconds();
console.log("current seconds:" + si);
curdate = socketlogic.getDatetimeFromSeconds(si);
var now = new Date();
console.log('datetime object should be:'+typeof(now));
console.log(typeof(curdate));
console.log("current date:" + curdate);

// test list and dicitionary
var picbufdic = {};
var dev1list = [];
var dev2list = [];
picbufdic['dev1'] = dev1list;
picbufdic['dev2'] = dev2list;
var buf1 = new Buffer(10);
var buf2 = new Buffer(10);
var buf3 = new Buffer(10);
picbufdic['dev1'].push(buf1);
picbufdic['dev1'].push(buf2);
picbufdic['dev2'].push(buf3);
console.log("length of total dev:" + picbufdic.length);
console.log("length of dev1 buffer:" + picbufdic['dev1'].length);



var moment = require("moment");
var now = moment();
var timestr = now.format("YYYYMMDDHHmmss");
var monthstr = now.format("YYYYMM");
console.log(timestr);
console.log(monthstr);
console.log(typeof(monthstr));

var fs = require('fs');
var fullpath =  '/home/yzhou51/workspace/wire_check-dev-yzhou51/socket2/picupload/06M00001800036603/'
if (!fs.existsSync(fullpath)) {
		debug("creat path:"+fullpath);
        fs.mkdirSync(fullpath);
    }

console.log(fs.existsSync(fullpath) );


console.log("test CRC");
var crcHelper = require('./logic/calCRC');
var buf = new Buffer([0x31, 0x32, 0x33]);
var crc = crcHelper.calCRC(buf);
buft = new Buffer(2);
buft.writeUInt16LE(crc, 0); 
console.log(typeof(crc));
console.log(crc);
console.log("CRC out in hex");
console.log(buft);

