// device level edit test 
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

var URLPATH = '/v1/device/level/edit';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var device_1 = {
	id: '02b530136accb8bc5a81',
	level: 1,
	name: 'b142890d43926274685f',
	newName:'device1', 
};

var device_2 = {
	id:'f8949b35a5faf1419932',
	level:0,
	name:'da234242',
	newName:'adc',
};

var device_3 = {
	id:'',
	level:0,
	name:'da234242',
	newName:'adc',
};
var device_4 = {
	id:'invalid id',
	level:0,
	name:'da234242',
	newName:'adc',
};

var devices =[];

describe('device.level.edit', function () {
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

	it('device 1 edit level', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&id='+devices[index].id;
		 params += '&level='+devices[index].level;
		 params += '&name='+devices[index].name;
		 params += '&newName='+devices[index].newName;

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

	it('device 2 edit level', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&id='+devices[index].id;
		 params += '&level='+devices[index].level;
		 params += '&name='+devices[index].name;
		 params += '&newName='+devices[index].newName;

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

	it('device 3 edit level', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&id='+devices[index].id;
		 params += '&level='+devices[index].level;
		 params += '&name='+devices[index].name;
		 params += '&newName='+devices[index].newName;

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

	it('device 4 edit level', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&id='+devices[index].id;
		 params += '&level='+devices[index].level;
		 params += '&name='+devices[index].name;
		 params += '&newName='+devices[index].newName;

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

