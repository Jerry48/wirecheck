var cookie_sessionId = Cookies.get('sessionId');

//`errCode
var NO_SOCKET = 3003;
var SERVER_ERROR = 5002;
var INTERVAL = 60000;

function getUsersBySession() {
    var data = {
        "sessionId": cookie_sessionId,
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
                alert('info by session失败');
                console.log(data);
            }
        }
    });
    return userInfo;
}

var userInfo = getUsersBySession();
var cookie_userId = userInfo.userId;
var cookie_name = userInfo.name;
var cookie_userType = parseInt(userInfo.userType);
var cookie_userName = userInfo.userName;


function getUserPrivileges() {
    var data = {
        'userName': cookie_userName,
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
                    }
                }
            } else {
                alert('info by session失败');
                console.log(data);
            }
        }
    });
    return userPrivileges;
}

var userPrivileges = getUserPrivileges();
var cookie_usrEdit = userPrivileges.usrEdit;
var cookie_pwdEdit = userPrivileges.pwdEdit;
var cookie_channelSet = userPrivileges.channelSet;
var cookie_deviceOp = userPrivileges.deviceOp;
var cookie_wechatPush = userPrivileges.wechatPush;
var cookie_createGroup = userPrivileges.createGroup;

function picThings() {
    $('.imgs').each(function() {
        $(this).empty();
        $(this).html('<img class="largePic" src=""><img class="smallPic" src="">');
    })

    var height = parseInt($("#pics").css("height"));
    var pics_height = height;

    $("#pic0 p").css("height", height * 1 / 16 + 'px'); // 大图的标题
    $("#pic0 .imgs").css("height", height * 15 / 16 + 'px'); //大图的图像区域

    var width = height * 15 / 16 * 1080 / 1920; //大图图像区域的宽
    $("#pic0").css("width", width + 'px');
    $("#pic16").css("width", (height * 14 / 16) / 2 * 1080 / 1920 * 3 + 'px');
    var width = width + (height * 14 / 16 / 2) * 1080 / 1920 * 3;
    $("#pics").css("width", width + 'px');

    for (var i = 0; i < 6; i++) {
        $("#pic16 p:eq(" + i + ")").css('height', height * 1 / 16 + 'px');
        $("#pic16 .imgs:eq(" + i + ")").css("height", height * 14 / 16 / 2 + 'px');
    }
}

function smallPicCss(i, w, h) {
    var height = parseInt($("#pics").css("height"));
    $("#pics img:eq(" + i + ")").css("width", '');
    if (i == 0) {
        $("#pics img:eq(" + i + ")").css("height", '56%');
        var pich = parseInt($("#pics img:eq(" + i + ")").css("height"));
        $("#pics img:eq(" + i + ")").css('position', 'relative');
        $("#pics img:eq(" + i + ")").css('left', -(pich * w / h - pich) / 2 + 'px');
        console.log(w + '_' + h + '_' + pich + '_' + $("#pics img:eq(" + i + ")").css('left'));
        // alert($("#pics img:eq("+i+")").css('left'));
        $("#pics img:eq(" + i + ")").css("margin-top", height * 15 / 16 * 420 / 1920 + 'px');
        $("#pics img:eq(" + i + ")").css("margin-bottom", height * 15 / 16 * 420 / 1920 + 'px');
    } else {
        $("#pics img:eq(" + i + ")").css("height", '56%');
        var pich = parseInt($("#pics img:eq(" + i + ")").css("height"));
        $("#pics img:eq(" + i + ")").css('position', 'relative');
        $("#pics img:eq(" + i + ")").css('left', -(pich * w / h - pich) / 2 + 'px');
        $("#pics img:eq(" + i + ")").css("margin-top", height * 14 / 16 / 2 * 420 / 1920 + 'px');
        $("#pics img:eq(" + i + ")").css("margin-bottom", height * 14 / 16 / 2 * 420 / 1920 + 'px');
    }
}

function smallPicCss2(i, w, h) {
    var height = parseInt($("#pics").css("height"));
    $("#pics img:eq(" + i + ")").css("width", '');
    if (i == 0) {
        $("#pics img:eq(" + i + ")").css('position', '');
        $("#pics img:eq(" + i + ")").css('left', '');

        $("#pics img:eq(" + i + ")").css("width", '100%');
        var picw = parseInt($("#pics img:eq(" + i + ")").css("width"));
        var pich = picw * h / w;
        $("#pics img:eq(" + i + ")").css("height", pich);
        console.log(picw + '_' + pich);
        // alert($("#pics img:eq("+i+")").css('left'));
        $("#pics img:eq(" + i + ")").css("margin-top", (height * 15 / 16 - pich - 20) / 2 + 'px');
        $("#pics img:eq(" + i + ")").css("margin-bottom", (height * 15 / 16 - pich - 20) / 2 + 'px');
    } else {
        $("#pics img:eq(" + i + ")").css('position', '');
        $("#pics img:eq(" + i + ")").css('left', '');

        $("#pics img:eq(" + i + ")").css("width", '100%');
        var picw = parseInt($("#pics img:eq(" + i + ")").css("width"));
        var pich = picw * h / w;
        $("#pics img:eq(" + i + ")").css("height", pich);
        // alert($("#pics img:eq("+i+")").css('left'));
        $("#pics img:eq(" + i + ")").css("margin-top", (height * 7 / 16 - pich - 10) / 2 + 'px');
        $("#pics img:eq(" + i + ")").css("margin-bottom", (height * 7 / 16 - pich - 10) / 2 + 'px');
    }
}

function largePicCss(i) {
    var height = parseInt($("#pics").css("height"));
    if (i == 0) {
        $("#pics img:eq(" + i + ")").css('position', '');
        $("#pics img:eq(" + i + ")").css('left', '');
        $("#pics img:eq(" + i + ")").css("width", '100%');
        $("#pics img:eq(" + i + ")").css("height", '100%');
        $("#pics img:eq(" + i + ")").css("margin-top", 0 + 'px');
        $("#pics img:eq(" + i + ")").css("margin-bottom", 0 + 'px');
    } else {
        $("#pics img:eq(" + i + ")").css('position', '');
        $("#pics img:eq(" + i + ")").css('left', '');
        $("#pics img:eq(" + i + ")").css("width", '100%');
        $("#pics img:eq(" + i + ")").css("height", '100%');
        $("#pics img:eq(" + i + ")").css("margin-top", 0 + 'px');
        $("#pics img:eq(" + i + ")").css("margin-bottom", 0 + 'px');
    }
}

function picReset() {
    $('#pics img').css('height', '100%');
    $("#pics img").css("margin-top", 0 + 'px');
    $("#pics img").css("margin-bottom", 0 + 'px');
}

