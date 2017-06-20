// insert data into data base 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by yanyan
 *  
 */
 'use strict';  
var moduleName = 'insert_data2.logic';

var debug = require('debug')(moduleName);

var async = require('async');

// var images = require('images');


var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var userDeviceRModel = require('../../model/user_device_r_info');
var channelModel = require('../../model/channel_info');
var deviceLineModel = require('../../model/device_line_info');
var deviceStatusModel = require('../../model/device_status_info');

var deviceProductModel = require('../../model/device_product_info');

var cmdModel = require('../../model/cmd_info');
var cmdDeviceRModel = require('../../model/cmd_device_r_info');
var cmdTempModel = require('../../model/cmd_temperature_info');
// var picModel = require('../../model/picture_info');
// var picProcessModel = require('../../model/picture_process_info');
// var commandModel = require('../../model/command_info');
// var heartBeatLogModel = require('../../model/heart_beat_log');
// var heartBeatLoseLogModel = require('../../model/heart_beat_lose_log');

// var deviceCharacterModel = require('../../model/device_character_info');

function createDeviceRoot(param, fn)
{
	var devices = [];
	var ids = [];
	for (var i = 0; i < 8; i++) {
		var device = {
			id: 'root_'+i,
			parentId: 'root',
			level: 0,
			name: 'devicelevel'+i,
		};
		devices.push(device);
		ids.push(device.id);
	}
	devices[0].name = '华东局';
	devices[1].name = '华南局';
	devices[2].name = '华中局';
	devices[3].name = '西南局';
	devices[4].name = '西北局';
	devices[5].name = '东北局';
	devices[6].name = '东南局';
	devices[7].name = '上海局';

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceLevelModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceLevelModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			deviceLevelModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create devices level:'+msg);
			fn(err);
		}else {
			console.log('Success to create devices level!');
			fn(null);
		}
	});
}

function createDeviceLevel(param, fn)
{
	var devices = [];
	var ids = [];
	for (var i = 0; i < 7; i++) {
		var device = {
			id: 'level_'+i,
			parentId: param.id,
			level: 1,
			name: 'devicelevel'+i,
		};
		devices.push(device);
		ids.push(device.id);
	}
	devices[0].name = '闵行';
	devices[1].name = '浦东';
	devices[2].name = '长宁';
	devices[3].name = '徐汇';
	devices[4].name = '嘉定';
	devices[5].name = '杨浦';
	devices[6].name = '临港';

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceLevelModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceLevelModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			deviceLevelModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create devices level:'+msg);
			fn(err);
		}else {
			console.log('Success to create devices level!');
			fn(null);
		}
	});
}

function createDeviceLevel2(param, fn)
{
	var devices = [];
	var ids = [];
	for (var i = 0; i < 7; i++) {
		var device = {
			id: 'level2_'+i,
			parentId: param.id,
			level: 2,
			name: 'devicelevel'+i,
		};
		devices.push(device);
		ids.push(device.id);
	}
	devices[0].name = '沪闵路';
	devices[1].name = '东川路';
	devices[2].name = '剑川路';
	devices[3].name = '莲花路';
	devices[4].name = '外环路';
	devices[5].name = '江川路';
	devices[6].name = '沧源路';

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceLevelModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceLevelModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			deviceLevelModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create devices level:'+msg);
			fn(err);
		}else {
			console.log('Success to create devices level!');
			fn(null);
		}
	});
}

function createLine(param, fn)
{
	var channels = [];
	var ids = [];

	for (var i = 0; i < 7; i++) {
		var channel = {
			id: 'line_'+i,
			name: 'line name'+i,
			parentId: param.id,
		};
		channels.push(channel);
		ids.push(channel.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceLineModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceLineModel.query(query, next);
		},
		function(next){
			var query = {
				values: channels,
				fields: channels[0],
			};
			deviceLineModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create user devices relation:'+msg);
			fn(err);
		}else {
			console.log('Success to create user devices relation!');
			fn(null);
		}
	});
}


