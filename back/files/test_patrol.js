var intervalIds = {};

$(function(){
    var cookie_sessionId = Cookies.get('sessionId');
    if(cookie_sessionId == undefined) {
        window.location.href = '/login';
    }else{
        var userInfo = getUsersBySession(cookie_sessionId);
        var cookie_userId = userInfo.userId;
        var cookie_userType = parseInt(userInfo.userType);
        var cookie_userName = userInfo.userName;

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

        if(!cookie_userType) {
            $("#tabs_left li:eq(1)").hide();
        }

        $('#nav').css('visibility', 'visible');
        $('#main').css('visibility', 'visible');

        // keep 16:9
        var win_width = parseFloat($(document).width());
        $('body').css('height', win_width * 1080 / 1920 + 'px');
        $('p').each(function() {
            var h = $(this).parent().css('height');
            $(this).css('line-height', h);
        })

        $('a').each(function() {
            var h = $(this).parent().css('height');
            $(this).css('line-height', h);
        })

        // adjust logo
        var w = parseFloat($('#nav_left img').css('width'));
        var img_h = w * 0.2901;
        $('#nav_left img').css('height', img_h + 'px');
        var h = parseFloat($('#nav_left').css('height'));
        $('#nav_left img').css('margin-top', (h - img_h) / 2 + 'px');
        $('#nav_left img').css('margin-bottom', (h - img_h) / 2 + 'px');


        // welcome
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var dayOfWeek = myDate.getDay();
        var dayOfWeekName = ['日', '一', '二', '三', '四', '五', '六'];
        $('#tabs_right p').text('欢迎您: ' + cookie_name + ' 今天是' + year + '年' + month + '月' + day + '月' +
            '   星期' + dayOfWeekName[dayOfWeek]);

        // ````````````````````````````` common use above

        var body_width = parseInt($("body").css("width"));
        var left_width = parseInt($("#main_left").css("width"));
        var patrol_width = body_width-left_width -1;
        console.log(body_width);
        console.log(left_width);
        console.log(patrol_width);
        $('#patrol').css('width',patrol_width+'px');
        var patrol_height = patrol_width * 1120/1920;
        $('#patrol').css('height',patrol_height+'px');


        //datepicker默认日期
        var month0 = (month<10)?('0'+month):(month);
        var day0 = (day<10)?('0'+day):(day);
        var time = year+'-'+month0+'-'+day0;

        //设备列表
        // list1
        var channeltree = channelTree();
        $('#content1').treeview({
            data: channeltree,
            levels: 3,
            showBorder: false,
            showCheckbox: false,
            showTags: false,
            // emptyIcon: "glyphicon glyphicon-facetime-video",
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right"
        });
        $('#content1').addClass('treeSelected');
        setTreeNodeSelected($('#content1'));
        // setTreeNodeSelected4x4($('#content1'));

        // content max height
        var h = parseFloat($('#tree').css('height'));
        var list_h = parseFloat($('#list1').css('height'));
        $('.content').css('max-height', h - 3 * list_h + 'px');

        $('.content ul').css('margin', '0px');
        $('.content ul li').css('background-color', 'rgb(170,247,247)');
        $('.content ul li').css('padding', '10px');
        $('.indent').css('margin', '5px');

        var index = 0;
        var size = 9;
        var data = {
            "userId": cookie_userId,
            "userType": cookie_userType,
            "index" : index,
            "size" : size
        };
        getAllPics(data);

        var index = 0;
        var size = 16;
        var data = {
            "userId": cookie_userId,
            "userType": cookie_userType,
            "index" : index,
            "size" : size
        };
        getAllPics4x4(data);

        if(getSelectedDevice() == -1){
            intervalIds.getAllPics = setInterval(function() {getAllPics(data);}, INTERVAL);
            intervalIds.getAllPics4x4 = setInterval(function() {getAllPics4x4(data);}, INTERVAL);
        }

        $('#list1').click(function() {
            var channeltree = channelTree();
            $('#content1').treeview({
                data: channeltree,
                levels: 3,
                showBorder: false,
                showCheckbox: false,
                showTags: false,
                // emptyIcon: "glyphicon glyphicon-facetime-video",
                collapseIcon: "glyphicon glyphicon-chevron-down",
                expandIcon: "glyphicon glyphicon-chevron-right"
            });

            $('#content1').show();
            $('#content2').hide();
            $('#content3').hide();
            $('.content').removeClass('treeSelected');
            $('#content1').addClass('treeSelected');
            setTreeNodeSelected($('#content1'));
            // setTreeNodeSelected4x4($('#content1'));
        })

        $('#list2').click(function() {
            var linetree = deviceLineTree();
            $('#content2').treeview({
                data: linetree,
                levels: 3,
                showBorder: false,
                showCheckbox: false,
                showTags: false,
                // emptyIcon: "glyphicon glyphicon-facetime-video",
                collapseIcon: "glyphicon glyphicon-chevron-down",
                expandIcon: "glyphicon glyphicon-chevron-right"
            });
            $('#content2').show();
            $('#content1').hide();
            $('#content3').hide();
            $('.content').removeClass('treeSelected');
            $('#content2').addClass('treeSelected');
            setTreeNodeSelected($('#content2'));
            // setTreeNodeSelected4x4($('#content2'));
        })

        $('#list3').click(function() {
            $('#content3').show();
            $('#content2').hide();
            $('#content1').hide();
            $('.content').removeClass('treeSelected');
            $('#content3').addClass('treeSelected');
            setTreeNodeSelected($('#content3'));
            // setTreeNodeSelected4x4($('#content3'));
        })
    }

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

    

    $('#tree').click(function() {
        $('.content ul').css('margin', '0px');
        $('.content ul li').css('background-color', 'rgb(170,247,247)');
        $('.content ul li').css('padding', '10px');
        $('.indent').css('margin', '5px');
    })

    

    // 巡检操作

    $('#picsNumChange').click(function(){
    	$('#pics').hide();
        $('#pics4x4').hide();
        $('#fullMain').hide();
        $('#fullMain4x4').hide();
        if($('body').attr('picsno-data')==undefined || $('body').attr('picsno-data')=='9'){
            $('#pics4x4').show();
            $(this).text('3x3');
            $('body').attr('picsno-data','16');
        }else{
            $('#pics').show();
            $(this).text('4x4');
            $('body').attr('picsno-data','9');
        }
    })

    $('#picsNumChangeFull').click(function(){
    	$('#pics').hide();
        $('#pics4x4').hide();
        $('#fullMain').hide();
        $('#fullMain4x4').hide();
        if($('body').attr('picsno-data')==undefined || $('body').attr('picsno-data')=='9'){;
            $('#fullMain4x4').show();
            $(this).text('3x3');
            $('body').attr('picsno-data','16');
        }else{
            $('#fullMain').show();
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
        }else{
            $('#fullMain4x4').show();
        }
        $('body').attr('screen-data','full');
    })

    $('#exitFullScreen').click(function(){
        $('#pics').hide();
        $('#pics4x4').hide();
        $('#fullMain').hide();
        $('#fullMain4x4').hide();
        var tmp = $('body').attr('picsno-data');
        if(tmp == '16'){
            $('#pics4x4').show();
        }else{
            $('#pics').show();
        }
        $('#nav').show();
        $('#main').show();
        
        $('#hoverArea').hide();
        $('body').attr('screen-data','notfull');
    })

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
                $('#pics').hide();
                $('#pics4x4').hide();
                $('#fullMain').hide();
                $('#fullMain4x4').hide();
                var tmp = $('body').attr('picsno-data');
                if(tmp == '16'){
                    $('#pics4x4').show();
                }else{
                    $('#pics').show();
                }
            }
        }
    });

    $('#hoverArea').mouseover(function(){
        $(this).css('background-color','rgb(3,161,161)');
        $('#hoverContent').show();
    })

    $('#hoverArea').mouseout(function(){
        $(this).css('background-color','transparent');
        $('#hoverContent').hide();
    })

    

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

    $('img').dblclick(function(){
        
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



    function channelTree() {
        var data = {
            "userId": cookie_userId,
            "userType": cookie_userType
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
                    console.log('获取设备树失败');
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
                    console.log('获取设备树失败');
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

    function getSelectedDevice() {
        if ($('.treeSelected').treeview('getSelected').length != 1 || $('.treeSelected').treeview('getSelected')[0].type == undefined || $('.treeSelected').treeview('getSelected')[0].type != 3) {
            return -1;
        }
        return $('.treeSelected').treeview('getSelected')[0].id;
    }

    function setTreeNodeSelected(selector) {
        selector.data().treeview.options.multiSelect=false;
        selector.unbind('nodeSelected');
        selector.on('nodeSelected', function(event, data) {
            var type = selector.treeview('getSelected')[0].type;
            var tmp = selector.treeview('getSelected')[0].id;
            var deviceId = tmp.slice(0,17);
            var channelNo = tmp.slice(18,19);
            var name = selector.treeview('getSelected')[0].text;
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

});