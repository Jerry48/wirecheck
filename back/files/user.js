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
    $('#tree').hide();
    $('#other').hide();
    $('#createUser').hide();
    $('#editUser').hide();
    $('#resetUser').hide();

    $('#createGroup').hide();
    $('#editGroup').hide();
    $('#search').hide();

    $('#userList').hide();
    $('#groupList').hide();
    $('#groupMemberList').hide();
    $('#userDeviceList').hide();

    $('#searchList').hide();
    $('#userListSearch').hide();
    $('#groupListSearch').hide();

    $('#sidebar-nav li').css('font-weight','normal');
    check();
}

function check(){
	if($('#sidebar-nav li:nth-child(8)').attr('ifcheck') == 1){
		var num = $('#userList table tbody').attr('userNum');
		$('#userList table thead tr td:eq(0)').remove();

		for(i=0;i<num;i++){
			$('#userList table tbody tr:eq('+i+')').children().eq(0).remove();
		}
		$('#sidebar-nav li:nth-child(8)').attr('ifcheck',0);
	}
}

// 获取用户列表
function listAllUsers(){
    var data = {
        'userId': ''
    };
    $.ajax({
        url:'/v1/user/all',
        type:"GET",
        data: data,
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                var users = data.result.list;
                $('#userList table tbody').empty();
                $('#userList table tbody').attr("userNum",users.length);
                for (var i = 0; i < users.length; ++i) {
                    $('#userList table tbody').append('<tr><td>'+users[i].name+'</td><td>' + users[i].mobile + '</td><td>'+users[i].department
                        +'</td><td userId="'+users[i].userId+'" userName="'+users[i].userName+'" name = "'+ users[i].name+'"><button class="edit">编辑</button><button class="delete">删除</button><button class="reset">重置密码</button><button class="privilege">设备权限</button></td></tr>');   
                }
            }else{
                alert('获取用户列表失败！');
            }
        }
    });
}

//获取用户权限设备列表
function listUserDevice(inputData){
    $.ajax({
        url:'/v1/user/device/list',
        type:"GET",
        data: inputData,
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                var devices = data.result.list;
                $('#userDeviceList h3').text(inputData.name +' 已有权限的设备列表');
                $('#userDeviceList table').attr('userId',inputData.userId);
                $('#userDeviceList table tbody').empty();
                for (var i = 0; i < devices.length; ++i) {
                    $('#userDeviceList table tbody').append('<tr><td>'+devices[i].deviceId+'</td><td>' + devices[i].deviceName + '</td><td deviceId="'+devices[i].deviceId+'"><button class="deleteDevice">删除</button></td></tr>');   
                }
            }else{
                alert('获取用户权限设备列表失败！');
            }
        }
    });
}

// 获取用户分组列表
function listUserGroup(){
    var inputData = {
        "type": 0
    }
    $.ajax({
        url:'/v1/user/group/list',
        type:"GET",
        data: inputData,
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                var groups = data.result.list;
                $('#groupList table tbody').empty();
                for (var i = 0; i < groups.length; ++i) {
                    $('#groupList table tbody').append('<tr><td>'+groups[i].name+'</td><td id="'+groups[i].id+'" name="'+groups[i].name+
                        '"><button class="deleteGroup">删除</button><button class="editGroup">编辑</button><button class="editMember">组员</button></td></tr>');   
                }
            }else{
                alert('获取用户分组列表失败！');
            }
        }
    });
}

function listGroupMember(inputData){
    var data = {
        "id": inputData.id
    }
    $.ajax({
        url:'/v1/user/group/members',
        type:"GET",
        data: inputData,
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                var members = data.result.list;
                $('#groupMemberList h3').text(inputData.name +' 的组内人员');
                $('#groupMemberList table').attr('id',inputData.id);
                $('#groupMemberList table tbody').empty();
                for (var i = 0; i < members.length; ++i) {
                    $('#groupMemberList table tbody').append('<tr><td>'+members[i].name+'</td><td>'+members[i].mobile+'</td><td>'+members[i].department+'</td><td id="'+members[i].userId+'" name="'+members[i].userName+
                        '"><button class="deleteMember">删除</button></td></tr>');   
                }
            }else{
                alert('获取组内用户列表失败！');
            }
        }
    });
}

