// socket clients  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.22, created by Andy.zhou
 *  
 */


'use strict';  
var moduleName = 'socket_clients.logic';

//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var net = require('net');

var socketServer = null;

var socketList = {};

function find(param){
	/*
	var deviceId = param.deviceId || param;
	for (var i = 0; i < socketList.length; i++) {
		var socket = socketList[i];
		if (socket.deviceId==deviceId) {
			return socket;
		}
	}
	return null;
	*/
	var deviceId = param.deviceId || param;
	var socket = socketList[deviceId];
	if (socket){
		if (socket.destroyed){  // 判断socket是否已经无效。
			socket = null;
		}
	}
	return socket;
}

function push (param) {
	var deviceId = param.deviceId;
	var socket = param.socket;
	socketList[deviceId] = socket;
}

function remove(param){
	var deviceId = param.deviceId || param;
	socketList[deviceId] = null;
}

module.exports.socketServer = socketServer;
module.exports.find = find;
module.exports.push = push;
module.exports.remove = remove;