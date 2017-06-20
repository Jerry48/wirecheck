var cookie_sessionId = Cookies.get('sessionId');
function getUsersBySession (){
    var data = {
        "sessionId": cookie_sessionId,
    };

    var userInfo = {};
    $.ajax({
        url:'/v1/user/info/session',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                    // todo session clear
                    if(data.result.flag==0){
                        window.location.href ='/login';
                    }else{
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


function getUserPrivileges (){
    var data = {'userName': cookie_userName,};
    var userPrivileges = {};
    $.ajax({
        url:'/v1/user/details',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                    // todo session clear
                    if(data.result.flag==0){
                        window.location.href ='/login';
                    }else{
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

var INTERVAL = 20000;

$(function(){
    //页面显示
    //nav

    //logout
    $('#logout').click(function(){

        var data = {
            'userId': cookie_userId
        }
        $.ajax({
            url:'/v1/user/logout',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            async:false,
            success: function(data){
                if (data.code == 0) {
                    // todo session clear
                    window.location.href = 'login';
                    Cookies.set('sessionId',null);
                } else {
                    alert('用户登出失败');
                    console.log(data);
                }
            }
        });
    });

    var height = parseInt($("#title").css("height"));
    $("#title").css('line-height',height+'px');
    $("#title a").css('font-size',height*0.5+'px');
    $("#title").css('padding-left',height*0.2+'px');

    var title_height = height;
    var icon_height = parseInt($("#menu1ul").css('height'));
    $("#menu1ul").css('top',(title_height-icon_height)/2+'px');
    
    var height = parseInt($("#welcome").css("height"));
    $("#welcome").css('line-height',height+'px');
    $("#welcome p").css('font-size',height*0.5+'px');
    $("#welcome").css('padding-left',height*0.2+'px');

    var body_height = parseInt($("body").css("height"));
    var nav_height = parseInt($("#nav").css("height"));
    var patrol_height = body_height-nav_height;
    $('#patrol').css('height',patrol_height+'px');
    var patrol_width = patrol_height * 0.95 / 3 * 1920/1080 *3;
    $('#patrol').css('width',patrol_width+'px');

    var body_width = parseInt($("body").css("width"));
    var devices_width = body_width - patrol_width;
    $('#devices').css('width',devices_width+'px');

    // $('body').show();
    //登录用户
    if((Cookies.get("sessionId")== null) || (Cookies.get("sessionId")== "")){
        $('body').hide();
        window.location.href = 'login';
    }else{
        
        // if(Cookies.get("userType")== 0){
        //     //reserve
        //     $('.container-fluid div:eq(3) a:eq(0)').attr('href','/general_user');
        // }
        // $('body').show();
    }

    //欢迎词
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var dayOfWeek = myDate.getDay();
    var dayOfWeekName = ['日','一', '二','三','四', '五','六'];
    $('#welcome p').text('欢迎您: ' + cookie_name + ' 今天是' + year + '年' + month + '月' + day + '月' +
                                                 '   星期' +dayOfWeekName[dayOfWeek]);

    //datepicker默认日期
    var month0 = (month<10)?('0'+month):(month);
    var day0 = (day<10)?('0'+day):(day);
    var time = year+'-'+month0+'-'+day0;

    //设备列表
    var tmpData = channelTree();
    var htree = parseInt($('#devices').css('height')) - parseInt($('#devices ul').css('height'))+'px';
    var wtree = parseInt($('#tree').css('width'))+'px';
    $('#tree').css('height',htree);
    $('#tree').treeview({
        data: tmpData,
        showBorder:false,
        levels:3,
        emptyIcon:"glyphicon glyphicon-facetime-video",
        collapseIcon:"glyphicon glyphicon-chevron-down",
        expandIcon:"glyphicon glyphicon-chevron-right",
    });
    $('#tree').css('font-size','12px');
    // $('#tree ul').css('width','200px');
    setTreeNodeSelected();

    //左侧列表
    $('#devices ul:eq(0) li').click(function(){
        var text = $(this).text();
        if(text=="设备列表"){
            var tmpData = channelTree();
        }else if(text=="线路列表"){
            var tmpData = deviceLineTree();
        }else{
            //巡检分组
        }
        $('#tree').treeview(
        {
            data: tmpData,

            showBorder:false,
            showCheckbox:false,
            showTags:false,
            emptyIcon:"glyphicon glyphicon-facetime-video",
            
        });
        $('#tree').css('font-size','12px');
        setTreeNodeSelected();
    })

    // 巡检操作

    $('#picsNumChange').click(function(){
        if($('body').attr('picsno-data')==undefined || $('body').attr('picsno-data')=='9'){
            $('#pics').hide();
            $('#pics4x4').show();
            $(this).text('3x3');
            $('body').attr('picsno-data','16');
        }else{
            $('#pics').show();
            $('#pics4x4').hide();
            $(this).text('4x4');
            $('body').attr('picsno-data','9');
        }
    })

    $('#picsNumChangeFull').click(function(){
        if($('body').attr('picsno-data')==undefined || $('body').attr('picsno-data')=='9'){
            $('#fullMain').hide();
            $('#fullMain4x4').show();
            $(this).text('3x3');
            $('body').attr('picsno-data','16');
        }else{
            $('#fullMain').show();
            $('#fullMain4x4').hide();
            $(this).text('4x4');
            $('body').attr('picsno-data','9');
        }
    })

    $('#fullScreen').click(function(){
        $('#nav').hide();
        $('#main').hide();
        $('#hoverArea').show();
        $('#pics').hide();
        $('#pics4x4').hide();
        $('#fullMain').hide();
        $('#fullMain4x4').hide();
        var tmp = $('body').attr('picsno-data');
        if(tmp == undefined || tmp == '9'){
            $('#fullMain').show();
            $('#pics').show();
        }else{
            $('#fullMain4x4').show();
            $('#pics4x4').show();
        }
        $('body').attr('screen-data','full');
    })

    $('#exitFullScreen').click(function(){
        $('#pics').hide();
        $('#pics4x4').hide();
        $('#fullMain').hide();
        $('#fullMain4x4').hide();
        var tmp = $('body').attr('picsno-data');
        if(tmp == undefined || tmp == '9'){
            $('#fullMain').show();
            $('#pics').show();
        }else{
            $('#fullMain4x4').show();
            $('#pics4x4').show();
        }
        $('#nav').show();
        $('#main').show();
        
        $('#hoverArea').hide();
        $('body').attr('screen-data','notfull');
    })

    $('#hoverArea').mouseover(function(){
        $(this).css('background-color','rgb(176,196,222)');
        $('#hoverContent').show();
    })

    $('#hoverArea').mouseout(function(){
        $(this).css('background-color','transparent');
        $('#hoverContent').hide();
    })

    var index = 0;
    var size = 9;
    var data = {
        "index" : index,
        "size" : size
    };
    getAllPics(data);

    var index = 0;
    var size = 16;
    var data = {
        "index" : index,
        "size" : size
    };
    getAllPics4x4(data);

    if(getSelectedDevice() == -1){
        intervalIds.getAllPics = setInterval(function() {getAllPics(data);}, INTERVAL);
        intervalIds.getAllPics4x4 = setInterval(function() {getAllPics4x4(data);}, INTERVAL);
    }

    $(document).ready(function () {
        /** Coding Here */
    }).keydown(function (e) {
        if (e.which === 27) {
            /** 这里编写当ESC按下时的处理逻辑！ */
            if($('body').attr('screen-data')=='full'){
                $('#nav').show();
                $('#main').show();
                $('#fullMain').hide();
                $('#hoverArea').hide();
                $('body').attr('screen-data','notfull');
            }
        }
    });

    //修改巡检时间间隔
    $('.interval').change(function(){
        var val = $(this).val();
        $('.interval').val(val);
        INTERVAL = parseInt(val) * 1000;
        if(getSelectedDevice() == -1){
            clearInterval(intervalIds.getAllPics);
            clearInterval(intervalIds.getAllPics4x4);
            intervalIds.getAllPics = setInterval(function() {getAllPics(data);}, INTERVAL);
            intervalIds.getAllPics4x4 = setInterval(function() {getAllPics4x4(data);}, INTERVAL);
        }
    })

//`push
    $('img').click(function(){
        var picId = $(this).attr('picId');
        var deviceId  =  $(this).attr('deviceId');
        $('body').attr('selectedPic',picId);
        $('body').attr('selectedDevice',deviceId);
        $('img').css('border','');
        $(this).css('border','2px solid red');
    })

    $('.push').click(function(){
        if($('body').attr('selectedPic')==''||$('body').attr('selectedPic')==undefined){
            alert('请选择图片！');
        }else{
            var picId = $('body').attr('selectedPic');
            var deviceId = $('body').attr('selectedDevice');
            var data = {
                "deviceId": deviceId,
                "userId": cookie_userId,
            }
            $.ajax({
                url:'/v1/device/list/users',
                type:"GET",
                data: data,
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                async:false,
                success: function(data){
                    $('#modalPush .modal-body').empty();
                    if (data.code == 0) {
                        var list = data.result.list;
                        for (var i = 0; i < list.length; ++i) {
                            var $ctrl = '<div><input userId="'+list[i].userId+'" type="checkbox">'+list[i].userName+'___微信：'+list[i].nickname+'</div>';
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

    $('#modalPush .modal-footer button:eq(0)').click(function(){
        var picId = $('body').attr('selectedPic');
        var deviceId = $('body').attr('selectedDevice');
        var picIds = [];
        picIds.push({'picId':picId});
        var userIds = [];
        $('#modalPush input:checked').each(function() {
            userIds.push({'userId':$(this).attr('userId')});
        });
        var data = {
            "userId": cookie_userId,
            "deviceId": deviceId,
            "picIds": picIds,
            'userIds': userIds
        }
        $.ajax({
            url:'/v1/command/push/pics',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    alert('推送成功');
                    $('#modalPush').modal('hide');
                    $('#modalPush .modal-body').empty();

                } else {
                    alert('推送失败');
                }
            }
        }); // end of ajax /v1/command/push/pics
    }); // end of click
});

var intervalIds = {};

function channelTree() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url:'/v1/device/tree2',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
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
        url:'/v1/device/tree/line',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        }
    })
    return rootNode;
}

function getAllPics(data) {
    // clearInterval(intervalIds.findDevicePic);
    var outerData = data;
    $.ajax({
        url:'/v1/search/pics/all',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;

                for (var i = 0; i < list.length; ++i) {
                    if (list[i].picType == 2){
                            // for ref pic
                    }else{
                        $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        $('#fullMain img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#fullMain img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#fullMain img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#fullMain img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#fullMain img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        var viewer = new Viewer(document.getElementById('pics'), {
                            url: 'data-original'
                        });

                        var viewer = new Viewer(document.getElementById('fullMain'), {
                            url: 'data-original'
                        });
                    }
                    
                }
            } else {
                console.log(data);
            }
        }
    })// end of ajax   
}

function getNextPage(data) {
    // clearInterval(intervalIds.findDevicePic);
    // alert(INTERVAL);
    var outerData = data;
    $.ajax({
        url:'/v1/search/pics/device',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
             
                var list = data.result.list;

                for (var i = 0; i < list.length; ++i) {
                    if (list[i].picType == 2){
                            // for ref pic
                    }else{
                        $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        $('#fullMain img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#fullMain img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#fullMain img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#fullMain img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#fullMain img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        var viewer = new Viewer(document.getElementById('pics'), {
                            url: 'data-original'
                        });

                        var viewer = new Viewer(document.getElementById('fullMain'), {
                            url: 'data-original'
                        });
                    }
                }
            } else {
                console.log(data);
            }
        }
    })// end of ajax   
}

function setTreeNodeSelected() {
    $('#tree').data().treeview.options.multiSelect=false;
    $('#tree').unbind('nodeSelected');
    $('#tree').on('nodeSelected', function(event, data) {
        var type = $('#tree').treeview('getSelected')[0].type;
        var tmp = $('#tree').treeview('getSelected')[0].id;
        var deviceId = tmp.slice(0,17);
        var channelNo = tmp.slice(18,19);
        var name = $('#tree').treeview('getSelected')[0].text;
        if ($('#devices ul li').filter('.chosen').text() == '设备列表') {
            $('input[name="daterange"]').val('');
            if (type == 3){
                type = 0;
                
            } else {
                type = 1;
            }
        } else {
            if (type == 3){
                type = 0;
            } else {
                type = 2;
            }
        }
        
        var size = 9;
        var index = 0;
        var data = {
            "channelNo":channelNo,
            "type": type,
            "id":  deviceId,
            "size": size,
            "index": index,
            "startTime": "1900-01-01 00:00:00",
            "endTime": "2900-01-01 00:00:00"
        }
        // setDeviceStatus();
        clearInterval(intervalIds.getAllPics);
        $('#pics img').attr('src', '');
        $('#pics img').attr('picId', '');
        $('#pics img').attr('channelNo', '');

        $('#fullMain img').attr('src', '');
        $('#fullMain img').attr('picId', '');
        $('#fullMain img').attr('channelNo', '');
        clearInterval(intervalIds.findDevicePic);
        getNextPage(data);
        intervalIds.findDevicePic = setInterval(function() {getNextPage(data);}, INTERVAL);

        var size = 16;
        var index = 0;
        var data = {
            "channelNo":channelNo,
            "type": type,
            "id":  deviceId,
            "size": size,
            "index": index,
            "startTime": "1900-01-01 00:00:00",
            "endTime": "2900-01-01 00:00:00"
        }
        // setDeviceStatus();
        clearInterval(intervalIds.getAllPics4x4);
        $('#pics4x4 img').attr('src', '');
        $('#pics4x4 img').attr('picId', '');
        $('#pics4x4 img').attr('channelNo', '');

        $('#fullMain4x4 img').attr('src', '');
        $('#fullMain4x4 img').attr('picId', '');
        $('#fullMain4x4 img').attr('channelNo', '');
        clearInterval(intervalIds.findDevicePic4x4);
        getNextPage4x4(data);
        intervalIds.findDevicePic4x4 = setInterval(function() {getNextPage4x4(data);}, INTERVAL);
    }) // end of nodeSelected event
}

function getAllPics4x4(data) {
    // clearInterval(intervalIds.findDevicePic);
    var outerData = data;
    $.ajax({
        url:'/v1/search/pics/all',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;

                for (var i = 0; i < list.length; ++i) {
                    if (list[i].picType == 2){
                            // for ref pic
                    }else{
                        $('#pics4x4 img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#pics4x4 img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#pics4x4 img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#pics4x4 img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#pics4x4 img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        $('#fullMain4x4 img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        var viewer = new Viewer(document.getElementById('pics4x4'), {
                            url: 'data-original'
                        });

                        var viewer = new Viewer(document.getElementById('fullMain4x4'), {
                            url: 'data-original'
                        });
                    }
                    
                }
            } else {
                console.log(data);
            }
        }
    })// end of ajax   
}

function getNextPage4x4(data) {
    // clearInterval(intervalIds.findDevicePic);
    var outerData = data;
    $.ajax({
        url:'/v1/search/pics/device',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
             
                var list = data.result.list;

                for (var i = 0; i < list.length; ++i) {
                    if (list[i].picType == 2){
                            // for ref pic
                    }else{
                        $('#pics4x4 img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#pics4x4 img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#pics4x4 img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#pics4x4 img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#pics4x4 img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        $('#fullMain4x4 img:eq(' + i + ')').attr('src', list[i].picUrl);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#fullMain4x4 img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                        var viewer = new Viewer(document.getElementById('pics4x4'), {
                            url: 'data-original'
                        });

                        var viewer = new Viewer(document.getElementById('fullMain4x4'), {
                            url: 'data-original'
                        });
                    }
                    
                }
            } else {
                console.log(data);
            }
        }
    })// end of ajax   
}

