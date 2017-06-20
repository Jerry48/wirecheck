$.ajaxSetup({ cache: false });            
thum2pic = {}
function hideAll() {
    $('#main').hide();
}

function processAlert(newData) {
    $.ajax({
        url:'/v1/alert/process',
        type:"POST",
        data: JSON.stringify(newData),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0){
                alert('告警'+newData.alertId + '处理完毕');
            } else {
                console.log('failed at alert/process');
            }
        }
    }) // end of ajx
}
function getSelectedDevice(){
    if ($('#tree').treeview('getSelected').length != 1 || $('#tree').treeview('getSelected')[0].type == undefined
        || $('#tree').treeview('getSelected')[0].type != 3) {
        return -1;
    }
    return $('#tree').treeview('getSelected')[0].id;
}

function setTreeNodeSelected() {
    $('#tree').data().treeview.options.multiSelect=false;
    $('#tree').unbind('nodeSelected');
    $('#tree').on('nodeSelected', function(event, data) {
        var type = $('#tree').treeview('getSelected')[0].type;
        var deviceId = $('#tree').treeview('getSelected')[0].id;
        var name = $('#tree').treeview('getSelected')[0].text;
        
        if ($('#tabTree li').filter('.active').text() == '设备列表') {
            if (type == 3){
                type = 0;
                $.ajax({
                    url:'/v1/device/find/parents',
                    type:"POST",
                    data: JSON.stringify(data),
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data){
                        if (data.code == 0){
                            var parents = data.result.data;
                            var parentsName="";
                            for(var i=0;i<parents.length;i++){
                                parentsName = parentsName + parents[parents.length-1-i]+" / "
                            }
                            parentsName += name;
                            $('#lineInfo').text(parentsName);
                        } else {
                            console.log('failed at alert/process');
                        }
                    }
                }) // end of ajx
                
            } else {
                type = 1;
            }
        } else {
            if (type == 3){
                type = 0;
            } else {
                type = 2;
            }
        }
        var id = $('#tree').treeview('getSelected')[0].id;
        
        var size = 7;
        var index = 0;
        $('#navbar li a:eq(2)').attr('data-index', 0);
        var data = {
            "type": type,
            "id":  id,
            "size": size,
            "index": index,
            "startTime": "1900-01-01 00:00:00",
            "endTime": "2900-01-01 00:00:00"
        }
        setDeviceStatus();
        clearInterval(intervalIds.getAllPics);
        clearInterval(intervalIds.findDevicePic);
        getNextPage(data);
        intervalIds.findDevicePic = setInterval(function() {getNextPage(data);}, 20000);
    }) // end of nodeSelected event
}

function mapDevice(data){
    $.ajax({
        url:'/v1/device/map/range',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                map.clearOverlays();
                var list = data.result.list;
                var data_info = [];
                var contentTemplte =
                "<h5 style='margin:0 0 5px 0;padding:0.2em 0'>名字</h5>" + 
                "<img style='float:right;margin:4px' id='imgDemo' src='图片' width='139' height='104' title='告警图片'/>" + 
                "<p style='margin:0;line-height:1.5;font-size:13px'>电压</p>" + 
                "<p style='margin:0;line-height:1.5;font-size:13px'>充电电压</p>" + 
                "<p style='margin:0;line-height:1.5;font-size:13px'>温度</p>" + 
                "<p style='margin:0;line-height:1.5;font-size:13px'>警报</p>" + 
                "</div>"; 
                var contents = [];
                for (var i = 0; i < list.length; ++i) {
                    data_info[i] = {}
                    data_info[i].id = list[i].id;
                    data_info[i].name = list[i].name;
                    data_info[i].latitude = list[i].latitude;
                    data_info[i].longitude = list[i].longitude;
                    data_info[i].batteryVoltage = list[i].batteryVoltage;
                    data_info[i].chargeVoltage = list[i].chargeVoltage;
                    data_info[i].temperature = list[i].temperature;
                    data_info[i].alert = list[i].alert;
                    data_info[i].alertId = list[i].alertId;
                    contents[i] = contentTemplte;
                    contents[i] = contents[i].replace('名字', list[i].name);
                    contents[i] = contents[i].replace('电压', '电压:'+list[i].batteryVoltage);
                    contents[i] = contents[i].replace('充电电压', '充电电压:'+list[i].chargeVoltage);
                    contents[i] = contents[i].replace('温度', '温度:'+list[i].temperature);
                    contents[i] = contents[i].replace('警报', '警报:'+list[i].alert);
                }

                var points = [];
                for(var i=0;i<data_info.length;i++){
                    var iconImg = createIcon(colorIcons.red);
                    points.push(new BMap.Point(data_info[i].longitude,data_info[i].latitude));
                    var marker = new BMap.Marker(new BMap.Point(data_info[i].longitude,data_info[i].latitude),{icon:iconImg});  // 创建标注
                    var label = new BMap.Label(data_info[i].name,{"offset":new BMap.Size(colorIcons.red.lb-colorIcons.red.x+10,-20)});
                            
                    map.addOverlay(marker);               // 将标注添加到地图中
                    marker.setLabel(label);
                    label.setStyle({
                        borderColor:"#808080",
                        color:"#333",
                        cursor:"pointer",
                        borderWidth:'0px',
                        backgroundColor : 'transparent'
                    }); 
                    addClickHandler(contents[i],marker);
                }
                map.setViewport(points);　　　　　　　　
            } else {
                alert('获取设备(组)' + data.id + '失败');
            }
        }
    });
}

function setTreeNodeSelectedMap() {
    $('#tree').data().treeview.options.multiSelect=true;
    $('#tree').unbind('nodeSelected');

    $('#tree').on('nodeSelected nodeUnselected', function(event, data) {
        var newData = {};

        newData.deviceIds = [];
        newData.id = [];

        var selectedDevices = $('#tree').treeview('getSelected');
        newData.type = 0;
        for (var i = 0; i < selectedDevices.length; ++i) {
            if (selectedDevices[i].type == 3) {
                newData.deviceIds.push(selectedDevices[i].id);
            }else if ($('#tabTree li').filter('.active').text() == '设备列表') {
                newData.type = 1;
                newData.id.push(selectedDevices[i].id);                           
            } else if ($('#tabTree li').filter('.active').text() == '设备分组'){
                newData.type = 2;
                newData.id.push(selectedDevices[i].id); 
            }
        }
        mapDevice(newData);
    }) 
}

function initialize() {
    $('#main img').hide(); //隐藏图片
    $('#menu3ul p').text(''); //隐藏设备状态
    $('#main h5').text(''); //隐藏图片说明
}

