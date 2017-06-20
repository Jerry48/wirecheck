//  Logic helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */

'use strict';

var moduleName = 'httpclient.utils';

var debug = require('debug')(moduleName);

var http = require('http');
var querystring =  require('querystring');

var wxConstants = require('./constants');
var errorCode = require('./errorCode');


function postHttpData(param, fn) {
	debug('Try to post data to http server!');

	var jsonData = JSON.stringify(param.data || {});
	var headers = {
    	'Content-Type': 'application/json',
    	'Content-Length': jsonData.length
	};
	var options = {
		hostname: param.host || 'localhost',
		path: param.path || '/',
		port: param.port,
		method: 'POST',
		headers: headers,
	};
	var req = http.request(options, function(res) {
		var chunks = [];
	    res.setEncoding('utf8');
        res.on('data', function (chunk) {
            debug('on data:'+ chunk);
            chunks.push(chunk);
        });
        res.on('end',function(){
 			var ret = chunks.join('');
            debug('get response.json: %j', ret);

            var json = JSON.parse(ret);
            fn(null, json);
        });
	});

    req.on('error',function(e){
       console.error('problem with request:' + e.message);
       fn({
       	code: errorCode.SERVER_ERROR,
       	msg: e.message
       });
    })

    req.write(jsonData);
    req.end();
}

function getHttpData(param, fn){
	var jsonData = querystring.stringify(param.data);
	var path = param.path +'?'+jsonData;

	debug('try to get data from http server!');
	var options = {
		hostname: param.host || 'localhost',
		path: path,
		port: param.port,
		method: 'GET'
	};
	http.request(options, function(res){
		var chunks = [];			
		res.setEncoding('utf8');
			
		res.on('data', function(chunk){
			chunks.push(chunk);
		});

		res.on('end', function(){
			var ret = chunks.join('');

			debug('Get response.json: %j', ret);
			var json = JSON.parse(ret);
			fn(null, json);
		});
	}).on('err', function(err){
	   console.error('problem with request:' + err);
       fn({	code: errorCode.SERVER_ERROR, msg: err});
	});
}

module.exports.postHttpData = postHttpData;
module.exports.getHttpData = getHttpData;