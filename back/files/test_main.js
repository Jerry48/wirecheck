$(function() {
	$("body").hide();
    const cookie_sessionId = Cookies.get('sessionId');
    let cookie_userId = "";
    let cookie_userType = 0;
    let cookie_userName = "";
    let cookie_name = "";

    if(cookie_sessionId === undefined) {
        window.location.href = "/login";
    }else{
    	$("body").show();
    	const userInfo = getUsersBySession(cookie_sessionId);
        cookie_userId = userInfo.userId;
        cookie_userType = parseInt(userInfo.userType);
        cookie_userName = userInfo.userName;

        const userDetails = getUserDetails(cookie_userName);
        cookie_name = userDetails.name;
        
        if(!cookie_userType) {
            $("#user").hide();
        }

        $('#nav').css('visibility', 'visible')
        $('#main').css('visibility', 'visible')
        initialize();
    }

    function initialize() {
    	// keep 16:9
	    let win_width = parseFloat($(document).width());
	    $('body').css('height', win_width * 1080 / 1920 + 'px');
	    
	    $('#pics14 p').each(function() {
	        let h = $(this).parent().css('height');
	        $(this).css('line-height', h);
	    })

		$('#buttons_right p').each(function() {
	        let h = $(this).parent().css('height');
	        $(this).css('line-height', h);
	    })

	    $('a').each(function() {
	        let h = $(this).parent().css('height');
	        $(this).css('line-height', h);
	    })

	    $("p").css("margin-bottom", "0px");

	    // adjust logo
	    let w = parseFloat($('#nav_left img').css('width'));
	    let img_h = w * 0.2901;
	    $('#nav_left img').css('height', img_h + 'px');
	    let h = parseFloat($('#nav_left').css('height'));
	    $('#nav_left img').css('margin-top', (h - img_h) / 2 + 'px');
	    $('#nav_left img').css('margin-bottom', (h - img_h) / 2 + 'px');

	    // welcome
	    const myDate = new Date();
	    const year = myDate.getFullYear();
	    const month = myDate.getMonth() + 1;
	    const day = myDate.getDate();
	    const dayOfWeek = myDate.getDay();
	    const dayOfWeekName = ['日', '一', '二', '三', '四', '五', '六'];
	    $('#tabs_right p').text('欢迎您: ' + cookie_name + ' 今天是' + year + '年' + month + '月' + day + '月' +
	        '   星期' + dayOfWeekName[dayOfWeek]);

	    // ````````````````````````````` common use above

	    // adjust pics0 & pics14
	    w = parseFloat($('#picss').css('width')) - 8 * 2 - 4 - 1;
	    $('#pics0').css('width', w * 0.55 + 'px');
	    $('#pics14').css('width', w * 0.45 + 'px');

	    //  adjust pics0
	    h = parseFloat($('#pics0').css('height'));
	    w = parseFloat($('#pics0').css('width'));
	    $('#imgs0').css('height', w * 0.9 + 'px');
	    $('#pics0_desc').css('height', h - w * 0.9 + 'px');

	    // adjust pic1 ...
	    w = parseFloat($('#pics14').css('width')) - 1 - 4;
	    $('.pics').css('width', w / 2 + 'px');
	    w = parseFloat($('#pics14').css('width'));

	    // status_3
	    $('#dvc_status p').css('line-height', '20px');
	    
	    // adjust interval
	    h = parseFloat($('#interval').parent().css('height'));
	    let i_h = parseFloat($('#interval').css('height'));
	    $('#interval').css('margin-top',(h-i_h)/2+'px');
	    $('#interval').css('margin-bottom',(h-i_h)/2+'px');

	    // adjust pic0 desc
	    h = parseFloat($('#pics0_desc').css('height'));
	    $('#pics0_desc div:eq(0)').css('margin-top',h*0.1+'px');
	    $('#pics0_desc div:eq(1)').css('margin-bottom',h*0.1+'px');

	    // adjust history p
	    $('#historyArea p').css('line-height','20px');
	    $('#historyArea p').css('margin-bottom','0px');
	    $('#historyArea').css('overflow-y','auto');

	    // adjust records
	    h = parseFloat($('#records').css('height'));
	    $('#records a').css('line-height', h * 0.3 + 'px');

	    // daterangepicker
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

	    // list1
	    const channeltree = channelTree();
	    $('#content1').treeview({
	        data: channeltree,
	        levels: 3,
	        showBorder: false,
	        showCheckbox: false,
	        showTags: false,
	        collapseIcon: "glyphicon glyphicon-chevron-down",
	        expandIcon: "glyphicon glyphicon-chevron-right",
	        selectedColor: "blue",
	    });
	    $('#content1').addClass('treeSelected');
	    setTreeNodeSelected($('#content1'));

	    // content max height
	    h = parseFloat($('#tree').css('height'));
	    let list_h = parseFloat($('#list1').css('height'));
	    $('.content').css('max-height', h - 2 * list_h + 'px');
	    $('.content ul').css('margin', '0px');
	    $('.content ul li').css('background-color', 'rgb(170,247,247)');
	    $('.content ul li').css('padding', '10px');
	    $('.indent').css('margin', '5px');

	    // pics
	    $('body').attr('allpic-index', 0);
	    $('body').attr('if-all', 1);

	    // server status
	    checkServer();
	    intervalIds.checkServer = setInterval(checkServer,60000);

	    // patrol pics
	    let data = {
	        "userId": cookie_userId,
	        "userType": cookie_userType,
	        "size": 5,
	        "index": 0,
	        "startTime": "1970-01-01 00:00:00",
	        "endTime": "2900-01-01 23:59:59"
	    }
	    getAllPics(data);

	    // records
	    getAlertRecords(0)

	    // interval things
	    intervalIds.getAllPics = setInterval(
	    	function() {
	    		var index = parseInt($('body').attr('allpic-index'));
	    		if (index == 0) {
	    			getAllPics(data);
	    		}
	    	},INTERVAL
		);

	    intervalIds.heartBeatRecords = setInterval(
	    	function() {
	    		getAlertRecords(0);
	    	}, INTERVAL
	    );
    }

    function checkServer() {
        $.ajax({
            url: '/v1/query/server/status',
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    const status = data.result.serverStatus;
                    if(status.wechatserver) {
                        $("#wechat-status").html("在线");
                        $("#wechat-status").css("color", "blue")
                    }else{
                        $("#wechat-status").html("离线");
                        $("#wechat-status").css("color", "red")
                    }

                    if(status.socketserver) {
                        $("#socket-status").html("在线");
                        $("#socket-status").css("color", "blue")
                    }else{
                        $("#socket-status").html("离线");
                        $("#socket-status").css("color", "red")
                    }

                    if(status.fileserver) {
                        $("#pic-status").html("在线");
                        $("#pic-status").css("color", "blue")
                    }else{
                        $("#pic-status").html("离线");
                        $("#pic-status").css("color", "red")
                    }
                } else {
                    console.log(data);
                }
            }
        });
    }

    // logo click
    $('#nav_left').click(function(){
        window.location.href = '/main';
    })

    //logout
    $('#logout').click(function() {
        const data = {
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
                    window.location.href = 'login';
                    Cookies.set('sessionId', null);
                } else {
                    alert('用户登出失败');
                    console.log(data);
                }
            }
        });
    });
    
    $('#searchHis').click(function(){
        let startDate = $('#historyArea input[name=daterange]:eq(0)').val();
        let endDate = $('#historyArea input[name=daterange]:eq(1)').val();
        startDate = (startDate == '') ? '1970-01-01' : startDate;
        endDate = (endDate == '') ? '2970-01-01' : endDate; 

        if(parseInt($('body').attr('if-all'))){
            const index = parseInt($('body').attr('allpic-index'));
            const size = 9;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": 0,
                "size": size,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            };
            getAllPicsHistory(data);
        }else{
            const deviceId = $('body').attr('pic-deviceId');
            const index = parseInt($('body').attr('pic-index'));
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 9;
            const type = 1;
            const data = {
                "channelNo":channelNo,
                "type": 0,
                "id":  deviceId,
                "size": 9,
                "index": 0,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            }
            getDevicePicsHistory(data);
        }
    })


    $('#home').click(function(){
        $('#chartArea').hide();
        $('#tempArea').hide();
        $('#historyArea').hide();
        $('#tabs_left a').parent().css('background-image',"url(elements/tabs.gif)");
        $('#tabs_left a').css('color','white');
        $('#main_right').show();
    })

    $('#tree').click(function() {
        $('.content ul').css('margin', '0px');
        $('.content ul li').css('background-color', 'rgb(170,247,247)');
        $('.content ul li').css('padding', '10px');
        $('.indent').css('margin', '5px');
    })

    $('#list1').click(function() {
        const channeltree = channelTree();
        $('#content1').treeview({
            data: channeltree,
            levels: 3,
            showBorder: false,
            showCheckbox: false,
            showTags: false,
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right"
        });

        $('#content1').show();
        $('#content2').hide();
        $('#content3').hide();
        $('.content').removeClass('treeSelected');
        $('#content1').addClass('treeSelected');
        setTreeNodeSelected($('#content1'));
    })

    $('#list2').click(function() {
        const linetree = deviceLineTree();
        $('#content2').treeview({
            data: linetree,
            levels: 3,
            showBorder: false,
            showCheckbox: false,
            showTags: false,
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right"
        });
        $('#content2').show();
        $('#content1').hide();
        $('#content3').hide();
        $('.content').removeClass('treeSelected');
        $('#content2').addClass('treeSelected');
        setTreeNodeSelected($('#content2'));
    })

    // $('#list3').click(function() {
    //     $('#content3').show();
    //     $('#content2').hide();
    //     $('#content1').hide();
    //     $('.content').removeClass('treeSelected');
    //     $('#content3').addClass('treeSelected');
    //     setTreeNodeSelected($('#content3'));
    // })

    // buttons
    $('#picLast').click(function() {
        if ($('body').attr('if-all') == 1) {
            const index = parseInt($('body').attr('allpic-index'));
            const size = 5;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": index - 1,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPics(data);
        } else {
            const id = $('body').attr('pic-deviceId');
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 5;
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
            getDevicePics(data);
        }
    });
    
    $('#picNext').click(function() {
        if ($('body').attr('if-all') == 1) {
            const index = parseInt($('body').attr('allpic-index'));
            const size = 5;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": index + 1,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPics(data);
        } else {
            const id = $('body').attr('pic-deviceId');
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 5;
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
            getDevicePics(data);
        }
    });

    $('#refresh').click(function() {
        if ($('body').attr('if-all') == 1) {
            const index = parseInt($('body').attr('pic-index'));
            const size = 5;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": 0,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPics(data);
        } else {
            const id = $('body').attr('pic-deviceId');
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 5;
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
            getDevicePics(data);
        }
    })

    $('#pics img').click(function() {
        $('#records').hide();
        $('#pics img').parent().css('border', '');
        $(this).parent().css('border', '2px solid red');
        const picId = $(this).attr('picId');
        const deviceId = $(this).attr('deviceId');
        const channelNo = $(this).attr('channelNo');
        $('body').attr('selectedPic', picId);
        $('body').attr('selectedPic-deviceId', deviceId);
        $('body').attr('selectedPic-channelNo', channelNo);
    })

    $('#setRef').click(function() {
        const tmp = getSelectedDevice();
        if (tmp == -1) {
            alert('请选择一个设备');
        } else {
            const picId = $('body').attr('selectedPic');
            if (picId == undefined) {
                alert('请选择图片');
            } else {
                $('#modalPwd input').val('');
                $('#modalPwd').modal();
            }
        }
    });

    $('#modalPwd .modal-footer button:eq(0)').click(function() {
        const div = $('#modalPwd .modal-body');
        const userName = div.find('div:eq(0) input').val();
        const password = div.find('div:eq(1) input').val();
        const rePassword = div.find('div:eq(2) input').val();
        if (userName == '' || password == '' || rePassword == '') {
            alert('请输入完整信息!');
        } else if (password != rePassword) {
            alert('两次输入的密码不一致!');
        } else {
            const data = {
                'userName': userName,
                'password': password,
            }
            if (checkUser(data) != 0) {
                const picId = $('body').attr('selectedPic');
                const deviceId = $('body').attr('selectedPic-deviceId');
                const channelNo = $('body').attr('selectedPic-channelNo');
                const data = {
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

    $('#push').click(function() {
        if ($('body').attr('selectedPic') == undefined || $('body').attr('selectedPic') == '') {
            alert('请选择图片！');
        } else {
            const picId = $('body').attr('selectedPic');
            const deviceId = $('body').attr('selectedPic-deviceId');
            const data = {
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
                            const list = data.result.list;
                            for (let i = 0; i < list.length; ++i) {
                                const $ctrl = '<div><input userId="' + list[i].userId + '" type="checkbox">' + list[i].userName + '___微信：' + list[i].nickname + '</div>';
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
        const picId = $('body').attr('selectedPic');
        const deviceId = $('body').attr('selectedPic-deviceId');
        const picIds = [];
        picIds.push({
            'picId': picId
        });
        let userIds = [];
        $('#modalPush input:checked').each(function() {
            userIds.push({
                'userId': $(this).attr('userId')
            });
        });
        const data = {
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

    $('#interval').change(function() {
        const val = $(this).val();
        $('#interval').val(val);
        INTERVAL = parseInt(val) * 1000;
        clearInterval(intervalIds.getAllPics);
        clearInterval(intervalIds.findDevicePic);
        intervalIds.findDevicePic = setInterval(function() {
            const deviceId = $('body').attr('pic-deviceId');
            const index = parseInt($('body').attr('pic-index'));
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 5;
            const type = 1;

            const data = {
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
                getDevicePics(data);
            }
        }, INTERVAL);
        intervalIds.getAllPics = setInterval(
            function() {
                const index = parseInt($('body').attr('allpic-index'));
                const size = 5;
                const data = {
                    "userId": cookie_userId,
                    "userType": cookie_userType,
                    "index": index,
                    "size": size
                };
                if (index == 0) {
                    // alert('!');
                    getAllPics(data);
                }
            }, INTERVAL);
    })

    // temperature
    $('#temperature').click(function(){
        $('body').attr('if-temperature',1);
        const tmp = getSelectedDevice();
        if (tmp == -1) {
            alert('请选择一个设备');

        }else{
            const deviceId = $('body').attr('pic-deviceId');
            let newData = {};

            newData.deviceIds = [];
            newData.id = [];
            newData.type = 0;
            newData.deviceIds.push(deviceId);
            tempDevice(newData);
            $('#main_right').hide();
            $('#historyArea').hide();
            $('#tempArea').show();
        }
    })

    // history
    $('#history').click(function(){
        $('body').attr('if-history',1);
        $('#tempArea').hide();
        $('#chartArea').hide();
        $('#main_right').hide();
        if(parseInt($('body').attr('if-all'))){
            const index = parseInt($('body').attr('allpic-index'));
            const size = 9;
            const data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": 0,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPicsHistory(data);
        }else{
            const deviceId = $('body').attr('pic-deviceId');
            const index = parseInt($('body').attr('pic-index'));
            const channelNo = parseInt($('body').attr('pic-channelNo'));
            const size = 9;
            const type = 1;
            const data = {
                "channelNo":channelNo,
                "type": 0,
                "id":  deviceId,
                "size": 9,
                "index": 0,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            }
            getDevicePicsHistory(data);
        }
        $('#historyArea').show();
    })

    $('#tabs_left a[data-role=tab]').click(function(){
        $('#tabs_left a').parent().css('background-image',"url(elements/tabs.gif)");
        $('#tabs_left a').css('color','white');
        $(this).parent().css('background-image','url()');
        $(this).parent().css('background-color','white');
        $(this).css('color','rgb(1,111,111)');
    })

    $('#tempArea table').on('click','button',function(){
        const tr = $(this).parent().parent();
        const cmdId = tr.attr('id');
        $('body').attr('cmdId',cmdId);
        $('#tabs_left a').parent().css('background-image',"url(elements/tabs.gif)");
        $('#tabs_left a').css('color','white');
        $('#tabs_left a:eq(6)').parent().css('background-image','url()');
        $('#tabs_left a:eq(6)').parent().css('background-color','white');
        $('#tabs_left a:eq(6)').css('color','rgb(1,111,111)');
        $('#tempArea').hide();
        const inputData = {
            cmdID: cmdId,
            time: '2017-02-01',
        };
        searchTemp(inputData);
    });

    function searchTemp(inputData) {
    	let value = [];
        let chartShowFlag = 1;
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
        });
        const pics_width = parseInt($('#chartArea').css('width'));
        const height = parseInt($('#main').css('height'));
        // console.log(pics_width);

        if (chartShowFlag) {
            const searchType = 'day';
            switch (searchType) {
                case 'day':
                    const label = hourLabels;
                    break;
                case 'month':
                    const label = dayLabels;
                    break;
                case 'year':
                    const label = monthLabels;
                    break;
                default:
                    const label = monthLabels;
                    break;
            }

            const data = [{
                name: '北京',
                value: value,
                color: '#1f7e92',
                line_width: 3
            }];
            const chart = new iChart.LineBasic2D({
                render: 'canvasDiv',
                data: data,
                title: inputData.time + ' 温度实况',
                width: pics_width,
                height: height*0.9,
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
        }
    }

    $('#searchTemp').click(function(){
        const time = $('#chartArea input[name=daterange]').val();
        const cmdId = $('body').attr('cmdId');
        const inputData = {
            cmdID: cmdId,
            time: time,
        };
        searchTemp(inputData);
    })


    $('#showAlert').click(function() {
        const records = $('#records');
        const stat = records.css('display');
        if (stat == 'none') {
            records.css('display', 'block');
        } else {
            records.css('display', 'none');
        }
    })

    $('#records li').click(function() {
        $('#records a').css('color', 'white');
        $('#records li').css('background-color', 'rgb(3,161,161)');
        $(this).find('a').css('color', 'rgb(3,108,108)');
        $(this).css('background-color', 'rgb(228,241,250)');
    })

    $('#records tbody tr').click(function(){
        $('#records tbody tr').css('background-color','rgb(228,241,250)');
        $(this).css('background-color','rgb(3,161,161)');
        $('#modal_refpic').attr('src',$(this).attr('refPicUrl'));
        $('#modal_alertpic').attr('src',$(this).attr('processedPicUrl'));
        $('#modalAlert').modal();
    })


    // `map
    $('#icon_map').click(function(){
        $('#main_right').hide();
        $('#mapArea').show();
        initMap();
    })

    // `setting
    $('#icon_setting').click(function(){
        const tmp = getSelectedDevice();
        if (tmp == -1) {
            alert('请选择一个设备');
        } else {
            const tmpData = tmp.split('_');
            const deviceId = tmpData[0];
            $.ajax({
                    url: '/v1/command/setdevice',
                    type: "POST",
                    data: JSON.stringify({"deviceId":deviceId}),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(data) {
                        if (data.code == 0) {
                            alert('设备配置成功！');
                        } else if (data.code == NO_SOCKET || data.code == SERVER_ERROR) {
                            alert('与设备服务器连接失败！错误码：' + data.code);
                        } else {
                            alert('设备配置失败！');
                        }
                    }
            }) // end of ajax
            // $('#modalSetting').modal();
        }
    })


    // `photo
    $('#icon_photo').click(function(){
        const tmp = getSelectedDevice();
        if (tmp == -1) {
            alert('请选择一个设备');
        } else {
            const tmpData = tmp.split('_');
            const deviceId = tmpData[0];
            const channelNo = tmpData[1];
            const data = {
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
    }) 

    function channelTree() {
        var data = {
            "userId": cookie_userId,
            "userType": cookie_userType,
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
                    console.log('获取设备树失败');
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
                    console.log('获取设备树失败');
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

    function getSelectedDevice() {
        if ($('.treeSelected').treeview('getSelected').length != 1 || $('.treeSelected').treeview('getSelected')[0].type == undefined || $('.treeSelected').treeview('getSelected')[0].type != 3) {
            return -1;
        }
        return $('.treeSelected').treeview('getSelected')[0].id;
    }

    function setTreeNodeSelected(selector) {
        selector.data().treeview.options.multiSelect = false;
        selector.unbind('nodeSelected');
        selector.on('nodeSelected', function(event, data) {
        	$("#pics img").parent().css('border', '0px');
            let type = selector.treeview('getSelected')[0].type;
            const tmp = selector.treeview('getSelected')[0].id;
            const tmpData = tmp.split('_');
            const deviceId = tmpData[0];
            const channelNo = tmpData[1];
            $('body').attr('pic-deviceId',deviceId);
            $('body').attr('pic-channelNo',channelNo);
            const name = selector.treeview('getSelected')[0].text;
            if ($('#devices ul li').filter('.chosen').text() == '设备列表') {
                if (type == 3) {
                    type = 0;
                    $.ajax({
                        url: '/v1/device/find/parents',
                        type: "POST",
                        data: JSON.stringify({deviceId: deviceId}),
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
                                        // $('#header p').text(parentsName);
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

            $.ajax({
                url: '/v1/device/details',
                type: "POST",
                data: JSON.stringify({id: deviceId}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    if (data.code == 0) {
                        $('#dvc_status p').empty();
                        if(data.result.status){
                            var status = '在线';
                        }else{
                            var status = '离线';
                        }


                        $('#dvc_status p:eq(0)').append('<b>状态：</b>'+status);
                        $('#dvc_status p:eq(1)').append('<b>温度：</b>'+data.result.temperature);
                        $('#dvc_status p:eq(2)').append('<b>电压：</b>'+data.result.batteryVoltage);
                        $('#dvc_status p:eq(3)').append('<b>隐患类型：</b>'+dangerType[data.result.deviceDangerID]);
                    } else {
                        console.log('failed at alert/process');
                    }
                }
            }) // end of ajx

            $('body').attr('pic-index', 0);
            $('body').attr('pic-channelNo', channelNo);
            if(parseInt($('body').attr('if-history'))){
                // var deviceId = $('body').attr('pic-deviceId');
                const index = parseInt($('body').attr('pic-index'));
                const channelNo = parseInt($('body').attr('pic-channelNo'));
                const size = 9;
                const type = 1;
                const data = {
                    "channelNo":channelNo,
                    "type": 0,
                    "id":  deviceId,
                    "size": 9,
                    "index": 0,
                    "startTime": "1970-01-01 00:00:00",
                    "endTime": "2970-01-01 23:59:59"
                }
                getDevicePicsHistory(data);
            }else if(parseInt($('body').attr('if-temperature'))){
                let newData = {};

                newData.deviceIds = [];
                newData.id = [];
                newData.type = 0;
                newData.deviceIds.push(deviceId);
                tempDevice(newData);
            }else{
                const size = 5;
                const index = parseInt($('body').attr('pic-index'));
                const data = {
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
                getDevicePics(data);
                intervalIds.findDevicePic = setInterval(function() {
                    const index = parseInt($('body').attr('pic-index'));
                    if (index == 0) {
                            getDevicePics(data);
                    }
                }, INTERVAL);
            }
        }) // end of nodeSelected event
    }

    //`getDevicePics
    function getDevicePics(data) {
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
                        $('#picNext').show();
                    else
                        $('#picNext').show();

                    $('body').attr('pic-index', outerData.index);
                    $('body').attr('pic-deviceId', outerData.id);
                    $('body').attr('if-all', 0);
                    if ($('body').attr('pic-index') > 0) {
                        $('#picLast').show();
                    } else {
                        $('#picLast').show();
                    }

                    var list = data.result.list;

                    // picThings();
                    $('#pics img').removeAttr('data-original');
                    $('#pics img').removeAttr('src');
                    $('#pics img').removeAttr('picId');
                    $('#pics img').removeAttr('channelNo');
                    $('.pics p').text('');
                    // picReset();
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
                                horPicCss(i, list[i].width, list[i].height);
                            } else {
                                verPicCss(i, list[i].width, list[i].height);
                            }

                            $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                            $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);
                            if(i>0){
                                $('.pics:eq(' + (i-1) + ') p').text(list[i].time + ' ' + list[i].deviceId);
                            }else {
                                $('#pics0_desc input:eq(0)').val(list[i].time);
                                $('#pics0_desc input:eq(1)').val(list[i].deviceId);
                                $('#pics0_desc input:eq(2)').val(list[i].deviceTele);
                                $('#pics0_desc input:eq(3)').val(list[i].deviceId);
                            }

                            $('#picCount').text('第' + (outerData.index + 1) + '页 共' + Math.ceil(data.result.total / outerData.size) + '页');
                        }
                    }

                    var viewer = new Viewer(document.getElementById('pics'), {
                        url: 'data-original',
                    });
                } else {
                    if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1) {
                        alert('这已经是最后一页！');
                    } else if ($('body').attr('pic-index') == 0) {
                        console.log('这是第一页！');
                    } else {
                        console.log('查无图片！');
                    }
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
                        $('body').attr('allpic-index', outerData.index);
                        $('body').attr('if-all', 1);

                        var list = data.result.list;

                        $('#pics img').removeAttr('data-original');
                        $('#pics img').removeAttr('src');
                        $('#pics img').removeAttr('picId');
                        $('#pics img').removeAttr('channelNo');
                        $('.pics p').text('');

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
                                    horPicCss(i, list[i].width, list[i].height);
                                } else {
                                    verPicCss(i, list[i].width, list[i].height);
                                }
                                
                                $('#pics img:eq(' + i + ')').attr('src', list[i].picUrl);
                                $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                                $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                                $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                                $('#pics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);

                                if(i>0){
                                    $('.pics:eq(' + (i-1) + ') p').text(list[i].time + ' ' + list[i].deviceId);
                                }else {
                                    $('#pics0_desc input:eq(0)').val(list[i].time);
                                    $('#pics0_desc input:eq(1)').val(list[i].deviceId);
                                    $('#pics0_desc input:eq(2)').val(list[i].deviceTele);
                                    $('#pics0_desc input:eq(3)').val(list[i].deviceId);
                                }
                                $('#picCount').text('第' + (outerData.index + 1) + '页 共' + Math.ceil(data.result.total / outerData.size) + '页');
                            }
                        }

                        var viewer = new Viewer(document.getElementById('pics'), {
                            url: 'data-original',
                        });
                    } else {
                        if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1) {
                            console.log('这已经是最后一页！');
                        }else if ($('body').attr('allpic-index') == 0) {
                            console.log('这是第一页！');
                        }else{
                            console.log('查无图片！');
                        }
                    }
                }
            }) // end of ajax   
    }

    function horPicCss(i, w, h) {   
        const img = $("#pics img:eq(" + i + ")");
        img.css('height','100%');
        const div_w = parseFloat(img.parent().css('width'));
        const img_h = parseFloat(img.css('height'));
        const img_w = w/h*img_h;
        img.css('width',img_w+'px');

        img.css('top','');
        img.css('bottom','');

        img.css('position', 'relative');
        img.css('left',-(img_w-div_w)/2+'px');
        img.css('right',-(img_w-div_w)/2+'px');
    }

    function verPicCss(i,w,h) {
        const img = $("#pics img:eq(" + i + ")");
        img.css('width','100%');
        const div_h = parseFloat(img.parent().css('height'));
        const img_w = parseFloat(img.css('width'));
        const img_h = h/w*img_w;
        img.css('height',img_h+'px');

        img.css('left','');
        img.css('right','');

        img.css('position', 'relative');
        img.css('top',-(img_h-div_h)/2+'px');
        img.css('bottom',-(img_h-div_h)/2+'px');
    }
});



function getAlertRecords(index) {
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
                $('body').attr('record-index', index);
                if (parseInt($('body').attr('record-index')) == 0) {
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
                    $('#records table tbody tr:eq(' + i + ')').attr('processedPicUrl', list[i].processedPicUrl);
                    $('#records table tbody tr:eq(' + i + ')').attr('processedPicId', list[i].processedPicId);
                    $('#records table tbody tr:eq(' + i + ')').attr('refPicId', list[i].refPicId);
                    $('#records table tbody tr:eq(' + i + ')').attr('refPicUrl', list[i].refPicUrl);
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

    function checkUser(inputData) {
	    const data = {
	        'userName': inputData.userName,
	        'password': inputData.password,
	    };
	    let flag = 0;
	    $.ajax({
	        url: '/v1/user/check',
	        type: "GET",
	        data: data,
	        contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        async: false,
	        success: function(data) {
	            if (data.code != 0) {
	                alert('用户名或密码有误!');
	            } else {
	                flag = 1;
	            }
	        }
	    });
	    return flag;
	}
}


//`MAP things

const opts = {
    width: 500, // 信息窗口宽度
    height: 250, // 信息窗口高度
    title: "", // 信息窗口标题
    enableMessage: true //设置允许信息窗发送短息
};

const colorIcons = {
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

function getDevicePicsHistory(data) {
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
                    // if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1)
                    //     $('#next').hide();
                    // else
                    //     $('#next').show();

                    // $('body').attr('pic-index',outerData.index);
                    // $('body').attr('deviceId',outerData.id);
                    // $('body').attr('channelNo',outerData.channelNo);

                    // if($('body').attr('pic-index') > 0){
                    //     $('#last').show();
                    // }else{
                    //     $('#last').hide();
                    // }

                    var list = data.result.list;

                    for (var i = 0; i < list.length; ++i) {
                        if (list[i].picType == 2){
                                // for ref pic
                        }else{
                            if (list[i].picType == 1){
                                var name = list[i].name;
                                var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 告警图片:"+timeName);
                            }else{
                                var name = list[i].name;
                                var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 原始图片:"+timeName);
                            }
                            var w = $('#hispics img').css('width');
                            // $('#hispics img').css('height',w);
                            $('#hispics img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                            $('#hispics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#hispics img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#hispics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#hispics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);
                            $('#hispics p:eq(' + i + ')').text(list[i].time+' '+list[i].deviceId);
                            // $('#picCount').text('第'+(outerData.index + 1)+'页 共'+Math.ceil(data.result.total / outerData.size)+'页');
                        }                    
                    }
                    // 进度条
                    var viewer = new Viewer(document.getElementById('hispics'), {
                        url: 'data-original',
                    });
                 
                    
                    // for (var i = 0; i < list.length; ++i) {
                    //     $('img.magnify:eq(' + (i + 4) + ')').attr('src', list[i].picUrl);
                    // }
                } else {
                    alert('查无图片！');
                    console.log(data);
                }
            }
        })// end of ajax   
}


function getAllPicsHistory(data) {
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
                    // $('body').attr('allpic-index', outerData.index);
                    // $('body').attr('if-all', 1);

                    var list = data.result.list;

                    for (var i = 0; i < list.length; ++i) {
                        if (list[i].picType == 2){
                                // for ref pic
                        }else{
                            if (list[i].picType == 1){
                                var name = list[i].name;
                                var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 告警图片:"+timeName);
                            }else{
                                var name = list[i].name;
                                var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                                // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 原始图片:"+timeName);
                            }
                            var w = $('#hispics img').css('width');
                            // $('#hispics img').css('height',w);
                            $('#hispics img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                            $('#hispics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                            $('#hispics img:eq(' + i + ')').attr('picId', list[i].picId);
                            $('#hispics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                            $('#hispics img:eq(' + i + ')').attr('deviceId', list[i].deviceId);
                            $('#hispics p:eq(' + i + ')').text(list[i].time+' '+list[i].deviceId);
                            // $('#picCount').text('第'+(outerData.index + 1)+'页 共'+Math.ceil(data.result.total / outerData.size)+'页');
                        }                    
                    }
                    // 进度条
                    var viewer = new Viewer(document.getElementById('hispics'), {
                        url: 'data-original',
                    });
                } else {
                    if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1) {
                        console.log('这已经是最后一页！');
                    }else if ($('body').attr('allpic-index') == 0) {
                        console.log('这是第一页！');
                    }else{
                        console.log('查无图片！');
                    }
                }
            }
        }) // end of ajax   

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
                    $('#tempArea table tbody').append('<tr id="' + list[i].cmdId + '"><td>' + list[i].cmdId + '</td><td>' + list[i].temperature + '</td><td>' + list[i].time + '</td><td><button>查看</button></td></tr>')
                }
            } else {
                console.log('获取设备(组)失败');
            }
        }
    });
}