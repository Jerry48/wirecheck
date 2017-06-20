//  alert Logic apis
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.25, created by Andy.zhou
 *  
 */

var express = require('express');
var router = express.Router();

var api_alert_list = require('../../../wechat/logic/alert_list.logic');
router.use(api_alert_list.router);

var api_alert_view_details = require('../../../wechat/logic/alert_view_detail.logic');
router.use(api_alert_view_details.router);

var api_alert_process = require('../../../wechat/logic/alert_process.logic');
router.use(api_alert_process.router);

module.exports.router = router;