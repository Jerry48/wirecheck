// device level create test 
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

var URLPATH = '/v1/device/level/create';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var device_1 = {
	parentId:'d547fdee1681f85bcfa1',
	parentLevel:0,
	name:'b142890d43926274685f',
	comment:'adc',
};

var device_2 = {
	parentId:'a65392757450c2431b6a',
	parentLevel:0,
	name:'device2',
	comment:'adc',
};

var device_3 = {
	parentId:'e588a5e82f44fa73326f',
	parentLevel:0,
	name:'deivce3',
	comment:'adc',
};
var device_4 = {
	parentId:'40fa2cda2111e2fd2189',
	parentLevel:0,
	name:'device4',
	comment:'adc',
};

var devices =[];

describe('device.level.create', function () {
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

	it('device 1 create level', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&parentId='+devices[index].parentId;
		 params += '&parentLevel='+devices[index].parentLevel;
		 params += '&name='+devices[index].name;
		 params += '&comment='+devices[index].comment;

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

	it('device 2 create level', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&parentId='+devices[index].parentId;
		 	params += '&parentLevel='+devices[index].parentLevel;
		 	params += '&name='+devices[index].name;
		 	params += '&comment='+devices[index].comment;

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

	it('device 3 create level', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&parentId='+devices[index].parentId;
		 	params += '&parentLevel='+devices[index].parentLevel;
			params += '&name='+devices[index].name;
			params += '&comment='+devices[index].comment;

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

	it('device 4 create level', function (done){
		this.timeout(50000);
		var index = 3;

		var params = '&parentId='+devices[index].parentId;
		 	params += '&parentLevel='+devices[index].parentLevel;
		 	params += '&name='+devices[index].name;
		 	params += '&comment='+devices[index].comment;

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

