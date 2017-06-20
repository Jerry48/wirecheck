// query device by map api test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.08, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/query/map';
var URLPATH_2 = '/v1/device/query/map2';

var url = host + port + URLPATH || URLPATH_2;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var device_1 = {
	latitudeLow: 11,
	latitudeHigh: 11,
	longitudeLeft: 11,
	longitudeRight: 11

};

var device_2 = {
	latitudeLow: '',
	latitudeHigh: 11,
	longitudeLeft: 11,
	longitudeRight: 11	
};

var device_3 = {
	latitudeLow: 11,
	latitudeHigh: null,
	longitudeLeft: 11,
	longitudeRight: 11	
};

var device_4 = {
	latitudeLow: 11,
	latitudeHigh: 11,
	longitudeLeft: 11,
	longitudeRight: 235	
};

var devices =[];

describe('query.device.by.map', function () {
	beforeEach(function (done) {
		devices.push(device_1);
		devices.push(device_2);
		devices.push(device_3);
		devices.push(device_4);
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

	it('query_device1_by_map', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&latitudeLow='+devices[index].latitudeLow;
		 	params += '&latitudeHigh='+devices[index].latitudeHigh;
		 	params += '&longitudeLeft='+devices[index].longitudeLeft;
		 	params += '&longitudeRight='+devices[index].longitudeRight;

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

	it('query_device2_by_map', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&latitudeLow='+devices[index].latitudeLow;
		 	params += '&latitudeHigh='+devices[index].latitudeHigh;
		 	params += '&longitudeLeft='+devices[index].longitudeLeft;
		 	params += '&longitudeRight='+devices[index].longitudeRight;

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

	it('query_device3_by_map', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&latitudeLow='+devices[index].latitudeLow;
		 	params += '&latitudeHigh='+devices[index].latitudeHigh;
		 	params += '&longitudeLeft='+devices[index].longitudeLeft;
		 	params += '&longitudeRight='+devices[index].longitudeRight;

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

	it('query_device4_by_map', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&latitudeLow='+devices[index].latitudeLow;
		 	params += '&latitudeHigh='+devices[index].latitudeHigh;
		 	params += '&longitudeLeft='+devices[index].longitudeLeft;
		 	params += '&longitudeRight='+devices[index].longitudeRight;
			
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

