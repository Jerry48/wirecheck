'use strict';

$(function () {
    var remember = Cookies.get("password");
    if (remember != undefined || remember != null) {
        $('input[type=checkbox]').prop('checked', true);
    }
    var username = Cookies.get("username");
    var password = Cookies.get("password");
    $("#inputUser").val(username);
    $("#inputPassword").val(password);
    $('#login').click(function () {
        var user = $('#inputUser').val().trim();
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
            success: function success(data) {
                if (data.code == 0) {
                    Cookies.set('sessionId', data.result.sessionId, { maxAge: -1, path: '/' });
                    Cookies.set('username', $('#inputUser').val(), { expires: 7, path: '/' });
                    if ($("input[type=checkbox]").prop("checked")) {
                        Cookies.set('password', $('#inputPassword').val(), { expires: 7, path: '/' });
                    } else {
                        Cookies.set('password', $('#inputPassword').val(), { maxAge: -1, path: '/' });
                    }

                    window.location.href = '/main';
                } else {
                    alert('错误的用户名或密码');
                }
            },
            error: function error(data) {
                console.log(data);
                alert(data);
            }

        });
    });
});