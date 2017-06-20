// upload picture analysis api test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.17, created by yanyan
 *  
 */
 
require('should');

var async = require('async');
var db = require('../../common/db');
var http = require('http');
var querystring = require('querystring');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/klUploadResult';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';

describe('picture.upload.analysis', function () {
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
	
	it('picture1_upload_analysis', function (done){
		this.timeout(50000);

		var postData = {
  					"id":"dfg",
  					"deviceId":"4497263d9806cbb6d2ae",
  					"originalPicId":"/home/yanyan0/workspace",
  					"name":"no.jpg",
  					"path":"32",
  					"resolution":32,
  					"result":1,
  					"comment":0,
  					"hostname":"localhost" 
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
	
	it('picture2_upload_analysis', function (done){
		this.timeout(50000);

		var postData = {
  					"id":"dfg",
  					"deviceId":"invalid id",
  					"originalPicId":"/home/yanyan0/workspace",
  					"name":"no.jpg",
  					"path":"32",
  					"resolution":32,
  					"result":1,
  					"comment":0,
  					"hostname":"localhost" 
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

    it('picture3_upload_analysis', function (done){
    this.timeout(50000);

    var postData = {
            "id":"invalid",
            "deviceId":"50c1c3b2db44126e7207",
            "originalPicId":"invalid",
            "name":"no.jpg",
            "path":"32",
            "resolution":32,
            "result":1,
            "comment":0,
            "hostname":"localhost" 
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
	