//获取用户无权限设备列表
// function listUserDeviceNo(userId){
//     var data = {
//         'userId': userId
//     };
//     $.ajax({
//         url:'/v1/user/device/list/no',
//         type:"GET",
//         data: data,
//         dataType:"json",
//         success: function(data){
//             if (data.code == 0) {
//                 var devices = data.result.list;
//                 $('#userDeviceListNo h3').text(userId +'尚无权限的设备列表');
//                 $('#userDeviceListNo table').attr('id',userId);
//                 $('#userDeviceListNo table tbody').empty();
//                 for (var i = 0; i < devices.length; ++i) {
//                     $('#userDeviceListNo table tbody').append('<tr><td>'+devices[i].deviceId+'</td><td>' + devices[i].deviceName + '</td><td><button class="addDevice" id="'+devices[i].deviceId+'">添加</button></td></tr>');   
//                 }
//             }else{
//                 alert('获取用户权限设备列表失败！');
//             }
//         }
//     });
// }

function getAllUsers(callback, multiple) {
    multiple = multiple || false;
    var data = {
        'userId':''
    }
    $.ajax({
        url:'/v1/user/all',
        type:"GET",
        data: data,
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                console.log('get user successful');
                var users = data.result.list;
                $('#userList select').empty();
                $('#userList select').attr('multiple', multiple);
                $('#userList select').prepend("<option value='' selected='selected'></option>");
                for (var i = 0; i < users.length; ++i) {
                    $('#userList select').append($('<option>', {
                        value: users[i].userId,
                        text: users[i].userName
                    }));    
                }
                $('#userList select').unbind('change');
                $('#userList select').change(function(){
                    if (typeof callback !== "undefined")
                        callback(this);
                })
            }
            else {
                console.log('get user error');
                console.log(data);
            }
        }
    })    
}

function getAllGroups(callback, multiple) {
    multiple = multiple || false;
    $.ajax({
        url:'/v1/user/group/list',
        type:"GET",
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                console.log('get user groups successful');
                var groups = data.result.list;
                $('#editGroup select').empty();
                $('#editGroup select').attr('multiple', multiple);
                $("#editGroup select").prepend("<option value='' selected='selected'></option>");
                for (var i = 0; i < groups.length; ++i) {
                    $('#editGroup select').append($('<option>', {
                        value: groups[i].id,
                        text: groups[i].name
                    }));    
                }
                $('#editGroup select').unbind('change');
                $('#editGroup select').change(function(){
                    if (typeof callback !== "undefined")
                        callback(this);
                });
            }
            else {
                console.log('get user group error');
                console.log(data);
            }
        } 
    });// end of ajax
}

function setEditUser(userName) {
    var data = {
        "userName": userName,
    }
    $.ajax({
        url:'/v1/user/details',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0){
                console.log('get user info successful');
                var obj = data.result;
                $('#editUser input:eq(0)').attr('userId', obj.userId);
                $('#editUser input:eq(0)').val(obj.userName);
                $('#editUser input:eq(1)').val(obj.password);
                if (obj.gender==0)
                    $('#editUser input:eq(2)').prop('checked', true);
                else
                    $('#editUser input:eq(3)').prop('checked', true);

                $('#editUser input:eq(4)').val(obj.mobile);
                $('#editUser input:eq(5)').val(obj.name);
                $('#editUser input:eq(6)').val(obj.department);
                $('#editUser select').val(obj.userType);
            }                
            else {
                console.log('get user info error');
                console.log(data);
            }
        }

    })
}


function setResetUser(userName){
    var data = {
        "userName": userName
    }
    $.ajax({
        url:'/v1/user/details',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0){
                console.log('get user info successful');
                var obj = data.result;
                $('#resetUser input:eq(0)').val(obj.userName);
                $('#resetUser input:eq(1)').val(obj.password);
            }                
            else {
                console.log('get user info error');
                console.log(data);
            }
        }
    })
}

function deleteUser(userId){
    if(confirm("是否确定删除该用户？")){
        var data = {
            "userId": userId
        }
        $.ajax({
            url:'/v1/user/delete',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    listAllUsers();
                    alert('删除用户成功');
                    
                }
                else {
                    alert('删除用户失败');
                    console.log(data);
                }
            }
        }); // end of ajax
    }
}

