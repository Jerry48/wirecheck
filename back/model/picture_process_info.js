//  picture process info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'picture_process_info.model';
var table_name = 'tb_picture_process_info';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');


// Model operation
var date = new Date();
// reference model
var refModel = {
    id : 'process id',
    deviceId: 'device id',
    deviceName: 'deviceName',
    channelNo: 1,
    originalPicId: 'pic id',
    originalPicPath:'path',
    refPicId:'refPicId',
    refPicPath:'refPicPath',
    X1: 0,
    Y1: 0,
    endX1: 0,
    endY1: 0,
    X2: 0,
    Y2: 0,
    endX2: 0,
    endY2: 0,
    X3: 0,
    Y3: 0,
    endX3: 0,
    endY3: 0,
    sensitivity: 0,
    startTime: date, //process start time
    endTime: date, //process finish time
    status: 0, //proces status,0-not start, 1-processing, 2-done
    result: 0, //处理结果0-ok，1-warning, 2-fatal error
    comment: 'comment ',
    processedPicId: 'id',
    processedPicPath: 'path',
    processServer: 'server', 
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