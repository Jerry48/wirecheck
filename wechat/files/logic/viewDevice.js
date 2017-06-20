var openid = Cookies.get('openid');

function getDevice(data){
    $.ajax({
        url:'/v1/user/device/list',
        type:"GET",
        data : data,
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                var devices = data.result.list;

                for (var i = 0; i < devices.length; ++i) {
                    $('#getDevice select').append("<option value="+devices[i].deviceId+">"+devices[i].deviceName+"</option>");    
                }
                
            }else {
                console.log('获取用户设备列表失败！');
            }
        }
    }) 
}

function getFollowup(data){
    $.ajax({
        url:'/v1/user/follow/list',
        type:"GET",
        data : data,
        dataType:"json",
        contentType:"application/json; charset=utf-8",
        success: function(data){
            if (data.code == 0) {
                $("#getFollowup").empty();
                var followup = data.result.list;
                for (var i = 0; i < followup.length; ++i) {
                    var $tr = $("<tr />");
                    $tr.append("<td>"+followup[i].deviceId+"</td>")
                    .append("<td>"+followup[i].deviceName+"</td>");
                    $("#getFollowup").append($tr);   
                }
            }
            else {
                alert("获取用户关注设备列表失败！");
            }
        }
    }) 
}

function viewStatus(data){
    $.ajax({
        url:'/v1/device/details',
        type:"GET",
        data: data,
        dataType:"json",
        contentType:"application/json; charset=utf-8",
        success: function(data){
            if (data.code == 0) {

                var status = data.result;

                switch(status.status){
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

                $(".table tr:eq(0)").append("<td>"+status.name+"</td>");
                $(".table tr:eq(1)").append("<td>"+status.deviceTele+"</td>");
                $(".table tr:eq(2)").append("<td>"+status.area+"</td>");
                $(".table tr:eq(3)").append("<td>"+status.lineName+"</td>");
                $(".table tr:eq(4)").append("<td>"+status.danger+"</td>");
                $(".table tr:eq(5)").append(html);
                $(".table tr:eq(6)").append("<td>"+status.latitude+"</td>");
                $(".table tr:eq(7)").append("<td>"+status.longitude+"</td>");
                $(".table tr:eq(8)").append("<td>"+status.deviceMeid+"</td>");
            }
            else {
                alert('查看设备失败');              
            }
        }
    })
}

function confDevice(data){
    $.ajax({
        url:'/v1/device/edit',
        type:"POST",
        data: JSON.stringify(data),
        dataType : "json",
        contentType:"application/json; charset=utf-8",
        success:function(data){
            if(data.code == 0){
                alert("配置设备成功！");
                //window.location.href('http://www.wirecheckon.com/viewDevice');
            }else{
                alert("配置设备失败！");
            }
        }
    });    
}

function setDefend(data){
    $.ajax({
        url:'/v1/device/defend/set',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0)
                alert('撤防设置成功！');
            else {
                alert('撤防设置失败！');
            }
        }
    })
}

function followDevice(inputData){
    $.ajax({
        url:'/v1/user/device/follow',
        type:"POST",
        data: JSON.stringify(inputData),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0){
                alert('关注成功！');
                $("#ask").text("您已关注该设备。");
                $("#follow").text('取消关注');
                var data = {'userId' : inputData.userId};
                getFollowup(data);
            }else {
                alert('关注失败！');
            }
        }
    })
}

function unfollowDevice(inputData){
    $.ajax({
        url:'/v1/user/device/follow',
        type:"POST",
        data: JSON.stringify(inputData),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0){
                alert('取消关注成功！');
                $("#ask").text("是否关注该设备？");
                $("#follow").text('关注');
                var data = {'userId' : inputData.userId};
                getFollowup(data);
            }else {
                alert('取消关注失败！');
            }
        }
    })
}

function ifFollow(data){
    $.ajax({
        url:'/v1/user/follow/search',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0){
                var follow = data.result.follow;
                if(follow == 0){
                    $("#ask").text("是否关注该设备？");
                    $("#follow").text('关注');
                }else{
                    $("#ask").text("您已关注该设备。");
                    $("#follow").text('取消关注');
                }
                $("#ask").css("display","block");
                $("#follow").css("display","block");
            }else {
                alert('无法确定该设备是否被关注！');
            }
        }
    })
}

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

