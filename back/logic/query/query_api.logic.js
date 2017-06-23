//  query Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.21, created by Andy.zhou
 *  
 */

var express = require('express');
var router = express.Router();

var api_query_device_by_map = require('./query_device_by_map.logic');
router.use(api_query_device_by_map.router);

var api_query_group_create = require('./query_group_create.logic');
router.use(api_query_group_create.router);

var api_query_group_delete = require('./query_group_delete.logic');
router.use(api_query_group_delete.router);

var api_query_group_edit = require('./query_group_edit.logic');
router.use(api_query_group_edit.router);

var api_query_group_list_members = require('./query_group_list_members.logic');
router.use(api_query_group_list_members.router);

var api_query_self_create = require('./query_self_create.logic');
router.use(api_query_self_create.router);

var api_query_self_delete = require('./query_self_delete.logic');
router.use(api_query_self_delete.router);

var api_query_self_edit = require('./query_self_edit.logic');
router.use(api_query_self_edit.router);

var api_query_self_list_members = require('./query_self_list_members.logic');
router.use(api_query_self_list_members.router);

var api_query_map_by_devices = require('./query_map_by_devices.logic');
router.use(api_query_map_by_devices.router);

var api_query_device_heartbeat_logs = require('./query_device_heartbeat_logs.logic');
router.use(api_query_device_heartbeat_logs.router);

var api_query_device_alert_log = require('./query_device_alert_log.logic');
router.use(api_query_device_alert_log.router);

var api_query_device_heartbeat_logs = require('./query_device_heartbeat_logs.logic');
router.use(api_query_device_heartbeat_logs.router);

var api_query_heartbeat_logs = require('./query_heartbeat_logs.logic');
router.use(api_query_heartbeat_logs.router);

var api_query_device_heartbeatlose_logs = require('./query_device_heartbeatlose_logs.logic');
router.use(api_query_device_heartbeatlose_logs.router);

var api_query_videoserver_working_logs = require('./query_videoserver_working_log.logic');
router.use(api_query_videoserver_working_logs.router);

var api_query_pic_download_zip = require('./query_pic_download_zip.logic');
router.use(api_query_pic_download_zip.router);

var api_query_server_status = require('./query_server_status.logic');
router.use(api_query_server_status.router);

module.exports.router = router;