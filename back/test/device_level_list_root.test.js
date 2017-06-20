// device level list root test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/level/root';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var device_1 = {
	level:1,
};

var device_2 = {
	level:1,
};

var device_3 = {
	level:1,
};
var device_4 = {
	level:1,
};

var devices =[];

describe('device.level.list.root', function () {
	beforeEach(function (done) {
		devices.push(device_1);
		devices.push(device_2);
		devices.push(device_3);
		devices.push(device_4);
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

	it('device_1  level list root', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&level='+devices[index].level;

		var path = url + comParams+params;

		http.get(path, function(res){
			var chunks = [];
			
			console.log('get res.headers:%j', res.headers);
			
			res.setEncoding('utf8');
			
			res.on('data', function(chunk){
				chunks.push(chunk);
			});

			res.on('end', function(){
				var ret = chunks.join('');
				console.log('get response.json: %j', ret);

				var json = JSON.parse(ret);
				json.should.have.property('code', 0);
				json.should.have.property('message','CCFLab@SJTUServerMessage');
				var result = json.result;
				//result.should.have.property('id', users[index].id);
				//result.should.have.property('userName', users[index].userName);
				//result.should.have.property('gender', users[index].gender);
				//result.should.have.property('mobile', users[index].mobile);
				//result.should.have.property('name', users[index].name);
				//result.should.have.property('userType', users[index].userType);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('device_2 level list root', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&level='+devices[index].level;

		var path = url + comParams+params;

		http.get(path, function(res){
			var chunks = [];
			
			console.log('get res.headers:%j', res.headers);
			
			res.setEncoding('utf8');
			
			res.on('data', function(chunk){
				chunks.push(chunk);
			});

			res.on('end', function(){
				var ret = chunks.join('');
				console.log('get response.json: %j', ret);

				var json = JSON.parse(ret);
				json.should.have.property('code', 0);
				json.should.have.property('message','CCFLab@SJTUServerMessage');
				var result = json.result;
				//result.should.have.property('id', users[index].id);
				//result.should.have.property('userName', users[index].userName);
				//result.should.have.property('gender', users[index].gender);
				//result.should.have.property('mobile', users[index].mobile);
				//result.should.have.property('name', users[index].name);
				//result.should.have.property('userType', users[index].userType);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('device_3 level list root', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&level='+devices[index].level;

		var path = url + comParams+params;

		http.get(path, function(res){
			var chunks = [];
			
			console.log('get res.headers:%j', res.headers);
			
			res.setEncoding('utf8');
			
			res.on('data', function(chunk){
				chunks.push(chunk);
			});

			res.on('end', function(){
				var ret = chunks.join('');
				console.log('get response.json: %j', ret);

				var json = JSON.parse(ret);
				json.should.have.property('code', 0);
				json.should.have.property('message','CCFLab@SJTUServerMessage');
				var result = json.result;
				//result.should.have.property('id', users[index].id);
				//result.should.have.property('userName', users[index].userName);
				//result.should.have.property('gender', users[index].gender);
				//result.should.have.property('mobile', users[index].mobile);
				//result.should.have.property('name', users[index].name);
				//result.should.have.property('userType', users[index].userType);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('device 4 level list root', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&level='+devices[index].level;

		var path = url + comParams+params;

		http.get(path, function(res){
			var chunks = [];
			
			console.log('get res.headers:%j', res.headers);
			
			res.setEncoding('utf8');
			
			res.on('data', function(chunk){
				chunks.push(chunk);
			});

			res.on('end', function(){
				var ret = chunks.join('');
				console.log('get response.json: %j', ret);

				var json = JSON.parse(ret);
				json.should.have.property('code', 0);
				json.should.have.property('message','CCFLab@SJTUServerMessage');
				var result = json.result;
				//result.should.have.property('id', groups[index].id);
				//result.should.have.property('userName', users[index].userName);
				//result.should.have.property('gender', users[index].gender);
				//result.should.have.property('mobile', users[index].mobile);
				//result.should.have.property('name', users[index].name);
				//result.should.have.property('userType', users[index].userType);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	function getExpectData(){
		var resData = {
			token:'test13671641968',
			userId:'test13671641968',
			chatTokenId:'test13671641968',
		};
		return resData;
	}
});

