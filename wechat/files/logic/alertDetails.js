var openid = Cookies.get('openid');
// alert(openid);

function GetRequest() {
      var url = location.search; //获取url中"?"符后的字串
      var theRequest = new Object();
      if (url.indexOf("?") != -1) {
          var str = url.substr(1);
          strs = str.split("&");
          for(var i = 0; i < strs.length; i ++) {
           theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
       }
   }
   return theRequest;
}

$(document).ready(function(){
    
    var Request = new Object();
    Request = GetRequest();
    var id;
    id = Request['id'];
    var event = Request['event'];

    $('#back').click(function(){
        if(event != 'fromweixin'){
            window.history.go(-1);
        }else{
            WeixinJSBridge.call('closeWindow');
        }
    })

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
                    var data = {
                        'id':id,
                    };

                    $.ajax({
                        url:'/v1/alert/details',
                        type:"GET",
                        data: data,
                        dataType:"json",
                        success: function(data){
                            if (data.code == 0) {
                                var details = data.result;
                                if(details.alertType == 0){
                                    $("#pic").empty();
                                    $("#temperature").append("<td>"+details.deviceWorkAlert.temperature+"</td>");
                                    $("#batteryVoltage").append("<td>"+details.deviceWorkAlert.batteryVoltage+"</td>");
                                    $("#chargeVoltage").append("<td>"+details.deviceWorkAlert.chargeVoltage+"</td>");
                                }else{
                                    $("#temperature").hide();
                                    $("#batteryVoltage").hide();
                                    $("#chargeVoltage").hide();
                                    $("#pic").show();
                                    $("#pic img").attr('data-original',details.picAlert.picUrl);
                                    $("#pic img").attr('picId',details.picId);
                                    $("#pic img").attr('deviceId',details.deviceId);
                                    $("#pic img").attr('src',details.picAlert.picUrl);
                                }
                                var processStatus = "";
                                switch(details.processStatus){
                                    case 0:
                                    processStatus = "未推送";
                                    break;
                                    case 1:
                                    processStatus = "已推送";
                                    break;
                                    case 2:
                                    processStatus = "已消警";
                                    break;
                                    case 3:
                                    processStatus = "已处理";
                                    $('#handle').hide();
                                    break;
                                    case 4:
                                    processStatus = "已处理";
                                    $('#handle').hide();
                                    break;
                                    default:
                                    break;
                                }

                                switch(details.alertType){
                                    case 0:
                                    alertType = "工况告警";
                                    break;
                                    case 1:
                                    alertType = "图片告警";
                                    break;
                                    default:
                                    break;
                                }

                                $("#alertId").append("<td>"+details.id+"</td>");
                                $("#alertType").append("<td>"+alertType+"</td>");
                                $("#deviceName").append("<td>"+details.deviceName+"</td>");
                                $("#happenTime").append("<td>"+details.happenTime+"</td>");
                                $("#processStatus").append("<td>"+processStatus+"</td>");
                                $("#processTime").append("<td>"+details.processTime+"</td>");
                                $("#alertMessage").append("<td>"+details.alertMessage+"</td>");
                                

                                $("#nav").text(details.deviceName+" "+details.happenTime); 
                            }
                            else {
                                alert('查看告警信息失败！');
                            }
                        }
                    })    
                    
                    $('#pic img').click(function(){
                        window.location.href = HOST + '/viewPic?picId='+$(this).attr('picId')+'&deviceId='+$(this).attr('deviceId')+'&url='+$(this).attr('data-original')+'&event=alert';
                    })

                    $('#handle').click(function(){
                        // if(confirm('确定处理该告警？')){
                            var confirm = 1;
                            var data = {
                                "userId": userId,
                                "alertId": id,
                                "confirm": confirm,
                            };
                            $.ajax({
                                url:'/v1/alert/process',
                                type:"POST",
                                data: JSON.stringify(data),
                                contentType:"application/json; charset=utf-8",
                                dataType:"json",
                                success: function(data){
                                    if (data.code == 0){
                                        alert('告警处理状态更新成功！');
                                        $("#processStatus td:eq(1)").text("已处理");                       
                                    }
                                    else {
                                        alert('告警处理状态更新失败！');
                                    }
                                }
                            })
                        // }
                    })

                    $('#Clear').click(function() {
                        //var usrId = Cookies.get("userId");
                        var confirm = 0;
                        var clear = 1;
                        var data = {
                            "userId": userId,
                            "alertId": id,
                            "confirm": confirm,
                            "clear": clear
                        };

                        $.ajax({
                            url:'/v1/alert/process',
                            type:"POST",
                            data: JSON.stringify(data),
                            contentType:"application/json; charset=utf-8",
                            dataType:"json",
                            success: function(data){
                                if (data.code == 0){
                                    alert('告警处理状态更新成功！');
                                    $("#processStatus td:eq(1)").text("已处理");
                                    $("#handle").remove();                        
                                }
                                else {
                                    alert('告警处理状态更新失败！');
                                }
                            }
                        })
                    })

                    $('#Confirm').click(function() {
                        //var usrId = Cookies.get("userId");
                        var confirm = 1;
                        var clear = 0;
                        var data = {
                            "userId": userId,
                            "alertId": id,
                            "confirm": confirm,
                            "clear": clear
                        };

                        $.ajax({
                            url:'/v1/alert/process',
                            type:"POST",
                            data: JSON.stringify(data),
                            contentType:"application/json; charset=utf-8",
                            dataType:"json",
                            success: function(data){
                                if (data.code == 0){
                                    alert('告警处理状态更新成功！');
                                    $("#askConfirm").text("您已确认为真告警。");
                                    $("#processStatus td:eq(1)").text("已确认为真告警");
                                    $("#Confirm").remove();
                                    $("#Fake").remove();
                                    $("#askClear").remove();
                                    $("#Clear").remove();               
                                }
                                else {
                                    alert('告警处理状态更新失败！');
                                }
                            }
                        })
                    })  
                    
                    $('#Fake').click(function() {
                        //var usrId = Cookies.get("userId");
                        var confirm = 2;
                        var clear = 0;
                        var data = {
                            "userId": userId,
                            "alertId": id,
                            "confirm": confirm,
                            "clear": clear
                        };

                        $.ajax({
                            url:'/v1/alert/process',
                            type:"POST",
                            data: JSON.stringify(data),
                            contentType:"application/json; charset=utf-8",
                            dataType:"json",
                            success: function(data){
                                if (data.code == 0){
                                    alert('告警处理状态更新成功！');
                                    $("#askConfirm").text("您已确认该告警为假告警。");
                                    $("#processStatus td:eq(1)").text("已确认为假告警");
                                    $("#Fake").remove();
                                    $("#Confirm").remove();        
                                    $("#askClear").remove(); 
                                    $("#Clear").remove();       
                                }
                                else {
                                    alert('告警处理状态更新失败！');
                                }
                            }
                        })
                    })    
                }else{
                    alert("请退出点击菜单“用户”->“绑定账号”！");
                }
            }else{
                alert('系统出错,请咨询管理员！');
            }
        }
    })
});
