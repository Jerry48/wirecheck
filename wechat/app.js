// miniERP entry
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.09, created by Andy.zhou
 *  
 */

var express = require('express');
var app = express();
var router = express.Router();
var fs = require('fs');
var debug = require('debug')('allpapapa.app');

var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 80;

var weixin = require('weixin-api');//微信主体
var API = require('wechat-api');//创建菜单 & 模板消息
var OAuth = require('wechat-oauth');//网页授权 
var config = require('./config');//appid & appsecret
var wechatClient = require('../common/wechatClient');
var conf = require('../config.json');

// 解析器
/// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded());
//app.use(xmlBodyParser);

/// cookie
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var sqlOptions = {
    host: conf.database.host,
    port: conf.database.port,
    user: conf.database.user,
    password: conf.database.password,
    database: conf.database.schema,
    useConnectionPooling: true,
};
var sessionStore = new MySQLStore(sqlOptions);

app.use(session({
  unset:'destroy',
  key: 'wirecheck_wechat_session_cookie',
  secret: 'ccflab.?sjtu@123',
  store: sessionStore,
  cookie: {path:'/', secure:false, httpOnly:false, maxAge: 1000*3600*24*180,},
  
}));


// 接入验证
app.get('/wechat', function(req, res) {
  console.log('received from weixin');
  // 签名成功
  if (weixin.checkSignature(req)) {
    res.send(200, req.query.echostr);
    console.log(req.query.echostr);
  } else {
    res.send(200, 'fail');
  }
});

// config
weixin.token = 'CCFLabSJTUB0603692';

/*
// 监听文本消息
weixin.textMsg(function(msg) {
  console.log("textMsg received");
  console.log(JSON.stringify(msg));
});

// 监听图片消息
weixin.imageMsg(function(msg) {
  console.log("imageMsg received");
  console.log(JSON.stringify(msg));
});

// 监听位置消息
weixin.locationMsg(function(msg) {
  console.log("locationMsg received");
  console.log(JSON.stringify(msg));
});

// 监听链接消息
weixin.urlMsg(function(msg) {
  console.log("urlMsg received");
  console.log(JSON.stringify(msg));
});
*/

// 监听事件消息
weixin.eventMsg(function(msg) {
  console.log("eventMsg received");
  console.log(JSON.stringify(msg));

  var resMsg = {};

  switch (msg.event) {
    case "subscribe" :
    resMsg = {
      fromUserName : msg.toUserName,
      toUserName : msg.fromUserName,
      msgType : "text",
      content : "欢迎关注科霖! \n\n在进一步操作之前，请点击<a href = 'http:"+conf.domain+"/login'>此处</a>完善信息",
      funcFlag : 0
    };
    break; 
  }
  weixin.sendMsg(resMsg);
});

app.post('/wechat', function(req, res) {
  // loop
  weixin.loop(req, res);
});


//创建菜单
var api = new API(config.appid, config.appsecret);
api.getAccessToken(function(err,result){
  console.log(result);
});

var menu = JSON.stringify(require('./fixture/menu.json'));
api.createMenu(menu, function (err, result) {
	console.log(result);
});

//网页授权
var api = new OAuth(config.appid, config.appsecret);
var url_login = api.getAuthorizeURL('http://'+conf.domain+'/addInfo','test','snsapi_userinfo');

var api_front_addInfo = fs.readFileSync(__dirname+'/front/addInfo.html');
app.use('/addInfo',function(req,res){
  var code = req.query.code;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.write(api_front_addInfo);
      res.end();
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var accessToken = result.data.access_token;
        var expiresIn = result.data.expires_in;
        var refreshToken = result.data.refresh_token;
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        // req.session.code = code;
        // req.session.openid = openid;
        // req.session.access_token = accessToken;
        // req.session.refresh_token = refreshToken;
        // req.session.expires_in = expiresIn;

        res.cookie('code',code);
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.cookie('access_token',accessToken,{maxAge:1000*3600*24*365});
        res.cookie('refresh_token',refreshToken,{maxAge:1000*3600*24*365});
        res.cookie('expires_in',expiresIn,{maxAge:1000*3600*24*365});
        res.cookie('ifClose','0');
        var options = {
          openid : openid
        };
        
        api._getUser(options,accessToken,function(err,result){
          var nickname = result.nickname;
          var sex = result.sex;
          var language = result.language;
          var city = result.city;
          var province = result.province;
          var country = result.country;
          var headimageurl = result.headimgurl;

          // req.session.nickname = nickname;
          // req.session.sex = sex;
          // req.session.language = language;
          // req.session.city = city;
          // req.session.province = province;
          // req.session.country = country;
          // req.session.headimageurl = headimageurl;

          res.cookie('nickname',nickname,{maxAge:1000*3600*24*365});
          res.cookie('sex',sex,{maxAge:1000*3600*24*365});
          res.cookie('language',language,{maxAge:1000*3600*24*365});
          res.cookie('city',city,{maxAge:1000*3600*24*365});
          res.cookie('province',province,{maxAge:1000*3600*24*365});
          res.cookie('country',country,{maxAge:1000*3600*24*365});
          res.cookie('headimageurl',headimageurl,{maxAge:1000*3600*24*365});
          res.set('Content-Type', 'text/html');
          res.write(api_front_addInfo);
          res.end();
        });
      });
    }
});