$(function() {
    //权限
    if (!cookie_wechatPush) {
        $('#push').remove();
    }
    if (!cookie_channelSet) {
        $('#welcome ul li:eq(1)').remove();
    }

    //服务器在线状态
    var serverStatus = setInterval(function() {
        $.ajax({
            url: '/v1/server/check',
            type: "POST",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    // todo session clear
                    var status = data.result.serverStatus;
                    if (status.fileserver == 1) {
                        console.log('文件服务器: 在线');
                    } else {
                        console.log('文件服务器: 离线');
                    }
                    if (status.socketserver == 1) {
                        console.log('设备服务器: 在线');
                    } else {
                        console.log('设备服务器: 离线');
                    }
                    if (status.wechatserver == 1) {
                        console.log('微信服务器: 在线');
                    } else {
                        console.log('微信服务器: 离线');
                    }
                } else {
                    console.log('fail to check server status...');
                }
            }
        });
    }, 60000);

    //进度条

    //页面显示
    $('#nav').show();
    $('#main').show();
    //nav
    var height = parseInt($("#title").css("height"));
    $("#title").css('line-height', height + 'px');
    $("#title a").css('font-size', height * 0.5 + 'px');
    $("#title").css('padding-left', height * 0.2 + 'px');

    var title_height = height;
    var icon_height = parseInt($("#menu1ul").css('height'));
    $("#menu1ul").css('top', (title_height - icon_height) / 2 + 'px');

    var height = parseInt($("#welcome").css("height"));
    $("#welcome").css('line-height', height + 'px');
    $("#welcome p").css('font-size', height * 0.5 + 'px');
    $("#welcome").css('padding-left', height * 0.2 + 'px');

    //header
    var height = parseInt($("#header p").css("height"));
    $("#header p").css('line-height', height + 'px');
    $("#header p").css('font-size', height * 0.6 + 'px');

    //middle
    var height = parseInt($("#pics").css("height"));
    var pics_height = height;

    $("#pic0 p").css("height", height * 1 / 16 + 'px'); // 大图的标题
    $("#pic0 .imgs").css("height", height * 15 / 16 + 'px'); //大图的图像区域

    var width = height * 15 / 16 * 1080 / 1920; //大图图像区域的宽
    $("#pic0").css("width", width + 'px');
    $("#pic16").css("width", (height * 14 / 16) / 2 * 1080 / 1920 * 3 + 'px');
    var width = width + (height * 14 / 16 / 2) * 1080 / 1920 * 3;
    $("#pics").css("width", width + 'px');

    for (var i = 0; i < 6; i++) {
        $("#pic16 p:eq(" + i + ")").css('height', height * 1 / 16 + 'px');
        $("#pic16 .imgs:eq(" + i + ")").css("height", height * 14 / 16 / 2 + 'px');
        $("#pic16 .smallPic:eq(" + i + ")").css("margin-top", height * 14 / 16 / 2 * 420 / 1920 + 'px');
        $("#pic16 .smallPic:eq(" + i + ")").css("margin-bottom", height * 14 / 16 / 2 * 420 / 1920 + 'px');
        var w = $("#pic16 .largePic:eq(" + i + ")").css('width');
        $("#pic16 .smallPic:eq(" + i + ")").css('height', w);
    }

    $("#pic0 .smallPic").css("margin-top", height * 15 / 16 * 420 / 1920 + 'px');
    $("#pic0 .smallPic").css("margin-bottom", height * 15 / 16 * 420 / 1920 + 'px');
    var w = $("#pic0 .largePic").css('width');
    $("#pic0 .smallPic").css('height', w);

    var pics_width = width;
    //canvasDiv
    $('#canvasDiv').css('width', pics_width + 'px');
    $('#canvasDiv').css('height', pics_height + 'px');

    $('#records').css("width", width + 'px');
    $("#middle").css("width", width + 'px');
    var body_width = parseInt($("body").css("width"));
    var devices_width = (body_width - width) * 2 / 5 - 10;
    $("#devices").css("width", devices_width + 'px');
    $("#operations").css("width", (body_width - width) * 3 / 5 + 5 + 'px');
    $("#mapArea").css('width', (body_width - devices_width) + 'px');



    var lheight = parseInt($("#operations").css("height")) - parseInt($("#review").css("height")) - parseInt($("#deviceList").css("height")) - 4 * parseInt($(".head").css("height")) - 6 + 'px';
    $("#picList").css("height", (parseInt(lheight) - 10) + 'px');


    //`attrs

    //图片居中显示
    $('#picShow').attr('show', 'part');

    //欢迎词
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var dayOfWeek = myDate.getDay();
    var dayOfWeekName = ['日', '一', '二', '三', '四', '五', '六'];
    $('#welcome p').text('欢迎您: ' + cookie_name + ' 今天是' + year + '年' + month + '月' + day + '月' +
        '   星期' + dayOfWeekName[dayOfWeek]);

    //datepicker默认日期
    var month0 = (month < 10) ? ('0' + month) : (month);
    var day0 = (day < 10) ? ('0' + day) : (day);
    var time = year + '-' + month0 + '-' + day0;

    //logout
    $('#logout').click(function() {

        var data = {
            'userId': cookie_userId
        }
        $.ajax({
            url: '/v1/user/logout',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    // todo session clear
                    window.location.href = 'login';
                    Cookies.set('sessionId', null);
                } else {
                    alert('用户登出失败');
                    console.log(data);
                }
            }
        });
    });

    //设备列表
    //tree1
    var fontsize = $('#records').css('font-size');
    var tmpData = channelTree();
    var htree = parseInt($('#devices').css('height')) - parseInt($('#devices ul').css('height')) + 'px';
    var wtree = parseInt($('#tree').css('width')) + 'px';
    $('#tree').css('height', htree);
    $('#tree').treeview({
        data: tmpData,
        levels: 3,
        showBorder: false,
        collapseIcon: "glyphicon glyphicon-chevron-down",
        expandIcon: "glyphicon glyphicon-chevron-right",
        emptyIcon: "glyphicon glyphicon-facetime-video",
    });
    $('#tree').css('font-size', '12px');
    // $('#tree ul').css('width','200px');
    setTreeNodeSelected();

    //tree2
    var tmpData2 = deviceTree();
    var multi = channelTreeMulti();
    $('#deviceList').treeview({
        data: multi,
        levels: 3,
        showBorder: false,
        showCheckbox: false,
        showTags: false,
        emptyIcon: "glyphicon glyphicon-facetime-video",
        collapseIcon: "glyphicon glyphicon-chevron-down",
        expandIcon: "glyphicon glyphicon-chevron-right"

    });
    $('#deviceList').css('font-size', '12px');
    setTreeNodeSelected3();

    // $('span.icon.check-icon.glyphicon.glyphicon-check').click(function(){
    //     alert('to uncheck this!');
    // })

    // $('span.icon.check-icon.glyphicon.glyphicon-unchecked').click(function(){
    //     alert('to check this!');
    // })

    //左侧列表
    $('#devices ul:eq(0) li').click(function() {
        $('#devices ul:eq(0) li').removeClass('chosen');
        $(this).addClass('chosen');
        if (parseInt($('#mapArea').attr('showFlag')) != 1) {
            var text = $(this).text();
            if (text == "设备列表") {
                var tmpData = channelTree();
            } else if (text == "线路列表") {
                var tmpData = deviceLineTree();
            } else {
                //巡检分组
            }
            $('#tree').treeview({
                data: tmpData,
                showBorder: false,
                showCheckbox: false,
                levels: 3,
                showTags: false,
                emptyIcon: "glyphicon glyphicon-facetime-video",
                collapseIcon: "glyphicon glyphicon-chevron-down",
                expandIcon: "glyphicon glyphicon-chevron-right"
            });
            setTreeNodeSelected();
        } else {
            var text = $(this).text();
            if (text == "设备列表") {
                var tmpData = deviceTreeMulti();
            } else if (text == "线路列表") {
                var tmpData = deviceLineTreeMulti();
            } else {
                //巡检分组
            }
            $('#tree').treeview({
                data: tmpData,
                showBorder: false,
                showCheckbox: false,

                levels: 3,
                showTags: false,
                emptyIcon: "glyphicon glyphicon-facetime-video",
                collapseIcon: "glyphicon glyphicon-chevron-down",
                expandIcon: "glyphicon glyphicon-chevron-right"
            });
            setTreeNodeSelectedMap();
        }


        $('#tree').css('font-size', '12px');

    })

    // 查询时间
    $('input[name="daterange"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        autoApply: true,

        locale: {
            cancelLabel: '清除',
            applyLabel: '确定',
            format: 'YYYY-MM-DD',
            "daysOfWeek": [
                "周日",
                "周一",
                "周二",
                "周三",
                "周四",
                "周五",
                "周六"

            ],
            "monthNames": [
                "一月",
                "二月",
                "三月",
                "四月",
                "五月",
                "六月",
                "七月",
                "八月",
                "九月",
                "十月",
                "十一月",
                "十二月"

            ],
            "firstDay": 1,
        },
    });
    $('input[name="daterange"]').val('');
    $('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD'));

    });

    $('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });

    $('.daterangepicker').css('padding-right', '12px');

    for (var i = 0; i < 60; i++) {
        $('#startMin').append('<option>' + i + '</option>');
        $('#endMin').append('<option>' + i + '</option>');
    }
    for (var i = 0; i < 23; i++) {
        $('#startHour').append('<option>' + i + '</option>');
        $('#endHour').append('<option>' + i + '</option>');
    }

    // 图片操作

    // 下一页
    $('#picNext').click(function() {
        if ($('#devices ul li a:eq(0)').attr('if-all') == 1) {
            var index = parseInt($('#devices ul li a:eq(0)').attr('allpic-index'));
            var size = 7;
            var data = {
                "index": index + 1,
                "size": size
            };
            getAllPics(data);
        } else {
            var id = $('#devices ul li a:eq(0)').attr('pic-deviceId');
            var channelNo = parseInt($('#devices ul li a:eq(0)').attr('pic-channelNo'));
            var size = 7;
            var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
            var type = 0;

            var type = 0;
            var data = {
                "channelNo": channelNo,
                "id": id,
                "size": size,
                "type": type,
                "index": index + 1,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            getNextPage(data);
        }
    });

    $('#devices ul li a:eq(0)').attr('allpic-index', 0);
    var size = 7;
    var index = parseInt($('#devices ul li a:eq(0)').attr('allpic-index'));

    var data = {
        "size": size,
        "index": index,
    }

    getAllPics(data);

    intervalIds.getAllPics = setInterval(
        function() {
            var index = parseInt($('#devices ul li a:eq(0)').attr('allpic-index'));
            if (index == 0) {
                getAllPics(data);
            }
        }, INTERVAL);
    // 上一页
    $('#picLast').click(function() {
        if ($('#devices ul li a:eq(0)').attr('if-all') == 1) {
            var index = parseInt($('#devices ul li a:eq(0)').attr('allpic-index'));
            var size = 7;
            var data = {
                "index": index - 1,
                "size": size
            };
            getAllPics(data);
        } else {
            var id = $('#devices ul li a:eq(0)').attr('pic-deviceId');
            var channelNo = parseInt($('#devices ul li a:eq(0)').attr('pic-channelNo'));
            var size = 7;
            var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
            var type = 0;

            var type = 0;
            var data = {
                "channelNo": channelNo,
                "id": id,
                "size": size,
                "type": type,
                "index": index - 1,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            getNextPage(data);
        }
    });

    // buttons
    $('#refresh').click(function() {
        if ($('#devices ul li a:eq(0)').attr('if-all') == 1) {
            var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
            var size = 7;
            var data = {
                "index": 0,
                "size": size
            };
            getAllPics(data);
        } else {
            var id = $('#devices ul li a:eq(0)').attr('pic-deviceId');
            var channelNo = parseInt($('#devices ul li a:eq(0)').attr('pic-channelNo'));
            var size = 7;
            var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
            var type = 0;

            var type = 0;
            var data = {
                "channelNo": channelNo,
                "id": id,
                "size": size,
                "type": type,
                "index": 0,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            getNextPage(data);
        }
    })

    $('#setRef').click(function() {
        var tmp = getSelectedDevice();
        if (tmp == -1) {
            alert('请选择一个设备');
        } else {
            var picId = $('body').attr('selectedPic');
            if (picId == undefined) {
                alert('请选择图片');
            } else {
                $('#modalPwd input').val('');
                $('#modalPwd').modal();
            }
        }
    });

    $('#alertOp').click(function() {
        if ($('#records').css('display') == 'none') {
            $('#records').css('display', 'block');
            $('#alertOp').text('隐藏告警');
        } else {
            $('#records').css('display', 'none');
            $('#alertOp').text('显示告警');
        }
    })

    //图片搜索
    $('#picSearch').click(function() {
        if (getSelectedDevice2() == -1) {
            alert('请选择设备！');
        } else {
            if ($('#devices ul li a:eq(0)').attr('if-all') == 1) {
                var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
                var size = 7;
                var data = {
                    "index": index + 1,
                    "size": size
                };
                // getAllPics(data);
            } else {
                $('#picList').empty();
                var id = $('#devices ul li a:eq(0)').attr('piclist-deviceId');
                var size = 7;
                var index = parseInt($('#devices ul li a:eq(0)').attr('piclist-index'));
                var channelNo = parseInt($('#devices ul li a:eq(0)').attr('piclist-channelNo'));

                var startDate = $('#review input:eq(0)').val();
                var endDate = $('#review input:eq(1)').val();
                var startHour = parseInt($('#startHour').find("option:selected").text()) < 10 ? ('0' + $('#startHour').find("option:selected").text()) : $('#startHour').find("option:selected").text();
                var startMin = parseInt($('#startMin').find("option:selected").text()) < 10 ? ('0' + $('#startMin').find("option:selected").text()) : $('#startMin').find("option:selected").text();
                var endHour = parseInt($('#endHour').find("option:selected").text()) < 10 ? ('0' + $('#endHour').find("option:selected").text()) : $('#endHour').find("option:selected").text();
                var endMin = parseInt($('#endMin').find("option:selected").text()) < 10 ? ('0' + $('#endMin').find("option:selected").text()) : $('#endMin').find("option:selected").text();
                if (startDate == '') {
                    var startTime = '1900-01-01 00:00:00';
                } else {
                    var startTime = startDate + " " + startHour + ":" + startMin + ":00"
                }

                if (endDate == '') {
                    var endTime = '2900-01-01 00:00:00';
                } else {
                    var endTime = endDate + " " + endHour + ":" + endMin + ":00"
                }

                var type = 0;
                var data = {
                    "id": id,
                    "size": size,
                    "channelNo": channelNo,
                    "type": type,
                    "index": index,
                    "startTime": startTime,
                    "endTime": endTime
                }
                getPicList(data);
            }
        }
    });

    //图片回看列表
    $('body').on('click', '.piclist', function() {
        $('.piclist').css('background-color', 'white');
        $('.piclist').each(function() {
            $(this).removeClass('clickFlag');
        })
        $(this).css('background-color', 'rgb(176,196,222)');
        $(this).addClass('clickFlag');
        var thumbnailPicUrl = $(this).attr('thumbnailurl');
        var picUrl = $(this).attr('picurl');
        var w = parseInt($(this).attr('width'));
        var h = parseInt($(this).attr('height'));
        if (w > h) {
            $('#pics img:eq(0)').attr('src', picUrl);
            $('#pics img:eq(0)').attr('data-original', picUrl);
            $("#pics img:eq(0)").css("height", '56%');
            var pich = parseInt($("#pics img:eq(0)").css("height"));
            $("#pics img:eq(0)").css('position', 'relative');
            $("#pics img:eq(0)").css('left', -(pich * w / h - pich) / 2 + 'px');
            console.log(w + '_' + h + '_' + pich + '_' + $("#pics img:eq(0)").css('left'));
            // alert($("#pics img:eq(0)").css('left'));
            $("#pics img:eq(0)").css("margin-top", height * 15 / 16 * 420 / 1920 + 'px');
            $("#pics img:eq(0)").css("margin-bottom", height * 15 / 16 * 420 / 1920 + 'px');
        } else {
            $('#pics img:eq(0)').attr('src', picUrl);
            $('#pics img:eq(0)').attr('data-original', picUrl);
            $("#pics img:eq(0)").css('position', '');
            $("#pics img:eq(0)").css('left', '');
            $("#pics img:eq(0)").css("width", '100%');
            $("#pics img:eq(0)").css("height", '100%');
            $("#pics img:eq(0)").css("margin-top", 0 + 'px');
            $("#pics img:eq(0)").css("margin-bottom", 0 + 'px');
        }

        $('#pic0 p').text('回看图片');
        $('#devices ul li:eq(0)').attr('picdownload-picurl', picUrl);
        $('#devices ul li:eq(0)').attr('picdownload-thumbnailurl', thumbnailPicUrl);
    });

    //`picShow
    $('#picShow').click(function() {
        if ($(this).attr('show') == 'part') {
            $(this).attr('show', 'all');
        } else {
            $(this).attr('show', 'part');
        }
        if ($('#devices ul li a:eq(0)').attr('if-all') == 1) {
            var index = parseInt($('#devices ul li a:eq(0)').attr('allpic-index'));
            var size = 7;
            var data = {
                "index": index,
                "size": size
            };
            getAllPics(data);
        } else {
            var id = $('#devices ul li a:eq(0)').attr('pic-deviceId');
            var channelNo = parseInt($('#devices ul li a:eq(0)').attr('pic-channelNo'));
            var size = 7;
            var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
            var type = 0;

            var type = 0;
            var data = {
                "channelNo": channelNo,
                "id": id,
                "size": size,
                "type": type,
                "index": index,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            getNextPage(data);
        }
    })

    //修改巡检时间间隔
    $('.interval').change(function() {
        var val = $(this).val();
        $('.interval').val(val);
        INTERVAL = parseInt(val) * 1000;
        console.log(INTERVAL);
        clearInterval(intervalIds.getAllPics);
        clearInterval(intervalIds.findDevicePic);
        intervalIds.findDevicePic = setInterval(function() {
            var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
            var channelNo = parseInt($('#devices ul li a:eq(0)').attr('pic-channelNo'));
            var size = 7;
            var type = 1;

            var data = {
                "channelNo": channelNo,
                "type": type,
                "id": deviceId,
                "size": size,
                "index": index,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            if (index == 0) {
                // alert('!');
                getNextPage(data);
            }
        }, INTERVAL);
        intervalIds.getAllPics = setInterval(
            function() {
                var index = parseInt($('#devices ul li a:eq(0)').attr('allpic-index'));
                var size = 7;
                var data = {
                    "index": index,
                    "size": size
                };
                if (index == 0) {
                    // alert('!');
                    getAllPics(data);
                }
            }, INTERVAL);
    })

    $('#push').click(function() {
        if ($('body').attr('selectedPic') == undefined || $('body').attr('selectedPic') == '') {
            alert('请选择图片！');
        } else {
            var picId = $('body').attr('selectedPic');
            var deviceId = $('body').attr('selectedPic-deviceId');
            var data = {
                "deviceId": deviceId,
                "userId": cookie_userId,
            }
            $.ajax({
                    url: '/v1/device/list/users',
                    type: "GET",
                    data: data,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        $('#modalPush .modal-body').empty();
                        if (data.code == 0) {
                            var list = data.result.list;
                            for (var i = 0; i < list.length; ++i) {
                                var $ctrl = '<div><input userId="' + list[i].userId + '" type="checkbox">' + list[i].userName + '___微信：' + list[i].nickname + '</div>';
                                $('#modalPush .modal-body').append($ctrl);
                            }

                            // alert('success!');
                            $('#modalPush').modal();
                        } else {
                            alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '失败');
                        }
                    }
                }) // end of ajax /v1/device/list/users

        }
    })

    $('#modalPush .modal-footer button:eq(0)').click(function() {
        var picId = $('body').attr('selectedPic');
        var deviceId = $('body').attr('selectedPic-deviceId');
        var picIds = [];
        picIds.push({
            'picId': picId
        });
        var userIds = [];
        $('#modalPush input:checked').each(function() {
            userIds.push({
                'userId': $(this).attr('userId')
            });
        });
        var data = {
            "userId": cookie_userId,
            "deviceId": deviceId,
            "picIds": picIds,
            'userIds': userIds
        }
        $.ajax({
            url: '/v1/command/push/pics',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                if (data.code == 0) {
                    alert('推送成功');
                    $('#modalPush').modal('hide');
                    $('#modalPush .modal-body').empty();

                } else {
                    alert('推送失败');
                }
            }
        }); // end of ajax /v1/command/push/pics
    }); // end of click

    $('#orderDate').click(function() {
        if ($(this).text() == "拍摄日期▼") {
            $(this).text('拍摄日期▲');
        } else {
            $(this).text("拍摄日期▼")
        }

        var total = $('#devices ul li a:eq(0)').attr('piclist-total');
        for (var i = 0; i < Math.ceil(total / 2); i++) {
            var tmp = $('.piclist:eq(' + i + ')').html();
            var tmp2 = $('.piclist:eq(' + (total - 1 - i) + ')').html();
            $('.piclist:eq(' + i + ')').html(tmp2);
            $('.piclist:eq(' + (total - 1 - i) + ')').html(tmp);
        }
    })

    // 下载图片
    $('#picDownload').click(function() {
        if (downloadPics.length == 0) {
            alert('请选择图片！');
        } else if ($('#devices ul li:eq(0)').attr('picdownload-picurl') == '' || $('#devices ul li:eq(0)').attr('picdownload-picurl') == undefined) {
            if (confirm('确定要下载总共' + downloadPics.length + '张图片吗？')) {
                var data = {
                    'list': downloadPics
                };
                $.ajax({
                    url: '/v1/query/pic/download/zip',
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(data) {
                        if (data.code == 0) {
                            var zipurl = data.result.url;
                            alert(zipurl);
                            window.open(zipurl);
                        } else {
                            alert('下载失败');
                        }
                    }
                }); // end of ajax /v1/command/push/pics
            }
        } else {
            var url = $('#devices ul li:eq(0)').attr('picdownload-picurl');
            var filepath = url.slice(26);
            window.location.href = "http://wirecheckon.com:6178/download?filepath=" + filepath;
            $('#devices ul li:eq(0)').attr('picdownload-url', "");
        }
    });

    //温度历史
    $('#reviewhead2').click(function() {
        var lheight = parseInt($("#operations").css("height")) - parseInt($("#deviceList").css("height")) - 4 * parseInt($(".head").css("height")) - 6 + 'px';
        $("#tempArea").css("height", lheight);
        $('#reviewhead1').css('color', 'black');
        $(this).css('color', 'white');
        $('#listpart1').hide();
        $('#listpart2').hide();
        $('#picList').hide();
        $('#review').hide();
        $('#temphead').show();
        $('#tempArea').show();

        $('#tempArea table tbody').empty();
        $('#temppart2').hide();
        $('#deviceList').treeview({
            data: tmpData2,
            levels: 3,
            emptyIcon: "glyphicon glyphicon-facetime-video",
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right",
            showTags: true,
            showCheckbox: false,
        });

        setTreeNodeSelectedTemp();

    });

    $('#reviewhead1').click(function() {
        $('#reviewhead2').css('color', 'black');
        $(this).css('color', 'white');
        $('#listpart1').show();
        $('#listpart2').show();
        $('#picList').show();
        $('#review').show();
        $('#temphead').hide();
        $('#tempArea').hide();
        $('#canvasDiv').hide();
        $('#pics').show();
        $('#deviceList').treeview({
            data: multi,
            levels: 3,
            emptyIcon: "glyphicon glyphicon-facetime-video",
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right",
            showTags: false,
            showCheckbox: false,
        });
        setTreeNodeSelected3();
    })

    // function tempChartShow(){
    //     var month0 = (month<10)?('0'+month):(month);
    //     var day0 = (day<10)?('0'+day):(day);
    //     var deviceID = $('#tempArea').attr('data-cmdId');
    //     var inputData = {
    //         deviceID: deviceID,
    //         time: year+'-'+month0+'-'+day0,
    //     };

    //     var value = [];
    //     $.ajax({
    //         url:'/v1/device/temp/chart',
    //         type:"POST",
    //         data: JSON.stringify(inputData),
    //         contentType:"application/json; charset=utf-8",
    //         dataType:"json",
    //         async:false,
    //         success: function(data){
    //             if (data.code == 0) {
    //                 var list = data.result.list;
    //                 for(var i=0;i<data.result.size;i++){
    //                     value.push(list[i].temperature);
    //                 }
    //             } else {
    //                 alert('获取温度失败');
    //             }
    //         }
    //     })

    //     var hourLabels = ["0","1","2","3","4","5","6",
    //                     "7","8","9","10","11","12",
    //                     "13","14","15","16","17","18","19",
    //                     "20","21","22","23"];

    //     var dayLables = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28"];
    //     var weekLabels = ["周一","周二","周三","周四","周五","周六","周日"];
    //     var monthLabels = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
    //     var height = parseInt($('#canvasDiv').css('height'));
    //     var data = [
    //     {
    //         name : '北京',
    //         value:value,
    //         color:'#1f7e92',
    //         line_width:3
    //     }
    //     ];
    //     var chart = new iChart.LineBasic2D({
    //         render : 'pics',
    //         data: data,
    //         title : inputData.time+' 温度实况',
    //         width : pics_width,
    //         height : height,
    //         coordinate:{height:'90%',background_color:'#f6f9fa'},
    //         sub_option:{
    //             hollow_inside:false,//设置一个点的亮色在外环的效果
    //             point_size:16
    //         },
    //         labels:hourLabels
    //     });
    //     chart.draw();
    //     $('#canvasDiv').show();
    // }

    //温度图

    $('#temppart2 button').click(function() {
        var cmdID = $('#tempArea').attr('data-cmdId');
        var deviceName = $('#tempArea').attr('data-cmdName');
        var inputData = {
            cmdID: cmdID,
            time: $('#temppart2 input').val(),
        };

        var value = [];
        var chartShowFlag = 1;
        $.ajax({
                url: '/v1/cmd/temp/chart',
                type: "POST",
                data: JSON.stringify(inputData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false,
                success: function(data) {
                    if (data.code == 0) {
                        var list = data.result.list;
                        for (var i = 0; i < list.length; i++) {
                            value.push(list[i].temperature);
                        }
                        if (list.length == 0) {
                            alert('该时段暂无温度信息');
                            chartShowFlag = 0;
                        }
                    } else {
                        alert('获取温度失败');
                    }
                }
            })
            // var hourLabels = ["0:00","1:00","2:00","3:00","4:00","5:00","6:00",
            //                 "7:00","8:00","9:00","10:00","11:00","12:00",
            //                 "13:00","14:00","15:00","16:00","17:00","18:00","19:00",
            //                 "20:00","21:00","22:00","23:00"];



        if (chartShowFlag) {
            var hourLabels = ["0", "1", "2", "3", "4", "5", "6",
                "7", "8", "9", "10", "11", "12",
                "13", "14", "15", "16", "17", "18", "19",
                "20", "21", "22", "23"
            ];

            var dayLables = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"];
            var weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
            var monthLabels = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

            var searchType = $('#searchType').val();
            switch (searchType) {
                case 'day':
                    var label = hourLabels;
                    break;
                case 'month':
                    var label = dayLabels;
                    break;
                case 'year':
                    var label = monthLabels;
                    break;
                default:
                    var label = monthLabels;
                    break;
            }

            var data = [{
                name: '北京',
                value: value,
                color: '#1f7e92',
                line_width: 3
            }];
            var chart = new iChart.LineBasic2D({
                render: 'canvasDiv',
                data: data,
                title: deviceName + ' ' + inputData.time + ' 温度实况',
                width: pics_width,
                height: height,
                coordinate: {
                    height: '90%',
                    background_color: '#f6f9fa'
                },
                sub_option: {
                    hollow_inside: false, //设置一个点的亮色在外环的效果
                    point_size: 16
                },
                labels: label
            });
            chart.draw();
            $('#pics').hide();
            $('#canvasDiv').show();
        }
    })

    $('body').on('click', '#tempArea table tbody tr', function() {
        $('#temppart2').show();
        $('#tempArea table tbody tr').removeClass('clickFlag2');
        $('#tempArea table tbody tr').css('background-color', 'white');
        $(this).css('background-color', 'rgb(176,196,222)');
        $(this).addClass('clickFlag2');
        $('#tempArea').attr('data-cmdId', $(this).attr('id'));
        $('#tempArea').attr('data-cmdName', $(this).find('td:eq(0)').text());
    })

    $('#searchType').change(function() {
        $('#searchMonth').hide();
        $('#temppart2 input').hide();
        var searchType = $('#searchType').val();
        if (searchType == 'day') {
            $('#temppart2 input').val('');
            $('#temppart2 input').show();
        } else if (searchType == 'month') {
            $('#searchMonth').val('1');
            $('#searchMonth').show();
        } else {
            //to search by year
        }
    });

    // 实时记录
    getAlertRecords(0);
    intervalIds.heartBeatRecords = setInterval(function() {
        getAlertRecords(0);
    }, INTERVAL);
    $('#recordLast').click(function() {
        if ($('#records ul li:eq(0)').hasClass('chosen')) {
            var index = parseInt($('#records ul li:eq(0)').attr('index'));
            getAlertRecords(index - 1);
        } else if ($('#records ul li:eq(1)').hasClass('chosen')) {
            var index = parseInt($('#records ul li:eq(1)').attr('index'));
            getVideoRecords(index - 1);
        }
    });
    $('#recordNext').click(function() {
        if ($('#records ul li:eq(0)').hasClass('chosen')) {
            var index = parseInt($('#records ul li:eq(0)').attr('index'));
            getAlertRecords(index + 1);
        } else if ($('#records ul li:eq(1)').hasClass('chosen')) {
            var index = parseInt($('#records ul li:eq(1)').attr('index'));
            getVideoRecords(index + 1);
        }
    });

    $('.pics img').click(function() {
        $('#records').hide();
        $('#pics img').css('border', '');
        $(this).css('border', '2px solid red');
        var picId = $(this).attr('picId');
        var deviceId = $(this).attr('deviceId');
        var channelNo = $(this).attr('channelNo');
        $('body').attr('selectedPic', picId);
        $('body').attr('selectedPic-deviceId', deviceId);
        $('body').attr('selectedPic-channelNo', channelNo);
    })

    $('#modalPwd .modal-footer button:eq(0)').click(function() {
        var div = $('#modalPwd .modal-body');
        var userName = div.find('div:eq(0) input').val();
        var password = div.find('div:eq(1) input').val();
        var rePassword = div.find('div:eq(2) input').val();
        if (userName == '' || password == '' || rePassword == '') {
            alert('请输入完整信息!');
        } else if (password != rePassword) {
            alert('两次输入的密码不一致!');
        } else {
            var data = {
                'userName': userName,
                'password': password,
            }
            if (checkUser(data) != 0) {
                var picId = $('body').attr('selectedPic');
                var deviceId = $('body').attr('selectedPic-deviceId');
                var channelNo = $('body').attr('selectedPic-channelNo');
                var data = {
                    "deviceId": deviceId,
                    "picId": picId,
                    "channelNo": channelNo
                };
                $.ajax({
                    url: '/v1/picture/ref/set',
                    type: "GET",
                    data: data,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        if (data.code == 0) {
                            // todo session clear
                            $('#modalPwd').modal('hide');
                            alert('设置' + channelNo + '号摄像头对比图片成功！');

                        } else {
                            alert('设置对比图片失败！');
                        }
                    }
                });
            } else {
                alert('您输入的密码有误！请重新输入!');
                div.find('div').val('');
            }
        }
    })

    //`take photos
    $('#title ul a:eq(0)').click(function() {
            var tmp = getSelectedDevice();
            if (tmp == -1) {
                alert('请选择一个设备');
            } else {
                var tmpData = tmp.split('_');
                var deviceId = tmpData[0];
                var channelNo = tmpData[1];
                var data = {
                    "deviceId": deviceId,
                    "channelNo": channelNo,
                };
                $.ajax({
                        url: '/v1/device/klTriggerPhoto',
                        type: "POST",
                        data: JSON.stringify(data),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function(data) {
                            if (data.code == 0) {
                                alert('设备拍照成功！请等待设备上传图片');
                            } else if (data.code == NO_SOCKET || data.code == SERVER_ERROR) {
                                alert('与设备服务器连接失败！错误码：' + data.code);
                            } else {
                                alert('拍照失败！');
                            }
                        }
                    }) // end of ajax
            }
        }) // end of click

    $('#back').click(function() {
        $('#mapArea').removeAttr('showFlag');
        $('#middle').show();
        $('#operations').show();
        $('#mapArea').hide();
        $(this).hide();
    })

    //`map
    $('#title ul a:eq(3)').click(function() {
        // clearInterval(intervalIds.getAllPics);
        // clearInterval(intervalIds.findDevicePic);
        // clearInterval(intervalIds.heartBeatRecords);
        $('#mapArea').attr('showFlag', 1);
        initMap();
        $('#back').show();
        $('#middle').hide();
        $('#operations').hide();
        $('#mapArea').show();

        var tmp = deviceTreeMulti();

        $('#tree').treeview({
            data: tmp,
            levels: 3,
            showBorder: false,
            showTags: false,
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right",
            emptyIcon: "glyphicon glyphicon-facetime-video",
        });

        $('#tree').css('font-size', '12px');

        setTreeNodeSelectedMap();
        $('#mapInput button:eq(1)').unbind('click');
        $('#mapInput button:eq(1)').click(function() {
            var address = $('#mapInput input:eq(0)').val();
            var radius = $('#mapInput input:eq(1)').val();
            var url = 'http://api.map.baidu.com/geocoder/v2/?address=' + address + '&output=json&ak=fr2k1GxnZbBxXalKYdcQUNBM';

            $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    success: function(data) {
                        if (data.status == 0) {
                            address = data.result.location;
                            var data = {
                                'latitude': parseFloat(address.lat),
                                'longitude': parseFloat(address.lng),
                                'radius': parseFloat(radius)
                            }
                            $.ajax({
                                    url: '/v1/device/query/map2',
                                    type: "GET",
                                    data: data,
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    async: false,
                                    success: function(data) {
                                        if (data.code == 0) {
                                            map.clearOverlays();
                                            var list = data.result.list;
                                            var data_info = [];

                                            var contentTemplte =
                                                "<div style='width:100%;height:100%;'id='tmpid'>" +
                                                "<div style='float:left;width:30%;'><h5 style='margin:0px;'>名字</h5><p style='margin:0px;'>电压</p><p style='margin:0px;'>充电电压</p><p style='margin:0px;'>温度</p><p style='margin:0px;'>警报</p><p style='margin:0px;'>状态</p></div>" +
                                                "<div id='pics' style='float:left;width:70%; height:50px;'><img id='imgDemo' width='350' height='200' src='thumbnail' data-original='url' title='告警图片'/><button type='button' class='mapLastPic'>上一张</button><button type='button' class='mapNextPic'>下一张</button></div>" +
                                                "</div>"

                                            var contents = [];
                                            for (var i = 0; i < list.length; ++i) {
                                                data_info[i] = {}
                                                data_info[i].id = list[i].deviceID;
                                                data_info[i].name = list[i].name;
                                                data_info[i].latitude = list[i].latitude;
                                                data_info[i].longitude = list[i].longitude;
                                                data_info[i].batteryVoltage = list[i].batteryVoltage;
                                                data_info[i].chargeVoltage = list[i].chargeVoltage;
                                                data_info[i].temperature = list[i].temperature;
                                                data_info[i].alert = list[i].alert;
                                                data_info[i].alertId = list[i].alertId;
                                                data_info[i].status = list[i].status;
                                                data_info[i].thumbnailPicUrl = list[i].thumbnailPicUrl;
                                                data_info[i].picUrl = list[i].picUrl;
                                                contents[i] = contentTemplte;
                                                contents[i] = contents[i].replace('tmpid', list[i].deviceID);
                                                contents[i] = contents[i].replace('名字', list[i].name);
                                                contents[i] = contents[i].replace('电压', '电压:' + list[i].batteryVoltage);
                                                contents[i] = contents[i].replace('充电电压', '充电电压:' + list[i].chargeVoltage);
                                                contents[i] = contents[i].replace('温度', '温度:' + list[i].temperature);
                                                contents[i] = contents[i].replace('警报', '警报:' + list[i].alert);
                                                contents[i] = contents[i].replace('thumbnail', list[i].picUrl);
                                                contents[i] = contents[i].replace('url', list[i].picUrl);
                                                if (list[i].status == 0) {
                                                    var status = '离线'
                                                } else {
                                                    var status = '在线'
                                                }
                                                contents[i] = contents[i].replace('状态', '状态:' + status);
                                            }

                                            var viewer = new Viewer(document.getElementById('pics'), {
                                                url: 'data-original'
                                            });
                                            var points = [];　　　　
                                            for (var i = 0; i < data_info.length; i++) {
                                                points.push(new BMap.Point(data_info[i].longitude, data_info[i].latitude));
                                                if (data_info[i].status == 1) {
                                                    var marker = new BMap.Marker(new BMap.Point(data_info[i].longitude, data_info[i].latitude)); // 创建标注
                                                } else {
                                                    var iconImg = createIcon();
                                                    var marker = new BMap.Marker(new BMap.Point(data_info[i].longitude, data_info[i].latitude), {
                                                        icon: iconImg
                                                    }); // 创建标注
                                                }
                                                var label = new BMap.Label(data_info[i].name, {
                                                    "offset": new BMap.Size(colorIcons.red.lb - colorIcons.red.x + 10, -20)
                                                });

                                                map.addOverlay(marker); // 将标注添加到地图中
                                                marker.setLabel(label);
                                                label.setStyle({
                                                    borderColor: "#808080",
                                                    color: "#333",
                                                    cursor: "pointer",
                                                    borderWidth: '0px',
                                                    backgroundColor: 'transparent'
                                                });
                                                addClickHandler(contents[i], marker);
                                            }
                                            map.setViewport(points);　

                                        } else {
                                            alert('按地图获取设备列表失败');
                                            console.log(data);
                                        }
                                    }
                                }) // end of ajax
                        } else {
                            alert('获取指定地址经纬度失败');
                            console.log(data);
                        }
                    }
                }) // end of ajax
        })
    })

    $('body').on('click', '.mapLastPic', function() {
        alert('haha');
        // var deviceId = $(this).parent().parent().attr('id');
        // alert(deviceId);
    });

    $('body').on('click', '.mapNextPic', function() {
        alert('haha');
        // var deviceId = $(this).parent().parent().attr('id');
        // alert(deviceId);
    });

    $('body').on('click', '.alertHandle', function() {
        if (confirm('确定处理该告警？')) {
            var alertId = $(this).parent().parent().attr('alertId');
            var data = {
                'alertId': alertId,
                'userId': cookie_userId,
                'confirm': 1,
            }
            $.ajax({
                    url: '/v1/alert/process',
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(data) {
                        if (data.code == 0) {
                            var index = parseInt($('#records ul li:eq(0)').attr('index'));
                            getAlertRecords(index);
                        } else {
                            alert('处理失败！');
                            console.log(data);
                        }
                    }
                }) // end of ajax
        }
    })



    //手动配置
    $('#menu1ul li a:eq(4)').click(function() {
        var deviceId = getSelectedDevice();
        if (deviceId != -1) {
            var data = {
                'deviceId': deviceId
            };
            $.ajax({
                url: '/v1/command/setdevice',
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function(data) {
                    if (data.code == 0) {
                        alert(deviceId + "发送配置命令成功！");
                        //window.location.href('http://www.wirecheckon.com/viewDevice');
                    } else {
                        alert(deviceId + "发送配置命令失败！");
                    }
                }
            });
        } else {
            alert('请选择一个设备');
        }
    });
})

