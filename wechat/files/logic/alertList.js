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
                console.log('获取设备列表失败！');
            }
        }
    })
}

function getAlarm(data){
    $.ajax({
        url:'/v1/alert/list',
        type:"GET",
        data : data,
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                var list = data.result.list;
                var alertType = "";
                var processStatus = "";

                if(list.length <= 0){
        
                }else{
                    for(var i=0;i<list.length;i++){
                        switch(list[i].alertType){
                            case 0:
                                alertType = "工况告警";
                                break;
                            case 1:
                                alertType = "图片告警";
                                break;
                            default:
                                break;
                        }

                        switch(list[i].processStatus){
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
                                processStatus = "真告警";
                                break;
                            case 4:
                                processStatus = "假告警";
                                break;
                            default:
                                break;
                        }
                        $('#getAlert').append('<tr><td>'+list[i].happenTime+'</td><td>' + alertType + '</td><td>'+processStatus+'</td><td><a target=\'_blank\' href=\''+HOST+'/alertDetails?id='+list[i].id+'\'>点击查看</a></td></tr>');
                    }
                }
            }else {
                console.log('获取告警列表失败！');
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

size = 9;
index = 0;
type = 0;
var intervalIds = {};

$(function(){
    var Request = new Object();
    Request = GetRequest();
    var deviceId = Request['deviceId'];
    getAlarm({deviceId:deviceId,});
})

// $(document).ready(function(){
//     //var alertFlag = 0;
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

//                     $("#getList").click(function(){
//                         $('#getAlert').empty();            
//                         var deviceId = $("#getDevice").find('option:selected').val();
//                         if(deviceId == 'defaultDev')
//                             alert("请选择设备");
//                         var alertType =[]; 
//                         var processStatus =[]; 
//                         $('input[name="type"]:checked').each(function(){ 
//                             alertType.push($(this).val()); 
//                         }); 
//                         $('input[name="status"]:checked').each(function(){ 
//                             processStatus.push($(this).val()); 
//                         }); 

//                         if(alertType.length == 0){
//                             if(processStatus.length == 0){
//                                 var data = {
//                                     'deviceId' : deviceId,
//                                 }
//                                 getAlarm(data);
//                             }else{
//                                 for(var i=0;i<processStatus.length;i++){
//                                     var data = {
//                                         'deviceId' : deviceId,
//                                         'processStatus' : processStatus[i],
//                                     };
//                                     getAlarm(data);
//                                 }
//                             }
//                         }else{
//                             if(processStatus.length == 0){
//                                 for(var i=0;i<alertType.length;i++){
//                                     var data = {
//                                         'deviceId' : deviceId,
//                                         'alertType' : alertType[i],
//                                     };
//                                     getAlarm(data);
//                                 }
//                             }else{
//                                 for(var i=0;i<alertType.length;i++){
//                                     for(var j=0;j<processStatus.length;j++){
//                                         var data = {
//                                             'deviceId' : deviceId,
//                                             'alertType' : alertType[i],
//                                             'processStatus' : processStatus[j],
//                                         };
//                                         getAlarm(data);
//                                     }
//                                 }
//                             }
//                         }
//                         if(alertFlag == 0)
//                             alert("暂无告警");
//                     })
//                 }else{
//                     alert("请退出点击菜单“用户”->“绑定账号”！");
//                 }
//             }else{
//                 alert('系统出错,请咨询管理员！');
//             }
//         }
//     });
// });