app.use('/login',function(req,res){
  res.redirect(url_login);
});


var api_wechat = require('./logic/wechat_api.logic');
app.use(api_wechat.router);

//告警推送
//---
// var api_message_notify_alert = require('./logic/message_notify_alert.logic');
// app.use(api_message_notify_alert.router,function(req,res){
//   console.log('test`````````````````');
//   var deviceId = res.result.deviceId;
//   var deviceName = res.result.deviceName;
//   var alertType = res.result.alertType;
//   var happenTime = res.result.alertHappenTime;
//   var puling = [];
//       puling = res.result.openid;
//   var templateId = 'cSiHghZm0S6e3Y20OVlUUlVQoSRvka8kfQ7OW2ZQh8o';//模板id
    
//   var alertId = res.result.alertId;
    
//   var api = new API(config.appid, config.appsecret);

//   api.getAccessToken(function(err,result){
//     console.log(result);
//   });

//   var data = {
//     "first": {
//       "value":"您的设备触发报警！",
//       "color":"#173177"
//     },
//       "keyword1":{
//         "value": deviceId,//设备id
//         "color":"#173177"
//     },
//       "keyword2": {
//         "value": deviceName,//设备名称
//         "color":"#173177"
//     },
//       "keyword3": {
//         "value": alertType,//报警类型
//         "color":"#173177"
//     },
//       "keyword4": {
//         "value": happenTime,//报警时间
//         "color":"#173177"
//     },
//       "remark":{
//         "value":"请尽快处理！",
//         "color":"#173177"
//     }
//   };

//   var pushurl = 'http://'+conf.domain+'/alertDetails?id='+alertId;

//   for(var i=0;i<puling.length;i++){
//     api.sendTemplate(puling, templateId, pushurl, data, function (err, result) {
//       console.log(result);
//     });
//   }
// });

//静态告警推送
// var puling = 'oLhaks_xeXzLSzXJE9S9u6si3Owc';//test user id of zc
// //var puling = userId;
// var templateId = 'cSiHghZm0S6e3Y20OVlUUlVQoSRvka8kfQ7OW2ZQh8o';//模板id

// var api = new API(config.appid, config.appsecret);
// api.getAccessToken(function(err,result){
//   console.log(result);
// });
// var deviceId = 0;
// var deviceName = 0;
// var alertType = 0;
// var happenTime = 0;

// var data = {
//   "first": {
//     "value":"您的设备触发报警！",
//     "color":"#173177"
//   },
//     "keyword1":{
//       "value": deviceId,//设备id
//       "color":"#173177"
//   },
//     "keyword2": {
//       "value": deviceName,//设备名称
//       "color":"#173177"
//   },
//     "keyword3": {
//       "value": alertType,//报警类型
//       "color":"#173177"
//   },
//     "keyword4": {
//       "value": happenTime,//报警时间
//       "color":"#173177"
//   },
//     "remark":{
//       "value":"请尽快处理！",
//       "color":"#173177"
//   }
// };

// var pushurl = 'http://'+conf.domain+'/viewDevice';

// api.sendTemplate(puling, templateId, pushurl, data, function (err, result) {
//   console.log(result);
// });


//static path
app.use(express.static(__dirname + '/files'));

var api = new OAuth(config.appid, config.appsecret);
var url_password = api.getAuthorizeURL('http://'+conf.domain+'/changePwd','test','snsapi_base');

app.use('/password',function(req,res){
  res.redirect(url_password);
});

var api_front_changePwd = fs.readFileSync(__dirname+'/front/changePwd.html');
app.use('/changePwd', function(req, res){
  console.log('req.session:%j', req.session);
  var code = req.query.code;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.write(api_front_changePwd);
      res.end();
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.write(api_front_changePwd);
        res.end();
      })
    }
});

var api = new OAuth(config.appid, config.appsecret);
var url_devices = api.getAuthorizeURL('http://'+conf.domain+'/lineTree','test','snsapi_base');

app.use('/devices',function(req,res){
  res.redirect(url_devices);
});

var api_front_lineTree = fs.readFileSync(__dirname+'/front/lineTree.html');
app.use('/lineTree', function(req, res){
  console.log('req.session:%j', req.session);
  var code = req.query.code;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.write(api_front_lineTree);
      res.end();
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.write(api_front_lineTree);
        res.end();
      })
    }
});

