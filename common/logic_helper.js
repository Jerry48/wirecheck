//  Logic helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */

'use strict';
var LOGICDEBUG = require('debug')('logichelper.utils');

var wxConstants = require('./constants');
var errorCode = require('./errorCode');



function validate (options) {
 	var debug = options.debug || LOGICDEBUG;
 	var refModel = options.refModel;
 	var inputModel = options.inputModel;
 	var moduleName = options.moduleName;

 	for (var k in refModel) {
 		//check existence
 		if(!(k in inputModel)){
 			var optional = refModel[k].optional || 0;
 			if (!optional) {
  				console.error(moduleName+' no filed: '+k);
 				return false;				
 			}
 		}

 		var refData = refModel[k].data;
 		var refRangeCheck = refModel[k].rangeCheck;
 		var inputData = inputModel[k];
 		
 		if((typeof refData ==='number') && !isNaN(inputData)) {
 			inputData = inputModel[k] = Number(inputData);
 		}

 		//check type
 		if(inputData && !((typeof refData) === (typeof inputData))) {
 			console.error(moduleName + ' invalid filed: '+k);
 			console.error(moduleName + ' invalid refModel: '+ refData);
 			console.error(moduleName + ' invalid inputModel: '+ inputData);
 			return false;
 		}

 		if(inputData && refRangeCheck){
 			if( ! refRangeCheck(inputData)) {
 				console.error(moduleName + ' invalid data range: '+ k);
 				return false;
 			}
 		}
 	};

 	return true;
}

function responseHttp (options) {
 	var res = options.res;
 	var req = options.req;
 	var next = options.next;
 	var moduleName = options.moduleName;
 	var processRequest = options.processRequest;
 	var debug = options.debug;
 	var param = options.param;

 	debug( ' req.headers:%j', req.headers);
 	debug( ' req.cookies:%j', req.cookies);
 	debug( ' req.session:%j', req.session);
	debug( ' req.param:%j', param);

 	var json = {};

 	try {
		//1.1 
	 	//verify the signature
	 	//2.
	 	processRequest(param, function(err, result){
	 		if (err) {
	 			var code = err.code || 1;
	 			var message = err.msg || err;
	 			console.error(moduleName + ' data process failed: %j', message);
	 			
	 			json.code = code; //0-success, 1-fail, 2-timeout, 3-need login
	 			json.message = message;
	 			json.result = {};
	 		}else {
	 			debug(moduleName + ' data process success: %j', result);
	 			json.code = 0;
	 			json.message = 'CCFLab@SJTUServerMessage';
	 			json.result = result || {}; //accept the empty result
	 		}

	 		res.json(json);
	 	});
 	}catch(e){
 		console.error(moduleName +", responseHttp:" +e);	 			
	 	json.code = 404; //0-success, 1-fail, 2-timeout, 3-need login
	 	json.message = e.toString();
	 	json.result = {};
		res.json(json);
 	}
 	
 }

 function createData(options){
 	var debug = options.debug || LOGICDEBUG;
 	var inputData = options.inputData;
 	var refModel = options.refModel;

 	var data = {};
 	for (var k in refModel) {
 		if (k in inputData) {
 			var input = inputData[k];
 			if (input){
 				var ref = refModel[k].data || refModel[k];
 				if (typeof ref === 'number') {
 					if (isNaN(input)) {
 						console.error('Invalid input data with key='+k+
 							',value='+input);
 					}else{
 						data[k] = Number(input);
 					}
 				}else{
 					data[k] = input;
 				}
 			}else {
 				data[k] = '';
 			}
 		}else{
 			//set the default value

 		}
 	}
 	return data;
 }

function parseEditData(options){
	var debug = options.debug || LOGICDEBUG;
 	var inputData = options.inputData;
 	var editModel = options.editModel;

 	var data = {};

 	for (var k in editModel) {
 		if (k in inputData) {
 			var value = inputData[k];
 			if (value && value !='') {
 				var editRef = editModel[k].data || editModel[k];
 				if (typeof editRef ==='number') {
 					if (isNaN(value)) {
 						console.error('Invalid input data with key='+k+
 							',value='+input);
 					}else{
 						data[k] = Number(value);
 					}
 				}else {
 					data[k] = value;
 				}
 			}
 		}
 	}
 	return data;
}

 module.exports.validate = validate;
 module.exports.responseHttp = responseHttp;
 module.exports.createData = createData;
 module.exports.parseEditData = parseEditData;