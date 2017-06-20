//  user Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.04, created by Andy.zhou
 *  
 */
var express = require('express');
var router = express.Router();

 var api_user_create = require('./user_create.logic');
 router.use(api_user_create.router);

 var api_user_delete = require('./user_delete.logic');
 router.use(api_user_delete.router);

 var api_user_device_set = require('./user_device_set.logic');
 router.use(api_user_device_set.router);

 var api_user_device_delete = require('./user_device_delete.logic');
 router.use(api_user_device_delete.router);

 var api_user_device_add = require('./user_device_add.logic');
 router.use(api_user_device_add.router);

 var api_user_edit = require('./user_edit.logic');
 router.use(api_user_edit.router);

 var api_user_group_create = require('./user_group_create.logic');
 router.use(api_user_group_create.router);

 var api_user_group_delete = require('./user_group_delete.logic');
 router.use(api_user_group_delete.router);

 var api_user_group_edit = require('./user_group_edit.logic');
 router.use(api_user_group_edit.router);

 var api_user_group_list_groups = require('./user_group_list_groups.logic');
 router.use(api_user_group_list_groups.router);

 var api_user_group_list_member = require('./user_group_list_members.logic');
 router.use(api_user_group_list_member.router);

 var api_user_group_manager = require('./user_group_manager.logic');
 router.use(api_user_group_manager.router);

 var api_user_login = require('./user_login.logic');
 router.use(api_user_login.router);

 var api_user_logout = require('./user_logout.logic');
 router.use(api_user_logout.router);

 var api_user_pwd_change = require('./user_pwd_change.logic');
 router.use(api_user_pwd_change.router);

 var api_user_reset_pwd = require('./user_reset_pwd.logic');
 router.use(api_user_reset_pwd.router);

 var api_user_view_details = require('./user_view_details.logic');
 router.use(api_user_view_details.router);

var api_user_list_all = require('./user_list_all.logic');
router.use(api_user_list_all.router);

var api_user_list_devices = require('./user_list_devices.logic');
router.use(api_user_list_devices.router);

var api_user_list_devices_no = require('./user_list_devices_no.logic');
router.use(api_user_list_devices_no.router);

var api_user_info_search = require('./user_info_search.logic');
router.use(api_user_info_search.router);

var api_user_group_member_delete = require('./user_group_member_delete.logic');
router.use(api_user_group_member_delete.router);

var api_user_check = require('./user_check.logic');
router.use(api_user_check.router);

 var api_user_info_by_session = require('./user_info_by_session.logic');
 router.use(api_user_info_by_session.router);

module.exports.router = router;