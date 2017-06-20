//constant variable
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.29, created by Andy.zhou
 *  
 */
'use strict';
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 6188;

var wxConstants={
	SERVER:{
		FILESERVER: "http://120.26.101.146:"+port+'/',
		ROOT:'./fileserver/files/',
		PORTRAITROOT:'./fileserver/files/portrait/',
		PICSROOT: './fileserver/files/pics/',
	},
	LOGINSTATE:{
		LOGIN: 1,
		LOGOUT: 0,
	},
	DEVICELEVEL: 10,
	USERTYPE:{
		GENERAL: 0,
		ADMIN: 1,
	},
	USERGROUPTYPE:{
		USER: 0,
		GROUP:1,
	},
	USERDEVICEPRIVILEGE:{
		NORIGHT:0,
		ACCESSRIGHT:1,
	},
	GROUPTYPE:{
		USER: 0,
		OTHER:1,
	},
	DEVICEGROUPTYPE:{
		GENERAL:0,
		GROUPPATROL:1, //patrol
		TAG:2,
		MESSAGEPUSH:3,
		SELFPATROL: 4,
	},
	DEVICEDEFENDSET:{
		DISABLENO: 0,
		DISABLEYES:1,
	},
	LATITUDE:{
		LEFTDEFAULT: 0,
		RIGHTDEFAULT:180,
	},
	LONGITUDE:{
		LOWDEFAULT:0,
		HIGHDEFAULT:90,
	},
	PICTYPE:{
		ORIGINAL: 0,
		PROCESSED: 1,
		REFERENCE: 2,
	},
	PICPROCESSSTATUS:{
		NOTSTART:0,
		PROCESSING:1,
		DONE:2,
	},
	ALERTTYPE:{
		WORKSTATUS: 0,
		PICALERT: 1,
	},
	ALERTPROCESSSTATE:{
		NOTPUSH: 0,
		PUSH: 1,
		CLEARALERT: 2,
		CONFIRMRIGHT: 3,
		CONFIRMFAKE: 4,
	},
	SOCKET:{
		BLOCKSIZE: 8,
		HEARTBEAT: 0xAA,
		ACK:0x55,
		CIPHERPADDING: 0xCC,
		TIMEOUT: 10*60*1000, //10minute
		HEADLEN: 20,
		TYPEOFFSET: 0,
		SEQUENCEOFFSET: 4,
		SUBPACKETNUMSOFFSET: 8,
		SUBSEQOFFSET: 12,
		LENGTHOFFSET: 16,
		TIMESTAMPOFFSET: 20,
		JSONDATAOFFSET: 20,
	},
	SOCKETTYPE:{
		HEARTBEAT: 		0x00000000,
		DEVICEDATA: 	0x00010000,
		DEVICEDATAINIT:  0x00010001,
		DEVICEDATASTATUS:  0x00010002,
		DEVICEDATAPICTURE:  0x00010003,
		RAWPICTURE: 		0x00020000,
		DEVICESET: 		0x00040000,
		DEVICECOMMAND: 	0x00050000,
		DEVICECOMMANDPHOTO: 0x00050001,

	},
	THUMBNAIL:{
		WIDTH: 300,
		HEIGHT:200,
	},
 };


module.exports = wxConstants;