// ` channelTree
function channelTree() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url: '/v1/device/tree2',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        }
    })
    return rootNode;
}

function channelTreeMulti() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url: '/v1/device/tree/channel/multi',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        }
    })
    return rootNode;
}

function deviceTree() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url: '/v1/device/tree3',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        }
    })
    return rootNode;
}

function deviceTreeMulti() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url: '/v1/device/tree/multi',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        }
    })
    return rootNode;
}

function deviceLineTree() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url: '/v1/device/tree/line',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        }
    })
    return rootNode;
}

function deviceLineTreeMulti() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url: '/v1/device/tree/line/multi',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        }
    })
    return rootNode;
}

function getSelectedDevice() {
    if ($('#tree').treeview('getSelected').length != 1 || $('#tree').treeview('getSelected')[0].type == undefined || $('#tree').treeview('getSelected')[0].type != 3) {
        return -1;
    }
    return $('#tree').treeview('getSelected')[0].id;
}

function getSelectedDevice2() {
    if ($('#deviceList').treeview('getSelected').length != 1 || $('#deviceList').treeview('getSelected')[0].type == undefined || $('#deviceList').treeview('getSelected')[0].type != 3) {
        return -1;
    }
    var tmp = $('#deviceList').treeview('getSelected')[0].id;
    var tmpData = tmp.split('_');
    var deviceId = tmpData[0];
    var channelNo = tmpData[1];
    // alert($('#deviceList').treeview('getSelected')[0].channelId);
    $('#devices ul li a:eq(0)').attr('piclist-deviceId', deviceId);
    $('#devices ul li a:eq(0)').attr('piclist-index', 0);
    $('#devices ul li a:eq(0)').attr('piclist-channelNo', channelNo);
    return deviceId;
}