var api = new OAuth(config.appid, config.appsecret);
var url_devices = api.getAuthorizeURL('http://'+conf.domain+'/viewPic','test','snsapi_base');

app.use('/devices',function(req,res){
  res.redirect(url_devices);
});

var api_front_viewPic = fs.readFileSync(__dirname+'/front/viewPic.html');
app.use('/viewPic', function(req, res){
  console.log('req.session:%j', req.session);
  var code = req.query.code;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.write(api_front_viewPic);
      res.end();
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.write(api_front_viewPic);
        res.end();
      })
    }
});

var api = new OAuth(config.appid, config.appsecret);
var url_devices = api.getAuthorizeURL('http://'+conf.domain+'/patrolDevice','test','snsapi_base');

app.use('/devices',function(req,res){
  res.redirect(url_devices);
});

var api_front_patrolDevice = fs.readFileSync(__dirname+'/front/patrolDevice.html');
app.use('/patrolDevice', function(req, res){
  console.log('req.session:%j', req.session);
  var code = req.query.code;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.write(api_front_patrolDevice);
      res.end();
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.write(api_front_patrolDevice);
        res.end();
      })
    }
});

var api = new OAuth(config.appid, config.appsecret);
var url_devices = api.getAuthorizeURL('http://'+conf.domain+'/viewDevice','test','snsapi_base');

app.use('/devices',function(req,res){
  res.redirect(url_devices);
});

var api_front_viewDevice = fs.readFileSync(__dirname+'/front/viewDevice.html');
app.use('/viewDevice', function(req, res){
  console.log('req.session:%j', req.session);
  var code = req.query.code;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.write(api_front_viewDevice);
      res.end();
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.write(api_front_viewDevice);
        res.end();
      })
    }
});

var api = new OAuth(config.appid, config.appsecret);
var url_alerts = api.getAuthorizeURL('http://'+conf.domain+'/alertList','test','snsapi_base');

app.use('/alerts',function(req,res){
  res.redirect(url_alerts);
});

var api_front_alertList = fs.readFileSync(__dirname+'/front/alertList.html');
app.use('/alertList', function(req, res){
  console.log('req.session:%j', req.session);
  var code = req.query.code;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.write(api_front_alertList);
      res.end();
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.write(api_front_alertList);
        res.end();
      })
    }
});

app.use('/details',function(req,res){
  var id = req.query.id;
  var api = new OAuth(config.appid, config.appsecret);
  var url_details = api.getAuthorizeURL('http://'+conf.domain+'/nulldetail',id,'snsapi_base');
  res.redirect(url_details);
});

var api_front_alertDetails = fs.readFileSync(__dirname+'/front/alertDetails.html');
app.use('/nulldetail', function(req, res){
  console.log('req.session:%j', req.session);
  var code = req.query.code;
  var id = req.query.state;
  if(code == null){
      res.set('Content-Type', 'text/html');
      res.redirect('http://'+conf.domain+'/alertDetails?id='+id);
    }else{
      console.log(code);
      var api = new OAuth(config.appid, config.appsecret);
      api.getAccessToken(code,function(err,result){
        console.log(result);
        var openid = result.data.openid;
        res.set('Content-Type', 'text/html');
        res.cookie('openid',openid,{maxAge:1000*3600*24*365});
        res.redirect('http://'+conf.domain+'/alertDetails?id='+id);
      })
    }
});


app.use('/alertDetails', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_alertDetails);
  res.end();
});

var api_front_manualPush = fs.readFileSync(__dirname+'/front/manualPush.html');
app.use('/manualPush', function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.write(api_front_manualPush);
  res.end();
});

var notifyPush = require('./logic/manual_notify_push.logic');
var logic_helper = require('../common/logic_helper');
var moduleName = 'manual_notify_push.logic';
var debug = require('debug')(moduleName);

app.use('/v1/notify/push', function(req, res){
  var param = req.body;

  console.log('****** manual notify push ******');
  logic_helper.responseHttp({
        res: res,
        req: req,
        moduleName: moduleName,
        processRequest: notifyPush.processRequest,
        debug : debug,
        param: param,       
  });
});


var notifyAlert = require('./logic/message_notify_alert.logic');
app.use('/v1/notify/alert', function(req, res){
  var param = req.body;

  console.log('****** message notify alert ******');
  logic_helper.responseHttp({
        res: res,
        req: req,
        moduleName: moduleName,
        processRequest: notifyAlert.processRequest,
        debug : debug,
        param: param,       
  });
});

var configFile = fs.readFileSync(conf.rootdir+'config.json');
//for pic download
app.get('/config', function(req, res) {
  res.send(conf);
  res.end();
});
app.use(function(req, res){
  console.log('req.session:%j', req.session);

  res.set('Content-Type', 'text/html');
  res.send('wire check service, no view');
});

app.listen(port);
console.log('CCFLab SJTU http server listening on '+ port);
