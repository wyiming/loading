var user = {
    islogin: function() {
        var info = user.info();
        if (info && info.userName) {
            return true;
        } else {
            return false;
        }
    },
    info: function() {
        var userData = {};
        $.ajax({
            type: 'GET',
            url: "/caa-personal-ws/ws/0.1/login/mine" + "?time=" + (new Date().getTime()),
            dataType: "json",
            cache: false,
            async: false,
            success: function(data) {
                if (data && data.userId) {
                    $.cookie('GLOBAL_ME_ID', data.userId, { path: '/' });
                    $.cookie('GLOBAL_ME_NICKNAME', data.userName, { path: '/' });
                    $.cookie('GLOBAL_ME_TYPE', data.userType, { path: '/' });
                }
                userData = data;
            }
        });
        return userData;
    },
    name: function() {
        return $.cookie('GLOBAL_ME_NICKNAME');
    },
    id: function() {
        return $.cookie('GLOBAL_ME_ID');
    },
    type: function() {
        return $.cookie('GLOBAL_ME_TYPE');
    },
    gologin: function() {
        if (!user.islogin()) {
            window.location.href = '/pages/user/login.html';
        }
    }
}
user.style = {
    unauth: function(url) {
        //$('.main-nav li:last').hide();
        var backtop = $('<div>').addClass('back-top');
        $(document.body).append(backtop);
        backtop.click(function() {
            $("html,body").animate({ "scrollTop": 0 })
        })
        var _left = ($(window).width() - 1200) / 2 - 60;
        backtop.css({
            "right": _left
        })
        if ($(window).width() <= 1350) {
            backtop.css({
                "right": 0
            })
        }
        $(window).resize(function() {
            if ($(window).width() <= 1350) {
                backtop.css({
                    "right": 0
                })
            } else {
                var _left = ($(window).width() - 1200) / 2 - 60;
                backtop.css({
                    "right": _left
                })
            }
        })
        $('.other-nav a').attr('href', '/pages/user/login.html');
        if (!url) {
            if (_resource.istest == 'true') {
                return '<div class="nologin-info"><a target="_blank" href="" class="float-left shop-test">进入正式版 </a><p><a class="shop-official" href="" target="_blank">拍卖企业后台测试版</a><a href="/pages/user/register.html">免费注册</a><a href="/pages/user/login.html">登录</a></p></div>';
            } else {
                return '<div class="nologin-info"><a target="_blank" href="" class="float-left shop-test">进入测试版</a><p><a class="shop-official" href="" target="_blank">拍卖企业后台</a><a href="/pages/user/register.html">免费注册</a><a href="/pages/user/login.html">登录</a></p></div>';
            }
        } else {
            if (_resource.istest == 'true') {
                return '<div class="nologin-info"><a target="_blank" href="" class="float-left shop-test">进入正式版</a><p><a class="shop-official" href="" target="_blank">拍卖企业后台测试版</a><a href="/pages/user/register.html">免费注册</a><a href="/pages/user/login.html?redirect=' + url + '">登录</a></p></div>';
            } else {
                return '<div class="nologin-info"><a target="_blank" href="" class="float-left shop-test">进入测试版</a><p><a class="shop-official" href="" target="_blank">拍卖企业后台</a><a href="/pages/user/register.html">免费注册</a><a href="/pages/user/login.html?redirect=' + url + '">登录</a></p></div>';
            }

        }
    },
    authed: function() {
        $('.other-nav a').attr('href', '/pages/personal/home.html');
        var backtop = $('<div>').addClass('back-top');
        $(document.body).append(backtop);
        backtop.click(function() {
            $("html,body").animate({ "scrollTop": 0 })
        })
        var _left = ($(window).width() - 1200) / 2 - 60;
        backtop.css({
            "right": _left
        })
        $(window).resize(function() {
            if ($(window).width() <= 1350) {
                backtop.css({
                    "right": 0
                })
            } else {
                var _left = ($(window).width() - 1200) / 2 - 60;
                backtop.css({
                    "right": _left
                })
            }
        })
        $('.J-container-title').html('');
        var end = $('<div class="login-info">');
        var pinfo = $('<p>');

        var mail = $('<a href="/pages/personal/home.html?showuse=4" class="tipnews" target="_blank"></a>').html('消息<em class="mailNum"></em>');

        //测试
        var apersonal = $('<span>').addClass('user').html(user.name());
        var list = $('<em>').css('display', 'none');
        if (user.type() == 1000) {
            list.append('<a href="/caa-oc/index.html" target="_blank" class="active"><s>管理中心</s></a>');
        } else {
            $('.main-nav li:last').show();
            list.append('<a href="/pages/personal/home.html?showuse=1" target="_blank" class="active"><s>个人中心</s></a>');
        }

        var alogout = $('<a>').attr('href', 'javascript:void(0)').append('<s>退出</s>').on("click", function() {
            $.logout();
        });
        apersonal.hover(function() {
            $(this).children("em").show();
        }, function() {
            $(this).children("em").hide();
        })
        list.append(alogout);
        apersonal.append(list);

        if (_resource.istest == 'true') {
            pinfo.append('<a class="shop-link shop-official" href="" target="_blank">拍卖企业后台测试版</a>');
        } else {
            pinfo.append('<a class="shop-link shop-official" href="" target="_blank">拍卖企业后台</a>');
        }

        pinfo.append(mail);
        pinfo.append(apersonal);
        if (_resource.istest == 'true') {
            end.append('<a class="float-left shop-test" target="_blank" href="" >进入正式版</a>');
        } else {
            end.append('<a class="float-left shop-test" target="_blank" href="" >进入测试版</a>');
        }

        end.append(pinfo);
        return end;
    }
};;
(function($, window, document, undefined) {
    $.fn.headerStyle = function(options) {
        if (user.islogin()) {
            var userName = user.name();
            if (!userName) {
                $(this).html(user.style.unauth(window.location.href));
            } else {
                $(this).append(user.style.authed(window.location.href));
                $.loadMailNum(user.id());
            }
        } else {
            $(this).html(user.style.unauth(window.location.href));
        }
        util.setlogo();
        var src = '<script>' +
            'var _hmt = _hmt || [];' +
            '(function() {' +
            'var hm = document.createElement("script");' +
            'hm.src = "https://hm.baidu.com/hm.js?8f9c5049cea1c960fa649821f6b1b2fb";' +
            'var s = document.getElementsByTagName("script")[0]; ' +
            's.parentNode.insertBefore(hm, s);' +
            '})();' +
            '</script>';
        $("head").append(src);
        return this;
    }
})(jQuery, window, document);
$('.back-top').hide()
$(window).scroll(function() {
    if ($(document).scrollTop() <= 200) {
        $('.back-top').hide()
    } else {
        $('.back-top').show()
    }
    if ($('body').height() - $(document).scrollTop() - $(window).height() <= 256) {
        $('.back-top').css({
            "bottom": "256px"
        })
    }
})