//  device info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.10, created by Andy.zhou
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
    id : 'device roi id',
    deviceId: 'device id',
    roiPx: 1, 
    roiPy: 1,
    roiWidth: 1920,
    roiHeight: 1080,
    priority: 0, //0，1,2数字越大，优先级越大
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