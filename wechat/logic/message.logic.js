// miniERP entry
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.04.09, created by Andy.zhou
 *  
 */
var express = require('express');
var router = express.Router();

var wechat = require('wechat');
var config = {
  token: 'B0603692ccflabsjtu',
  appid: 'wxc9c1ceeb70ae9669',
  encodingAESKey: 'QDM8clva1mWCYTByCjU8HNhv10oCu7MDeN8KCGiQUKo'
};

wechat(config, function (req, res, next) {

  res.reply('This is wire chekc server!');

});


module.exports.wechat = wechat;

