//  device info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'device_product_info.model';
var table_name = 'tb_device_product_info';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');


// Model operation

// reference model
var refModel = {
    id : 'device id',
    deviceIndex: 1,
    deviceID: 'GUID',
    deviceName: '',
    deviceType: 0, //0：图像; 1：视频
    deviceManufactorName: '',
    deviceModel: '',
    deviceProductionDate: new Date(),
    deviceInstallDate: new Date(),
    deviceOrientation: '',
    deviceTele: '',
    deviceMeid:'',
    deviceNetType: 0, //1 移动；2 联通；3 电信
    deviceRunState: 0, //0 未运行；2 已运行；3 已拆除
    deviceShieldState: 1, //1:未屏蔽状态; 2:屏蔽状态
    deviceDangerID:1, //1 线下施工；2 建筑工地；3 塔吊作业；4 线下堆物；5 树木生长; 6 野火防范 ; 7 杆塔本体；5 鸟类活动； 9 其他类型
    companyName: '',
    lineName: '',
    towerName:'',
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