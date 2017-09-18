var jsonData = {}
var browser = navigator.appName
var b_version = navigator.appVersion
var version = b_version;
var trim_Version;
var state;
if (version.indexOf("MSIE 8.0") > -1) {
    trim_Version = "MSIE8.0"
}
$(function() {
    $(".J-container-title").headerStyle();
    var type = user.type();
    //type = 1;
    var useflag = true,
        mechflag1 = true,
        mechflag2 = true,
        renzhengflag = true;
    //由不同位置进入本页面显示不同的tap
    var showtab = util.getQueryString('showuse');
    var lotId = util.getQueryString('lotId');
    //用户信息----------------------------------
    //个人与企业显示不同页面
    if (type != 1 && type != 1000) {
        $('#user').show();
        $('#mechanism').remove();
        $('#userAuthentication').show();
        $('#mechanismAuthentication').remove();
        getUser();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'))
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'))
        }
    } else if (type == 1) {
        $('#mechanism').show();
        $('#user').remove();
        $('#userAuthentication').remove();
        $('#mechanismAuthentication').show();
        getMech();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'))
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'))
        }
    } else {
        window.location.href = "/login.html";
    }

    var bindState = '';
    var txt = ["个人信息", "实名认证", '修改密码', "我的竞拍", "我的消息"];
    // 设置内容区域高度
    function setheight() {
        var setheight = $(window).height() - $('.sifa-head').outerHeight(true) - $('.J-sifa-foot').outerHeight(true);
        $('.sifa-content').css('min-height', setheight);
    }
    setheight();
    var sendFlag = localStorage.sendFlag,
        sendFlag2 = localStorage.sendFlag2,
        nowTimeL = (new Date()).getTime();
    if (!user.islogin()) {
        window.location.href = "/pages/user/login.html";
    }

    if (showtab == 1) {
        // $(".main-nav").find("li").removeClass('active');
        $(".my-auction-title").html('个人中心<span style="margin-left: 10px;margin-right: 10px">></span>个人信息');
        $(document).attr("title", '个人信息_个人中心_中拍平台');
        $('.userinfo').addClass('active');
        $('#userinfo').show();
    } else if (showtab == 2) {
        $(".my-auction-title").html('个人中心<span style="margin-left: 10px;margin-right: 10px">&gt;</span>实名认证');
        $(document).attr("title", '实名认证_个人中心_中拍平台');
        $('.realname').addClass('active');
        $('#toauthen').show();
        getcorpcertinfo();
    } else if (showtab == 3) {
        $('.mylist').addClass('active');
        $('#mine-auction').show();
        if (lotId) {
            $('.bzj_span').addClass('active');
            showBXJ(lotId);
        } else {
            $(".tabp span.hascheck").eq(1).addClass("active").siblings().removeClass("active");
            $(".tabp span.hascheck").eq(1).parents(".personnew").find("div.person_auction").hide();
            var $showPanel = $(".tabp span.hascheck").eq(1).parents(".personnew").find("div.person_auction").eq(1);
            $showPanel.show();
            getAuction(0);
        }
        $(document).attr("title", '我的竞拍_个人中心_中拍平台');
    } else if (showtab == 4) {
        $(".my-auction-title").html('个人中心<span style="margin-left: 10px;margin-right: 10px">&gt;</span>我的消息');
        $(document).attr("title", '我的消息_个人中心_中拍平台');
        loadMail();
        $('.my_news_li').addClass('active');
        $('.my_news').show();
    } else if (showtab == 5) {
        $(".my-auction-title").html('个人中心<span style="margin-left: 10px;margin-right: 10px">&gt;</span>修改密码');
        $(document).attr("title", '修改密码_个人中心_中拍平台');
        $('.password').addClass('active');
        $('#password').show();
    } else {
        $('#mine-auction').css('display', 'block');
        $('.mylist').addClass('active');
        getAuction(0);
        $(document).attr("title", '我的竞拍_个人中心_中拍平台');
    }
    // $(".my-auction-title").html('个人中心<span style="margin-left: 10px;margin-right: 10px">&gt;</span>' + txt[showtab]);
    //左侧列表tap
    $(".sifa-cont>ul>li").click(function() {
        var index = $('.sifa-cont li').index(this);
        $(this).addClass("active").siblings().removeClass("active");
        $(this).parent().next("div.sifa-cont-right").find(".personbox").hide();
        $(this).parent().next("div.sifa-cont-right").find(".personbox").eq(index).show().find("h2").find("span:eq(0)").text(txt[index]);
        $(".my-auction-title").html('个人中心<span style="margin-left: 10px;margin-right: 10px">&gt;</span>' + txt[index]);
        $(document).attr("title", txt[index] + '_个人中心_中拍平台');
        setheight();
        $('#mechanismAuthentication .mech-real-show').show();
        if ($(this).hasClass('my_news_li')) {
            loadMail();
        } else if ($(this).hasClass('mylist')) {
            $('.my-auct').show();
            $('.margin-details').hide();
            $(".tabp span.hascheck").eq(0).addClass("active").siblings().removeClass("active");
            $('.has-auction .person_auction').hide().eq(0).show();
            getAuction(0);
        } else if ($(this).hasClass('userinfo')) {
            if (type != 1 && type != 1000) {
                getUser();
            } else if (type == 1) {
                getMech();
            }
        } else if ($(this).hasClass('realname')) {
            getcorpcertinfo();
        } else if ($(this).hasClass('password')) {
            // getcorpcertinfo();
        }
    });


    function getUser() {
        var $user = $('#user');
        nowTimeL = (new Date()).getTime();
        $.getJSON("/caa-personal-ws/ws/0.1/web/userinfo?time=" + nowTimeL, function(data) {
            bindState = data.bindState;
            $user.find('[name="userName"]').val(data.userName).prev('span').html(data.userName);
            $user.find('[name="name"]').val(data.name).prev('span').html(data.name);
            if (data.sex == 0 || data.sex == '0') {
                $user.find('[name="sex"]').val(data.sex).prev('span').html('男');
            } else if (data.sex == 1 || data.sex == '1') {
                $user.find('[name="sex"]').val(data.sex).prev('span').html('女');
            }

            if (data.bindState == 1) {
                $user.find('[name="mobile"]').val(data.mobile).prev('span').html(data.mobile);
            } else {
                $user.find('[name="mobile"]').attr('placeholder', '请输入绑定手机').prev('span').html(data.mobile);
            }

            $user.find('[name="emails"]').val(data.emails).prev('span').html(data.emails);
        });
    }


    function getMech() {
        var $mechanism = $('#mechanism');
        nowTimeL = (new Date()).getTime();
        $.getJSON("/caa-personal-ws/ws/0.1/web/corpauthinfo?time=" + nowTimeL, function(data) {
            bindState = data.bindState;
            $mechanism.find('[name="userName"]').val(data.userName).prev('span').html(data.userName);
            $mechanism.find('[name="corpName"]').val(data.corpName).prev('span').html(data.corpName);
            var frName = data.frName + 1 + '';
            if (frName.indexOf('*') == -1) {
                $mechanism.find('[name="frName"]').val(data.frName).prev('span').html(data.frName);
            } else {
                $mechanism.find('[name="frName"]').attr('placeholder', '请输入法人姓名').prev('span').html(data.frName);
            }

            var frTel = data.frTel + 1 + '';

            if (frTel.indexOf('*') == -1) {
                $mechanism.find('[name="frTel"]').val(data.frTel).prev('span').html(data.frTel);
            } else {
                $mechanism.find('[name="frTel"]').attr('placeholder', '请输入法人电话').prev('span').html(data.frTel);
            }

            $mechanism.find('[name="emails"]').val(data.emails).prev('span').html(data.emails);
        });
    }

    $('.user-nobind-tel').on('click', '.submit', function() {
        $('.sifa-cont>ul>li.userinfo').click();
        toedit();
    })

    var yzmobile = /^1[34578]\d{9}$/,
        yzemails = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
        yzidnum = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;


    function editUser() {
        var $user = $('#user'),
            sex = $user.find('[name="sex"]').val(),
            mobile = $user.find('[name="mobile"]').val(),
            emails = $user.find('[name="emails"]').val(),
            captcha = $('.bind-msg').val();

        var userfalg = true;

        if (!emails || emails.length == 0) {
            $user.find('[name="emails"]').next('.error').html('请输入邮箱').show();
            userfalg = false;
        } else if (!(yzemails.test(emails)) || !emails) {
            $user.find('[name="emails"]').next('.error').html('邮箱格式错误').show();
            userfalg = false;
        }

        if (bindState != 1) {
            if (!mobile || mobile.length == 0) {
                $('.bind-user-tel').next('em').show().html('绑定手机不能为空');
                userfalg = false;
            } else if (!(yzmobile.test(mobile))) {
                $('.bind-user-tel').next('em').show().html('请输入正确的手机号码');
                userfalg = false;
            }
            if (!captcha || captcha.length == 0) {
                $('.bind-msg').parent().next('em').show().html('手机验证码不能为空');
                userfalg = false;
            }
        }


        if (!userfalg) {
            return false;
        }
        var jsonData = {
            sex: sex,
            emails: emails
        };
        if (bindState != 1) {
            jsonData.mobile = mobile;
            jsonData.captcha = captcha;
        }

        $.ajax({
            url: '/caa-personal-ws/ws/0.1/web/editindivbidder',
            contentType: "application/json",
            type: 'post',
            dataType: 'json',
            async: true,
            data: JSON.stringify(jsonData),
            success: function() {
                getUser();
                toshow();
            },
            error: function(xhr) {
                if (xhr.status == 200) {
                    getUser();
                    toshow();
                } else {
                    var info = JSON.parse(xhr.responseText);
                    $user.find('.error-tips').html(info.error).show();
                }
            }
        })
    }

    function editMech() {
        var $mechanism = $('#mechanism'),
            frName = $mechanism.find('[name="frName"]').val(),
            frTel = $mechanism.find('[name="frTel"]').val(),
            emails = $mechanism.find('[name="emails"]').val(),
            mobile = $('.bind-user-tel').val(),
            captcha = $('.bind-msg').val();

        var methfalg = true;
        if (!frName || frName.length == 0) {
            $mechanism.find('[name="frName"]').next('.error').show().html('法人姓名不能为空');
            methfalg = false;
        }

        if (!frTel || frTel.length == 0) {
            $mechanism.find('[name="frTel"]').next('.error').show().html('法人电话不能为空');
            methfalg = false;
        }
        if (!emails || emails.length == 0) {
            $mechanism.find('[name="emails"]').next('.error').show().html('法人邮箱不能为空');
            methfalg = false;
        } else if (!(yzemails.test(emails)) || !emails) {
            $mechanism.find('[name="emails"]').next('.error').show().html('请输入正确的法人邮箱');
            methfalg = false;
        }

        if (bindState != 1) {
            if (!mobile || mobile.length == 0) {
                $('.bind-user-tel').next('em').show().html('绑定手机不能为空');
                methfalg = false;
            } else if (!(yzmobile.test(mobile))) {
                $('.bind-user-tel').next('em').show().html('请输入正确的手机号码');
                methfalg = false;
            }

            if (!captcha || captcha.length == 0) {
                $('.bind-msg').parent().next('em').show().html('手机验证码不能为空');
                methfalg = false;
            }
        }

        if (!methfalg) {
            return false;
        }
        var jsonData = {
            frName: frName,
            frTel: frTel,
            emails: emails
        };
        if (bindState != 1) {
            jsonData.mobile = mobile;
            jsonData.captcha = captcha;
        }

        $.ajax({
            url: '/caa-personal-ws/ws/0.1/web/editcorpbidder',
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            async: true,
            data: JSON.stringify(jsonData),
            success: function() {
                getMech();
                toshow();
            },
            error: function(xhr) {
                if (xhr.status == 200) {
                    getMech();
                    toshow();
                } else {
                    var info = JSON.parse(xhr.responseText);
                    $mechanism.find('.error-tips').html(info.error).show();
                }
            }
        })
    }

    //------click提交
    $('#user input.submit').click(function() {
        editUser();
    });
    $('#mechanism input.submit').click(function() {
        editMech();
    });
    //由展示到编辑的切换
    var $revise = $(".revise"),
        $reviseparent = $revise.parents('.personbox_user');

    function toedit() {
        $reviseparent.find(".personnew").find(".show").hide();
        $reviseparent.find(".personnew").find(".hidden").show();
        $reviseparent.find("h2 ").find(".hidden").show();
        $revise.parent('.renzheng').hide();

        if (bindState != 1) {
            if (type != 1 && type != 1000) {
                $('#user').find('[name="mobile"]').removeAttr('disabled').removeClass('disabled');
                $('#user').find('.bind-tel').show();
            } else if (type == 1) {
                $('#mechanism').find('.bind-tel').show();
            }
            getVeriCode();
        } else {
            if (type != 1 && type != 1000) {
                $('#user').find('[name="mobile"]').attr('disabled', 'disabled').addClass('disabled');
                $('#user').find('.bind-tel').hide();
            } else if (type == 1) {
                $('#mechanism').find('.bind-tel').hide();
            }

        }
    }

    function toshow() {
        $reviseparent.find(".personnew").find(".show").show();
        $reviseparent.find(".personnew").find(".hidden").hide();
        $reviseparent.find(".personnew").find("em").hide();
        $reviseparent.find("h2 ").find(".hidden").hide();
    }

    $("#userinfo").on('click', '.revise', function() {
        if ($(this).parent().next(".personnew").find(".show").css('display') == 'none') {
            toshow();
        } else {
            toedit();
        }
    });
    $('#userinfo .cancel').click(function() {
        toshow();
    });

    $('#password .submit').click(function() {

        var jsondata = {},
            oldPassword = $("input[name=oldPassword]").val(),
            newPassword = $("input[name=newPassword]").val(),
            repeatPassword = $("input[name=repeatPassword]").val();
        var changeflag = true;

        if (!oldPassword || oldPassword.length == 0) {
            $("input[name=oldPassword]").next('.error').html('请输入原密码').show();
            changeflag = false;
        } else if ((/^[\u4e00-\u9fa5]+$/g).test(oldPassword)) {
            $("input[name=oldPassword]").next('.error').html("不能含有非法字符").show();
            changeflag = false;
        }

        if (!newPassword || newPassword.length == 0) {
            $("input[name=newPassword]").next('.error').html('请输入新密码').show();
            changeflag = false;
        } else if (newPassword.length < 6) {
            $("input[name=newPassword]").next('.error').html("密码不能低于6位").show();
            changeflag = false;
        } else if (newPassword.length > 20) {
            $("input[name=newPassword]").next('.error').html("密码不能超过20位").show();
            changeflag = false;
        } else if ((/^[\u4e00-\u9fa5]+$/g).test(newPassword)) {
            $("input[name=newPassword]").next('.error').html("不能含有非法字符").show();
            changeflag = false;
        }


        if (!repeatPassword || repeatPassword.length == 0) {
            $("input[name=repeatPassword]").next('.error').html('请确认新密码').show();
            changeflag = false;
        } else if (repeatPassword.length < 6) {
            $("input[name=repeatPassword]").next('.error').html("密码不能低于6位").show();
            changeflag = false;
        } else if (repeatPassword.length > 20) {
            $("input[name=repeatPassword]").next('.error').html("密码不能超过20位").show();
            changeflag = false;
        } else if ((/^[\u4e00-\u9fa5]+$/g).test(repeatPassword)) {
            $("input[name=repeatPassword]").next('.error').html("不能含有非法字符").show();
            changeflag = false;
        } else if (repeatPassword != newPassword) {
            $("input[name=repeatPassword]").next('.error').html("两次输入的密码不同").show();
            changeflag = false;
        }

        if (!changeflag) {
            return false;
        }

        jsondata.oldPassword = $.md5(oldPassword);
        jsondata.newPassword = $.md5(newPassword);
        jsondata.repeatPassword = $.md5(repeatPassword);
        $.ajax({
            url: '/caa-personal-ws/ws/0.1/reset/user/password',
            type: 'post',
            contentType: "application/json",
            async: true,
            dataType: 'json',
            data: JSON.stringify(jsondata),
            success: function(data) {
                passsuccess();
            },
            error: function(xhr) {
                var info = JSON.parse(xhr.responseText).error;
                if (info.indexOf('原密码') > -1) {
                    $("input[name=oldPassword]").next('.error').html(info).show();
                } else {
                    $("input[name=repeatPassword]").next('.error').html(info).show();
                }
            }
        })
    })

    function passsuccess() {
        $('.opcy_new').remove();
        $('body').append('<div class="opcy_new"></div>');
        $('.dialog').show();
    }

    function dealstatus(num) {
        util.getdata('/caa-personal-ws/ws/0.1/check/auth/status/', 'get', 'json', false, true, function(data) {
            if (num == 1) {
                if (data.authStatus) {
                    clearTimeout(ten);
                    getcorpcertinfo();
                }
            } else if (num == 2) {
                getcorpcertinfo();
            }
        }, function() {
            getcorpcertinfo();
        })
    }

    //实名认证------------------------------------------------
    var state = '',
        ten;
    var statusflag = true;

    function getcorpcertinfo() {
        var arr = ["", "居民身份证", "中国公民护照", "台湾居民来往大陆通行证", "港澳居民来往内地通行证", "外国公民护照", "户口薄", "营业执照", "组织机构代码证", "事业法人登记证", "社会统一信用代码证", "军官证"];

        if (type != 1 && type != 1000) {
            var $userrealshow = $('#userAuthentication .user-real-show'),
                $userreal = $('#userreal'),
                $userreal2 = $('#userreal2');
            util.getdata('/caa-personal-ws/ws/0.1/web/indivcertinfo', 'get', 'json', false, false, function(data) {
                state = data.auditState;
                bindState = data.bindState;
                if (data.bindState != 1) {
                    $('.user-nobind-tel').show();
                    $userrealshow.hide();
                    $userreal.hide();
                    $userreal2.hide();
                    return;
                } else {
                    $('.user-nobind-tel').hide();
                }

                if (state == 3) {
                    if (statusflag) {
                        setTimeout(function() {
                            dealstatus(1)
                        }, 5000);
                        ten = setTimeout(function() {
                            dealstatus(2)
                        }, 10000);
                        statusflag = false;
                    }
                    $userrealshow.show();
                    $userreal.hide();
                    $userreal2.hide();
                    $userrealshow.show();
                    $userrealshow.find('.renzheng').hide();
                    $userrealshow.find('.start').show().find('span').html('正在认证中，请耐心等待片刻...');
                    $userrealshow.find('.personnew_center').hide();
                } else if (state == 0) {
                    //失败
                    $userreal.hide();
                    $userreal2.hide();
                    $userrealshow.show();
                    $userrealshow.find('.renzheng').hide();
                    $userrealshow.find('.nopass').show().find('p em').html('失败原因：' + data.auditNotes);
                    $userrealshow.find('.personnew_center').hide();
                } else if (state == 1) {
                    //已认证
                    $userrealshow.show();
                    $userreal.hide();
                    $userreal2.hide();
                    $userrealshow.find('.renzheng').hide();
                    $userrealshow.find('.finish').show();
                    $userrealshow.find('.personnew_center').show();
                    $userrealshow.find('.personnew_center .personalitem').eq(0).find('span').html(data.name);
                    $userrealshow.find('.personnew_center .personalitem').eq(1).find('span').html(arr[data.idType]);
                    $userrealshow.find('.personnew_center .personalitem').eq(2).find('span').html(data.idNumber);
                } else if (state == 2) {
                    //认证中
                    $userreal.hide();
                    $userreal2.hide();
                    $userrealshow.show();
                    $userrealshow.find('.renzheng').hide();
                    $userrealshow.find('.personnew_center').show();
                    $userrealshow.find('.start').show().find('span').html('审核中...');
                    $userrealshow.find('.personalitem').eq(0).find('span').html(data.name);
                    $userrealshow.find('.personalitem').eq(1).find('span').html(arr[data.idType]);
                    $userrealshow.find('.personalitem').eq(2).find('span').html(data.idNumber);
                } else if (state == null) {
                    if (renzhengflag) {
                        $userrealshow.hide();
                        $userreal.show();
                        $userreal2.hide();
                        getmessagesinfo();
                    } else {
                        $userreal.hide();
                        $userreal2.hide();
                        $userrealshow.show();
                        $userrealshow.find('.renzheng').hide();
                        $userrealshow.find('.renzheng.nopass').show().find('p em').html('失败提醒：当前用户认证信息不通过,请重新认证,或者选择人工认证通道！');
                        $userrealshow.find('.personnew_center').hide();
                    }
                }
                $('.bind-mobile').html(data.mobile);
            });
        } else if (type == 1) {
            var $mechrealshow = $('.mech-real-show');
            util.getdata('/caa-personal-ws/ws/0.1/web/corpcertinfo', 'get', 'json', false, false, function(data) {
                state = data.auditState;
                bindState = data.bindState;
                if (data.bindState != 1) {
                    $('.user-nobind-tel').show();
                    $mechrealshow.hide();
                    $('#mechreal').hide();
                    return;
                } else {
                    $('.user-nobind-tel').hide();
                }

                if (state == 0) {
                    $('#mechreal').hide();
                    $mechrealshow.find('.renzheng').hide();
                    $mechrealshow.find('.nopass').show().find('p em').html('失败原因：' + data.auditNotes);
                    $mechrealshow.find('.personnew_center').hide();
                    $mechrealshow.find('#company_msg').hide(); //机构认证显示信息
                } else if (state == 1) {
                    $('#mechreal').hide();
                    $mechrealshow.show();
                    $mechrealshow.find('.renzheng').hide();
                    $mechrealshow.find('.finish').show();
                    $mechrealshow.find('#company_msg').show();
                    $mechrealshow.find('.personnew_center .personalitem').eq(0).find('span').html(data.corpName);
                    $mechrealshow.find('.personnew_center .personalitem').eq(1).find('span').html(arr[data.idType]);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(2).find('span').html(data.businessNumber);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(3).find('span').html(data.frName);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(4).find('span').html(data.frIdNum);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(5).find('span').html(data.frTel);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(6).find('span').html(data.emails);
                } else if (state == 2) {
                    $('#mechreal').hide();
                    $mechrealshow.show();
                    $mechrealshow.find('#company_msg').show();
                    $mechrealshow.find('.renzheng').hide();
                    $mechrealshow.find('.start').show();
                    $mechrealshow.find('.personnew_center  .personalitem').eq(0).find('span').html(data.corpName);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(1).find('span').html(arr[data.idType]);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(2).find('span').html(data.businessNumber);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(3).find('span').html(data.frName);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(4).find('span').html(data.frIdNum);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(5).find('span').html(data.frMobile);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(5).find('span').html(data.frTel);
                    $mechrealshow.find('.personnew_center  .personalitem').eq(6).find('span').html(data.emails);
                } else if (state == null) {
                    $mechrealshow.hide();
                    $('#mechreal').show();
                    getRealMech();
                }
            });
        }
    }


    // 第三方认证上传图片
    if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
        $('.upimgieSys').show();
        $('.upimgwrap').hide();
        $('#userPhoto2-ie').attr("onchange", "previewImage(this,'preview-span2',0)");
        $('#userPhoto2-ie-one').attr("onchange", "previewImage(this,'preview-span2-one',1)");
    } else {
        $('.upimgieSys').hide();
        $('.upimgwrap').show();
        $('#userPhoto2').ace_file_input();
        $('#userPhotoone2').ace_file_input();

    }


    $('.user-nobind-tel').on('click', '.submit', function() {
        $('.sifa-cont>ul>li.userinfo').click();
        toedit();
    })


    function getVeriCode() {
        var img = $("<img>").attr("src", "/caa-personal-ws/ws/0.1/captcha/image/jpeg?time=" + new Date().getTime());
        img.click(function() {
            getVeriCode();
        });
        $(".getcapcha").html(img);
    }

    var $userArtificial = $("#userreal2 .personalitem"),
        $userArtificialName = $userArtificial.eq(0),
        $userArtificialSex = $userArtificial.eq(1),
        // $userArtificialMobile = $userArtificial.eq(2),
        $userArtificialEmail = $userArtificial.eq(2),
        $userArtificialType = $userArtificial.eq(3),
        $userArtificialTnum = $userArtificial.eq(4),
        $userArtificialError = $userArtificial.eq(6),
        $mech = $("#mechreal .personalitem"),
        $mechCropname = $mech.eq(0),
        $mechType = $mech.eq(1),
        $mechBnumber = $mech.eq(2),
        $mechFrname = $mech.eq(3),
        $mechTnum = $mech.eq(4),
        $mechTel = $mech.eq(5),
        // $mechMobile = $mech.eq(5),

        $mechEmail = $mech.eq(6);

    function getRealUser() {
        nowTimeL = (new Date()).getTime();
        $.getJSON("/caa-personal-ws/ws/0.1/web/userinfo?time=" + nowTimeL, function(data) {
            bindState = data.bindState;
            var name = data.name + 1 + '';
            if (name.indexOf('*') == -1) {
                $userArtificialName.find('input').val(data.name);
            }
            $userArtificialSex.find('select').val(data.sex);
            // var mobile = data.mobile + 1 + '';
            // if (mobile.indexOf('*') == -1) {
            //     $userArtificialMobile.find('input').val(data.mobile);
            // }
            $('.bind-mobile').val(data.mobile);

            $userArtificialEmail.find('input').val(data.emails);
            $userArtificialType.find('select').val(data.idType);
            var idNumber = data.idNumber + 1 + '';
            if (idNumber.indexOf('*') == -1) {
                $userArtificialTnum.find('input').val(data.idNumber);
            }

            if (useflag) {
                //判断浏览器是否是ie8
                if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
                    $('.upimgwrap-ie').show();
                    $('.upimgwrap').hide();
                    $('#userPhoto-ie').attr("onchange", "previewImage(this,'preview-span',2)");
                    $('#userPhoto-ie-one').attr("onchange", "previewImage(this,'preview-span-one',3)");
                    $('#userPhoto-ie-two').attr("onchange", "previewImage(this,'preview-span-two',4)");
                } else {
                    $('.upimgwrap-ie').hide();
                    $('.upimgwrap').show();
                    if (data.idPhoto) {
                        $('#userPhoto').ace_file_input({
                            file: data.idPhoto
                        }).data('url', data.idPhoto);
                    } else {
                        var index = $(".personalitemtype select").val();
                        if (index == 2 || index == 5 || index == 6 || index == 7) {
                            $('#userPhoto').ace_file_input();
                            $('#userPhotoone').ace_file_input();
                        } else {
                            $('#userPhoto').ace_file_input();
                            $('#userPhotoone').ace_file_input();
                            $('#userPhototwo').ace_file_input();
                        }

                    }
                }
                useflag = false;
            }
        });
    }

    function getRealMech() {
        nowTimeL = (new Date()).getTime();
        $.getJSON("/caa-personal-ws/ws/0.1/web/corpauthinfo?time=" + nowTimeL, function(data) {
            bindState = data.bindState;
            var corpName = data.corpName + 1 + '';
            if (corpName.indexOf('*') == -1) {
                $mechCropname.find('input').val(data.corpName);
            }

            var frName = data.frName + 1 + '';
            if (frName.indexOf('*') == -1) {
                $mechFrname.find('input').val(data.frName);
            }
            $mechType.find('select').val(data.idType);
            var frIdNum = data.frIdNum + 1 + '';
            if (frIdNum.indexOf('*') == -1) {
                $mechTnum.find('input').val(data.frIdNum);
            }
            var frTel = data.frTel + 1 + '';
            if (frTel.indexOf('*') == -1) {
                $mechTel.find('input').val(data.frTel);
            }

            $mechEmail.find('input').val(data.emails);
            var businessNumber = data.businessNumber + 1 + '';
            if (businessNumber.indexOf('*') == -1) {
                $mechBnumber.find('input').val(data.businessNumber);
            }

            if (mechflag1) {
                if (data.idPhoto) {
                    $('#certificates').ace_file_input({
                        file: data.idPhoto
                    }).data('url', data.idPhoto);
                } else {
                    $('#certificates1').ace_file_input();
                    $('#certificates2').ace_file_input();
                    $('#certificates3').ace_file_input();
                    $('#certificates4').ace_file_input();
                }
                mechflag1 = false;
            }
            if (mechflag2) {
                if (data.businessPermit) {
                    $('#certificates2').ace_file_input({
                        file: data.businessPermit
                    }).data('url', data.businessPermit);
                }
                mechflag2 = false;
            }
        });
    }
    if (type != 1 && type != 1000) {
        getRealUser();
    } else if (type == 1) {
        getRealMech();
    }


    $('.personalitemtype select').on("input propertychange", function() {
        $(".uploadmind div").hide();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'))
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'))
        }
    })
    $('.personalitemType select').on("input propertychange", function() {
        $(".uploadmind div").hide();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'))
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'))
        }
    })
    if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
        $('.upimgwrapType').hide();
        $('.upimgwrapPhoto').hide();
    }

    function checkcodeNum(uploading, company) {
        $(".uploadmind div").hide();
        $(".uploadmindone div").hide();
        uploading.hide();
        company.hide();
        $('.picexample div').hide();
        var index;
        if (type == 1) {
            index = $(".personalitemType select").val();
        } else {
            index = $(".personalitemtype select").val();
        }
        if (index == 1 || index == 0) {
            $(".uploadmind div").show();
            uploading.show();
            $('.picexample div').show();
            $(".uploadmind div").eq(0).html("上传身份证清晰正面照")
            $(".uploadmind div").eq(1).html("上传身份证清晰反面照")
            $(".uploadmind div").eq(2).html("上传手持身份证清晰正面照")
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont" + index + "small.png")
            $('.picexample div img').eq(1).attr("src", "/themes/images/cardend" + index + "small.png")
            $('.picexample div img').eq(2).attr("src", "/themes/images/handcard" + index + "small.png")
        }
        if (index == 2) {
            uploading.eq(0).show();
            uploading.eq(1).show();
            $('.picexample div').eq(0).show();
            $('.picexample div').eq(1).show();
            $(".uploadmind div").eq(0).html("上传护照清晰个人资料页").show();
            $(".uploadmind div").eq(1).html("上传手持护照清晰个人资料页").show();
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont" + index + "small.png").show();
            $('.picexample div img').eq(1).attr("src", "/themes/images/handcard" + index + "small.png").show();
        }
        if (index == 3) {
            $(".uploadmind div").show();
            uploading.show();
            $('.picexample div').show();
            $(".uploadmind div").eq(0).html("上传通行证清晰正面照")
            $(".uploadmind div").eq(1).html("上传通行证清晰反面照")
            $(".uploadmind div").eq(2).html("上传手持通行证清晰正面照")
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont" + index + "small.png")
            $('.picexample div img').eq(1).attr("src", "/themes/images/cardend" + index + "small.png")
            $('.picexample div img').eq(2).attr("src", "/themes/images/handcard" + index + "small.png")
        }
        if (index == 4) {
            $(".uploadmind div").show();
            uploading.show();
            $('.picexample div').show();
            $(".uploadmind div").eq(0).html("上传通行证清晰正面照")
            $(".uploadmind div").eq(1).html("上传通行证清晰反面照")
            $(".uploadmind div").eq(2).html("上传手持通行证清晰正面照")
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont" + index + "small.png")
            $('.picexample div img').eq(1).attr("src", "/themes/images/cardend" + index + "small.png")
            $('.picexample div img').eq(2).attr("src", "/themes/images/handcard" + index + "small.png")
        }
        if (index == 5) {
            index = 2;
            uploading.eq(0).show();
            uploading.eq(1).show();
            $('.picexample div').eq(0).show();
            $('.picexample div').eq(1).show();
            $(".uploadmind div").eq(0).html("上传护照清晰个人资料页").show();
            $(".uploadmind div").eq(1).html("上传手持护照清晰个人资料页").show();
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont" + index + "small.png").show();
            $('.picexample div img').eq(1).attr("src", "/themes/images/handcard" + index + "small.png").show();
        }
        if (index == 6) {
            uploading.eq(0).show();
            uploading.eq(1).show();
            $('.picexample div').eq(0).show();
            $('.picexample div').eq(1).show();
            $(".uploadmind div").eq(0).html("上传户口本清晰个人资料页").show();
            $(".uploadmind div").eq(1).html("上传手持户口本清晰个人资料页").show();
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont" + index + "small.png").show();
            $('.picexample div img').eq(1).attr("src", "/themes/images/handcard" + index + "small.png").show();
        }
        if (index == 11) {
            uploading.eq(0).show();
            uploading.eq(1).show();
            $('.picexample div').eq(0).show();
            $('.picexample div').eq(1).show();
            $(".uploadmind div").eq(0).html("上传证件清晰个人资料页").show();
            $(".uploadmind div").eq(1).html('上传手持证件清晰个人资料页').show();
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont" + index + "small.png").show();
            $('.picexample div img').eq(1).attr("src", "/themes/images/handcard" + index + "small.png").show();
        }
        if (index == 7 || index == 8 || index == 9 || index == 10) {
            company.show();
            $('.picexample div').show();
            $(".uploadmindone div").eq(0).html("上传身份证清晰正面照").show()
            $(".uploadmindone div").eq(1).html("上传身份证清晰反面照").show()
            $(".uploadmindone div").eq(2).html("上传手持身份证清晰正面照").show()
            $('.picexample div img').eq(0).attr("src", "/themes/images/cardfont1small.png")
            $('.picexample div img').eq(1).attr("src", "/themes/images/cardend1small.png")
            $('.picexample div img').eq(2).attr("src", "/themes/images/handcard1small.png")
        }
    }
    //点击放大图片示例
    $('.picexampleUse div img').click(function() {
        var num = $(this).data('num');
        var switchBol = $(this).attr("data-bol");
        if (switchBol == 'true') {
            if (num == 0) {
                $(this).attr('src', '/themes/images/cardfont1big.png');
            } else {
                $(this).attr('src', '/themes/images/cardend1big.png');
            }
            $(this).attr("data-bol", "false");
        } else {
            if (num == 0) {
                $(this).attr('src', '/themes/images/cardfont1small.png');
            } else {
                $(this).attr('src', '/themes/images/cardend1small.png');
            }
            $(this).attr("data-bol", "true");
        }
    })

    //点击放大图片示例
    $('.picexample div img').click(function() {
        var ind = $('.picexample div img').index($(this)) + 1;
        var index = $('.personalitemtype select').val();
        var switchBol = $(this).attr("data-bol");
        if (type == 1) {
            index = 1
        }
        if (switchBol) {
            if (ind == 1) {
                if (index == 5) {
                    index = 2;
                }
                $(this).attr("src", "/themes/images/cardfont" + index + "big.png")
            }
            if (index == 2 || index == 5 || index == 6 || index == 11) {
                if (index == 5) {
                    index = 2;
                }
                if (ind == 2) {
                    $(this).attr("src", "/themes/images/handcard" + index + "big.png")
                }
            } else {
                if (ind == 2) {
                    $(this).attr("src", "/themes/images/cardend" + index + "big.png")
                }
                if (ind == 3) {
                    $(this).attr("src", "/themes/images/handcard" + index + "big.png")
                }
            }
            $(this).attr("data-bol", "false");
        }
        if (switchBol == "false") {
            if (index == 2 || index == 5 || index == 6 || index == 11) {
                if (index == 5) {
                    index = 2;
                }
                if (ind == 1) {
                    $(this).attr("src", "/themes/images/cardfont" + index + "small.png")
                }
                if (ind == 2) {
                    $(this).attr("src", "/themes/images/handcard" + index + "small.png")
                }
            } else {
                if (ind == 1) {
                    $(this).attr("src", "/themes/images/cardfont" + index + "small.png")
                }
                if (ind == 2) {
                    $(this).attr("src", "/themes/images/cardend" + index + "small.png")
                }
                if (ind == 3) {
                    $(this).attr("src", "/themes/images/handcard" + index + "small.png")
                }
            }
            $('.picexample div img').eq(ind - 1).attr("data-bol", "true");
        }
    })

    //判断浏览器是否是ie8
    //certificates2-ie1
    if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
        $('.upimgwrap-ie').show();
        $('.upimgwrap').hide();
        $('#userPhoto-ie').attr("onchange", "previewImage(this,'preview-span',2)");
        $('#userPhoto-ie-one').attr("onchange", "previewImage(this,'preview-span-one',3)");
        $('#userPhoto-ie-two').attr("onchange", "previewImage(this,'preview-span-two',4)");
        $('#certificates2-ie1').attr("onchange", "previewImage(this,'certificates2-span1',0)");
        $('#certificates2-ie').attr("onchange", "previewImage(this,'certificates2-span',1)");
        $('#certificates2-ie-one').attr("onchange", "previewImage(this,'certificates2-span-one',2)");
        $('#certificates2-ie-two').attr("onchange", "previewImage(this,'certificates2-span-two',3)");
    }

    $(".picexampleone img").click(function() {
        var switchBol = $(this).attr("data-bol");
        if (switchBol) {
            $(this).attr("src", "/themes/images/company-big.png")
            $(this).attr("data-bol", "false");
        }
        if (switchBol == "false") {
            $(this).attr("src", "/themes/images/company-pic.png")
            $(this).attr("data-bol", "true");
        }
    })

    //我的消息
    function mailpage(pages, totalPages) {
        $(".my_news .personnew .page-wrap").page({
            page: pages, //第几页
            totalPages: totalPages, //总页数
            showNum: 3,
            change: function(data) {
                loadMail(data);
            }
        });
    }
    //加载消息列表
    function loadMail(dNum) {
        var num = 0;
        if (dNum) {
            num = dNum;
        }
        $.ajax({
            url: '/personal-ws/ws/0.1/inmail/mine?state=&pagesize=10&pageindex=' + num + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: true,
            success: function(data) {
                if (data.totalCount > 0) {
                    var newsStr = '';
                    $.each(data.items, function(i, item) {
                        newsStr += '<li style="height: auto;"><p class="itemtitle">' + item.title + '<span class="itemsendtime">' + util.tranferTime(item.sendTime) + '</span></p><p class="itemcontent">' + item.content + '</p></li>'; //lxj0516xiugai
                    });
                    $('.my_news .newsul').html(newsStr);
                    $('.my_news .personnew').show();
                    $('.my_news .noDiv').hide();
                    mailpage(data.page, data.totalPages);
                } else {
                    $('.my_news .personnew').hide();
                    $('.my_news .noDiv').show();
                }
                $.changeMailState(user.id());
            },
            error: function(xhr) {
                // alert(xhr.responseText);
            }
        });
    }


    //我的竞拍------------------------------------------------
    var bulidAuction = function(data, deposit, mylot) {
        var htmlStr = '';
        if (data.items.length == 0) {
            $('#mine-auction').find('.noDiv').show();
            $('#mine-auction').find('.person_auction').hide();
        } else {
            $('#mine-auction').find('.noDiv').hide();

            $.each(data.items, function(index, item) {
                util.changeToEmpty(item)
                if (!item) {
                    return false;
                }

                var lotStatusText = ['即将开始', '正在进行', '已流拍', '已成交', '已中止', '已撤拍', '已暂缓', '已暂停', ''];
                var lotStatusText3 = ['起拍价', '当前价', '起拍价', '成交价', '起拍价', '起拍价', '起拍价', '当前价', ''];
                var lotStatusText2 = ['已缴纳', '已退还', '退款处理中', '退还失败', '划拨处理中', '划拨成功', '划拨失败', '划拨未处理'];
                var imgurl = '';

                htmlStr += '<div data-lotid="' + item.lotId + '" class="tableDiv"><h3><span class="first-span">发布企业：' + item.companyName + '</span><span class="else-span">联系人：' + item.linMan + '</span><span class="else-span2">联系电话：' + item.linkTel + '</span></h3>'
                htmlStr += '<table border="0" cellpadding="0" cellspacing="0"><tr>';

                imgurl = item.pic ? item.pic : '/themes/images/lotdetail.png';

                var shortName = '';
                if (item.name.length <= 32) {
                    shortName = item.name;
                } else {
                    shortName = item.name.substr(0, 31) + '...';
                }

                htmlStr += '<td class="img"><a href="/pages/lots/profession.html?lotId=' + item.lotId + '&meetId=' + item.meetId + '" target="_blank"><img src="' + imgurl + '"> <span>' + shortName + '</span></span></td> ';

                //正在进行、成交的标的 显示当前价
                var _unit = (item.unit) ? '/' + item.unit : '';
                if (deposit == 'true') {
                    htmlStr += '<td class="price"><p class="price-box">保证金<br /><span class="money">' + util.formatCurrency(item.deposit) + '元</span></p></td>';
                } else if (mylot == 'true') {
                    htmlStr += '<td class="price"><p class="price-box price-box-rest">成交价<br /><span class="money">' + util.formatCurrency(item.mutiPrice) + '元</span><br>尾款<br><span class="money">' + util.formatCurrency(item.mutiPrice - item.deposit) + '元</span></p></td>';
                } else {
                    var money = item.startPrice;
                    if (item.lotStatus == 1 || item.lotStatus == 7 || item.lotStatus == 3) {
                        money = item.nowPrice;
                    }
                    htmlStr += '<td class="price"><p class="price-box">' + lotStatusText3[item.lotStatus] + '<br /><span class="money">' + util.formatCurrency(money) + '元' + _unit + '</span></p></td>';
                }

                var bidnum = item.bidNum ? item.bidNum : '121212';
                htmlStr += '<td class="jmh"><p>' + bidnum + '</p></td>';

                if (deposit == 'true') {
                    var deposittxt = '已缴纳';
                    if (item.dptHandleStatus) {
                        deposittxt = lotStatusText2[item.dptHandleStatus];
                    }
                    htmlStr += '<td class=""><input type="button" class="" value="' + deposittxt + '"></td>';
                } else if (mylot == 'true') {
                    htmlStr += '';
                } else {
                    var statustext = lotStatusText[item.lotStatus];
                    var classname = '';
                    if ((item.lotStatus == 1 || item.lotStatus == 7)) {
                        classname = 'start';
                        if (item.subStatus == '0') {
                            statustext = '等待拍卖师操作';
                        }
                    }

                    htmlStr += '<td class="' + classname + '"><input type="button" class="" value="' + statustext + '"></td>';
                }

                if (deposit == 'true') {
                    if (item.applyTime != null) {
                        htmlStr += ' <td class="time"><p class="time-box"><em>缴纳时间</em><br /><span>' + (util.tranferTime2(item.applyTime)) + '</span></p></td>';
                    } else {
                        htmlStr += ' <td class="time"><span></span></td>';
                    }
                } else {
                    if (item.lotStatus == 0) {
                        htmlStr += ' <td class="time"><p class="time-box"><em>开始时间</em><br /><span>' + (util.tranferTime2(item.startTime)) + '</span></p></td>';
                    } else if (item.lotStatus == 4) {
                        htmlStr += ' <td class="time"></td>';
                    } else {
                        htmlStr += ' <td class="time"><p class="time-box"><em>结束时间</em><br /><span>' + (util.tranferTime2(item.endTime)) + '</span></p></td>';
                    }
                }

                if (deposit == 'true') {
                    htmlStr += '<td class="button"><input type="button" class="bond" value="查看保证金" data-lotid="' + item.lotId + '">';
                } else if (mylot == 'true') {
                    // htmlStr += '<td class="button"><input type="button" class="pay-reset" value="支付尾款" data-lotid="' + item.lotId + '">';
                    htmlStr += '<td class="button"><input type="button" class="bond" value="查看保证金" data-lotid="' + item.lotId + '">';
                } else {
                    htmlStr += '<td class="button"><input type="button" class="look" value="查看标的" data-type="' + item.meetType + '" data-lotid="' + item.lotId + '"data-meetid="' + item.meetId + '">';
                }

                htmlStr += '</td></tr></table></div>'
            })
            return htmlStr;
        }
    }

    //查看宝贝
    $('#mine-auction .person_auction').on('click', '.look', function() {
        var lotId = $(this).data('lotid'),
            meetId = $(this).data('meetid');
        window.open('/pages/lots/profession.html?lotId=' + lotId + '&meetId=' + meetId);
    });
    //查看保证金
    $('#mine-auction .person_auction').on('click', '.bond', function() {
        var lotId = $(this).data('lotid');
        showBXJ(lotId);
    });
    //支付尾款
    $('#mine-auction .person_auction').on('click', '.pay-reset', function() {
        //var lotId = $(this).data('lotid');
        //todo支付尾款
    });

    function getAuction(pageindex) {
        var num = 0;
        if (pageindex) {
            num = pageindex;
        }
        var index = $(".tabp .hascheck.active").data('number'),
            isDeal = $('.tabp .active').data('isdeal'),
            $panel = $('#mine-auction .person_auction').eq(index),
            url = '/personal-ws/ws/0.1/my/lots';
        var todata = {
            start: num,
            count: 10,
            sortorder: '',
            sortname: '',
            isDeal: isDeal
        };
        var deposit = 'false';
        if ($('.deposit').hasClass('active')) {
            deposit = 'true';
        }
        var mylot = 'false';
        if (isDeal == 1) {
            mylot = 'true';
        }
        $.ajax({
            url: url,
            async: true,
            data: todata,
            cache: false,
            success: function(data) {
                if (data.totalCount == 0) {
                    $panel.parent().hide().prev().show(); //没有标的时 显示 无标的提示图片
                } else {
                    $panel.parent().show().prev().hide().end().end()
                        .find('.tableDiv').remove().end()
                        .find('ul').after(bulidAuction(data, deposit, mylot)).end()
                        .find(".page-wrap").page({
                            page: data.page, //第几页
                            totalPages: data.totalPages, //总页数
                            showNum: 5,
                            change: function(pageindex) {
                                getAuction(pageindex);
                            }
                        });
                }
                $('.img img').bind("error", function() {
                    this.src = "/themes/images/lotdetail.png";
                });
            }
        });

    }

    function showBXJ(lotId) {
        nowTimeL = (new Date()).getTime();
        var lotStatusText2 = ['已缴纳', '已退还', '已划拨'];
        var info = [
            '如果您竞拍成功，您的保证金将划拨给对应拍卖企业；如果您竞拍失败，您的保证金会在拍卖结束后的3-5个工作日内退还到您支付的银行账户中。',
            '本次拍卖已经结束，您没有竞拍成功，您的保证金会在拍卖结束后的3-5个工作日内退还到您支付的银行账户中。',
            '本次拍卖已经结束，您已竞拍成功，您的保证金将被扣除，如有疑问，请联系对应拍卖企业。'
        ];
        $.getJSON("/personal-ws/ws/0.1/lot/deposit/status/" + lotId + '?time=' + nowTimeL, function(data) {
            $('.my-auct').hide();
            $('.margin-details').show();
            $('.details-order-info .auc-name').html(data.name).removeAttr('href');
            $('.details-order-info .deposit').html(data.deposit + ' 元');
            $('.list-table-tbody .deposit').html(data.deposit);
            $('.list-table-tbody .updateTime').html(util.tranferTime2(data.time));
            $(".personbox").find("h2").html("<span>我的竞拍 - 保证金</span>");
            if (data.depositStatus == '0' || data.depositStatus == '1' || data.depositStatus == '2') {
                $('.list-table-tbody .depositStatus').html(lotStatusText2[data.depositStatus]);
                $('.margin-details-intro .info2').html(lotStatusText2[data.depositStatus]);
                $('.margin-details-intro .info3').html(info[data.depositStatus]);
            } else {
                $('.list-table-tbody .depositStatus').html('');
                $('.margin-details-intro .info2').html('');
                $('.margin-details-intro .info3').html('');
            }


            if (data.isOffLine == '1') {
                $('.list-table-tbody .detail-card ').html('线下支付');
            } else {
                $('.list-table-tbody .detail-card ').html('银行卡');
            }
        });
    }

    //我的拍卖tap
    $(".tabp span.hascheck").click(function() {
        var txt = ["参拍标的", "已拍下", "保证金"]
        var index = $('.tabp span').index(this);
        $(this).addClass("active").siblings().removeClass("active");
        $(this).parents(".personnew").find("div.person_auction").hide().parents(".personbox").find("h2 span:eq(0)").text("我的竞拍 - " + txt[index]);
        var $showPanel = $(this).parents(".personnew").find("div.person_auction").eq(index);
        $showPanel.show();
        getAuction(0);
    });



    function checkUser() {
        var name = $userArtificialName.find('input').val(),
            sex = $userArtificialSex.find('select').val(),
            // mobile = $userArtificialMobile.find('input').val(),
            emails = $userArtificialEmail.find('input').val(),
            idType = $userArtificialType.find('select').val(),
            idNumber = $userArtificialTnum.find('input').val();
        idType = parseInt(idType);
        var userflag = true;
        if (!name || name.length == 0) {
            $userArtificialName.find('em').eq(1).show().html('姓名不能为空');
            userflag = false;
        }

        if (!idNumber || idNumber.length == 0) {
            $userArtificialTnum.find('em').eq(1).show().html('证件号不能为空');
            userflag = false;
        } else if (idType == 1) {
            if (!(yzidnum.test(idNumber))) {
                $userArtificialTnum.find('em').eq(1).show().html('请输入正确的身份证号');
                userflag = false;
            } else {
                $userArtificialTnum.find('em').eq(1).hide();
            }
        }
        if (!userflag) {
            return false;
        }
        var jsonData = {
            name: name,
            sex: sex,
            idType: idType,
            idNumber: idNumber,
            emails: emails
        };
        var idp = [];
        var index = $(".personalitemtype select").val();
        if (index == 2 || index == 5 || index == 6 || index == 7) {
            if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
                uploadimgtwo($('#userPhotoForm'), $('#userPhotoFormone'), idp, jsonData)
            } else {
                uploadimgtwo($('#userPhotoForm-ie'), $('#userPhotoForm-ie-one'), idp, jsonData)
            }
        } else {
            if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
                uploadimgthree($('#userPhotoForm'), $('#userPhotoFormone'), $('#userPhotoFormtwo'), idp, jsonData)
            } else {
                uploadimgthree($('#userPhotoForm-ie'), $('#userPhotoForm-ie-one'), $('#userPhotoForm-ie-two'), idp, jsonData)
            }
        }
    }


    function uploadimgtwo(formone, formtwo, idp, jsonData) {
        // var index = $(".personalitemtype select").val();
        if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
            idp[0] = $('#userPhoto').data('url');
            idp[1] = $('#userPhotoone').data('url');
        }
        var ind;
        if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
            ind = $(".personnew_center .personalitem .upimgwrap img");
            if (ind.length < 2) {
                $(".picerror-msg").show(0).delay(3000).hide(0);
                return false
            }
        } else {
            if ($(".preview-ie-input").eq(2).val() == "" || $(".preview-ie-input").eq(3).val() == "") {
                $(".picerror-msg").show(0).delay(3000).hide(0);
                return false
            }
        }

        $(".picerror-msg").hide();
        formone.ajaxSubmit({
            url: '/caa-oc/ws/0.1/web/certificate/img',
            dataType: "text/plain",
            type: "post",
            async: false,
            success: function(data) {
                data = JSON.parse(data);
                if (data.error) {
                    $userArtificialError.find('em').eq(1).html(data.error).show();
                    return false;
                } else {
                    var arrpicUrl = data[0].url;
                    jsonData.idPhoto = arrpicUrl;
                }
                formtwo.ajaxSubmit({
                    url: '/caa-oc/ws/0.1/web/certificate/img',
                    dataType: "text/plain",
                    type: "post",
                    async: false,
                    success: function(data) {
                        data = JSON.parse(data);
                        if (data.error) {
                            $userArtificialError.find('em').eq(1).html(data.error).show();
                            return false;
                        } else {
                            var arrpicUrl = data[0].url;
                            jsonData.handPhoto = arrpicUrl;
                            submitUser(jsonData);
                        }
                    },
                    error: function() {

                    }
                })
            },
            error: function() {

            }
        })
    }

    function uploadimgthree(formone, formtwo, formthree, idp, jsonData) {
        // var index = $(".personalitemtype select").val();
        if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
            idp[0] = $('#userPhoto').data('url');
            idp[1] = $('#userPhotoone').data('url');
            idp[2] = $('#userPhototwo').data('url');
        }
        for (var i = 0; i < idp.length; i++) {
            if (idp[i] == undefined) {
                $(".picerror-msg").show(0).delay(3000).hide(0);
                return
            } else if (idp[i] != "") {
                jsonData.idPhoto = idp;
                submitUser(jsonData);
                return
            }
        }
        if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
            var ind = $(".personnew_center .personalitem .upimgwrap img")
            if (ind.length < 3) {
                $(".picerror-msg").show(0).delay(3000).hide(0);
                return false
            }
        } else {
            if ($(".preview-ie-input").eq(2).val() == "" || $(".preview-ie-input").eq(3).val() == "" || $(".preview-ie-input").eq(4).val() == "") {
                $(".picerror-msg").show(0).delay(3000).hide(0);
                return false
            }
        }
        $(".picerror-msg").hide();
        formone.ajaxSubmit({
            url: '/caa-oc/ws/0.1/web/certificate/img',
            dataType: "text/plain",
            type: "post",
            async: false,
            success: function(data) {
                data = JSON.parse(data);
                if (data.error) {
                    $userArtificialError.find('em').eq(1).html(data.error).show();
                    return false;
                } else {
                    var arrpicUrl = data[0].url;
                    jsonData.idPhoto = arrpicUrl;
                }
                formtwo.ajaxSubmit({
                    url: '/caa-oc/ws/0.1/web/certificate/img',
                    dataType: "text/plain",
                    type: "post",
                    async: false,
                    success: function(data) {
                        data = JSON.parse(data);
                        if (data.error) {
                            $userArtificialError.find('em').eq(1).html(data.error).show();
                            return false;
                        } else {
                            var arrpicUrl = data[0].url;
                            jsonData.backPhoto = arrpicUrl;
                        }
                        formthree.ajaxSubmit({
                            url: '/caa-oc/ws/0.1/web/certificate/img',
                            dataType: "text/plain",
                            type: "post",
                            async: false,
                            success: function(data) {
                                data = JSON.parse(data);
                                if (data.error) {
                                    $userArtificialError.find('em').eq(1).html(data.error).show();
                                    return false;
                                } else {
                                    var arrpicUrl = data[0].url;
                                    jsonData.handPhoto = arrpicUrl;
                                    if (type == 1) {
                                        submitcompany(jsonData)
                                    } else {
                                        submitUser(jsonData);
                                    }
                                }
                            },
                            error: function() {

                            }
                        })
                    },
                    error: function() {

                    }
                })
            },
            error: function() {

            }
        })
    }

    function submitUser(jsonData) {
        $.ajax({
            url: '/caa-personal-ws/ws/0.1/web/indivauth',
            type: 'post',
            dataType: 'text/plain',
            async: true,
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(jsonData),
            success: function() {
                getcorpcertinfo();
            },
            error: function(xhr) {
                if (xhr.status == 200) {
                    getcorpcertinfo();
                } else {
                    var info = JSON.parse(xhr.responseText);
                    $('.userreal2-error').html(info.error).show(0).delay(3000).hide(0);
                }
            }
        })
    }

    function checkother() {
        var corpName = $mechCropname.find('input').val(),
            frName = $mechFrname.find('input').val(),
            idType = parseInt($mechType.find('select').val()),
            frIdNum = $mechTnum.find('input').val(),
            frTel = $mechTel.find('input').val(),
            emails = $mechEmail.find('input').val(),
            businessNumber = $mechBnumber.find('input').val();

        var flagmech = true;
        if (!corpName || corpName.length == 0) {
            $mechCropname.find('em').eq(1).show().html('机构名称不能为空');
            flagmech = false;
        }
        if (!frName || frName.length == 0) {
            $mechFrname.find('em').eq(1).show().html('法人姓名不能为空');
            flagmech = false;
        }
        if (!frIdNum || frIdNum.length == 0) {
            $mechTnum.find('em').eq(1).show().html('法人身份证号不能为空');
            flagmech = false;
        } else if (!(yzidnum.test(frIdNum))) {
            $mechTnum.find('em').eq(1).show().html('请输入正确的法人身份证号');
            flagmech = false;
        }

        if (!businessNumber || businessNumber.length == 0) {
            $mechBnumber.find('em').eq(1).show().html('证件号不能为空');
            flagmech = false;
        }
        if (!flagmech) {
            return false;
        }
        var jsonData = {
            corpName: corpName,
            frName: frName,
            idType: idType,
            frIdNum: frIdNum,
            businessNumber: businessNumber,
            frTel: frTel,
            emails: emails
        }

        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            formcompany($('#permitphoto-ie1'), $('#permitphoto-ie'), $('#permitphoto-ie-one'), $('#permitphoto-ie-two'), jsonData)
        } else {
            formcompany($('#permitphoto1'), $('#permitphoto'), $('#permitphotoone'), $('#permitphototwo'), jsonData)
        }


        function formcompany(formone, formtwo, formthree, formfour, jsonData) {
            if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
                if ($('#certificates1').val() == "" || $('#certificates1').val() == undefined) {
                    $(".picerror-msg").eq(0).show(0).delay(3000).hide(0);
                    return false;
                }
                if ($('#certificates2').val() == "" || $('#certificates3').val() == "" || $('#certificates4').val() == "") {
                    $(".picerror-msg").eq(1).show(0).delay(3000).hide(0);
                    return false;
                }
            } else {
                if ($(".preview-ie-input").eq(0).val() == "") {
                    $(".picerror-msg").eq(0).show(0).delay(3000).hide(0);
                    return false;
                }
                if ($(".preview-ie-input").eq(1).val() == "" || $(".preview-ie-input").eq(2).val() == "" || $(".preview-ie-input").eq(3).val() == "") {
                    $(".picerror-msg").eq(1).show(0).delay(3000).hide(0);
                    return false
                }
            }
            formone.ajaxSubmit({
                url: '/caa-oc/ws/0.1/web/certificate/img',
                dataType: "text/plain",
                type: "post",
                async: false,
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.error) {
                        $userArtificialError.find('em').html(data.error).show();
                        return false;
                    } else {
                        var arrpicUrl = data[0].url;
                        jsonData.businessPermit = arrpicUrl;
                    }
                    formtwo.ajaxSubmit({
                        url: '/caa-oc/ws/0.1/web/certificate/img',
                        dataType: "text/plain",
                        type: "post",
                        async: false,
                        success: function(data) {
                            data = JSON.parse(data);
                            if (data.error) {
                                $userArtificialError.find('em').html(data.error).show();
                                return false;
                            } else {
                                var arrpicUrl = data[0].url;
                                jsonData.idPhoto = arrpicUrl;
                            }
                            formthree.ajaxSubmit({
                                url: '/caa-oc/ws/0.1/web/certificate/img',
                                dataType: "text/plain",
                                type: "post",
                                async: false,
                                success: function(data) {
                                    data = JSON.parse(data);
                                    if (data.error) {
                                        $userArtificialError.find('em').html(data.error).show();
                                        return false;
                                    } else {
                                        var arrpicUrl = data[0].url;
                                        jsonData.backPhoto = arrpicUrl;
                                    }
                                    formfour.ajaxSubmit({
                                        url: '/caa-oc/ws/0.1/web/certificate/img',
                                        dataType: "text/plain",
                                        type: "post",
                                        async: false,
                                        success: function(data) {
                                            data = JSON.parse(data);
                                            if (data.error) {
                                                $userArtificialError.find('em').html(data.error).show();
                                                return false;
                                            } else {
                                                var arrpicUrl = data[0].url;
                                                jsonData.handPhoto = arrpicUrl;
                                                submitcompany(jsonData)
                                            }
                                        },
                                        error: function() {

                                        }
                                    })
                                },
                                error: function() {

                                }
                            })
                        },
                        error: function() {

                        }
                    })
                },
                error: function() {

                }
            })
        }
    }

    function submitcompany(jsonData) {
        $.ajax({
            url: '/caa-personal-ws/ws/0.1/web/corpauth',
            type: 'post',
            dataType: 'json',
            async: true,
            data: JSON.stringify(jsonData),
            contentType: "application/json;charset=UTF-8",
            success: function() {
                getcorpcertinfo();
            },
            error: function(xhr) {
                if (xhr.status == 200) {
                    getcorpcertinfo();
                } else {
                    var info = JSON.parse(xhr.responseText);
                    $('#mechreal .personnew_center .personalitem .faren_phone').html(info.error).show();
                    return false;
                }
            }
        })
    }
    $('.mech-real-show .toedit-mech').click(function() {
        $('#mechreal').show();
        $('.mech-real-show').hide();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'));
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'));
        }
    });
    $('#mechreal .submit').click(function() {
        //机构人工认证提交
        checkother()
    });
    // $('#mechreal .cancel').click(function(){
    //     //机构人工认证返回
    //     $('#mechreal').hide();
    //     $('.mech-real-show').show();
    //     $('.mech-real-show .nopass').show();
    // });
    // $('input').focus(function() {
    //     $('.error').hide();
    // });
    $('#userAuthentication .usertoperson em').click(function() {
        $('#userreal2').show();
        $('#userreal').hide();
        $('.user-real-show').hide();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'))
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'))
        }
    });
    $('.renzhenginput .usertoperson').click(function() {
        $('#userreal2').show();
        $('#userreal').hide();
        $('.user-real-show').hide();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'))
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'))
        }
    });
    $('.usertomesg').click(function() {
        if (type == 1) {
            $('#mechreal').show();
            $('.mech-real-show').hide();
            $('#mechanismAuthentication #mechreal .personnew_center').show();
            $('#clear_companyname').val('')
        } else {
            $('#userreal2').hide();
            $('#userreal').show();
            $('.user-real-show').hide();
        }
        getmessagesinfo();
    });
    $('.rgrz').click(function() {
        $('#userreal2').show();
        $('#userreal').hide();
        $('.user-real-show').hide();
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
            checkcodeNum($('.upimgwrap-ie'), $('.upimgwrap-com-ie'))
        } else {
            checkcodeNum($('.upimgwrapType'), $('.upimgwrapPhoto'))
        }
    })

    var $usereal = $("#userreal .personalitem"),
        $userRealName = $usereal.eq(0),
        $userRealNum = $usereal.eq(1),
        $userRealMobile = $usereal.eq(2),
        $userRealMsg = $usereal.eq(3);
    // $userRealError = $usereal.eq(5);

    function getmessagesinfo() {
        nowTimeL = (new Date()).getTime();
        $.getJSON("/caa-personal-ws/ws/0.1/web/userinfo?time=" + nowTimeL, function(data) {
            var name = data.name + 1 + '';
            if (name.indexOf('*') == -1) {
                $userRealName.find('input').val(data.name);
            }
            var idNumber = data.idNumber + 1 + '';
            if (idNumber.indexOf('*') == -1) {
                $userRealNum.find('input').val(data.idNumber);
            }

            var mobile = data.mobile + 1 + '';
            if (mobile.indexOf('*') == -1) {
                $userRealMobile.find('input').val(data.mobile);
            }
            $userRealMsg.find('input').val('');
        });
    }

    $(document).on('keyup', '.yz-empty', function() {
        var text = $(this).val();
        if (!text || text.length == 0) {
            var err = $(this).next('em');
            var errname = err.data('info');
            err.html(errname + '不能为空').show();
        } else {
            $(this).next('em').hide();
        }
    });
    $(document).on('keyup', '.yz-tel', function() {
        var phone = $(this).val();
        if (phone == null || phone.length < 10 || !/^1[34578]\d{9}$/.test(phone)) {
            var err = $(this).next('em');
            err.html('请输入正确的手机号码').show();
        } else {
            $(this).next('em').hide();
        }
    });

    $('.yz-idnum').bind('input propertychange', function() {
        var idnum = $(this).val();
        if (idnum.length == 0) {
            $(this).next('em').hide();
        } else if (idnum.length < 10 || !/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idnum)) {
            var err = $(this).next('em');
            err.html('请输入正确的身份证号').show();
        } else {
            $(this).next('em').hide();
        }
    });

    $(document).on('keyup', '.yz-emails', function() {
        var emails = $(this).val();
        if (emails.length == 0) {
            $(this).next('em').hide();
        } else if (emails.length < 10 || !/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(emails)) {
            var err = $(this).next('em');
            err.html('请输入正确的邮箱').show();
        } else {
            $(this).next('em').hide();
        }
    });

    $('.error').click(function(e) {
        $(this).hide();
    })

    //第三方认证
    $('#userreal .submit').click(function() {
        if ($(this).hasClass('notallowed')) {
            return false;
        }
        var name = $userRealName.find('input').val(),
            idNum = $userRealNum.find('input').val(),
            capcha = $userRealMsg.find('input').val();
        var msgflag = true;

        if (!name || name.length == 0) {
            $userRealName.find('em').html('用户姓名不能为空').show();
            msgflag = false;
        }
        if (!idNum || idNum.length == 0) {
            $userRealNum.find('em').html('身份证号不能为空').show();
            msgflag = false;
        } else if (!(yzidnum.test(idNum)) || !idNum) {
            $userRealNum.find('em').html('请输入正确的身份证号').show();
            msgflag = false;
        }

        if (!msgflag) {
            return false;
        }
        if (!capcha || capcha.length == 0) {
            $userRealMsg.find('em').html('请输入有效短信验证码').show();
            return false;
        } else {
            $userRealMsg.find('em').hide();
        }
        var jsondata = {
            realName: name,
            idNum: idNum,
            captcha: capcha
        }
        if (browser != "Microsoft Internet Explorer") {
            if ($("#userreal .upimgwrap img").length < 2) {
                $('#userreal .picerror-msg').show(0).delay(3000).hide(0);
                return false;
            }
        } else {
            if ($(".preview-ie-input").eq(0).val() == "" || $(".preview-ie-input").eq(1).val() == "") {
                $('#userreal .picerror-msg').show(0).delay(3000).hide(0);
                return false
            }

        }
        $(this).addClass('notallowed');
        upidnum(jsondata);
    });

    function upidnum(jsondata) {
        var firstphoto = '',
            secondphoto = '';
        if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
            firstphoto = $('#userPhotoForm2');
            secondphoto = $('#userPhotoFormone2');
        } else {
            firstphoto = $('#userPhotoForm2-ie');
            secondphoto = $('#userPhotoForm2-ie-one');
        }
        firstphoto.ajaxSubmit({
            url: '/caa-oc/ws/0.1/web/certificate/img',
            dataType: "text/plain",
            type: "post",
            async: false,
            success: function(data) {
                data = JSON.parse(data);
                if (data.error) {
                    $('.security-auth-error').html(data.error).show();
                    return false;
                } else {
                    var arrpicUrl = data[0].url;
                    jsondata.idPhoto = arrpicUrl;
                }
                secondphoto.ajaxSubmit({
                    url: '/caa-oc/ws/0.1/web/certificate/img',
                    dataType: "text/plain",
                    type: "post",
                    async: false,
                    success: function(data) {
                        data = JSON.parse(data);
                        if (data.error) {
                            $('.security-auth-error').html(data.error).show();
                            return false;
                        } else {
                            var arrpicUrl = data[0].url;
                            jsondata.backPhoto = arrpicUrl;
                            securityAuth(jsondata);
                        }
                    },
                    error: function() {
                        $('.security-auth-error').html('上传失败').show();
                    }
                })
            },
            error: function() {
                $('.security-auth-error').html('上传失败').show();
            }
        })
    }

    function securityAuth(jsondata) {
        $.ajax({
            url: '/caa-personal-ws/ws/0.1/idnum/security/auth',
            type: 'post',
            contentType: "application/json",
            async: true,
            dataType: 'json',
            data: JSON.stringify(jsondata),
            success: function(data) {
                $('#userreal .submit').removeClass('notallowed');
                if (data.code == '200' || data.code == '01035' || data.code == '09011' || data.code == '09012' || data.code == '09013' || data.code == '01005' || data.code == '09015' || data.code == '08022') {
                    renzhengflag = false;
                    getcorpcertinfo();
                } else {
                    $userRealMsg.find('em').html(data.msg).show();
                }
            },
            error: function(data) {
                $('#userreal .submit').removeClass('notallowed');
                if (data.status == '200') {
                    renzhengflag = false;
                    getcorpcertinfo();
                } else {
                    var info = JSON.parse(data.responseText)
                    $userRealMsg.find('em').html(info.error).show();
                }

            }
        })
    }

    $('#userreal2 .submit').click(function() {
        //用户人工认证提交
        checkUser();
    });
    $('#userAuthentication .cancel').click(function() {
        //用户认证返回
        $('#userreal').show();
        $('#userreal2').hide();
        $('.user-real-show').hide();
        $('.user-real-show .renzheng.nopass').hide();
    });
    var time = 60,
        timerId;
    var sendmessage = function() {
        time--;
        localStorage.time = time;
        localStorage.sendSysTime2 = new Date().getTime();
        if (time > 0) {
            $('.getcode').html(time + '秒');
        } else {
            localStorage.sendFlag2 = false;
            clearInterval(timerId);
            $('.getcode').removeClass('tosend').html('重新获取');
        }
    };

    if (sendFlag2 == 'true') {
        time = localStorage.time;
        var continueFlag = true;
        //根据localStorage中的存的时间判断是否可以点击发送验证码按钮
        if (time > 0) {
            var sysTime2 = localStorage.sendSysTime2;
            var sysNowTime2 = new Date().getTime();
            var timeLast2 = sysNowTime2 - sysTime2;
            if (timeLast2 < 60000 && (time * 1000 - timeLast2) > 0) {
                time -= Math.floor(timeLast2 / 1000);
            } else {
                continueFlag = false;
            }
            if (continueFlag && time > 0) {
                $('.getcode').addClass('tosend').html(time + '秒').addClass('is-send');
                timerId = setInterval(sendmessage, 1000);
            } else {
                continueFlag = false;
            }
        }
        if (!continueFlag) {
            localStorage.sendFlag2 = false;
            localStorage.time = 0;
        }
    }
    //第三方认证发送验证码
    $('.getcode').click(function() {
        if ($(this).hasClass('tosend')) {
            return false;
        } else {
            localStorage.sendFlag2 = true;
            localStorage.time = 0;
            $.ajax({
                url: '/caa-oc/ws/0.1/bidder/security/sms?type=1' + "&time=" + (new Date().getTime()),
                type: 'get',
                dataType: 'json',
                cache: false,
                async: true,
                success: function(data) {
                    if (data == 0) {
                        $('.getcode').parent().next('.error').html('您今日短信次数已用完').show();
                    } else {
                        time = 60;
                        $('.getcode').addClass('tosend').html(time + '秒');
                        timerId = setInterval(sendmessage, 1000);
                    }
                },
                error: function() {}
            })
        }
    });

    var sendTime = 60,
        sendTimerId;
    //计时
    var showSendTime = function() {
        sendTime--;
        localStorage.sendTime = sendTime;
        localStorage.sendSysTime = new Date().getTime();
        if (sendTime > 0) {
            $('.get-bind-code').html(sendTime + '秒');
        } else {
            localStorage.sendFlag = false;
            clearInterval(sendTimerId);
            $('.get-bind-code').removeClass('tosend').html('重新获取');
        }
    };
    //已发送验证码
    if (sendFlag) {
        var continueFlag2 = true;
        //根据localStorage中的存的时间判断是否可以点击发送验证码按钮
        sendTime = localStorage.sendTime;
        if (sendTime > 0) {
            var sysTime = localStorage.sendSysTime;
            var sysNowTime = new Date().getTime();
            var timeLast = sysNowTime - sysTime;
            if (timeLast < 60000 && (sendTime * 1000 - timeLast) > 0) {
                sendTime -= Math.floor(timeLast / 1000);
            } else {
                continueFlag2 = false;
            }
            if (continueFlag2 && sendTime > 0) {
                $('.get-bind-code').addClass('tosend').html(sendTime + '秒').addClass('is-send');
                sendTimerId = setInterval(showSendTime, 1000);
            } else {
                continueFlag2 = false;
            }
        }
        if (!continueFlag2) {
            localStorage.sendFlag = false;
            localStorage.sendTime = 0;
        }
    }
    //绑定手机号
    $('.get-bind-code').click(function() {
        if ($(this).hasClass('tosend')) {
            return false;
        } else {
            localStorage.sendFlag = true;
            var mobile = $('.bind-user-tel').val();
            var capcha = $('.bind-user-capcha').val();
            if (!mobile) {
                $('.bind-user-tel').next('em').html('手机号不能为空').show(0).delay(3000).hide(0);
                return false;
            } else if (!(yzmobile.test(mobile))) {
                $('.bind-user-tel').next('em').html('请输入正确的手机号码').show(0).delay(3000).hide(0);
                return false;
            } else if (!capcha) {
                $('.bind-user-capcha').parent().next('em').html('图形验证码不能为空').show(0).delay(3000).hide(0);
                return false;
            } else {
                var jsonData = {
                    piccha: capcha,
                    mobile: mobile
                }
                $.ajax({
                    url: '/caa-personal-ws/ws/0.1/bind/send/captcha',
                    type: 'post',
                    contentType: "application/json",
                    dataType: 'json',
                    async: true,
                    data: JSON.stringify(jsonData),
                    success: function(data) {
                        if (data.status == 200) {
                            sendTime = 60;
                            $('.get-bind-code').addClass('tosend').html(sendTime + '秒');
                            sendTimerId = setInterval(showSendTime, 1000);
                        } else {
                            var info = JSON.parse(data.responseText);
                            $('.bind-user-capcha').parent().next('em').html(info.error).show(0).delay(3000).hide(0);
                            getVeriCode();
                        }
                    },
                    error: function(data) {
                        //返回值位置
                        if (data.status == 200) {
                            sendTime = 60;
                            $('.get-bind-code').addClass('tosend').html(sendTime + '秒');
                            sendTimerId = setInterval(showSendTime, 1000);
                        } else {
                            var info = JSON.parse(data.responseText);
                            $('.bind-user-capcha').parent().next('em').html(info.error).show(0).delay(3000).hide(0);
                            getVeriCode();
                        }

                    }
                })
            }
        }
    });


    //ie点击图片删除按钮清空图片
    $('.preview-ie-wrap').on('click', '.ie-remove', function() {
        var removeA = $(this);
        removeA.siblings('span').css('filter', 'none');
        var idStr = removeA.parents().siblings('input').attr('id');
        removeA.parents().siblings('input').attr('value', "");
        var obj = document.getElementById(idStr);
        obj.select();
        document.selection.clear();
        removeA.hide();
    });
});
//图片上传预览    IE是用了滤镜。
function previewImage(file, divId, i) {
    if ($(".preview-ie-input").eq(i).val() == "") {
        $(".picerror-msg").show(0).delay(3000).hide(0);
        return
    } else {
        // var MAXWIDTH = 260;
        // var MAXHEIGHT = 180;
        var div = document.getElementById(divId);
        $('.ie-remove').eq(i).show();
        div.style.display = 'block';
        // var div = document.getElementById(divId);
        file.select();
        top.parent.document.body.focus();
        var src = document.selection.createRange().text;
        document.selection.empty();
        div.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
        div.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = src;
        $(".preview-ie-input").eq(i).val(src)
    }
}