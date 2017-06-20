// Data helper 
// copyright@Catosoft.com reserved, 2015
/*
 * history:
 * 2015.05.15, created by Andy.zhou
 *  
 */
'use strict';
var moduleName = 'fileserverHelper.utils';
var debug = require('debug')(moduleName);

var crypto = require('crypto');
var fs = require('fs');
// var sharp = require('sharp');
//var sleep  = require('sleep');
// var easyimg = require('easyimage');
var images = require('images');
var gulp = require('gulp');
var imageResize = require('gulp-image-resize');


var gm = require('gm');

var wxConstants = require('./constants');
var errorCode = require('./errorCode');
var config = require('../config.json');
var fileServerPath = config.picpath;

var pictureServer = 'http://'+config.domain+":9090/";

function fileExist(path){
	try{
		fs.accessSync(path, fs.F_OK| fs.R_OK);
	}catch(e){
		return false;
	}
	return true;
}

function getFileServerUrl(param) {
	debug('calling getFileServerUrl!');

	var path =  param.path || param;
	var filePath = fileServerPath + path;
	var url = pictureServer + path;
	if (!fileExist(filePath)) {
		console.error('File is not exist!'+path);	
	}
	
	return url;
}

function getFileServerThumbnailUrl(param){
	debug('calling getFileServerThumbnailUrl');

	var path =  param.path || param;
	var filePath = fileServerPath + path;
	var tmp = [];
	tmp = path.split("/");
	var repath = tmp[0]+'/'+tmp[1]+'/ss/'+tmp[2];

	var thumbnailPath = fileServerPath + repath;
	var url = pictureServer + repath;

	if (!fileExist(thumbnailPath)) {
		debug('Try to create the thumbnail image!');
		/*
		sharp(filePath).resize(
			wxConstants.THUMBNAIL.WIDTH, null).toFile(
			thumbnailPath, function(err){
				if (err) {
					var msg = 'Failed to create thumbnail image:'+thumbnailPath;
					console.error(moduleName + msg);
				}else {
					debug('Success to create thumbnail file:'+thumbnailPath);
				}
		});*/
		debug('thumbnailPath:'+thumbnailPath);
		// easyimg.resize({
		// 	src: filePath,
		// 	width: wxConstants.THUMBNAIL.WIDTH,
		// 	height: wxConstants.THUMBNAIL.HEIGHT,
		// 	dst: thumbnailPath,
		// },function(err, stdout, stderr){
		// 	if (err) throw err;
		// });
		var img = images(filePath);
		var width = img.width();
		var height = img.height();
		img                                                
		  .width(0.3 * width)
		  .height(0.3 * height)                           
		  .save(thumbnailPath);

		// gulp.src(filePath)
		// .pipe(imageResize({width:wxConstants.THUMBNAIL.WIDTH ,height: wxConstants.THUMBNAIL.HEIGHT}))
		// .pipe(gulp.dest(thumbnailPath));
		// gm(filePath).resize(wxConstants.THUMBNAIL.WIDTH, wxConstants.THUMBNAIL.HEIGHT).autoOrient().write(thumbnailPath, function(err){
		// 	if(err)
		// 		console.log(err);
		// });
		/*
		var times = 100;
		while(times--){
			if (fileExist(thumbnailPath)) {
				return url;
			}else{
				sleep.usleep(500000); //500ms
			}
		}*/
	}
	
	return url;
}

module.exports.getFileServerUrl = getFileServerUrl;
module.exports.getFileServerThumbnailUrl = getFileServerThumbnailUrl;