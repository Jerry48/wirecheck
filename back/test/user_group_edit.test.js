// user group edit API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.20, created by YeYanyan
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/user/group/edit';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var group_1 = {
	id:'5debb719b97ad242bb7e',
	name: 'groupName1',
	newName: 'groupnewName1',
};

var group_2 = {
	id:'321e5d60b34c8c07cbaf',
	name: 'groupName2',
	newName: 'groupnewName2',
};

var group_3 = {
	id:'eb125cc5aed576ed2c36',
	name: 'groupName3',
	newName: 'groupnewName3',
};
var group_4 = {
	id:'invalid id',
	name: 'groupName4',
	newName: 'groupnewName4',
};

var groups =[];

describe('user.group.edit', function () {
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

	it('user group edit 1', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&newName='+groups[index].newName;

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
				result.should.have.property('id', groups[index].id);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('user group edit 2', function (done){
		this.timeout(50000);

		var index = 1;

		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&newName='+groups[index].newName;

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
				result.should.have.property('id', groups[index].id);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('user group edit 3', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&newName='+groups[index].newName;

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
				result.should.have.property('id', groups[index].id);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});

	it('user group edit 4', function (done){
		this.timeout(50000);
		var index = 3;

		var params = '&id='+groups[index].id;
			params += '&name='+groups[index].name;
			params += '&newName='+groups[index].newName;

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
				result.should.have.property('id', groups[index].id);
				done();
			});
		}).on('err', function(err){
			done('http get failed: '+err);
		});

	});


});

