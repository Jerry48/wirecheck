'use strict';
var moduleName = 'disalert_details.logic';
var URLPATH = '/v1/disalert/details';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var alertInfoModel = require('../../model/alert_disable_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var refModel = {
	id: {
		data: "1",
		rangeCheck: null,
	}
};


function validate(data){
	if(!data){
		return false;
	}

	return logic_helper.validate({
		debug: debug,
		moduleName: moduleName,
		refModel: refModel,
		inputModel: data,
	});
}

function packageResponseData(id){
	if(!id){
		return {};
	}

	var resData = {
		list: id
	};
	return resData;
}

function getDisalertInfo(params, fn) {
	var id =  params.id ;

	var match = {};

	match.deviceId = id;


	var select = alertInfoModel.dataModel;
	var query = {
		select: select,
		match: match,
	};
	debug(query);
	alertInfoModel.lookup(query, function(err, rows){
		if (err) {
			console.error('Failed to check the alert info!' + err);
			fn(err);
		}else {
			var data = {};

			if (rows.length==0)
			{
				debug('Cannot find the alert info, %j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data = rows[0];
				var res = {};
				var x;
				res.deviceId = rows[0].deviceId;
				res.size = rows.length;
				res.list = [];
				for (x in rows){
					var tmp = {};
					var current = rows[x];
					tmp.dayOfWeek = current.dayOfWeek;
					tmp.startTime = {"hour":current.startHour,"minute":current.startMinute};
					tmp.endTime = {"hour":current.endHour,"minute":current.endMinute};
					res.list.push(tmp);
				}
				fn(null, res);
			}
		}
	});
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}
	var id = param.id;

	debug('getting disalert:'+id);

	async.series([
			function(next){
				getDisalertInfo(param,next);
			}
		],
		function(err, data ){
			if (err) {
				console.error('Failed to get disalertinfo'+id);
				fn(err);
			}else{
				debug('Success to get disalertinfo:'+id);
				var resData = packageResponseData(data);
				fn(null, resData);
			}
		});
}

//post interface
router.post(URLPATH, function (req, res, next){
	var param = req.body;

	logic_helper.responseHttp({
		res: res,
		req: req,
		next: next,
		moduleName: moduleName,
		processRequest: processRequest,
		debug : debug,
		param: param,
	});
});

//get interface for mocha testing
function getCallback(req, res, next){
	var param = req.query;

	logic_helper.responseHttp({
		res: res,
		req: req,
		next: next,
		moduleName: moduleName,
		processRequest: processRequest,
		debug : debug,
		param: param,
	});
}

router.get(URLPATH, getCallback);

module.exports.router = router;
