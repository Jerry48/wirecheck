//  Logic helper
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */

'use strict';


function notifyAlert(param, fn) {
	// body...
	fn(null);
}

function notifyPush(param, fn){
	fn(null);
}

 module.exports.notifyAlert = notifyAlert;
 module.exports.notifyPush = notifyPush;