function getNextPage(data) {
    $('#main h5').hide();
    $('#main img').attr('src','black.jpg');
    $("#setRef").hide();
    // clearInterval(intervalIds.findDevicePic);
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
                    $('#nextPage').hide();
                else
                    $('#nextPage').show();

                $('#navbar li a:eq(2)').attr('data-index', outerData.index);
                $('#navbar li a:eq(2)').attr('data-deviceId', outerData.id);
                $('#navbar li a:eq(2)').attr('if-all', 0);

                if($('#navbar li a:eq(2)').attr('data-index') > 0){
                    $('#lastPage').show();
                }else{
                    $('#lastPage').hide();
                }

                var dates = $('.modal-body input').val().split(' - ');
                var list = data.result.list;
                // $('#main img').emtpy();

                for (var i = 0; i < list.length; ++i) {
                    $("#setRef").show();
                    if (list[i].picType == 2){
                            // for ref pic
                    }else{
                        if (list[i].picType == 1){
                            var name = list[i].name;
                            var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                            $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 告警图片:"+timeName);
                        }else{
                            var name = list[i].name;
                            var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                            $('#main h5:eq(' + i + ')').text(list[i].channelNo+"号摄像头 原始图片:"+timeName);
                        }
                        $('#main img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                        $('#main img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#main img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        if(i>0){
                           $('#main img:eq(' + i + ')').prev().text('拍照时间：'+ list[i].time.slice(11,19)); 
                        }else{
                            $('#main img:eq(' + i + ')').prev().text('拍照时间：'+ list[i].time);
                        }
                        
                        jQuery($($('#main img:eq(' + i + ')'))).imageMagnify({
                            magnifyby: 3
                        })
                        thum2pic[list[i].thumbnailPicUrl] =  list[i].picUrl;
                        // $('#main img:eq(' + i + ')').rotate(90);
                        // $('#main img:eq(' + i + ')').attr('width','100%');
                        // $('#main img:eq(' + i + ')').attr('height','180px');
                        $('#main img:eq(' + i + ')').show();
                        $('#main h5:eq(' + i + ')').show();
                    }
                    
                }
                $('#main img').show();
                for (var i = 0; i < list.length; ++i) {
                    $('img.magnify:eq(' + (i + 4) + ')').attr('src', list[i].picUrl);
                }
            } else {
                $('#pics img').empty();
                $('#main h5').empty();
                var level = $('#tree').treeview('getSelected')[0].level;
                if(level > 3)
                    alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '查询图片失败');
                console.log(data);
            }
        }
    })// end of ajax   
}

function getAllPics(data) {
    $('#main h5').hide();
    $('#main img').hide();
    $("#setRef").hide();
    // clearInterval(intervalIds.findDevicePic);
    var outerData = data;
    $.ajax({
        url:'/v1/search/pics/all',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                if (Math.ceil(data.result.total / outerData.size) <= outerData.index + 1)
                    $('#nextPage').hide();
                else
                    $('#nextPage').show();

                $('#navbar li a:eq(2)').attr('data-index', outerData.index);
                $('#navbar li a:eq(2)').attr('if-all', 1);
                // $('#navbar li a:eq(2)').attr('data-deviceId', outerData.id);

                if($('#navbar li a:eq(2)').attr('data-index')>0){
                    $('#lastPage').show();
                }else{
                    $('#lastPage').hide();
                }

                var dates = $('.modal-body input').val().split(' - ');
                var list = data.result.list;
                // $('#main img').emtpy();

                for (var i = 0; i < list.length; ++i) {
                    if (list[i].picType == 2){
                            // for ref pic
                    }else{
                        if (list[i].picType == 1){
                            var name = list[i].name;
                            var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                            $('#main h5:eq(' + i + ')').text(list[i].deviceId+"_"+list[i].channelNo+" 告警:"+timeName);
                        }else{
                            var name = list[i].name;
                            var timeName = name.slice(18,22)+'-'+name.slice(22,24)+'-'+name.slice(24,26)+"\t"+name.slice(26,28)+":"+name.slice(28,30)+":"+name.slice(30,32);
                            $('#main h5:eq(' + i + ')').text(list[i].deviceId+"_"+list[i].channelNo+"号 原图:"+timeName);
                        }
                        $('#main img:eq(' + i + ')').attr('src', list[i].thumbnailPicUrl);
                        $('#main img:eq(' + i + ')').attr('picId', list[i].picId);
                        $('#main img:eq(' + i + ')').attr('channelNo', list[i].channelNo);
                        jQuery($($('#main img:eq(' + i + ')'))).imageMagnify({
                            magnifyby: 3
                        })
                        thum2pic[list[i].thumbnailPicUrl] =  list[i].picUrl;
                        // $('#main img:eq(' + i + ')').rotate(90);
                        $('#main img:eq(' + i + ')').show();
                        $('#main h5:eq(' + i + ')').show();
                    }
                    
                }
                for (var i = 0; i < list.length; ++i) {
                    $('img.magnify:eq(' + (i + 4) + ')').attr('src', list[i].picUrl);
                }
            } else {
                $('#main img').emtpy();
                $('#main h5').empty();
                var level = $('#tree').treeview('getSelected')[0].level;
                if(level > 3)
                    alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '查询图片失败');
                console.log(data);
            }
        }
    })// end of ajax   
}

function getSelectedPic() {
    if($('#main img.selected').length == 0) {
        return -1;
    } else {
        return $('#main img.selected').attr('picId');
    }
}

function getSelectedPicChannelNo() {
    if($('#main img.selected').length == 0) {
        return -1;
    } else {
        return $('#main img.selected').attr('channelNo');
    }
}

var intervalIds = {};
function getHeartBeatRecords(index) {
    clearInterval(intervalIds.alertRecords);
    clearInterval(intervalIds.videoRecords);
    clearInterval(intervalIds.heartLoseRecords);
    //clearInterval(intervalIds.heartBeatRecords);

    index = index || 0;
    var data = {
        "index": index,
        "size": 5,
    }
    $('#records table thead th').text('');
    $('#records table td').text('\xa0')


    $('#records table thead th:eq(0)').text('设备名');
    $('#records table thead th:eq(1)').text('电压');
    $('#records table thead th:eq(2)').text('充电电压');
    $('#records table thead th:eq(3)').text('温度');
    $('#records table thead th:eq(4)').text('警告');
    $('#records table thead th:eq(5)').text('时间');
    $.ajax({
        url:'/v1/query/device/heartbeat/logs',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                $('#recordsTab li:eq(0)').attr('index', index + 1);
                var list = data.result.list;
                for (var i = 0; i < list.length; ++i) {
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('deviceId', list[i].deviceId);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').text(list[i].deviceName);
                    $('#records table tbody tr:eq(' + i + ') td:eq(1)').text(list[i].batteryVoltage);
                    $('#records table tbody tr:eq(' + i + ') td:eq(2)').text(list[i].chargeVoltage);
                    $('#records table tbody tr:eq(' + i + ') td:eq(3)').text(list[i].temperature);
                    $('#records table tbody tr:eq(' + i + ') td:eq(4)').text(list[i].alert);
                    $('#records table tbody tr:eq(' + i + ') td:eq(5)').text(list[i].time);
                }
                if (data.result.more <= 0) {
                    $('#records button').css('visibility', 'hidden');

                    //$('#records button').hide();
                } else {
                    $('#records button').css('visibility', 'visible');

                    //$('#records button').show();
                }
            } else if (data.code == 4007){
                $('#records button').hide();
                alert('获取设备心跳记录为空');
            } else {
                alert('获取设备心跳记录失败');
            }
        }
    }); // end of /v1/query/device/heartbeat/logs ajax
}


