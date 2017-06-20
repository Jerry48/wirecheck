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

$(function(){
    //欢迎词
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var dayOfWeek = myDate.getDay();
    var userName = Cookies.get('userName');
    var dayOfWeekName = ['日','一', '二','三','四', '五','六'];
    $('.container-fluid:eq(0) div:eq(2) a:eq(0)').text('欢迎您: ' + userName + ' 今天是' + year + '年' + month + '月' + day + '月' +
                                                 '   星期' +dayOfWeekName[dayOfWeek]);

    //设备列表
    var tmpData = deviceTree();
    $('#tree').treeview({data: tmpData});

    
})