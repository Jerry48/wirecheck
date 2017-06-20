// user create API test 
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

var URLPATH = '/v1/user/create';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var user_1 = {
	userName: 'userId1',
	password: '123456',
	gender: 0,
	mobile:'13671641968',
	name: 'andy',
	userType: 0,
};

var user_2 = {
	userName: 'userId2',
	password: '123456',
	gender: 0,
	mobile:'13671641968',
	name: 'andy',
	userType: 0,
};

var user_3 = {
	userName: 'userId3',
	password: '123456',
	gender: 0,
	mobile:'13671641968',
	name: 'andy',
	userType: 0,
};
var user_4 = {
	userName: 'userId4',
	password: '123456',
	gender: 0,
	mobile:'13671641968',
	name: 'andy',
	userType: 0,
};

var users =[];

describe('user.create', function () {
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

	it('create user 1', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
		params += '&password='+users[index].password;
		params += '&name='+users[index].name;
		params += '&userType='+users[index].userType;

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

	it('create user 2', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
		params += '&password='+users[index].password;
		params += '&name='+users[index].name;
		params += '&userType='+users[index].userType;

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

	it('create user 3', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
		params += '&password='+users[index].password;
		params += '&name='+users[index].name;
		params += '&userType='+users[index].userType;

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

	it('create user 4', function (done){
		this.timeout(50000);
		var index = 3;

		var params = '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
		params += '&password='+users[index].password;
		params += '&name='+users[index].name;
		params += '&userType='+users[index].userType;

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

	function getExpectData(){
		var resData = {
			token:'test13671641968',
			userId:'test13671641968',
			chatTokenId:'test13671641968',
		};
		return resData;
	}
});

