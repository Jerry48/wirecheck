//  wechat user info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.02, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'wechat_info.model';
var table_name = 'tb_wechat_info';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');


// Model operation

// reference model
var refModel = {
    userId : 'user id',
    accessToken : 'access_token',
    refreshToken : 'refresh_token',
    expiresIn : 0,
    openid : 'openid',
    scope : 'scope',
    unionid : 'unionid',
    nickname: 'nickname',
    subscribe: 0, //0-未订阅，1-订阅
    sex: 1, //用户性别1男，2-女，0未知
    language: 'zh_cn',
    city: 'shanghai',
    province: 'shanghai',
    country: 'china',
    headimageurl: 'http://',
    subscribeTime: 1211,
    sessionId: '',
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