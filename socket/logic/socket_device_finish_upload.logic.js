// socket process device heart beat  
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.23, created by Andy.zhou
 * 2016.08.22, modified by Tarrega
 */
'use strict';  
var moduleName = 'socket_device_finish_upload.logic';
var URLPATH = '/v1/device/klFinishUpload';
var crcHelper = require('../logic/calCRC');


//system modules
var debug = require('debug')(moduleName);
var express = require('express');
var router = express.Router();
var db = require('../db');
var moment = require('moment');
var async = require('async');
var is = require('is_js');
var net = require('net');
var crypto = require('crypto');
var fs = require('fs');

//model
var deviceStatusModel = require('../../back/model/device_status_info');
var deviceModel = require('../../back/model/device_info');
var deviceProductModel = require('../../back/model/device_product_info');

//constans & helper
var wxConstants     = require('../../common/constants');
var errorCode       = require('../../common/errorCode');
var logic_helper    = require('../../common/logic_helper');
var dataHelper      = require('../../common/dataHelper');
var socketHelper    = require('./socket.logic');
var pictureHelper    = require('./picture_buffer.logic');
var pictureModel = require('../../back/model/picture_info');
var picProcessModel = require('../../back/model/picture_process_info');
var channelModel = require('../../back/model/channel_info');
var crcHelper = require('./calCRC');

function validate(data){  // 因为需要CRC校验，是否就不要验证了。有错误一定是故意为之。
    return true;    
}


function packageResponseData(inputData){
	if(!inputData){
		return {};
	}	
	
	var resData = {
        deviceID: inputData,
        timestamp: socketHelper.getCurrentSeconds(),
        data: wxConstants.SOCKET.ACK,
	};
	return resData;
}

function responseBuffer(err, packet){
    var pldata = processPayload(packet.data);
    var bstatus = pictureHelper.bufferStatus(packet.cmd_id);
    var neednum = bstatus.allnum-bstatus.getnum;
    debug('bstatus.allnum:'+bstatus.allnum);
    debug('bstatus.getnum:'+bstatus.getnum);
    debug('neednum:'+neednum);
    if (neednum<0){
        neednum = 0;
    }
    var buflen = 27+12+2*neednum;
    var buffer = new Buffer(buflen);
    buffer.fill(0);  // 填如0，以便转换成string的时候，正确识别字符串尾。
    buffer.writeInt16LE(23205, 0);  //23205
    buffer.writeInt16LE(12+2*neednum, 2);    // 有效数据长度
    //var strt = '06M00001800036603';
    var strt = packet.cmd_id;
    buffer.write(strt,4,17);
    buffer.writeUInt8(0x06,21);
    buffer.writeUInt8(0xCF,22);
    buffer.writeUInt8(0x01,23);
    buffer.writeUInt8(pldata.channel_no,24);
    buffer.writeUInt8(pldata.presetting_no,25);
    buffer.writeUInt16LE(neednum,26);
    for (var i = 0; i < neednum; i++) {
       buffer.writeUInt16LE(bstatus.getnum+i , 28 + i*2);
    }
    var crc = crcHelper.calCRC(buffer.slice(0,buflen-3));
    debug('crc:'+crc);
    buffer.writeUInt16LE(crc, buflen-3); 
    buffer.writeUInt8(0x96,buflen-1);
    return buffer;
}


function processPayload(dataBuf){
    if (Buffer.isBuffer(dataBuf)!=true){
        console.error('Failed to process the payload for device :' + deviceId);
    }
    var pldata={
        channel_no : dataBuf.readUInt8(0), 
        presetting_no : dataBuf.readUInt8(1),
        timestamp : dataBuf.readUInt32LE(2),
        reverse : dataBuf.slice(6, dataBuf.length),
    };
    debug('channel_no:' + pldata.channel_no);
    return pldata;   
}


