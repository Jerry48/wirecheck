// socket clients  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.22, created by Andy.zhou
 *  2016.08.24, modified by Tarrega
 */

'use strict';  
var moduleName = 'picture_buffer.logic';
//system modules
var debug = require('debug')(moduleName);
var fs = require('fs');
var moment = require("moment");
var images = require('image-size');
var config = require('../../config.json');

var bufdic = {};
var buflendic = {};
var picUploadDir = config.picpath;

function resetBuffer(deviceid){
	if (bufdic.hasOwnProperty(deviceid)){
		delete bufdic[deviceid];
		delete buflendic[deviceid];
	}
}

function ifGetAll(deviceid){
	if (bufdic.hasOwnProperty(deviceid)){
		var buflist = bufdic[deviceid];
		var pknum = buflendic[deviceid];
		if (pknum == buflist.length){
			return true;
		}
	}
	return false;
}

function addBuffer(deviceid, pknum, buffer){
	var buflist = null;
	if (bufdic.hasOwnProperty(deviceid)){
		buflist = bufdic[deviceid];
	}
	else{
		buflist = new Array();
		bufdic[deviceid] = buflist;
		buflendic[deviceid] = pknum;
	}
	buflist.push(buffer);
}

function bufferStatus(deviceid){
	var getnum = 0;
	var allnum = 0;
	if (bufdic.hasOwnProperty(deviceid)){
		getnum = bufdic[deviceid].length;
		allnum = buflendic[deviceid];
	}
	var status = {
		getnum : getnum,
		allnum : allnum,
	};
	return status;
}

function resetAll(){
	bufdic = {};
	buflendic = {};	
}

/* 图像buffer前4个字节为图像ID，每次传输自增张，需保证每张图片ID不重复。
后四个字节为该包数据在图像数据中的偏移量。
然后才是图像数据 */
function getFileSeqID(inbuf){
	var seqid = inbuf.readUInt32LE(0);
	return seqid;
}

function prepareFilename(deviceid){
	var now = moment();
	var timestr = now.format("YYYYMMDDHHmmss");
	var monthstr = now.format("YYYYMM");
	var relapath = deviceid+"/"+monthstr+"/";
	var fullpath1 = picUploadDir + deviceid;
	var fullpath = picUploadDir + relapath;
	var sspath = picUploadDir + relapath + "/";

	if (!fs.existsSync(picUploadDir)) {
		console.log('Error: the picture upload dir does not exist!');
        //fs.mkdirSync(fullpath);
    }

	if (!fs.existsSync(fullpath1)) {
		debug("creat path:"+fullpath1);
        fs.mkdirSync(fullpath1);
    }

    if (!fs.existsSync(fullpath)) {
		debug("creat path:"+fullpath);
        fs.mkdirSync(fullpath);
    }

    if (!fs.existsSync(sspath)) {
		debug("creat path:"+sspath);
        fs.mkdirSync(sspath);
    }

    var fdinfo = {
    	filename:deviceid+"_"+timestr+".jpg",
    	relapath: relapath,
    	deviceid: deviceid,
    	width: 1,
    	height: 1,
    };
    debug(fdinfo);
    return fdinfo;
}

function savePicture(deviceid, name){
	var fdinfo = null;
	if (ifGetAll(deviceid)){
		// do the saving.
		var buflist = bufdic[deviceid];
		if (buflist.length>0){
			//var seqid = getFileSeqID(buflist[0]);
			var fdinfo = prepareFilename(deviceid);
			var fd = fs.openSync( picUploadDir + fdinfo.relapath + fdinfo.filename, 'w');
			for(var i=0; i<buflist.length;i++){
				var databuf = buflist[i].slice(8,buflist[i].length);
				fs.writeSync(fd, databuf, 0 , databuf.length);
				debug('write buffer:'+i + ', buffer length:' + databuf.length);
			}
			fs.closeSync(fd);
			var width= images(picUploadDir + fdinfo.relapath + fdinfo.filename).width;
			var height= images(picUploadDir + fdinfo.relapath + fdinfo.filename).height;
			fdinfo.width = width;
			fdinfo.height = height;
		}
	}

	return fdinfo;
}

module.exports.resetBuffer = resetBuffer;
module.exports.addBuffer = addBuffer;
module.exports.savePicture = savePicture;
module.exports.ifGetAll = ifGetAll;
module.exports.bufferStatus = bufferStatus;