function createDevices(param, fn) {

	var devices = [];
	var ids = [];
	for (var i = 0; i < 7; i++) {
		var beginTime = new Date();
		beginTime.setHours(8);

		var endTime = new Date();
		endTime.setHours(20);
		for (var j = 0; j < 10; j++) {
			var id = i*10 +j;
			
			var deviceID = (id < 10)? '06M0000180003660' + id : '06M000018000366' + id;
			
			var danger = "";
			switch(i+1){
				case 1:
					danger = "线下施工";
					break;
				case 2:
					danger = "建筑工地";
					break;
				case 3:
					danger = "塔吊作业";
					break;
				case 4:
					danger = "线下堆物";
					break;
				case 5:
					danger = "树木生长";
					break;
				case 6:
					danger = "野火防范";
					break;
				case 7:
					danger = "杆塔本体";
					break;
			}
			// sjtu location: 121.442869,31.032034
			var device = {
				deviceID: deviceID,
				parentId: 'level2_'+i,
				name: 'device name'+id,
				nickName: 'nickName'+id,
				lineId: 'line_'+i,
				lineName: 'line name'+i,
				area: '无',
				danger: danger,
				channelNo2: 1,
				channel2Name: 'device name'+id+'_2',
				channelNo3: 1,
				channel3Name: 'device name'+id+'_3',
				resolution: 1,
				longitude: 121.442869+Math.random(0,1),
				latitude: 31.032034+Math.random(0,1),
				deviceWorkBeginTime: beginTime,
				deviceWorkEndTime: endTime,
				photoInterval: 30
			}
			
			devices.push(device);
			ids.push(device.deviceID);
		}
	}
	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceModel.tableName;
			sqlstr +=' where deviceID in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			deviceModel.create(query, fn);
		},
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create user devices relation:'+msg);
			fn(err);
		}else {
			console.log('Success to create user devices relation!');
			fn(null);
		}
	});
}

function createUserDeviceR(param, fn)
{
	var devices = [];
	var ids = [];
	for (var i = 0; i < 70; i++) {
		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var id = (i < 10)? 'admin_device0' + i : 'admin_device' + i;
		var device = {
			id: id,
			deviceId: deviceId,
			ugId: 'admin',
			userType: 1,
			follow: 1,
			privilege:1,
		};
		devices.push(device);
		ids.push(device.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+userDeviceRModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			userDeviceRModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			userDeviceRModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create user devices relation:'+msg);
			fn(err);
		}else {
			console.log('Success to create user devices relation!');
			fn(null);
		}
	});
}

function createChannel(param, fn)
{
	var channels = [];
	var ids = [];

	for (var i = 0; i < 7; i++) {
		for (var j = 0; j < 10; j++) {
			var id = i*10 +j;
			
			var deviceId = (id < 10)? '06M0000180003660' + id : '06M000018000366' + id;
			
			for(var m=1;m<4;m++){
				var channel = {
					id: deviceId+'_'+m,
					name: 'device name'+id+'_'+m,
					deviceId: deviceId,
					channelNo: m,
					status: 1,
					parentId:'level2_'+i,
					lineId:'line_'+i,
					X1: Math.ceil(Math.random(0,1)*600),
					Y1: Math.ceil(Math.random(0,1)*600),
					endX1: Math.ceil(Math.random(0,1)*600),
					endY1: Math.ceil(Math.random(0,1)*600),
					X2: Math.ceil(Math.random(0,1)*600),
					Y2: Math.ceil(Math.random(0,1)*600),
					endX2: Math.ceil(Math.random(0,1)*600),
					endY2: Math.ceil(Math.random(0,1)*600),
					X3: Math.ceil(Math.random(0,1)*600),
					Y3: Math.ceil(Math.random(0,1)*600),
					endX3: Math.ceil(Math.random(0,1)*600),
					endY3: Math.ceil(Math.random(0,1)*600),
					// refPicPath: '06M00001800036603/201701/06M00001800036603_20170123144823.jpg',
					// refPicId: '04e4425e2cf19479a909',
				};
				channels.push(channel);
				ids.push(channel.id);
			}
		}
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+channelModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			channelModel.query(query, next);
		},
		function(next){
			var query = {
				values: channels,
				fields: channels[0],
			};
			channelModel.create(query, fn);
		},
	],
	function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create user devices relation:'+msg);
			fn(err);
		}else {
			console.log('Success to create user devices relation!');
			fn(null);
		}
	});
}

