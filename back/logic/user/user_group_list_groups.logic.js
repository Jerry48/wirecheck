// user group list groups api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'user_group_list_groups.logic';
var URLPATH = '/v1/user/group/list';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../../model/user_info');
var groupModel = require('../../model/user_group_info');
var groupMemberModel =require('../../model/user_group_member_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('./user.logic');

var refModel = {

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

function packageResponseData(inputData){
	if(!inputData){
		return {};
	}
	
	var resData = {
        size: inputData.length,
        list:[],
	};
    for (var i = 0; i < inputData.length; i++) {
        var data = {};
        data.id = inputData[i].id;
        data.name = inputData[i].name;
        resData.list.push(data);
    }
	return resData;
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	
	debug('Try to list all groups');

    var select = groupModel.dataModel;
    var match = {
        state: 0,
        type:wxConstants.GROUPTYPE.USER,
    };
    var query = {
        select: select,
        match:match,
    };
    groupModel.lookup(query, function(err, rows){
        if (err) {
            var msg = err.msg || err;
            console.error(moduleName 
                + ', Failed to read all groups: '+ msg);
            fn(err);
        }else {
            debug('Success to read all groups');
            var resData = packageResponseData(rows);
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