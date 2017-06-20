// device tag create API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.02, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/tag/add';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var device_1 = {
	id:'6d118ec3c97eb5f43ac8',
	tag:'device1',
	comment:'this is a common device',
	type:0,

};

var device_2 = {
	id:'invalid data',
	tag:'device 4bba1e91c2090ca321ff',
	comment:'this is a invalid device',
	type:0,	
};

var device_3 = {
	id:'4bba1e91c2090ca321ff',
	tag:'device 4bba1e91c2090ca321ff',
	comment:'this is a group',
	type:1,		
};

var device_4 = {
	id:null,
	tag:'device 4bba1e91c2090ca321ff',
	comment:'null group',
	type:1,		
};

var devices =[];

describe('device.tag.create', function () {
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

	it('device_1 tag create', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&id='+devices[index].id;
		 	params += '&tag='+devices[index].tag;
		 	params += '&comment='+devices[index].comment;
		 	params += '&type='+devices[index].type;

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
				//result.should.have.property('id', '4bba1e91c2090ca321ff');
				
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('device_2 tag create', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&id='+devices[index].id;
		 	params += '&tag='+devices[index].tag;
		 	params += '&comment='+devices[index].comment;
		 	params += '&type='+devices[index].type;

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
			
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('device_3 tag create', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&id='+devices[index].id;
		 	params += '&tag='+devices[index].tag;
		 	params += '&comment='+devices[index].comment;
		 	params += '&type='+devices[index].type;

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
				
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('device_4 tag create', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&id='+devices[index].id;
		 	params += '&tag='+devices[index].tag;
		 	params += '&comment='+devices[index].comment;
		 	params += '&type='+devices[index].type;
			
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