function createDeviceProduct(param, fn){
	var devices = [];
	var ids = [];
	for (var i = 0; i < 7; i++) {
		for (var j = 0; j < 10; j++) {
			var id = i*10 +j;
			
			var deviceID = (id < 10)? '06M0000180003660' + id : '06M000018000366' + id;
			
			var device = {
				id: deviceID,
				deviceID: deviceID,
				deviceName: 'device name'+id,
				deviceTele: (j < 10)? ('1361361360' + j) : ('136136136' + j),
				deviceMeid: deviceID,
				deviceDangerID: i+1,
				lineName: 'line name'+i,
			};
			
			devices.push(device);
			ids.push(device.deviceID);
		}
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceProductModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceProductModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			deviceProductModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create devices state:'+msg);
			fn(err);
		}else {
			console.log('Success to create devices state!');
			fn(null);
		}
	});
}


function createDeviceStatus(param, fn){
	var devices = [];
	var ids =[];
	for (var i = 0; i < 70; i++) {
		var id = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var device = {
			id: id,
			alert: i,
			temperature: i+10,
			alertId:'alert_'+i,
			heartBeat: i,
			heartBeatTime: new Date(),
			deviceMemoryState: 0,
			deviceMemoryCapacity: i,
			batterySolarVoltage: i+10,
			batteryWindVoltage:i+10,
			batteryVoltage:i+10,
			batteryCapacity:i+22,
			chargeVoltage:i+19,
			boardTemperature: 1+20,
			networkSignal: 5,
			status: 0,
		};
		devices.push(device);
		ids.push(device.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceStatusModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceStatusModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			deviceStatusModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create devices state:'+msg);
			fn(err);
		}else {
			console.log('Success to create devices state!');
			fn(null);
		}
	});
}


//cmd 
function createCmd(param, fn)
{
	var channels = [];
	var ids = [];

	for(var j = 0;j<70;j++){
		for (var i = 0; i < 5; i++) {
			var channel = {
				cmdID: 'cmd'+j+'_'+i,
				cmdName: 'cmd'+j+' name'+i,
			};
			channels.push(channel);
			ids.push(channel.cmdID);
		}
	}
	
	async.series([
		function(next){
			var sqlstr = 'delete from '+cmdModel.tableName;
			sqlstr +=' where cmdID in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			cmdModel.query(query, next);
		},
		function(next){
			var query = {
				values: channels,
				fields: channels[0],
			};
			cmdModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create user devices relation:'+msg);
			fn(err);
		}else {
			console.log('Success to create user devices relation!');
			fn(null);
		}
	});
}

function createCmdDeviceR(param, fn)
{
	var channels = [];
	var ids = [];

	for(var j = 0;j<70;j++){
		for (var i = 0; i < 5; i++) {			
			var deviceID = (j < 10)? '06M0000180003660' + j : '06M000018000366' + j;
			var channel = {
				id: 'cmd'+i+'_device'+j,
				cmdID: 'cmd'+j+'_'+i,
				deviceID: deviceID,
			};
			channels.push(channel);
			ids.push(channel.id);
		}
	}
	
	async.series([
		function(next){
			var sqlstr = 'delete from '+cmdDeviceRModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			cmdDeviceRModel.query(query, next);
		},
		function(next){
			var query = {
				values: channels,
				fields: channels[0],
			};
			cmdDeviceRModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create user devices relation:'+msg);
			fn(err);
		}else {
			console.log('Success to create user devices relation!');
			fn(null);
		}
	});
}


