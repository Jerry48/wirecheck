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
    $('#createPatrol').hide();
    $('#editPatrol').hide();
    $('#editPatrol button').hide();
    $('#tree').hide();
}

function getAllPatrols(callback, multiple) {
    multiple = multiple || false;
    $.ajax({
        url:'/v1/device/allpatrols',
        type:"GET",
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                console.log('获取所有巡查分组成功');
                var groups = data.result.list;
                $('#editPatrol select').empty();
                $('#editPatrol select').attr('multiple', multiple);
                $('#editPatrol select').prepend("<option value='' selected='selected'></option>");
                for (var i = 0; i < groups.length; ++i) {
                    $('#editPatrol select').append($('<option>', {
                        value: groups[i].id,
                        text: groups[i].name
                    }).attr("comment", groups[i].comment));    
                }
                $('#editPatrol select').unbind('change');
                $('#editPatrol select').change(function(){
                    if (typeof callback !== "undefined")
                        callback(this);
                });
            }
            else {
                console.log('获取所有巡查分组失败');
                console.log(data);
            }
        } 
    });// end of ajax
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
                    alert("获取设备失败");
                    console.log(data);
                }
            }
        })// end of ajax    
    }
    
    var trees = rootNode;
    
    return trees;
}

$(function() {
    // 创建设备巡查
    $('#sidebar-nav li:nth-child(1)').click(function(){
        hideAll();
        $('#createPatrol').show();
        $('#createPatrol input').val('');
        $('#createPatrol button').unbind('click');
        $('#createPatrol button').click(function(){
            var name = $('#createPatrol input:eq(0)').val();
            var comment = $('#createPatrol input:eq(1)').val();

            var data = {
                "name": name,
                "comment": comment
            }
            $.ajax({
                url:'/v1/device/patrol/create',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) { 
                        alert('添加设备巡查成功');
                        $('#createPatrol input').val('');
                    } else {
                        alert('添加设备巡查失败');
                        console.log(data);
                    }
                }
            }) // end of ajax
        });
    });


    // 编辑巡查分组
    $('#sidebar-nav li:nth-child(2)').click(function(){
        hideAll();
        $('#editPatrol').show();
        $('#createPatrol').show();
        function setEditPatrol(ele) {
            $('#createPatrol input:eq(0)').val($(ele).children("option:selected").text());
            $('#createPatrol input:eq(0)').attr('id', $(ele).children("option:selected").val());
            $('#createPatrol input:eq(1)').val($(ele).children("option:selected").attr('comment'));

        }
        getAllPatrols(setEditPatrol);
        $('#createPatrol button').unbind('click');
        $('#createPatrol button').click(function() {
            var id  = $('#createPatrol input:eq(0)').attr('id');
            var name = $('#createPatrol input:eq(0)').val();
            var comment = $('#createPatrol input:eq(1)').val();
            var data = {
                'id'  : id,
                'name': name,
                'comment': comment
            };
            $.ajax({
                url:'/v1/device/patrol/edit',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        alert('编辑巡查成功');
                        $('#createPatrol input:eq(0)').val('');
                    } else {
                        alert('编辑巡查失败');
                        console.log(data);
                    }
                }
            })// end of ajax
        });
    });// end of 编辑巡查分组

    // 删除巡查分组
    $('#sidebar-nav li:nth-child(3)').click(function(){
        hideAll();
        $('#editPatrol').show();
        $('#editPatrol button').show();
        getAllPatrols();
        $('#editPatrol button').click(function(){
            var id = $('#editPatrol select option:selected').val();
            var name = $('#editPatrol select option:selected').text();
            var data = {
                'id': id,
                'name': name
            };
            $.ajax({
                url:'/v1/device/patrol/delete',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0){
                        alert('删除巡查成功');
                        getAllPatrols();
                    }
                    else {
                        alert('删除巡查失败');
                        console.log(data);
                    }
                }
            }); // end of ajax
        });
    });// end of 删除巡查分组
    
    // 管理巡查分组
    $('#sidebar-nav li:nth-child(4)').click(function(){
        hideAll();
        $('#editPatrol').show();
        $('#tree').show();
        $('#tree').treeview({data: getTree(), multiSelect: true});

        function setManagePatrol(ele) {
            var data = {
                'id':$(ele).children("option:selected").val()
            }
            $.ajax({
                url:'/v1/device/patrol/listmembers',
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
                        alert('获取巡查分组成员失败');
                        console.log(data);
                    }
                }
            }) // end of device/patrol/listmembers
        }
        getAllPatrols(setManagePatrol);

        $('#editPatrol button').show();
        $('#editPatrol button').unbind('click');
        $('#editPatrol button').click(function(){
            var id = $('#editPatrol select').val();
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
                url:'/v1/device/patrol/setmembers',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0){
                        alert('设置巡查分组成员成功');
                    } else {
                        alert('设置巡查分组成员失败');
                        console.log(data);

                    }
                }
            }) // end of ajax device/patrol/setmembers
        });
    });
    $('#sidebar-nav li:nth-child(1)').click();
});
