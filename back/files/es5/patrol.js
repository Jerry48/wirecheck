'use strict';

$(function () {
    if (!cookie_userType) {
        $("#tabs_left li:eq(1)").hide();
    }

    initialize();

    $('#nav').css('visibility', 'visible');
    $('#main').css('visibility', 'visible');

    function initialize() {
        // keep 16:9
        var win_width = parseFloat($(document).width());
        $('body').css('height', win_width * 1080 / 1920 + 'px');
        $('p').each(function () {
            var h = $(this).parent().css('height');
            $(this).css('line-height', h);
        });

        $('a').each(function () {
            var h = $(this).parent().css('height');
            $(this).css('line-height', h);
        });

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
        var patrol_width = body_width - left_width - 1;
        // console.log(body_width);
        // console.log(left_width);
        // console.log(patrol_width);


        $('#patrol').css('width', patrol_width + 'px');
        var patrol_height = patrol_width * 1120 / 1920;
        $('#patrol').css('height', patrol_height + 'px');

        function listRefresh(data, selector, levels, mapFlag) {
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
                selectedColor: "rgb(170, 247, 247)"
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

        var data = {
            'index': 0
        };
        getPics(data, true, 9);
        getPics(data, true, 16);

        if (getSelectedDevice() == -1) {
            intervalIds.getAllPics = setInterval(function () {
                getPics(data, true, 9);
            }, INTERVAL);
            intervalIds.getAllPics4x4 = setInterval(function () {
                getPics(data, true, 16);
            }, INTERVAL);
        }

        $('#list1').click(function () {
            listRefresh(channelTree(), $('#content1'), 3, false);
        });

        $('#list2').click(function () {
            listRefresh(channelLineTree(), $('#content2'), 2, false);
        });

        $('body').attr('picsno-data', '9');
        $('body').attr('screen-data', '');
    }

    // buttons
    $('#picLast').click(function () {
        if ($('body').attr('if-all') == 1) {
            var index = parseInt($('body').attr('allpic-index'));
            var data = {
                index: index - 1
            };
            getPics(data, true, 9);
            getPics(data, true, 16);
        } else {
            var id = $('body').attr('pic-deviceId');
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var _index = parseInt($('body').attr('pic-index'));
            var _data = {
                channelNo: channelNo,
                id: id,
                index: _index - 1,
                type: 0
            };
            getPics(_data, false, 9);
            getPics(_data, false, 16);
        }
    });

    $('#picNext').click(function () {
        if ($('body').attr('if-all') == 1) {
            var index = parseInt($('body').attr('allpic-index'));
            var data = {
                index: index + 1
            };
            getPics(data, true, 9);
            getPics(data, true, 16);
        } else {
            var id = $('body').attr('pic-deviceId');
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var _index2 = parseInt($('body').attr('pic-index'));
            var _data2 = {
                channelNo: channelNo,
                id: id,
                index: _index2 + 1,
                type: 0
            };
            getPics(_data2, false, 9);
            getPics(_data2, false, 16);
        }
    });

    $('#refresh').click(function () {
        if ($('body').attr('if-all') == 1) {
            var index = parseInt($('body').attr('pic-index'));
            var data = {
                index: 0
            };
            getPics(data, true, 9);
            getPics(data, true, 16);
        } else {
            var id = $('body').attr('pic-deviceId');
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var _data3 = {
                channelNo: channelNo,
                id: id,
                type: 0,
                index: 0
            };
            getPics(_data3, false, 9);
            getPics(_data3, false, 16);
        }
    });

    //logout
    $('#logout').click(function () {

        var data = {
            'userId': cookie_userId
        };
        $.ajax({
            url: '/v1/user/logout',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function success(data) {
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

    $('#tree').click(function () {
        $('.content ul').css('margin', '0px');
        // $('.content ul li').css('background-color', 'rgb(170,247,247)');
        $('.content ul li').css('padding', '10px');
        $('.indent').css('margin', '5px');
    });

    // 巡检操作
    $('#picsNumChange').click(function () {
        var text = screen(false, true);
        $('#picsNumChange').text(text);
    });

    $('#picsNumChangeFull').click(function () {
        var text = screen(true, true);
        $('#picsNumChangeFull').text(text);
    });

    $('#fullScreen').click(function () {
        screen(true, false);
    });

    $('#exitFullScreen').click(function () {
        screen(true, false);
    });

    function screen(fullFlag, numFlag) {
        $('#main').hide();
        $('#nav').hide();
        $('#pics').hide();
        $('#pics4x4').hide();
        $('#fullMain').hide();
        $('#fullMain4x4').hide();

        var picNum = $('body').attr('picsno-data');
        var target = void 0,
            text = void 0;
        /* 如果全屏，显示fullmain, */
        if (fullFlag) {
            $('body').attr('screen-data', 'full');
            target = '#fullMain';
        } else {
            target = '#pics';
            $('body').attr('screen-data', '');
            $('#nav').show();
            $('#main').show();
        }

        if (numFlag) {
            text = picNum === '9' ? '3x3' : '4x4';
            target += picNum === '9' ? '4x4' : '';
            $('body').attr('picsno-data', picNum === '9' ? '16' : '9');
        } else {
            target += picNum === '9' ? '' : '4x4';
        }

        $(target).show();
        return text;
    }

    $(document).ready(function () {
        /** Coding Here */
    }).keydown(function (e) {
        if (e.which === 27) {
            /** 这里编写当ESC按下时的处理逻辑！ */
            if ($('body').attr('screen-data') == 'full') {
                screen(false, false);
            }
        }
    });

    $('#hoverArea').mouseover(function () {
        $('#hoverArea').show();;
    });

    $('#hoverArea').mouseout(function () {
        $('#hoverArea').hide();
    });

    //修改巡检时间间隔
    $('#interval').change(function () {
        clearIntervals();
        var val = $(this).val();
        $('#interval').val(val);
        INTERVAL = parseInt(val) * 1000;
        if (getSelectedDevice() == -1) {
            var data = {
                index: 0
            };
            intervalIds.getAllPics = setInterval(function () {
                getPics(data, true, 9);
            }, INTERVAL);
            intervalIds.getAllPics4x4 = setInterval(function () {
                getPics(data, true, 16);
            }, INTERVAL);
        } else {
            var id = $('body').attr('pic-deviceId');
            var channelNo = parseInt($('body').attr('pic-channelNo'));
            var index = parseInt($('body').attr('pic-index'));
            var type = $('body').attr('pic-type', type);
            var data = {
                channelNo: channelNo,
                type: type,
                id: deviceId,
                index: index
            };
            getPics(data, false, 9);
            getPics(data, false, 16);
            intervalIds.findDevicePic = setInterval(function () {
                getPics(data, false, 9);
            }, INTERVAL);
            intervalIds.findDevicePic4x4 = setInterval(function () {
                getPics(data, false, 16);
            }, INTERVAL);
        }
    });

    //`push
    $('img').click(function () {
        var picId = $(this).attr('picId');
        var deviceId = $(this).attr('deviceId');
        $('body').attr('selectedPic', picId);
        $('body').attr('selectedDevice', deviceId);
        $('img').css('border', '');
        $(this).css('border', '2px solid red');
    });

    $('img').dblclick(function () {});

    $('#push').click(function () {
        if ($('body').attr('selectedPic') == '' || $('body').attr('selectedPic') == undefined) {
            alert('请选择图片！');
        } else {
            var picId = $('body').attr('selectedPic');
            var deviceId = $('body').attr('selectedDevice');
            var data = {
                "deviceId": deviceId,
                "userId": cookie_userId
            };
            $.ajax({
                url: '/v1/device/list/users',
                type: "GET",
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false,
                success: function success(data) {
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
            }); // end of ajax /v1/device/list/users
        }
    });

    $('#modalPush .modal-footer button:eq(0)').click(function () {
        var picId = $('body').attr('selectedPic');
        var deviceId = $('body').attr('selectedDevice');
        var picIds = [];
        picIds.push({ 'picId': picId });
        var userIds = [];
        $('#modalPush input:checked').each(function () {
            userIds.push({ 'userId': $(this).attr('userId') });
        });
        var data = {
            "userId": cookie_userId,
            "deviceId": deviceId,
            "picIds": picIds,
            'userIds': userIds
        };
        $.ajax({
            url: '/v1/command/push/pics',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function success(data) {
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


    function channelTree() {
        var data = {
            "userId": cookie_userId,
            "userType": cookie_userType
        };
        var rootNode = [];
        $.ajax({
            url: '/v1/device/tree/channel',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function success(data) {
                if (data.code == 0) {
                    rootNode = data.result.data;
                } else {
                    console.log('获取设备树失败');
                }
            }
        });
        return rootNode;
    }

    function channelLineTree() {
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
            success: function success(data) {
                if (data.code == 0) {
                    rootNode = data.result.data;
                } else {
                    console.log('获取设备树失败');
                }
            }
        });
        return rootNode;
    }

    function getPics(data, allFlag, number) {
        if (allFlag) {
            data.userId = cookie_userId;
            data.userType = cookie_userType;
        }

        data.startTime = '1900-01-01 00:00:00';
        data.endTime = '2900-01-01 00:00:00';
        data.size = number;
        console.log(data);
        console.log('gonna get ' + (allFlag ? 'all' : 'device') + ' of ' + number);
        var outerData = data;
        var url = allFlag ? '/v1/search/pics/all' : '/v1/search/pics/device';
        ajxSync(url, 'GET', data).then(function (data) {
            if (data.code == 0) {
                var list = data.result.list;
                var ID = void 0,
                    fullID = void 0;
                if (allFlag) {
                    $('body').attr('allpic-index', outerData.index);
                    $('body').attr('if-all', 1);
                } else {
                    $('body').attr('pic-index', outerData.index);
                    $('body').attr('pic-deviceId', outerData.id);
                    $('body').attr('if-all', 0);
                }
                if (number === 9) {
                    ID = 'pics';
                    fullID = 'fullMain';
                } else {
                    ID = 'pics4x4';
                    fullID = 'fullMain4x4';
                }

                $('#' + ID + ' img').attr('src', '');
                $('#' + ID + ' img').attr('picId', '');
                $('#' + ID + ' img').attr('channelNo', '');
                $('#' + fullID + ' img').attr('src', '');
                $('#' + fullID + ' img').attr('picId', '');
                $('#' + fullID + ' img').attr('channelNo', '');

                list.forEach(function (item, index) {
                    var $ele = $('#' + ID + ' img:eq(' + index + ')');
                    $ele.attr('src', item.thumbnailPicUrl);
                    $ele.attr('picId', item.picId);
                    $ele.attr('channelNo', item.channelNo);
                    $ele.attr('data-original', item.picUrl);
                    $ele.attr('deviceId', item.deviceId);

                    $ele = $('#' + fullID + ' img:eq(' + index + ')');
                    $ele.attr('src', item.thumbnailPicUrl);
                    $ele.attr('picId', item.picId);
                    $ele.attr('channelNo', item.channelNo);
                    $ele.attr('data-original', item.picUrl);
                    $ele.attr('deviceId', item.deviceId);

                    var viewer = new Viewer(document.getElementById(ID), { url: 'data-original' });
                    var viewer = new Viewer(document.getElementById(fullID), { url: 'data-original' });
                });
            } else {
                console.log(data);
            }
        });
    }

    function getSelectedDevice() {
        if ($('.treeSelected').treeview('getSelected').length != 1 || $('.treeSelected').treeview('getSelected')[0].type == undefined || $('.treeSelected').treeview('getSelected')[0].type != 3) {
            return -1;
        }
        return $('.treeSelected').treeview('getSelected')[0].id;
    }

    function clearIntervals() {
        for (var item in intervalIds) {
            clearInterval(intervalIds[item]);
        }
    }

    function setTreeNodeSelected(selector) {
        selector.data().treeview.options.multiSelect = false;
        selector.unbind('nodeSelected');
        selector.on('nodeSelected', function (event, data) {
            $("img").css('border', '0px');
            var selectedItem = selector.treeview('getSelected')[0];
            var type = selectedItem.type;
            var id = selectedItem.id;
            var name = selectedItem.text;

            // console.log(type);
            if (type == 3) {
                type = 0;
                var deviceId = id.slice(0, 17);
                var channelNo = id.slice(18, 19);
                var tmpId = deviceId;
                $('body').attr('pic-deviceId', deviceId);
                $('body').attr('pic-channelNo', channelNo);
            } else if (type == 1) {
                channelNo = '';
                var tmpId = id;
            }

            $('body').attr('pic-type', type);

            var data = {
                channelNo: channelNo,
                type: type,
                id: tmpId,
                index: 0
            };
            clearIntervals();
            getPics(data, false, 9);
            intervalIds.findDevicePic = setInterval(function () {
                getPics(data, false, 9);
            }, INTERVAL);
            getPics(data, false, 16);
            intervalIds.findDevicePic4x4 = setInterval(function () {
                getPics(data, false, 16);
            }, INTERVAL);
        }); // end of nodeSelected event
    }
});