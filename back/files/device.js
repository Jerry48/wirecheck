$.ajaxSetup({ cache: false });            

function makeId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 30; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function hideAll() {
    $('#createDevice').hide();
    $('#tree').hide();
    $('#groupTree').hide();
    $('#deleteDevice').hide();
    $('#createGroup').hide();
    $('#editGroup').hide();
    $('#editGroup button').hide();
    $('#deleteGroupSubmit').hide();

    $('#search').hide();
    $('#searchList').hide()
    $('#calendarWrapper').hide();
    $('#sidebar-nav li').css('font-weight','normal');
}

function getTree() {
    // Some logic to retrieve, or generate tree structure
    var data = {
        "level": 0
    }
    var rootNode = [];
    $.ajax({
        url:'/v1/device/level/root',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                rootNode = data.result.list;
                for (var i = 0; i < rootNode.length; ++i) {
                    rootNode[i].text = rootNode[i].name;
                }
            } else {
                alert("获取设备失败");
                console.log(data);
            }
        }
    })// end of ajax

    
    var nodes = rootNode.slice();
    while (nodes.length) {
        var node = nodes.pop();
        var data = {
            "id": node.id,
            "level": node.level
        }
        $.ajax({
            url:'/v1/device/level/childs',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            async:false,
            success: function(data){
                if (data.code == 0) {
                    if (data.result.size > 0) {
                        node.nodes = data.result.list;
                        for (var i = 0; i < node.nodes.length; ++i) {
                            node.nodes[i].text = node.nodes[i].name;
                            node.type = 1;
                        }
                        
                        nodes = nodes.concat(node.nodes);
                    } else {
                        var newData = {
                            "id": node.id
                        } 
                        $.ajax({
                            url:'/v1/device/list',
                            type:"GET",
                            data: newData,
                            contentType:"application/json; charset=utf-8",
                            dataType:"json",
                            async:false,
                            success: function(data){
                                if (data.code == 0) {
                                    if (data.result.size > 0) {
                                        node.nodes = data.result.list;
                                        for (var i = 0; i < node.nodes.length; ++i){
                                            node.nodes[i].text = node.nodes[i].name;
                                            node.nodes[i].type = 3
                                            node.type = 2;
                                        }
                                        
                                    }
                                } else {
                                    alert('获取设备失败');
                                    console.log(data);
                                }
                            }
                        }); // end of ajax
                    }
                } else {
                    // alert("获取设备失败");
                    console.log(data);
                }
            }
        })// end of ajax    
    }
    
    var trees = rootNode;
    
    return trees;
}

function getGroupTree() {
    // Some logic to retrieve, or generate tree structure
    var data = {
        "level": 0
    }
    var rootNode = [];
    $.ajax({
        url:'/v1/device/level/root',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                rootNode = data.result.list;
                for (var i = 0; i < rootNode.length; ++i) {
                    rootNode[i].text = rootNode[i].name;
                }
            } else {
                alert("获取设备失败");
                console.log(data);
            }
        }
    })// end of ajax

    
    var nodes = rootNode.slice();
    while (nodes.length) {
        var node = nodes.pop();
        var data = {
            "id": node.id,
            "level": node.level
        }
        $.ajax({
            url:'/v1/device/level/childs',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            async:false,
            success: function(data){
                if (data.code == 0) {
                    if (data.result.size > 0) {
                        node.nodes = data.result.list;
                        for (var i = 0; i < node.nodes.length; ++i) {
                            node.nodes[i].text = node.nodes[i].name;
                            node.type = 1;
                        }
                        
                        nodes = nodes.concat(node.nodes);
                    } else {
                    }
                } else {
                    // alert("获取设备分组树失败");
                    console.log(data);
                }
            }
        })// end of ajax    
    }
    
    var trees = rootNode;
    
    return trees;
}

function getAllGroups(callback, multiple) {
    multiple = multiple || false;
    $.ajax({
        url:'/v1/device/allgroups',
        type:"GET",
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                console.log('获取所有设备分组成功');
                var groups = data.result.list;
                $('#editGroup select').empty();
                $('#editGroup select').attr('multiple', multiple);
                $('#editGroup select').prepend("<option value='' selected='selected'></option>");
                for (var i = 0; i < groups.length; ++i) {
                    $('#editGroup select').append($('<option>', {
                        value: groups[i].id,
                        text: groups[i].name,
                    }).attr("comment",groups[i].comment));    
                }
                $('#editGroup select').unbind('change');

                $('#editGroup select').change(function(){
                    if (typeof callback !== "undefined")
                        callback(this);
                });
            }
            else {
                console.log('获取所有设备分组失败');
                console.log(data);
            }
        } 
    });// end of ajax
}


