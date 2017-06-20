// miniERP entry
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.09, created by Andy.zhou
 *  
 */

var express = require('express');
var app = express();
var fs = require('fs');
var debug = require('debug')('allpapapa.app');
var web_port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 6188;
var proxy = require('./proxy');

var OAuth = require('wechat-oauth');
var config = require('./config');


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
    user     : 'ccflab',
    password : 'CCFLabSJTUB06',
    database: 'wirecheck',
};
var sessionStore = new MySQLStore(sqlOptions);

app.use(session({
  unset:'destroy',
  key: 'wirechek_session_cookie',
  secret: 'ccflab.?sjtu@123',
  store: sessionStore,
  cookie: {path:'/', secure:false, httpOnly:false, maxAge: 24*3600*1000,},
  
}));

// 解析器
/// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded());
//app.use(xmlBodyParser);

/// morgan log
var morgan = require('morgan');
app.use(morgan('combined'));


// Login logic
//var login = require('./logic/login');
//app.use('/api/v1/logic/system', login.router);


var api_wechat = require('./logic/wechat_api.logic');
app.use(api_wechat.router);

//static path
app.use(express.static(__dirname + '/files'));

var api_front_changePwd = fs.readFileSync(__dirname+'/front/changePwd.html');
app.use('/changePwd', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_changePwd);
  res.end();
});

var api_front_viewDevice = fs.readFileSync(__dirname+'/front/viewDevice.html');
app.use('/viewDevice', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_viewDevice);
  res.end();
});

var api_front_alertList = fs.readFileSync(__dirname+'/front/alertList.html');
app.use('/alertList', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_alertList);
  res.end();
});

var api_front_alertDetails = fs.readFileSync(__dirname+'/front/alertDetails.html');
app.use('/alertDetails', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_alertDetails);
  res.end();
});

var api_front_null = fs.readFileSync(__dirname+'/front/null.html');
app.use('/null', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_null);
  res.end();
});

var api_front_treeDevice = fs.readFileSync(__dirname+'/front/treeDevice.html');
app.use('/treeDevice', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_treeDevice);
  res.end();
});

app.use(function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.send('科霖智能 wire check service, no view');
});

var auth = new OAuth(config.appid,config.appsecret);

app.use('/auth',function(req,res){
  var url = auth.getAuthorizeURL('http://www.w3school.com.cn/b.asp','','snsapi_userinfo');
  res.redirect(url);
});

app.listen(web_port);
console.log('CCFLab SJTU http server listening on '+ web_port);