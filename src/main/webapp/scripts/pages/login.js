$(document).ready(function() {
    $('.is-auto').click(function() {
        $(this).toggleClass('active');
    });

    $.ajax({
        type: 'GET',
        url: "/caa-personal-ws/ws/0.1/login/captcha/require" + "?time=" + (new Date().getTime()),
        dataType: "json",
        cache: false,
        async: true,
        success: function(data) {
            if (data && data.captcha == "true") {
                getVeriCode();
                $(".yanzheng").show();
            } else {
                $(".yanzheng").hide();
            }
        },
        error: function() {
            $(".yanzheng").show();
        }
    });
    $('.close').click(function() {
        $("input[name=username]").val('');
    });

    function getVeriCode() {
        var img = $("<img>").attr("src", "/caa-personal-ws/ws/0.1/captcha/image/jpeg?time=" + new Date().getTime());
        img.click(function() {
            getVeriCode();
        });
        $(".getcapache").html(img);
    }
    $("input[type=password]").keypress(function(e) {
        // 回车键事件
        if (e.which == 13) {
            login_();
        }
    });
    $("input[type=code]").keypress(function(e) {
        // 回车键事件
        if (e.which == 13) {
            login_();
        }
    });
    $("input[type=submit]").click(function() {
        login_();
    });
    $('input').focus(function() {
        $('.error').hide();
    });

    function login_() {
        var data = {},
            name = $("input[name=username]").val(),
            pass = $("input[name=password]").val(),
            captcha = $("input[name=code]").val();
        if (!name || !pass) {
            $('.error').show().addClass('isempty').find('.error-info').html('请填写完整的登录信息');
            return false;
        } else {
            $('.error').removeClass('isempty');
        }
        data.username = name;
        data.password = $.md5(pass);
        data.captcha = captcha;
        $.ajax({
            url: "/caa-personal-ws/ws/0.1/login",
            type: 'post',
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json",
            async: true,
            success: function(data) {
                if (data.status == true) {
                    $.cookie_userinfo(link, link);
                } else {
                    var result = data.msg;
                    if (result) {
                        if (data.additional == 601 || data.additional == '601' || result == "验证码不正确") {
                            getVeriCode();
                            $(".yanzheng").show();
                            $("input[name=code]").val('');
                        }
                        $('.error').show().find('.error-info').html(result);
                    } else {
                        $('.error').show().find('.error-info').html('用户名或密码错误，请重新输入');
                    }
                }
            },
            error: function(data) {
                $('.error').show().find('.error-info').html(data.msg);
            }
        });
    }


    var link = function() {
        try {
            if ($.cookie('GLOBAL_ME_TYPE') == 1000 || $.cookie('GLOBAL_ME_TYPE') == "1000") {
                location.href = '/company-saas-ws/index.html';
            } else {
                var redt = '';
                if (window.location.href.indexOf('redirect') > -1) {
                    var redt = window.location.href.slice(parseInt(window.location.href.indexOf('redirect') + 9))
                }

                var auctionid = util.getQueryString("auctionid");

                if (redt) {
                    if (typeof auctionid == "number" || typeof auctionid == "string") {
                        redt = redt + "?auctionid=" + auctionid;
                        location.href = redt;
                    } else {
                        location.href = redt;
                    }
                } else {
                    location.href = '/index.html';
                }

            }
        } catch (e) {
            location.href = '/index.html'
        }
    }

});