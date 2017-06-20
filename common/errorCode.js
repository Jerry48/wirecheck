// Error code helper 
// copyright@Catosoft.com reserved, 2015
/*
 * history:
 * 2015.05.25, created by Andy.zhou
 *  
 */
'use strict';
//request params error
module.exports.PARAM_INVALID = 1001;
module.exports.SIGN_INVALID  = 1002;
module.exports.EMPTY_RESULT = 1003;
module.exports.INTERNAL_ERR = 1004;
module.exports.RONGYUN_REQUST_FAIL = 1005;
module.exports.DATA_OVERFLOW  = 1006;
module.exports.INVALID_DATA  = 1007;
module.exports.INVALID_REQUEST = 1008;

//user error code
module.exports.USER_INVALID = 2001;
module.exports.USER_PASSWD_INVALID = 2002;
module.exports.USER_NO_USER = 2003;
module.exports.USER_INVALID_MOBILE = 2004;
module.exports.USER_INVALID_SMSCODE = 2005;
module.exports.USER_INVALID_LOGINSTATE = 2006;

module.exports.DATA_DUPLICATE = 3001;
module.exports.NO_DATA_MATCH = 3002;
module.exports.NO_SOCKET = 3003;

//DB operation error
module.exports.DB_ERROR = 4001;
module.exports.DB_NO_MATCH_DATA = 4002;
module.exports.DB_CONNECTION_FAIL = 4003;
module.exports.DB_PARAMS_INVALID = 4004;
module.exports.DB_VALUES_INVALID = 4005;
module.exports.DB_QUERY_FAIL = 4006;
module.exports.DB_NO_MORE_DATA  = 4007;

module.exports.SOCKET_INVALID_BUFFER = 5001;
module.exports.SERVER_ERROR = 5002;
module.exports.SERVER_FILE_NOTACCESSABLE = 5003;



