//  search Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.21, created by Andy.zhou
 *  
 */

var express = require('express');
var router = express.Router();

var api_search_by_device = require('./search_by_device.logic');
router.use(api_search_by_device.router);

var api_search_by_devices_piclist = require('./search_by_devices_piclist.logic');
router.use(api_search_by_devices_piclist.router);

var api_search_by_device_piclist = require('./search_by_device_piclist.logic');
router.use(api_search_by_device_piclist.router);

var api_search_by_all = require('./search_by_all.logic');
router.use(api_search_by_all.router);

var api_search_by_processstatus = require('./search_by_processstatus.logic');
router.use(api_search_by_processstatus.router);

module.exports.router = router;