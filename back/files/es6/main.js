$(function() {
    if (!cookie_userType) {
        $("#user").parent().hide();
    }

    initialize();
    $("#nav").css("visibility", "visible");
    $("#main").css("visibility", "visible");

    function initialize() {
        // keep 16:9
        var win_width = parseFloat($(document).width());
        $('body').css('height', win_width * 1080 / 1920 + 'px');

        $('#pics14 p').each(function() {
            var h = $(this).parent().css('height');
            $(this).css('line-height', h);
        })

        $('p').each(function() {
            var h = $(this).parent().css('height');
            $(this).css('line-height', h);
            $(this).css("margin-bottom", "0px");
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

        // adjust interval
        h = parseFloat($('#interval').parent().css('height'));
        var i_h = parseFloat($('#interval').css('height'));
        $('#interval').css('margin-top', (h - i_h) / 2 + 'px');
        $('#interval').css('margin-bottom', (h - i_h) / 2 + 'px');

        // adjust pic0 desc
        h = parseFloat($('#pics0_desc').css('height'));
        $('#pics0_desc div:eq(0)').css('margin-top', h * 0.1 + 'px');
        $('#pics0_desc div:eq(1)').css('margin-bottom', h * 0.1 + 'px');

        // adjust history p
        $('#historyArea p').css('line-height', '20px');
        $('#historyArea p').css('margin-bottom', '0px');
        $('#historyArea').css('overflow-y', 'auto');

        // adjust records
        h = parseFloat($('#records').css('height'));
        $('#records a').css('line-height', h * 0.2 + 'px');

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

        // content max height
        h = parseFloat($('#tree').css('height'));
        var list_h = parseFloat($('#list1').css('height'));
        $('.content').css('max-height', h - 2 * list_h + 'px');
        $('.content ul').css('margin', '0px');
        $('.content ul li').css('padding', '10px');
        $('.indent').css('margin', '5px');

        // pics
        $('body').attr('allpic-index', 0);
        $('body').attr('if-all', 1);

        // list1
        listRefresh(channelTree(), $('#content1'), 3, false);


        welcome(cookie_name);
        
        // server status
        checkServer();
        intervalIds.checkServer = setInterval(checkServer, 60000);

        // patrol pics
        var data = {
            index : 0
        }
        getPics(data, true);
        // getAllPics(data);

        // records
        getAlertRecords(0)

        // interval things
        intervalIds.getAllPics = setInterval(
            () => {
                var index = parseInt($('body').attr('allpic-index'));
                if (index == 0) {
                    var data = {
                        index : 0
                    }
                    getPics(data, true);
                }
            }, INTERVAL
        );

        intervalIds.heartBeatRecords = setInterval(getAlertRecords(0), INTERVAL);
    }

    function checkServer() {
        $.ajax({
            url: '/v1/query/server/status',
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false
        }).then(data => {
            if (data.code == 0) {
                var status = data.result.serverStatus;
                if (status.wechatserver) {
                    $("#wechat-status").html("在线");
                    $("#wechat-status").css("color", "blue")
                } else {
                    $("#wechat-status").html("离线");
                    $("#wechat-status").css("color", "red")
                }

                if (status.socketserver) {
                    $("#socket-status").html("在线");
                    $("#socket-status").css("color", "blue")
                } else {
                    $("#socket-status").html("离线");
                    $("#socket-status").css("color", "red")
                }

                if (status.fileserver) {
                    $("#pic-status").html("在线");
                    $("#pic-status").css("color", "blue")
                } else {
                    $("#pic-status").html("离线");
                    $("#pic-status").css("color", "red")
                }
            } else {
                console.log(data);
            }
        });
    }

    //logout
    $('#logout').click(() => {
        const data = {
            'userId': cookie_userId
        }
        $.ajax({
            url: '/v1/user/logout',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false
        }).then(data => {
            if (data.code == 0) {
                window.location.href = '/login';
                Cookies.set('sessionId', null);
            } else {
                alert('用户登出失败');
            }
        });
    });

    $('#picNextHistory').click(() => {
        var startDate = $('#historyArea input[name=daterange]:eq(0)').val();
        var endDate = $('#historyArea input[name=daterange]:eq(1)').val();
        startDate = (startDate === '') ? '1970-01-01' : startDate;
        endDate = (endDate === '') ? '2970-01-01' : endDate;

        if (parseInt($('body').attr('if-all'))) {
            var index = parseInt($('body').attr('allpic-history-index')) || 0;
            var size = 9;
            var data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": index + 1,
                "size": size,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            };
            getAllPicsHistory(data);
        } else {
            var deviceId = $('body').attr('pic-deviceId');
            var index = parseInt($('body').attr('pic-history-index')) || 0;
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var size = 9;
            var type = 1;
            var data = {
                "channelNo": channelNo,
                "type": 0,
                "id": deviceId,
                "size": 9,
                "index": index + 1,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            }
            getDevicePicsHistory(data);
        }
    })

    $('#picLastHistory').click(() => {
        var startDate = $('#historyArea input[name=daterange]:eq(0)').val();
        var endDate = $('#historyArea input[name=daterange]:eq(1)').val();
        startDate = (startDate === '') ? '1970-01-01' : startDate;
        endDate = (endDate === '') ? '2970-01-01' : endDate;

        if (parseInt($('body').attr('if-all'))) {
            var index = parseInt($('body').attr('allpic-history-index')) || 0;
            var size = 9;
            var data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": index - 1,
                "size": size,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            };
            getAllPicsHistory(data);
        } else {
            var deviceId = $('body').attr('pic-deviceId');
            var index = parseInt($('body').attr('pic-history-index')) || 0;
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var size = 9;
            var type = 1;
            var data = {
                "channelNo": channelNo,
                "type": 0,
                "id": deviceId,
                "size": 9,
                "index": index - 1,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            }
            getDevicePicsHistory(data);
        }
    })

    $('#searchHis').click(() => {
        var startDate = $('#historyArea input[name=daterange]:eq(0)').val();
        var endDate = $('#historyArea input[name=daterange]:eq(1)').val();
        startDate = (startDate === '') ? '1970-01-01' : startDate;
        endDate = (endDate === '') ? '2970-01-01' : endDate;

        if (parseInt($('body').attr('if-all'))) {
            var index = parseInt($('body').attr('allpic-index'));
            var size = 9;
            var data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": 0,
                "size": size,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            };
            getAllPicsHistory(data);
        } else {
            var deviceId = $('body').attr('pic-deviceId');
            var index = parseInt($('body').attr('pic-index'));
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var size = 9;
            var type = 1;
            var data = {
                "channelNo": channelNo,
                "type": 0,
                "id": deviceId,
                "size": 9,
                "index": 0,
                "startTime": startDate + " 00:00:00",
                "endTime": endDate + " 23:59:59"
            }
            getDevicePicsHistory(data);
        }
    })

    $('#tree').click(function() {
        $('.content ul').css('margin', '0px');
        $('.content ul li').css('padding', '10px');
        $('.indent').css('margin', '5px');
    })

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
        if (mapFlag) {
            setTreeNodeSelectedMap(selector);
        }else{
            setTreeNodeSelected(selector);
        }
    }

    $('#list1').click(function() {
        listRefresh(channelTree(), $('#content1'), 3, false);
    })

    $('#list2').click(function() {
        listRefresh(channelLineTree(), $('#content2'), 2, false);
    })

    // buttons
    $('#picLast').click(function() {
        if ($('body').attr('if-all') == 1) {
            var index = parseInt($('body').attr('allpic-index'));
            var data = {
                index : index - 1
            };
            getPics(data, true);
        } else {
            var id = $('body').attr('pic-deviceId');
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var index = parseInt($('body').attr('pic-index'));
            var type = $('body').attr('pic-type');
            var data = {
                channelNo : "",
                id : id,
                type : type,
                index : index - 1,
            }
            getPics(data, false);
        }
    });

    $('#picNext').click(function() {
        if ($('body').attr('if-all') == 1) {
            var index = parseInt($('body').attr('allpic-index'));
            var data = {
                index : index + 1
            };
            getPics(data, true);
        } else {
            var id = $('body').attr('pic-deviceId');
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var index = parseInt($('body').attr('pic-index'));
            var type = $('body').attr('pic-type');
            var data = {
                channelNo : "",
                id : id,
                type : type,
                index : index + 1,
            }
            getPics(data, false);
        }
    });

    $('#refresh').click(function() {
        if ($('body').attr('if-all') == 1) {
            var index = parseInt($('body').attr('allpic-index'));
            var data = {
                index : 0
            };
            getPics(data, true);
        } else {
            var id = $('body').attr('pic-deviceId');
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var index = parseInt($('body').attr('pic-index'));
            var type = $('body').attr('pic-type');;
            var data = {
                channelNo : channelNo,
                id : id,
                type : type,
                index : 0,
            }
            getPics(data, false);
        }
    })

    $('#pics img').click(function() {
        $('#records').hide();
        $('#pics img').parent().css('border', '');
        $(this).parent().css('border', '2px solid red');
        var picId = $(this).attr('picId');
        var deviceId = $(this).attr('deviceId');
        var channelNo = $(this).attr('channelNo');
        var picUrl = $(this).attr('src');
        $('body').attr('selectedPic', picId);
        $('body').attr('selectedPic-picUrl', picUrl);
        $('body').attr('selectedPic-deviceId', deviceId);
        $('body').attr('selectedPic-channelNo', channelNo);
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

    $('#manRef').click(function() {
        var picId = $('body').attr('selectedPic');
        var picUrl = $('body').attr('selectedPic-picUrl');
        if (picId === undefined) {
            alert('请选择图片');
        } else {
            var data = {picId: picId};
            $.ajax({
                url: '/v1/picture/ref/get',
                type: "GET",
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false,
                success: function(data) {
                    if (data.code == 0) {
                        console.log(data.result);
                        $('#manRef_refPic').attr('src', data.result.refPicPath);
                        $('#manRef_curPic').attr('src', picUrl);
                        $('#modalManRef').modal();
                    } else {
                        console.log("获取对比图片失败！");
                    }
                }
            });
        }
    });

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

    $('#interval').change(function() {
        var val = $(this).val();
        $('#interval').val(val);
        INTERVAL = parseInt(val) * 1000;
        clearInterval(intervalIds.getAllPics);
        clearInterval(intervalIds.findDevicePic);
        intervalIds.findDevicePic = setInterval(function() {
            var deviceId = $('body').attr('pic-deviceId');
            var index = parseInt($('body').attr('pic-index'));
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var size = 5;
            var type = $('body').attr('pic-type');;

            var data = {
                channelNo : channelNo,
                type : type,
                id : deviceId,
                index : index,
            }
            if (index == 0) {
                // alert('!');
                getDevicePics(data);
            }
        }, INTERVAL);
        intervalIds.getAllPics = setInterval(
            function() {
                var index = parseInt($('body').attr('allpic-index'));
                var size = 5;
                var data = {
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
    $('#temperature').click(function() {
        $('body').attr('if-temperature', 1);
        var tmp = getSelectedDevice();
        if (tmp == -1) {
            alert('请选择一个设备');

        } else {
            var deviceId = $('body').attr('pic-deviceId');
            var newData = {};

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
    $('#history').click(function() {
        $('body').attr('if-history', 1);
        $('#tempArea').hide();
        $('#chartArea').hide();
        $('#main_right').hide();
        if (parseInt($('body').attr('if-all'))) {
            var index = parseInt($('body').attr('allpic-index'));
            var size = 9;
            var data = {
                "userId": cookie_userId,
                "userType": cookie_userType,
                "index": 0,
                "size": size,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            };
            getAllPicsHistory(data);
        } else {
            var deviceId = $('body').attr('pic-deviceId');
            var index = parseInt($('body').attr('pic-index'));
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var size = 9;
            var type = 1;
            var data = {
                "channelNo": channelNo,
                "type": 0,
                "id": deviceId,
                "size": 9,
                "index": 0,
                "startTime": "1970-01-01 00:00:00",
                "endTime": "2900-01-01 23:59:59"
            }
            getDevicePicsHistory(data);
        }
        $('#historyArea').show();
    })

    $('#tabs_left a[data-role=tab]').click(function() {
        $('#tabs_left a').parent().css('background-image', "url(elements/tabs.gif)");
        $('#tabs_left a').css('color', 'white');
        $(this).parent().css('background-image', 'url()');
        $(this).parent().css('background-color', 'white');
        $(this).css('color', 'rgb(1,111,111)');
    })

    $('#tempArea table').on('click', 'button', function() {
        var tr = $(this).parent().parent();
        var cmdId = tr.attr('id');
        $('body').attr('cmdId', cmdId);
        $('#tabs_left a').parent().css('background-image', "url(elements/tabs.gif)");
        $('#tabs_left a').css('color', 'white');
        $('#tabs_left a:eq(6)').parent().css('background-image', 'url()');
        $('#tabs_left a:eq(6)').parent().css('background-color', 'white');
        $('#tabs_left a:eq(6)').css('color', 'rgb(1,111,111)');
        $('#tempArea').hide();
        $('#chartArea').show();
        var inputData = {
            cmdID: cmdId,
            time: '2017-02-01',
        };
        searchTemp(inputData);
    });

    function searchTemp(inputData) {
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
        });
        var pics_width = parseInt($('#chartArea').css('width'));
        var height = parseInt($('#main').css('height'));
        // console.log(pics_width);

        if (chartShowFlag) {
            var searchType = 'day';
            var label = "";
            switch (searchType) {
                case 'day':
                    label = hourLabels;
                    break;
                case 'month':
                    label = dayLabels;
                    break;
                case 'year':
                    label = monthLabels;
                    break;
                default:
                    label = monthLabels;
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
                title: inputData.time + ' 温度实况',
                width: pics_width,
                height: height * 0.9,
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

    $('#searchTemp').click(function() {
        var time = $('#chartArea input[name=daterange]').val();
        var cmdId = $('body').attr('cmdId');
        var inputData = {
            cmdID: cmdId,
            time: time,
        };
        searchTemp(inputData);
    })


    $('#showAlert').click(function() {
        var records = $('#records');
        var stat = records.css('display');
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

    $('#records tbody tr').click(function() {
        $('#records tbody tr').css('background-color', 'rgb(228,241,250)');
        $(this).css('background-color', 'rgb(3,161,161)');
        $('#modal_refpic').attr('src', $(this).attr('refPicUrl'));
        $('#modal_alertpic').attr('src', $(this).attr('processedPicUrl'));
        $('#modalAlert').modal();
    })


    // `map
    $('#back').click(function() {
        $('#main_right').show();
        $('#mapArea').hide();
        $('#list2').show();
        listRefresh(channelTree(), $('#content1'), 3, false); 
    })

    $('#icon_map').click(function() {
        $('#main_right').hide();
        $('#mapArea').show();
        $('#list2').hide();
        initMap(); 
        listRefresh(deviceTreeUnselectable(), $('#content1'), 2, true); 
    })

    function getDevicesByMap(url, method, data){
        $.ajax({
            url: url,
            type: method,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false
        })
        .then(data => {
            if (data.code == 0) {
                map.clearOverlays();
                const list = data.result.list;
                const points = [];　
                const contentTemplte = `
                    <div style='width:100%;height:100%;'>
                        <h3 style="margin: 10px;text-align:center">设备名称</h3>
                        <div style='float:left;width:20%;font-size:14px;'>
                            <p>电压</p>
                            <p>充电电压</p>
                            <p>温度</p>
                            <p>警报</p>
                            <p>状态:status</p>
                        </div>
                        <div style='float:left;width:80%;text-align:center;'>
                            <img id='imgDemo' width='350' height='200' src='thumbnail' data-original='url' alt=''/>
                        </div>
                    </div>
                `;

                const contents = [];
                list.forEach(item => {
                    let content = contentTemplte;
                    content = content.replace('tmpid', item.deviceID);
                    content = content.replace('设备名称', item.name);
                    content = content.replace('电压', '电压:' + item.batteryVoltage);
                    content = content.replace('充电电压', '充电电压:' + item.chargeVoltage);
                    content = content.replace('温度', '温度:' + item.temperature);
                    content = content.replace('警报', '警报:' + item.alert);
                    content = content.replace('thumbnail', item.picUrl);
                    content = content.replace('url', item.picUrl);
                    content = content.replace('status', item.status ? "<span class='online'>在线</span>" : "<span class='offline'>离线</span>");

                    const status = item.status; // 是否在线
                    const lon = item.longitude;
                    const lat = item.latitude;
                    const point = new BMap.Point(lon, lat);
                    points.push(point);
                    var marker = status ? new BMap.Marker(point, {icon: createIcon()}) : new BMap.Marker(point);
                    var label = new BMap.Label(item.name, {
                        "offset": new BMap.Size(0, -25)
                    });

                    map.addOverlay(marker); // 将标注添加到地图中
                    marker.setLabel(label);
                    label.setStyle({
                        color : status ? "blue" : "red",
                        fontSize : "13px",
                        backgroundColor: "transparent",
                        borderWidth: "0px"
                    });
                    addClickHandler(content, marker);
                })
                map.setViewport(points);　
            } else {
                alert('按地图获取设备列表失败');
                console.log(data);
            }
        })
    }

    $('#searchMap').click(function() {
        const address = $('#mapInput input:eq(0)').val();
        const radius = $('#mapInput input:eq(1)').val();
        const url = 'http://api.map.baidu.com/geocoder/v2/?address=' + address + '&output=json&ak=fr2k1GxnZbBxXalKYdcQUNBM';

        $.ajax({    
            url: url,
            dataType: 'jsonp',
            })
        .then(data => {
            if (data.status === 0) {
                const address = data.result.location;
                var data = {
                    'latitude': parseFloat(address.lat),
                    'longitude': parseFloat(address.lng),
                    'radius': parseFloat(radius)
                };
                listRefresh(deviceTree(), $('#content1'), 2, true); 
                getDevicesByMap('/v1/device/query/map2', 'GET', data);
                
            } else {
                alert('获取指定地址经纬度失败');
                console.log(data);
            }
        })
    })

    // `setting
    $('#icon_setting').click(function() {
        var tmp = getSelectedDevice();
        if (tmp == -1) {
            alert('请选择一个设备');
        } else {
            var tmpData = tmp.split('_');
            var deviceId = tmpData[0];
            $.ajax({
                url: '/v1/command/setdevice',
                type: "POST",
                data: JSON.stringify({
                    "deviceId": deviceId
                }),
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
    $('#icon_photo').click(function() {
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
    })


    // 通道列表1
    function channelTree() {
        const data = {
            "userId": cookie_userId,
            "userType": cookie_userType,
        };
        let rootNode;
        ajxSync('/v1/device/tree/channel', 'POST', data)
        .then(data => {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                console.log('获取设备树失败');
            }
        })
        if(window.sessionStorage){
            sessionStorage.channelList = rootNode;
        }
        return rootNode;
    }

    // 通道列表2
    function channelTreeUnselectable() {
        var tree = channelTree();
        return loop(tree);
    }

    function loop(tree){
        tree.forEach(node => {
            if(node.type == 1){
                node.selectable = false;
                node.nodes = loop(node.nodes);
            }
        });
        return tree;
    }

    // 设备线路列表1
    function channelLineTree() {
        let rootNode;
        ajxSync('/v1/device/tree/channel/line', 'POST', {userId: cookie_userId})
        .then(data => {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                console.log('获取设备树失败');
            }
        })
        return rootNode;
    }

    function channelLineTreeUnselectable() {
        var tree = channelLineTree();
        return loop(tree);
    }

    // 设备列表1
    function deviceTree() {
        const data = {
            "userId": cookie_userId
        };
        let rootNode;
        $.ajax({
            url: '/v1/device/tree',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
        }).then(data => {
            if (data.code == 0) {
                rootNode = data.result.data;
            } else {
                alert('获取设备树失败');
            }
        })
        return rootNode;
    }

    // 设备列表2
    function deviceTreeUnselectable() {
        var tree = deviceTree();
        return loop(tree);
    }

    function getSelectedDevice() {
        if ($('.treeSelected').treeview('getSelected').length != 1 || $('.treeSelected').treeview('getSelected')[0].type == undefined || $('.treeSelected').treeview('getSelected')[0].type != 3) {
            return -1;
        }
        return $('.treeSelected').treeview('getSelected')[0].id;
    }


    function getStatus(deviceId) {
        $.ajax({
            url: '/v1/device/details',
            type: "POST",
            data: JSON.stringify({id: deviceId}),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).then(data => {
        	const status = data.result.status === 1 ? "在线" : "离线";
            if (data.code == 0) {
                $('#dvc_status div').empty();
                $('#dvc_status div:eq(0)').append(`<p><b>状态：&nbsp;&nbsp;${status}</b></p><p><b>温度：&nbsp;&nbsp;</b>${data.result.temperature}</p>`);
                $('#dvc_status div:eq(1)').append(`<p><b>电压：&nbsp;&nbsp;</b>${data.result.batteryVoltage}</p><p><b>隐患类型：&nbsp;&nbsp;</b>${dangerType[data.result.deviceDangerID]}</p>`);
            } else {
                console.log('获取设备失败！');
            }
        }) // end of ajax
    }

    function setTreeNodeSelected(selector) {
        selector.data().treeview.options.multiSelect = false;
        
        selector.unbind('nodeSelected');
        selector.on('nodeSelected', function(event, data) {
            $("#pics img").parent().css('border', '0px');

            var selectedItem = selector.treeview('getSelected')[0];

            /*
                type: 1 -> by level
                type: 2 -> by line
                type: 3 -> 0 -> by channel
            */
            var type = selectedItem.type;
            var id = selectedItem.id;
            var name = selectedItem.text;

            console.log('id:' + id);
            console.log('selected item type:' + type);

            if(type === 3){
                type = 0;
                var tmpData = id.split('_');
                var deviceId = tmpData[0];
                var channelNo = tmpData[1];

                $('body').attr('pic-deviceId', deviceId);
                $('body').attr('pic-channelNo', channelNo);
                $('body').attr('pic-index', 0);
                
                getStatus(deviceId);

                if (parseInt($('body').attr('if-history'))) {
                    // var deviceId = $('body').attr('pic-deviceId');
                    var index = parseInt($('body').attr('pic-index'));
                    var channelNo = parseInt($('body').attr('pic-channelNo'));
                    var data = {
                        "channelNo": channelNo,
                        "type": 0,
                        "id": deviceId,
                        "size": 9,
                        "index": 0,
                        "startTime": "1970-01-01 00:00:00",
                        "endTime": "2970-01-01 23:59:59"
                    }
                    getDevicePicsHistory(data);
                } else if (parseInt($('body').attr('if-temperature'))) {
                    var newData = {};

                    newData.deviceIds = [];
                    newData.id = [];
                    newData.type = 0;
                    newData.deviceIds.push(deviceId);
                    tempDevice(newData);
                } else {
                    var data = {
                        channelNo : channelNo,
                        type : 0,
                        id : deviceId,
                        index : 0,
                    }
                    // setDeviceStatus();

                    clearInterval(intervalIds.getAllPics);
                    clearInterval(intervalIds.findDevicePic);
                    getPics(data, false);
                    intervalIds.findDevicePic = setInterval(function() {
                        getPics(data, false)
                    }, INTERVAL);
                }
            }else if(type == 1){
                if (parseInt($('body').attr('if-history'))) {
                    var data = {
                        "channelNo": "",
                        "type": 1,
                        "id": id,
                        "size": 9,
                        "index": 0,
                        "startTime": "1970-01-01 00:00:00",
                        "endTime": "2970-01-01 23:59:59"
                    }
                    getDevicePicsHistory(data);
                }else {
                    var data = {
                        channelNo : '',
                        type : 1,
                        id : id,
                        index : 0,
                    }
                    // setDeviceStatus();

                    clearInterval(intervalIds.getAllPics);
                    clearInterval(intervalIds.findDevicePic);
                    getPics(data, false);
                    intervalIds.findDevicePic = setInterval(function() {
                        var index = parseInt($('body').attr('pic-index'));
                        if (index == 0) {
                            getPics(data, false);
                        }
                    }, INTERVAL);
                }
            }
            $('body').attr('pic-type',type);
        })
    }

    // 地图 点击设备
    function setTreeNodeSelectedMap(selector) {
        selector.data().treeview.options.multiSelect = true;
        selector.unbind('nodeSelected');

        selector.on('nodeSelected nodeUnselected', function(event, data) {
            var newData = {};

            newData.deviceIds = [];
            newData.id = [];

            var selectedDevices = selector.treeview('getSelected');
            newData.type = 0;
            for (var i = 0; i < selectedDevices.length; i++) {
                if (selectedDevices[i].type == 3) {
                    newData.deviceIds.push(selectedDevices[i].id);
                } else {
                    newData.type = 1;
                    newData.id.push(selectedDevices[i].id);
                }
            }
            getDevicesByMap('/v1/device/map/range', 'POST', JSON.stringify(newData));
        })
    }

    function getPics(data, allFlag) {
        if (allFlag) {
            data.userId = cookie_userId;
            data.userType = cookie_userType;
        }

        data.startTime = '1900-01-01 00:00:00';
        data.endTime = '2900-01-01 00:00:00';
        data.size = 5;
        var outerData = data;
        var url = allFlag ? '/v1/search/pics/all' : '/v1/search/pics/device';

        ajxSync(url, 'GET', data)
        .then(function(data) {
            if (data.code === 0) {
                var list = data.result.list;
                var curPage = outerData.index + 1;
                var totalPage = Math.ceil(data.result.total / outerData.size);

                if (totalPage > curPage){
                    $('#picNext').show();
                }else{
                    $('#picNext').hide();
                }

                if (curPage == 1) {
                    $('#picLast').hide();
                } else {
                    $('#picLast').show();
                }

                
                if (allFlag) {
                    $('body').attr('allpic-index', outerData.index);
                    $('body').attr('if-all', 1);
                } else {
                    $('body').attr('pic-index', outerData.index);
                    $('body').attr('pic-deviceId', outerData.id);
                    $('body').attr('if-all', 0);
                }
                
                // picThings();
                var $ele = $('#pics img');
                $ele.removeAttr('data-original');
                $ele.removeAttr('src');
                $ele.removeAttr('picId');
                $ele.removeAttr('channelNo');
                $('.pics p').text('');
                // picReset();

                list.forEach((item, index) => {
                    var name = item.name;
                    var timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                    if (item.width > item.height) {
                        horPicCss(index, item.width, item.height);
                    } else {
                        verPicCss(index, item.width, item.height);
                    }

                    var $ele = $('#pics img:eq(' + index + ')');
                    $ele.attr('src', item.picUrl);
                    $ele.attr('data-original', item.picUrl);
                    $ele.attr('picId', item.picId);
                    $ele.attr('channelNo', item.channelNo);
                    $ele.attr('deviceId', item.deviceId);
                    if (index > 0) {
                        $('.pics:eq(' + (index - 1) + ') p').text(item.time + ' ' + item.deviceId);
                    } else {
                        $('#pics0_desc input:eq(0)').val(item.time);
                        $('#pics0_desc input:eq(1)').val(item.deviceId);
                        $('#pics0_desc input:eq(2)').val(item.deviceTele);
                        $('#pics0_desc input:eq(3)').val(item.deviceId);
                    }

                    $('#picCount').text(`第${curPage}页, 共${totalPage}页`);
                });
                var viewer = new Viewer(document.getElementById('pics'), {url: 'data-original'});
            } else {
                console.log('查询图片失败！');
            }
        });
    }

    //`getDevicePics
    function getDevicePics(data) {
        var outerData = data;
        ajxSync('/v1/search/pics/device', 'GET', data)
        .then(function(data) {
            if (data.code == 0) {
                var list = data.result.list;
                var curPage = outerData.index + 1;
                var totalPage = Math.ceil(data.result.total / outerData.size);

                if (totalPage > curPage){
                    $('#picNext').show();
                }else{
                    $('#picNext').hide();
                }

                if (curPage == 1) {
                    $('#picLast').hide();
                } else {
                    $('#picLast').show();
                }

                $('body').attr('pic-index', outerData.index);
                $('body').attr('pic-deviceId', outerData.id);
                $('body').attr('if-all', 0);

                var list = data.result.list;

                // picThings();
                $('#pics img').removeAttr('data-original');
                $('#pics img').removeAttr('src');
                $('#pics img').removeAttr('picId');
                $('#pics img').removeAttr('channelNo');
                $('.pics p').text('');
                // picReset();

                list.forEach((item, index) => {
                    var name = item.name;
                    var timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                    if (item.width > item.height) {
                        horPicCss(index, item.width, item.height);
                    } else {
                        verPicCss(index, item.width, item.height);
                    }

                    var $ele = $('#pics img:eq(' + index + ')');
                    $ele.attr('src', item.picUrl);
                    $ele.attr('data-original', item.picUrl);
                    $ele.attr('picId', item.picId);
                    $ele.attr('channelNo', item.channelNo);
                    $ele.attr('deviceId', item.deviceId);
                    if (index > 0) {
                        $('.pics:eq(' + (index - 1) + ') p').text(item.time + ' ' + item.deviceId);
                    } else {
                        $('#pics0_desc input:eq(0)').val(item.time);
                        $('#pics0_desc input:eq(1)').val(item.deviceId);
                        $('#pics0_desc input:eq(2)').val(item.deviceTele);
                        $('#pics0_desc input:eq(3)').val(item.deviceId);
                    }

                    $('#picCount').text('第' + (outerData.index + 1) + '页 共' + Math.ceil(data.result.total / outerData.size) + '页');
                });

                var viewer = new Viewer(document.getElementById('pics'), {url: 'data-original'});
            } else {
                if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1) {
                    alert('这已经是最后一页！');
                } else if ($('body').attr('pic-index') == 0) {
                    console.log('这是第一页！');
                } else {
                    console.log('查无图片！');
                }
            }
        });  
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

                            if (i > 0) {
                                $('.pics:eq(' + (i - 1) + ') p').text(list[i].time + ' ' + list[i].deviceId);
                            } else {
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
                    } else if ($('body').attr('allpic-index') == 0) {
                        console.log('这是第一页！');
                    } else {
                        console.log('查无图片！');
                    }
                }
            }
        }) // end of ajax   
    }

    function horPicCss(i, w, h) {
        var img = $("#pics img:eq(" + i + ")");
        img.css('height', '100%');
        var div_w = parseFloat(img.parent().css('width'));
        var img_h = parseFloat(img.css('height'));
        var img_w = w / h * img_h;
        img.css('width', img_w + 'px');

        img.css('top', '');
        img.css('bottom', '');

        img.css('position', 'relative');
        img.css('left', -(img_w - div_w) / 2 + 'px');
        img.css('right', -(img_w - div_w) / 2 + 'px');
    }

    function verPicCss(i, w, h) {
        var img = $("#pics img:eq(" + i + ")");
        img.css('width', '100%');
        var div_h = parseFloat(img.parent().css('height'));
        var img_w = parseFloat(img.css('width'));
        var img_h = h / w * img_w;
        img.css('height', img_h + 'px');

        img.css('left', '');
        img.css('right', '');

        img.css('position', 'relative');
        img.css('top', -(img_h - div_h) / 2 + 'px');
        img.css('bottom', -(img_h - div_h) / 2 + 'px');
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

                    let html;

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
    }); // end of ajax
}


//`MAP things

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
    var point = new BMap.Point(121.506377,31.245105); //定义一个中心点坐标
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


// 检查用户权限
function checkUser(inputData) {
    const data = {
        'userName': inputData.userName,
        'password': inputData.password
    };
    let flag = 0;
    $.ajax({
        url: '/v1/user/check',
        type: "GET",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false
    }).then((data) => {
        if (data.code) {
            alert('用户名或密码有误!');
        } else {
            flag = 1;
        }
    });
    return flag;
}

// 查询设备历史图片
function getDevicePicsHistory(data) {
    var outerData = data;
    $.ajax({
        url: '/v1/search/pics/device',
        type: "GET",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
    }).then((data) => {
        if (!data.code) {
            $('body').attr('pic-history-index', outerData.index);
            var pics = data.result.list;
            for (var i = 0; i < pics.length; i++) {
                var pic = pics[i];
                var name = "";
                var timeName = "";
                if (pic.picType == 2) {
                    // for ref pic
                } else {
                    if (pic.picType == 1) {
                        name = pic.name;
                        timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                    } else {
                        name = pic.name;
                        timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                    }
                    var w = $('#hispics img').css('width');
                    $('#hispics img:eq(' + i + ')').attr('src', pic.thumbnailPicUrl);
                    $('#hispics img:eq(' + i + ')').attr('data-original', pic.picUrl);
                    $('#hispics img:eq(' + i + ')').attr('picId', pic.picId);
                    $('#hispics img:eq(' + i + ')').attr('channelNo', pic.channelNo);
                    $('#hispics img:eq(' + i + ')').attr('deviceId', pic.deviceId);
                    $('#hispics p:eq(' + i + ')').text(pic.time + ' ' + pic.deviceId);
                }
            }
            var viewer = new Viewer(document.getElementById('hispics'), {
                url: 'data-original',
            });
        } else {
            alert('查无图片！');
            console.log(data);
        }
    });
}



function getPicsHistory(data, allFlag) {

}

// 查询所有历史图片
function getAllPicsHistory(data) {
    var outerData = data;
    $.ajax({
        url: '/v1/search/pics/all',
        type: "GET",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false
    }).then(function(data) {
        if (!data.code) {
            $('body').attr('allpic-history-index', outerData.index);
            // $('body').attr('if-all', 1);
            var pics = data.result.list;
            for (var i = 0; i < pics.length; i++) {
                var pic = pics[i];
                var name = "";
                var timeName = "";
                if (pic.picType == 2) {
                    // for ref pic
                } else {
                    if (pic.picType == 1) {
                        name = pic.name;
                        timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                    } else {
                        name = pic.name;
                        timeName = name.slice(18, 22) + '-' + name.slice(22, 24) + '-' + name.slice(24, 26) + "\t" + name.slice(26, 28) + ":" + name.slice(28, 30) + ":" + name.slice(30, 32);
                    }
                    var w = $('#hispics img').css('width');
                    $('#hispics img:eq(' + i + ')').attr('src', pic.thumbnailPicUrl);
                    $('#hispics img:eq(' + i + ')').attr('data-original', pic.picUrl);
                    $('#hispics img:eq(' + i + ')').attr('picId', pic.picId);
                    $('#hispics img:eq(' + i + ')').attr('channelNo', pic.channelNo);
                    $('#hispics img:eq(' + i + ')').attr('deviceId', pic.deviceId);
                    $('#hispics p:eq(' + i + ')').text(pic.time + ' ' + pic.deviceId);
                }
            }
            var viewer = new Viewer(document.getElementById('hispics'), {
                url: 'data-original',
            });
        } else {
            if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1) {
                console.log('这已经是最后一页！');
            } else if ($('body').attr('allpic-index') == 0) {
                console.log('这是第一页！');
            } else {
                console.log('查无图片！');
            }
        }
    });
}

// 获取设备CMD及其温度
function tempDevice(data) {
    $.ajax({
        url: '/v1/device/cmd',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false
    }).then((data) => {
        if (!data.code) {
            const temps = data.result.list;
            $('#tempArea table tbody').empty();
            for (var i = 0; i < temps.length; i++) {
                $('#tempArea table tbody').append(`<tr id=${temps[i].cmdId}><td>${temps[i].cmdId}</td><td>${temps[i].temperature}</td><td>${temps[i].time}</td><td><button>查看</button></td></tr>`)
            }
        } else {
            console.log('获取设备(组)失败');
        }
    });
}