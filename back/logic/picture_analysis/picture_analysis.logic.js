//  picture Logic analysis helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.14, created by Andy.zhou
 *  
 */

 'use strict';
var moduleName = 'picture_analysis.logic';
var debug = require('debug')(moduleName);

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

function checkPicExist(param, fn) {
	var match = {};
	if (param.id) {
		match.pictureID = param.id;
	}

	var select = picModel.dataModel;
	var query = {
		select: select,
		match: match,
	};
	picModel.lookup(query, function(err, rows){
		if (err) {
			fn(err);
		}else {
			var data = {};

			if (rows.length==0) {
				debug('Cannot find the pic, %j', match);
				data.exist = false;
				fn(null, data);
			}else {
				data.exist = true;
				data.pic = rows[0];
				fn(null, data);
			}
		}
	});
}


module.exports.checkPicExist = checkPicExist;
