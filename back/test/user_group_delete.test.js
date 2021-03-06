// user group delete API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.19, created by Yeyanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/user/group/delete';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var group_1 = {
	id: 'cd82406fe8c0aa069e79',
};

var group_2 = {
	id: '833e15dd72e5c958ee91',
};

var group_3 = {
	id: 'e44682aceb92ad8db175',
};
var group_4 = {
	id: 'invalid groupId4',
};

var groups =[];

describe('user.group.delete', function () {
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

	it('delete group 1', function (done){
		this.timeout(50000);
		
		var index = 0;

		var params = '&id='+groups[index].id;

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
				result.should.have.property('groupId', groups[index].id);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('delete group 2', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&id='+groups[index].id;

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
				result.should.have.property('groupId', groups[index].id);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('delete group 3', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&id='+groups[index].id;

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
				result.should.have.property('groupId', groups[index].id);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('delete group 4', function (done){
		this.timeout(50000);
		var index = 3;

		var params = '&id='+groups[index].id;

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
				result.should.have.property('groupId', groups[index].id);
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

