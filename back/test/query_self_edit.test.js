// device self query edit api test 
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

var URLPATH = '/v1/query/self/edit';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var group_1 = {
	id: '512acc9b7fff21ed3183',
	name:'group1',
	comment:'this is goodup',

};

var group_2 = {
	id: '',
	name:'invalid name',
	comment:'this is second good',	
};

var group_3 = {
	id: 'b5558ef20cb5e3e9fd4e',
	name:'invalid id',
	comment:'this is good',		
};

var group_4 = {
	id: '',
	name:'group1',
	comment:'this is good',		
};

var groups =[];

describe('query.device.group.edit', function () {
	beforeEach(function (done) {
		groups.push(group_1);
		groups.push(group_2);
		groups.push(group_3);
		groups.push(group_4);
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

	it('query device_group_1_edit', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&comment='+groups[index].comment;

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
				//result.should.have.property('id', '9579e589a3d1d2d8ee50');
				
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('query device_group_2_edit', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&comment='+groups[index].comment;

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

	it('query device_group_3_edit', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&comment='+groups[index].comment;

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

	it('query device_group_4_edit', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&comment='+groups[index].comment;
			
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

