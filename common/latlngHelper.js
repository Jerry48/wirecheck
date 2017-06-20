// latlng helper 
// copyright@Catosoft.com reserved, 2015
/*
 * history:
 * 2015.05.15, created by Andy.zhou
 *  
 */
 'use strict';
var moduleName = 'latlngHelper.utils';
var debug = require('debug')(moduleName);

var math = require('mathjs');
var GeoPoint = require('geopoint');

var EARTH_RADIUS = 6371.004;//6371 km
//地球赤道半径（a）6378．140公里   
//地球极半径（b）6356．755公里
//地球平均半径R（3 a2b）6371.004公里 
//
//http://314858770.iteye.com/blog/939834
//http://www.cnblogs.com/cocowool/archive/2009/03/24/1420478.html

//distance unit is km
//latitude and longitude is degree
function getLatLngRange (point) {
	debug('calling getLatLngRange, point:%j', point);

	var geoPoint = new GeoPoint(point.latitude, point.longitude);
	var bounds = geoPoint.boundingCoordinates(point.distance, null, true);
	
	var range = {
		min_lat: bounds[0]._degLat,
		min_lng: bounds[0]._degLon,
		max_lat: bounds[1]._degLat,
		max_lng: bounds[1]._degLon,
	}
	debug('range:%j', range);

	return range;
}

function geoDistance(data1,data2){
	debug('geoDistance point1:%j', data1);	

	var point1 = new GeoPoint(data1.latitude, data1.longitude);
	
	debug('geoDistance point2:%j', data2);

	var point2 = new GeoPoint(data2.latitude, data2.longitude);

	return point1.distanceTo(point2, true) * 1000; //km to m
}

function Rad(d){
    return d * (Math.PI / 180.0);//经纬度转换成三角函数中度分表形式。
}

function getDistance(deglat1,deglng1,deglat2,deglng2){
    var lat1 = Rad(deglat1);
    var lng1 = Rad(deglng1);
    var lat2 = Rad(deglat2);
    var lng2 = Rad(deglng2);

   var s = Math.acos(
            Math.sin(lat1) * Math.sin(lat2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.cos(lng1 - lng2)) ;

   return s * 6371004; //km
}

module.exports.getLatLngRange = getLatLngRange;
module.exports.getDistance = getDistance;
module.exports.geoDistance = geoDistance;
module.exports.Rad = Rad;