function setTreeNodeSelected4x4() {
    $('#tree').data().treeview.options.multiSelect=false;
    $('#tree').unbind('nodeSelected');
    $('#tree').on('nodeSelected', function(event, data) {
        var type = $('#tree').treeview('getSelected')[0].type;
        var tmp = $('#tree').treeview('getSelected')[0].id;
        var deviceId = tmp.slice(0,17);
        var channelNo = tmp.slice(18,19);
        var name = $('#tree').treeview('getSelected')[0].text;
        if ($('#devices ul li').filter('.chosen').text() == '设备列表') {
            $('input[name="daterange"]').val('');
            if (type == 3){
                type = 0;
                
            } else {
                type = 1;
            }
        } else {
            if (type == 3){
                type = 0;
            } else {
                type = 2;
            }
        }
        
        // var size = 9;
        var size = 16;
        var index = 0;
        $('#devices ul li a:eq(0)').attr('pic-index', 0);
        var data = {
            "channelNo":channelNo,
            "type": type,
            "id":  deviceId,
            "size": size,
            "index": index,
            "startTime": "1900-01-01 00:00:00",
            "endTime": "2900-01-01 00:00:00"
        }
        // setDeviceStatus();
        clearInterval(intervalIds.getAllPics4x4);
        $('#pics4x4 img').attr('src', '');
        $('#pics4x4 img').attr('picId', '');
        $('#pics4x4 img').attr('channelNo', '');

        $('#fullMain4x4 img').attr('src', '');
        $('#fullMain4x4 img').attr('picId', '');
        $('#fullMain4x4 img').attr('channelNo', '');
        clearInterval(intervalIds.findDevicePic);
        getNextPage4x4(data);
        intervalIds.findDevicePic = setInterval(function() {getNextPage4x4(data);}, INTERVAL);
    }) // end of nodeSelected event
}

function getSelectedDevice(){
    if ($('#tree').treeview('getSelected').length != 1 || $('#tree').treeview('getSelected')[0].type == undefined
        || $('#tree').treeview('getSelected')[0].type != 3) {
        return -1;
    }
    return $('#tree').treeview('getSelected')[0].id;
}