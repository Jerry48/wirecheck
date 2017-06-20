//  user info data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.27, created by Andy.zhou
 *  
 */
'use strict';
var model_name = 'user_info.model';
var table_name = 'tb_user_info';

var debug = require('debug')(model_name);
var DBModel = require('./DBModel');


// Model operation

// reference model
var refModel = {
    userId : 'userid',
    userName: 'username',
    password: 'password',
    portrait: 'portrait',
    gender: 0, //0-male, 1-female, 2-unknown
    mobile: '13621985446',
    name: 'name',
    department: 'department',
    //privileges followed
    usrEdit: 0,
    pwdEdit: 0,
    deviceOp: 0,
    channelSet: 0,
    wechatPush: 0,
    createGroup: 0,
    //end of privileges
    userType: 0, //0-general, 1-merchant
    loginTime: new Date(),//'2014-12-20 09:14:08',
    loginState: 0, //0-login, 1-logout
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