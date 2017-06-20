//  device info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'device_info.model';
var table_name = 'tb_device_info';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');


// Model operation
var date = new Date();

// reference model
var refModel = {
    deviceID : 'device id',
    name: 'device name',
    mac: 'tower mac',
    nickName: 'tower nickName',
    parentId: 'line id',
    lineName:'lineName',
    lineId:'lineId',
    area: 'area',
    danger: 'danger',
    channelNo1: 1,
    channelNo2: 0,
    channelNo3: 0,
    channel1Name: 'channel1Name',
    channel2Name: 'channel2Name',
    channel3Name: 'channen3Name',
    ip: 'tower ip',
    comment: 'line comment',
    latitude: 1.0,
    longitude: 1.0,
    beatInterval: 1, //minutes
    photoInterval: 1,//minutes
    batteryVoltageLow: 1,
    chargeVoltageLow: 1,
    temperatureLow: 1,
    batteryVoltageHigh:1,
    chargeVoltageHigh:1,
    temperatureHigh:1,
    disableAlert:0, //是否撤防，0-no, 1-yes
    standby: 1,//0,1,2,3
    deviceWorkBeginTime: date, 
    deviceWorkEndTime: date,
    resolution:1,//分辨率
    capturePeriod:1,
    photoSize: 1,
    videoTime: 1, //装置每天最多拍摄短视频次数
    videoLength: 1,
    deviceMemory: 1,
    devicePortIn: 1,
    devicePortOut: 1,
    createTime: date, //
    updateTime: date,
    version: 'version',
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