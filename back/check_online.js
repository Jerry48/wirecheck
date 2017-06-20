// to check devices on/off line
/*
 * history:
 * 2017.02.07, created by Jerry
 *  
 */
 
'use strict';  

var express = require('express');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var is = require('is_js');

var deviceStatusModel = require('./model/device_status_info');

function main(){
    var data = [];
    var online = [];
    var offline = [];
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
    async.waterfall([
        function(next){
            var sqlstr = 'select id, heartBeatTime from '+deviceStatusModel.tableName+' ;';
            var query = {
                sqlstr:sqlstr,
            };
            deviceStatusModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                    next(err);
                }else{
                    for(var i=0;i<rows.length;i++){
                        data[i] = {
                            id: rows[i].id,
                            heartBeatTime: rows[i].heartBeatTime,
                            status: 0,
                        }
                        var t1 = data[i].heartBeatTime.getTime(); 
                        var t2 = Date.now();
                        var interval = t2-t1;
                        if(interval>15*60*1000){//5分钟内无心跳认定离线(毫秒)
                            data[i].status=0;
                            offline.push(data[i]);
                        }else{
                            data[i].status=1;
                            online.push(data[i]);
                        }
                    }
                    var tmp = {
                        online: online,
                        offline: offline,
                    }
                    next(null,tmp);
                }
            });
        },
        function(tmp,next){
            var online = tmp.online;
            var offline = tmp.offline;
            var onIds = [];
            var offIds = [];
            for(var i=0;i<online.length;i++){
                onIds.push(online[i].id);
            }
            for(var i=0;i<offline.length;i++){
                offIds.push(offline[i].id);
            }

            var sqlstr = 'update '+deviceStatusModel.tableName+' set status=1';
            sqlstr +=' where id in ("';
            sqlstr += onIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };

            console.log(sqlstr);
            deviceStatusModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                }else{
                    console.log('success!');
                }
            });

            var sqlstr = 'update '+deviceStatusModel.tableName+' set status=0';
            sqlstr +=' where id in ("';
            sqlstr += offIds.join('","');
            sqlstr +='");';
            var query = {
                sqlstr: sqlstr,
            };

            deviceStatusModel.query(query, function(err, rows){
                if (err) {
                    var msg = err.msg || err;
                }else{
                    console.log('success!');
                }
            });

            next(null);
        },
    ],
    function(err){
        if (err) {
            console.error('Failed to find query map by devices!');
        }else{
            console.error('success to find query map by devices!');
        }
    });   
}

main();
