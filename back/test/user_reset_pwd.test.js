// user resetpwd API test 
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

var URLPATH = '/v1/user/pwd/reset';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var user_1 = {
	userName: 'userId1',
	password: '123456',
};

var user_2 = {
	userName: 'userId2',
	password: '123456',
};

var user_3 = {
	userName: 'userId3',
	password: '123456',
};
var user_4 = {
	userName: 'userId4',
	password: '123456',
};

var users =[];

describe('user.ResetPwd', function () {
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

	it('users_1 ResetPwd failed', function (done){
		this.timeout(50000);
		var index = 0;

		var	params = '&userName='+users[index].userName; 
			params += '&password='+users[index].password;
		
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
				result.should.have.property('userId', 'ffbc45ba4b0e6d961755');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('users_2 ResetPwd failed', function (done){
		this.timeout(50000);

		var index = 1;

		var	params = '&userName='+users[index].userName; 
			params += '&password='+users[index].password;

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
				result.should.have.property('userId', 'bd72d96232303989ecbc');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('users_3 ResetPwd failed', function (done){
		this.timeout(50000);

		var index = 2;

		var	params = '&userName='+users[index].userName; 
			params += '&password='+users[index].password;
			
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
				result.should.have.property('userId', 'c7f1653ac441ed008157');
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

it('users_4 ResetPwd failed', function (done){
		this.timeout(50000);

		var index = 3;

		var	params = '&userName='+users[index].userName; 
			params += '&password='+users[index].password;

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
				result.should.have.property('userId', 'aca222ecfe81627c0eff');
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