function getSelectedDevice3() {
    if ($('#deviceList').treeview('getSelected').length != 1 || $('#deviceList').treeview('getSelected')[0].type == undefined || $('#deviceList').treeview('getSelected')[0].type != 3) {
        return -1;
    }
    var deviceId = $('#deviceList').treeview('getSelected')[0].id;
    $('#devices ul li a:eq(0)').attr('piclist-deviceId', deviceId);
    $('#devices ul li a:eq(0)').attr('piclist-index', 0);
    return deviceId;
}

function setTreeNodeSelected() {
    $('#tree').data().treeview.options.multiSelect = false;
    // $('#tree').unbind('nodeUnSelected');
    // $('#tree').on('nodeUnSelected', function(event, data) {
    //     var size = 7;
    //     var index = 0;

    //     var data = {
    //         "size": size,
    //         "index": index,
    //     }

    //     getAllPics(data);

    //     intervalIds.getAllPics = setInterval(function() {getAllPics(data);}, INTERVAL);
    // })
    $('#tree').unbind('nodeSelected');
    $('#tree').on('nodeSelected', function(event, data) {
            var type = $('#tree').treeview('getSelected')[0].type;
            var tmp = $('#tree').treeview('getSelected')[0].id;
            var tmpData = tmp.split('_');
            var deviceId = tmpData[0];
            var channelNo = tmpData[1];
            var name = $('#tree').treeview('getSelected')[0].text;
            if ($('#devices ul li').filter('.chosen').text() == '设备列表') {
                $('input[name="daterange"]').val('');
                if (type == 3) {
                    type = 0;
                    $.ajax({
                            url: '/v1/device/find/parents',
                            type: "POST",
                            data: JSON.stringify({
                                deviceId: deviceId
                            }),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function(data) {
                                if (data.code == 0) {

                                    var parents = data.result.data;
                                    var parentsName = "";
                                    for (var i = 0; i < parents.length; i++) {
                                        parentsName = parentsName + parents[parents.length - 1 - i] + " / "
                                    }
                                    parentsName += name;
                                    $('#header p').text(parentsName);
                                } else {
                                    console.log('failed at alert/process');
                                }
                            }
                        }) // end of ajx

                } else {
                    type = 1;
                }
            } else {
                if (type == 3) {
                    type = 0;
                } else {
                    type = 2;
                }
            }


            $('#devices ul li a:eq(0)').attr('pic-index', 0);
            $('#devices ul li a:eq(0)').attr('pic-channelNo', channelNo);
            var size = 7;
            var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));

            var data = {
                    "channelNo": channelNo,
                    "type": type,
                    "id": deviceId,
                    "size": size,
                    "index": index,
                    "startTime": "1900-01-01 00:00:00",
                    "endTime": "2900-01-01 00:00:00"
                }
                // setDeviceStatus();
            clearInterval(intervalIds.getAllPics);
            clearInterval(intervalIds.findDevicePic);
            getNextPage(data);
            intervalIds.findDevicePic = setInterval(function() {
                var index = parseInt($('#devices ul li a:eq(0)').attr('pic-index'));
                if (index == 0) {
                    getNextPage(data);
                }
            }, INTERVAL);
        }) // end of nodeSelected event
}

