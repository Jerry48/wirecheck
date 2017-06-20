//  commands Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.15, created by Andy.zhou
 *  
 */

var express = require('express');
var router = express.Router();

var api_command_set_manual_pic_analysis = require('./command_set_manual_pic_analysis.logic');
router.use(api_command_set_manual_pic_analysis.router);

var api_command_trigger_photo = require('./command_trigger_photo.logic');
router.use(api_command_trigger_photo.router);

var api_command_update_device = require('./command_update_device.logic');
router.use(api_command_update_device.router);

var api_command_manual_push = require('./command_manual_push.logic');
router.use(api_command_manual_push.router);

var api_command_set_device= require('./command_set_device.logic');
router.use(api_command_set_device.router);

var api_command_reset_device= require('./command_reset_device.logic');
router.use(api_command_reset_device.router);

module.exports.router = router;