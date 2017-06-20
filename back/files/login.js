$(function() {
    $('#login').click(function() {
        var user = $('#inputUser').val();
        var pwd = $('#inputPassword').val();
        var data = {
            "userName": user,
            "password": pwd
        };

        $.ajax({
            url: '/v1/user/login',
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                if (data.code == 0) {
                    Cookies.set('sessionId', data.result.sessionId, { expires: 365 });
                    window.location.href = '/main';
                } else {
                    alert('错误的用户名或密码');
                }
            },
            error: function(data) {
                console.log(data);
                alert(data);
            }

        })
    });

});
