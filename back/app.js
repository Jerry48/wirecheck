// miniERP entry for web server
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.09, created by Andy.zhou
 *  
 */

var express = require('express');
var app = express();
var fs = require('fs');
var debug = require('debug')('wirechek.app');
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 6188;
var router = express.Router();

// Middlewares
var constantHelper = require('../common/constants');
var dataHelper = require('../common/dataHelper');
var userModel = require('./model/user_info');
/// cookie
var cookieParser = require('cookie-parser');
app.use(cookieParser());

/// cookie session
//var cookieSession = require('cookie-session');
//app.use(cookieSession({
//  name: 'allpapapa',
//  keys: ['allpapapa150508', 'catosoft.com'],
//
//  // cookie option, '/' path, httponly, no secure
//  maxAge  : 7*24*3600*1000,        // one week expired
//  override: true,
//  path    : '/',                   // '/' path
//  ///domain  : '.7walker.cn', // specific domain
//  httpOnly: false,                 // don't allow only http method
//  secure  : false                  // no secure
//}));

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var sqlOptions = {
    host: 'localhost',
    port: 3306,
    user: 'ccflab',
    password: 'CCFLabSJTUB06',
    database: 'wirecheck',
    useConnectionPooling: true,
};
var sessionStore = new MySQLStore(sqlOptions);

app.use(session({
    unset: 'destroy',
    key: 'wirecheck_session_cookie',
    secret: 'ccflab.?sjtu@123',
    store: sessionStore,
    cookie: {
        path: '/',
        secure: false,
        httpOnly: false,
        maxAge: 24 * 60 * 1000 * 60,
    },
}));

/// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded());

/// morgan log
var morgan = require('morgan');
app.use(morgan('combined'));

//multer upload
var multer = require('multer');
app.use(multer({
    dest: './uploads/',
    putSingleFilesInArray: true,

    changeDest: function(dest, req, res) {
        debug('changeDest dest:' + dest);
        debug('changeDest req.url:%j', req.url);

        var filepath = dest;
        var parentPath = dataHelper.createParentPath(new Date());
        switch (req.url) {
            case '/api/upload/voice':
                filepath = constantHelper.SERVER.VOICEROOT + parentPath;
                break;
            case '/api/upload/portrait':
                filepath = constantHelper.SERVER.PORTRAITROOT + parentPath;
                break;
            case '/api/upload/ios':
                filepath = constantHelper.SERVER.DOWNLOADROOT;
                break;
            case '/api/upload/android':
                filepath = constantHelper.SERVER.DOWNLOADROOT;
                break;
            case '/api/upload/update':
                filepath = './uploads/update/';
                break;
            default:
                break;
        }
        debug('changeDest filepath:%j', filepath);

        if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath);
        }

        return filepath;
    },

    rename: function(fieldname, filename, req, res) {
        debug('rename: fieldname:' + fieldname);
        debug('rename: filename:' + filename);

        var newName = filename;

        debug('rename: new Name:' + newName);

        return newName;
    },

    onFileUploadStart: function(file, req, res) {

        debug('onFileUploadStart file: %j', file);

    },

    onFileUploadComplete: function(file, req, res) {
        debug('onFileUploadComplete file: %j', file);
        res.json({
            flag: 1
        });
        debug(res.json);
    }
}));

// Login logic
//var login = require('./logic/login');
//app.use('/api/v1/logic/system', login.router);

// ACL logic
var acl = require('./logic/acl');
app.use(acl.router);

// Mount model API //////////////////////////////////////////////


///////////////////////////////////////////////////////


// Mount logic API ////////////////////////////////////
//user interfaces
var api_user = require('./logic/user/user_api.logic');
app.use(api_user.router);

//dislaert info
var api_disalert_info = require('./logic/disalert/disalert_api.logic.js');
app.use(api_disalert_info.router);

//device interfaces
var api_devices = require('./logic/device/device_api.logic');
app.use(api_devices.router);

//picture analysis apis
var api_picture_analysis = require('./logic/picture_analysis/picture_api.logic');
app.use(api_picture_analysis.router);

//commands apis
var api_commands = require('./logic/commands/commands_api.logic');
app.use(api_commands.router);

//device monitor
var api_device_monitor = require('./logic/device_monitor/device_defend_api.logic');
app.use(api_device_monitor.router);

//query 
var api_query = require('./logic/query/query_api.logic');
app.use(api_query.router);

//picture search 
var api_pic_search = require('./logic/picture_search/search_api.logic');
app.use(api_pic_search.router);

