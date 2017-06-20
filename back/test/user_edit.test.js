// user edit API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.21, created by YeYanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/user/edit';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var user_1 = {
	userId:'1230e19ec667297b3fdb',
	userName: 'userId1',
	gender: 0,
	mobile:'13671641968',
	name: 'yanyan',
	userType: 0,
};

var user_2 = {
	userId:'f3b5146881f0c162c6fb',
	userName: 'userId2',
	gender: 0,
	mobile:'13671641968',
	name: 'yanyan',
	userType: 0,
};

var user_3 = {
	userId:'7037f2a5fd28454860b1',
	userName: 'userId3',
	gender: 0,
	mobile:'13671641968',
	name: 'YY',
	userType: 0,
};
var user_4 = {
	userId:'invalid user',
	userName: 'userId4',
	gender: 0,
	mobile:'13671641968',
	name: 'yy',
	userType: 0,
};

var users =[];

describe('user.edit', function () {
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

	it('user edit 1', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&userId='+users[index].userId;
		params += '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
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

	it('user edit 2', function (done){
		this.timeout(50000);

		var index = 1;

		var params = '&userId='+users[index].userId;
		params += '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
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

	it('user edit 3', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&userId='+users[index].userId;
		params += '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
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

	it('user edit 4', function (done){
		this.timeout(50000);
		var index = 3;

		var params = '&userId='+users[index].userId;
		params += '&userName='+users[index].userName;
		params += '&gender='+users[index].gender;
		params += '&mobile='+users[index].mobile;
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


});

