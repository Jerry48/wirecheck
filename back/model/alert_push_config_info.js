//  alert push config info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'alert_push_config_info.model';
var table_name = 'tb_alert_push_config_info';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');


// Model operation

// reference model
var refModel = {
    id : 'record id',
    deviceId: '', //告警信息来源设备id
    alertType: 1, //0-设备工况告警，1-图片告警信息
    idType: 0, //0-用户，1-用户组
    targetId: '', //目标id(用户id 或者 用户组id)
    targetType: 0, //0-微信，1-手机，
    createTime: new Date(), //
    updateTime: new Date(),
    state: 0,
};

var dbModel = new DBModel({
    model_name: model_name,
    table_name: table_name,
    refModel: refModel,
    debug: debug,
});


/// lookup 
/// notes: query include match and select two part
/// - match used to lookup, 
/// - select for filter fields
function lookup(query, fn) {
    dbModel.lookup(query, fn);
}

/// create record
function create(query, fn) {
    dbModel.create(query, fn);
}

/// update record
function update(query, fn) {
    dbModel.update(query, fn);
}

/// remove record
function remove(query, fn) {
    dbModel.remove(query, fn);
}


//count record
function count(query, fn){
    dbModel.count(query, fn);
}

function query(sqlStr, fn){
    dbModel.query(sqlStr, fn);
}

module.exports.create = create;
module.exports.lookup = lookup;
module.exports.update = update;
module.exports.remove = remove;
module.exports.count  = count;
module.exports.query  = query;
module.exports.dataModel = refModel;
module.exports.tableName = table_name;