var api_alerts = require('./logic/alert/alert_api.logic');
app.use(api_alerts.router);

//static path
app.use(express.static(__dirname + '/files'));

// front static server
//app.use('/', express.static(__dirname+'/../front'));
// front


var api_front_main = fs.readFileSync(__dirname + '/front/main4.html');
app.use('/main', function(req, res) {
    console.log('req.session:%j', req.session);
    console.log('+++++++++++++', sessionExist(req.cookies.sessionId));
    console.log('req.cookies:%j', req.cookies.sessionId);
    if ((req.cookies.sessionId == undefined) || (req.cookies.sessionId == 'null')) {
        res.redirect('/login');
    } else {
        var sqlstr = 'select * from sessions where session_id = "' + req.cookies.sessionId + '";';
        var query = {
            sqlstr: sqlstr,
        };
        userModel.query(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length == 0) {
                    res.redirect('/login');
                } else {
                    res.set('Content-Type', 'text/html');
                    res.write(api_front_main);
                    res.end();
                }
            }
        });
    }
});

var api_front_patrol = fs.readFileSync(__dirname + '/front/patrol4.html');
app.use('/patrol', function(req, res) {
    console.log('req.session:%j', req.session);
    if ((req.cookies.sessionId == undefined) || (req.cookies.sessionId == 'null')) {
        res.redirect('/login');
    } else {
        var sqlstr = 'select * from sessions where session_id = "' + req.cookies.sessionId + '";';
        var query = {
            sqlstr: sqlstr,
        };
        userModel.query(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length == 0) {
                    res.redirect('/login');
                } else {
                    res.set('Content-Type', 'text/html');
                    res.write(api_front_patrol);
                    res.end();
                }
            }
        });
    }
});

var api_front_device = fs.readFileSync(__dirname + '/front/device4.html');
app.use('/device', function(req, res) {
    console.log('req.session:%j', req.session);
    if ((req.cookies.sessionId == undefined) || (req.cookies.sessionId == 'null')) {
        res.redirect('/login');
    } else {
        var sqlstr = 'select * from sessions where session_id = "' + req.cookies.sessionId + '";';
        var query = {
            sqlstr: sqlstr,
        };
        userModel.query(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length == 0) {
                    res.redirect('/login');
                } else {
                    res.set('Content-Type', 'text/html');
                    res.write(api_front_device);
                    res.end();
                }
            }
        });
    }
});

var api_front_login = fs.readFileSync(__dirname + '/front/login.html');
app.use('/login', function(req, res) {
    console.log('req.session:%j', req.session);

    res.set('Content-Type', 'text/html');
    res.write(api_front_login);
    res.end();

});


var api_front_user = fs.readFileSync(__dirname + '/front/user4.html');
app.use('/user', function(req, res) {
    console.log('req.session:%j', req.session);
    if ((req.cookies.sessionId == undefined) || (req.cookies.sessionId == 'null')) {
        res.redirect('/login');
    } else {
        var sqlstr = 'select * from sessions where session_id = "' + req.cookies.sessionId + '";';
        var query = {
            sqlstr: sqlstr,
        };
        userModel.query(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length == 0) {
                    res.redirect('/login');
                } else {
                    res.set('Content-Type', 'text/html');
                    res.write(api_front_user);
                    res.end();
                }
            }
        });
    }

});

var api_front_general_user = fs.readFileSync(__dirname + '/front/general_user.html');
app.use('/general_user', function(req, res) {
    console.log('req.session:%j', req.session);

    res.set('Content-Type', 'text/html');
    res.write(api_front_general_user);
    res.end();

});

//for pic download
app.get('/download', function(req, res) {
    var filepath = req.query.filepath;
    var filepath = '../picserver/files/' + filepath;
    res.download(filepath);
});


// SPA portal
app.use(function(req, res) {
    if (req.originalUrl == '/api/upload/update') {

    } else {
        debug('req.url' + req.originalUrl);
        console.log('req.session:%j', req.session);

        res.set('Content-Type', 'text/html');
        res.send('科霖智能 wire check service, no view');
    }
});


app.listen(port);
console.log('CCFLab SJTU http server listening on ' + port);


function sessionExist(sessionId) {
    var flag = 0;
    var sqlstr = 'select * from sessions where session_id = "' + sessionId + '";';
    var query = {
        sqlstr: sqlstr,
    };
    userModel.query(query, function(err, rows) {
        if (err) {
            next(err);
        } else {
            if (rows.length == 0) {
                var flag = 0;
            } else {
                var flag = 1;
            }
        }
    });
    return flag;
}