// device defend set api test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.09, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/defend/set';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';

describe('device.defend.set', function () {
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

	it('device1_defend_set', function (done){
		this.timeout(50000);
		var postData = {
			"id": "4497263d9806cbb6d2ae",//device id or level id
			"level":0,//device level id,start from 0
			"fullDisable":0,
			"list":[{
				"dayOfWeek":0,//0-sun,1-mon,
					"startHour":13,
					"startMinute":00,
					"endHour":23,
					"endMinute":59
			}]	

        };
        

		console.log('postData:%j',postData); 

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
        req.write(content + "\n");
        req.end();

	});
	
	});

	it('device2_defend_set', function (done){
		this.timeout(50000);
		var postData = {
			"id": "50c1c3b2db44126e7207",//device id or level id
			"level":0,//device level id,start from 0
			"fullDisable":0,
			"list":[{
				"dayOfWeek":0,//0-sun,1-mon,
					"startHour":13,
					"startMinute":00,
					"endHour":23,
					"endMinute":59
			}]	

        };
        

		console.log('postData:%j',postData); 

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
        req.write(content + "\n");
        req.end();

	});


	
