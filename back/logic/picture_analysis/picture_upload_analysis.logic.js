// upload processed pics api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'picture_upload_analysis.logic.logic';
var URLPATH = '/v1/device/klUploadResult';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var picModel = require('../../model/picture_info');
var picProcessModel = require('../../model/picture_process_info');
var deviceModel = require('../../model/device_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var userLogic = require('../user/user.logic');
var picLogic = require('../picture_analysis/picture_analysis.logic');
var deviceHelper = require('../device/device.logic');

var refModel = {
    id: {
        data: 'id',
        rangeCheck: null,
    },
    deviceId:{
        data: 'deviceid',
        rangeCheck: null,
    },
    // channelNo:{
    //     data: 1,
    //     rangeCheck: null,
    // },
    originalPicId:{
        data:'originalPicId',
        rangeCheck: null,
    },
//    picId:{
 //       data: 'processed pic id',
//        rangeCheck:null,
//    },
    name:{
        data: 'pic name',
        rangeCheck: null,
    },
    path:{
        data: 'path',
        rangeCheck: null,
    },
    resolution:{
        data: 0,
        rangeCheck: function(data){
            return data >=0;
        },
    },
    result:{
        data: 1,
        rangeCheck: function(data){
            return is.inArray(data, [0,1,2]);    
        }
    },
    comment:{
        data: 'comment',
        rangeCheck: null,
    },
    hostname:{
        data: 'hostname',
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
        id: inputData,
	};

	return resData;
}

function createPicData(param, fn){
    var pic = {
        pictureID: param.picId,
        deviceID: param.deviceId,
        type: wxConstants.PICTYPE.PROCESSED,
        pictureName: param.name,
        pictureWebURL: param.path,
        path: param.path,
        channelNo: param.channelNo,
        resolution: Number(param.resolution),
        width: param.width,
        height: param.height
    };
    var query = {
        values: pic,
        fields: pic,
    };
    picModel.create(query, function(err, rows){
        if (err) {
            fn(err);
        }else{
            fn(null, pic);
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

	var picId = param.picId || '';
	
    debug('Try to upload the processed status!');

    var deviceName = param.deviceName || '';
    var result = param.result && Number(param.result) || 0;
    // var channelNo = param.channelNo || 1;

    async.waterfall([
        function(next){
            //1. check the device
            deviceHelper.checkDeviceExist({deviceId:param.deviceId},
             function(err, data){
                if (err) {
                    var msg = err.msg || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    if (!data.exist) {
                        var msg = 'Err: the device is not exist!';
                        console.error(moduleName+msg);
                        next({
                            code: errorCode.DATA_DUPLICATE,
                            msg: msg,
                        });
                    }else {
                        next(null, data.device);
                    }
                }
            });
        },
        function(tmp,next) {
            var match = {
                pictureID: param.originalPicId,
            };
            var select = {
                channelNo: 1,
                width: 0,
                height: 0,
            };
            var query = {
                select: select,
                match: match,
            }; 
            picModel.lookup(query, function(err,rows){
                if(err){next(err);}else{
                    next(null,rows[0]);
                }
            });
        },
        function(tmp, next){  
            if (param.picId) {
                var match = {
                    id: picId,
                };
                picLogic.checkPicExist(match, function(err, data){
                    if(err){
                        var msg = err.msg || err;
                        console.error(moduleName+ msg);
                        next(err);
                    }else {
                        if (!data.exist) {
                            var msg = 'Error: This pic is not exist';
                            console.error(moduleName+msg);
                            next({
                                code: errorCode.NO_DATA_MATCH,
                                msg: msg,
                            });
                        }else{
                            next(null,  data.pic);
                        }
                    }
                });
            }else {
                picId = dataHelper.createId(param.path + param.originalPicId);
                param.picId = picId;
                param.width = tmp.width;
                param.height = tmp.height;
                param.channelNo = tmp.channelNo;
                createPicData(param, next);
            } 
        },

        function(pic, next){
           var update = {
                endTime: new Date(),
                status: wxConstants.PICPROCESSSTATUS.DONE,
                result: result,
                comment: param.comment || '',
                processedPicId: picId,
                processedPicPath: pic.path,
                processServer: param.hostname||'',
           };
           var match = {
                id : param.id || '',
                deviceId: param.deviceId || '',
                originalPicId: param.originalPicId || '',
           };
           var query = {
                update: update,
                match: match,
           };
           picProcessModel.update(query, next);
        }
    ], function(err){
        if (err) {
            console.error('Failed to update the unprocessed pics!');
            fn(err);
        }else {
            debug('Success to update the unprocessed pics!');
            var resData = packageResponseData(picId);
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