function createCmdTemperature(param, fn)
{
	var devices = [];
	var ids = [];
	// devices.push({id:'06M00001800036600',temperature: 2,time: new Date('2017-01-01 12:00:00')});

	for(var i=0;i<6;i++){
		for(var j=0;j<5;j++){
			var cmdID = 'cmd'+i+'_'+j;
			for(var hour=0;hour<24;hour++){
				var hourTime = (hour < 10)? ('0'+hour):(''+hour);
				for(var month=2;month<2+1;month++){
					// console.log(month);
					var monthTime = (month < 10)? ('0'+month):(''+month);
					if(month==1||month==3||month==5||month==7||month==8||month==10||month==12){
						for(var day = 1;day<31+1;day++){
							var dayTime  = (day < 10)? ('0'+day):(''+day);
							var time = new Date();
							time.setYear(2017);
							time.setMonth(month-1);
							time.setDate(day);
							time.setHours(hour);
							time.setMinutes(0);
							time.setSeconds(0);
							var channel = {
								id: 'cmd'+j+'_device'+i+'0'+month+'0'+day+'0'+hour,
								cmdID: cmdID,
								temperature: Math.ceil(Math.random(0,1)*40),
								time: time,
							};
							devices.push(channel);
							ids.push(channel.id);
						}
					}else if(month==4||month==6||month==9||month==11){
						for(var day = 1;day<30+1;day++){
							var dayTime  = (day < 10)? ('0'+day):(''+day);
							var time = new Date();
							time.setYear(2017);
							time.setMonth(month-1);
							time.setDate(day);
							time.setHours(hour);
							time.setMinutes(0);
							time.setSeconds(0);
							var channel = {
								id: 'cmd'+j+'_device'+i+'0'+month+'0'+day+'0'+hour,
								cmdID: 'cmd'+i+'_'+j,
								temperature: Math.ceil(Math.random(0,1)*40),
								time: time,
							};
							devices.push(channel);
							ids.push(channel.id);
						}
					}else{
						for(var day = 1;day<28+1;day++){
							var dayTime  = (day < 10)? ('0'+day):(''+day);
							var time = new Date();
							time.setYear(2017);
							time.setMonth(month-1);
							time.setDate(day);
							time.setHours(hour);
							time.setMinutes(0);
							time.setSeconds(0);
							var channel = {
								id: 'cmd'+j+'_device'+i+'0'+month+'0'+day+'0'+hour,
								cmdID: 'cmd'+i+'_'+j,
								temperature: Math.ceil(Math.random(0,1)*40),
								time: time,
							};
							devices.push(channel);
							ids.push(channel.id);
						}
					}
					
				}
			}
			
		}
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+cmdTempModel.tableName;
			// sqlstr +=' where id in ("';
			// sqlstr += ids.join('","');
			// sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			cmdTempModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			cmdTempModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create user devices relation:'+msg);
			fn(err);
		}else {
			console.log('Success to create user devices relation!');
			fn(null);
		}
	});
}




// function createUserDeviceR(param, fn)
// {
// 	var devices = [];
// 	var ids = [];
// 	for (var i = 0; i < 70; i++) {
// 		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
// 		var device = {
// 			id: 'admin_device'+i,
// 			deviceId: deviceId,
// 			ugId: 'admin',
// 			userType: 0,
// 			follow: 1,
// 			privilege:0,
// 		};
// 		devices.push(device);
// 		ids.push(device.id);
// 	}

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+userDeviceRModel.tableName;
// 			sqlstr +=' where id in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			userDeviceRModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: devices,
// 				fields: devices[0],
// 			};
// 			userDeviceRModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create user devices relation:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create user devices relation!');
// 			fn(null);
// 		}
// 	});
// }

// function createDeviceRoot(param, fn)
// {
// 	var devices = [];
// 	var ids = [];
// 	for (var i = 0; i < 8; i++) {
// 		var device = {
// 			id: 'root_'+i,
// 			parentId: '0',
// 			level: 0,
// 			name: 'devicelevel'+i,
// 		};
// 		devices.push(device);
// 		ids.push(device.id);
// 	}
// 	devices[0].name = '华东局';
// 	devices[1].name = '华南局';
// 	devices[2].name = '华中局';
// 	devices[3].name = '西南局';
// 	devices[4].name = '西北局';
// 	devices[5].name = '东北局';
// 	devices[6].name = '东南局';
// 	devices[7].name = '上海局';

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+deviceLevelModel.tableName;
// 			sqlstr +=' where id in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			deviceLevelModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: devices,
// 				fields: devices[0],
// 			};
// 			deviceLevelModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create devices level:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create devices level!');
// 			fn(null);
// 		}
// 	});
// }