function getAlertRecords(index) {
    //clearInterval(intervalIds.alertRecords);
    clearInterval(intervalIds.videoRecords);
    clearInterval(intervalIds.heartLoseRecords);
    clearInterval(intervalIds.heartBeatRecords);


    index = index || 0;

    var data = {
        "index": index,
        "size": 5,
    }
    $('#records table thead th').text('');
    $('#records table td').text('\xa0');


    $('#records table thead th:eq(0)').text('设备名');
    $('#records table thead th:eq(1)').text('报警类型');
    $('#records table thead th:eq(2)').text('时间');
    $('#records table thead th:eq(3)').text('处理时间');
    $('#records table thead th:eq(4)').text('处理状态');
    $('#records table thead th:eq(5)').text('报警信息');
    $.ajax({
        url:'/v1/query/device/alert/logs',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {                
                $('#recordsTab li:eq(0)').attr('index', index);

                if($('#recordsTab li:eq(0)').attr('index') == 0){
                    $('#recordLastPage').css('visibility', 'hidden');
                }else{
                    $('#recordLastPage').css('visibility', 'visible');
                }

                var list = data.result.list;
                for (var i = 0; i < list.length; ++i) {
                	var type = '';
                	var status = '';
                	switch(list[i].alertType){
                		case 0:
                			type = "工况告警";
                			break;
                		case 1: 
                			type = "图片告警";
                			break;
                		default:
                			break;
                	}

	                switch(list[i].processStatus){
	                    case 0:
	                    	status = "未推送";
	                    	break;
	                    case 1:
	                    	status = "已推送";
	                    	break;
	                    case 2:
	                    	status = "已消警";
	                    	break;
	                    case 3:
	                    	status = "已确认为真告警";
	                    	break;
	                    case 4:
	                    	status = "已确认为假告警";
	                    	break;
	                    default:
	                    	break;
	                }
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('deviceId', list[i].deviceId);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('alertId', list[i].alertId);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').text(list[i].deviceName);
                    $('#records table tbody tr:eq(' + i + ') td:eq(1)').text(type);
                    $('#records table tbody tr:eq(' + i + ') td:eq(2)').text(list[i].time);
                    $('#records table tbody tr:eq(' + i + ') td:eq(3)').text(list[i].processTime);
                    $('#records table tbody tr:eq(' + i + ') td:eq(4)').text(status);
                    $('#records table tbody tr:eq(' + i + ') td:eq(5)').text(list[i].alertMessage);
                }

                $('#recordCount').text('第'+(index+1)+'页，共'+data.result.total+'页')
                if (data.result.more <= 0) {
                    //$('#records button').hide();
                    $('#recordNextPage').css('visibility', 'hidden');

                } else {
                    $('#recordNextPage').css('visibility', 'visible');

                    //$('#recordNextPage').show();
                }
            } else if (data.code == 4007){
                $('#recordNextPage').hide();

                alert('获取设备告警记录为空');

            } else {
                alert('获取设备告警记录失败');
            }
        }
    }); // end of /v1/query/device/alert/logs ajax
}

function getVideoRecords(index) {
    clearInterval(intervalIds.alertRecords);
    //clearInterval(intervalIds.videoRecords);
    clearInterval(intervalIds.heartLoseRecords);
    clearInterval(intervalIds.heartBeatRecords);

    index = index || 0;

    var data = {
        "index": index,
        "size": 5,
    }
    $('#records table thead th').text('');
    $('#records table td').text('\xa0');

    $('#records table thead th:eq(0)').text('设备名 摄像头');
    $('#records table thead th:eq(1)').text('对比图');
    $('#records table thead th:eq(2)').text('原图');
    $('#records table thead th:eq(3)').text('告警图');
    $('#records table thead th:eq(4)').text('状态');
    $('#records table thead th:eq(5)').text('服务器');
    $('#records table thead th:eq(6)').text('更新时间');


    $.ajax({
        url:'/v1/query/videoserver/logs',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {
                $('#recordsTab li:eq(1)').attr('index', index);

                if($('#recordsTab li:eq(1)').attr('index') == 0){
                    $('#recordLastPage').css('visibility', 'hidden');
                }else{
                    $('#recordLastPage').css('visibility', 'visible');
                }
                
                var list = data.result.list;
                for (var i = 0; i < list.length; ++i) {
                	var status = '';
                	switch(list[i].status){
                		case 0:
                			status = "未开始";
                			break;
                		case 1: 
                			status = "处理中";
                			break;
                		case 2:
                			status = "已处理";
                			break;
                		default:
                			break;
                	}

                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('id', list[i].id);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('originalPicId', list[i].originalPicId);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('alertId', list[i].alertId);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('processPicId', list[i].processPicId);
                    
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').text(list[i].deviceId + " " + list[i].channelNo + "号");
                    $('#records table tbody tr:eq(' + i + ') td:eq(1)').text(list[i].refPicName);
                    $('#records table tbody tr:eq(' + i + ') td:eq(2)').text(list[i].originalPicName);
                    $('#records table tbody tr:eq(' + i + ') td:eq(3)').text(list[i].processedPicName);
                    $('#records table tbody tr:eq(' + i + ') td:eq(4)').text(status);
                    $('#records table tbody tr:eq(' + i + ') td:eq(5)').text(list[i].processServer);
                    $('#records table tbody tr:eq(' + i + ') td:eq(6)').text(list[i].endTimeStr);
                }
                $('#recordCount').text('第'+(index+1)+'页，共'+data.result.total+'页')
                if (data.result.more <= 0) {
                    $('#recordNextPage').css('visibility', 'hidden');
                    //$('#records button').hide();
                } else {
                    $('#recordNextPage').css('visibility', 'visible');
                    //$('#records button').show();
                }
            } else if (data.code == 4007){
                $('#recordNextPage').hide();

                alert('获取视频服务器工作记录为空');
            } else {
                alert('获取视频服务器工作记录失败');
            }
        }
    }); // end of /v1/query/videoserver/logs ajax

        
}

function getHeartBeatLoseRecords(index) {
    clearInterval(intervalIds.alertRecords);
    clearInterval(intervalIds.videoRecords);
    //clearInterval(intervalIds.heartLoseRecords);
    clearInterval(intervalIds.heartBeatRecords);

    index = index || 0;
    var data = {
        "index": index,
        "size": 5,
    }
    $('#records table thead th').text('');
    $('#records table td').text('\xa0')

    $('#records table thead th:eq(0)').text('设备名');
    $('#records table thead th:eq(1)').text('时间');
    $.ajax({
        url:'/v1/query/device/heartbeatlose/logs',
        type:"GET",
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        async:false,
        success: function(data){
            if (data.code == 0) {

                $('#recordsTab li:eq(0)').attr('index', index + 1);
                var list = data.result.list;
                for (var i = 0; i < list.length; ++i) {
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').attr('deviceId', list[i].deviceId);
                    $('#records table tbody tr:eq(' + i + ') td:eq(0)').text(list[i].deviceName);
                    $('#records table tbody tr:eq(' + i + ') td:eq(1)').text(list[i].time);
                }
                if (data.result.more <= 0) {
                    //$('#records button').hide();
                    $('#records button').css('visibility', 'hidden');

                } else {
                    $('#records button').css('visibility', 'visible');

                    //$('#records button').show();
                }
            } else if (data.code == 4007) {
                $('#records button').hide();

                alert('获取设备心跳失联记录为空');
            } else {
                alert('获取设备心跳失联记录失败');
            }
        }
    }); // end of /v1/query/device/heartbeatlose/logs ajax
}

