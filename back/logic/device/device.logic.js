//  device Logic helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */

 'use strict';
var moduleName = 'device.logic';
var debug = require('debug')(moduleName);

var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceModel = require('../../model/device_info');
var deviceTagModel = require('../../model/device_tag_info');
var deviceGroupModel = require('../../model/device_group_info');
var deviceGroupMemModel = require('../../model/device_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

function checkParentExist(params, fn) {
	var id = params.id || params.parentId;

	var match = {
		id: id
	};

	var select = deviceLevelModel.dataModel;	
	var query = {
		select: select,
		match: match,
	};

	deviceLevelModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to check the parent!');
			fn(err);
		}else {
			var data = {};

			if (rows.length==0) {
				debug('Cannot find the device, %j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.deviceLevel = rows[0];
				fn(null, data);
			}
		}
	});
}

function checkDeviceLevel(params, fn){
	var match = {};
	if (params.id) {
		match.id = params.id;
	}else {
		match.level = params.level;
		match.name = params.name;
	}
	
	var select = deviceLevelModel.dataModel;
	var query = {
		select: select,
		match: match,
	};
	deviceLevelModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to check the deviceLevel!');
			fn(err);
		}else {
			var data = {};

			if (rows.length==0) {
				debug('Cannot find the device, %j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.deviceLevel = rows[0];
				fn(null, data);
			}
		}
	});
}

function checkDeviceExist(params, fn){
	var match = {};
	var deviceId = params.id || params.deviceId;
	if (deviceId) {
		match.deviceID =  deviceId;
	}else {
		match.name = params.name || '';
		match.parentId = params.parentId || '';
	}
	var select = deviceModel.dataModel;
	var query = {
		select: select,
		match: match,
	};

	deviceModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to look the device!');
			fn(err);
		}else {
			var data = {};

			if (rows.length==0)
			{
				debug('Cannot find the device:%j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.device = rows[0];
				fn(null, data);
			}
		}
	});
}

function checkDeviceTagExist(params, fn){
	var match = {};
	
	if (params.tag) {
		match.targetId =  params.targetId,
		match.tag =  params.tag;
	}else {
		match.id = params.id;
	}
	if (params.type) {
		match.type = params.type;
	}

	var select = deviceTagModel.dataModel;
	var query = {
		match: match,
		select: select,
	};
	deviceTagModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to look the device tag!');
			fn(err);
		}else {
			var data = {};

			if (rows.length==0) {
				debug('Cannot find the device tag:%j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.deviceTag = rows[0];
				fn(null, data);
			}
		}
	});
}

function checkDeviceGroupExist(params, fn){
	var match = {};
	if (params.id || params.groupId) {
		match.id = params.id || params.groupId;
	}else{
		match.name = params.name ;
	}

	if (params.type) {
		match.type = params.type;
	}
	
	var select = deviceGroupModel.dataModel;
	var query = {
		select: select,
		match: match,
	};

	deviceGroupModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to look the device group!');
			fn(err);
		}else {
			var data = {};

			if (rows.length==0) {
				debug('Cannot find the device group:%j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.deviceGroup = rows[0];
				fn(null, data);
			}
		}
	});
}

function findAllDeviceLevelIds(params, fn){
	var parentId = params.id || params.deviceId || params.levelId;
	var level = params.level || wxConstants.DEVICELEVEL;
	var parentIds = [];
	//move to child level
	level+=1;
	
	debug('findAllDeviceLevelIds');

	parentIds.push(parentId);
	if (level>=wxConstants.DEVICELEVEL) {	
		return fn(null, [parentIds]);
	}else{
		var param = {
			parentIds: parentIds,
		};
		var findLevelChilds = function (param){
			var sqlstr = 'select id from ' + deviceLevelModel.tableName;
			sqlstr += ' where level = '+level;
			sqlstr += ' and parentId in ("';
			sqlstr += param.parentIds.join('","');
			sqlstr += '");';

			var query = {
				sqlstr: sqlstr,
			};
			deviceLevelModel.query(query, function(err, rows){
				if (err) {
					console.error(moduleName+' failed to query all levels');
					fn(err);
				}else{
					var parentIds = [];//clear the parent ids
					for (var i = 0; i < rows.length; i++) {
						parentIds.push(rows[i].id);
					}

					//move to child level
					level +=1;
					if (level>=wxConstants.DEVICELEVEL) {
						return fn(null, parentIds);
					}else {
						var param = {
							parentIds: parentIds,
						};
						findLevelChilds(param);
					}
				}
			});
		}
		
		findLevelChilds(param);
	}
}

function findAllDevicesByLevel(param, fn)
{
	if (!Array.isArray(param.ids)) {
		param.ids = [param.ids];
	}
	
	debug('findAllDevicesByLevel');

	var sqlstr = 'select id from ' +deviceLevelModel.tableName;
	sqlstr += ' where parentId in ("';
	sqlstr += param.ids.join('","');
	sqlstr += '");';
	var query = {
		sqlstr: sqlstr,
	};
	deviceLevelModel.query(query, function(err, rows){
		if (err) {
			console.error(moduleName + ' Failed to find all levels');
			fn(err);
		}else {
			if (rows.length) {
				param.ids = [];
				for (var i = 0; i < rows.length; i++) {
					param.ids.push(rows[i].id);
				}
				console.log(param.ids);
				return findAllDevicesByLevel(param, fn);
			}else{
				//no childs, 
				var select = param.select || deviceModel.dataModel;
				var sqlstr = 'select ' +Object.keys(select).join(',');
				sqlstr += ' from '+deviceModel.tableName;
				sqlstr += ' where parentId in ("';
	 			sqlstr += param.ids.join('","');
				sqlstr +='");';
				var query = {
					sqlstr: sqlstr
				};
				deviceModel.query(query, function(err, devices){
					if (err) {
						console.error(moduleName + 'Failed to find all devics!');
						fn(err);
					}else{
						debug('Find all devices! size='+devices.length);
						fn(null, devices);
					}
				})
			}
		}
	});
}

function findDeviceIdsByLevel(param, fn){
    var query = {
        ids: param.id || '',
        select : {deviceID:'deviceId'},
    };
    findAllDevicesByLevel(query, function(err, rows){
        if (err) {
            fn(err);
        }else{
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
            	var tmp = JSON.parse(JSON.stringify(rows[i]));
                ids.push(tmp.deviceID);
            }
            console.log('selected ids:' + ids);
            fn(null, ids);
        }
    });
}

function findDeviceIdsByGroup(param, fn){
    var select = {
       deviceId: '',
    };
    var match = {
        groupId: param.id,
    };
    var query = {
        select: select,
        match: match,
    };
    deviceGroupMemModel.lookup(query, function(err, rows){
        if (err) {
            var msg = err.msg||err;
            console.error(moduleName+ msg);
            fn(err);
        }else {
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                 ids.push(rows[i].deviceId);
            }
            fn(null, ids);
        }
    });
}


module.exports.checkParentExist = checkParentExist;
module.exports.checkDeviceLevel = checkDeviceLevel;
module.exports.checkDeviceExist = checkDeviceExist;
module.exports.checkDeviceTagExist = checkDeviceTagExist;
module.exports.checkDeviceGroupExist = checkDeviceGroupExist;
module.exports.findAllDeviceLevelIds = findAllDeviceLevelIds;
module.exports.findAllDevicesByLevel = findAllDevicesByLevel;
module.exports.findDeviceIdsByLevel = findDeviceIdsByLevel;
module.exports.findDeviceIdsByGroup = findDeviceIdsByGroup;