function setTreeNodeSelected2() {
    $('#deviceList').data().treeview.options.multiSelect = false;
    $('#deviceList').unbind('nodeSelected');
    $('#deviceList').on('nodeSelected', function(event, data) {
            var type = $('#deviceList').treeview('getSelected')[0].type;
            var deviceId = $('#deviceList').treeview('getSelected')[0].id;
            var name = $('#deviceList').treeview('getSelected')[0].text;
        }) // end of nodeSelected event
}

function setTreeNodeSelected3() {
    $('#deviceList').data().treeview.options.multiSelect = true;
    $('#deviceList').unbind('nodeSelected');
    $('#deviceList').on('nodeSelected nodeUnselected', function(event, data) {
        var newData = {};

        newData.channelIds = [];
        newData.ids = [];

        var selectedDevices = $('#deviceList').treeview('getSelected');
        newData.type = 0;
        for (var i = 0; i < selectedDevices.length; ++i) {
            if (selectedDevices[i].type == 3) {
                var channelId = selectedDevices[i].channelId;
                newData.channelIds.push(channelId);
            } else {
                newData.type = 1;
                newData.ids.push(selectedDevices[i].id);
            }
        }
        var startDate = $('#review input:eq(0)').val();
        var endDate = $('#review input:eq(1)').val();
        var startHour = parseInt($('#startHour').find("option:selected").text()) < 10 ? ('0' + $('#startHour').find("option:selected").text()) : $('#startHour').find("option:selected").text();
        var startMin = parseInt($('#startMin').find("option:selected").text()) < 10 ? ('0' + $('#startMin').find("option:selected").text()) : $('#startMin').find("option:selected").text();
        var endHour = parseInt($('#endHour').find("option:selected").text()) < 10 ? ('0' + $('#endHour').find("option:selected").text()) : $('#endHour').find("option:selected").text();
        var endMin = parseInt($('#endMin').find("option:selected").text()) < 10 ? ('0' + $('#endMin').find("option:selected").text()) : $('#endMin').find("option:selected").text();
        if (startDate == '') {
            var startTime = '1900-01-01 00:00:00';
        } else {
            var startTime = startDate + " " + startHour + ":" + startMin + ":00"
        }

        if (endDate == '') {
            var endTime = '2900-01-01 00:00:00';
        } else {
            var endTime = endDate + " " + endHour + ":" + endMin + ":00"
        }

        newData.startTime = startTime;
        newData.endTime = endTime;

        downloadPics = [];
        getPicList2(newData);
    })
}

