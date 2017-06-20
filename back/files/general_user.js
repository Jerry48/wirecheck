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
    $('#editUserForm').hide();
    $('#changePwd').hide();
}

function setEditUser() {
    var data = {
        "userName":  Cookies.get('userName')
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
                $('#editUserForm input:eq(0)').attr('userId', obj.userId);
                $('#editUserForm input:eq(0)').val(obj.userName);
                if (obj.gender==0)
                    $('#editUserForm input:eq(1)').prop('checked', true);
                else
                    $('#editUserForm input:eq(2)').prop('checked', true);

                $('#editUserForm input:eq(3)').val(obj.mobile);
                $('#editUserForm input:eq(4)').val(obj.name);
                $('#editUserForm select').val(obj.userType);
            }                
            else {
                console.log('get user info error');
                console.log(data);
            }
        }

    })
}

$(function() {
    // 编辑用户
    $('#sidebar-nav li:nth-child(1)').click(function(){
        hideAll();
        setEditUser();
        $('#editUserForm').show();
        $('#editUserForm button').unbind('click');
        $('#editUserForm button').click(function(){
            var userId = $('#editUserForm input:eq(0)').attr('userId');
            var userName = $('#editUserForm input:eq(0)').val();
            var gender = parseInt($('#editUserForm input[name=gender]:checked').val());
            var mobile = $('#editUserForm input:eq(3)').val();
            var name = $('#editUserForm input:eq(4)').val();
            var userType =parseInt($('#editUserForm select').val());
            var data = {
                "userId": userId,
                "userName": userName,
                "gender": gender,
                "mobile":mobile,
                "name": name,
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
                        console.log('edit user successful');
                    }else {
                        alert('修改用户失败');
                        console.log('edit user error');
                        console.log(data);
                    }
                }
            })
        });
    });

    // 修改密码
    $('#sidebar-nav li:nth-child(2)').click(function(){
        hideAll();
        $('#changePwd').show();
        
        $('#changePwd button').unbind('click');
        $('#changePwd button').click(function(){
            var userId = Cookies.get('userId');
            var password = $('#changePwd input:eq(0)').val();
            var newPassword = $('#changePwd input:eq(1)').val();
            var data = {
                'userId': userId,
                'password': password,
                'newPassword': newPassword
            }
            $.ajax({
                url:'/v1/user/pwd/change',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0){
                        alert('修改密码成功');
                        console.log('edit user successful');
                    }else {
                        alert('修改密码失败');
                        console.log(data);
                    }
                }
            })//end of ajax
        })
        
    });

    $('#sidebar-nav li:nth-child(1)').click();
});