function processRequest(packet, fn){
	//1. check the input data
	//if(!validate(param)){
	//	var msg = 'Invalid data';
	//	console.error(moduleName+': '+msg);
	//	return fn({code:errorCode.PARAM_INVALID, msg: msg});
	//}

	var deviceId = packet.cmd_id || '00000000000000000';
    var pldata = processPayload(packet.data);
	debug('finish upload, check if get all packets of picture:' + deviceId+ ',  chno:' + pldata.channel_no);

    //2. do the jobs in async way.
    async.waterfall([
        function(next){
            var fdinfo = pictureHelper.savePicture(deviceId);
            if (fdinfo){
                next(null,fdinfo);    
            }else{
                next('write picture error!', fdinfo);    
            }
        },
        function(fdinfo, next){
            var id = dataHelper.createId(fdinfo.filename);
            fdinfo.pictureID = id;
            fdinfo.channelNo = pldata.channel_no;
            var values = {
                pictureID: id,
                deviceID: fdinfo.deviceid,
                channelNo: pldata.channel_no,
                pictureName: fdinfo.filename,
                path: fdinfo.relapath+fdinfo.filename,
                pictureWebURL : fdinfo.relapath+fdinfo.filename,
                width: fdinfo.width,
                height: fdinfo.height,
                state: 0,
            };
            var query = {
                fields: values,
                values: [values],
            };
            pictureModel.create(query,function(err,rows){
                if(err){
                    next(err);
                }else{
                    next(null,fdinfo);
                }
            });
        },
        function(fdinfo,next){
            var select = {
                refPicId:"",
            };
            var match = {
                deviceId : fdinfo.deviceid,
                channelNo : fdinfo.channelNo
            };
            var query = {
                select : select,
                match : match
            };
            channelModel.lookup(query,function(err,rows){
                if(err)
                    next(err)
                else{
                    fdinfo.refPicId = rows[0].refPicId;
                    next(null,fdinfo);
                }
            });
        },
        function(fdinfo,next){
            var select = {
                path:"",
            };
            var match = {
                pictureID : fdinfo.refPicId,
            };
            var query = {
                select : select,
                match : match
            };
            pictureModel.lookup(query,function(err,rows){
                if(err)
                    next(err)
                else{
                    fdinfo.refPicPath = rows[0].path;
                    console.log(fdinfo);
                    next(null,fdinfo);
                }
            });
        },
        // function(fdinfo,next){
        //     if(fdinfo.channelNo == 1){
        //         var select = {
        //             refPicPath1:"",
        //             refPicId1:"",
        //         };
        //         var match = {deviceID : fdinfo.deviceid};
        //         var query = {
        //             select : select,
        //             match : match
        //         };
        //         deviceModel.lookup(query,function(err,rows){
        //             if(err)
        //                 next(err)
        //             else{
        //                 if(rows[0].refPicPath1 == null){
        //                     fdinfo.refPicPath = fdinfo.relapath+fdinfo.filename;
        //                     fdinfo.refPicId = fdinfo.pictureID;
        //                     next(null,fdinfo);
        //                 }else{
        //                     fdinfo.refPicPath = rows[0].refPicPath1;
        //                     fdinfo.refPicId = rows[0].refPicId1;
        //                     next(null,fdinfo);
        //                 }
        //             }
        //         });
        //     }else if(fdinfo.channelNo == 2){
        //         var select = {
        //             refPicPath2:"",
        //             refPicId2:"",
        //         };
        //         var match = {deviceID : fdinfo.deviceid};
        //         var query = {
        //             select : select,
        //             match : match
        //         };
        //         deviceModel.lookup(query,function(err,rows){
        //             if(err)
        //                 next(err)
        //             else{
        //                 if(rows[0].refPicPath2 == null){
        //                     fdinfo.refPicPath = fdinfo.relapath+fdinfo.filename;
        //                     fdinfo.refPicId = fdinfo.pictureID;
        //                     next(null,fdinfo);
        //                 }else{
        //                     fdinfo.refPicPath = rows[0].refPicPath2;
        //                     fdinfo.refPicId = rows[0].refPicId2;
        //                     next(null,fdinfo);
        //                 }
        //             }
        //         });
        //     }else{
        //         var select = {
        //             refPicPath3:"",
        //             refPicId3:"",
        //         };
        //         var match = {deviceID : fdinfo.deviceid};
        //         var query = {
        //             select : select,
        //             match : match
        //         };
        //         deviceModel.lookup(query,function(err,rows){
        //             if(err)
        //                 next(err)
        //             else{
        //                 if(rows[0].refPicPath3 == null){
        //                     fdinfo.refPicPath = fdinfo.relapath+fdinfo.filename;
        //                     fdinfo.refPicId = fdinfo.pictureID;
        //                     next(null,fdinfo);
        //                 }else{
        //                     fdinfo.refPicPath = rows[0].refPicPath3;
        //                     fdinfo.refPicId = rows[0].refPicId3;
        //                     next(null,fdinfo);
        //                 }
        //             }
        //         });
        //     }
        // },
        //     function(fdinfo,next){
        //         if(fdinfo.channelNo == 1){
        //             var update = {
        //                 refPicId1 : fdinfo.refPicId,
        //                 refPicPath1 : fdinfo.refPicPath
        //             };
        //             var match = {deviceID : fdinfo.deviceid};
        //             var query = {
        //                 update : update,
        //                 match : match
        //             };
        //             deviceModel.update(query,function(err,rows){
        //                 if(err)
        //                     next(err)
        //                 else
        //                     next(null,fdinfo);
        //             });
        //         }else if(fdinfo.channelNo == 2){
        //             var update = {
        //                 refPicId2 : fdinfo.refPicId,
        //                 refPicPath2 : fdinfo.refPicPath
        //             };
        //             var match = {deviceID : fdinfo.deviceid};
        //             var query = {
        //                 update : update,
        //                 match : match
        //             };
        //             deviceModel.update(query,function(err,rows){
        //                 if(err)
        //                     next(err)
        //                 else
        //                     next(null,fdinfo);
        //             });
        //         }else{
        //             var update = {
        //                 refPicId3 : fdinfo.refPicId,
        //                 refPicPath3 : fdinfo.refPicPath
        //             };
        //             var match = {deviceID : fdinfo.deviceid};
        //             var query = {
        //                 update : update,
        //                 match : match
        //             };
        //             deviceModel.update(query,function(err,rows){
        //                 if(err)
        //                     next(err)
        //                 else
        //                     next(null,fdinfo);
        //             });
        //         }
                
        //     },
            function(fdinfo, next){
                var id = dataHelper.createId(fdinfo.filename);
                var values = {
                    id: id,
                    deviceId: fdinfo.deviceid,
                    channelNo: fdinfo.channelNo,
                    originalPicId : fdinfo.pictureID,
                    originalPicPath: fdinfo.relapath+fdinfo.filename,
                    refPicId: fdinfo.refPicId,
                    refPicPath: fdinfo.refPicPath,
                    status: 0,
                    state: 0,
                };
                var query = {
                    fields: values,
                    values: [values],
                };
                picProcessModel.create(query, function(err,rows){
                    if(err){next(err);}else{
                        next(null,fdinfo);
                    }
                });
            },
            function(fdinfo, next){
                console.log('asdfasdf');
                var match = {
                    deviceId: fdinfo.deviceid,
                    channelNo: fdinfo.channelNo,
                    state: 0,
                }
                var update = {
                    refPicId: fdinfo.refPicId,
                    refPicPath: fdinfo.refPicPath,
                };
                var query = {
                    match: match,
                    update: update,
                };
                channelModel.update(query, function(err,rows){
                    if(err){next(err);}else{
                        next(null,fdinfo);
                    }
                });
            },
            function(fdinfo, next){
                var match = {
                    deviceId: fdinfo.deviceid,
                    channelNo: fdinfo.channelNo,
                }
                var select = {
                    X1: 0,
                    Y1: 0,
                    endX1: 0,
                    endY1: 0,
                    X2: 0,
                    Y2: 0,
                    endX2: 0,
                    endY2: 0,
                    X3: 0,
                    Y3: 0,
                    endX3: 0,
                    endY3: 0,
                };
                var query = {
                    match: match,
                    select: select,
                };
                channelModel.lookup(query, function(err,rows){
                    if(err){next(err);}else{
                        var roi = rows[0];
                        var tmp = {
                            roi: roi,
                            fdinfo: fdinfo,
                        }
                        next(null,tmp);
                    }
                });
            },
            function(tmp, next){
                var fdinfo = tmp.fdinfo;
                var roi = tmp.roi;
                var match = {
                    deviceId: fdinfo.deviceid,
                    channelNo: fdinfo.channelNo,
                    status:0,
                }
                var update = {
                    X1: roi.X1,
                    Y1: roi.Y1,
                    endX1: roi.endX1,
                    endY1: roi.endY1,
                    X2: roi.X2,
                    Y2: roi.Y2,
                    endX2: roi.endX2,
                    endY2: roi.endY2,
                    X2: roi.X2,
                    Y2: roi.Y2,
                    endX2: roi.endX2,
                    endY2: roi.endY2,
                    X3: roi.X3,
                    Y3: roi.Y3,
                    endX3: roi.endX3,
                    endY3: roi.endY3,
                };
                var query = {
                    match: match,
                    update: update,
                };
                picProcessModel.update(query, function(err,rows){
                    if(err){next(err);}else{
                        var roi = rows[0];
                        var tmp = {
                            roi: roi,
                            fdinfo: fdinfo,
                        }
                        next(null,tmp);
                    }
                });
            }
        ], 
        function(err, results){
        if (err) {
    		console.error('Failed to save picuture buffer and update db for device:' + deviceId);
    	}else{
    		debug('Success save picture buffer and update db for device:' + deviceId);
    	}
        var resbuf = responseBuffer(err, packet);
        fn(err,resbuf);  // callback function to send the results.
    });	
}

function processPacket(packet, fn){
	debug('in upload picture finish, packet for device: ', packet.cmd_id);
	processRequest(packet, fn);
}

//post interface
router.post(URLPATH, function (req, res, next){
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    debug('req.body:%j', req.body);

    var param = req.body;

    logic_helper.responseHttp({
    	res: res,
    	req: req,
    	next: next,
    	moduleName: moduleName,
    	processRequest: processRequest,
    	debug : debug,
    	param: param,    	
    });
});

//get interface for mocha testing
function getCallback(req, res, next){
	debug('req.headers:%j', req.headers);
    debug('req.cookies:%j', req.cookies);
    debug('req.session:%j', req.session);
    //debug('req.body:%j', req.body);

    var param = req.query;
    debug(moduleName+ 'query data is: %j ', param);

    logic_helper.responseHttp({
    	res: res,
    	req: req,
    	next: next,
    	moduleName: moduleName,
    	processRequest: processRequest,
    	debug : debug,
    	param: param,    	
    });
}

router.get(URLPATH, getCallback);

module.exports.router = router;
module.exports.processPacket = processPacket;