function setTreeNodeSelectedMap() {
    $('#tree').data().treeview.options.multiSelect = true;
    $('#tree').unbind('nodeSelected');

    $('#tree').on('nodeSelected nodeUnselected', function(event, data) {
        var newData = {};

        newData.deviceIds = [];
        newData.id = [];

        var selectedDevices = $('#tree').treeview('getSelected');
        newData.type = 0;
        for (var i = 0; i < selectedDevices.length; ++i) {
            if (selectedDevices[i].type == 3) {
                newData.deviceIds.push(selectedDevices[i].id);
                // }else if ($('#devices li').filter('.chosen').text() == '设备列表') {
            } else {
                newData.type = 1;
                newData.id.push(selectedDevices[i].id);
            }
            // else if ($('#devices li').filter('.chosen').text() == '设备分组'){
            //     newData.type = 2;
            //     newData.id.push(selectedDevices[i].id); 
            // }
        }
        mapDevice(newData);
    })
}

function setTreeNodeSelectedTemp() {
    $('#deviceList').data().treeview.options.multiSelect = false;
    $('#deviceList').unbind('nodeSelected');

    $('#deviceList').on('nodeSelected', function(event, data) {
        var newData = {};

        newData.deviceIds = [];
        newData.id = [];

        var selectedDevices = $('#deviceList').treeview('getSelected');
        newData.type = 0;
        newData.deviceIds.push(selectedDevices[0].id);
        tempDevice(newData);
    })
}

