// picure set refpic api test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.17, created by yanyan
 *  
 */

	require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/klSetReference';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var pic_1 = {
  "deviceId":"4497263d9806cbb6d2ae",
  "path":"/home/yanyan0/workspace",
  "name":"no.jpg",
  "resolution":"32"
};

var pic_2 = {
  "deviceId":"invalid id",
  "path":"/home/yanyan0/workspace",
  "name":"no.jpg",
  "resolution":"32"
};

var pic_3 = {
  "deviceId":"d2d3d9274f835579ddc5",
  "path":"invalid path",
  "name":"no.jpg",
  "resolution":"32"
};


var pics =[];

describe('picture_set_refpic', function () {
	beforeEach(function (done) {
		pics.push(pic_1);
		pics.push(pic_2);
		pics.push(pic_3);

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

	it('picture1_set_refpic', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&deviceId='+pics[index].deviceId;
		    params += '&path='+pics[index].path;
		    params += '&name='+pics[index].name;
		    params += '&resolution='+pics[index].resolution;

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

});

it('picture2_set_refpic', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&deviceId='+pics[index].deviceId;
		    params += '&path='+pics[index].path;
		    params += '&name='+pics[index].name;
		    params += '&resolution='+pics[index].resolution;

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


it('picture3_set_refpic', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&deviceId='+pics[index].deviceId;
		    params += '&path='+pics[index].path;
		    params += '&name='+pics[index].name;
		    params += '&resolution='+pics[index].resolution;

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

