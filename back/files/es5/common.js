'use strict';

// 错误码
var NO_SOCKET = 3003;
var SERVER_ERROR = 5002;
// 常数
var CANVASWIDTH = 640;
var ENTRIES = 50;
var INTERVAL = 60000; // seconds

var intervalIds = {};
var dangerType = ['线下施工', '建筑工地', '塔吊作业', '线下堆物', '树木生长', '野火防范', '杆塔本体', '鸟类活动', '其他类型'];
var hourLabels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
var dayLables = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"];
var weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
var monthLabels = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

var LOGOPATH = '../logo/';

$(function () {});

function ajxSync(url, method, data) {
    if (method === "POST") {
        data = JSON.stringify(data);
    }
    return $.ajax({
        url: url,
        type: method,
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false
    });
}

function ajxAsync(url, method, data) {
    if (method === "POST") {
        data = JSON.stringify(data);
    }
    return $.ajax({
        url: url,
        type: method,
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });
}

function welcome(name) {
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var dayOfWeek = myDate.getDay();
    var dayOfWeekName = ['日', '一', '二', '三', '四', '五', '六'];
    $('#tabs_right p').css("white-space", "pre");
    $('#tabs_right p').text('欢迎您, ' + name + '!  今天是' + year + '年' + month + '月' + day + '月' + '  星期' + dayOfWeekName[dayOfWeek]);
}

function formatDate(year, month, day) {
    var month0 = month < 10 ? '0' + month : month;
    var day0 = day < 10 ? '0' + day : day;
    var time = year + '-' + month0 + '-' + day0;
    return timeStr;
}

$.getJSON("config", function (config) {
    var PIC_SERVER = "http://" + config.domain + ":" + config.port.picserver + '/';
});

function getUsersBySession(sessionId) {
    var data = { "sessionId": sessionId };
    var userInfo = null;
    console.log(data);
    $.ajax({
        url: '/v1/user/info/session',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false
    }).then(function (data) {
        if (data.code == 0) {
            // todo session clear
            if (data.result.flag != 0) {
                userInfo = {
                    'userId': data.result.userId,
                    'userName': data.result.userName,
                    'name': data.result.name,
                    'userType': data.result.userType
                };
            }
        } else {
            console.log('info by session fail');
        }
    });
    return userInfo;
}

function getUserDetails(userName) {
    var data = { 'userName': userName };
    var userPrivileges = null;
    $.ajax({
        url: '/v1/user/details',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false
    }).then(function (data) {
        if (data.code == 0) {
            if (data.result.flag != 0) {
                userPrivileges = {
                    'usrEdit': data.result.usrEdit,
                    'pwdEdit': data.result.pwdEdit,
                    'channelSet': data.result.channelSet,
                    'deviceOp': data.result.deviceOp,
                    'wechatPush': data.result.wechatPush,
                    'createGroup': data.result.createGroup,
                    'name': data.result.name,
                    'password': data.result.password,
                    'logoFile': data.result.logoFile
                };
            }
        } else {
            console.log('info by session失败');
        }
    });
    return userPrivileges;
}

function makeId() {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var res = "";
    for (var i = 0; i < 20; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    return res;
}

function toFix3(num) {
    var absnum = Math.abs(num);
    if (absnum < 10) {
        return num.toFixed(2);
    } else if (absnum < 100) {
        return num.toFixed(1);
    } else {
        return num;
    }
}

var cookie_sessionId = Cookies.get('sessionId');
var userInfo = getUsersBySession(cookie_sessionId);
var cookie_userId = userInfo.userId;
var cookie_userType = parseInt(userInfo.userType);
var cookie_userName = userInfo.userName;

var userDetails = getUserDetails(cookie_userName);
var cookie_usrEdit = userDetails.usrEdit;
var cookie_pwdEdit = userDetails.pwdEdit;
var cookie_channelSet = userDetails.channelSet;
var cookie_deviceOp = userDetails.deviceOp;
var cookie_wechatPush = userDetails.wechatPush;
var cookie_createGroup = userDetails.createGroup;
var cookie_name = userDetails.name;
var logoFile = userDetails.logoFile;

// logo
if (logoFile !== null && logoFile !== '0') {
    $('#nav_left').html('<img src="' + (LOGOPATH + logoFile) + '"/>');
}