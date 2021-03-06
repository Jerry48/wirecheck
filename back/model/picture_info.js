//  picture info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.03, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'picture_info.model';
var table_name = 'tb_picture_info';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');


// Model operation

// reference model
var refModel = {
    pictureID : 'pic id',
    deviceID: 'deviceId',
    channelNo: 1,
    type: 0, //0-原始图片，1-处理后图片
    path: 'file path',//文件服务器相对路径
    pictureName: 'name',
    pictureCaptureDT: new Date(),
    pictureFileSize: 1,
    pictureSaveDT: new Date(),
    pictureUploadSpeed: 1,
    pictureAlarmFlag: 0, //0-no, 1-yes
    pictureWebURL: '',
    resolution: 1,
    width: 1,
    height: 1,
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