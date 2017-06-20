// list all unprocessed pics api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.14, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'picture_list_unprocessed.logic';
var URLPATH = '/v1/device/klGetJob';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('../user/user.logic');

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
	
    var rois = [];
    for (var i = 0; i < inputData.length; i++) {
        var roi = [];
        var point1 = [];
        point1.push(inputData[i].X1);
        point1.push(inputData[i].Y1);
        point1.push(inputData[i].endX1);
        point1.push(inputData[i].endY1);

        var point2 = [];
        point2.push(inputData[i].X2);
        point2.push(inputData[i].Y2);
        point2.push(inputData[i].endX2);
        point2.push(inputData[i].endY2);

        var point3 = [];
        point3.push(inputData[i].X3);
        point3.push(inputData[i].Y3);
        point3.push(inputData[i].endX3);
        point3.push(inputData[i].endY3);

        roi.push(point1);
        roi.push(point2);
        roi.push(point3);
        rois.push(roi);
    }

	var resData = {
        size: inputData.length,
        list:[],
        rois:rois,
	};
    for (var i = 0; i < inputData.length; i++) {
        var data = {};
        data.id = inputData[i].id;
        data.deviceId = inputData[i].deviceId;
        data.picId = inputData[i].originalPicId;
        data.picPath = inputData[i].originalPicPath;
        data.refPicPath = inputData[i].refPicPath;
        data.sensitivity = inputData[i].sensitivity;
        // data.X = [];
        // data.X.push(inputData[i].X1);
        // data.X.push(inputData[i].X2);
        // data.X.push(inputData[i].X3);

        // data.Y = [];
        // data.Y.push(inputData[i].Y1);
        // data.Y.push(inputData[i].Y2);
        // data.Y.push(inputData[i].Y3);

        // data.endX = [];
        // data.endX.push(inputData[i].endX1);
        // data.endX.push(inputData[i].endX2);
        // data.endX.push(inputData[i].endX3);

        // data.endY = [];
        // data.endY.push(inputData[i].endY1);
        // data.endY.push(inputData[i].endY2);
        // data.endY.push(inputData[i].endY3);
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

	
	debug('Try to list all pictures need processed!');

    var deviceName = param.deviceName || '';
    var deviceIds = [];
    var pics = [];
    async.series([
        function(next){
            if (deviceName=='') {
                return next();
            }

            var select = deviceModel.tableName;
            var match = {
                name : deviceName,
            };
            var query = {
                select: select,
                match:match,
            };
            deviceModel.lookup(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    fn(err);
                }else{
                    for (var i = 0; i < rows.length; i++) {
                        deviceIds.push(rows[i].deviceID);
                    }
                    next(null);
                }
            });
        },function(next){
            var sqlstr = 'select * from '+picProcessModel.tableName;
            sqlstr+=' where (status= ' + wxConstants.PICPROCESSSTATUS.NOTSTART +')';
            if (deviceIds.length) {
                sqlstr += ' and ( deviceId in ("';
                sqlstr +=  deviceIds.join('","');
                sqlstr +='")) '
            }
            sqlstr +=';';
            var query = {
                sqlstr:sqlstr,
            };
            picProcessModel.query(query, function(err, rows){
                if (err) {
                        var msg = err.msg || err;
                        console.error(moduleName + msg);
                        fn(err);
                }else{
                   pics = rows;
                   next(null);
                }
            });
        }
    ], function(err){
        if (err) {
            console.error('Failed to get all the unprocessed pics!');
            fn(err);
        }else {
            debug('Success to get all the unprocessed pics!');
            var resData = packageResponseData(pics);
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