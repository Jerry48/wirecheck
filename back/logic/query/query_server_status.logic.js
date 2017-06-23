'use strict';
var moduleName = 'query_server_status.logic';
var URLPATH = '/v1/query/server/status';
var config = require('../../../config');
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var net = require('net')
//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var deviceHelper = require('../device/device.logic');

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
    var fileserver = parseInt(config.port.picserver);
    var socketserver = parseInt(config.port.socket);
    var wechatserver = parseInt(config.port.wechat);
    var serverStatus = {};
    debug('Try to check the server');
    async.series([
        function(next) {
            var server = net.createServer().listen(fileserver)
            server.on('listening', function() {
                server.close()
                console.log('The port ' + fileserver + ' is available.')
                serverStatus.fileserver = 0;
                next(null);
            })
            server.on('error', function(err) {
                if (err.code === 'EADDRINUSE') {
                    console.log('The port ' + fileserver + ' is occupied, please change other port.')
                    serverStatus.fileserver = 1;
                }
                next(null);
            })
        },
        function(next) {
            var server = net.createServer().listen(socketserver)
            server.on('listening', function() {
                server.close()
                console.log('The port ' + socketserver + ' is available.')
                serverStatus.socketserver = 0;
                next(null);
            })
            server.on('error', function(err) {
                if (err.code === 'EADDRINUSE') {
                    console.log('The port ' + socketserver + ' is occupied, please change other port.')
                    serverStatus.socketserver = 1;
                }
                next(null);
            })
        },
        function(next) {
            var server = net.createServer().listen(wechatserver)
            server.on('listening', function() {
                server.close()
                console.log('The port ' + wechatserver + ' is available.')
                serverStatus.wechatserver = 0;
                next(null);
            })
            server.on('error', function(err) {
                if (err.code === 'EADDRINUSE') {
                    console.log('The port ' + wechatserver + ' is occupied, please change other port.')
                    serverStatus.wechatserver = 1;
                }
                next(null);
            })
        },
    ], function(err) {
        if (err) {
            console.error(moduleName + ', Failed to edit device ');
            fn(err);
        } else {
            debug('Success to edit the device');
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