// Data helper 
// copyright@Catosoft.com reserved, 2015
/*
 * history:
 * 2015.05.15, created by Andy.zhou
 *  
 */
 'use strict';
var crypto = require('crypto');
var salt = 'dkjlsfajka232349a0jsiofjal23421askwe';

function createSha1Data(inputs){
	if(!Array.isArray(inputs)){
		inputs = [inputs];
	}
	var buf = crypto.randomBytes(32);
	var randomStr = buf.toString('utf8');

	var hash = crypto.createHash('sha1');

	hash.update(salt);
	hash.update(randomStr);
	
	for (var i = 0; i < inputs.length; i++) {
		hash.update(inputs[i], 'binary');
	}

	var now = new Date();
	hash.update(now.toString());
	hash.update(salt);

	var sign = hash.digest('hex');
	return sign;
}

 function createUserId (options) {
 	var userId = options.mobile || createId();

 	return userId;
 }

function createUserTokenId(options) {
	var userId = options.userId;

	var tokenId = createSha1Data(userId);

	return tokenId;
}

function createOrderId (options) {
	var userId = options.userId;
	var sign = createSha1Data(userId);

	if(sign.length> 20){
		sign = sign.substr(0,20);
	}

	return sign;
}

function createOrderProcessId(options){
	var orderId = options.orderId;
	var userId = options.userId;
	var values  = [orderId, userId];
	
	var processId = createSha1Data(values);
	if(processId.length> 20){
		processId = processId.substr(0, 20);
	}

	return processId;
}

function createGroupId(options){
	var orderId = options.orderId;
	var chatRoomId = createSha1Data(orderId);
	if(chatRoomId.length> 20){
		chatRoomId = chatRoomId.substr(0, 20);
	}

	return chatRoomId;
}


function createGroupName(options){
	var description = options.description;

	if(description.length > 10){
		description = description.substr(0,10);
	}
	return description;
}

function createId(data ){
	var createId = data || 'createId';
	var id = createSha1Data(createId);
	if(id.length> 20){
		id = id.substr(0, 20);
	}

	return id;
}

function createSMSCode(){
	var buf = crypto.randomBytes(32);
	var smscode = '';
	var j = 0;
	for (var i = 0; i < buf.length && j< 6; j++) {
		var data =(buf[i++] ^ buf[i++] ^ buf[i++]^ buf[i++]);
		data = data % 10;
		smscode += data;
	};
	return smscode;
}

function createParentPath(date){
	var d = new Date();
	var parentpath = date.getFullYear()+"-";
	var month = date.getMonth()+1;
	if ( month< 10) {		
		parentpath += "0" + month;
	}else{
		parentpath += month;
	}

	return parentpath;
}

 module.exports.createUserId = createUserId;
 module.exports.createUserTokenId = createUserTokenId;
 module.exports.createOrderId = createOrderId;
 module.exports.createOrderProcessId = createOrderProcessId;
 module.exports.createGroupId = createGroupId;
 module.exports.createGroupName = createGroupName;
 module.exports.createId = createId;
 module.exports.createSMSCode = createSMSCode;
 module.exports.createParentPath = createParentPath;
