// insert data into data base 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by yanyan
 *  
 */
 'use strict';  
var moduleName = 'insert_data.logic';

var debug = require('debug')(moduleName);

var async = require('async');

var deviceLevelModel = require('../../model/device_level_info');
var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');
var commandModel = require('../../model/command_info');
var deviceStateModel = require('../../model/device_status_info');
var heartBeatLogModel = require('../../model/heart_beat_log');
var heartBeatLoseLogModel = require('../../model/heart_beat_lose_log');
var userDeviceRModel = require('../../model/user_device_r_info');
var deviceCharacterModel = require('../../model/device_character_info');

function createUserDeviceR(param, fn)
{
	var devices = [];
	var ids = [];
	for (var i = 0; i < 70; i++) {
		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var device = {
			id: 'admin_device'+i,
			deviceId: deviceId,
			ugId: 'admin',
			userType: 0,
			follow: 1,
			privilege:0,
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

function createDeviceRoot(param, fn)
{
	var devices = [];
	var ids = [];
	for (var i = 0; i < 8; i++) {
		var device = {
			id: 'root_'+i,
			parentId: '0',
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
			
			var device = {
				deviceID: deviceID,
				parentId: 'level_'+i,
				name: 'device name'+id,
				nickName: 'nickName'+id,
				resolution: 1,
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
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create devices:'+msg);
			fn(err);
		}else {
			console.log('Success to create devices!');
			fn(null);
		}
	});
}

function createDeviceStates(param, fn){
	var devices = [];
	var ids =[];
	for (var i = 0; i < 70; i++) {
		var id = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var device = {
			id: id,
			alert: i,
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
		};
		devices.push(device);
		ids.push(device.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceStateModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceStateModel.query(query, next);
		},
		function(next){
			var query = {
				values: devices,
				fields: devices[0],
			};
			deviceStateModel.create(query, fn);
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

function createPics(param, fn) {
	var pics = [];
	var ids = [];
	for (var i = 0; i < 70; i++) {
		var deviceID = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var picName = 'pic_' + i + '.jpg';
		var pictureName = deviceID + '_20160202162814.jpg';
		var pic = {
			pictureID: 'pics'+i,
			deviceID: deviceID,
			type:0,
			path:'test/'+picName,
			pictureWebURL: 'test/'+picName,
			pictureName: pictureName,
			resolution: 1,
		};
		pics.push(pic);
		ids.push(pic.pictureID);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+picModel.tableName;
			sqlstr +=' where pictureID in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			picModel.query(query, next);
		},
		function(next){
			var query = {
				values: pics,
				fields: pics[0],
			};
			picModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create picture:'+msg);
			fn(err);
		}else {
			console.log('Success to create picture!');
			fn(null);
		}
	});
}

function createHeartbeatlogs(param, fn)
{
	var logs = [];
	var ids = [];
	for (var i = 0; i < 70; i++) {
		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var log = {
			id: 'heartBeat'+i,
			deviceId: deviceId,
			deviceName: 'device name'+i,
			batteryVoltage: 1+i,
			chargeVoltage: 1+i,
			temperature: 23+i,
			alert: '',
		};
		logs.push(log);
		ids.push(log.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+heartBeatLogModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			heartBeatLogModel.query(query, next);
		},
		function(next){
			var query = {
				values: logs,
				fields: logs[0],
			};
			heartBeatLogModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create heartBeat log:'+msg);
			fn(err);
		}else {
			console.log('Success to create heartBeat log!');
			fn(null);
		}
	});
}

function createHeartbeatLoselogs(param, fn)
{
	var logs = [];
	var ids = [];
	for (var i = 0; i < 70; i++) {
		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var log = {
			id: 'heartBeatLose'+i,
			deviceId: 'device'+i,
			deviceName: deviceId,
			heartBeatLogId: 'heartBeat'+i,
			loseTime: new Date(),
		};
		logs.push(log);
		ids.push(log.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+heartBeatLoseLogModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			heartBeatLoseLogModel.query(query, next);
		},
		function(next){
			var query = {
				values: logs,
				fields: logs[0],
			};
			heartBeatLoseLogModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create heartBeat lose log:'+msg);
			fn(err);
		}else {
			console.log('Success to create heartBeat lose log!');
			fn(null);
		}
	});
}

function createPicProcessLogs(param, fn)
{
	var logs = [];
	var ids = [];
	for (var i = 0; i < 70; i++) {
		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var picName = 'pic_' + i + '.jpg';
		var log = {
			id: 'picProcess'+i,
			deviceId: deviceId,
			deviceName: 'device name'+i,
			originalPicId: 'pics'+i,
			originalPicPath:'test/'+picName,
			startTime: new Date(),
			status: 1,
		};
		logs.push(log);
		ids.push(log.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+picProcessModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			picProcessModel.query(query, next);
		},
		function(next){
			var query = {
				values: logs,
				fields: logs[0],
			};
			picProcessModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create pic process log:'+msg);
			fn(err);
		}else {
			console.log('Success to create pic process log!');
			fn(null);
		}
	});
}

function createDeviceCharacter(param, fn)
{
	var logs = [];
	var ids = [];
	for (var i = 0; i < 70; i++) {
		var deviceId = (i < 10)? '06M0000180003660' + i : '06M000018000366' + i;
		var type = 0;
		var enable = 0;
		if(10<i<=30){
			type = 1; 
		}else if(30<i<=50){
			type = 2;
		}else if(50<i<=70){
			type = 3;
		}

		if(i>30){
			enable = 1;
		}

		var log = {
			id: 'character'+i,
			deviceId: deviceId,
			type: type,
			text: 'character'+i,
			x: i,
			y: i,
			enable: enable
		};
		logs.push(log);
		ids.push(log.id);
	}

	async.series([
		function(next){
			var sqlstr = 'delete from '+deviceCharacterModel.tableName;
			sqlstr +=' where id in ("';
			sqlstr += ids.join('","');
			sqlstr += '")';
			var query = {
				sqlstr: sqlstr,
			};
			deviceCharacterModel.query(query, next);
		},
		function(next){
			var query = {
				values: logs,
				fields: logs[0],
			};
			deviceCharacterModel.create(query, fn);
		}
	],function(err){
		if (err) {
			var msg = err.msg || err;
			console.error('Failed to create device character info:'+msg);
			fn(err);
		}else {
			console.log('Success to create device character info!');
			fn(null);
		}
	});
}

function createDatas(argument) {
	async.series([
		function(next){
			createDeviceRoot({}, next);
		},
		function(next) {
			createDeviceLevel({id: 'root_7'}, next);
		},
		function(next) {
			createDevices({id: 'level3'}, next);
		},
		function(next) {
			createDeviceStates({},next);
		},
		function(next) {
			createPics({}, next);
		},
		function(next) {
			createHeartbeatlogs({}, next);
		},
		function(next) {
			createHeartbeatLoselogs({}, next);
		},
		function(next) {
			createPicProcessLogs({},next);
		},
		function(next) {
			createUserDeviceR({}, next);
		},
		function(next) {
			createDeviceCharacter({}, next);
		}
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