//`getnextpage
function getNextPage(data) {
    // clearInterval(intervalIds.findDevicePic);
    var outerData = data;
    $.ajax({
            url: '/v1/search/pics/device',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1)
                        $('#picNext').hide();
                    else
                        $('#picNext').show();

                    $('#devices ul li a:eq(0)').attr('pic-index', outerData.index);
                    $('#devices ul li a:eq(0)').attr('pic-deviceId', outerData.id);
                    $('#devices ul li a:eq(0)').attr('if-all', 0);
                    if ($('#devices ul li a:eq(0)').attr('pic-index') > 0) {
                        $('#picLast').show();
                    } else {
                        $('#picLast').hide();
                    }

                    var list = data.result.list;

                    // picThings();
                    $('#pics img').removeAttr('data-original');
                    $('#pics img').removeAttr('src');
                    $('#pics img').removeAttr('picId');
                    $('#pics img').removeAttr('channelNo');
                    $('.pics p').text('');
                    picReset();
                    for (var i = 0; i < list.length; ++i) {
                        if (list[i].picType == 2) {
                            // for ref pic
                        } else {
                            if (list[i].picType == 1) {
                                var name = list[i].name;
                                var timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 告警图片:"+timeName);
                            } else {
                                var name = list[i].name;
                                var timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 原始图片:"+timeName);
                            }
                            if (list[i].width > list[i].height) {
                                if ($('#picShow').attr('show') == 'all') {
                                    smallPicCss2(i, list[i].width, list[i].height);
                                } else {
                                    smallPicCss(i, list[i].width, list[i].height);
                                }
                            } else {
                                largePicCss(i);
                            }
                            if (i == 0) {
                                $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                            } else {
                                $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                            }
                            $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                            if (i > 0) {
                                $('.pics:eq(' + i + ') p').text(list[i].time.slice(11, 19));
                            } else {
                                $('.pics:eq(' + i + ') p').text(list[i].time);
                            }
                            $('#picCount').text('第' + (outerData.index + 1) + '页 共' + Math.ceil(data.result.total / outerData.size) + '页');
                        }
                    }

                    var viewer = new Viewer(document.getElementById('pics'), {
                        url: 'data-original'
                    });
                    // 进度条


                    // for (var i = 0; i < list.length; ++i) {
                    //     $('img.magnify:eq(' + (i + 4) + ')').attr('src', list[i].picUrl);
                    // }
                } else {
                    alert('查无图片！');
                    var level = $('#tree').treeview('getSelected')[0].level;
                    if (level > 3)
                        alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '查询图片失败');
                    console.log(data);
                }
            }
        }) // end of ajax   
}
// `getallpics
function getAllPics(data) {
    // clearInterval(intervalIds.getAllPics);
    var outerData = data;
    $.ajax({
            url: '/v1/search/pics/all',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1)
                        $('#picNext').hide();
                    else
                        $('#picNext').show();

                    $('#devices ul li a:eq(0)').attr('allpic-index', outerData.index);
                    $('#devices ul li a:eq(0)').attr('if-all', 1);
                    if ($('#devices ul li a:eq(0)').attr('allpic-index') > 0) {
                        $('#picLast').show();
                    } else {
                        $('#picLast').hide();
                    }

                    var list = data.result.list;
                    // picThings();
                    $('#pics img').removeAttr('data-original');
                    $('#pics img').removeAttr('src');
                    $('#pics img').removeAttr('picId');
                    $('#pics img').removeAttr('channelNo');
                    $('.pics p').text('');
                    picReset();

                    for (var i = 0; i < list.length; ++i) {
                        if (list[i].picType == 2) {
                            // for ref pic
                        } else {
                            if (list[i].picType == 1) {
                                var name = list[i].name;
                                var timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 告警图片:"+timeName);
                            } else {
                                var name = list[i].name;
                                var timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 原始图片:"+timeName);
                            }
                            if (list[i].width > list[i].height) {
                                if ($('#picShow').attr('show') == 'all') {
                                    smallPicCss2(i, list[i].width, list[i].height);
                                } else {
                                    smallPicCss(i, list[i].width, list[i].height);
                                }
                            } else {
                                largePicCss(i);
                            }
                            if (i == 0) {
                                $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                            } else {
                                $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                            }

                            $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);


                            if (i > 0) {
                                $('.pics:eq(' + i + ') p').text(list[i].time.slice(11, 19) + ' ' + list[i].deviceName);
                            } else {
                                $('.pics:eq(' + i + ') p').text(list[i].time + ' ' + list[i].deviceName);
                            }
                            $('#picCount').text('第' + (outerData.index + 1) + '页 共' + Math.ceil(data.result.total / outerData.size) + '页');
                        }
                    }

                    var viewer = new Viewer(document.getElementById('pics'), {
                        url: 'data-original'
                    });
                    // 进度条


                    // for (var i = 0; i < list.length; ++i) {
                    //     $('img.magnify:eq(' + (i + 4) + ')').attr('src', list[i].picUrl);
                    // }
                } else {
                    alert('查无图片！');
                    // var level = $('#tree').treeview('getSelected')[0].level;
                    // if(level > 3)
                    //     alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '查询图片失败');
                    // console.log(data);
                }
            }
        }) // end of ajax   
}


function getPicList(data) {
    var outerData = data;
    $.ajax({
            url: '/v1/search/pics/device/piclist',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.listall;
                    $('#devices ul li a:eq(0)').attr('piclist-total', data.result.total);

                    for (var i = 0; i < list.length; ++i) {
                        var name = list[i].name;
                        var picUrl = list[i].picUrl;
                        var picId = list[i].picId;
                        var deviceId = list[i].deviceId;
                        var thumbnailPicUrl = list[i].thumbnailPicUrl;
                        var time = list[i].time;
                        var timeName = time.slice(0, 4) + "年" + time.slice(5, 7) + "月" + time.slice(8, 10) + "日" + time.slice(11);
                        $('#picList').append('<div class="piclist" picId = "' + picId + '" deviceId = "' + deviceId + '" picurl="' + picUrl + '"thumbnailurl="' + thumbnailPicUrl + '"><img src="picicon.png" style="float:left;"><p style="">' + timeName + '</p></div>');
                    }
                    $('#picList p').css('margin-bottom', '0px');
                } else {
                    alert('查无图片！');
                    var level = $('#tree').treeview('getSelected')[0].level;
                    if (level > 3)
                        alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '查询图片失败');
                    console.log(data);
                }
            }
        }) // end of ajax   
}


var downloadPics = [];
// multi choices without search buttons
function getPicList2(data) {
    $("#progressbarPicList").progressbar({
        value: 0,
        max: 100
    });
    var outerData = data;
    $.ajax({
            url: '/v1/search/pics/devices/piclist',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            xhrFields: {
                onprogress: function(e) {
                    //Download progress
                    if (e.lengthComputable) {
                        $("#progressbarPicList").progressbar({
                            value: e.loaded,
                            max: e.total
                        })
                    }
                }
            },
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.list;
                    $('#picList').empty();
                    for (var i = 0; i < list.length; ++i) {
                        downloadPics.push(list[i].picUrl.slice(25));

                        var name = list[i].name;
                        var picUrl = list[i].picUrl;
                        var picId = list[i].picId;
                        var deviceId = list[i].deviceId;
                        var channelNo = list[i].channelNo;
                        var thumbnailPicUrl = list[i].thumbnailPicUrl;
                        var time = list[i].time;
                        var timeName = time.slice(0, 4) + "年" + time.slice(5, 7) + "月" + time.slice(8, 10) + "日" + time.slice(11);
                        $('#picList').append('<div class="piclist" picId = "' + picId + '" deviceId = "' + deviceId + '" picurl="' + picUrl + '"thumbnailurl="' + thumbnailPicUrl + '" width="' + list[i].width + '" height="' + list[i].height + '"><img src="picicon.png" style="float:left;"><p style="">' + list[i].channelName + '/ ' + timeName + '</p></div>');
                    }
                    $('#picList p').css('margin-bottom', '0px');
                } else {
                    alert('查无图片！');
                    var level = $('#tree').treeview('getSelected')[0].level;
                    if (level > 3)
                        alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '查询图片失败');
                    console.log(data);
                }
            }
        }) // end of ajax   
}


var intervalIds = {};

function getAlertRecords(index) {
    //clearInterval(intervalIds.alertRecords);
    // clearInterval(intervalIds.videoRecords);
    // clearInterval(intervalIds.heartLoseRecords);
    // clearInterval(intervalIds.heartBeatRecords);


    index = index || 0;

    var data = {
        "index": index,
        "size": 5,
    }
    $('#records table thead th').text('');
    $('#records table td').text('\xa0');


    $('#records table thead th:eq(0)').text('设备名');
    $('#records table thead th:eq(1)').text('报警类型');
    $('#records table thead th:eq(2)').text('时间');
    $('#records table thead th:eq(3)').text('处理时间');
    $('#records table thead th:eq(4)').text('处理状态');
    $('#records table thead th:eq(5)').text('报警信息');
    $.ajax({
        url: '/v1/query/device/alert/logs',
        type: "GET",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                $('#records ul li:eq(0)').attr('index', index);
                console.log($('#records ul li:eq(0)').attr('index'));
                if (parseInt($('#records ul li:eq(0)').attr('index')) == 0) {
                    $('#recordLast').css('visibility', 'hidden');
                } else {
                    $('#recordLast').css('visibility', 'visible');
                }

                var list = data.result.list;
                for (var i = 0; i < list.length; ++i) {
                    var type = '';
                    var status = '';
                    switch (list[i].alertType) {
                        case 0:
                            type = "工况告警";
                            break;
                        case 1:
                            type = "图片告警";
                            break;
                        default:
                            break;
                    }

                    switch (list[i].processStatus) {
                        case 0:
                            status = "未推送";
                            html = "<button class='alertHandle' style='padding-top:0px;padding-bottom:0px;'>处理</button>"
                            $('#records table tbody tr:eq(' + i + ') td:eq(4)').append(html)
                            break;
                        case 1:
                            status = "已推送";
                            html = "<button class='alertHandle' style='padding-top:0px;padding-bottom:0px;'>处理</button>"
                            $('#records table tbody tr:eq(' + i + ') td:eq(4)').append(html)
                            break;
                        case 2:
                            status = "已消警";
                            html = "<button class='alertHandle' style='padding-top:0px;padding-bottom:0px;'>处理</button>"
                            $('#records table tbody tr:eq(' + i + ') td:eq(4)').append(html)
                            break;
                        case 3:
                            status = "已确认为真告警";
                            $('#records table tbody tr:eq(' + i + ') td:eq(4)').empty();
                            $('#records table tbody tr:eq(' + i + ') td:eq(4)').text('已处理');
                            break;
                        case 4:
                            status = "已确认为假告警";
                            $('#records table tbody tr:eq(' + i + ') td:eq(4)').empty();
                            $('#records table tbody tr:eq(' + i + ') td:eq(4)').text('已处理');
                            break;
                        default:
                            break;
                    }
                    $('#records table tbody tr:eq(' + i + ')').attr('deviceId', list[i].deviceId);
                    $('#records table tbody tr:eq(' + i + ')').attr('alertId', list[i].alertId);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').text(list[i].deviceName);
                    $('#records table tbody tr:eq(' + i + ') td:eq(1)').text(type);
                    $('#records table tbody tr:eq(' + i + ') td:eq(2)').text(list[i].time);
                    $('#records table tbody tr:eq(' + i + ') td:eq(3)').text(list[i].processTime);

                    $('#records table tbody tr:eq(' + i + ') td:eq(5)').text(list[i].alertMessage);
                }

                $('#recordCount').text('第' + (index + 1) + '页,共' + Math.ceil(data.result.total / 5) + '页')
                if (data.result.more <= 0) {
                    $('#recordNext').css('visibility', 'hidden');
                } else {
                    $('#recordNext').css('visibility', 'visible');
                }
            } else if (data.code == 4007) {
                $('#recordNext').hide();

                alert('获取设备告警记录为空');

            } else {
                alert('获取设备告警记录失败');
            }
        }
    }); // end of /v1/query/device/alert/logs ajax
}

