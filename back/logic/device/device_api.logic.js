//  device Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.08, created by Andy.zhou
 *  
 */
var express = require('express');
var router = express.Router();

var api_device_create = require('./device_create.logic');
router.use(api_device_create.router);

var api_device_delete = require('./device_delete.logic');
router.use(api_device_delete.router);

var api_device_details = require('./device_details.logic');
router.use(api_device_details.router);

var api_device_edit = require('./device_edit.logic');
router.use(api_device_edit.router);

var api_device_group_create = require('./device_group_create.logic');
router.use(api_device_group_create.router);

var api_device_group_delete = require('./device_group_delete.logic');
router.use(api_device_group_delete.router);

var api_device_group_edit = require('./device_group_edit.logic');
router.use(api_device_group_edit.router);

var api_device_group_list_members = require('./device_group_list_members.logic');
router.use(api_device_group_list_members.router);

var api_device_group_search = require('./device_group_search.logic');
router.use(api_device_group_search.router);

var api_device_group_set_members = require('./device_group_set_members.logic');
router.use(api_device_group_set_members.router);

var api_device_group_delete_member = require('./device_group_delete_member.logic');
router.use(api_device_group_delete_member.router);

var api_device_list_all_groups = require('./device_group_list_all.logic');
router.use(api_device_list_all_groups.router);

var api_device_list_group = require('./device_group_list_group.logic');
router.use(api_device_list_group.router);

var api_device_level_create = require('./device_level_create.logic');
router.use(api_device_level_create.router);

var api_device_level_delete = require('./device_level_delete.logic');
router.use(api_device_level_delete.router);

var api_device_level_edit = require('./device_level_edit.logic');
router.use(api_device_level_edit.router);

var api_device_level_list_child = require('./device_level_list_child.logic');
router.use(api_device_level_list_child.router);

var api_device_level_list_root = require('./device_level_list_root.logic');
router.use(api_device_level_list_root.router);

var api_device_list = require('./device_list.logic');
router.use(api_device_list.router);

var api_device_list_tags = require('./device_list_tags.logic');
router.use(api_device_list_tags.router);

var api_device_tag_create = require('./device_tag_create.logic');
router.use(api_device_tag_create.router);

var api_device_tag_remove = require('./device_tag_remove.logic');
router.use(api_device_tag_remove.router);

var api_device_tag_search = require('./device_tag_search.logic');
router.use(api_device_tag_search.router);


var api_device_view_status = require('./device_view_status.logic');
router.use(api_device_view_status.router);

var api_device_list_users = require('./device_list_users.logic');
router.use(api_device_list_users.router);

var api_device_roi_set = require('./device_roi_set.logic');
router.use(api_device_roi_set.router);

var api_device_roi_list = require('./device_roi_list.logic');
router.use(api_device_roi_list.router);

var api_device_info_search = require('./device_info_search.logic');
router.use(api_device_info_search.router);

var api_device_tree = require('./device_tree.logic');
router.use(api_device_tree.router);

var api_device_tree2 = require('./device_tree2.logic');
router.use(api_device_tree2.router);

var api_device_tree3 = require('./device_tree3.logic');
router.use(api_device_tree3.router);

var api_device_tree4 = require('./device_tree4.logic');
router.use(api_device_tree4.router);

var api_device_tree_priv = require('./device_tree_priv.logic');
router.use(api_device_tree_priv.router);

var api_device_tree_channel_priv = require('./device_tree_channel_priv.logic');
router.use(api_device_tree_channel_priv.router);

var api_device_tree_channel_multi = require('./device_tree_channel_multi.logic');
router.use(api_device_tree_channel_multi.router);

var api_device_tree_multi = require('./device_tree_multi.logic');
router.use(api_device_tree_multi.router);

var api_device_tree_line = require('./device_tree_line.logic');
router.use(api_device_tree_line.router);

var api_device_tree_line_multi = require('./device_tree_line_multi.logic');
router.use(api_device_tree_line_multi.router);

var api_device_find_parents = require('./device_find_parents.logic');
router.use(api_device_find_parents.router);

var api_device_info_list = require('./device_info_list.logic');
router.use(api_device_info_list.router);

var api_device_danger_info = require('./device_danger_info.logic');
router.use(api_device_danger_info.router);

var api_device_danger_edit = require('./device_danger_edit.logic');
router.use(api_device_danger_edit.router);

var api_device_line_info = require('./device_line_info.logic');
router.use(api_device_line_info.router);

var api_device_line_create = require('./device_line_create.logic');
router.use(api_device_line_create.router);

var api_device_line_edit = require('./device_line_edit.logic');
router.use(api_device_line_edit.router);

var api_device_line_list = require('./device_line_list.logic');
router.use(api_device_line_list.router);

var api_device_line_delete = require('./device_line_delete.logic');
router.use(api_device_line_delete.router);

var api_device_settings = require('./device_settings.logic');
router.use(api_device_settings.router);

var api_device_temperature_chart = require('./device_temperature_chart.logic');
router.use(api_device_temperature_chart.router);

var api_device_set_refarea = require('./device_set_refarea.logic');
router.use(api_device_set_refarea.router);

var api_device_refpic_info = require('./device_refpic_info.logic');
router.use(api_device_refpic_info.router);

var api_device_cmd = require('./device_cmd.logic');
router.use(api_device_cmd.router);

var api_device_find_update_files = require('./device_find_update_files.logic');
router.use(api_device_find_update_files.router);

var api_device_delete_update_files = require('./device_delete_update_files.logic');
router.use(api_device_delete_update_files.router);

var api_port_check = require('./port_check.logic');
router.use(api_port_check.router);

module.exports.router = router;