function deleteUserDevice(inputData){
    if(confirm("是否确定删除该用户权限设备？")){
        $.ajax({
            url:'/v1/user/device/delete',
            type:"POST",
            data: JSON.stringify(inputData),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                	var data = {
                		"userId": inputData.userId
                	}
                    listUserDevice(data);
                    alert('删除用户权限设备成功');  
                }
                else {
                    alert('删除用户权限设备失败');
                    console.log(data);
                }
            }
        }); // end of ajax
    }
}

function deleteGroup(id){
    if(confirm("是否确定删除该用户分组？")){
        var data = {
            "id": id
        }
        $.ajax({
            url:'/v1/user/group/delete',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    listUserGroup();
                    alert('删除用户分组成功');  
                }
                else {
                    alert('删除用户分组失败');
                    console.log(data);
                }
            }
        }); // end of ajax
    }
}

function deleteGroupMember(inputData){
    if(confirm("是否确定将该用户从该分组中删除？")){
        var data = {
        	"groupId": inputData.id,
            "userId": inputData.userId
        }
        $.ajax({
            url:'/v1/user/group/member/delete',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                	var data = {
                		"id" : inputData.id,
                		"name" : inputData.name
                	};
                    listGroupMember(data);
                    alert('从分组中删除用户成功');  
                }
                else {
                    alert('从分组中删除用户失败');
                    console.log(data);
                }
            }
        }); // end of ajax
    }
}

// function addUserDevice(data){
//     var inputData = data;
//     if(confirm("是否确定添加该用户权限设备？")){
//         $.ajax({
//             url:'/v1/user/device/add',
//             type:"POST",
//             data: JSON.stringify(inputData),
//             contentType:"application/json; charset=utf-8",
//             dataType:"json",
//             success: function(data){
//                 if (data.code == 0){
//                     listUserDevice(inputData.userId);
//                     listUserDeviceNo(inputData.userId);
//                     alert('添加用户权限设备成功');  
//                 }
//                 else {
//                     alert('添加用户权限设备失败');
//                     console.log(data);
//                 }
//             }
//         }); // end of ajax
//     }
// }

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


function setUserDeviceList(ele) {
    var userId = $(ele).children("option:selected").text();
    var data = {
        "userId": userId
    }
    $.ajax({
        url:'/v1/user/device/list',
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
                alert('获取用户设备列表失败');
                console.log(data);
            }
        }
    });// end of ajax 
}


