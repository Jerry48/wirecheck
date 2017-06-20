// device disalert clear api test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.18, created by yanyan
 *  
 */
 
require('should');

var async = require('async');
var db = require('../../common/db');
var http = require('http');
var querystring = require('querystring');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/disalert/clear';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';

describe('disalert.clear', function () {
	beforeEach(function (done) {
		done();
	});

	afterEach(function (done){
		done();
	});

	before(function (done) {
		done();
	});

	after(function (done){
		done();
	});
	
	it('device1_disalert_clear', function (done){
		this.timeout(50000);

		var postData = {
   			"id":"4497263d9806cbb6d2ae",
			"type":1
        };

		var content = JSON.stringify(postData);
        console.log('content:' + content); 
		var options = {
			host : 'localhost',
			port : port,
			path : URLPATH,
			method:'POST',
            agent:false,
            rejectUnauthorized : false,
            headers:{
                'Content-Type' : 'application/json', 
                'Content-Length' :content.length
                }			
		}
		
		var req = http.request(options,function(res){
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY'+ chunk);

            });
            res.on('end',function(){

                console.log('over');
                 done();
            });
        });

        req.on('error',function(e){
        	console.log('problem with request:' + e.message);
        })
        req.write(content);
        req.end();

	});

	it('device2_disalert_clear', function (done){
		this.timeout(50000);

		var postData = {
   			"id":"invalid id",
 			"type":1 
        };

		var content = JSON.stringify(postData);
        console.log('content:' + content); 
		var options = {
			host : 'localhost',
			port : port,
			path : URLPATH,
			method:'POST',
            agent:false,
            rejectUnauthorized : false,
            headers:{
                'Content-Type' : 'application/json', 
                'Content-Length' :content.length
                }			
		}
		
		var req = http.request(options,function(res){
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY'+ chunk);

            });
            res.on('end',function(){

                console.log('over');
                 done();
            });
        });

        req.on('error',function(e){
        	console.log('problem with request:' + e.message);
        })
        req.write(content);
        req.end();

	});
	
	});
	