function setDeviceStatus() {
    var deviceId = getSelectedDevice();
    if (deviceId == -1) {
        alert('请选择设备');
        return;
    }
    var data = {
        'deviceId': deviceId
    }
    $.ajax({
        url:'/v1/device/klViewStatus',
        type:"POST",
        data: JSON.stringify(data),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data){
            if (data.code == 0) {
                $('#menu3ul').css('backgroundColor', 'rgb(55,154,213)')
                $('#menu3ul p').text( '设备:' + $('#tree').treeview('getSelected')[0].name + ' ' + 
                                      '电池状态: ' + data.result.batteryVoltage + '  '+
                                     '充电状态: ' + data.result.chargeVoltage  + '  ' +
                                     '温度: ' + data.result.temperature + '  ' +
                                     '报警: ' + data.result.alert)
            } else {
                alert('查看设备' + $('#tree').treeview('getSelected')[0].name + '状态失败');
                console.log(data);
            }
        }
    });
}

// MAP

var opts = {
		width : 250,     // 信息窗口宽度
		height: 150,     // 信息窗口高度
		title : "" , // 信息窗口标题
		enableMessage:true//设置允许信息窗发送短息
};

var colorIcons = {green:{w:21,h:21,l:0,t:0,x:6,lb:5},red:{w:21,h:21,l:46,t:0,x:6,lb:5}}; 


function createIcon(json){
    var icon = new BMap.Icon("http://app.baidu.com/map/images/us_mk_icon.png", new BMap.Size(json.w,json.h),{imageOffset: new BMap.Size(-json.l,-json.t),infoWindowOffset:new BMap.Size(json.lb+5,1),offset:new BMap.Size(json.x,json.h)})
    return icon;
}

//创建和初始化地图函数：
function initMap(){
    createMap();//创建地图
    setMapEvent();//设置地图事件
    addMapControl();//向地图添加控件
}

//创建地图函数：
function createMap(){
    var map = new BMap.Map("map");//在百度地图容器中创建一个地图
    var point = new BMap.Point(121.440386,31.205185);//定义一个中心点坐标
    map.centerAndZoom(point,18);//设定地图的中心点和坐标并将地图显示在地图容器中
    window.map = map;//将map变量存储在全局
}
//地图事件设置函数：
function setMapEvent(){
    map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
    map.enableScrollWheelZoom();//启用地图滚轮放大缩小
    map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
    map.enableKeyboard();//启用键盘上下左右键移动地图
}

function addClickHandler(content,marker){
		marker.addEventListener("click",function(e){
			  openInfo(content,e)}
		                       );
}


function openInfo(content,e){
		var p = e.target;
		var point = new BMap.Point(p.point.lng, p.point.lat);
		var infoWindow = new BMap.InfoWindow(content,opts);  // 创建信息窗口对象 
		map.openInfoWindow(infoWindow,point); //开启信息窗口
} 
//地图控件添加函数：
function addMapControl(){
    //向地图中添加缩放控件
	  var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
	  map.addControl(ctrl_nav);
    //向地图中添加缩略图控件
	  var ctrl_ove = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1});
	  map.addControl(ctrl_ove);
    //向地图中添加比例尺控件
	  var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
	  map.addControl(ctrl_sca);

    
}


$(function() {
    if((Cookies.get("sessionId")== null) || (Cookies.get("sessionId")== "")){
        $('body').hide();
        window.location.href = 'login';
    }else{
        
        if(Cookies.get("userType")== 0){
            //reserve
            $('.container-fluid div:eq(3) a:eq(0)').attr('href','/general_user');
        }
        $('body').show();
    }

	var index = 0;
	var size = 4;
	var data = {
		"index" : index,
		"size" : size
	};
	getAllPics(data);
	if(getSelectedDevice() == -1){
		intervalIds.getAllPics = setInterval(function() {getAllPics(data);}, 20000);
	}
	
    $('#menu1ul li a:eq(2)').click(function(){
        var deviceId = getSelectedDevice();
        if (deviceId == -1) {
            alert('请选择一个设备');
        }

        var data = {
            "deviceId": deviceId
        };
        $.ajax({
            url:'/v1/device/klTriggerPhoto',
            type:"POST",
            data: JSON.stringify(data),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function(data){
                if (data.code == 0){
                    alert($('#tree').treeview('getSelected')[0].name + '拍照成功');
                } else {
                    alert($('#tree').treeview('getSelected')[0].name + '拍照失败');
                    console.log(data);
                }
            }
        })// end of ajax
    })// end of click


    // 分析图片
    $('#menu1ul li a:eq(3)').click(function(){
        var deviceId = getSelectedDevice();
        if (deviceId == -1) {
            alert('请选择一个设备');
        }
        var picId = getSelectedPic();
        var channelNo = $('#main img.selected').attr('channelNo');
        if (picId == -1) {
            alert('请选择图片');
        }else{
            var data = {
                "deviceId": deviceId,
                "picId": picId,
                "channelNo": channelNo
            };
            $.ajax({
                url:'/v1/device/klSetAnalysis',
                type:"POST",
                data: JSON.stringify(data),
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                success: function(data){
                    if (data.code == 0){
                        alert($('#tree').treeview('getSelected')[0].name + '图片开始分析,分析结果稍后自动刷新显示');
                        var processId = data.result.id;
                        var data = {
                            'processId' : processId,
                            'status' : 2
                        };
                        // setTimeout(function(){
                        //     $.ajax({
                        //         url:'/v1/search/pics/processStatus',
                        //         type:"POST",
                        //         data: JSON.stringify(data),
                        //         contentType:"application/json; charset=utf-8",
                        //         dataType:"json",
                        //         success: function(data){
                        //             if(data.code == 0){
                        //                 alert(data.result.processedPicId);
                        //                 $('#pic3').show();
                        //                 $('#pic3 img').attr('src','http://139.196.202.6:9090/thumbnail/'+data.result.processedPicPath);
                        //                 alert($('#tree').treeview('getSelected')[0].name + '图片分析成功');
                        //             }else{
                        //                 alert($('#tree').treeview('getSelected')[0].name + '图片分析失败');
                        //             }
                        //         }
                        //     });
                        // },60000);
                    } else {
                        alert($('#tree').treeview('getSelected')[0].name + '图片无法开始分析');
                        console.log(data);
                    }
                }
            })
        }
    })// end of click

    // set selected imgs
    $('#main img').click(function(){
        $('#main img.selected').removeClass('selected'); // removes the previous selected class
        $(this).addClass('selected'); // adds the class to the clicked image
        var src = $('img.selected:eq(0)').attr('src')
         $('img.magnify').each(function(index, val){
             if (index >= 4)  {
                 if ($(val).attr('src') == src) {
                    $(val).attr('src', thum2pic[src]);
                 }
             }
         })
    });

    // function deviceTree() {
    //     var userId = Cookies.get('userId');
    //     var data = {
    //         "userId": userId
    //     };
    //     var rootNode = [];
    //     $.ajax({
    //         url:'/v1/device/tree',
    //         type:"POST",
    //         data: JSON.stringify(data),
    //         contentType:"application/json; charset=utf-8",
    //         dataType:"json",
    //         async:false,
    //         success: function(data){
    //             if (data.code == 0) {
    //                 var devices = data.result.data;
    //                 var tmp = [devices[0].parent[0]];
    //                 for (var i = 1; i < devices.length; i++) {
    //                     if (devices[i].parent[0].id !== tmp[tmp.length - 1].id) {
    //                         tmp.push(devices[i].parent[0]);
    //                     }
    //                 }
    //                 for(var i=0;i<tmp.length;i++){
    //                     rootNode[i] = {
    //                         'id': tmp[i].id,
    //                         'text': tmp[i].name,
    //                     };
    //                 }

    //                 var nodes = rootNode.slice();
    //                 while(nodes.length){
    //                     var node = nodes.pop();
    //                     node.nodes = [];
    //                     for(var i=0;i<devices.length;i++){
    //                         if(devices[i].parent[0].id == node.id){
    //                             node.nodes.push(devices[i].parent[1]); 
    //                         }
    //                     }

    //                     for(var i=0;i<node.nodes.length;i++){
    //                         node.nodes[i].text = node.nodes[i].name;
    //                         node.nodes[i].id = node.nodes[i].id;
    //                     }

    //                     nodes = nodes.concat(node.nodes);
    //                 }


    //             } else {
    //                 alert('获取设备树失败');
    //             }
    //         }
    //     })
    //     return rootNode;
    // }

    function deviceTree() {
        var userId = Cookies.get('userId');
        var data = {
            "userId": userId
        };
        var rootNode = [];
        $.ajax({
            url:'/v1/device/tree2',
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

    // only get root device
    function getTmpTree() {
        // Some logic to retrieve, or generate tree structure
        if(this.deviceListTreeData != undefined) return this.deviceListTreeData;

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
                    alert('获取根设备失败');
                    console.log(data);
                }
            }
        }) // end of ajax
        return rootNode;
    }

    function getTree() {
        // Some logic to retrieve, or generate tree structure
        if(this.deviceListTreeData != undefined) return this.deviceListTreeData;

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
                    alert("获取根设备失败");
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
                                        alert('获取设备列表失败');
                                        console.log(data);
                                    }
                                }
                            }); // end of ajax
                        }
                    } else {
                        alert("获取设备子层级失败");
                        console.log(data);
                    }
                }
            })// end of ajax    
        }
        
        var trees = rootNode;
        // get static device tree
        // var tree = [
        //     {
        //         text: "远东输电线",
        //         nodes: [
        //             {
        //                 text: "宁远塔",
                        
        //             },
        //             {
        //                 text: "启东塔"
        //             },
        //             {
        //                 text: "上海塔"
        //             }
        //         ],
        //         deviceId: '1'
        //     },
        //     {
        //         text: "泸宁主线",
        //         nodes: [
        //             {
        //                 text: "金山塔",
                        
        //             },
        //             {
        //                 text: "闵行塔"
        //             },
        //             {
        //                 text: "XX塔"
        //             }
        //         ]
        //     },
        //     {
        //         text: "XX 线"
        //     },
        // ];
        this.deviceListTreeData = trees;
        return trees;
        
    }

    function getTreeByGroups() {
        if (this.deviceGroupTreeData != undefined) return this.deviceGroupTreeData;
        
        // Some logic to retrieve, or generate tree structure
        var data = {
            
        }
        var rootNode = [];
        $.ajax({
            url:'/v1/device/allgroups',
            type:"GET",
            data: data,
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            async:false,
            success: function(data){
                if (data.code == 0) {
                    rootNode = data.result.list;
                    for (var i = 0; i < rootNode.length; ++i) {
                        rootNode[i].text = rootNode[i].name;
                        $.ajax({
                            url:'/v1/device/group/listmembers',
                            type:"GET",
                            data: {'id':rootNode[i].id},
                            contentType:"application/json; charset=utf-8",
                            dataType:"json",
                            async:false,
                            success: function(data){
                                if (data.code == 0) {
                                    rootNode[i].nodes = data.result.list;
                                    for (var j = 0; j < rootNode[i].nodes.length; ++j) {
                                        rootNode[i].nodes[j].text = rootNode[i].nodes[j].name
                                        rootNode[i].nodes[j].type = 3;

                                    }
                                } else {
                                    alert('获取设备分组' + rootNode[i].text + '成员失败');
                                    console.log(data);
                                }
                            }
                        }) // end of ajax '/v1/device/group/listmembers'
                    }
                } else {
                    alert("获取设备所有分组失败");
                    console.log(data);
                }
            }
        })// end of ajax

        var trees = rootNode;
        this.deviceGroupTreeData = trees;
        return trees;
    }