function tempDevice(data) {
    $.ajax({
        url: '/v1/device/cmd',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                var list = data.result.list;
                $('#tempArea table tbody').empty();
                for (var i = 0; i < list.length; i++) {
                    // switch(list[i].status){
                    //     case 0:
                    //         var html = '<td style="color:red">离线</td>';
                    //         break;
                    //     case 1:
                    //         var html = '<td style="color:blue">在线</td>';
                    //         break;
                    //     default:
                    //         var html = '<td>离线</td>';
                    //         break;
                    // } 
                    $('#tempArea table tbody').append('<tr id="' + list[i].cmdId + '"><td>' + list[i].cmdId + '</td><td>' + list[i].temperature + '</td><td>' + list[i].time + '</td></tr>')
                }
            } else {
                alert('获取设备(组)失败');
            }
        }
    });
}

// function tempDevice(data){
//     $.ajax({
//         url:'/v1/device/map/range',
//         type:"POST",
//         data: JSON.stringify(data),
//         contentType:"application/json; charset=utf-8",
//         dataType:"json",
//         async:false,
//         success: function(data){
//             if (data.code == 0) {
//                 var list = data.result.list;
//                 $('#tempArea table tbody').empty();
//                 for(var i=0;i<list.length;i++){
//                     switch(list[i].status){
//                         case 0:
//                             var html = '<td style="color:red">离线</td>';
//                             break;
//                         case 1:
//                             var html = '<td style="color:blue">在线</td>';
//                             break;
//                         default:
//                             var html = '<td>离线</td>';
//                             break;
//                     } 
//                     $('#tempArea table tbody').append('<tr id="'+list[i].deviceID+'"><td>'+list[i].name+'</td><td>'+list[i].temperature+'</td><td>2017-02-01</td>'+html+'</tr>')
//                 }
//             } else {
//                 alert('获取设备(组)' + data.id + '失败');
//             }
//         }
//     });
// }

function checkUser(inputData) {
    var data = {
        'userName': inputData.userName,
        'password': inputData.password,
    };
    var flag = 0;
    $.ajax({
        url: '/v1/user/check',
        type: "GET",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code != 0) {
                // alert('用户名或密码有误!');
            } else {
                flag = 1;
            }
        }
    });
    return flag;
}

function mapDevice(data) {
    $.ajax({
        url: '/v1/device/map/range',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function(data) {
            if (data.code == 0) {
                map.clearOverlays();
                var list = data.result.list;
                var data_info = [];
                var contentTemplte =
                    "<div style='width:100%;height:100%;' id='tmpid'>" +
                    "<div style='float:left;width:30%;'><h5 style='margin:0px;'>名字</h5><p style='margin:0px;'>电压</p><p style='margin:0px;'>充电电压</p><p style='margin:0px;'>温度</p><p style='margin:0px;'>警报</p><p style='margin:0px;'>状态</p></div>" +
                    "<div id='pics' style='float:left;width:70%; height:50px;'><img id='imgDemo' width='350' height='200' src='thumbnail' data-original='url' title='告警图片'/><button type='button' class='mapLastPic'>上一张</button><button type='button' class='mapNextPic'>下一张</button></div>" +
                    "</div>"
                var contents = [];
                for (var i = 0; i < list.length; ++i) {
                    data_info[i] = {}
                    data_info[i].id = list[i].deviceID;
                    data_info[i].name = list[i].name;
                    data_info[i].latitude = list[i].latitude;
                    data_info[i].longitude = list[i].longitude;
                    data_info[i].batteryVoltage = list[i].batteryVoltage;
                    data_info[i].chargeVoltage = list[i].chargeVoltage;
                    data_info[i].temperature = list[i].temperature;
                    data_info[i].alert = list[i].alert;
                    data_info[i].alertId = list[i].alertId;
                    data_info[i].status = list[i].status;
                    data_info[i].picUrl = list[i].picUrl;
                    data_info[i].thumbnailPicUrl = list[i].thumbnailPicUrl;
                    contents[i] = contentTemplte;
                    contents[i] = contents[i].replace('tmpid', list[i].deviceID);
                    contents[i] = contents[i].replace('名字', list[i].name);
                    contents[i] = contents[i].replace('电压', '电压:' + list[i].batteryVoltage);
                    contents[i] = contents[i].replace('充电电压', '充电电压:' + list[i].chargeVoltage);
                    contents[i] = contents[i].replace('温度', '温度:' + list[i].temperature);
                    contents[i] = contents[i].replace('警报', '警报:' + list[i].alert);
                    contents[i] = contents[i].replace('thumbnail', list[i].picUrl);
                    contents[i] = contents[i].replace('url', list[i].picUrl);
                    if (list[i].status == 0) {
                        var status = '离线'
                    } else {
                        var status = '在线'
                    }
                    contents[i] = contents[i].replace('状态', '状态:' + status);
                }

                var points = [];
                for (var i = 0; i < data_info.length; i++) {
                    points.push(new BMap.Point(data_info[i].longitude, data_info[i].latitude));

                    if (data_info[i].status == 1) {
                        var marker = new BMap.Marker(new BMap.Point(data_info[i].longitude, data_info[i].latitude)); // 创建标注
                    } else {
                        var iconImg = createIcon();
                        var marker = new BMap.Marker(new BMap.Point(data_info[i].longitude, data_info[i].latitude), {
                            icon: iconImg
                        }); // 创建标注
                    }

                    var label = new BMap.Label(data_info[i].name, {
                        "offset": new BMap.Size(colorIcons.red.lb - colorIcons.red.x + 10, -20)
                    });

                    map.addOverlay(marker); // 将标注添加到地图中
                    marker.setLabel(label);
                    label.setStyle({
                        borderColor: "#808080",
                        color: "#333",
                        cursor: "pointer",
                        borderWidth: '0px',
                        backgroundColor: 'transparent'
                    });
                    addClickHandler(contents[i], marker);
                }
                map.setViewport(points);　　　　　　　
            } else {
                alert('获取设备(组)' + data.id + '失败');
            }
        }
    });
}

//`MAP

var opts = {
    width: 500, // 信息窗口宽度
    height: 250, // 信息窗口高度
    title: "", // 信息窗口标题
    enableMessage: true //设置允许信息窗发送短息
};

var colorIcons = {
    green: {
        w: 21,
        h: 21,
        l: 0,
        t: 0,
        x: 6,
        lb: 5
    },
    red: {
        w: 21,
        h: 21,
        l: 46,
        t: 0,
        x: 6,
        lb: 5
    }
};

function createIcon() {
    // function createIcon(json){
    // var icon = new BMap.Icon("http://app.baidu.com/map/images/us_mk_icon.png", new BMap.Size(json.w,json.h),{imageOffset: new BMap.Size(-json.l,-json.t),infoWindowOffset:new BMap.Size(json.lb+5,1),offset:new BMap.Size(json.x,json.h)})
    var icon = new BMap.Icon("http://7xic1p.com1.z0.glb.clouddn.com/markers.png", new BMap.Size(23, 25), {
        offset: new BMap.Size(10, 25),
        imageOffset: new BMap.Size(0, 0 - 10 * 25)
    });
    return icon;
}

//创建和初始化地图函数：
function initMap() {
    createMap(); //创建地图
    setMapEvent(); //设置地图事件
    addMapControl(); //向地图添加控件
}

//创建地图函数：
function createMap() {
    var map = new BMap.Map("map"); //在百度地图容器中创建一个地图
    var point = new BMap.Point(121.440386, 31.205185); //定义一个中心点坐标
    map.centerAndZoom(point, 18); //设定地图的中心点和坐标并将地图显示在地图容器中
    window.map = map; //将map变量存储在全局
}
//地图事件设置函数：
function setMapEvent() {
    map.enableDragging(); //启用地图拖拽事件，默认启用(可不写)
    map.enableScrollWheelZoom(); //启用地图滚轮放大缩小
    map.enableDoubleClickZoom(); //启用鼠标双击放大，默认启用(可不写)
    map.enableKeyboard(); //启用键盘上下左右键移动地图
}

function addClickHandler(content, marker) {
    marker.addEventListener("click", function(e) {
        openInfo(content, e)
    });
}

function openInfo(content, e) {
    var p = e.target;
    var point = new BMap.Point(p.point.lng, p.point.lat);
    var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象 
    map.openInfoWindow(infoWindow, point); //开启信息窗口
}

//地图控件添加函数：
function addMapControl() {
    //向地图中添加缩放控件
    var ctrl_nav = new BMap.NavigationControl({
        anchor: BMAP_ANCHOR_TOP_LEFT,
        type: BMAP_NAVIGATION_CONTROL_LARGE
    });
    map.addControl(ctrl_nav);
    //向地图中添加缩略图控件
    var ctrl_ove = new BMap.OverviewMapControl({
        anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
        isOpen: 1
    });
    map.addControl(ctrl_ove);
    //向地图中添加比例尺控件
    var ctrl_sca = new BMap.ScaleControl({
        anchor: BMAP_ANCHOR_BOTTOM_LEFT
    });
    map.addControl(ctrl_sca);
}