$(function() {
    $('#sidebar-nav li:nth-child(1)').css('font-weight','bold');
    $('#sidebar-nav li:nth-child(1)').tab('show');

    $('#tree').treeview({data: getTree()});
    $('#groupTree').treeview({data: getGroupTree()});
    // 添加设备
    $('#sidebar-nav li:nth-child(1)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#createDevice').show();
        $('#createDevice input').show();
        $('#createDevice input').val('');
        $('#tree').show();
        $('#createDevice input').click(function(){
            $(this).tips({
                side:3,
                msg: $(this).attr('placeholder'),
                bg:'#307FC1',
                time: 1,
                x:5,
            });
        })
        $('#createDevice button').unbind('click');
        $('#createDevice button').click(function(){
            var levelSelected = $('#tree').treeview('getSelected');
            if (levelSelected.length != 1 && levelSelected.type != 2) {
                alert('请选择设备所在的层级');
                return ;
            }
            var parentId = levelSelected[0].id;
            var deviceID = $('#createDevice input:eq(0)').val();
            var name = $('#createDevice input:eq(1)').val();
            var nickName = $('#createDevice input:eq(2)').val()
            var latitude = parseFloat($('#createDevice input:eq(3)').val());
            var longitude = parseFloat($('#createDevice input:eq(4)').val());
            var beatInterval = parseInt($('#createDevice input:eq(5)').val());
            var photoInterval = parseInt($('#createDevice input:eq(6)').val());
            var resolution = parseInt($('#createDevice input:eq(7)').val());
            var mac = $('#createDevice input:eq(8)').val()
            var batteryVoltageLow = parseFloat($('#createDevice input:eq(9)').val());
            var chargeVoltageLow = parseFloat($('#createDevice input:eq(10)').val());
            var temperatureLow = parseFloat($('#createDevice input:eq(11)').val());
            var batteryVoltageHigh = parseFloat($('#createDevice input:eq(12)').val());
            var chargeVoltageHigh = parseFloat($('#createDevice input:eq(13)').val());
            var temperatureHigh = parseFloat($('#createDevice input:eq(14)').val());
            var deviceWorkBeginTime = $('#createDevice input:eq(15)').val()
            var deviceWorkEndTime = $('#createDevice input:eq(16)').val()
            // var refPicId = $('#createDevice input:eq(17)').val()
            // var refPicPath = $('#createDevice input:eq(18)').val()
            var data = {
                "parentId":parentId,
                "deviceID": deviceID,
                "name": name, 
                "nickName": nickName,
                "latitude": latitude,
                "longitude": longitude,
                "beatInterval": beatInterval,
                "resolution": resolution,
                "photoInterval": photoInterval,
                "mac": mac,
                "batteryVoltageLow": batteryVoltageLow,
                "chargeVoltageLow": chargeVoltageLow,
                "temperatureLow": temperatureLow,
                "batteryVoltageHigh": batteryVoltageHigh,
                "chargeVoltageHigh": chargeVoltageHigh,
                "temperatureHigh": temperatureHigh,
                "deviceWorkBeginTime": deviceWorkBeginTime,
                "deviceWorkEndTime": deviceWorkEndTime,
                // "refPicId": refPicId,
                // "refPicPath": refPicPath,
            };
            $.ajax({
                url:'/v1/device/create',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        alert('添加设备成功');
                        $('#createDevice input').val('');
                        $('#tree').treeview({data: getTree()});
                        
                    } else {
                        alert('添加设备失败');
                        console.log(data);
                    }
                }
            }) // end of ajax
        });
    });

    // 编辑设备
    $('#sidebar-nav li:nth-child(2)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#createDevice').show();
        $('#tree').show();
        $('#createDevice input').val('');
        $('#createDevice input').click(function(){
            $(this).tips({
                side:3,
                msg: $(this).attr('placeholder'),
                bg:'#307FC1',
                time: 1,
                x:5,
            });
                    // $(this).tips({
                    //     side:1,  //1,2,3,4 分别代表 上右下左
                    //     msg:'上方弹出消息，3秒后自动消失，鼠标悬浮时，自动延时',//tips的文本内容
                    //     color:'#FFF',//文字颜色，默认为白色
                    //     bg:'#FD9720',//背景色，默认为红色
                    //     time:3,//默认为2 自动关闭时间 单位为秒 0为不关闭 （点击提示也可以关闭）
                    //     x:0,// 默认为0 横向偏移 正数向右偏移 负数向左偏移
                    //     y:0 // 默认为0 纵向偏移 正数向下偏移 负数向上偏移
                    // }).tips({
                    //     side:2,
                    //     msg:'右方弹出消息，5秒后自动消失，鼠标悬浮时，自动延时',
                    //     bg:'#AE81FF',
                    //     time:5
                    // }).tips({
                    //     side:3,
                    //     msg:'下方弹出消息，3秒后自动消失，鼠标悬浮时，自动延时',
                    //     bg:'#307FC1',
                    //     time:7
                    // }).tips({
                    //     side:4,
                    //     msg:'左方弹出消息，不自动消失，鼠标点击才会消失',
                    //     time:0
                    // });
        })
        $('#createDevice button').unbind('click');
        $('#createDevice button').click(function(){
            var parentId = $('#createDevice input:eq(0)').attr('parentId');
            var id = $('#createDevice input:eq(0)').attr('id');
            var name = $('#createDevice input:eq(0)').val();
            var nickName = $('#createDevice input:eq(1)').val();
            var latitude = parseFloat($('#createDevice input:eq(2)').val());
            var longitude = parseFloat($('#createDevice input:eq(3)').val());
            var beatInterval = parseInt($('#createDevice input:eq(4)').val());
            var photoInterval = parseInt($('#createDevice input:eq(5)').val());
            var mac = $('#createDevice input:eq(6)').val()
            var batteryVoltageLow = parseFloat($('#createDevice input:eq(7)').val());
            var chargeVoltageLow = parseFloat($('#createDevice input:eq(8)').val());
            var temperatureLow = parseFloat($('#createDevice input:eq(9)').val());
            var batteryVoltageHigh = parseFloat($('#createDevice input:eq(10)').val());
            var chargeVoltageHigh = parseFloat($('#createDevice input:eq(11)').val());
            var temperatureHigh = parseFloat($('#createDevice input:eq(12)').val());
            var data = {
                'parentId': parentId,
                "id": id,
                "name": name,
                'nickName': nickName,
                "latitude": latitude,
                "longitude": longitude,
                "beatInterval": beatInterval,
                "photoInterval": photoInterval,
                "mac": mac,
                "batteryVoltageLow": batteryVoltageLow,
                "chargeVoltageLow": chargeVoltageLow,
                "temperatureLow": temperatureLow,
                "batteryVoltageHigh": batteryVoltageHigh,
                "chargeVoltageHigh": chargeVoltageHigh,
                "temperatureHigh": temperatureHigh
            }
            $.ajax({
                url:'/v1/device/edit',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        alert('编辑设备成功');
                    } else {
                        alert('编辑设备失败');
                        console.log(data);
                    }
                }
            }) // end of ajax device/edit
        });

        $('#tree').on('nodeSelected', function(event, data) {
            if (data.type == 3) {
                var id = data.id;
                var data = {
                    "id": id
                }
                $.ajax({
                    url:'/v1/device/details',
                    type:"get",
                    data: data,
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data){
                        if (data.code == 0) {
                            var deviceInfo = data.result;
                            $('#createDevice input:eq(0)').attr('parentId',deviceInfo.parentId);
                            $('#createDevice input:eq(0)').attr('id',deviceInfo.id);
                            $('#createDevice input:eq(0)').val(deviceInfo.name);
                            $('#createDevice input:eq(1)').val(deviceInfo.nickName);
                            $('#createDevice input:eq(2)').val(deviceInfo.latitude);
                            $('#createDevice input:eq(3)').val(deviceInfo.longitude);
                            $('#createDevice input:eq(4)').val(deviceInfo.beatInterval);
                            $('#createDevice input:eq(5)').val(deviceInfo.photoInterval);
                            $('#createDevice input:eq(6)').val(deviceInfo.mac)

                            $('#createDevice input:eq(7)').val(deviceInfo.batteryVoltageLow);
                            $('#createDevice input:eq(8)').val(deviceInfo.chargeVoltageLow);
                            $('#createDevice input:eq(9)').val(deviceInfo.temperatureLow);
                            $('#createDevice input:eq(10)').val(deviceInfo.batteryVoltageHigh);
                            $('#createDevice input:eq(11)').val(deviceInfo.chargeVoltageHigh);
                            $('#createDevice input:eq(12)').val(deviceInfo.temperatureHigh);
                        } else {
                            alert('获取设备详情失败');
                            console.log(data);
                        }
                    }
                }) // end of ajax
            }
        }) // end of nodeSelected event
    })

    // 删除设备
    $('#sidebar-nav li:nth-child(3)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#tree').show();
        $('#deleteDevice').show();
        $('#deleteDevice').unbind('click');
        $('#deleteDevice').click(function(){
            if(confirm("是否确定删除该设备？")){
                var levelSelected = $('#tree').treeview('getSelected');
                if (levelSelected.length != 1 && levelSelected.type != 3) {
                    alert('请选择设备');
                    return ;
                }
                var id = levelSelected[0].id;
                var data = {
                    "id": id
                }
                $.ajax({
                    url:'/v1/device/delete',
                    type:"POST",
                    data: JSON.stringify(data),
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data){
                        if (data.code == 0) {
                            alert('删除设备成功');
                            $('#tree').treeview({data: getTree()});
                        } else {
                            alert('删除设备失败');
                            console.log(data);
                        }
                    }
                }) // end of ajax device/delete  
            }
        });
    });

    // 创建分组
    $('#sidebar-nav li:nth-child(4)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#groupTree').show();
        $('#createGroup').show();
        $('#createGroup button').unbind('click');
        $('#createGroup input').val('');
        $('#createGroup input:eq(0)').prop("readonly", false);
        $('#createGroup button').click(function(){
            var levelSelected = $('#groupTree').treeview('getSelected');
            if (levelSelected.length != 1) {
                var parentId = '';
                var parentLevel = -1;
            }else{
                var parentId = levelSelected[0].id;
                var parentLevel = levelSelected[0].level;
            }
            var name = $('#createGroup input:eq(0)').val();
            // var comment = $('#createGroup input:eq(1)').val();

            var data = {
                "name": name,
                "parentId": parentId,
                "parentLevel": parentLevel,
                // "comment": comment
            };
            $.ajax({
                url:'/v1/device/level/create',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        alert('创建分组成功');
                        $('#createGroup input').val('');
                        $('#groupTree').treeview({data: getGroupTree()});
                    } else {
                        alert('创建分组失败');
                        console.log(data);
                    }
                }
            })// end of ajax device/group/create
        });// end of button click
    }); // end of 创建分组


    // 编辑分组
    $('#sidebar-nav li:nth-child(5)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#createGroup').show();
        $('#groupTree').show();

        $('#createGroup button').unbind('click');

        $('#groupTree').on('nodeSelected', function(event, data) {
            var name = data.name;
            $('#createGroup input:eq(0)').val(name);
        })    

        $('#createGroup button').click(function() {
            var levelSelected = $('#groupTree').treeview('getSelected');
            if(levelSelected.length == 0){
                alert('请选择分组');
            }else{
                var id = levelSelected[0].id;
                var level = levelSelected[0].level;
                var name = levelSelected[0].name;
                var newName = $('#createGroup input:eq(0)').val();
                var data = {
                    'id'  : id,
                    'level': level,
                    'name': name,
                    'newName': newName
                };
                $.ajax({
                    url:'/v1/device/level/edit',
                    type:"POST",
                    data: JSON.stringify(data),
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data){
                        if (data.code == 0) {
                            alert('编辑分组成功');
                            $('#createGroup input').val('');
                            $('#groupTree').treeview({data: getGroupTree()});
                        } else {
                            alert('编辑分组失败');
                            console.log('编辑分组失败');
                        }
                    }
                })// end of ajax
            }
        });
    });// end of 编辑分组

    // 删除分组
    $('#sidebar-nav li:nth-child(6)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#groupTree').show();
        $('#deleteGroupSubmit').show();

        $('#deleteGroupSubmit').unbind('click').click(function(){
            if(confirm("是否确定删除该设备分组？删除后其下所有分组和设备也被删除")){
                var levelSelected = $('#groupTree').treeview('getSelected');
                if(levelSelected.length == 0){
                    alert('请选择分组');
                }else{
                    var id = levelSelected[0].id;
                    var list = [];
                    list[0] = {
                        'id':id
                    };

                    var data = {
                        'list': list
                    }

                    $.ajax({
                        url:'/v1/device/level/delete',
                        type:"POST",
                        data: JSON.stringify(data),
                        contentType:"application/json; charset=utf-8",
                        dataType:"json",
                        success: function(data){
                            if (data.code == 0){
                                alert('删除分组成功');
                                $('#groupTree').treeview({data: getGroupTree()});
                            }
                            else {
                                alert('删除分组失败');
                                console.log(data);
                            }
                        }
                    }); // end of ajax
                }
            }         
        });
    });// end of 删除 分组

    // 管理分组
    $('#sidebar-nav li:nth-child(7)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#editGroup').show();

        $('#tree').show();
        $('#tree').treeview({data: getTree(), multiSelect: true});
        
        function setManageGroup(ele) {
            var selectedNodes = $('#tree').treeview('getSelected');
            for (var i = 0; i < selectedNodes.length; ++i) {
                $('#tree').treeview('unselectNode',selectedNodes[i]);
            }
            var data = {
                'id':$(ele).val()
            }
            $.ajax({
                url:'/v1/device/group/listmembers',
                type:"GET",
                data: data,
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        var nodesUnselected = $('#tree').treeview('getUnselected');
                        var devicesList = data.result.list;
                        for (var j = 0; j < devicesList.length; ++j) {
                            for (var i = 0; i < nodesUnselected.length; ++i) {
                                if (nodesUnselected[i].id == devicesList[j].id)
                                    $('#tree').treeview('selectNode', [nodesUnselected[i].nodeId]);
                            }
                        }
                    } else {
                        alert('获取分组成员失败');
                        console.log(data);
                    }
                }
            }) // end of device/group/listmembers
        }
        getAllGroups(setManageGroup);

        $('#editGroup button').show();
        $('#editGroup button').unbind('click');
        $('#editGroup button').click(function(){
            var id = $('#editGroup select').val();
            var list = [];
            var selectedDevices = $('#tree').treeview('getSelected');
            for (var i = 0; i < selectedDevices.length; ++i) {
                if (selectedDevices[i].type == 3) {
                    list.push({"deviceId":selectedDevices[i].id});
                }
            }
            var data = {
                'id':id,
                'list': list
            }
            $.ajax({
                url:'/v1/device/group/setmembers',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0){
                        alert('设置分组成员成功');
                    } else {
                        alert('设置分组成员失败');
                        console.log(data);

                    }
                }
            }) // end of ajax device/group/setmembers
        });
    });

    $('#sidebar-nav li:nth-child(8)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#search').show();
        $('#search button').unbind('click').click(function(){
            var search = $('#search input:eq(0)').val();
            if(search == ""){
                alert("请输入您要查询的内容！");
            }else{
                var data = {
                    "search" : search,
                }
                $.ajax({
                    url:'/v1/device/info/search',
                    type:"POST",
                    data: JSON.stringify(data),
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data){
                        if (data.code == 0){
                            $('#searchList').show();
                            product = data.result.deviceProductList;
                            $('#deviceProductListSearch').hide();
                            $('#deviceProductListSearch tbody').empty();

                            if(product.length > 0){
                                $('#deviceProductListSearch').show();
                                
                                for (var i = 0; i < product.length; ++i) {
                                    $('#deviceProductListSearch tbody').append('<tr><td>'+product[i].id+'</td><td>' + product[i].deviceName + '</td><td>'+product[i].deviceManufactorName
                                        +'</td><td>'+product[i].deviceMeid+'</td></tr>');   
                                }
                            }
                            if(product.length  == 0)
                            {
                                $('#searchList').hide();
                                alert('搜索不到相关信息，请重新输入');
                            }
                            $('#search input:eq(0)').val("")                       
                        } else {
                            alert('搜索不到相关信息，请重新输入');
                            $('#search input:eq(0)').val("")
                            console.log(data);
                        }

                    }
                })
            }   
        });
    });

    // 设备撤防设置
    $('#sidebar-nav li:nth-child(9)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#tree').show();
        $('#tree').treeview({data: getTree()});
        $('#calendarWrapper').show();
        $('#calendar').fullCalendar('destroy');
        var i = 0;
        function renderCalendar() {
			      $('#calendar').fullCalendar({
				        header: {
					          left: 'prev,next today',
					          center: 'title',
					          right: 'agendaWeek'
				        },
				        defaultDate: '2016-05-12',
				        timezone: false,
				        selectable: true,
                editable: false,
         				eventLimit: true, // allow "more" link when too many events
				        loading: function(bool) {
					          $('#loading').toggle(bool);
				        },
                defaultView:'agendaWeek',
				        eventRender: function(event, el) {
					          // render the timezone offset below the event title
					          if (event.start.hasZone()) {
						            el.find('.fc-title').after(
							              $('<div class="tzo"/>').text(event.start.format('Z'))
						            );
					          }
				        },
				        dayClick: function(date) {
					          console.log('dayClick', date.format());
				        },
				        select: function (start, end, jsEvent, view) {
                    var	eventData = {
                        id: i++,
									      start: start,
									      end: end,
									      editable: true
							      };
                    $('#calendar').fullCalendar('renderEvent', eventData, true);
                    $("#calendar").fullCalendar("unselect");
                },
                selectOverlap: function(event) {
                    return false;
                },
                eventClick: function(calEvent, jsEvent, view) {
							      $('#calendar').fullCalendar('removeEvents', calEvent.id);
					      },
			      });
            $('#calendar .fc-toolbar').remove();
            $('#calendar th:eq(1)').text('Sun');
            $('#calendar th:eq(2)').text('Mon');
            $('#calendar th:eq(3)').text('Tue');
            $('#calendar th:eq(4)').text('Wed');
            $('#calendar th:eq(5)').text('Thu');
            $('#calendar th:eq(6)').text('Fri');
            $('#calendar th:eq(7)').text('Sat');
		    }

		    renderCalendar();
        $('#tree').unbind('nodeSelected');
        $('#tree').on('nodeSelected', function(event, data) {
            var id, level, type;
            var id = data.id;
            if (data.type == 3) {
                type = 0;
            } else {
                type = 1;
                level = data.level;
            }
            var data = {
                "id": id,
                'level': level,
                'type': type
            }
            $.ajax({
                url:'/v1/disalert/details',
                type:"get",
                data: data,
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        var list = data.result.list;
                        var dateEvents = [];
                        var dayOfWeek = [8, 9, 10, 11, 12, 13, 14];
                        for (var i = 0; i < list.length; ++i) {
                            dateEvents[i] = {};
                            dateEvents[i].start = new Date(2016, 4, dayOfWeek[list[i].dayOfWeek], list[i].startHour, list[i].startMinute);
                            dateEvents[i].end = new Date(2016, 4, dayOfWeek[list[i].dayOfWeek], list[i].endHour, list[i].endMinute);
                            dateEvents[i].id= i++;
                            dateEvents[i].title='';
                        }
                        $('#calendar').fullCalendar('addEventSource',dateEvents);
                    } else {
                        alert('获取设备撤防信息失败');
                        console.log(data);
                    }
                }
            }) // end of ajax
        }) // end of nodeSelected event

        $('#calendarWrapper button:eq(-1)').unbind('click');
        $('#calendarWrapper button:eq(-1)').click(function(){
            var levelSelected = $('#tree').treeview('getSelected');
            if (levelSelected.length != 1) {
                alert('请选择设备');
                return ;
            }
            var id = levelSelected[0].id, type, level;
            if (levelSelected[0].type != 3) {
                type = 1;
                level = levelSelected.level;
            } else {
                type = 0;
            }
            var events = $('#calendar').fullCalendar('clientEvents');
            var list = [];
            for (var i = 0; i < events; ++i) {
                list[i] = {};
                list[i].dayOfWeek = events[i].start.weekday();
                list[i].startHour = events[i].start.hour();
                list[i].startMinute = events[i].start.minutes();
                list[i].endHour = events[i].end.weekday();
                list[i].endMinute = events[i].end.weekday();
            }
            var data = {
                'id': id,
                'level': level,
                'type': type,
                'list': list,
            };
            $.ajax({
                url:'/v1/disalert/set',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                async:false,
                success: function(data){
                    if (data.code == 0) {
                        alert('设备撤防成功');
                    } else {
                        alert('设备撤防失败');
                        console.log(data);
                    }
                }
            }) // end of ajax
        });
    });
});

