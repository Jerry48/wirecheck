var openid = Cookies.get('openid');
var accessToken = Cookies.get('access_token');
var refreshToken = Cookies.get('refresh_token');
var expiresIn = Cookies.get('expires_in');
var nickname = Cookies.get('nickname');
var sex = Cookies.get('sex');
var language = Cookies.get('language');
var city = Cookies.get('city');
var province = Cookies.get('province');
var country = Cookies.get('country');
var headimageurl = Cookies.get('headimageurl');

var ifBind = Cookies.get('ifBind');
var userId = Cookies.get('userId');
var userName = Cookies.get('userName');
var mobile = Cookies.get('mobile');
var ifClose = Cookies.get('ifClose');

function test(){
    document.addEventListener('WeixinJSBridgeReady', function(){ WeixinJSBridge.call('closeWindow'); }, false);
}
$(document).ready(function(){
    if(ifClose == '1'){
        document.addEventListener('WeixinJSBridgeReady', function(){ WeixinJSBridge.call('closeWindow'); }, false);
    }

    var data = {"openid":openid}
    checkBind(data);

    if(ifBind == '1'){
        $('#input').hide();
        $('#button').hide();
        $('#table').show();
    }
    
    $('#unbind').click(function() {
        var data = {"userId":userId};
        $.ajax({
            url:'/v1/user/unbind',
            type:"GET",
            data: data,
            dataType:"json",
            async: false,
            success: function(data) {
                if(data.code==0){
                    Cookies.set('ifBind','0',{path:'/',expires:365}); 
                    alert("解绑成功！");
                    $('#table').empty();
                    $('#table').append('<p style = "padding-top:20px;font-size:20px">您已解绑定，如需重新绑定请先关闭该页面。</p>');
                }else{
                    alert("解绑失败！");
                }
            }
        })
   });

    $('#saveInfo').click(function() {
        var mobile = $('#input input').val();
        if(mobile == ''){
            Cookies.set("ifClose","1");
            alert('手机号不能为空!');
        }else{
            var data = {"mobile": mobile}; 
            
            $.ajax({
                url:'/v1/user/search',
                type:"GET",
                data: data,
                dataType:"json",
                async: false,
                success: function(data) {
                    if (data.code == 0){
                        var userId = data.result.userId;
                        var userName = data.result.userName;

                        var data = {
                            "userId" : userId,
                            "accessToken" : accessToken,
                            "refreshToken" : refreshToken,
                            "expiresIn" : expiresIn,
                            "openid" : openid,
                            "nickname" : nickname,
                            "sex" : sex,
                            "language" : language,
                            "city" : city,
                            "country" : country,
                            "province" : province,
                            "headimageurl" : headimageurl
                        };
                        $.ajax({
                            url:'/v1/user/bind',
                            type: "GET",
                            data: data,
                            dataType:"json",
                            async: false,
                            success: function(data){
                                if(data.code == 0){
                                    Cookies.set('userId',userId,{path:'/',expires:365});
                                    Cookies.set('userName',userName,{path:'/',expires:365});
                                    Cookies.set('mobile',mobile,{path:'/',expires:365});
                                    Cookies.set('ifBind','1',{path:'/',expires:365}); 
                                    Cookies.set("ifClose","1",{path:'/',expires:365});
                                    alert("用户绑定成功!");

                                    var data = {"openid":openid}
                                    checkBind(data);
                                    $('#input').hide();
                                    $('#button').hide();
                                    $('#table').show();
                                }else{
                                    alert("用户绑定失败!");
                                    Cookies.set("ifClose","1");
                                }
                            }
                        })
                    }else {
                        alert('查无该手机号! 请重试！');
                        Cookies.set("ifClose","1");
                    }
                }
            })        
        } 
    })
});  


function checkBind(data){
    $.ajax({
        url:'/v1/user/ifbind',
        type:"GET",
        data: data,
        dataType:"json",
        async: false,
        success: function(data) {
            if(data.code == 0){
                if(data.result.bindFlag == 1){
                    ifBind = '1';
                    userId = data.result.userId;
                    userName = data.result.userName;
                    name = data.result.name;
                    mobile = data.result.mobile;
                    department = data.result.department;
                    var gender = data.result.gender;

                    switch(gender){
                        case 0:
                            var genderStr = "男";
                            break;
                        case 1: 
                            var genderStr = '女';
                            break;
                        default:
                            var genderStr = "未知";
                            break;
                    }
                    $('#table').find('tr:eq(1)').append('<td>'+userName+'</td>');
                    $('#table').find('tr:eq(2)').append('<td>'+name+'</td>');
                    $('#table').find('tr:eq(3)').append('<td>'+nickname+'</td>');
                    $('#table').find('tr:eq(4)').append('<td>'+genderStr+'</td>');
                    $('#table').find('tr:eq(5)').append('<td>'+mobile+'</td>');
                    $('#table').find('tr:eq(6)').append('<td>'+department+'</td>');
                }else{
                    ifBind = '0';
                }
            }
        }
    });
}