// ---first show root, then child
    // var tmpData = getTmpTree();
    // $('#tree').treeview({data: tmpData});
    // setTreeNodeSelected();
    // setTimeout(function(){
    //     $('#tree').treeview({data: getTree()});
    //     setTreeNodeSelected();
    // }, 10);

    var tmpData = deviceTree();
    $('#tree').treeview({data: tmpData});
    setTreeNodeSelected();
    // setTimeout(function(){
    //     $('#tree2').treeview({data: getTree()});
    //     setTreeNodeSelected();
    // }, 10);
    
    // set daterangepicker 选择日期模态框
    $('input[name="daterange"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: false,
        autoApply: false,
        locale: {
            cancelLabel: '清除',
            applyLabel: '确定',
            format: 'YYYY-MM-DD',
            "daysOfWeek": [
                "周日",
                "周一",
                "周二",
                "周三",
                "周四",
                "周五",
                "周六"
                
            ],
            "monthNames": [
                "一月",
                "二月",
                "三月",
                "四月",
                "五月",
                "六月",
                "七月",
                "八月",
                "九月",
                "十月",
                "十一月",
                "十二月"
                
            ],
            "firstDay": 1,
        },
    });
    $('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD'));
    
    });

    $('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });
   
    //按日期查询设备图片 模态框
    // $('#myModal .modal-footer  .btn-primary').click(function(){
    //     var deviceId = getSelectedDevice();
    //     if (deviceId == -1) {
    //         alert('请选择一个设备');
    //         return;
    //     }
    //     var size = 4;
    //     var index = 0;
    //     var type = 0;
    //     $('#navbar li a:eq(2)').attr('data-index', 0);
    //     var startTime = $('.modal-body input:eq(0)').val();
    //     var endTime =  $('.modal-body input:eq(1)').val();
    //     var data = {
    //         "id":  deviceId,
    //         "size": size,
    //         "index": index,
    //         "type": type,
    //     }
    //     if (startTime != '')
    //         data.startTime = startTime;
    //     if (endTime != '')
    //         data.endTime = endTime;
    //     getNextPage(data);
    // });

    //按日期查询设备图片 首页
    $('#dateSearchSubmit').click(function(){
        var deviceId = getSelectedDevice();
        if (deviceId == -1) {
            alert('请选择一个设备');
            return;
        }
        var size = 7;
        var index = 0;
        var type = 0;
        $('#navbar li a:eq(2)').attr('data-index', 0);
        var startTime = $('#dateSearch input:eq(0)').val();
        var endTime =  $('#dateSearch input:eq(1)').val();
        var data = {
            "id":  deviceId,
            "size": size,
            "index": index,
            "type": type,
        }
        if (startTime != '')
            data.startTime = startTime;
        if (endTime != '')
            data.endTime = endTime;
        getNextPage(data);
    });

// 图片列表上一页
    $('#lastPage').click(function(){
        if($('#navbar li a:eq(2)').attr('if-all') == 1){
            var index = parseInt($('#navbar li a:eq(2)').attr('data-index'));
            var size = 4;
            var data = {
                "index" : index-1,
                "size" : size
            };
            getAllPics(data);
        }else{
            var id = $('#navbar li a:eq(2)').attr('data-deviceId');
            var size = 4;
            var index = parseInt($('#navbar li a:eq(2)').attr('data-index'));
            var dates = $('.modal-body input').val().split(' - ');
            var type = 0;
            var data = {
                "id":  id,
                "size": size,
                "type": type,
                "index": index-1,
                "startTime": dates[0],
                "endTime": dates[1]
            }
            getNextPage(data);
        }
        
    });

// 图片列表下一页
    $('#nextPage').click(function(){
    	if($('#navbar li a:eq(2)').attr('if-all') == 1){
    		var index = parseInt($('#navbar li a:eq(2)').attr('data-index'));
    		var size = 4;
    		var data = {
    			"index" : index+1,
    			"size" : size
    		};
    		getAllPics(data);
    	}else{
    		var id = $('#navbar li a:eq(2)').attr('data-deviceId');
	        var size = 4;
	        var index = parseInt($('#navbar li a:eq(2)').attr('data-index'));
	        var dates = $('.modal-body input').val().split(' - ');
	        var type = 0;
	        var data = {
	            "id":  id,
	            "size": size,
	            "type": type,
	            "index": index+1,
	            "startTime": dates[0],
	            "endTime": dates[1]
	        }
	        getNextPage(data);
    	}
        
    });

    $('#setRef').click(function(){
        var deviceId = getSelectedDevice();
        if (deviceId == -1) {
            alert('请选择一个设备');
        }
        var picId = getSelectedPic();
        var channelNo = $('#main img.selected').attr('channelNo');
        if (picId == -1) {
            alert('请选择图片');
        }else{
            var data = {
                "deviceId": deviceId,
                "picId": picId,
                "channelNo": channelNo
            };
            $.ajax({
                url:'/v1/picture/ref/set',
                type:"GET",
                data: data,
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                async:false,
                success: function(data){
                    if (data.code == 0) {
                        // todo session clear
                        alert('设置'+channelNo+'号摄像头对比图片成功！');
                    } else {
                        alert('设置对比图片失败！');
                    }
                }
            });
        }
    });


//用户登出
    $('#logout').click(function(){
        var userId = Cookies.get("userId");
        var data = {
            'userId': userId
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
                    Cookies.set("userId","");
                    Cookies.set("userName","");
                } else {
                    alert('用户登出失败');
                    console.log(data);
                }
            }
        });
    });

    $('#toggle-record').click(function(){
        if($('#toggle-record').text()=="隐藏实时记录"){
            $('#toggle-record').text('显示实时记录');
            $('#records').hide();
        }else{
            $('#toggle-record').text('隐藏实时记录');
            $('#records').show();
        }
    });

    $('#rotatePic').click(function(){
        if($('#pics div').hasClass('rot90')){
           $('#pics div').removeClass('rot90'); 
           $('#pics').attr('style',"margin-top: 20px");
        }else{
            $('#pics div').addClass('rot90');
            $('#pics').attr('style',"margin-top: 80px");
        }
    });

    
