// picture search logic
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.19, created by Andy.zhou
 *  
 */
'use strict';
var moduleName = 'search.logic';
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


