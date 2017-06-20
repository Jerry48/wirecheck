// miniERP entry for device server
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.06.11, created by Andy.zhou
 *  
 */

var express = require('express');
var app = express();
var fs = require('fs');
var debug = require('debug')('socket.app');
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 6189;
var config = require('../config.json');

// Middlewares
var constantHelper = require('../common/constants');
var dataHelper = require('../common/dataHelper');

/// cookie
var cookieParser = require('cookie-parser');
app.use(cookieParser());

/// cookie session
//var cookieSession = require('cookie-session');
//app.use(cookieSession({
//	name: 'allpapapa',
//	keys: ['allpapapa150508', 'catosoft.com'],
//
//	// cookie option, '/' path, httponly, no secure
//	maxAge  : 7*24*3600*1000,        // one week expired
//	override: true,
//	path    : '/',                   // '/' path
//	///domain  : '.7walker.cn', // specific domain
//	httpOnly: false,                 // don't allow only http method
//	secure  : false                  // no secure
//}));

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var sqlOptions = {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.schema,
    useConnectionPooling: true,
};
var sessionStore = new MySQLStore(sqlOptions);

app.use(session({
  unset:'destroy',
  key: 'wirechek_session_cookie',
  secret: 'ccflab.?sjtu@123',
  store: sessionStore,
  cookie: {path:'/', secure:false, httpOnly:false, maxAge: 24*3600*1000,},
}));

/// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded());

/// morgan log
var morgan = require('morgan');
app.use(morgan('combined'));

// Login logic
//var login = require('./logic/login');
//app.use('/api/v1/logic/system', login.router);

// ACL logic
var acl = require('./acl');
//app.use(acl.router);

// Mount model API //////////////////////////////////////////////

///////////////////////////////////////////////////////


// Mount logic API ////////////////////////////////////
//user interfaces
var api_setdevice =  require('./logic/command_device_set_config.logic');
app.use(api_setdevice.router);

//dislaert info
var api_setphoto = require('./logic/command_device_set_photo_config.logic');
app.use(api_setphoto.router);

var api_resetdevice =  require('./logic/command_device_reset_device.logic');
app.use(api_resetdevice.router);

//dislaert info
var api_update = require('./logic/command_device_update_device.logic');
app.use(api_update.router);

app.use(express.static(__dirname + '/files'));


// SPA portal
app.use(function(req, res){
  debug('req.url'+req.originalUrl);
	console.log('req.session:%j', req.session);

	res.set('Content-Type', 'text/html');
	res.send('wire check socket, no view');
});


app.listen(port);
console.log('CCFLab SJTU http server listening on '+port);

var socketPort = 2000;
var socketServer = require('./socket.server');
socketServer.createSocketServer({port: socketPort}, function(err){
  if (err) {
    console.error('Failed to start the socket!');
    console.error(err);
  }else{
    debug('Start the socket sever on port:'+socketPort);
  }
});