// function createDeviceLevel(param, fn)
// {
// 	var devices = [];
// 	var ids = [];
// 	for (var i = 0; i < 7; i++) {
// 		var device = {
// 			id: 'level_'+i,
// 			parentId: param.id,
// 			level: 1,
// 			name: 'devicelevel'+i,
// 		};
// 		devices.push(device);
// 		ids.push(device.id);
// 	}
// 	devices[0].name = '闵行';
// 	devices[1].name = '浦东';
// 	devices[2].name = '长宁';
// 	devices[3].name = '徐汇';
// 	devices[4].name = '嘉定';
// 	devices[5].name = '杨浦';
// 	devices[6].name = '临港';

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+deviceLevelModel.tableName;
// 			sqlstr +=' where id in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			deviceLevelModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: devices,
// 				fields: devices[0],
// 			};
// 			deviceLevelModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create devices level:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create devices level!');
// 			fn(null);
// 		}
// 	});
// }


	
// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+deviceModel.tableName;
// 			sqlstr +=' where deviceID in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			deviceModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: devices,
// 				fields: devices[0],
// 			};
// 			deviceModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create devices:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create devices!');
// 			fn(null);
// 		}
// 	});
// }



// function createPics(param, fn) {
// 	var pics = [];
// 	var ids = [];
// 	for (var i = 0; i < 70; i++) {
// 		var deviceID = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
// 		var picName = 'pic_' + i + '.jpg';
// 		var pictureName = deviceID + '_20160202162814.jpg';
// 		var pic = {
// 			pictureID: 'pics'+i,
// 			deviceID: deviceID,
// 			type:0,
// 			path:'test/'+picName,
// 			pictureWebURL: 'test/'+picName,
// 			pictureName: pictureName,
// 			resolution: 1,
// 		};
// 		pics.push(pic);
// 		ids.push(pic.pictureID);
// 	}

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+picModel.tableName;
// 			sqlstr +=' where pictureID in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			picModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: pics,
// 				fields: pics[0],
// 			};
// 			picModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create picture:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create picture!');
// 			fn(null);
// 		}
// 	});
// }

// function createHeartbeatlogs(param, fn)
// {
// 	var logs = [];
// 	var ids = [];
// 	for (var i = 0; i < 70; i++) {
// 		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
// 		var log = {
// 			id: 'heartBeat'+i,
// 			deviceId: deviceId,
// 			deviceName: 'device name'+i,
// 			batteryVoltage: 1+i,
// 			chargeVoltage: 1+i,
// 			temperature: 23+i,
// 			alert: '',
// 		};
// 		logs.push(log);
// 		ids.push(log.id);
// 	}

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+heartBeatLogModel.tableName;
// 			sqlstr +=' where id in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			heartBeatLogModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: logs,
// 				fields: logs[0],
// 			};
// 			heartBeatLogModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create heartBeat log:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create heartBeat log!');
// 			fn(null);
// 		}
// 	});
// }

// function createHeartbeatLoselogs(param, fn)
// {
// 	var logs = [];
// 	var ids = [];
// 	for (var i = 0; i < 70; i++) {
// 		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
// 		var log = {
// 			id: 'heartBeatLose'+i,
// 			deviceId: 'device'+i,
// 			deviceName: deviceId,
// 			heartBeatLogId: 'heartBeat'+i,
// 			loseTime: new Date(),
// 		};
// 		logs.push(log);
// 		ids.push(log.id);
// 	}

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+heartBeatLoseLogModel.tableName;
// 			sqlstr +=' where id in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			heartBeatLoseLogModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: logs,
// 				fields: logs[0],
// 			};
// 			heartBeatLoseLogModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create heartBeat lose log:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create heartBeat lose log!');
// 			fn(null);
// 		}
// 	});
// }