$(function() {
    listAllUsers();
    listUserGroup();
    $('#tree').treeview({data: getTree(), multiSelect: true});
    $('#sidebar-nav li:nth-child(1)').css('font-weight','bold');
    $('#sidebar-nav li:nth-child(1)').tab('show');
    $('#createUser').show();
    $('#userList').show();
    $("div").mouseover(function(){
         $(".edit").unbind('click').click(function(){
            var userName = $(this).parent().attr('userName');
            hideAll();
            $('#sidebar-nav li:nth-child(2)').css('font-weight','bold');
            $('#sidebar-nav li:nth-child(2)').tab('show');
            $('#userList').show();
            $('#editUser').show();
            setEditUser(userName);
        });
        $('.reset').unbind('click').click(function(){
            var userName = $(this).parent().attr('userName');
            hideAll();
            $('#sidebar-nav li:nth-child(3)').css('font-weight','bold');
            $('#sidebar-nav li:nth-child(3)').tab('show');
            $('#userList').show();
            $('#resetUser').show();
            setResetUser(userName);
        });
        $(".delete").unbind('click').click(function(){
            var userId = $(this).parent().attr('userId');
            hideAll();
            $('#sidebar-nav li:nth-child(4)').css('font-weight','bold');
            $('#sidebar-nav li:nth-child(4)').tab('show');
            $('#userList').show();
            deleteUser(userId);
        });
        $(".privilege").unbind('click').click(function(){
            var userId = $(this).parent().attr('userId');
            var name = $(this).parent().attr('name');
            $('#sidebar-nav li:nth-child(9)').attr('userId',userId);
            $('#sidebar-nav li:nth-child(9)').attr('name',name);
            hideAll();
            $('#sidebar-nav li:nth-child(9)').css('font-weight','bold');
            $('#sidebar-nav li:nth-child(9)').tab('show');
            $('#userDeviceList').show();
            $('#tree').show();
            var inputData = {
                'userId': userId,
                'name': name
            };
            listUserDevice(inputData);
        });
        $(".deleteDevice").unbind('click').click(function(){
            var userId = $('#userDeviceList table').attr('userId');
            var deviceId = $(this).parent().attr('deviceId');
            var inputData = {
                'userId': userId,
                'deviceId': deviceId
            }
            deleteUserDevice(inputData);
        });
        $(".deleteGroup").unbind('click').click(function(){
            hideAll();
            $('#sidebar-nav li:nth-child(7)').css('font-weight','bold');
            $('#sidebar-nav li:nth-child(7)').tab('show');
            $('#groupList').show();
            var id = $(this).parent().attr('id');
            deleteGroup(id);
        });
        $(".editGroup").unbind('click').click(function(){
            hideAll();
            $('#sidebar-nav li:nth-child(6)').css('font-weight','bold');
            $('#sidebar-nav li:nth-child(6)').tab('show');
            $('#groupList').show();
            $('#createGroup').show();
            $('#userGroupSubmit').show();
            var name = $(this).parent().attr('name');
            var id = $(this).parent().attr('id');
            $('#createGroup input:eq(0)').val(name);
            $('#sidebar-nav li:nth-child(6)').attr('id',id);
            $('#sidebar-nav li:nth-child(6)').attr('name',name);
        });
        $(".editMember").unbind('click').click(function(){
            hideAll();
            $('#sidebar-nav li:nth-child(8)').css('font-weight','bold');
            $('#sidebar-nav li:nth-child(8)').tab('show');
            $('#groupMemberList').show();

            if($('#sidebar-nav li:nth-child(8)').attr('ifcheck') == 1){
	    		var num = $('#userList table tbody').attr('userNum');
		        $('#userList table thead tr td:eq(0)').remove();
		        
		        for(i=0;i<num;i++){
		        	$('#userList table tbody tr:eq('+i+')').children().eq(0).remove();
		        }
		        $('#sidebar-nav li:nth-child(8)').attr('ifcheck',0);
		    }

	        $('#userList').show();
	        $('#groupMemberSubmit').show();
	        var num = $('#userList table tbody').attr('userNum');
	        $('#userList table thead tr').prepend("<td>选择</td>");
	        
	        for(i=0;i<num;i++){
	        	$('#userList table tbody tr:eq('+i+')').prepend('<td><label><input type="checkbox" id="'+$(this).children().eq(3).attr('userId')+'"></label></td>');
	        }
	        $('#sidebar-nav li:nth-child(8)').attr("ifcheck",1);

            var name = $(this).parent().attr('name');
            var id = $(this).parent().attr('id');
            $('#sidebar-nav li:nth-child(8)').attr('id',id);
            $('#sidebar-nav li:nth-child(8)').attr('name',name);
            $('#createGroup input:eq(0)').val(name);
            var inputData = {
                'id':id,
                'name':name
            }
            listGroupMember(inputData);
        });
        $('.deleteMember').unbind('click').click(function(){
            var userId = $(this).parent().attr('id');
            var id = $('#sidebar-nav li:nth-child(8)').attr('id');
            var name = $('#sidebar-nav li:nth-child(8)').attr('name');
            var data = {
            	"userId": userId,
            	"name": name,
            	"id": id
            };
            deleteGroupMember(data)
        });

        // $(".addDevice").unbind('click').click(function(){
        //     var userId = $('#userDeviceListNo table').attr('id');
        //     var deviceId = $(this).attr('id');
        //     var data = {
        //         'userId': userId,
        //         'deviceId': deviceId
        //     }
        //     addUserDevice(data);
        // });
        
        // $('#createUser input').click(function(){
        //     $(this).tips({
        //         side:3,
        //         msg: $(this).attr('placeholder'),
        //         bg:'#307FC1',
        //         time: 1,
        //         x:5,
        //     });
        // });
        // $('#editUser input').click(function(){
        //     $(this).tips({
        //         side:3,
        //         msg: $(this).attr('placeholder'),
        //         bg:'#307FC1',
        //         time: 1,
        //         x:5,
        //     });
        // });
        // $('#resetUser input').click(function(){
        //     $(this).tips({
        //         side:3,
        //         msg: $(this).attr('placeholder'),
        //         bg:'#307FC1',
        //         time: 1,
        //         x:5,
        //     });
        // });
    })

	//新建用户
    $('#sidebar-nav li:nth-child(1)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#userList').show();
        $('#createUser').show();
    });

    // 编辑用户
    $('#sidebar-nav li:nth-child(2)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#userList').show();
        $('#editUser').show();
    });

    // 重置密码
    $('#sidebar-nav li:nth-child(3)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#userList').show();
        $('#resetUser').show();
    });

    // 删除用户
    $('#sidebar-nav li:nth-child(4)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#userList').show();
    });

    //新建分组
    $('#sidebar-nav li:nth-child(5)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show')
        $('#groupList').show();
        $('#createGroup').show();
        $('#createGroup button').unbind('click').click(function(){
            var name = $('#createGroup input').val();
            var data = {
                "name": name
            };
            $.ajax({
                url:'/v1/user/group/create',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        alert('创建分组成功');
                        $('#createGroup input').val('');
                        listUserGroup();
                    } else {
                        alert('创建分组失败');
                        console.log(data);
                    }
                }
            })// end of ajax
        });// end of button click
    })

    // 编辑分组
    $('#sidebar-nav li:nth-child(6)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#createGroup').show();
        $('#groupList').show();

        $('#createGroup button').unbind('click').click(function() {
            var id  = $('#sidebar-nav li:nth-child(6)').attr('id');
            var name = $('#sidebar-nav li:nth-child(6)').attr('name');
            var newName = $('#createGroup input:eq(0)').val();
            var data = {
                'id'  : id,
                'name': name,
                'newName': newName
            };
            $.ajax({
                url:'/v1/user/group/edit',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0) {
                        alert('编辑分组成功');
                        $('#createGroup input').val('');
                        listUserGroup();
                    } else {
                        alert('编辑分组失败');
                        console.log('编辑分组失败');
                    }
                }
            })// end of ajax
        });
    });// end of 编辑分组

    // 删除分组
    $('#sidebar-nav li:nth-child(7)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show')

        $('#groupList').show();
    });// end of 删除 分组

    // 管理分组
    $('#sidebar-nav li:nth-child(8)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show')

        $('#groupList').show();
    });

    $('#sidebar-nav li:nth-child(9)').click(function(){
        hideAll();
        $(this).css('font-weight','bold');
        $(this).tab('show');
        $('#userList').show();
        $('#tree').show();
    })

    $('#sidebar-nav li:nth-child(10)').click(function(){
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
	                url:'/v1/user/info/search',
	                type:"POST",
	                data: JSON.stringify(data),
	                contentType:"application/json; charset=utf-8",
	                dataType:"json",
	                success: function(data){
	                    if (data.code == 0){
	                    	$('#searchList').show();
	                    	users = data.result.userList;
	                    	groups = data.result.groupList;
	                    	$('#userListSearch').hide();
	                    	$('#groupListSearch').hide();
	                    	$('#userListSearch tbody').empty();
	                    	$('#groupListSearch tbody').empty();

	                    	if(users.length > 0){
	                    		$('#userListSearch').show();
		                        
				                for (var i = 0; i < users.length; ++i) {
				                    $('#userListSearch tbody').append('<tr><td>'+users[i].name+'</td><td>' + users[i].mobile + '</td><td>'+users[i].department
				                        +'</td><td userId="'+users[i].userId+'" userName="'+users[i].userName+'" name = "'+ users[i].name+'"><button class="edit">编辑</button><button class="delete">删除</button><button class="reset">重置密码</button><button class="privilege">设备权限</button></td></tr>');   
				                }
	                    	}
	                    	if(groups.length > 0){
	                    		$('#groupListSearch').show();
		                        
				                for (var i = 0; i < groups.length; ++i) {
				                    $('#groupListSearch tbody').append('<tr><td>'+groups[i].name+'</td><td id="'+groups[i].id+'" name="'+groups[i].name+
				                        '"><button class="deleteGroup">删除</button><button class="editGroup">编辑</button><button class="editMember">组员</button></td></tr>');   
				                }
	                    	}
	                    	if(groups.length + users.length == 0)
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
    })

    $('#userDeviceSubmit').click(function(){
        var userId = $('#sidebar-nav li:nth-child(9)').attr('userId');
        var name = $('#sidebar-nav li:nth-child(9)').attr('name');
        var list = [];
        var selectedDevices = $('#tree').treeview('getSelected');
        for (var i = 0; i < selectedDevices.length; ++i) {
            if (selectedDevices[i].type == 3) {
                list.push({"deviceId":selectedDevices[i].id});
            }
        }
        var data = {
            "userId": userId,
            "list": list
        }
        $.ajax({
            url:'/v1/user/device/set',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0) {
                    alert('设置用户设备权限成功');
                    var data = {
                        'userId': userId,
                        'name': name,
                    }
                    listUserDevice(data);
                } else {
                    alert('设置用户设备权限失败');
                    console.log(data);
                }
            }
        }) ;// end of ajax
    });

    // 创建用户提交
    $('#createUserSubmit').click(function(){
        var userName = $('#userName').val();
        var password = $('#password').val();
        var gender = parseInt($("#createUser input[name='gender']:checked").val());
        var mobile = $('#mobile').val();
        var name = $('#name').val();
        var department = $('#department').val();
        var userType = parseInt($("#createUser input[name='userType']:checked").val());
        var Id = makeId();
        var data = {
            "Id": Id,
            'userName':userName,
            'password':password,
            'gender': gender,
            'mobile': mobile,
            'name': name,
            'userType': userType,
            'department': department,
        };

        $.ajax({
            url:'/v1/user/create',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0) {
                    alert('创建用户成功');
                    $('#createUser input').val('');
                    $('#createUser input:radio').removeAttr("checked");
                    $('#userList table tbody').empty();
                    listAllUsers();
                }else {
                    alert('创建用户失败');
                    console.log(data);
                }
            }
        })
    });

    // 编辑用户提交
    $('#editUser button').click(function(){ 
        var userId = $('#editUser input:eq(0)').attr('userId');
        var userName = $('#editUser input:eq(0)').val();
        var password = $('#editUser input:eq(1)').val();
        var gender = parseInt($('#editUser input[name=gender]:checked').val());
        var mobile = $('#editUser input:eq(4)').val();
        var name = $('#editUser input:eq(5)').val();
        var department = $('#editUser input:eq(6)').val();
        var userType =parseInt($('#editUser select').val());
        var data = {
            "userId": userId,
            "userName": userName,
            "password": password,
            "gender": gender,
            "mobile":mobile,
            "name": name,
            "department": department,
            "userType": userType
        }
        $.ajax({
            url:'/v1/user/edit',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    alert('修改用户成功');
                    listAllUsers();
                    console.log('edit user successful');
                }else {
                    alert('修改用户失败');
                    console.log('edit user error');
                    console.log(data);
                }
            }
        })  
    });

    $('#resetUser button').click(function(){
        var userName = $('#resetUser input:eq(0)').val();
        var password = $('#resetUser input:eq(1)').val();
        var data = {
            'userName': userName,
            'password': password
        }
        $.ajax({
            url:'/v1/user/pwd/reset',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    alert('重置用户成功');
                    $('#resetUser input').val('');
                    console.log('reset user successful');
                }else {
                    alert('重置用户失败');
                    console.log('reset user error');
                    console.log(data);
                }
            }
        })//end of ajax
    })

    // 管理分组提交
    $('#groupMemberSubmit').unbind('click').click(function(){ 
    	var members = [];
    	var num = $('#userList table tbody').attr('userNum');
    	for(i=0;i<num;i++){
    		if($("#userList tbody tr:eq("+i+") input").prop('checked')){
    			var mem = $("#userList tbody tr:eq("+i+")").children().eq(4).attr('userId');
    			members.push(mem);
    		}
    	}
    	var id = $('#sidebar-nav li:nth-child(8)').attr('id');
    	var data = {
    		"id": id,
    		"list": members
    	};

    	$.ajax({
            url:'/v1/user/group/manage',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    alert('设置组员成功');
                    var id = data.result.id;
                    var name = $('#sidebar-nav li:nth-child(8)').attr('name');
                    var data = {
                    	"id":id,
                    	"name": name
                    };
                    listGroupMember(data);
                }else {
                    alert('设置组员失败');
                }
            }
        })//end of ajax
    });    
});
