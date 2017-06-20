// Data helper 
// copyright@Catosoft.com reserved, 2015
/*
 * history:
 * 2015.05.15, created by Andy.zhou
 *  
 */
'use strict';
var moduleName = 'cryptoHelper.utils';
var debug = require('debug')(moduleName);

var crypto = require('crypto');

var wxConstants = require('./constants');
var errorCode = require('./errorCode');

function sortKeys(keys)
{
	var length = keys.length;
	for (var i = 0; i < length; i++) {
		var minkey = keys[i];
		var minindex = i;
		for (var j = i+1; j < length; j++) {
			if (minkey.localeCompare(keys[j]) > 0) {
				minkey = keys[j];
				minindex = j;
			}
		}
		if (minindex!=i) {
			keys[minindex] = keys[i];
			keys[i] = minkey; 
		}
	}
	return keys;
}

function createHashMacDigest(appKey, param) 
{
	debug('Calling createHashMacDigest');

	if (!param.data) {
		var msg = 'Err: The input data is empty!';
		console.error(moduleName + msg);
		fn({
			code: errorCode.PARAM_INVALID,
			msg: msg,
		});
		return ;
	}

	var keys = param.keys;
	if (!param.keys) {
		keys = Object.keys(param.data);
		keys = sortKeys(keys);
	}

	
	var hash = crypto.createHmac('sha256', appKey);

	var data = param.data;
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = data[key];
		hash.update(key+value, 'utf8');
	}


	return hash.digest('hex');
}

function verifyHashMacDigest(appKey, param)
{
	debug('Calling verifyHashMacDigest');

	if (!param.data) {
		var msg = 'Err: The input data is empty!';
		console.error(moduleName + msg);
		fn({
			code: errorCode.PARAM_INVALID,
			msg: msg,
		});
		return ;
	}

	var keys = param.keys;
	if (!param.keys) {
		keys = Object.keys(param.data);
		keys = sortKeys(keys);
	}
	
	var hash = crypto.createHmac('sha256', appKey);

	var data = param.data;
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = data[key];
		hash.update(key+value, 'utf8');
	}

	var digest = param.digest ||'';
	return (digest.localeCompare(hash.digest('hex')) == 0 )? true: false;
}

function createHashDigest(param)
{
	debug('Calling createHashDigest');

	if (!param.data) {
		var msg = 'Err: The input data is empty!';
		console.error(moduleName + msg);
		fn({
			code: errorCode.PARAM_INVALID,
			msg: msg,
		});
		return ;
	}

	var keys = param.keys;
	if (!param.keys) {
		keys = Object.keys(param.data);
		keys = sortKeys(keys);
	}

	var hash = crypto.createHash('sha256');
	if (param.appKey) {
		hash.update(appKey);
	}
	var data = param.data;
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = data[key];
		hash.update(key+value, 'utf8');
	}
	if (param.appKey) {
		hash.update(param.appKey);
	}

	return hash.digest('hex');
}

function verifyHashDigest(param)
{
	debug('Calling verifyHashDigest');

	if (!param.data) {
		var msg = 'Err: The input data is empty!';
		console.error(moduleName + msg);
		fn({
			code: errorCode.PARAM_INVALID,
			msg: msg,
		});
		return ;
	}

	var keys = param.keys;
	if (!param.keys) {
		keys = Object.keys(param.data);
		keys = sortKeys(keys);
	}
	
	var hash = crypto.createHash('sha256');
	if (param.appKey) {
		hash.update(appKey);
	}
	var data = param.data;
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = data[key];
		hash.update(key+value, 'utf8');
	}
	if (param.appKey) {
		hash.update(param.appKey);
	}

	var digest = param.digest || '';

	return (digest.localeCompare(hash.digest('hex')) == 0 )? true: false;
}

module.exports.createHashMacDigest = createHashMacDigest;
module.exports.verifyHashMacDigest = verifyHashMacDigest;
module.exports.createHashDigest = createHashDigest;
module.exports.verifyHashDigest = verifyHashDigest;