// function createPicProcessLogs(param, fn)
// {
// 	var logs = [];
// 	var ids = [];
// 	for (var i = 0; i < 70; i++) {
// 		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
// 		var picName = 'pic_' + i + '.jpg';
// 		var log = {
// 			id: 'picProcess'+i,
// 			deviceId: deviceId,
// 			deviceName: 'device name'+i,
// 			originalPicId: 'pics'+i,
// 			originalPicPath:'test/'+picName,
// 			startTime: new Date(),
// 			status: 1,
// 		};
// 		logs.push(log);
// 		ids.push(log.id);
// 	}

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+picProcessModel.tableName;
// 			sqlstr +=' where id in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			picProcessModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: logs,
// 				fields: logs[0],
// 			};
// 			picProcessModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create pic process log:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create pic process log!');
// 			fn(null);
// 		}
// 	});
// }

// function createDeviceCharacter(param, fn)
// {
// 	var logs = [];
// 	var ids = [];
// 	for (var i = 0; i < 70; i++) {
// 		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
// 		var type = 0;
// 		var enable = 0;
// 		if(10<i<=30){
// 			type = 1; 
// 		}else if(30<i<=50){
// 			type = 2;
// 		}else if(50<i<=70){
// 			type = 3;
// 		}

// 		if(i>30){
// 			enable = 1;
// 		}

// 		var log = {
// 			id: 'character'+i,
// 			deviceId: deviceId,
// 			type: type,
// 			text: 'character'+i,
// 			x: i,
// 			y: i,
// 			enable: enable
// 		};
// 		logs.push(log);
// 		ids.push(log.id);
// 	}

// 	async.series([
// 		function(next){
// 			var sqlstr = 'delete from '+deviceCharacterModel.tableName;
// 			sqlstr +=' where id in ("';
// 			sqlstr += ids.join('","');
// 			sqlstr += '")';
// 			var query = {
// 				sqlstr: sqlstr,
// 			};
// 			deviceCharacterModel.query(query, next);
// 		},
// 		function(next){
// 			var query = {
// 				values: logs,
// 				fields: logs[0],
// 			};
// 			deviceCharacterModel.create(query, fn);
// 		}
// 	],function(err){
// 		if (err) {
// 			var msg = err.msg || err;
// 			console.error('Failed to create device character info:'+msg);
// 			fn(err);
// 		}else {
// 			console.log('Success to create device character info!');
// 			fn(null);
// 		}
// 	});
// }

function createDatas(argument) {
	async.series([
		// function(next){
		// 	createDeviceRoot({}, next);
		// },
		// function(next) {
		// 	createDeviceLevel({id: 'root_7'}, next);
		// },
		// function(next) {
		// 	createDeviceLevel2({id: 'level_0'}, next);
		// },
		// function(next){
		// 	createLine({id: 'root_7'}, next);
		// },
		// function(next) {
		// 	createDevices({}, next);
		// },
		// function(next) {
		// 	createUserDeviceR({}, next);
		// },
		// function(next){
		// 	createChannel({}, next);
		// },
		// function(next) {
		// 	createDeviceProduct({},next);
		// },
		// function(next) {
		// 	createDeviceStatus({},next);
		// },

		function(next) {
			createCmd({}, next);
		},
		function(next) {
			createCmdDeviceR({}, next);
		},
		function(next){
			createCmdTemperature({}, next);
		},



		// function(next) {
		// 	createPics({}, next);
		// },
		// function(next) {
		// 	createHeartbeatlogs({}, next);
		// },
		// function(next) {
		// 	createHeartbeatLoselogs({}, next);
		// },
		// function(next) {
		// 	createPicProcessLogs({},next);
		// },

		// function(next) {
		// 	createDeviceCharacter({}, next);
		// }
	],
	function(err){
		if (err) {
			var msg = err.msg || err;
			console.error(msg);
		}else {
			console.log('Success to create data!');
		}
	});
}

createDatas({});

// var w= images('../../../picserver/files/06M00001800036603/201701/06M00001800036603_20170105115356.jpg').height();
// console.log("w::"+w);
