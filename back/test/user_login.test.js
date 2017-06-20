// user login API test
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

var URLPATH = '/v1/user/login';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';

var user_1 = {
	userName: 'userIddd1',
	password: '123456',
};
var user_2 = {
	userName: 'f469540d34f3631864e5',
	password: 'invalid password',
};

var user_3 = {
	userName: 'userIdddd3',
	password: '123456',
};
var user_4 = {
	userName: 'userId4',
	password: '123456',
};

describe('user.login', function () {
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

	it('login user1 failed', function (done){
		this.timeout(50000);

		var params = '&userName=' + user_1.userName;
		params += '&password=' + user_1.password;
		
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
				json.should.have.property('code', 2001);
				json.should.have.property('message','Invalid user name or password');
				var result = json.result;
				//result.should.have.property('userId', );
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});

	it('login user2 failed', function (done){
		this.timeout(50000);

		var params = '&userName=' + user_2.userName;
		params += '&password=' + user_2.password;
		
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
				json.should.have.property('code', 2001);
				json.should.have.property('message','Invalid user name or password');
				var result = json.result;
				//result.should.have.property('userId', '15087654321');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});

	it('login user3 failed', function (done){
		this.timeout(50000);

		var params = '&userName=' + user_3.userName;
		params += '&password=' + user_3.password;
		
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
				json.should.have.property('code', 2001);
				json.should.have.property('message','Invalid user name or password');
				var result = json.result;
				//result.should.have.property('userId', '15087654321');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});

	it('login user4 success', function (done){
		this.timeout(50000);

		var params = '&userName=' + user_4.userName;
		params += '&password=' + user_4.password;
		
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
				result.should.have.property('userId', 'aa4eb35461751b00fa23');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});
	});
});
