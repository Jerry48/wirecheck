// device level list child api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.05, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_line_list.logic';
var URLPATH = '/v1/device/line/list';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLevelModel = require('../../model/device_level_info');
var deviceLineModel = require('../../model/device_line_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
	userId: {
		data: 'userId',
		rangeCheck: null,
	},
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
		list: inputData,
	};
    
	return resData;
}

function processRequest(param, fn){
	//1. check the input data
	if(!validate(param)){
		var msg = 'invalid data';
		console.error(moduleName+': '+msg);
		return fn({code:errorCode.PARAM_INVALID, msg: msg});
	}

	var datas= [];
    var ids = [];

	console.log('Try to list the data of level  ');

    async.waterfall([
    	function(next){
    		var match = {
                level: 0,
            };
            var select = {
                id: 'id',
                name: 'name',
                level: 1,
            };
            var query = {
                select: select,
                match: match,
            };
            deviceLevelModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+msg);
                    next(err);
                }else{
                    for(var i=0;i<rows.length;i++){
                        datas[i] = {
                           id : rows[i].id,
                           text : rows[i].name,
                        }
                        ids.push(datas[i].id);
                    }
                    next(null,ids);
                }
            });
    	},
        function(ids,next){
            var sqlstr = 'select id, name, parentId from '+deviceLineModel.tableName;
            sqlstr +=' where parentId in ("';
            sqlstr += ids.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };
            deviceLineModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName+'Failed to get the group member for'+msg);
                    next(err);
                }else{
                    for(var i=0;i<ids.length;i++){
                        datas[i].nodes = [];
                        for(var j=0;j<rows.length;j++){

                            if(rows[j].parentId == ids[i]){
                                rows[j].text = rows[j].name,
                                datas[i].nodes.push({id:rows[j].id,text:rows[j].text});
                            }
                        }
                        if(datas[i].nodes.length==0){
                            datas[i].nodes=undefined;
                        }
                    }
                    next(null,datas);
                }
            });
        },
    ], 
    function(err,datas){
    	if (err) {
    		console.error('Failed to list the data of level');
    		fn(err);
    	}else{
    		debug('Success to list the data of level:');
    		var resData = packageResponseData(datas);
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