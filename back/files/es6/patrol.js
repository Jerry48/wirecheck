$(function(){
    const cookie_sessionId = Cookies.get('sessionId');
    const userInfo = getUsersBySession(cookie_sessionId);
    const cookie_userId = userInfo.userId;
    const cookie_userType = parseInt(userInfo.userType);
    const cookie_userName = userInfo.userName;
    const userDetails = getUserDetails(cookie_userName);
    const cookie_usrEdit = userDetails.usrEdit;
    const cookie_pwdEdit = userDetails.pwdEdit;
    const cookie_channelSet = userDetails.channelSet;
    const cookie_deviceOp = userDetails.deviceOp;
    const cookie_wechatPush = userDetails.wechatPush;
    const cookie_createGroup = userDetails.createGroup;
    const cookie_name = userDetails.name;

    if(!cookie_userType) {
        $("#tabs_left li:eq(1)").hide();
    }

    initialize();

    $('#nav').css('visibility', 'visible');
    $('#main').css('visibility', 'visible');

    function initialize(){
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


        // pics
        $('body').attr('allpic-index', 0);
        $('body').attr('if-all', 1);

        welcome(cookie_name);

        // ````````````````````````````` common use above

        var body_width = parseInt($("body").css("width"));
        var left_width = parseInt($("#main_left").css("width"));
        var patrol_width = body_width-left_width -1;
        // console.log(body_width);
        // console.log(left_width);
        // console.log(patrol_width);

        
        $('#patrol').css('width',patrol_width+'px');
        var patrol_height = patrol_width * 1120/1920;
        $('#patrol').css('height',patrol_height+'px');


        function listRefresh(data, selector, levels, mapFlag){
            $('.content').removeClass('treeSelected');
            $('.content').hide();
            selector.treeview({
                data: data,
                levels: levels,
                showBorder: false,
                showCheckbox: false,
                showTags: false,
                collapseIcon: "glyphicon glyphicon-chevron-down",
                expandIcon: "glyphicon glyphicon-chevron-right",
                backColor: "rgb(170, 247, 247)",
                color: "rgb(1, 111, 111)",
                selectedBackColor: "rgb(1, 111, 111)",
                selectedColor: "rgb(170, 247, 247)",
            });
            selector.show();
            selector.addClass('treeSelected');
            setTreeNodeSelected(selector);
        }

        //设备列表
        // list1
        listRefresh(channelTree(), $('#content1'), 3, false);
        // setTreeNodeSelected4x4($('#content1'));

        // content max height
        var h = parseFloat($('#tree').css('height'));
        var list_h = parseFloat($('#list1').css('height'));
        $('.content').css('max-height', h - 2 * list_h + 'px');

        $('.content ul').css('margin', '0px');
        // $('.content ul li').css('background-color', 'rgb(170,247,247)');
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
            listRefresh(channelTree(), $('#content1'), 3, false);
        })

        $('#list2').click(function() {
            listRefresh(channelLineTree(), $('#content2'), 2, false);
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
    
    // buttons
    $('#picLast').click(function() {
        if ($('body').attr('if-all') == 1) {
            const index = parseInt($('body').attr('allpic-index'));
            const size = 9;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": index - 1,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPics(data);
            data.size = 16;
            getAllPics4x4(data);
        } else {
            const id = $('body').attr('pic-deviceId');
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 9;
            const index = parseInt($('body').attr('pic-index'));
            const type = 0;
            const data = {
                "channelNo": channelNo,
                "id": id,
                "size": size,
                "type": type,
                "index": index - 1,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            getNextPage(data);
            data.size = 16;
            getNextPage4x4(data);
        }
    });

    $('#picNext').click(function() {
        console.log('adf');
        if ($('body').attr('if-all') == 1) {
            const index = parseInt($('body').attr('allpic-index'));
            const size = 9;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": index + 1,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPics(data);
            data.size = 16;
            getAllPics4x4(data);
        } else {
            const id = $('body').attr('pic-deviceId');
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 9;
            const index = parseInt($('body').attr('pic-index'));
            const type = 0;
            const data = {
                "channelNo": channelNo,
                "id": id,
                "size": size,
                "type": type,
                "index": index + 1,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            getNextPage(data);
            data.size = 16;
            getNextPage4x4(data);
        }
    });

    $('#refresh').click(function() {
        if ($('body').attr('if-all') == 1) {
            const index = parseInt($('body').attr('pic-index'));
            const size = 9;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": 0,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPics(data);
            data.size = 16;
            getAllPics4x4(data);
        } else {
            const id = $('body').attr('pic-deviceId');
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 9;
            const index = parseInt($('body').attr('pic-index'));
            const type = 0;
            const data = {
                "channelNo": channelNo,
                "id": id,
                "size": size,
                "type": type,
                "index": 0,
                "startTime": "1900-01-01 00:00:00",
                "endTime": "2900-01-01 00:00:00"
            }
            getNextPage(data);
            data.size = 16;
            getNextPage4x4(data);
        }
    })

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
        // $('.content ul li').css('background-color', 'rgb(170,247,247)');
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

    $('#push').click(function(){
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


    function channelLineTree() {
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

                    $('body').attr('allpic-index', outerData.index);
                    $('body').attr('if-all', 1);

                    for (var i = 0; i < list.length; ++i) {
                        if (list[i].picType == 2){
                                // for ref pic
                        }else{
                            $('#pics img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                            $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                            $('#fullMain img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
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
                    $('body').attr('pic-index', outerData.index);
                    $('body').attr('pic-deviceId', outerData.id);
                    $('body').attr('if-all', 0);

                    var list = data.result.list;
                    for (var i = 0; i < list.length; ++i) {
                        if (list[i].picType == 2){
                                // for ref pic
                        }else{
                            $('#pics img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                            $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                            $('#fullMain img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
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
                            $('#pics4x4 img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                            $('#pics4x4 img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#pics4x4 img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#pics4x4 img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#pics4x4 img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                            $('#fullMain4x4 img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
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
                            $('#pics4x4 img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                            $('#pics4x4 img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#pics4x4 img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#pics4x4 img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#pics4x4 img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                            $('#fullMain4x4 img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
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
            $("img").css('border', '0px');
            var type = selector.treeview('getSelected')[0].type;
            var tmp = selector.treeview('getSelected')[0].id;
            var deviceId = tmp.slice(0,17);
            var channelNo = tmp.slice(18,19);
            var name = selector.treeview('getSelected')[0].text;
            $('body').attr('pic-deviceId',deviceId);
            $('body').attr('pic-channelNo',channelNo);
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