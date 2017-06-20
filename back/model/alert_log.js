//  alert log info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'alert_log.model';
var table_name = 'tb_alert_log';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');

// Model operation

var date = new Date();
// reference model
var refModel = {
    alarmed : 'log id',
    heartId: 'heart beat log id',
    deviceId: 'tower id',
    deviceName: 'tower name',
    alarmType: 1,
    batteryVoltage: 1,
    chargeVoltage: 2,
    temperature: 3,
    alarmText: '',
    processStatus: 1, //0-未推送, 1-已推送, 2-已处理取消，3-已处理确认
    alarmHappenTime: date,
    alarmCancelTime: date,
    confirmTime: date,
    cancelFlag: 1, //0-no, 1-yes
    confirmFlag: 1, //0-no, 1-yes
    clearlUserId:'',
    confirmUserId: '',
    pictureID: '',
    picPath: '',
    createTime: date, //
    updateTime: date,
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