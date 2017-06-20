 var userId = Cookies.get('userId');

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
  var picId = Request['picId'];
  var deviceId = Request['deviceId'];
  var src = Request['url'];
  var event = Request['event'];

  $('#pic img').attr('src',src);
  $('#push').click(function(){
  	var data = {
      "userId": userId,
  		"deviceId": deviceId
  	}
  	$.ajax({
                url:'/v1/device/list/users',
                type:"GET",
                data: data,
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                async:false,
                success: function(data){
                    $('#modalPush .modal-body').empty();
                    if (data.code == 0) {
                        var list = data.result.list;
                        for (var i = 0; i < list.length; ++i) {
                            var $ctrl = '<div><input userId="'+list[i].userId+'" type="checkbox">'+list[i].userName+'___微信：'+list[i].nickname+'</div>';
                            $('#modalPush .modal-body').append($ctrl); 
                        }
                               
                        // alert('success!');
                        $('#modalPush').modal();
                    } else {
                        alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '失败');
                    }
                }
            }) // end of ajax /v1/device/list/users
  })

  $('#back').click(function(){
      window.history.go(-1);
    })

      $('#modalPush .modal-footer button:eq(0)').click(function(){
        var picIds = [];
        picIds.push({'picId':picId});
        var userIds = [];
        $('#modalPush input:checked').each(function() {
            userIds.push({'userId':$(this).attr('userId')});
        });
        var data = {
            "userId": userId,
            "deviceId": deviceId,
            "picIds": picIds,
            'userIds': userIds
        }
        $.ajax({
            url:'/v1/command/push/pics',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    alert('推送成功');
                    $('#modalPush').modal('hide');
                    $('#modalPush .modal-body').empty();

                } else {
                    alert('推送失败');
                }
            }
        }); // end of ajax /v1/command/push/pics
    }); // end of click
});
