// device self query create api test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.08, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/query/self/create';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';

describe('query.self.create', function () {
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

	it('query1_self_create', function (done){
		this.timeout(50000);
		var postData = {
			"name":"group1",
			"comment":"this is good",
			"size":1,
			"list":[
				{"deviceId":"d2d3d9274f835579ddc5"}
					] 
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

	it('query2_self_create', function (done){
		this.timeout(50000);
		var postData = {
			"name":"invalid",
			"comment":"this is good",
			"size":1,
			"list":[
				{"deviceId":"invalid"}
					] 
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




