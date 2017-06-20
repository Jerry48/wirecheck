// device line delete create api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
 
'use strict';  
var moduleName = 'device_temperature_chart.logic';
var URLPATH = '/v1/cmd/temp/chart';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceLineModel = require('../../model/device_line_info');
var deviceModel = require('../../model/device_info');
var cmdTempModel = require('../../model/cmd_temperature_info');

//helper 
var logic_helper = require('../../../common/logic_helper');
var wxConstants = require('../../../common/constants');
var errorCode = require('../../../common/errorCode');
var dataHelper = require('../../../common/dataHelper');

var deviceHelper = require('./device.logic');

var refModel = {
    cmdID: {
        data: 'cmdID',
        rangeCheck: null,
    },

	time:{
        data: '',
        optional: 1,
        rangeCheck: function(data){
             return moment(data, "YYYY-MM-DD HH:mm:ss").isValid();
        }
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

function packageResponseData(inputData){
	if(!inputData){
		return {};
	}	
	
    var list = [];
    var size;

    for(var i=0;i<inputData.length;i++){
      if(inputData[i]!=null){
        var time = moment(inputData[i].time);
        list.push({
            id: inputData[i].id,
            cmdID: inputData[i].cmdID,
            temperature: inputData[i].temperature,
            time: time.format('YYYY-MM-DD HH:mm:ss'),
        });
      }
        
    }
	var resData = {
        size: inputData.length,
        list: list,
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

	debug('Try to delete the device line');
    var cmdID = param.cmdID;
    

    var hours = [];
    for(var i=0;i<24;i++){
        hours.push(i);
    }

    async.mapSeries(hours,
        function(hour,next){
            var hourTime = (hour < 10)? ('0'+hour):(''+hour);
            var startTime = moment(param.time + ' '+hourTime+':00:00');
            var endTime = moment(param.time + ' '+hourTime+':59:59');

            var sqlstr = 'select id,cmdID,temperature,time';       
            sqlstr += ' from '+cmdTempModel.tableName+' where ';
        
            sqlstr += ' time between \'' 
                    +startTime.format('YYYY-MM-DD HH:mm:ss');
            sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\' and cmdID = "'+cmdID+'" order by time DESC LIMIT 0,1';
            sqlstr += ';';

         //2. create the new user!
            var query = {
                sqlstr:sqlstr,
            };
            cmdTempModel.query(query,function(err,rows){
                if (err) {
                    var msg = err.msg  || err;
                    console.error(moduleName + msg);
                    next(err);
                }else{
                    next(null,rows[0]);
                }
            });
    },
    function(err,result){
        if (err) {
            console.error('Failed to delete device Line!');
            fn(err);
        }else{
            debug('Success to delete the device line:');
            var resData = packageResponseData(result);
            fn(null, resData);
        }
    });

   //  async.waterfall([
   //  	function(next){
   //          console.log(startTime);
   //          console.log(endTime);
   //          var sqlstr = 'select id,cmdID,temperature,time';       
   //          sqlstr += ' from '+cmdTempModel.tableName+' where ';
        
   //          sqlstr += ' time between \'' 
   //                  +startTime.format('YYYY-MM-DD HH:mm:ss');
   //          sqlstr += '\' and \''+endTime.format('YYYY-MM-DD HH:mm:ss')+'\' and cmdID = "'+cmdID+'" order by time ASC';
   //          sqlstr += ';';

   //  		//2. create the new user!
   //          var query = {
   //              sqlstr:sqlstr,
   //          };
   //          cmdTempModel.query(query,function(err,rows){
   //              if (err) {
   //                  var msg = err.msg  || err;
   //                  console.error(moduleName + msg);
   //                  next(err);
   //              }else{
   //                  console.log(rows);
   //                  next(null,rows);
   //              }
   //          });
   //  	},
   //  ], 
   //  function(err, device){
   //  	if (err) {
   //  		console.error('Failed to delete device Line!');
   //  		fn(err);
   //  	}else{
   //  		debug('Success to delete the device line:');
   //  		var resData = packageResponseData(device);
			// fn(null, resData);
   //  	}
   //  });	
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