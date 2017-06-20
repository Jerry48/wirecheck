// user group list members API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var querystring = require('querystring');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/user/group/manage';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';

describe('user.group.manage', function () {
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

	it('manage group 1', function (done){
		this.timeout(50000);
		var postData = {
			"id" : "1b4504e97add56d64749",
            "list":[  {"userId":"ff54286ecb1427e1cd21"},
                    {"userId":"9062a81dd6e5337992e2"},
                    {"userId":"f321efe86e44e9740543"}] 
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