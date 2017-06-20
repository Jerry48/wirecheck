var userId = Cookies.get('userId');
var HOST = window.location.href.slice(0,26);

$(function(){
    var tmpData = deviceLineTree();
    $('#tree').treeview(
    {
        data: tmpData,
        showBorder:true,
        showCheckbox:false,
        showTags:false,
        collapseIcon: "glyphicon glyphicon-chevron-down",
        expandIcon: "glyphicon glyphicon-chevron-right",
    });
    $('#tree').css('font-size','20px');

    getSelectedDevice();

    $('#patrol').click(function(){
        if(getSelectedDevice()==-1){
            alert('请选择设备！');
        }else{
            var deviceId = getSelectedDevice().slice(0,17);
            var channelNo = getSelectedDevice().slice(18,19);
           
            // window.location.href = HOST + '/patrolDevice?deviceId='+deviceId+'&channelNo='+channelNo;
            window.location.href = HOST + '/patrolDevice?deviceId='+deviceId+'&channelNo='+channelNo;
        }
    });

    $('#follow').click(function(){
        if(getSelectedDevice()==-1){
            alert('请选择设备！');
        }else{
            var deviceId = getSelectedDevice().slice(0,17);
            var channelNo = getSelectedDevice().slice(18,19);
           
            // window.location.href = HOST + '/patrolDevice?deviceId='+deviceId+'&channelNo='+channelNo;
            window.location.href = HOST + '/patrolDevice?deviceId='+deviceId+'&channelNo='+channelNo;
        }
    });
    $('#device').click(function(){
        if(getSelectedDevice()==-1){
            alert('请选择设备！');
        }else{
            var deviceId = getSelectedDevice().slice(0,17);
            var channelNo = getSelectedDevice().slice(18,19);
           
            // window.location.href = HOST + '/patrolDevice?deviceId='+deviceId+'&channelNo='+channelNo;
            window.location.href = HOST + '/viewDevice?deviceId='+deviceId+'&channelNo='+channelNo;
        }
    });
    $('#alert').click(function(){
        if(getSelectedDevice()==-1){
            alert('请选择设备！');
        }else{
            var deviceId = getSelectedDevice().slice(0,17);
            var channelNo = getSelectedDevice().slice(18,19);
           
            // window.location.href = HOST + '/patrolDevice?deviceId='+deviceId+'&channelNo='+channelNo;
            window.location.href = HOST + '/alertList?deviceId='+deviceId;
        }
    });

});

function deviceLineTree() {
    var data = {
        "userId": userId
    };
    var rootNode = [];
    $.ajax({
        url:'/v1/device/tree/line',
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

function getSelectedDevice(){
    if ($('#tree').treeview('getSelected').length != 1 || $('#tree').treeview('getSelected')[0].type == undefined
        || $('#tree').treeview('getSelected')[0].type != 3) {
        return -1;
    }
    return $('#tree').treeview('getSelected')[0].id;
}

