// picture search logic test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.11, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/search/pics/device';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var pic_1 = {
	deviceId:'4497263d9806cbb6d2ae',
	size:12,
	index:0
};

var pic_2 = {
	deviceId:'50c1c3b2db44126e7207',
	size:1,
	index:0
};

var pic_3 = {
	deviceId:'',
	size:1,
	index:0
};

var pic_4 = {
	deviceId:'invalid id',
	size:1,
	index:0
};

var pics =[];

describe('picture.search.by.device', function () {
	beforeEach(function (done) {
		pics.push(pic_1);
		pics.push(pic_2);
		pics.push(pic_3);
		pics.push(pic_4);
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

	it('pic1_search_by_device', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&deviceId=' + pics[index].deviceId;
		 	params += '&size=' + pics[index].size;
		 	params += '&index=' + pics[index].index;

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

	it('pic2_search_by_device', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&deviceId='+pics[index].deviceId;
			 params += '&size='+pics[index].size;
			 params += '&index='+pics[index].index;

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

	it('pic3_search_by_device', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&deviceId='+pics[index].deviceId;
			 params += '&size='+pics[index].size;
			 params += '&index='+pics[index].index;
		var path = url + comParams+params;

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

	it('pic4_search_by_device', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&deviceId='+pics[index].deviceId;
			 params += '&size='+pics[index].size;
			 params += '&index='+pics[index].index;
		var path = url + comParams+params;
			
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

