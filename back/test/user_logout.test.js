// user logout API test
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.12, created by Andy.zhou
 *  
 */

require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/user/logout';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';

var user_1 = {
	userId: 'userIddd1',
};
var user_2 = {
	userId: 'f469540d34f3631864e5',
};

var user_3 = {
	userId: 'userIdddd3',
};
var user_4 = {
	userId: 'userId4',
};

var users = [];

describe('user.logout', function () {
	beforeEach(function (done) {
		users.push(user_1);
		users.push(user_2);
		users.push(user_3);
		users.push(user_4);
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

	it('user1 logout failed', function (done){
		this.timeout(50000);

		var index = 0;

		var params = '&userId=' + users[index].userId;
		
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

				//result.should.have.property('userId', );
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});

	it('user2 logout failed', function (done){
		this.timeout(50000);

		var index = 1;

		var params = '&userId=' + users[index].userId;
		
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
				//result.should.have.property('userId', '15087654321');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});

	it('user3 logout failed', function (done){
		this.timeout(50000);

		var index = 2;

		var params = '&userId=' + users[index].userId;
		
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
				//result.should.have.property('userId', '15087654321');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});

	it('user4 logout failed', function (done){
		this.timeout(50000);

		var index = 3;

		var params = '&userId=' + users[index].userId;
		
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
				//result.should.have.property('userId', 'aa4eb35461751b00fa23');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});

});
