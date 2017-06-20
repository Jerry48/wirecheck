// device edit API test 
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by yanyan
 *  
 */
 
require('should');
var async = require('async');
var db = require('../../common/db');
var http = require('http');
var host = 'http://localhost:';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 1235;

var URLPATH = '/v1/device/edit';
var url = host + port + URLPATH;
var comParams = '?local=ch&packageVersion=1&method=1&source=0&token=&sign=1233';


var device_1 = {
	id: 'invalid id',
	name:'device1change',
	nickName:'nikeName1',
	latitude:1.0,
	longitude:1.0,
	beatInterval:1,
	photoInterval:1,
	mac:'a1:d2:s3:f3:c3',
	batteryVoltageLow:1,
	chargeVoltageLow:1,
	temperatureLow:1,
	batteryVoltageHigh:1,
	chargeVoltageHigh:1,
	temperatureHigh:1,	
};

var device_2 = {
	id: '921ef59e3ce8f14d2a50',
	name:'device1update',
	nickName:'nikeName1',
	latitude:1.0,
	longitude:1.0,
	beatInterval:1,
	photoInterval:1,
	mac:'a1:d2:s3:f3:c3',
	batteryVoltageLow:1,
	chargeVoltageLow:1,
	temperatureLow:1,
	batteryVoltageHigh:1,
	chargeVoltageHigh:1,
	temperatureHigh:1,	
};

var device_3 = {
	id: 'a80b7f10fdc29f8e7091',
	name:'device1',
	nickName:'nikeName1update',
	latitude:1.0,
	longitude:1.0,
	beatInterval:1,
	photoInterval:1,
	mac:'a1:d2:s3:f3:c3',
	batteryVoltageLow:1,
	chargeVoltageLow:1,
	temperatureLow:1,
	batteryVoltageHigh:1,
	chargeVoltageHigh:1,
	temperatureHigh:1,	
};
var device_4 = {
	id: '067f02a7207ebc27e94a',
	name:'device1',
	nickName:'nikeName12update',
	latitude:1.0,
	longitude:1.0,
	beatInterval:1,
	photoInterval:1,
	mac:'a1:d2:s3:f3:c3',
	batteryVoltageLow:1,
	chargeVoltageLow:1,
	temperatureLow:1,
	batteryVoltageHigh:1,
	chargeVoltageHigh:1,
	temperatureHigh:1,	
};

var devices =[];

describe('device.edit', function () {
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

	it('device_1  edit', function (done){
		this.timeout(50000);
		var index = 0;

		var params = '&id='+devices[index].id;
			params += '&name='+devices[index].name;
			params += '&nickName='+devices[index].nickName;
			params += '&latitude='+devices[index].latitude;
			params += '&longitude='+devices[index].longitude;
			params += '&beatInterval='+devices[index].beatInterval;
			params += '&photoInterval='+devices[index].photoInterval;
			params += '&mac='+devices[index].mac;
			params += '&batteryVoltageLow='+devices[index].batteryVoltageLow;
			params += '&chargeVoltageLow='+devices[index].chargeVoltageLow;
			params += '&temperatureLow='+devices[index].temperatureLow;
			params += '&batteryVoltageHigh='+devices[index].batteryVoltageHigh;
			params += '&chargeVoltageHigh='+devices[index].chargeVoltageHigh;
			params += '&temperatureHigh='+devices[index].temperatureHigh;

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

	it('device_2 edit', function (done){
		this.timeout(50000);
		var index = 1;

		var params = '&id='+devices[index].id;
			params += '&name='+devices[index].name;
			params += '&nickName='+devices[index].nickName;
			params += '&latitude='+devices[index].latitude;
			params += '&longitude='+devices[index].longitude;
			params += '&beatInterval='+devices[index].beatInterval;
			params += '&photoInterval='+devices[index].photoInterval;
			params += '&mac='+devices[index].mac;
			params += '&batteryVoltageLow='+devices[index].batteryVoltageLow;
			params += '&chargeVoltageLow='+devices[index].chargeVoltageLow;
			params += '&temperatureLow='+devices[index].temperatureLow;
			params += '&batteryVoltageHigh='+devices[index].batteryVoltageHigh;
			params += '&chargeVoltageHigh='+devices[index].chargeVoltageHigh;
			params += '&temperatureHigh='+devices[index].temperatureHigh;

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

	it('device_3 edit', function (done){
		this.timeout(50000);
		var index = 2;

		var params = '&id='+devices[index].id;
			params += '&name='+devices[index].name;
			params += '&nickName='+devices[index].nickName;
			params += '&latitude='+devices[index].latitude;
			params += '&longitude='+devices[index].longitude;
			params += '&beatInterval='+devices[index].beatInterval;
			params += '&photoInterval='+devices[index].photoInterval;
			params += '&mac='+devices[index].mac;
			params += '&batteryVoltageLow='+devices[index].batteryVoltageLow;
			params += '&chargeVoltageLow='+devices[index].chargeVoltageLow;
			params += '&temperatureLow='+devices[index].temperatureLow;
			params += '&batteryVoltageHigh='+devices[index].batteryVoltageHigh;
			params += '&chargeVoltageHigh='+devices[index].chargeVoltageHigh;
			params += '&temperatureHigh='+devices[index].temperatureHigh;

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

	it('device 4 edit', function (done){
		this.timeout(50000);
		var index = 3;
		
		var params = '&id='+devices[index].id;
			params += '&name='+devices[index].name;
			params += '&nickName='+devices[index].nickName;
			params += '&latitude='+devices[index].latitude;
			params += '&longitude='+devices[index].longitude;
			params += '&beatInterval='+devices[index].beatInterval;
			params += '&photoInterval='+devices[index].photoInterval;
			params += '&mac='+devices[index].mac;
			params += '&batteryVoltageLow='+devices[index].batteryVoltageLow;
			params += '&chargeVoltageLow='+devices[index].chargeVoltageLow;
			params += '&temperatureLow='+devices[index].temperatureLow;
			params += '&batteryVoltageHigh='+devices[index].batteryVoltageHigh;
			params += '&chargeVoltageHigh='+devices[index].chargeVoltageHigh;
			params += '&temperatureHigh='+devices[index].temperatureHigh;
			
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

