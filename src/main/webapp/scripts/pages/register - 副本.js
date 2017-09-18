/**
 * Created by xingzheng on 2017/3/20.
 */
$(function() {
    var succUser; //用户名称
    var codeVal, phone; //手机号码 验证码
    var sub = 0; //账户类型下标
    var random; //获取后台发的随机数
    var type; //用来检测是忘记密码页面还是注册页面
    var Type;
    if (window.location.pathname.indexOf("register") != -1) {
        type = 1;
        Type = "5";
        $(document).attr("title", '个人用户注册_中拍平台');
    } else {
        type = 2;
        Type = "6";
    }
    //账户类型的切换
    var typeBol = true;
    var clickBol = false;
    $(".select-account h3").eq(1).click(function() {
        if (typeBol) {
            $(".company-account img").attr("src", "/themes/images/register-person.png")
            $(".company-account h3").html("切换成个人用户注册");
            $(".person-account h3").html("机构注册");
            $(document).attr("title", '拍卖机构注册_中拍平台');
            sub = 1;
            typeBol = false;
        } else {
            $(".company-account img").attr("src", "/themes/images/company-register.png")
            $(".company-account h3").html("切换成机构用户注册");
            $(".person-account h3").html("个人注册");
            $(document).attr("title", '个人用户注册_中拍平台');
            sub = 0;
            typeBol = true;
        }
    })

    //调取图片验证码
    function getVeriCode() {
        $(".code-num img").attr("src", "/caa-personal-ws/ws/0.1/captcha/image/jpeg?time=" + new Date().getTime())
    }
    getVeriCode()
    $(".code-num img").click(function() {
        getVeriCode();
    });
    //检测手机号部分
    $('.phone-num').keyup(function() {
        phone = $(".phone-num").val();
        if (phone == null || phone.length < 10 || !/^1[34578]\d{9}$/.test(phone)) {
            $(".phone-error").show();
            $(".phone-error img").attr("src", "/themes/images/icon-err-two.png");
            $(".phone-error span").html("请输入正确的手机号")
        } else {
            if (type == 1) {
                $(".phone-error").show();
                $(".phone-error img").attr("src", "/themes/images/right-icon.png");
                $(".phone-error span").html("")
            } else {
                $(".phone-error").hide();
            }
        }
    });
    //验证码随机
    $(".code-value").keyup(function() {
            if ($(".code-value").val() == "") {
                $(".code-error").show();
                $(".code-error img").attr("src", "/themes/images/icon-err-two.png")
                $(".code-error span").html("请输入验证码");
            } else {
                $(".code-error").hide();
            }
        })
        //    同意协议
    var agreeBol = true;
    $(".agree-pic").click(function() {
            if (agreeBol) {
                $(".agree-pic").attr("src", "/themes/images/unagree-icon.png")
                agreeBol = false;
                $(".next-step em").css({
                    "opacity": "0.6"
                })
                $(".agree-error").show();
            } else {
                $(".agree-pic").attr("src", "/themes/images/agree-icon.png");
                $(".agree-error").hide()
                agreeBol = true;
                if ($(".phone-num").val() != "" && $(".code-value").val() != "") {
                    $(".next-step em").css({
                        "opacity": "1"
                    })
                }
            }
        })
        //点击下一步
    function toggle(index) {
        for (var i = 0; i < $(".account").length; i++) {
            $(".account").eq(i).hide();
        }
        $(".account").eq(index).show();
    }
    //验证码倒计时
    var timer = null;

    function msgTime(time) {
        timer = setInterval(function() {
            time--;
            if (time == 0) {
                $(".code-time").html("重新发送")
                clearInterval(timer);
                $(".code-time").css({
                    cursor: "pointer"
                })
                var clickBol = true; //防止点击触发多次
                $(".code-time").click(function() {
                    if (clickBol) {
                        var minute = 60;
                        msgTime(minute);
                        msgCall(timeRandom);
                        $(".callMsg-error").hide();
                    }
                    clickBol = false;
                })
                return;
            }
            if (time < 10) {
                time = "0" + time;
            }
            $(".code-time").html(time + "s")
        }, 1000)
    }
    //调取短信验证码接口
    function msgCall(random) {
        $.ajax({
            type: "post",
            url: "/caa-personal-ws/ws/0.1/user/send/captcha",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            data: random,
            success: function(data) {

            },
            error: function(data) {

            }
        })
    }

    function showMsg(_self) {
        _self.show();
        _self.find("img").attr("src", "/themes/images/icon-err-two.png");
    }
    var timeRandom; //用来接收传递的随机数
    var skipTimer; //5秒返回首页的倒计时
    $(".next-step").click(function() {
            codeVal = $(".code-value").val();
            var ind = $(".next-step").index($(this))
            if (ind != 1) {
                clearInterval(timer)
            }
            if (ind == 0) {
                if (!agreeBol) {
                    return
                }
                //填写手机号 验证码 同意注册拍卖协议
                if (phone == null || phone.length < 10 || !/^1[34578]\d{9}$/.test(phone)) {
                    showMsg($(".phone-error"))
                    $(".phone-error span").html("请输入正确的手机号");
                    return
                }
                if (codeVal == '') {
                    showMsg($(".code-error"))
                    $(".code-error span").html("请输入正确的验证码");
                    return
                }
            }
            //第一步提交手机号和验证码  返回随机数
            if (ind == 0 && $("input").val() != "") {
                var _url = ''
                if (type == '1') {
                    _url = '/caa-personal-ws/ws/0.1/register/mobile/validity'
                } else {
                    _url = '/caa-personal-ws/ws/0.1/reset/password/mobile/validity'
                }
                var json = {};
                json.mobile = phone;
                json.captcha = codeVal;
                var str = JSON.stringify(json);
                var status = 0;
                $.ajax({
                    type: "post",
                    url: _url,
                    contentType: "application/json;charset=UTF-8",
                    dataType: "json",
                    async: false,
                    data: str,
                    success: function(data) {
                        random = data.random;
                        var json = {};
                        json.random = data.random;
                        json.type = Type;
                        timeRandom = JSON.stringify(json)
                        msgCall(timeRandom)
                        $(".company-account").hide()
                        if (sub == 0) {
                            $(".person-account h3").html("个人账户注册");
                        } else {
                            $(".person-account h3").html("企业账户注册");
                        }
                    },
                    error: function(data) {
                        status = JSON.parse(data.responseText)
                    }
                })
                if (status.error) {
                    if (status.error.indexOf('手机号已注册') > -1) {
                        $(".phone-error").show();
                        $(".phone-error img").attr("src", "/themes/images/icon-err.png");
                        $(".phone-error span").html(status.error);
                    } else {
                        $(".code-error").show();
                        $(".code-error img").attr("src", "/themes/images/icon-err.png")
                        $(".code-error span").html(status.error);
                    }
                    getVeriCode()
                    return
                }
            }
            //短信为空不能往下进行
            if ($(".msg-code").val() == "" && ind == 1) {
                showMsg($(".callMsg-error"))
                $(".callMsg-error span").html("请输入验证码");
                return
            }
            //手机短信验证
            if ($(".msg-code").val() != "" && ind == 1) {
                $(".callMsg-error").hide();
                var effect = {};
                effect.random = random;
                effect.captcha = $(".msg-code").val();
                var url = '';
                if (type == 1) {
                    url = "/caa-personal-ws/ws/0.1/register/mobile/captcha";
                } else {
                    url = "/caa-personal-ws/ws/0.1/reset/password/mobile/captcha";
                }
                $.ajax({
                    type: "post",
                    url: url,
                    dataType: "json",
                    async: false,
                    contentType: "application/json;charset=UTF-8",
                    data: JSON.stringify(effect),
                    success: function(data) {
                        if (data.status == "success") {
                            succUser = data.username;
                        }
                    },
                    error: function(data) {
                        status = JSON.parse(data.responseText)
                        $(".callMsg-error").show();
                        $(".callMsg-error img").attr("src", "/themes/images/icon-err.png");
                        $(".callMsg-error span").html(status.error);
                    }
                })
                if (status) {
                    return false;
                }
            }
            //用户名 密码 为空return
            if ($(".username").val() == "" && ind == 2) {
                showMsg($(".user-error"))
                $(".user-error em").html("支持中文、字母、数字、“-”、“_”的组合，4-20个字符").parents('span').delay(6000).hide(0);
                return
            }
            if ($(".pass-num").val() == "" && ind == 2 || $(".pass-num").length > 20) {
                showMsg($(".pass-error"))
                $(".pass-error span").html("建议使用字母、数字和符号两种及以上的组合，6-20个字符").parents('span').delay(6000).hide(0)
                return
            }
            if ($(".repeat-pass").val() == "" && ind == 2) {
                $(".repeat-error").show()
                return;
            }
            if ($(".repeat-pass").val() != $(".pass-num").val() && ind == 2) {
                $(".repeat-error").show()
                return
            }
            if (!(/^[\u4e00-\u9fa5\w]+$/g).test($('.username').val()) && ind == 2) {
                $(".user-error").show();
                $(".user-error img").attr("src", "/themes/images/icon-err-two.png");
                $(".user-error em").html("不能含有非法字符")
                return
            }
            if (ind == 2) {
                var ifBol;
                if (type == 1) {
                    ifBol = $(".pass-num").val().length >= 6 && $(".username").val().length > 3
                } else {
                    ifBol = $(".pass-num").val().length >= 6
                }
                if (ifBol) {
                    succUser = $('.username').val()
                    var user = {};
                    if (type == 1) {
                        user.mobile = phone;
                        user.username = succUser;
                        user.type = sub;
                        user.password = $.md5($(".pass-num").val());
                        user.repassword = $.md5($(".repeat-pass").val());
                        url = "/caa-personal-ws/ws/0.1/register/user";
                    } else {
                        user.mobile = phone;
                        user.password = $.md5($(".pass-num").val());
                        user.repassword = $.md5($(".repeat-pass").val());
                        url = "/caa-personal-ws/ws/0.1/reset/password";
                    }
                    $.ajax({
                        type: "post",
                        url: url,
                        dataType: "json",
                        async: false,
                        contentType: "application/json;charset=UTF-8",
                        data: JSON.stringify(user),
                        success: function(data) {
                            if (type == 1 && data.status) {
                                var count = 5;
                                skipTimer = setInterval(function() {
                                    count--;
                                    $(".lateron em").html(count);
                                    if (count == 0) {
                                        clearInterval(skipTimer);
                                        window.location.href = "/index.html"
                                    }
                                }, 1000)
                            }
                        },
                        error: function(data) {
                            var bol = true;
                            if (data.status != '200') {
                                status = JSON.parse(data.responseText);
                                $(".user-error").show();
                                $(".user-error img").attr("src", "/themes/images/icon-err.png");
                                $(".user-error em").html(status.error);
                                bol = false;
                            }
                            if (type == 1 && bol) {
                                var count = 5;
                                skipTimer = setInterval(function() {
                                    count--;
                                    $(".lateron em").html(count);
                                    if (count == 0) {
                                        clearInterval(skipTimer);
                                        window.location.href = "/index.html"
                                    }
                                }, 1000)
                            }
                        }
                    })
                    if (status) {
                        return
                    }
                } else {
                    if (type == 1) {
                        var str1 = $(".username").val();
                        var txt = $(".pass-num").val();
                        if (/^[\u4e00-\u9fa5]+$/g.test(str1) && str1.length <= 1) {
                            showMsg($(".user-error"))
                            $(".user-error em").html("用户名过短")
                            return
                        }
                        if (str1.length <= 3 && ind == 2 && /^[\u4e00-\u9fa5]+$/g.test(str1)) {
                            showMsg($(".user-error"))
                            $(".user-error em").html("用户名过短")
                            return
                        }
                        if (txt.length <= 5 && ind == 2) {
                            showMsg($(".pass-error"))
                            $(".pass-error span").html("密码不可低于6位！")
                            return
                        }
                    } else {
                        var txt1 = $(".pass-num").val();
                        if (txt1.length <= 5 && ind == 2) {
                            showMsg($(".pass-error"))
                            $(".pass-error span").html("密码不可低于6位！")
                            return
                        }
                    }
                }
            }
            //上面4步骤的变色
            $(".registerStep").eq(parseInt(ind + 1)).addClass("on")
            $(".step-slider").eq(parseInt(ind + 1)).addClass("step-slider-on")
            $(".step-area").eq(parseInt(ind + 1)).addClass("step-area-on")
            clickBol = false;
            $(".next-step em").css({
                    "opacity": "0.6"
                })
                //调用点击下一步的封装
            toggle(parseInt(ind + 1))
            $(".phone-bind").html(phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'))
            var time = 60;
            $(".code-time").html(time + "s")
            msgTime(time)
            $(".success-phone").html(phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'))
            $(".success-username").html(succUser)
        })
        //检测用户名
    $(".username").keyup(function() {
            var str = $(".username").val();
            var re1 = /^[\u4e00-\u9fa5\w\-]+$/g;
            var length;
            if (!/^[\u4e00-\u9fa5]+$/g.test(str)) {
                length = 4
            } else {
                length = 2
            }
            if (str.length < length) {
                showMsg($(".user-error"))
                $(".user-error em").html("支持中文、字母、数字、“-”、“_”的组合，4-20个字符").parents('span').delay(6000).hide(0)
                return
            }
            if (!re1.test(str)) {
                $(".user-error").show();
                $(".user-error img").attr("src", "/themes/images/icon-err-two.png");
                $(".user-error em").html("不能含有非法字符")
                return
            } else {
                $(".user-error").show();
                $(".user-error img").attr("src", "/themes/images/right-icon.png");
                $(".user-error em").html("")
            }
            if (/^[\u4e00-\u9fa5]+$/g.test(str) && str.length <= 1) {
                showMsg($(".user-error"))
                $(".user-error em").html("用户名过短")
                return
            }
            if (/^[\u4e00-\u9fa5]+$/g.test(str) && str.length > 10) {
                showMsg($(".user-error"))
                $(".user-error em").html("用户名过长")
                return
            }
            if (str.length <= 3 && !(/^[\u4e00-\u9fa5]+$/g).test(str)) {
                showMsg($(".user-error"))
                $(".user-error em").html("用户名过短")
                return
            }
            if (/^\d+$/g.test(str)) {
                $(".user-error").show();
                $(".user-error img").attr("src", "/themes/images/icon-err-two.png");
                $(".user-error em").html("用户名不能是纯数字，请重新输入！")
                return
            }
        })
        //检测密码
    function checkPass(a) {
        if (a == 1) {
            $(".middle").hide();
            $(".strong").hide();
            $(".young").show();
            $(".young").css({
                width: "33.33%",
                background: "#f7797e",
                "border-radius": "10px" + " " + "0px" + " " + "0px" + " " + "10px"
            })
        }
        if (a == 2) {
            $(".young").hide();
            $(".strong").hide();
            $(".middle").show();
            $(".middle").css({
                width: "66.66%",
                background: "#f8c939",
                "border-radius": "10px" + " " + "0px" + " " + "0px" + " " + "10px"
            })
        }
        if (a == 3) {
            $(".young").hide();
            $(".middle").hide();
            $(".strong").show()
            $(".strong").css({
                width: "100%",
                background: "#6fe575",
                "border-radius": "10px"
            })
        }
    }
    $(".pass-num").keyup(function() {
        var txt = $(this).val();
        if (txt.length < 6 && txt.length != 0) {
            $(".pass-error").show();
            $(".pass-error img").attr("src", "/themes/images/icon-err.png");
            $(".pass-error span").html("密码不可低于6位！")
            return
        }
        if (txt == "") {
            showMsg($(".pass-error"))
            $(".pass-error span").html("建议使用字母、数字和符号两种及以上的组合，6-20个字符").parents('span').delay(6000).hide(0)
            $(".check-password div").css({
                width: "33.33%",
                background: "#e0e0e0",
                "border-radius": "10px"
            })
            $(".middle").show();
            $(".strong").show();
            $(".young").show();
            return
        }
        if (txt.length > 0) {
            showMsg($(".pass-error"))
            $(".pass-error span").html("建议使用字母、数字和符号两种及以上的组合，6-20个字符").parents('span').delay(6000).hide(0)
        }
        if (txt.length >= 6) {
            //数字组合
            if (/\d+/.test(txt)) {
                checkPass(1)
                if (txt.length > 15) {
                    checkPass(2)
                }
                if (txt.length > 10 && /\W+/.test(txt)) {
                    checkPass(2)
                }
                if (txt.length > 15 && /\W+/.test(txt)) {
                    checkPass(3)
                }
                if (/[a-z]+/.test(txt) || /[A-Z]+/.test(txt)) {
                    checkPass(1)
                    if (txt.length > 10) {
                        checkPass(2)
                        if (txt.length > 15) {
                            checkPass(3)
                        }
                    }
                    if (/\W+/.test(txt)) {
                        checkPass(1)
                        if (/\W+/.test(txt) && /[a-z]+/.test(txt) && /[A-Z]+/.test(txt) && txt.length >= 6) {
                            checkPass(2)
                        }
                        if (/\W+/.test(txt) && /[a-z]+/.test(txt) && txt.length > 6) {
                            checkPass(2)
                            if (/\W+/.test(txt) && /[a-z]+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 10) {
                                checkPass(3)
                            }
                        }
                        if (/\W+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 6) {
                            checkPass(2)
                            if (/\W+/.test(txt) && /[a-z]+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 10) {
                                checkPass(3)
                            }
                        }
                        if (/\W+/.test(txt) && /[a-z]+/.test(txt) && txt.length > 15) {
                            checkPass(3)
                        }
                        if (/\W+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 15) {
                            checkPass(3)
                        }
                    }
                }
            }
            //    字母组合
            else if (/[a-z]+/.test(txt) || /[A-Z]+/.test(txt)) {
                checkPass(1)
                if (txt.length > 15) {
                    checkPass(2)
                }
                if (txt.length > 10 && /\W+/.test(txt)) {
                    checkPass(2)
                }
                if (txt.length > 15 && /\W+/.test(txt)) {
                    checkPass(3)
                }
            }
            //    特殊字符
            else if (/\W+/.test(txt)) {
                checkPass(1)
                if (txt.length > 15) {
                    checkPass(2)
                }
            }
        }
    })
    $(".pass-num").click(function() {
        showMsg($(".pass-error"))
        $(".pass-error span").html("建议使用字母、数字和符号两种及以上的组合，6-20个字符").parents('span').delay(6000).hide(0)
    })
    $(".repeat-pass").keyup(function() {
            var passVal1 = $(".pass-num").val();
            var passVal2 = $(".repeat-pass").val();
            if (passVal1 != passVal2) {
                $(".repeat-error").show()
            } else {
                $(".repeat-error").hide()
                $(".pass-error").hide()
            }
        })
        //跳转登录页面
    $(".forget_step_four").click(function() {
            window.location.href = "./login.html"
        })
        //$(".agreement").click(function(){
        //    window.location.href = "login.html"
        //})
    $(".at-once").click(function() {
        clearInterval(skipTimer);
        window.location.href = "/pages/personal/home.html?showuse=2"
    })
    $(".lateron").click(function() {
            clearInterval(skipTimer);
            window.location.href = "/index.html"
        })
        //注册协议
    $(".agreement").click(function() {
        $(".agreement-wrap").show()
    })
    $(".agreement-close").click(function() {
        $(".agreement-wrap").hide()
    })
    $(".continue").click(function() {
        $(".agreement-wrap").hide()
        $(".agree-pic").attr("src", "/themes/images/agree-icon.png")
    })
    $(".next-step").mousedown(function() {
        $(".next-step").addClass("pressed")
        $(".next-step").removeClass("btnhover");
        $(".next-step").mouseup(function() {
            $(".next-step").removeClass("pressed");
        })
    })
    $(".next-step").mouseover(function() {
        if (clickBol) {
            $(".next-step").addClass("btnhover")
        }
        $(".next-step").mouseout(function() {
            $(".next-step").removeClass("btnhover");
        })
    })
    $(".account-one input").each(function(i) {
        $(".account-one input").keyup(function() {
            if ($(".account-one input").eq(i).val() == "" || !agreeBol) {
                $(".next-step em").css({
                    "opacity": "0.6"
                })
                clickBol = false;
            } else {
                if (agreeBol && $(".account-one input").eq(0).val() != "" && $(".account-one input").eq(1).val() != "") {
                    $(".next-step em").css({
                        "opacity": "1"
                    })
                    clickBol = true;
                }
            }
        })
    })
    $(".account-two input").each(function(i) {
        $(".account-two input").keyup(function() {
            if ($(".account-two input").eq(i).val() == "") {
                $(".next-step em").css({
                    "opacity": "0.6"
                })
                clickBol = false;
            } else {
                $(".next-step em").css({
                    "opacity": "1"
                })
                clickBol = true;
            }
        })
    })
    $(".account-three input").each(function(i) {
        $(".account-three input").keyup(function() {
            if ($(".account-three input").eq(i).val() == "") {
                $(".next-step em").css({
                    "opacity": "0.6"
                })
                clickBol = false;
            } else {
                $(".next-step em").css({
                    "opacity": "1"
                })
                clickBol = true;
            }
        })
    })
    $(".account-four input").each(function(i) {
        $(".account-four input").keyup(function() {
            if ($(".account-four input").eq(i).val() == "") {
                $(".next-step em").css({
                    "opacity": "0.6"
                })
                clickBol = false;
            } else {
                $(".next-step em").css({
                    "opacity": "1"
                })
                clickBol = true;
            }
        })
    })
})