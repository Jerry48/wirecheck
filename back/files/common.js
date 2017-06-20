var PIC_SERVER = "";
$.getJSON ("config", function (data)  
{  
    PIC_SERVER = "http://"+data.domain+":"+data.port.picserver+'/';
});  



//`errCode
var NO_SOCKET = 3003;
var SERVER_ERROR = 5002;
var CANVASWIDTH = 640;
var ENTRIES = 50;
var INTERVAL = 60000 // s
var intervalIds = {};
var dangerType = ['线下施工','建筑工地','塔吊作业','线下堆物','树木生长','野火防范','杆塔本体','鸟类活动','其他类型'];

function getUsersBySession(sessionId) {
    var data = {
        "sessionId": sessionId,
    };

    var userInfo = {};
    $.ajax({
        url: '/v1/user/info/session',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                // todo session clear
                if (data.result.flag == 0) {
                    window.location.href = '/login';
                } else {
                    userInfo = {
                        'userId': data.result.userId,
                        'userName': data.result.userName,
                        'name': data.result.name,
                        'userType': data.result.userType,
                    }
                }

            } else {
                console.log('info by session fail');
            }
        }
    });
    return userInfo;
}

function getUserDetails(userName) {
    var data = {
        'userName': userName,
    };
    var userPrivileges = {};
    $.ajax({
        url: '/v1/user/details',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                // todo session clear
                if (data.result.flag == 0) {
                    window.location.href = '/login';
                } else {
                    userPrivileges = {
                        'usrEdit': data.result.usrEdit,
                        'pwdEdit': data.result.pwdEdit,
                        'channelSet': data.result.channelSet,
                        'deviceOp': data.result.deviceOp,
                        'wechatPush': data.result.wechatPush,
                        'createGroup': data.result.createGroup,
                        'name': data.result.name,
                    }
                }

            } else {
                console.log('info by session失败');
            }
        }
    });
    return userPrivileges;
}

function makeId() {
	var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
		'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
	];
	var res = "";
	for (var i = 0; i < 20; i++) {
		var id = Math.ceil(Math.random() * 35);
		res += chars[id];
	}
	return res;
}

