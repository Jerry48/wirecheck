'use strict';  
var moduleName = 'check_server.logic';
var URLPATH = '/v1/server/check';
var config = '../config'

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var net = require('net')

function packageResponseData(inputData){
  if(!inputData){
    return {};
  } 
  
  var resData = {
    serverStatus: inputData,
  };

  return resData;
}

function processRequest(fn){
  var fileserver = parseInt(config.port.picserver);
  var socketserver = parseInt(config.port.socket);
  var wechatserver = parseInt(config.port.wechat);

  var serverStatus = []

  debug('Try to check the server');

  async.series([
    function(next){
      var server = net.createServer().listen(fileserver)

      server.on('listening', function () { 
        server.close() 
        console.log('The port ' + fileserver + ' is available.') 
        serverStatus.append({fileserver: 0;})
        next(null,)
      })

      server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') { 
          console.log('The port ' + fileserver + ' is occupied, please change other port.')
          serverStatus.append({fileserver: 1;})
        }
      })
    },
    function(next){
      var server = net.createServer().listen(socketserver)

      server.on('listening', function () { 
        server.close() 
        console.log('The port ' + socketserver + ' is available.') 
        serverStatus.append({socketserver: 0;})
        next(null,)
      })

      server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') { 
          console.log('The port ' + socketserver + ' is occupied, please change other port.')
          serverStatus.append({socketserver: 1;})
        }
      })
    },
    function(next){
      var server = net.createServer().listen(wechatserver)

      server.on('listening', function () { 
        server.close() 
        console.log('The port ' + wechatserver + ' is available.') 
        serverStatus.append({wechatserver: 0;})
        next(null,)
      })

      server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') { 
          console.log('The port ' + wechatserver + ' is occupied, please change other port.')
          serverStatus.append({wechatserver: 1;})
        }
      })
    },
    ], 
    function(err, status){
      if (err) {
        console.error(moduleName+', Failed to edit device ');
        fn(err);
      }else{
        debug('Success to edit the device');
        var resData = packageResponseData(status);
        fn(null, resData);
      }
    }); 
}

//post interface
router.post(URLPATH, function (req, res, next){
  var param = req.body;

  logic_helper.responseHttp({
    res: res,
    req: req,
    next: next,
    moduleName: moduleName,
    processRequest: processRequest,
    debug : debug,
    param: param,     
  });
});

//get interface for mocha testing
function getCallback(req, res, next){
  var param = req.query;

  logic_helper.responseHttp({
    res: res,
    req: req,
    next: next,
    moduleName: moduleName,
    processRequest: processRequest,
    debug : debug,
    param: param,     
  });
}

router.get(URLPATH, getCallback);

module.exports.router = router;