//配置
    // $('#menu1ul li a:eq(4)').click(function(){
    //     $('#configure').show();
    //     $('#configure2').show();
    //     $('#menu3ul').hide();
    //     $('#pic1').hide();
    //     $('#pic2').hide();
    //     $('#pic3').hide();
    //     $('#pic4').hide();

    //     $('#tree').unbind('nodeSelected');
    //     $('#tree').on('nodeSelected nodeUnselected', function(event, data) {
    //         var deviceId = getSelectedDevice();
    //         $('#editId').text(deviceId);

    //         $('#saveDevice').click(function(){
    //             var id = deviceId;
    //             var name = $('#editName').val();
    //             var nickName = $('#editNick').val();
    //             var latitude = $('#editLat').val();
    //             var longitude = $('#editLon').val();
    //             var beatInterval = $('#editBeat').val();
    //             var photoInterval = $('#editPho').val();
    //             var mac = $('#editMac').val();
    //             var batteryVoltageLow = $('#bVLow').val();
    //             var chargeVoltageLow = $('#cVLow').val();
    //             var temperatureLow = $('#tLow').val();
    //             var batteryVoltageHigh = $('#bVHigh').val();
    //             var chargeVoltageHigh = $('#cVHigh').val();
    //             var temperatureHigh = $('#tHigh').val();

    //             var data = {
    //                 'id' : id,
    //                 'name' : name,
    //                 'nickName' : nickName,
    //                 'latitude' : latitude,
    //                 'longitude' : longitude,
    //                 'beatInterval' : beatInterval,
    //                 'photoInterval' : photoInterval,
    //                 'mac' : mac,
    //                 'batteryVoltageLow' : batteryVoltageLow,
    //                 'chargeVoltageLow' : chargeVoltageLow,
    //                 'temperatureLow' : temperatureLow,
    //                 'batteryVoltageHigh' : batteryVoltageHigh,
    //                 'chargeVoltageHigh' : chargeVoltageHigh,
    //                 'temperatureHigh' : temperatureHigh
    //             };
                
    //             $.ajax({
    //                 url:'/v1/device/edit',
    //                 type:"POST",
    //                 data: JSON.stringify(data),
    //                 dataType : "json",
    //                 contentType:"application/json; charset=utf-8",
    //                 success:function(data){
    //                     if(data.code == 0){
    //                         alert("配置设备成功！");
    //                         //window.location.href('http://www.wirecheckon.com/viewDevice');
    //                     }else{
    //                         alert("配置设备失败！");
    //                     }
    //                 }
    //             });
    //         });
    //     });
    // });


    $('#menu1ul li a:eq(4)').click(function(){
        var deviceId = getSelectedDevice();
        if(deviceId != -1){
            var data = {'deviceId' :deviceId};
            $.ajax({
                url:'/v1/command/setdevice',
                type:"POST",
                data: JSON.stringify(data),
                dataType : "json",
                contentType:"application/json; charset=utf-8",
                success:function(data){
                    if(data.code == 0){
                        alert(deviceId + "发送配置命令成功！");
                            //window.location.href('http://www.wirecheckon.com/viewDevice');
                        }else{
                            alert(deviceId + "发送配置命令失败！");
                        }
                    }
                });
        }else{
            alert('请选择一个设备');
        }
    });

    // 地图
    $('#menu1ul li a:eq(5)').click(function(){
        if ($('#menu1ul li a:eq(5)').text() == '设备') {
            setTreeNodeSelected();
            $('#menu1ul li a:eq(5)').html('<span style="display: inherit;"><img src="map.png" style="width: 24px; height: 24px;"></span>地图');
            $('#tree').show();
            $('#main').show();
            $('#mapWrapper').hide();
            $('#menu3ul').show();
            $('#records').show();
        } else {
            $('#menu1ul li a:eq(5)').html('<span style="display: inherit;"><img src="map.png" style="width: 24px; height: 24px;"></span>设备');
            //$('#tree').hide();
            $('#main').hide();
            $('#menu3ul').hide()
            $('#records').hide();
            $('#mapWrapper').show();
            setTreeNodeSelectedMap();
            $('#mapInput button').unbind('click');
            $('#mapInput button').click(function() {
                var address = $('#mapInput input:eq(0)').val();
                var radius = $('#mapInput input:eq(1)').val();
                var url = 'http://api.map.baidu.com/geocoder/v2/?address=' + address
                    + '&output=json&ak=fr2k1GxnZbBxXalKYdcQUNBM';

                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    success: function(data) {
                        if (data.status ==  0) {
                            address = data.result.location;
                            var data = {
                                'latitude': parseFloat(address.lat),
                                'longitude': parseFloat(address.lng),
                                'radius': parseFloat(radius)
                            }
                            $.ajax({
                                url:'/v1/device/query/map2',
                                type:"GET",
                                data: data,
                                contentType:"application/json; charset=utf-8",
                                dataType:"json",
                                async:false,
                                success: function(data){
                                    if (data.code == 0) {
                                        map.clearOverlays();
                                        var list = data.result.list;
                                        var data_info = [];

                                        var contentTemplte =
	                                        "<h5 style='margin:0 0 5px 0;padding:0.2em 0'>名字</h5>" + 
                                            "<img style='float:right;margin:4px' id='imgDemo' src='图片' width='139' height='104' title='告警图片'/>" + 
                                            "<p style='margin:0;line-height:1.5;font-size:13px'>电压</p>" + 
                                            "<p style='margin:0;line-height:1.5;font-size:13px'>充电电压</p>" + 
                                            "<p style='margin:0;line-height:1.5;font-size:13px'>温度</p>" + 
                                            "<p style='margin:0;line-height:1.5;font-size:13px'>警报</p>" + 
                                            "</div>"; 
                                            var contents = [];
                                            for (var i = 0; i < list.length; ++i) {
                                                data_info[i] = {}
                                                data_info[i].id = list[i].id;
                                                data_info[i].name = list[i].name;
                                                data_info[i].latitude = list[i].latitude;
                                                data_info[i].longitude = list[i].longitude;
                                                data_info[i].batteryVoltage = list[i].batteryVoltage;
                                                data_info[i].chargeVoltage = list[i].chargeVoltage;
                                                data_info[i].temperature = list[i].temperature;
                                                data_info[i].alert = list[i].alert;
                                                data_info[i].alertId = list[i].alertId;
                                                contents[i] = contentTemplte;
                                                contents[i] = contents[i].replace('名字', list[i].name);
                                                contents[i] = contents[i].replace('电压', '电压:'+list[i].batteryVoltage);
                                                contents[i] = contents[i].replace('充电电压', '充电电压:'+list[i].chargeVoltage);
                                                contents[i] = contents[i].replace('温度', '温度:'+list[i].temperature);
                                                contents[i] = contents[i].replace('警报', '警报:'+list[i].alert);
                                            }
                                         　　
                                        var points = [];    　　　　
	                                      for(var i=0;i<data_info.length;i++){
                                            var iconImg = createIcon(colorIcons.red);
                                            points.push(new BMap.Point(data_info[i].longitude,data_info[i].latitude));
		                                        var marker = new BMap.Marker(new BMap.Point(data_info[i].longitude,data_info[i].latitude),{icon:iconImg});  // 创建标注
                                            var label = new BMap.Label(data_info[i].name,{"offset":new BMap.Size(colorIcons.red.lb-colorIcons.red.x+10,-20)});
		                                        
		                                    map.addOverlay(marker);               // 将标注添加到地图中
                                            marker.setLabel(label);
                                            label.setStyle({
                                                borderColor:"#808080",
                                                color:"#333",
                                                cursor:"pointer",
                                                borderWidth:'0px',
                                                backgroundColor : 'transparent'
                                            });
		                                        addClickHandler(contents[i],marker);
                                        }
                                        map.setViewport(points);　
                                    } else {
                                        alert('按地图获取设备列表失败');
                                        console.log(data);
                                    }
                                }
                            }) // end of ajax
                        } else {
                            alert('获取指定地址经纬度失败');
                            console.log(data);                           
                        }
                    }
                }) // end of ajax
            })
        }
    })

    //welcome words
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var dayOfWeek = myDate.getDay();
    var userName = Cookies.get('userName');
    var dayOfWeekName = ['日','一', '二','三','四', '五','六'];
    $('.container-fluid:eq(0) div:eq(2) a:eq(0)').text('欢迎您: ' + userName + ' 今天是' + year + '年' + month + '月' + day + '月' +
                                                 '   星期' +dayOfWeekName[dayOfWeek]);

    $('body').click(function(event){
        $('.img-responsive').each(function(){
            var $this=$(this);
            if ($this.css('display') == 'block' && $this.attr('data-num') != $(event.target).attr('data-num')) {
                var imageinfo=$this.data('$relatedtarget').data('imgshell')
			          jQuery.imageMagnify.refreshoffsets($(window), $this.data('$relatedtarget'), imageinfo) //refresh offset positions of original and warped images
			          $this.stop().animate({opacity:0, left:imageinfo.attrs.x, top:imageinfo.attrs.y, width:imageinfo.attrs.w, height:imageinfo.attrs.h},  500,function(){
				            $this.hide()
				            $this.data('$relatedtarget').css({opacity:1}) //reveal original image
			          }) //end animate
            }
        });
    });


    $('#tabTree li').click(function(){
        $('#tabTree li').removeClass()
        $(this).addClass('active');
        if ($(this).text() == '设备列表') {
            $('#tree').treeview({data: getTree()});
            if ($('#menu1ul li a:eq(5)').text() == '地图') {
                setTreeNodeSelected();
                // initialize();
            }else{
                setTreeNodeSelectedMap();
            }
            
        } else {
            $('#tree').treeview({data: getTreeByGroups()});
            if ($('#menu1ul li a:eq(5)').text() == '地图') {
                setTreeNodeSelected();
                // initialize();
            }else{
                setTreeNodeSelectedMap();
            }
        }
    });

    $('#recordsTab li:eq(0)').addClass('active');
    getAlertRecords(0);
    intervalIds.heartBeatRecords = setInterval(function() {getAlertRecords(0);}, 60000);
    $('#recordLastPage').click(function(){
        if($('#recordsTab li:eq(0)').hasClass('active')){
            var index = parseInt($('#recordsTab li:eq(0)').attr('index'));
            getAlertRecords(index-1);
        }else if($('#recordsTab li:eq(1)').hasClass('active')){
            var index = parseInt($('#recordsTab li:eq(1)').attr('index'));
            getVideoRecords(index-1);
        }
    });
    $('#recordNextPage').click(function(){
        if($('#recordsTab li:eq(0)').hasClass('active')){
            var index = parseInt($('#recordsTab li:eq(0)').attr('index'));
            getAlertRecords(index+1);
        }else if($('#recordsTab li:eq(1)').hasClass('active')){
            var index = parseInt($('#recordsTab li:eq(1)').attr('index'));
            getVideoRecords(index+1);
        }
    });

    $('#recordsTab li').click(function(){
        $('#recordsTab li').removeClass()
        $(this).addClass('active');
        if ($(this).text() == '设备心跳记录') {
            getHeartBeatRecords(0);
            intervalIds.heartBeatRecords = setInterval(function() {getHeartBeatRecords(0);}, 60000);
        } else if ($(this).text() == '设备失联记录') {
            getHeartBeatLoseRecords(0);
            intervalIds.heartLoseRecords = setInterval(function() {getHeartBeatLoseRecords(0);}, 60000);
        } else if ($(this).text() == '设备告警记录') {
            getAlertRecords(0);
            intervalIds.alertRecords = setInterval(function() {getAlertRecords(0);}, 60000);
        } else if ($(this).text() == '视频服务器工作记录') {
            getVideoRecords(0);
            intervalIds.videoRecords  = setInterval(function() {getVideoRecords(0);}, 60000);
        }
    });

    // 推送
    $('#menu1ul li:eq(6)').click(function(){
        var imgs = $('#main img').filter('.selected');
        if (imgs.length == 0) {
            alert('请选择图片');
            return;
        }
        //var deviceId = $('#navbar li a:eq(2)').attr('data-deviceId');
        var deviceId = $('#tree').treeview('getSelected')[0].id
        var data = {
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
                $('#pushModal .modal-body').empty();
                if (data.code == 0) {
                    var list = data.result.list;
                    for (var i = 0; i < list.length; ++i) {
                        var $ctrl =  $(document.createElement("input")).attr({
                            userId: list[i].userId
                            ,userName:  list[i].userName
                            ,value: list[i].userId
                            ,type:  'checkbox'
                            
                        })

                        var $lbl =  jQuery("<label>").text(list[i].userName);
                        $ctrl.prependTo($lbl);
                        $('#pushModal .modal-body').append($lbl);    
                    }
                } else {
                    alert('获取设备' + $('#tree').treeview('getSelected')[0].name + '失败');
                }
            }
        }) // end of ajax /v1/device/list/users
        $('#pushModal button:eq(2)').unbind('click');

        var picIds = [];
        
        for (var i = 0; i < imgs.length; ++i) {
            picIds.push({'picId':$(imgs[i]).attr('picid')});
        }

        $('#pushModal button:eq(2)').click(function(){
            var userIds = [];
            $('#pushModal input:checked').each(function() {
                userIds.push({'userId':$(this).attr('userid')});
            });
            var data = {
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
                        $('#pushModal .modal-body').empty();

                    } else {
                        alert('推送失败');
                    }
                }
            }); // end of ajax /v1/command/push/pics
        }); // end of click
    }); 

    //处理告警
    $('#menu1ul li:eq(7)').click(function(){
        var deviceId = getSelectedDevice();
        if (deviceId == -1) {
            alert('请选择一个设备');
            return ;
        } else {
            $('#dealModal').modal();
            var data = {
                "deviceId": deviceId
            }
            $.ajax({
                url:'/v1/alert/list',
                type:"GET",
                data: data,
                contentType:"application/json; charset=utf-8",
                dataType:"json",
                async:false,
                success: function(data){
                    if (data.code == 0){
                        var list = data.result.list;
                        if (list.length <= 0) return ;
                        // else if (list[0].deviceWorkAlert) {
                        //     $('#dealModal th:eq(6)').text('温度');
                        //     $('#dealModal th:eq(7)').text('电压');
                        //     $('#dealModal th:eq(8)').text('充电电压');
                        // } else {
                        //     $('#dealModal th:eq(6)').text('图片路径');
                        // }
                        var i = 0;
                        for (; i < list.length && i < 5; ++i) {

                        	var type = '';
		                	var status = '';
		                	switch(list[i].alertType){
		                		case 0:
		                			type = "工况告警";
		                			break;
		                		case 1: 
		                			type = "图片告警";
		                			break;
		                		default:
		                			break;
		                	}


			                switch(list[i].processStatus){
			                    case 0:
			                    	status = "未推送";
			                    	break;
			                    case 1:
			                    	status = "已推送";
			                    	break;
			                    case 2:
			                    	status = "已消警";
			                    	break;
			                    case 3:
			                    	status = "已确认为真告警";
			                    	break;
			                    case 4:
			                    	status = "已确认为假告警";
			                    	break;
			                    default:
			                    	break;
			                }
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(0)').attr('deviceId', list[i].deviceId);
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(0)').attr('alertId', list[i].id);
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(0)').text(list[i].deviceName);
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(1)').text(type);
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(2)').text(list[i].happenTimeStr);
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(3)').text(status);
                            if (list[i].processStatus in [2,3,4]){
                                $('#dealModal table tbody tr:eq(' + i + ') td:eq(4)').text(list[i].processTime);   
                            }  else {
                                $('#dealModal table tbody tr:eq(' + i + ') td:eq(4)').text();   
                            }
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(5)').text(list[i].alertMessage);
                            // if (list[0].deviceWorkAlert) {
                            //     $('#dealModal table tbody tr:eq(' + i + ') td:eq(6)').text(list[i].deviceWorkAlert.temperature);
                            //     $('#dealModal table tbody tr:eq(' + i + ') td:eq(7)').text(list[i].deviceWorkAlert.batteryVoltage);
                            //     $('#dealModal table tbody tr:eq(' + i + ') td:eq(8)').text(list[i].deviceWorkAlert.chargeVoltage);
                            // } else {
                            //     $('#dealModal table tbody tr:eq(' + i + ') td:eq(6)').text(list[i].picAlert.picUrl.slice(69));
                            // }
                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(9)').show();
                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(9)').unbind('click');
                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(9)').click(function(){
                            //     var userId = Cookies.get("userId");
                            //     var alertId =  $(this).parent().find('td:eq(0)').attr('alertid');
                            //     var confirm = 1;
                            //     var clear = 0;
                            //     var data = {
                            //         'userId'  : userId,
                            //         'alertId': alertId,
                            //         'confirm': confirm,
                            //         'clear': clear,
                            //     };
                            //     processAlert(data);
                            // });


                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(10)').show();
                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(10)').unbind('click');
                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(10)').click(function(){
                            //     var userId = Cookies.get("userId");
                            //     var alertId = $(this).parent().find('td:eq(0)').attr('alertid')
                            //     var confirm = 2;
                            //     var clear = 0;
                            //     var data = {
                            //         'userId'  : userId,
                            //         'alertId': alertId,
                            //         'confirm': confirm,
                            //         'clear': clear,
                            //     };
                            //     processAlert(data);
                            // });


                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(11)').show();
                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(11)').unbind('click');
                            // $('#dealModal table tbody tr:eq(' + i + ') td:eq(11)').click(function(){
                            //     var userId = Cookies.get("userId");
                            //     var alertId = $(this).parent().find('td:eq(0)').attr('alertid');
                            //     var confirm = 0;
                            //     var clear = 1;
                            //     var data = {
                            //         'userId'  : userId,
                            //         'alertId': alertId,
                            //         'confirm': confirm,
                            //         'clear': clear,
                            //     };
                            //     processAlert(data);
                            // });

                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(6)').show();
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(6)').unbind('click');
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(6)').click(function(){
                                var userId = Cookies.get("userId");
                                var alertId =  $(this).parent().find('td:eq(0)').attr('alertid');
                                var confirm = 1;
                                var clear = 0;
                                var data = {
                                    'userId'  : userId,
                                    'alertId': alertId,
                                    'confirm': confirm,
                                    'clear': clear,
                                };
                                processAlert(data);
                            });


                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(7)').show();
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(7)').unbind('click');
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(7)').click(function(){
                                var userId = Cookies.get("userId");
                                var alertId = $(this).parent().find('td:eq(0)').attr('alertid')
                                var confirm = 2;
                                var clear = 0;
                                var data = {
                                    'userId'  : userId,
                                    'alertId': alertId,
                                    'confirm': confirm,
                                    'clear': clear,
                                };
                                processAlert(data);
                            });


                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(8)').show();
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(8)').unbind('click');
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(8)').click(function(){
                                var userId = Cookies.get("userId");
                                var alertId = $(this).parent().find('td:eq(0)').attr('alertid');
                                var confirm = 0;
                                var clear = 1;
                                var data = {
                                    'userId'  : userId,
                                    'alertId': alertId,
                                    'confirm': confirm,
                                    'clear': clear,
                                };
                                processAlert(data);
                            });
                        }
                        for (; i < 5; ++i) {
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(9)').hide();
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(10)').hide();
                            $('#dealModal table tbody tr:eq(' + i + ') td:eq(11)').hide();
                        }
                    } else {
                        alert('获取' + deviceId + '告警列表失败');
                    }
                }
            }) // end of ajax '/v1/alert/list'
        }
    });
});
