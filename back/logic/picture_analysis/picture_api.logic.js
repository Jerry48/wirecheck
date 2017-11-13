//  picture Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */

var express = require('express');
var router = express.Router();

var api_picture_list_unprocessed = require('./picture_list_unprocessed.logic');
router.use(api_picture_list_unprocessed.router);

var api_picture_upload_analysis = require('./picture_upload_analysis.logic');
router.use(api_picture_upload_analysis.router);

//var api_command_set_manual_pic_analysis = require('../commands/command_set_manual_pic_analysis.logic');
//router.use(api_command_set_manual_pic_analysis.router);

var api_device_set_refpic = require('./picture_set_refpic.logic');
router.use(api_device_set_refpic.router);

var api_refpic_set = require('./picture_refpic_set.logic');
router.use(api_refpic_set.router);

var api_refpic_get = require('./picture_refpic_get.logic');
router.use(api_refpic_get.router);

var api_picture_alert = require('./picture_alert.logic');
router.use(api_picture_alert.router);

module.exports.router = router;