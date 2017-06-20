 // query device alert log api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.11, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'query_pic_download_zip.logic';
var URLPATH = '/v1/query/pic/download/zip';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');


var deviceModel = require('../../model/device_info');
var deviceAlertModel = require('../../model/alert_log');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');
var latlngHelper = require('../../../common/latlngHelper');

var deviceHelper = require('../device/device.logic');

var refModel = {
    list:{
        data: [],
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
        url:inputData,
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

    debug('Try to get the device heartbeat log');
    var piclist = param.list;
    var archiver = require('archiver');
    var fs = require('fs');
    //±»´ò°üÎÄ¼þ
    var files = [ ];

    for(var i=0;i<piclist.length;i++){
        files.push('/home/yzhou51/workspace/wire_check-dev-yzhou51/picserver/files'+piclist[i])
    }
    var now = moment();
    var timestr = now.format("YYYYMMDDHHmmss");
    var zipPath = '/home/yzhou51/workspace/wire_check-dev-yzhou51/picserver/files/zips/'+timestr+'.zip';
    
    var output = fs.createWriteStream(zipPath);
    var zipArchiver = archiver('zip');
    zipArchiver.pipe(output);
    for(var i=0; i < files.length; i++) {
      zipArchiver.append(fs.createReadStream(files[i]), {'name': piclist[i]});
    }
    zipArchiver.finalize();

    debug('Success to find device alert logs');
    var zipurl = "http://139.196.202.6:9090/zips/"+timestr+'.zip';
    var resData = packageResponseData(zipurl);
    fn(null, resData);
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