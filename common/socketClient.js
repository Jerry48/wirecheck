//  socket client Logic helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.18, created by Andy.zhou
 *  
 */

'use strict';
var moduleName = 'socketClient.utils';
var debug = require('debug')(moduleName);

var moment = require('moment');

//helpers
var wxConstants = require('./constants');
var errorCode = require('./errorCode');
var httpClient = require('./httpClient');
var cryptoHelper = require('./cryptoHelper');

var appkey = 'socketclientappkey';
var appId = 'socketclientappid';

var host = 'localhost';
var port = 6189;



var initDeviceData = {
	host: host,
	port: port,
	path: '/v1/device/setdevice',
};

var takePhotoData = {
	host: host,
	port: port,
	path: '/v1/device/setphoto',
};

var updateDeviceData = {
	host: host,
	port: port,
	path: '/v1/device/updatedevice',
};

var resetDeviceData = {
	host: host,
	port: port,
	path: '/v1/device/resetdevice',
};

function initDevice(param, fn) {
	debug('Try to initDevice!');

	var data = {
		deviceId: param.deviceId,
		appId: appId,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
	};
	var keys = ['appId', 'date', 'deviceId'];

	var digest = cryptoHelper.createHashMacDigest(appkey,
		 {keys: keys, data:data});
	data.digest = digest;

	initDeviceData.data = data;

	httpClient.postHttpData(initDeviceData, function(err, resData){
		if (err) {
			fn(err);
		}else{
			debug('Sucess to send initi device command!');
			fn(null, resData);
		}
	});
}

function takePhoto(param, fn){
	debug('Try to takePhoto!');

	var data = {
		deviceId: param.deviceId,
		channelNo: param.channelNo,
		action: param.action,
		appId: appId,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
	};
	var keys = ['appId', 'date', 'deviceId', 'action'];
	var digest = cryptoHelper.createHashMacDigest(appkey, 
		{keys: keys, data: data});
	
	data.digest = digest;

	takePhotoData.data = data;

	httpClient.postHttpData(takePhotoData, function(err, resData){
		if (err) {
			fn(err);
		}else{
			debug('Sucess to send take photo command!');
			fn(null, resData);
		}
	});
}

function updateDevice(param, fn){
	debug('Try to updateDevice!');

	var data = {
		deviceId: param.deviceId,
		filename: param.filename,
		appId: appId,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
	};
	var keys = ['appId', 'date', 'deviceId', 'filename'];
	var digest = cryptoHelper.createHashMacDigest(appkey, 
		{keys: keys, data: data});
	
	data.digest = digest;

	updateDeviceData.data = data;

	// console.log(param.content);

	httpClient.postHttpData(updateDeviceData, function(err, resData){
		if (err) {
			fn(err);
		}else{
			debug('Sucess to send take photo command!');
			fn(null, resData);
		}
	});
}

function resetDevice(param, fn){
	debug('Try to updateDevice!');

	var data = {
		deviceId: param.deviceId,
		mode: param.mode,
		appId: appId,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
	};
	var keys = ['appId', 'date', 'deviceId', 'action'];
	var digest = cryptoHelper.createHashMacDigest(appkey, 
		{keys: keys, data: data});
	
	data.digest = digest;

	resetDeviceData.data = data;

	httpClient.postHttpData(resetDeviceData, function(err, resData){
		if (err) {
			fn(err);
		}else{
			debug('Sucess to send take photo command!');
			fn(null, resData);
		}
	});
}


module.exports.initDevice = initDevice;
module.exports.takePhoto = takePhoto;
module.exports.updateDevice = updateDevice;
module.exports.resetDevice = resetDevice;