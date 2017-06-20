// device group delete API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/group/delete';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var group_1 = {
	id:'d29743484c514af9e0fe',
	name:'null',
} ;

var group_2 = {
	id:'invalid data',
	name:'group2',	
};

var group_3 = {
	id:'62d669ea65896cd2b231',
	name:'group3',		
};

var group_4 = {
	id:'9c60383f0b92fcc7ee85',
	name:'group4',		
};

var groups =[];

describe('device.group.delete', function () {
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

	it('device_group_1  delete', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&id='+groups[index].id;
		 params += '&name='+groups[index].name;

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
				
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	

	it('device_group_2 delete', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&id='+groups[index].id;
		 params += '&name='+groups[index].name;

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

	it('device_group_3 delete', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&id='+groups[index].id;
		 params += '&name='+groups[index].name;

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
				//result.should.have.property('id', '62d669ea65896cd2b231');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('device_group_4 delete', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&id='+groups[index].id;
		 params += '&name='+groups[index].name;
			
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

