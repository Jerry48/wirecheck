//  Logic helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */

'use strict';

var moduleName = 'wechat.utils';
var debug = require('debug')(moduleName);

var moment = require('moment');

//helpers
var wxConstants = require('./constants');
var errorCode = require('./errorCode');
var httpClient = require('./httpClient');
var cryptoHelper = require('./cryptoHelper');

var appkey = 'wechatappkey';
var appId = 'wechatappid';

var host = 'localhost';
var port = 80;

var keys = ['appId', 'date', 'deviceId'];

function notifyAlert(param, fn) {
	debug('Try to notify wechat alert!');

	var data = {
		deviceId: param.deviceId,
		alertId: param.alertId,
		appId: appId,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
	};
	var keys = ['appId', 'date', 'deviceId', 'alertId'];

	var digest = cryptoHelper.createHashMacDigest(appkey,
		 {keys: keys, data:data});
	data.digest = digest;

	var requestData = {
		host: host,
		port: port,
		path: '/v1/notify/alert',
		data: data,
	};

	httpClient.postHttpData(requestData, function(err, resData){
		if (err) {
			fn(err);
		}else{
			debug('Sucess to send alert notify!');
			fn(null, resData);
		}
	});
}

function notifyPush(param, fn){
	debug('Try to notify wechat Push!');

	var data = {
		pushId: param.pushId,
		appId: appId,
		date: moment().format('YYYY-MM-DD HH:mm:ss'),
	};
	var keys = ['appId', 'date', 'pushId'];

	var digest = cryptoHelper.createHashMacDigest(
		 appkey,
		 {keys: keys, data:data});
	data.digest = digest;

	var requestData = {
		host: host,
		port: port,
		path: '/v1/notify/push',
		data: data,
	};

	httpClient.postHttpData(requestData, function(err, resData){
		if (err) {
			fn(err);
		}else{
			debug('Sucess to send push notify!');
			fn(null, resData);
		}
	});
}

 module.exports.notifyAlert = notifyAlert;
 module.exports.notifyPush = notifyPush;
