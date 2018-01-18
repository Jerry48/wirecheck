var USERTYPE = 1;
$(function() {
    if (cookie_sessionId !== undefined) {
        if(!cookie_userType) {
            $("#tab_set").parent().hide();
        }

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

        // adjust p
        $('#left-header p').css('line-height', '');
        $('#main3 p').css('line-height', '');

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
        //privileges

        //页面显示
        $('#nav').css('visibility', 'visible')
        $('#main').css('visibility', 'visible')

        var height = parseInt($("#title").css("height"));
        $("#title").css('line-height', height + 'px');
        $("#title a").css('font-size', height * 0.5 + 'px');
        $("#title").css('padding-left', height * 0.2 + 'px');

        for (var i = 1; i < 3; i++) {
            var tmp = parseInt($('#part2').css('height')) / 3 + 'px';
            $('#import' + i).css('margin-top', tmp);
        }

        flushAll();

        //main show
        userInfoList(cookie_userId);
    }
    
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

        $('#tab_info').click(function() {
            $('#main2').hide();
            $('#main3').hide();
            $('#main').show();
        //main show
        flushAll();
        userInfoList(cookie_userId);
    })

        $('#tab_group').click(function() {
            $('#main').hide();
            $('#main3').hide();
            $('#main2').show();

        // main2 show
        flushAll();
        var data = {
            'index': 0,
            'order': 'deviceID',
        }

        deviceInfoList(data);
        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 0, });
        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 1, });
    })

        $('#tab_set').click(function() {
            $('#main').hide();
            $('#main2').hide();
            $('#main3').show();

        //main3 show
        flushAll();
        var tmpData = deviceTreeMulti(cookie_userId);

        $('#part1').treeview({
            data: tmpData,
            levels: 3,
            multiSelect: true,
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right"
        });


        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 0, });
        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 1, });
    })



        $('#addUser').click(function() {
            flushAll();
            selectGroup();
            selectLogo('#selectLogoAdd');
            $('#modalAdd').modal();
        })

        $('#addUserType').change(function() {
            if ($(this).val() == '2') {
                $('#privilegeGroup').val('1');
                $('#privilegeGroup').attr('disabled', 'disabled');
                $('#privilegeGroup').css('background-color', '#EEEEEE');
            } else {
                $('#privilegeGroup').removeAttr('disabled');
                $('#privilegeGroup').css('background-color', '');
                $('#privilegeGroup').val('0');
            }
        })

        $('#editUserType').change(function() {
            if ($(this).val() == '1') {
                $('#privilegeGroupSelect').val('1');
                $('#privilegeGroupSelect').attr('disabled', 'disabled');
                $('#privilegeGroupSelect').css('background-color', '#EEEEEE');
            } else {
                $('#privilegeGroupSelect').removeAttr('disabled');
                $('#privilegeGroupSelect').css('background-color', '');
                $('#privilegeGroupSelect').val('0');
            }
        })

        $('#modalAdd .modal-footer button:eq(0)').click(function() {
            var userName = $('#modalAdd-body input:eq(0)').val();
            var name = $('#modalAdd-body input:eq(1)').val();
            var password = $('#modalAdd-body input:eq(2)').val();
            var repassword = $('#modalAdd-body input:eq(3)').val();
            var mobile = $('#modalAdd-body input:eq(4)').val();
            var department = $('#modalAdd-body input:eq(5)').val();
            var userType = parseInt($('#modalAdd-body select').val()) - 1;
            var logoFile = $('#selectLogoAdd').val()

            var usrEdit, pwdEdit, deviceOp, channelSet, wechatPush, createGroup;
            if (userType == 1 || $('#pselectAll').prop('checked')) {
                usrEdit = 1;
                pwdEdit = 1;
                deviceOp = 1;
                channelSet = 1;
                wechatPush = 1;
                createGroup = 1;
            } else {
                if ($('#pselectOne input:eq(0)').prop('checked')) { usrEdit = 1; } else { usrEdit = 0; }
                if ($('#pselectOne input:eq(1)').prop('checked')) { pwdEdit = 1; } else { pwdEdit = 0; }
                if ($('#pselectOne input:eq(2)').prop('checked')) { deviceOp = 1; } else { deviceOp = 0; }
                if ($('#pselectOne input:eq(3)').prop('checked')) { channelSet = 1; } else { channelSet = 0; }
                if ($('#pselectOne input:eq(4)').prop('checked')) { wechatPush = 1; } else { wechatPush = 0; }
                if ($('#pselectOne input:eq(5)').prop('checked')) { createGroup = 1; } else { createGroup = 0; }
            }

            var groupId = $('#privilegeGroup').val();
            var flag = true;
            if (userName == '' || name == '' || mobile == '' || department == '' || groupId == 0 || userType == -1) {
                flag = false;
                alert('资料不完整!');
            }

            if (password != repassword) {
                flag = false;
                alert('两次输入的密码不一致！请重新输入！');
                $('#modalAdd-body input:eq(2)').val('');
                $('#modalAdd-body input:eq(3)').val('');
            }

            if (flag) {
                var data = {
                    'userName': userName,
                    'name': name,
                    'password': password,
                    'mobile': mobile,
                    'department': department,
                    'userType': userType,
                    'groupType': 0,
                    'groupId': groupId,
                    'usrEdit': usrEdit,
                    'pwdEdit': pwdEdit,
                    'deviceOp': deviceOp,
                    'channelSet': channelSet,
                    'wechatPush': wechatPush,
                    'createGroup': createGroup,
                    'logoFile': logoFile
                };
                createUser(data);
            }
        })

        $('body').on('click', '#selectAll', function() {
            if (this.checked) {
                $("#main tbody input[type='checkbox']").each(function() {
                    this.checked = true;
                });
            } else {
                $("#main tbody input[type='checkbox']").each(function() {
                    this.checked = false;
                });
            }
        })

        $('#pselectAll').click(function() {
            if (this.checked) {
                $("#privilege div:eq(1) input[type='checkbox']").each(function() {
                    this.checked = true;
                });
            } else {
                $("#privilege div:eq(1) input[type='checkbox']").each(function() {
                    this.checked = false;
                });
            }
        })

    //修改用户
    $('#editUser').click(function() {
        $('#modalEdit input').val('');
        var num = $('#main table tbody').find("input:checkbox:checked").length;
        if (num > 1) {
            alert('只可以选择一个设备!');
        } else if (num == 0) {
            alert('未选中设备!');
        } else {
            var tr = $('#main table tbody').find("input:checkbox:checked").parent().parent();
            $('#modalEdit-body input:eq(0)').val(tr.find('td:eq(3)').text());
            $('#modalEdit-body input:eq(1)').val(tr.find('td:eq(2)').text());
            $('#modalEdit-body input:eq(4)').val(tr.attr('mobile'));
            $('#modalEdit-body input:eq(5)').val(tr.find('td:eq(6)').text());
            $('#editUserType').val(tr.attr('usertype'));


            selectGroup();
            selectLogo('#selectLogoEdit');
            $('#selectLogoEdit').val(tr.attr('logofile'));

            if (tr.attr('usertype') == '1') {
                $('#privilegeGroupSelect').val('1');
                $('#privilegeGroupSelect').attr('disabled', 'disabled');
                $('#privilegeGroupSelect').css('background-color', '#EEEEEE');
            } else {
                var groupId = tr.attr('groupid');
                // console.log(groupId);
                $('#privilegeGroupSelect').val(groupId);
            }
            $('#modalEdit').modal();
        }
    })

    $('#modalEdit .modal-footer button:eq(0)').click(function() {
        var userName = $('#modalEdit-body input:eq(0)').val();
        var name = $('#modalEdit-body input:eq(1)').val();
        var password = $('#modalEdit-body input:eq(2)').val();
        var repassword = $('#modalEdit-body input:eq(3)').val();
        var mobile = $('#modalEdit-body input:eq(4)').val();
        var department = $('#modalEdit-body input:eq(5)').val();
        var userType = $('#modalEdit-body select').find('option:selected').val();
        var groupId = $('#privilegeGroupSelect').val();
        var logoFile = $('#selectLogoEdit').val();

        var flag = true;
        if (userName == '' || name == '' || mobile == '' || department == '' || groupId == 0 || userType == -1) {
            flag = false;
            alert('资料不完整!');
        }
        if (password != repassword) {
            flag = false;
            alert('两次输入的密码不一致！请重新输入！');
        }
        var tr = $('#main table tbody').find("input:checkbox:checked").parent().parent();
        var userId = tr.attr('id');
        var data = {
            'userName': userName,
            'name': name,
            'password': password,
            'mobile': mobile,
            'department': department,
            'userType': userType,
            'userId': userId,
            'groupId': groupId,
            'logoFile': logoFile
        };
        editUser(data);
    })

    // 删除用户
    $('#deleteUser').click(function() {
        var num = $('#main table tbody').find("input:checkbox:checked").length;
        if (num == 0) {
            alert('未选中设备!');
        } else {
            if (confirm('确认删除该用户？点击确定后用户所有信息将被删除')) {
                var list = [];
                for (var i = 0; i < num; i++) {
                    var id = $('#main table tbody').find("input:checkbox:checked:eq(" + i + ")").parent().parent().attr('id');
                    list.push(id);
                }
                deleteUser(list);
            }   
        }
    })

    // 上传logo
    $('#uploadLogo').click(function() {
        $('#logo').empty();
        findLogoFiles(cookie_userId);
    })

    $('#logo').change(function() {
        var file = this.files[0];
        if(file){
            console.log(file);
            console.log(`${file.name},${file.size},${file.type}`);
        }
    });

    $('#uploadConfirm').click(function() {
        var formData = new FormData();
        console.log($('#logo').prop('files'));
        formData.append('logo', $('#logo').prop('files')[0]);
        $('#progressbar').show();

        function progressHandler(e) {
            if (e.lengthComputable) {
                $("#progressbar").progressbar({
                    value: e.loaded,
                    max: e.total
                });
            }
        }

        $.ajax({
            url: '/api/upload/logo',
            type: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            xhr: function() { // custom xhr
                var myXhr = $.ajaxSettings.xhr();
                if (progressHandler && myXhr.upload) { // check if upload property exists
                    myXhr.upload.addEventListener('progress', progressHandler, false); // for handling the progress of the upload
                }
                return myXhr;
            }
        })
        .then(function(data) {
            if (data.flag == 1) {
                alert('上传成功！');
                findLogoFiles(cookie_userId);
            } else {
                alert('上传失败！请重新上传！');
            }
        });
        console.log("after ajax!");
    });

    function findLogoFiles(userId) {
        var data = {userId: userId};
        $.ajax({
            url: '/v1/user/logo/list',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                if (data.code == 0) {
                    $('#fileList').empty();
                    var list = data.result.list;
                    list.forEach(item => {
                        var $ctrl = `<div><button class="deleteFile" style="margin-right:20px;" filename="${item}">删除</button>${item}</div>`;
                        $('#fileList').append($ctrl);
                    });
                } else {
                    alert('处理失败！');
                    console.log(data);
                }
            }
        }) // end of ajax
    }

    $('#modalUpload').on('click','.deleteFile',function(){
        if(confirm("是否确定删除该升级文件？")){
            var filename = $(this).attr('filename');
            var data = {'filename': filename};
            $.ajax({
                url: '/v1/user/logo/delete',
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    if (data.code == 0) {
                        alert('删除成功!');
                        findLogoFiles(cookie_userId);
                    } else {
                        alert('处理失败！');
                        console.log(data);
                    }
                }
            }) // end of ajax
        }
    });

    //分组设置
    //添加分组
    $('#addGroup').click(function() {
        $('#modalAddGroup-body input').val('');
        $('#modalAddGroup').modal();
    })

    $('#addTemGroup').click(function() {
        $('#modalAddTemGroup-body input').val('');
        $('#modalAddTemGroup').modal();
    })

    $('#modalAddGroup .modal-footer button:eq(0)').click(function() {
        if ($('#modalAddGroup-body input:eq(0)').val() == "") {
            alert('请输入分组名！');
        } else {
            var name = $('#modalAddGroup-body input:eq(0)').val();
            var type = 0;
            var data = {
                'userId': cookie_userId,
                'userType': USERTYPE,
                'name': name,
                'type': type
            };
            createGroup(data);
        }
    })

    $('#modalAddTemGroup .modal-footer button:eq(0)').click(function() {
        if ($('#modalAddTemGroup-body input:eq(0)').val() == "") {
            alert('请输入分组名！');
        } else {
            var name = $('#modalAddTemGroup-body input:eq(0)').val();
            var type = 1;
            var data = {
                'userId': cookie_userId,
                'userType': USERTYPE,
                'name': name,
                'type': type
            };
            createGroup(data);
        }
    })

    $('body').on('click', '.showGroup p', function() {
        $('body').attr('groupId',$(this).attr('id'));
        $('.showGroup p').css('background-color', 'white');
        $('.showGroup p').removeClass('clickFlag');
        $(this).css('background-color', 'rgb(176,196,222)');
        $(this).addClass('clickFlag');
        var treePriv = deviceTreePriv($(this).attr('id'));

        $('#part5').treeview({
            data: treePriv,
            levels: 3,
            multiSelect: false,
            collapseIcon: "glyphicon glyphicon-chevron-down",
            expandIcon: "glyphicon glyphicon-chevron-right"
        });
        setTreeNodeSelected($('#part5'));
    })

    $('body').on('click', '#showTemGroup p', function() {
        $('#showTemGroup p').css('background-color', 'white');
        $('#showTemGroup p').removeClass('clickFlag');
        $(this).css('background-color', 'rgb(176,196,222)');
        $(this).addClass('clickFlag');
    })

    //修改分组
    $('#editGroup').click(function() {
        if ($('.showGroup .clickFlag').length == 0) {
            alert('请选择要修改的分组！');
        } else {
            var tmp = $('.showGroup .clickFlag').text();
            $('#modalEditGroup-body input:eq(0)').val(tmp);
            $('#modalEditGroup').modal();
        }
    })

    $('#editTemGroup').click(function() {
        if ($('#showTemGroup .clickFlag').length == 0) {
            alert('请选择要修改的分组！');
        } else {
            var tmp = $('#showTemGroup .clickFlag').text();
            $('#modalEditTemGroup-body input:eq(0)').val(tmp);
            $('#modalEditTemGroup').modal();
        }
    })

    $('#modalEditGroup .modal-footer button:eq(0)').click(function() {
        if ($('#modalEditGroup-body input:eq(0)').val() == "") {
            alert('请输入分组名！');
        } else {
            var name = $('#modalEditGroup-body input:eq(0)').val();
            var id = $('.showGroup .clickFlag').attr('id');
            var type = 0;
            var data = {
                'name': name,
                'type': type,
                'id': id
            };
            editGroup(data);
        }
    })

    $('#modalEditTemGroup .modal-footer button:eq(0)').click(function() {
        if ($('#modalEditTemGroup-body input:eq(0)').val() == "") {
            alert('请输入分组名！');
        } else {
            var name = $('#modalEditTemGroup-body input:eq(0)').val();
            var id = $('#showTemGroup .clickFlag').attr('id');
            var type = 1;
            var data = {
                'name': name,
                'type': type,
                'id': id
            };
            editGroup(data);
        }
    })

    //删除分组
    $('#deleteGroup').click(function() {
        if ($('.showGroup .clickFlag').length == 0) {
            alert('请选择要删除的分组！');
        } else {
            if (confirm('确认删除该分组？')) {
                var id = $('.showGroup .clickFlag').attr('id');
                var data = {
                    'userId': cookie_userId,
                    'userType': USERTYPE,
                    'id': id,
                    'type': 0,
                }
                deleteGroup(data);
            }
        }
    })

    $('#deleteTemGroup').click(function() {
        if ($('#showTemGroup .clickFlag').length == 0) {
            alert('请选择要删除的分组！');
        } else {
            if (confirm('确认删除该分组？')) {
                var id = $('#showTemGroup .clickFlag').attr('id');
                var data = {
                    'userId': cookie_userId,
                    'userType': USERTYPE,
                    'id': id,
                    'type': 1,
                }
                deleteGroup(data);
            }
        }
    })

    //删除设备
    $('#deleteDevice').click(function() {
        if (getSelectedDevice() == -1) {
            alert('请选择要删除的设备！');
        } else {
            if (confirm('确认删除该设备？')) {
                var deviceId = $('body').attr('delete-deviceId');
                // alert(deviceId);
                var data = {
                    'groupId': $('body').attr('groupId'),
                    'deviceId': $('body').attr('delete-deviceId'),
                }
                deleteDevice(data);
            }
        }
    })

    //导入分组1
    $('#import1').click(function() {
        var nodeSelected = $('#part1').treeview('getSelected');
        var deviceIds = [];
        var ids = [];
        for (var i = 0; i < nodeSelected.length; i++) {
            if (nodeSelected[i].type == 3) {
                var deviceId = nodeSelected[i].id;
                deviceIds.push(deviceId);
            } else {
                var id = nodeSelected[i].id;
                ids.push(id)
            }
        }

        var groupId = $('#part3 .clickFlag').attr('id');
        var data = {
            'ids': ids,
            'deviceIds': deviceIds,
            'id': groupId,
            'type': 0,
        };
        setGroupMember(data);
    })

    // $('#import2').click(function() {
    //     var nodeSelected = $('#part1').treeview('getSelected');
    //     var deviceIds = [];
    //     var ids = [];
    //     for (var i = 0; i < nodeSelected.length; i++) {
    //         if (nodeSelected[i].type == 3) {
    //             var deviceId = nodeSelected[i].id;
    //             deviceIds.push(deviceId);
    //         } else {
    //             var id = nodeSelected[i].id;
    //             ids.push(id)
    //         }
    //     }

    //     var groupId = $('#part5 .clickFlag').attr('id');
    //     var data = {
    //         'ids': ids,
    //         'deviceIds': deviceIds,
    //         'id': groupId,
    //         'type': 1,
    //     };
    //     setGroupMember(data);
    // })

    // $('body').on('click', '.showGroup p', function() {
    //     var groupId = $(this).attr('id');
    //     var data = {
    //         'id': groupId,
    //         'type': 0,
    //     };
    //     listGroupMember(data);
    // })

    function getSelectedDevice() {
        if ($('#part5').treeview('getSelected').length != 1 || $('#part5').treeview('getSelected')[0].type == undefined || $('#part5').treeview('getSelected')[0].type != 3) {
            return -1;
        }
        return $('#part5').treeview('getSelected')[0].id;
    }

    function setTreeNodeSelected(selector) {
        selector.data().treeview.options.multiSelect = false;
        selector.unbind('nodeSelected');
        selector.on('nodeSelected', function(event, data) {
            var type = selector.treeview('getSelected')[0].type;
            var tmp = selector.treeview('getSelected')[0].id;
            var deviceId = selector.treeview('getSelected')[0].id;
            $('body').attr('delete-deviceId',deviceId);
        //     var tmpData = tmp.split('_');
        //     var deviceId = tmpData[0];
        //     $('body').attr('pic-deviceId',deviceId);
        //     var channelNo = tmpData[1];
        //     $('body').attr('pic-channelNo',channelNo);
        });
    };

    function flushAll() {
        $('#modalAdd input').val('');
        $("#pselectAll").prop('checked', false);
        $("#privilege div:eq(1) input[type='checkbox']").each(function() {
            this.checked = false;
        });
    }

    function dataTableInit(data) {
        var height = parseInt($('#main').css('height')) * 0.95 * 0.85;
        var dt = $('#dt1').DataTable({
            data: data,
            pageLength: 100,
            // scrollY: height + "px",
            scrollX: false,
            destroy:true,
            columns: [
                {"data": null},
                {"data": null},
                {"data": "name"},
                {"data": "userName"},
                {"data": "userType"},
                {"data": "groupName"},
                {"data": "department"},
                {"data": "mobile"},
            ],
            columnDefs: [
                {
                    "render": function(data, type, row, meta){
                        return '<input type="checkbox"/>';
                    },
                    "targets": 0
                },
                {
                    "render": function(data, type, row, meta){
                        return data == 0 ? '操作员' : '管理员';
                    },
                    "targets": 4
                },
                {
                    "render": function(data, type, row, meta){
                        return row['userType'] == 0 ? data : '全部';
                    },
                    "targets": 5
                },
            ],
            "createdRow": function ( row, data, index ) {
                $(row).attr('id', data.userId);
                $(row).attr('userType', data.userType);
                $(row).attr('department', data.department);
                $(row).attr('mobile', data.mobile);
                $(row).attr('groupId', data.groupId);
                $(row).attr('logoFile', data.logoFile);
            },
            "language": {
                "lengthMenu":     "显示 _MENU_ 条",
                "info":           "显示 _START_ to _END_ of _TOTAL_ 条",
                "infoEmpty":      "显示 0 to 0 of 0 条",
                "search":         "搜索:",
                "paginate": {
                    "first":      "首页",
                    "last":       "末页",
                    "next":       "下一页",
                    "previous":   "上一页"
                },
            },
        });
        dt.on('order.dt search.dt',
        function() {
            dt.column(1, {
                "search": 'applied',
                "order": 'applied'
            }).nodes().each(function(cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
    }

    function userInfoList(inputData) {
        var data = {
            'userId': inputData,
        }
        $.ajax({
            url: '/v1/user/all',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.list;
                    dataTableInit(list);
                } else {
                    console('获取用户列表失败！');
                }
            }
        });
    }

    function createUser(inputData) {
        var data = inputData;
        $.ajax({
            url: '/v1/user/create',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('新建用户成功！');
                    $('#modalAdd').modal('hide');
                    userInfoList(cookie_userId);
                } else {
                    alert('新建用户失败！');
                    flushAll();
                }
            }
        });
    }

    function editUser(inputData) {
        console.log(inputData);
        var data = inputData;
        $.ajax({
            url: '/v1/user/edit',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('编辑用户成功！');
                    $('#modalEdit').modal('hide');
                    userInfoList(cookie_userId);
                } else {
                    alert('编辑用户失败！');
                }
            }
        });
    }

    function deleteUser(inputData) {
        var data = {
            'list': inputData,
        }
        $.ajax({
            url: '/v1/user/delete',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('删除用户成功！');
                    userInfoList(cookie_userId);
                } else {
                    alert('删除用户失败！');
                }
            }
        });
    }

    function deleteDevice(inputData) {
        var data = {
            'groupId': inputData.groupId,
            'deviceId': inputData.deviceId,
        }
        $.ajax({
            url: '/v1/device/group/delete/member',
            type: "GET",
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('删除设备成功！');
                    var treePriv = deviceTreePriv($('body').attr('groupId'));

                    $('#part5').treeview({
                        data: treePriv,
                        levels: 3,
                        multiSelect: false,
                        collapseIcon: "glyphicon glyphicon-chevron-down",
                        expandIcon: "glyphicon glyphicon-chevron-right"
                    });
                    setTreeNodeSelected($('#part5'));
                } else {
                    alert('删除设备失败！');
                }
            }
        });
    }

    function deviceTreeMulti(userId) {
        var data = {
            "userId": userId
        };
        var rootNode = [];
        $.ajax({
            url: '/v1/device/tree',
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

    function deviceTreePriv(groupId) {
        var data = {
            "groupId": groupId
        };
        var rootNode = [];
        $.ajax({
            url: '/v1/device/tree/priv',
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

    function listGroup(inputData) {
        var data = inputData;
        $.ajax({
            url: '/v1/device/allgroups',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.list;
                    if (inputData.type == 0) {
                        $('.showGroup').empty();
                        for (var i = 0; i < list.length; i++) {
                            $('.showGroup').append('<p id="' + list[i].id + '">' + list[i].name + '</p>')
                        }
                        $('.showGroup p').css('width', '100%');
                        $('.showGroup p').css('border-bottom', '1px solid black');
                        $('.showGroup p').css('margin-bottom', '0px');
                    } else {
                        $('#showTemGroup').empty();
                        for (var i = 0; i < list.length; i++) {
                            $('#showTemGroup').append('<p id="' + list[i].id + '">' + list[i].name + '</p>')
                        }
                        $('#showTemGroup p').css('width', '100%');
                        $('#showTemGroup p').css('border-bottom', '1px solid black');
                        $('#showTemGroup p').css('margin-bottom', '0px');
                    }

                } else {
                    alert('获取分组列表失败！');
                }
            }
        })
    }

    function createGroup(inputData) {
        var data = inputData;
        $.ajax({
            url: '/v1/device/group/create',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('创建分组成功！');
                    if (inputData.type == 0) {
                        $('#modalAddGroup').modal('hide');
                        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 0 });
                    } else {
                        $('#modalAddTemGroup').modal('hide');
                        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 1 });
                    }
                } else {
                    alert('创建分组失败！');
                }
            }
        })
    }

    function editGroup(inputData) {
        var data = inputData;
        $.ajax({
            url: '/v1/device/group/edit',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('编辑分组成功！');
                    if (inputData.type == 0) {
                        $('#modalEditGroup').modal('hide');
                        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 0 });
                    } else {
                        $('#modalEditTemGroup').modal('hide');
                        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 1 });
                    }
                } else {
                    alert('编辑分组失败！');
                }
            }
        })
    }

    function deleteGroup(inputData) {
        var data = inputData;
        $.ajax({
            url: '/v1/device/group/delete',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('删除分组成功！');
                    if (inputData.type == 0) {
                        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 0 });
                    } else {
                        listGroup({ 'userId': cookie_userId, 'userType': USERTYPE, 'type': 1 });
                    }
                } else {
                    alert('删除分组失败！');
                }
            }
        })
    }

    function setGroupMember(inputData) {
        var data = inputData;
        $.ajax({
            url: '/v1/device/group/setmembers',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    alert('导入分组成功！');
                    var treePriv = deviceTreePriv($('body').attr('groupId'));

                    $('#part5').treeview({
                        data: treePriv,
                        levels: 3,
                        multiSelect: false,
                        collapseIcon: "glyphicon glyphicon-chevron-down",
                        expandIcon: "glyphicon glyphicon-chevron-right"
                    });
                    setTreeNodeSelected($('#part5'));
                } else {
                    alert('导入分组失败！');
                }
            }
        })
    }

    function listGroupMember(inputData) {
        var data = inputData;
        $.ajax({
            url: '/v1/device/group/listmembers',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.list;
                    var size = data.result.size;

                    $('#table tbody').empty();
                    for (var i = 0; i < size; i++) {
                        switch (list[i].status) {
                            case 0:
                            var html = '<td style="color:red">离线</td>';
                            break;
                            case 1:
                            var html = '<td style="color:blue">在线</td>';
                            break;
                            default:
                            var html = '<td>离线</td>';
                            break;
                        }
                        if (list[i].deviceDangerID == '') { list[i].deviceDangerID = 0; };
                        $("#table tbody").append("<tr id='" + list[i].id + "' class='infolist' devicedangerid='" + list[i].name + "'><td>" + (i + 1) + "</td><td>" + list[i].name + "</td><td>" + list[i].deviceTele + "</td><td>" + list[i].area + "</td><td>" + list[i].lineName + "</td><td>" + list[i].danger + "</td>" + html + "<td>" + list[i].latitude + "</td><td>" + list[i].longitude + "</td><td>" + list[i].deviceMeid + "</td></tr>");
                    }
                } else {
                    alert('查看分组失败！');
                }
            }
        })
    }

    function deviceInfoList(inputData) {
        var data = {
            'userId': cookie_userId,
            'index': inputData.index,
            'size': ENTRIES,
            'order': inputData.order,
        };
        $.ajax({
            url: '/v1/device/info/list',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.list;
                    var total = data.result.total;
                    $('#table').attr('infolist-index', inputData.index);
                    var pages = Math.ceil(total / ENTRIES);
                    $('#infoCount').text('第' + (inputData.index + 1) + '页，共' + pages + '页');
                    if (inputData.index + 1 == 1) {
                        $('#infoLast').hide();
                    } else {
                        $('#infoLast').show();
                    }

                    if (inputData.index + 1 == pages) {
                        $('#infoNext').hide();
                    } else {
                        $('#infoNext').show();
                    }

                    $('#table tbody').empty();
                    var tmp = (list.length < ENTRIES) ? list.length : ENTRIES;
                    for (var i = 0; i < tmp; i++) {
                        switch (list[i].status) {
                            case 0:
                            var html = '<td style="color:red">离线</td>';
                            break;
                            case 1:
                            var html = '<td style="color:blue">在线</td>';
                            break;
                            default:
                            var html = '<td>离线</td>';
                            break;
                        }
                        if (list[i].deviceDangerID == '') { list[i].deviceDangerID = 0; };
                        $("#table tbody").append("<tr id='" + list[i].deviceId + "' class='infolist' devicedangerid='" + list[i].deviceDangerID + "'><td>" + (i + 1) + "</td><td>" + list[i].deviceName + "</td><td>" + list[i].deviceTele + "</td><td>" + list[i].area + "</td><td>" + list[i].lineName + "</td><td>" + list[i].danger + "</td>" + html + "<td>" + list[i].latitude + "</td><td>" + list[i].longitude + "</td><td>" + list[i].deviceMeid + "</td></tr>");
                    }
                } else {
                    alert('获取设备信息列表失败');
                }
            }
        })
    }

    function selectGroup() {
        var data = {
            'userId': cookie_userId,
            'userType': 1,
            'type': 0,
        };
        $.ajax({
            url: '/v1/device/allgroups',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.list;
                    $('#privilegeGroup').empty();
                    $('#privilegeGroup').append('<option value="0">请选择</option><option value="1">全部</option>')
                    for (var i = 0; i < list.length; i++) {
                        $('#privilegeGroup').append('<option value="' + list[i].id + '">' + list[i].name + '</option>')
                    }
                    $('#privilegeGroupSelect').empty();
                    $('#privilegeGroupSelect').append('<option value="0">请选择</option><option value="1">全部</option>')
                    for (var i = 0; i < list.length; i++) {
                        $('#privilegeGroupSelect').append('<option value="' + list[i].id + '">' + list[i].name + '</option>')
                    }
                } else {
                    alert('failure!');
                }
            }
        })
    }

    function selectLogo(target) {
        var data = {
            'userId': cookie_userId
        };
        $.ajax({
            url: '/v1/user/logo/list',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function(data) {
                if (data.code == 0) {
                    var list = data.result.list;
                    $(target).empty();
                    $(target).append('<option value="0">请选择</option>')
                    for (var i = 0; i < list.length; i++) {
                        $(target).append('<option value="' + list[i] + '">' + list[i] + '</option>')
                    }
                }
            }
        })
    }
})


