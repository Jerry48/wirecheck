//  device defend Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */

var express = require('express');
var router = express.Router();

var api_device_defend_details = require('./device_defend_details.logic');
router.use(api_device_defend_details.router);

var api_device_defend_set = require('./device_defend_set.logic');
router.use(api_device_defend_set.router);

module.exports.router = router;