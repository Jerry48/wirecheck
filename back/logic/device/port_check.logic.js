'use strict';
var moduleName = 'server_check.logic';
var URLPATH = '/v1/server/check';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var net = require('net')

var logic_helper = require('../../../common/logic_helper');

function packageResponseData(inputData) {
	if (!inputData) {
		return {};
	}

	var resData = {
		serverStatus: inputData,
	};

	return resData;
}

function processRequest(param, fn) {
	var fileserver = 9090
	var socketserver = 6189
	var wechatserver = 80

	var serverStatus = {}

	debug('Try to check the server');

	async.waterfall([
			function(next) {
				var server = net.createServer().listen(fileserver)

				server.on('listening', function() {
					server.close()
					console.log('The port ' + fileserver + ' is available.')
					serverStatus.fileserver = 0;
					next(null, serverStatus)
				})

				server.on('error', function(err) {
					if (err.code === 'EADDRINUSE') {
						console.log('The port ' + fileserver + ' is occupied, please change other port.')
						serverStatus.fileserver = 1;
						next(null, serverStatus)
					}
				})
			},
			function(serverStatus, next) {
				var server = net.createServer().listen(socketserver)

				server.on('listening', function() {
					server.close()
					console.log('The port ' + socketserver + ' is available.')
					serverStatus.socketserver = 0;
					next(null, serverStatus)
				})

				server.on('error', function(err) {
					if (err.code === 'EADDRINUSE') {
						console.log('The port ' + socketserver + ' is occupied, please change other port.')
						serverStatus.socketserver = 1;
						next(null, serverStatus)
					}
				})
			},
			function(serverStatus, next) {
				var server = net.createServer().listen(wechatserver)

				server.on('listening', function() {
					server.close()
					console.log('The port ' + wechatserver + ' is available.')
					serverStatus.wechatserver = 0;
					next(null, serverStatus)
				})

				server.on('error', function(err) {
					if (err.code === 'EADDRINUSE') {
						console.log('The port ' + wechatserver + ' is occupied, please change other port.')
						serverStatus.wechatserver = 1;
						next(null, serverStatus)
					}
				})
			},
		],
		function(err, serverStatus) {
			if (err) {
				console.error(moduleName + ', Failed to edit device ');
				fn(err);
			} else {
				debug('Success to edit the device');
				// console.log(serverStatus);
				var resData = packageResponseData(serverStatus);
				fn(null, resData);
			}
		});
}

//post interface
router.post(URLPATH, function(req, res, next) {
	var param = req.body;

	logic_helper.responseHttp({
		res: res,
		req: req,
		next: next,
		moduleName: moduleName,
		processRequest: processRequest,
		debug: debug,
		param: param,
	});
});

//get interface for mocha testing
function getCallback(req, res, next) {
	var param = req.query;

	logic_helper.responseHttp({
		res: res,
		req: req,
		next: next,
		moduleName: moduleName,
		processRequest: processRequest,
		debug: debug,
		param: param,
	});
}

router.get(URLPATH, getCallback);

module.exports.router = router;