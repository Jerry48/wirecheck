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
	var channelNo = Request['channelNo'];

	$('#nav p').text('设备:'+deviceId+' '+channelNo+'号摄像头 图像列表');

	var data = {
		"channelNo":channelNo,
		"type": type,
		"id":  deviceId,
		"size": size,
		"index": index,
		"startTime": "1900-01-01 00:00:00",
		"endTime": "2900-01-01 00:00:00"
	}
  	getNextPage(data);
  	intervalIds.findDevicePic = setInterval(function() {getNextPage(data);}, 20000);

  	$('.pics img').click(function(){
  		window.location.href = HOST+'/viewPic?picId='+$(this).attr('picId')+'&deviceId='+$(this).attr('deviceId')+'&url='+$(this).attr('data-original')+'&event=patrol';
  	})

  	$('#back').click(function(){
  		window.history.go(-1);
  	})

  	$('#next').click(function(){
  		var index = parseInt($('body').attr('pic-index'));
  		var id = $('body').attr('deviceId');
  		var channelNo = $('body').attr('channelNo');
  		var size = 9;
  		var type = 0;
  		var data = {
			"channelNo":channelNo,
			"type": type,
			"id":  deviceId,
			"size": size,
			"index": index+1,
			"startTime": "1900-01-01 00:00:00",
			"endTime": "2900-01-01 00:00:00"
		}
  		getNextPage(data);
  	});

  	$('#last').click(function(){
  		var index = parseInt($('body').attr('pic-index'));
  		var id = $('body').attr('deviceId');
  		var channelNo = $('body').attr('channelNo');
  		var size = 9;
  		var type = 0;
  		var data = {
			"channelNo":channelNo,
			"type": type,
			"id":  deviceId,
			"size": size,
			"index": index-1,
			"startTime": "1900-01-01 00:00:00",
			"endTime": "2900-01-01 00:00:00"
		}
  		getNextPage(data);
  	});

    $('#photo').click(function(){
      var channelNo = $('body').attr('channelNo');
      var data = {
        "deviceId": deviceId,
        "channelNo": channelNo,
      };
      $.ajax({
        url:'/v1/device/klTriggerPhoto',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
          if(data.code == 0){
            alert('设备拍照成功！请等待设备上传图片');
          }else if (data.code == NO_SOCKET || data.code == SERVER_ERROR){
            alert('与设备服务器连接失败！错误码：'+data.code);
          } else {
            alert('拍照失败！');
          }
        }
      })// end of ajax
    })// end of click

    $('#refresh').click(function(){
       var channelNo = $('body').attr('channelNo');
       var size = 9;
       var index = parseInt($('body').attr('pic-index'));
       var type = 0;

       var type = 0;
       var data = {
        "channelNo": channelNo,
        "id":  deviceId,
        "size": size,
        "type": type,
        "index": 0,
        "startTime": "1900-01-01 00:00:00",
        "endTime": "2900-01-01 00:00:00"
      }
      getNextPage(data);
    })
  });


function getNextPage(data) {
    clearInterval(intervalIds.findDevicePic);
    var outerData = data;
    $.ajax({
        url:'/v1/search/pics/device',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1)
                    $('#next').hide();
                else
                    $('#next').show();

                $('body').attr('pic-index',outerData.index);
                $('body').attr('deviceId',outerData.id);
                $('body').attr('channelNo',outerData.channelNo);

                if($('body').attr('pic-index') > 0){
                    $('#last').show();
                }else{
                    $('#last').hide();
                }

                var list = data.result.list;

                for (var i = 0; i < list.length; ++i) {
                    if (list[i].picType == 2){
                            // for ref pic
                    }else{
                        if (list[i].picType == 1){
                            var name = list[i].name;
                            var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                            // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 告警图片:"+timeName);
                        }else{
                            var name = list[i].name;
                            var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                            // $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 原始图片:"+timeName);
                        }
                        var w = $('#pics img').css('width');
                        $('#pics img').css('height',w);
                        $('#pics img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                        $('#pics img:eq(' + i + ')').attr('data-original', list[i].picUrl);
                        $('#pics img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#pics img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        $('#pics img:eq(' + i + ')').attr('deviceId', outerData.id);
                        $('#pics p:eq(' + i + ')').text(list[i].time);
                        $('#picCount').text('第'+(outerData.index + 1)+'页 共'+Math.ceil(data.result.total / outerData.size)+'页');
                    }                    
                }
                // 进度条
             
                
                // for (var i = 0; i < list.length; ++i) {
                //     $('img.magnify:eq(' + (i + 4) + ')').attr('src', list[i].picUrl);
                // }
            } else {
                alert('查无图片！');
                var level = $('#tree').treeview('getSelected')[0].level;
                if(level > 3)
                    alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '查询图片失败');
                console.log(data);
            }
        }
    })// end of ajax   
}