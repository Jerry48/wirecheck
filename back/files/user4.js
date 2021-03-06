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


var USERTYPE = 1;
var ENTRIES = 50;
function makeId() {
    var chars = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h',
                'i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    var res = "";
     for(var i = 0; i < 20 ; i ++) {
         var id = Math.ceil(Math.random()*35);
         res += chars[id];
     }
     return res;
}

function flushAll(){
    $('#modalAdd input').val('');
    $("#pselectAll").prop('checked',false);
    $("#privilege div:eq(1) input[type='checkbox']").each(function() {  
        this.checked = false;  
    });
}

$(function(){
	//privileges

    //页面显示

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

    for(var i=1;i<3;i++){
        var tmp = parseInt($('#part2').css('height'))/3 + 'px';
       $('#import'+i).css('margin-top',tmp); 
    }
    
    flushAll();

    //main show
    userInfoList(cookie_userId);

    $('#menu li:eq(0)').click(function(){
        $('#main2').hide();
        $('#main3').hide();
        $('#main').show();
        //main show
        flushAll();
        userInfoList(cookie_userId);
    })

    $('#menu li:eq(1)').click(function(){
        $('#main').hide();
        $('#main3').hide();
        $('#main2').show();

        // main2 show
        flushAll();
        var data = {
            'index':0,
            'order':'deviceID',
        }

        deviceInfoList(data);
        listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':0,});
        listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':1,});
    })
    
    $('#menu li:eq(2)').click(function(){
        $('#main').hide();
        $('#main2').hide();
        $('#main3').show();

        //main3 show
        flushAll();
        var tmpData = deviceTreeMulti(cookie_userId);

        $('#part1').treeview(
        {
            data: tmpData,
            levels: 3,
            multiSelect: true,
            collapseIcon:"glyphicon glyphicon-chevron-down",
            expandIcon:"glyphicon glyphicon-chevron-right"
        });

        listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':0,});
        listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':1,});
    })

    

    

    $('#addUser').click(function(){
        flushAll();
        selectGroup();
        $('#modalAdd').modal();
    })

    $('#addUserType').change(function(){
        if($(this).val()=='2'){
            $('#privilegeGroup').val('1');
            $('#privilegeGroup').attr('disabled','disabled');
            $('#privilegeGroup').css('background-color','#EEEEEE');
        }else{
            $('#privilegeGroup').removeAttr('disabled');
            $('#privilegeGroup').css('background-color','');
            $('#privilegeGroup').val('0');
        }
    })

    $('#editUserType').change(function(){
        if($(this).val()=='1'){
            $('#privilegeGroupSelect').val('1');
            $('#privilegeGroupSelect').attr('disabled','disabled');
            $('#privilegeGroupSelect').css('background-color','#EEEEEE');
        }else{
            $('#privilegeGroupSelect').removeAttr('disabled');
            $('#privilegeGroupSelect').css('background-color','');
            $('#privilegeGroupSelect').val('0');
        }
    })

    $('#modalAdd .modal-footer button:eq(0)').click(function(){
        var userName = $('#modalAdd-body input:eq(0)').val();
        var name = $('#modalAdd-body input:eq(1)').val();
        var password = $('#modalAdd-body input:eq(2)').val();
        var repassword = $('#modalAdd-body input:eq(3)').val();
        var mobile = $('#modalAdd-body input:eq(4)').val();
        var department = $('#modalAdd-body input:eq(5)').val();
        var userType = parseInt($('#modalAdd-body select').val())-1;

        var usrEdit,pwdEdit,deviceOp,channelSet,wechatPush,createGroup;
        if(userType==1 || $('#pselectAll').prop('checked')){
            usrEdit=1;
            pwdEdit=1;
            deviceOp=1;
            channelSet=1;
            wechatPush=1;
            createGroup=1;
        }else{
            if($('#pselectOne input:eq(0)').prop('checked')){usrEdit=1;}else{usrEdit=0;}
            if($('#pselectOne input:eq(1)').prop('checked')){pwdEdit=1;}else{pwdEdit=0;}
            if($('#pselectOne input:eq(2)').prop('checked')){deviceOp=1;}else{deviceOp=0;}
            if($('#pselectOne input:eq(3)').prop('checked')){channelSet=1;}else{channelSet=0;}
            if($('#pselectOne input:eq(4)').prop('checked')){wechatPush=1;}else{wechatPush=0;}
            if($('#pselectOne input:eq(5)').prop('checked')){createGroup=1;}else{createGroup=0;}
        }

        var groupId = $('#privilegeGroup').val();
        var flag = true;
        if(userName==''||name==''||mobile==''||department==''||groupId==0||userType==-1){
            flag = false;
            alert('资料不完整!');
        }

        if(password != repassword){
            flag = false;
            alert('两次输入的密码不一致！请重新输入！');
            $('#modalAdd-body input:eq(2)').val('');
            $('#modalAdd-body input:eq(3)').val('');
        }

        if(flag){
            var data = {
                'userName': userName,
                'name': name,
                'password': password,
                'mobile': mobile,
                'department': department,
                'userType': userType,
                'groupType': 0,
                'groupId': groupId,
                'usrEdit' : usrEdit,
                'pwdEdit' : pwdEdit,
                'deviceOp' : deviceOp,
                'channelSet' : channelSet,
                'wechatPush' : wechatPush,
                'createGroup' : createGroup,
            };
            createUser(data);  
        }
    })

    $('body').on('click' , '#selectAll' , function(){ 
        if(this.checked){
            $("#main tbody input[type='checkbox']").each(function() {  
                   this.checked = true;  
            });
        }else{
            $("#main tbody input[type='checkbox']").each(function() {  
                   this.checked = false;  
            });
        }
    })

    $('#pselectAll').click(function(){
        if(this.checked){
            $("#privilege div:eq(1) input[type='checkbox']").each(function() {  
                   this.checked = true;  
            });
        }else{
            $("#privilege div:eq(1) input[type='checkbox']").each(function() {  
                   this.checked = false;  
            });
        }
    })

    //修改用户
    $('#editUser').click(function(){
        $('#modalEdit input').val('');
        var num = $('#main table tbody').find("input:checkbox:checked").length;
        if(num > 1){
            alert('只可以选择一个设备!');
        }else if(num == 0){
            alert('未选中设备!');
        }else{
            var tr = $('#main table tbody').find("input:checkbox:checked").parent().parent();
            $('#modalEdit-body input:eq(0)').val(tr.find('td:eq(3)').text());
            $('#modalEdit-body input:eq(1)').val(tr.find('td:eq(2)').text());
            $('#modalEdit-body input:eq(4)').val(tr.attr('mobile'));
            $('#modalEdit-body input:eq(5)').val(tr.find('td:eq(6)').text());
            $('#editUserType').val(tr.attr('usertype'));

            selectGroup();
            if(tr.attr('usertype')=='1'){
                $('#privilegeGroupSelect').val('1');
                $('#privilegeGroupSelect').attr('disabled','disabled');
                $('#privilegeGroupSelect').css('background-color','#EEEEEE');
            }else{}
            $('#modalEdit').modal();
        }
    })

    $('#modalEdit .modal-footer button:eq(0)').click(function(){
        var userName = $('#modalEdit-body input:eq(0)').val();
        var name = $('#modalEdit-body input:eq(1)').val();
        var password = $('#modalEdit-body input:eq(2)').val();
        var repassword = $('#modalEdit-body input:eq(3)').val();
        var mobile = $('#modalEdit-body input:eq(4)').val();
        var department = $('#modalEdit-body input:eq(5)').val();
        var userType = $('#modalEdit-body select').find('option:selected').val();
        var groupId = $('#privilegeGroupSelect').val();

        var flag = true;
        if(userName==''||name==''||mobile==''||department==''||groupId==0||userType==-1){
            flag = false;
            alert('资料不完整!');
        }
        if(password != repassword){
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
        };
        editUser(data);
    })

    // 删除用户
    $('#deleteUser').click(function(){
        var num = $('#main table tbody').find("input:checkbox:checked").length;
        if(num == 0){
            alert('未选中设备!');
        }else{
            var list=[];
            for(var i=0;i<num;i++){
                var id = $('#main table tbody').find("input:checkbox:checked:eq("+i+")").parent().parent().attr('id');
                list.push(id);
            }
            deleteUser(list);
        }
    })

    //分组设置
    //添加分组
    $('#addGroup').click(function(){
        $('#modalAddGroup-body input').val('');
        $('#modalAddGroup').modal();
    })

    $('#addTemGroup').click(function(){
        $('#modalAddTemGroup-body input').val('');
        $('#modalAddTemGroup').modal();
    })

    $('#modalAddGroup .modal-footer button:eq(0)').click(function(){
        if($('#modalAddGroup-body input:eq(0)').val()==""){
            alert('请输入分组名！');
        }else{
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

    $('#modalAddTemGroup .modal-footer button:eq(0)').click(function(){
        if($('#modalAddTemGroup-body input:eq(0)').val()==""){
            alert('请输入分组名！');
        }else{
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

    $('body').on('click' , '.showGroup p' , function(){ 
        $('.showGroup p').css('background-color','white');
        $('.showGroup p').removeClass('clickFlag');
        $(this).css('background-color','rgb(176,196,222)');
        $(this).addClass('clickFlag');
    })

    $('body').on('click' , '#showTemGroup p' , function(){ 
        $('#showTemGroup p').css('background-color','white');
        $('#showTemGroup p').removeClass('clickFlag');
        $(this).css('background-color','rgb(176,196,222)');
        $(this).addClass('clickFlag');
    })

    //修改分组
    $('#editGroup').click(function(){
        if($('.showGroup .clickFlag').length==0){
            alert('请选择要修改的分组！');
        }else{
            var tmp = $('.showGroup .clickFlag').text();
            $('#modalEditGroup-body input:eq(0)').val(tmp);
            $('#modalEditGroup').modal();
        }
    })

    $('#editTemGroup').click(function(){
        if($('#showTemGroup .clickFlag').length==0){
            alert('请选择要修改的分组！');
        }else{
            var tmp = $('#showTemGroup .clickFlag').text();
            $('#modalEditTemGroup-body input:eq(0)').val(tmp);
            $('#modalEditTemGroup').modal();
        }
    })

    $('#modalEditGroup .modal-footer button:eq(0)').click(function(){
        if($('#modalEditGroup-body input:eq(0)').val()==""){
            alert('请输入分组名！');
        }else{
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

    $('#modalEditTemGroup .modal-footer button:eq(0)').click(function(){
        if($('#modalEditTemGroup-body input:eq(0)').val()==""){
            alert('请输入分组名！');
        }else{
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
    $('#deleteGroup').click(function(){
        if($('.showGroup .clickFlag').length==0){
            alert('请选择要删除的分组！');
        }else{
            if(confirm('确认删除该分组？')){
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

    $('#deleteTemGroup').click(function(){
        if($('#showTemGroup .clickFlag').length==0){
            alert('请选择要删除的分组！');
        }else{
            if(confirm('确认删除该分组？')){
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

    //导入分组1
    $('#import1').click(function(){
        var nodeSelected = $('#part1').treeview('getSelected');
        var deviceIds = [];
        var ids = [];
        for(var i=0;i<nodeSelected.length;i++){
            if(nodeSelected[i].type==3){
                var deviceId = nodeSelected[i].id;
                deviceIds.push(deviceId);
            }else{
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
    
    $('#import2').click(function(){
        var nodeSelected = $('#part1').treeview('getSelected');
        var deviceIds = [];
        var ids = [];
        for(var i=0;i<nodeSelected.length;i++){
            if(nodeSelected[i].type==3){
                var deviceId = nodeSelected[i].id;
                deviceIds.push(deviceId);
            }else{
                var id = nodeSelected[i].id;
                ids.push(id)
            }
        }

        var groupId = $('#part5 .clickFlag').attr('id');
        var data = {
            'ids': ids,
            'deviceIds': deviceIds,
            'id': groupId,
            'type': 1,
        };
        setGroupMember(data);
    })

    $('body').on('click' , '.showGroup p' , function(){ 
        var groupId = $(this).attr('id');
        var data = {
            'id': groupId,
            'type': 0,
        };
        listGroupMember(data);
    })
})

function userInfoList(inputData){
    var data = {
        'userId' : inputData,
    }
    $.ajax({
        url:'/v1/user/all',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;
                $('#main table tbody').empty();
                for(var i=0;i<list.length;i++){
                    if(list[i].userType==0){
                        var userType = "操作员";
                        var groupName = list[i].groupName
                    }else{
                        var userType = "管理员";
                        var groupName = "全部";
                    }
                    $("#main table tbody").append("<tr id='"+ list[i].userId+"' class='infolist' usertype='"+list[i].userType+
                        "' department='"+list[i].department+"' mobile='"+list[i].mobile+"' groupid='"+list[i].groupId+"'><td><input type='checkbox' name=''></td><td>"+(i+1)+"</td><td>"
                        +list[i].name+"</td><td>"
                        +list[i].userName+"</td><td>"+userType+"</td><td>"+groupName+"</td><td>"+list[i].department+"</td></tr>");
                }
                if(list.length<35){
                    for(var i=0;i<35-list.length;i++){
                        $("#main table tbody").append("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");
                    }
                }
            }else{
                alert('获取用户列表失败！');
            }
        }
    });
}

function createUser(inputData){
    var data = inputData;
    $.ajax({
        url:'/v1/user/create',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                alert('新建用户成功！');
                $('#modalAdd').modal('hide');
                userInfoList(cookie_userId);
            }else{
                alert('新建用户失败！');
                flushAll();
            }
        }
    });
}

function editUser(inputData){
    var data = inputData;
    $.ajax({
        url:'/v1/user/edit',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                alert('编辑用户成功！');
                $('#modalEdit').modal('hide');
                userInfoList(cookie_userId);
            }else{
                alert('编辑用户失败！');
            }
        }
    });
}

function deleteUser(inputData){
    var data = {
        'list': inputData,
    }
    $.ajax({
        url:'/v1/user/delete',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                alert('删除用户成功！');
                userInfoList(cookie_userId);
            }else{
                alert('删除用户失败！');
            }
        }
    });
}

function deviceTreeMulti() {
    var data = {
        "userId": cookie_userId
    };
    var rootNode = [];
    $.ajax({
        url:'/v1/device/tree/multi',
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

function listGroup(inputData) {
    var data = inputData;
    $.ajax({
        url:'/v1/device/allgroups',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;
                if(inputData.type==0){
                    $('.showGroup').empty();
                    for(var i=0;i<list.length;i++){
                        $('.showGroup').append('<p id="'+list[i].id+'">'+list[i].name+'</p>')
                    }
                    $('.showGroup p').css('width','100%');
                    $('.showGroup p').css('border-bottom','1px solid black');
                    $('.showGroup p').css('margin-bottom','0px');
                }else{
                    $('#showTemGroup').empty();
                    for(var i=0;i<list.length;i++){
                        $('#showTemGroup').append('<p id="'+list[i].id+'">'+list[i].name+'</p>')
                    }
                    $('#showTemGroup p').css('width','100%');
                    $('#showTemGroup p').css('border-bottom','1px solid black');
                    $('#showTemGroup p').css('margin-bottom','0px');
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
        url:'/v1/device/group/create',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                alert('创建分组成功！');
                if(inputData.type==0){
                    $('#modalAddGroup').modal('hide');
                    listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':0});  
                }else{
                    $('#modalAddTemGroup').modal('hide');
                    listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':1}); 
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
        url:'/v1/device/group/edit',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                alert('编辑分组成功！');
                if(inputData.type==0){
                    $('#modalEditGroup').modal('hide');
                    listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':0});  
                }else{
                    $('#modalEditTemGroup').modal('hide');
                    listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':1}); 
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
        url:'/v1/device/group/delete',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                alert('删除分组成功！');
                if(inputData.type==0){
                    listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':0});  
                }else{
                    listGroup({'userId':cookie_userId,'userType':USERTYPE,'type':1}); 
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
        url:'/v1/device/group/setmembers',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                alert('导入分组成功！');
            } else {
                alert('导入分组失败！');
            }
        }
    })
}

function listGroupMember(inputData) {
    var data = inputData;
    $.ajax({
        url:'/v1/device/group/listmembers',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;
                var size = data.result.size;

                $('#table tbody').empty();
                for(var i=0;i<size;i++){
                    switch(list[i].status){
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
                    if(list[i].deviceDangerID==''){list[i].deviceDangerID=0;};
                    $("#table tbody").append("<tr id='"+ list[i].id+"' class='infolist' devicedangerid='"+list[i].name+"'><td>"+(i+1)+"</td><td>"
                        +list[i].name+"</td><td>"+list[i].deviceTele+"</td><td>"+list[i].area+"</td><td>"+list[i].lineName+"</td><td>"
                        +list[i].danger+"</td>"+html+"<td>"+list[i].latitude+"</td><td>"+list[i].longitude+"</td><td>"+list[i].deviceMeid+"</td></tr>");
                }
            } else {
                alert('查看分组失败！');
            }
        }
    })
}

function deviceInfoList(inputData){
    var data = {
        'userId':cookie_userId,
        'index': inputData.index,
        'size': ENTRIES,
        'order': inputData.order,
    };
    $.ajax({
        url:'/v1/device/info/list',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;
                var total = data.result.total;
                $('#table').attr('infolist-index',inputData.index);
                var pages = Math.ceil(total/ENTRIES);
                $('#infoCount').text('第'+(inputData.index+1)+'页，共'+pages+'页');
                if(inputData.index+1==1){
                    $('#infoLast').hide();
                }else{
                    $('#infoLast').show();
                }

                if(inputData.index+1==pages){
                    $('#infoNext').hide();
                }else{
                    $('#infoNext').show();
                }

                $('#table tbody').empty();
                var tmp = (list.length<ENTRIES)?list.length:ENTRIES;
                for(var i=0;i<tmp;i++){
                    switch(list[i].status){
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
                    if(list[i].deviceDangerID==''){list[i].deviceDangerID=0;};
                    $("#table tbody").append("<tr id='"+ list[i].deviceId+"' class='infolist' devicedangerid='"+list[i].deviceDangerID+"'><td>"+(i+1)+"</td><td>"
                        +list[i].deviceName+"</td><td>"+list[i].deviceTele+"</td><td>"+list[i].area+"</td><td>"+list[i].lineName+"</td><td>"
                        +list[i].danger+"</td>"+html+"<td>"+list[i].latitude+"</td><td>"+list[i].longitude+"</td><td>"+list[i].deviceMeid+"</td></tr>");
                }
            } else {
                alert('获取设备信息列表失败');
            }
        }
    })
}

function selectGroup(){
    var data = {
    	'userId': cookie_userId,
    	'userType': 1,
        'type':0,
    };
    $.ajax({
        url:'/v1/device/allgroups',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;
                $('#privilegeGroup').empty();
                $('#privilegeGroup').append('<option value="0">请选择</option><option value="1">全部</option>')
                for(var i=0;i<list.length;i++){
                    $('#privilegeGroup').append('<option value="'+list[i].id+'">'+list[i].name+'</option>')
                }
                $('#privilegeGroupSelect').empty();
                $('#privilegeGroupSelect').append('<option value="0">请选择</option><option value="1">全部</option>')
                for(var i=0;i<list.length;i++){
                    $('#privilegeGroupSelect').append('<option value="'+list[i].id+'">'+list[i].name+'</option>')
                }
            } else {
                alert('failure!');
            }
        }
    })
}