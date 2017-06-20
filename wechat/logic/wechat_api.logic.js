//  wechat logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.25, created by Andy.zhou
 *  
 */
var express = require('express');
var router = express.Router();

var backLogic = '../../back/logic/';

var api_user_pwd_change = require(backLogic+'user/user_pwd_change.logic');
router.use(api_user_pwd_change.router);

var api_user_list_devices = require(backLogic+'user/user_list_devices.logic');
router.use(api_user_list_devices.router);

var api_device_details = require(backLogic+'device/device_details.logic');
router.use(api_device_details.router);

var api_device_tree_line = require(backLogic+'device/device_tree_line.logic');
router.use(api_device_tree_line.router);

var api_device_view_status = require(backLogic+'device/device_view_status.logic');
router.use(api_device_view_status.router);

var api_device_edit = require(backLogic+'device/device_edit.logic');
router.use(api_device_edit.router);

var api_device_defend_details = require(backLogic+'device_monitor/device_defend_details.logic');
router.use(api_device_defend_details.router);

var api_device_defend_set = require(backLogic+'device_monitor/device_defend_set.logic');
router.use(api_device_defend_set.router);

var api_alert_list = require('./alert_list.logic');
router.use(api_alert_list.router);

var api_alert_view_detail = require('./alert_view_detail.logic');
router.use(api_alert_view_detail.router);

var api_alert_process = require('./alert_process.logic');
router.use(api_alert_process.router);

var api_user_follow_list = require('./user_follow_list.logic');
router.use(api_user_follow_list.router);

var api_user_follow_device = require('./user_follow_device.logic');
router.use(api_user_follow_device.router);

var api_user_follow_search = require('./user_follow_search.logic');
router.use(api_user_follow_search.router);

var api_user_search = require('./user_search.logic');
router.use(api_user_search.router);

var api_user_bind = require('./user_bind.logic');
router.use(api_user_bind.router);

var api_user_unbind = require('./user_unbind.logic');
router.use(api_user_unbind.router);

var api_user_ifbind = require('./user_ifbind.logic');
router.use(api_user_ifbind.router);

// var api_message_notify_alert = require('./message_notify_alert.logic');
// router.use(api_message_notify_alert.router);

// var api_manual_notify_push = require('./manual_notify_push.logic');
// router.use(api_manual_notify_push.router);

var api_manual_notify_piclist = require('./manual_notify_piclist.logic');
router.use(api_manual_notify_piclist.router);

var api_search_by_device = require(backLogic+'picture_search/search_by_device.logic');
router.use(api_search_by_device.router);

var api_device_list_users = require(backLogic+'device/device_list_users.logic');
router.use(api_device_list_users.router);

var api_command_manual_push = require(backLogic+'commands/command_manual_push.logic');
router.use(api_command_manual_push.router);

var api_command_trigger_photo = require(backLogic+'commands/command_trigger_photo.logic');
router.use(api_command_trigger_photo.router);

module.exports.router = router;