// user changepwd API test 
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

var URLPATH = '/v1/user/pwd/change';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var user_1 = {
	userId: 'afadb9452b60682e16dd',
	password: 'abc121change',
	newPassword: 'abc121change1',
};

var user_2 = {
	userId: 'c6298f7de70e364b7d15',
	password: 'abc1212',
	newPassword: 'abc1212change',
};

var user_3 = {
	userId: 'invalid userId',
	password: 'abc1213',
	newPassword: 'abc1213change',
};
var user_4 = {
	userId: 'f093b0719cc98be26d4c',
	password: 'invalid password',
	newPassword: 'abc1214',
};

var users =[];

describe('user.changepwd', function () {
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

	it('user 1 changepwd', function (done){
		this.timeout(50000);
		
		var index = 0;

		var params = '&userId='+users[index].userId;
			params += '&password='+users[index].password;
			params += '&newPassword='+users[index].newPassword;

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
				//result.should.have.property('userId', users[index].userId);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('user 2 changepwd', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&userId='+users[index].userId; 
			params += '&password='+users[index].password;
			params += '&newPassword='+users[index].newPassword;

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
				//result.should.have.property('userId', users[index].userId);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('user 3 changepwd', function (done){
		this.timeout(50000);
		var index = 2;

		var	params = '&userId='+users[index].userId; 
			params += '&password='+users[index].password;
			params += '&newPassword='+users[index].newPassword;

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
				//result.should.have.property('userId', users[index].userId);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('user 4 changepwd', function (done){
		this.timeout(50000);
		var index = 3;

		var	params = '&userId='+users[index].userId; 
			params += '&password='+users[index].password;
			params += '&newPassword='+users[index].newPassword;

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
				//result.should.have.property('userId', users[index].userId);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	/*function getExpectData(){
		var resData = {
			token:'test13671641968',
			userId:'test13671641968',
			chatTokenId:'test13671641968',
		};
		return resData;
	} */
});