$(function(){
    var Request = new Object();
    Request = GetRequest();
    var deviceId  = Request['deviceId'];
    var channelNo  = Request['channelNo'];
    viewStatus({'id': deviceId})

    $('#back').click(function(){
        window.history.go(-1);
    })
})

// $(function(){
//     var userId = '';
//     var data = {'openid':openid};
//     $.ajax({
//         url:'/v1/user/ifbind',
//         type:"POST",
//         data: JSON.stringify(data),
//         contentType:"application/json; charset=utf-8",
//         dataType:"json",
//         success: function(data){
//             if (data.code == 0){
//                 if(data.result.bindFlag == 1){
//                     userId = data.result.userId;
//                     var data = {'userId' : userId};
//                     getDevice(data);
//                     getFollowup(data);

//                     $("#getDevice").change(function(){
//                         var deviceId = $(this).find('option:selected').val();

//                         if(deviceId != "default"){
//                             $("#editId").text(deviceId);
//                             $("#setId").text(deviceId);
//                         }

//                         var data = {
//                             'deviceId' : deviceId,
//                             'userId' : userId
//                         };

//                         ifFollow(data);

//                         var data = {
//                             'deviceId' : deviceId
//                         };

//                         viewStatus(data);

//                         $('#saveDefend').click(function() {
//                             var id = $("#setId").text();
//                             var level = $('#setLevel').val();
//                             var fullDisable = $('#isDisable').val();
//                             var dayOfWeek = $('#setDay').val();
//                             var startHour = $('#startHour').val();
//                             var startMinute = $('#startMinute').val();
//                             var endHour = $('#endHour').val();
//                             var endMinute = $('#endMinute').val();
//                             var data = {
//                                 "id": id,
//                                 "level": level,
//                                 "fullDisable": fullDisable,
//                                 "list": [
//                                 {
//                                     "dayOfWeek":dayOfWeek,
//                                     "startHour": startHour,
//                                     "startMinute": startMinute,
//                                     "endHour": endHour,
//                                     "endMinute": endMinute
//                                 }]
//                             };
//                             setDefend(data);
//                         }); 
                        
//                         $('#saveDevice').click(function(){
//                             var id = deviceId;
//                             var name = $('#editName').val();
//                             var nickName = $('#editNick').val();
//                             var latitude = $('#editLat').val();
//                             var longitude = $('#editLon').val();
//                             var beatInterval = $('#editBeat').val();
//                             var photoInterval = $('#editPho').val();
//                             var mac = $('#editMac').val();
//                             var batteryVoltageLow = $('#bVLow').val();
//                             var chargeVoltageLow = $('#cVLow').val();
//                             var temperatureLow = $('#tLow').val();
//                             var batteryVoltageHigh = $('#bVHigh').val();
//                             var chargeVoltageHigh = $('#cVHigh').val();
//                             var temperatureHigh = $('#tHigh').val();

//                             var data = {
//                                 'id' : id,
//                                 'name' : name,
//                                 'nickName' : nickName,
//                                 'latitude' : latitude,
//                                 'longitude' : longitude,
//                                 'beatInterval' : beatInterval,
//                                 'photoInterval' : photoInterval,
//                                 'mac' : mac,
//                                 'batteryVoltageLow' : batteryVoltageLow,
//                                 'chargeVoltageLow' : chargeVoltageLow,
//                                 'temperatureLow' : temperatureLow,
//                                 'batteryVoltageHigh' : batteryVoltageHigh,
//                                 'chargeVoltageHigh' : chargeVoltageHigh,
//                                 'temperatureHigh' : temperatureHigh
//                             };
//                             confDevice(data);
//                         });


//                         $("#follow").click(function(){
//                             if($("#follow").text() == '取消关注'){
//                                 var data = {
//                                     "userId": userId,
//                                     "deviceId": deviceId,
//                                     "follow" : 0
//                                 };
//                                 unfollowDevice(data);
//                             }else{
//                                 var data = {
//                                     "userId": userId,
//                                     "deviceId": deviceId,
//                                     "follow" : 1
//                                 }
//                                 followDevice(data);           
//                             }
//                         });
//                     });
//                 }else{
//                     alert("请退出点击菜单“用户”->“绑定账号”！");
//                 }
//             }else {
//                 alert('系统出错,请咨询管理员！');
//             }
//         }
//     })
// });        