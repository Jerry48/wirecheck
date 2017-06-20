var openid = Cookies.get('openid');
$(document).ready(function(){
    var userId = '';
    var data = {'openid':openid};
    $.ajax({
        url:'/v1/user/ifbind',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0){
                if(data.result.bindFlag == 1){
                    userId = data.result.userId;
                    $('#savePwd').click(function() {
                        var password = $('#OldPassword').val();
                        var newPassword = $('#NewPassword').val();
                        var Confirm = $('#Confirm').val();
                        
                        if(Confirm != newPassword)
                        {
                            alert('两次输入密码不一致！');
                        }else{
                            var data = {
                                'userId': userId,
                                'password': password,
                                'newPassword': newPassword
                            };

                            $.ajax({
                                url:'/v1/user/pwd/change',
                                type:"POST",
                                data: JSON.stringify(data),
                                contentType:"application/json; charset=utf-8",
                                async:false,
                                success: function(data){
                                    if (data.code == 0)
                                        alert('密码修改成功！');
                                    else {
                                        alert('修改密码失败！请重试！');
                                    }
                                }
                            })
                        } 

                    });  
                }else{
                    alert("请退出点击菜单“用户”->“绑定账号”！");
                }
            }else{
                alert('系统出错,请咨询管理员！');
            }
        }
    }) 
});
