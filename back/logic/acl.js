// acl control api
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.05.03, created by Andy.zhou
 *  
 */

'use strict';  
var moduleName = 'acl.logic';
var URLPATH = '/v1/*';

var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../../common/db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var userModel = require('../model/user_info');
var roleModel = require('../model/role_info');

var wxConstants = require('../../common/constants');
var errorCode = require('../../common/errorCode');
var dataHelper = require('../../common/dataHelper');

//check whether user login
function checkLogin(req) {	
	return true;
 	if (!(req.session && req.session.auth && req.session.userInfo)) {
 		
 		return false;
 	}

 	return true;
}

function checkRole(acls, fn) {
	var rolename = acls.rolename;
	var method =  acls.method;
	var resource = acls.resource;
	var param = acls.param || {};

	var match = {
		name: rolename,
	};
	var select = {
		acl: '1',
	};
	var query = {
		match: match,
		select:select,
	};
	roleModel.lookup(query, function (err, rows) {
		if (err) {
			var msg = 'Err: Invalid role:'+rolename;
			console.error(moduleName + msg);
			fn({
				code: errorCode.INVALID_REQUEST,
				msg: msg,
			});
		}else {
			debug('roles:%j', rows);
			var row = rows && rows[0];
			if (!(row && row.acl)) {
				var msg = 'Err: Invalid role:'+rolename;
				console.error(moduleName + msg);
				return fn({
					code: errorCode.INVALID_REQUEST,
					msg: msg,
				});								
			}

			row.name = rolename;
			try{
				debug('acl value:%j', row.acl);
				var acl = JSON.parse(row.acl);
				if (!Array.isArray(acl)) {
					acl = [acl];
				}
				row.acl = acl;
				var pass = false;
				for (var i = 0; i < acl.length; i++) {
					var v = acl[i];
					if (v.resource && ((v.resource===resource) || (v.resource.toLowerCase()=== resource.toLowerCase()))
						&& v.method && ((v.method===method) || (v.method.toLowerCase()===v.method.toLowerCase()))){
					  if ('param' in v) {
 						var pacl = JSON.parse(v.param);
					  }else {
					  	if ('allow' in v) {
					  		pass = v.allow;
					  	}else if('deny' in v){
					  		pass = !v.deny;
					  	}
					  	break;
					  }
				   }else if (v.resource) {
				   		var patt = new RegExp(v.resource, 'i');
				   		if (patt.test(resource) &&
				   			v.method && ((v.method === method) || (v.method.toLowerCase()===method.toLowerCase()))) {
				   			if ('allow' in v) {
				   				pass = v.allow;
				   			}else if ('deny' in v) {
				   				pass = !v.deny;
				   			}
				   			break;
				   		}
				   }
				}
				if (pass) {
					fn(null, row);
				}else {
					var msg = 'Err: Invalid role:'+rolename;
					console.error(moduleName + msg);
					return fn({
						code: errorCode.INVALID_REQUEST,
						msg: msg,
					});
				}
			}catch(e){
				console.error('acl parse failed:'+e);
				var msg = 'Err: Invalid role:'+rolename;
				fn({
					code: errorCode.INVALID_REQUEST,
					msg: msg,
				});
			}			
		}
	});
}


module.exports.checkLogin = checkLogin;
module.exports.checkRole= checkRole;

router.use(URLPATH, function(req, res, next){
	debug('req.headers:%j', req.headers);
	debug('req.cookies:%j', req.cookies);
	debug('req.session:%j', req.session);

	var json = {};
	var param = req.method==='GET' ? 
		req.query : (req.body && req.body.param) || req.body;
	debug('acl check on param:%j', param);

	if (!checkLogin(req)) {
	 	var url = req.originalUrl;
    	if (url != '/v1/user/login') {
       		console.error('User not login');
       		debug('url:'+url);
			json.code = 403; //0-success, 1-fail, 2-timeout, 3-need login
		 	json.message = 'User need login';
		 	json.result = {};
		 	res.json(json);
    	}else {
    		next('route');
    	}	 	
	}else {
		next('route');		
	}
});

module.exports.router = router;