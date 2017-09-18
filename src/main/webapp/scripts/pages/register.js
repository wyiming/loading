$(document).ready(function() {
    PAGE_CONTROLLER.getVeriCode();
})
var PAGE_DATA = {
    type: "", //页面是个人注册还是找回密码
    toggleOne: true,
    sub: 0, //个人还是机构
    random: "", //注册第二步操作给接口穿的随机数
    Type: "", //发送短信那一步给后台传送注册还是找回密码
    url: "", //根据页面不同URL也变化
    clickBol: false,
    skipTimer: "",
    phoneNum: "" //注册成功的时候显示的手机号码
}
if (window.location.pathname.indexOf("register") != -1) {
    PAGE_DATA.type = 1;
    PAGE_DATA.Type = "5";
    $(document).attr("title", '个人用户注册_中拍平台');
} else {
    PAGE_DATA.type = 2;
    PAGE_DATA.Type = "6";
}
var PAGE_CONTROLLER = {
    getVeriCode: function() {
        $(".code-num img").attr("src", "/caa-personal-ws/ws/0.1/captcha/image/jpeg?time=" + new Date().getTime())
    },
    showMsg: function(_self, bol) {
        _self.show();
        if (bol) {
            _self.find("img").attr("src", "/themes/images/right-icon.png");
        } else {
            _self.find("img").attr("src", "/themes/images/icon-err-two.png");
        }
    },
    msgTime: function(time) {
        var timer;
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
                        PAGE_CONTROLLER.msgTime(minute);
                        PAGE_CONTROLLER.msgCall(PAGE_DATA.timeRandom);
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
    },
    msgCall: function(random) {
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
    },
    checkPass: function(a) {
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
};
(function($) {
    var typeBol = true;
    $(".select-account h3").eq(1).click(function() {
        if (typeBol) {
            $(".company-account img").attr("src", "/themes/images/register-person.png")
            $(".company-account h3").html("切换成个人用户注册");
            $(".person-account h3").html("机构注册");
            $(document).attr("title", '拍卖机构注册_中拍平台');
            PAGE_DATA.sub = 1;
            typeBol = false;
        } else {
            $(".company-account img").attr("src", "/themes/images/company-register.png")
            $(".company-account h3").html("切换成机构用户注册");
            $(".person-account h3").html("个人注册");
            $(document).attr("title", '个人用户注册_中拍平台');
            PAGE_DATA.sub = 0;
            typeBol = true;
        }
    })
    $(".code-num img").click(function() {
        PAGE_CONTROLLER.getVeriCode();
    });
    $('.phone-num').keyup(function() { //校验手机号
        PAGE_DATA.phoneNum = $(".phone-num").val();
        if (PAGE_DATA.phoneNum.length < 10 || !/^1[34578]\d{9}$/.test(PAGE_DATA.phoneNum)) {
            PAGE_CONTROLLER.showMsg($('.phone-error'), false);
            $(".phone-error span").html("请输入正确的手机号");
            PAGE_DATA.toggleOne = false;
        } else {
            if (PAGE_DATA.type == 1) {
                PAGE_CONTROLLER.showMsg($('.phone-error'), true);
                $(".phone-error span").html("")
            } else {
                $(".phone-error").hide();
            }
            PAGE_DATA.toggleOne = true;
        }
    });
    //  同意协议
    var agreeBol = true;
    $(".agree-pic").click(function() {
        if (agreeBol) {
            $(".agree-pic").attr("src", "/themes/images/unagree-icon.png")
            agreeBol = false;
            $(".agree-error").show();
        } else {
            $(".agree-pic").attr("src", "/themes/images/agree-icon.png");
            $(".agree-error").hide()
            agreeBol = true;
        }
    })
    $('.J-step-one').click(function() {
        PAGE_DATA.url = "/caa-personal-ws/ws/0.1/register/mobile/validity";
        if (PAGE_DATA.type == 2) {
            agreeBol = true;
            PAGE_DATA.url = "/caa-personal-ws/ws/0.1/reset/password/mobile/validity";
        }
        if (PAGE_DATA.toggleOne && agreeBol && $('.code-value').val()) {
            var json = {};
            json.mobile = PAGE_DATA.phoneNum;
            json.captcha = $('.code-value').val();
            $.ajax({
                type: "post",
                url: PAGE_DATA.url,
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                async: true,
                data: JSON.stringify(json),
                success: function(data) {
                    PAGE_DATA.random = data.random;
                    var json = {};
                    json.random = data.random;
                    json.type = PAGE_DATA.Type;
                    PAGE_DATA.timeRandom = JSON.stringify(json);
                    $(".phone-bind").html(PAGE_DATA.phoneNum.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'))
                    var time = 60;
                    $(".code-time").html(time + "s")
                    PAGE_CONTROLLER.msgTime(time);
                    PAGE_CONTROLLER.msgCall(PAGE_DATA.timeRandom);
                    $(".registerStep").eq(1).addClass("on")
                    $(".step-slider").eq(1).addClass("step-slider-on")
                    $(".step-area").eq(1).addClass("step-area-on")
                    $('.account-one').hide();
                    $('.account-two').show();
                    $(".company-account").hide()
                    if (PAGE_DATA.sub == 0) {
                        $(".person-account h3").html("个人注册");
                    } else {
                        $(".person-account h3").html("机构注册");
                    }
                },
                error: function(data) {
                    var status = JSON.parse(data.responseText);
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
                        PAGE_CONTROLLER.getVeriCode()
                    }
                }
            })
        }
    })
    $('.J-step-two').click(function() {
        if (PAGE_DATA.type == 1) {
            PAGE_DATA.url = "/caa-personal-ws/ws/0.1/register/mobile/captcha";
        } else {
            PAGE_DATA.url = "/caa-personal-ws/ws/0.1/reset/password/mobile/captcha";
        }
        if (!$('.msg-code').val()) {
            PAGE_CONTROLLER.showMsg($(".callMsg-error"), false)
            $(".callMsg-error span").html("请输入验证码");
        } else {
            $(".callMsg-error").hide();
            var effect = {};
            effect.random = PAGE_DATA.random;
            effect.captcha = $(".msg-code").val();
            $.ajax({
                type: "post",
                url: PAGE_DATA.url,
                dataType: "json",
                async: true,
                contentType: "application/json;charset=UTF-8",
                data: JSON.stringify(effect),
                success: function(data) {
                    if (data.status == "success") {
                        $('.account-two').hide();
                        $('.account-three').show();
                        $(".registerStep").eq(2).addClass("on")
                        $(".step-slider").eq(2).addClass("step-slider-on")
                        $(".step-area").eq(2).addClass("step-area-on")
                        if (PAGE_DATA.type == 2) {
                            $('.success-username').html(data.username)
                        }
                    }
                },
                error: function(data) {
                    var status = JSON.parse(data.responseText);
                    $(".callMsg-error").show();
                    $(".callMsg-error img").attr("src", "/themes/images/icon-err.png");
                    $(".callMsg-error span").html(status.error);
                }
            })
        }
    })
    $('.J-step-three').click(function() {
            if (PAGE_DATA.type == 2) {
                userBol = true;
            }
            if (userBol && passBol && repeatBol) {
                var succUser = $('.username').val();
                var user = {};
                if (PAGE_DATA.type == 1) {
                    user.mobile = PAGE_DATA.phoneNum;
                    user.username = succUser;
                    user.type = PAGE_DATA.sub;
                    user.password = $.md5($(".pass-num").val());
                    user.repassword = $.md5($(".repeat-pass").val());
                    PAGE_DATA.url = "/caa-personal-ws/ws/0.1/register/user";
                } else {
                    user.mobile = PAGE_DATA.phoneNum;
                    user.password = $.md5($(".pass-num").val());
                    user.repassword = $.md5($(".repeat-pass").val());
                    PAGE_DATA.url = "/caa-personal-ws/ws/0.1/reset/password";
                }
                $.ajax({
                    type: "post",
                    url: PAGE_DATA.url,
                    dataType: "json",
                    async: true,
                    contentType: "application/json;charset=UTF-8",
                    data: JSON.stringify(user),
                    success: function(data) {
                        $('.account-three').hide();
                        $('.account-four').show();
                        $(".registerStep").eq(3).addClass("on")
                        $(".step-slider").eq(3).addClass("step-slider-on")
                        $(".step-area").eq(3).addClass("step-area-on")
                        if (PAGE_DATA.type == 1 && data.status) {
                            $(".success-username").html(succUser)
                            $(".success-phone").html(PAGE_DATA.phoneNum.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'))
                            var count = 5;
                            PAGE_DATA.skipTimer = setInterval(function() {
                                count--;
                                $(".lateron em").html(count);
                                if (count == 0) {
                                    clearInterval(PAGE_DATA.skipTimer);
                                    window.location.href = "/index.html"
                                }
                            }, 1000)
                        }
                    },
                    error: function(data) {
                        var bol = true;
                        if (data.status != '200') {
                            var status = JSON.parse(data.responseText);
                            if (status.error.indexOf('两次输入不一致') > -1) {
                                $(".repeat-error").show();
                                $(".repeat-error img").attr("src", "/themes/images/icon-err.png");
                                $(".repeat-error em").html(status.error);
                                bol = false;
                            } else {
                                $(".user-error").show();
                                $(".user-error img").attr("src", "/themes/images/icon-err.png");
                                $(".user-error em").html(status.error);
                                bol = false;
                                userBol = false;
                            }
                        }
                        if (bol) {
                            $('.account-three').hide();
                            $('.account-four').show();
                            $(".registerStep").eq(3).addClass("on")
                            $(".step-slider").eq(3).addClass("step-slider-on")
                            $(".step-area").eq(3).addClass("step-area-on")
                            if (PAGE_DATA.type == 1) {
                                $(".success-username").html(succUser)
                                $(".success-phone").html(PAGE_DATA.phoneNum.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'))
                                var count = 5;
                                PAGE_DATA.skipTimer = setInterval(function() {
                                    count--;
                                    $(".lateron em").html(count);
                                    if (count == 0) {
                                        clearInterval(PAGE_DATA.skipTimer);
                                        window.location.href = "/index.html"
                                    }
                                }, 1000)
                            }
                        }
                    }
                })
            }
        })
        //检测用户名
    var userBol;
    $(".username").keyup(function() {
        var str = $(".username").val();
        var re1 = /^[\u4e00-\u9fa5\w\-]+$/g;
        var length;
        if (!/^[\u4e00-\u9fa5]+$/g.test(str)) {
            length = 4
        } else {
            length = 2
        }
        if (str.length == 0) {
            PAGE_CONTROLLER.showMsg($(".user-error"), false)
            $(".user-error em").html("支持中文、字母、数字、“-”、“_”的组合，4-20个字符");
            userBol = false;
            return
        }
        if (!re1.test(str)) {
            $(".user-error").show();
            $(".user-error img").attr("src", "/themes/images/icon-err.png");
            $(".user-error em").html("不能含有非法字符")
            userBol = false;
            return
        } else {
            PAGE_CONTROLLER.showMsg($(".user-error"), true)
            $(".user-error em").html("")
        }
        if (/^[\u4e00-\u9fa5]+$/g.test(str) && str.length <= 1) {
            $(".user-error").show();
            $(".user-error img").attr("src", "/themes/images/icon-err.png");
            $(".user-error em").html("用户名过短")
            userBol = false;
            return
        }
        if (/^[\u4e00-\u9fa5]+$/g.test(str) && str.length > 10) {
            PAGE_CONTROLLER.showMsg($(".user-error"), false)
            $(".user-error em").html("用户名过长")
            userBol = false;
            return
        }
        if (str.length <= 3 && !(/^[\u4e00-\u9fa5]+$/g).test(str)) {
            $(".user-error").show();
            $(".user-error img").attr("src", "/themes/images/icon-err.png");
            $(".user-error em").html("用户名过短")
            userBol = false;
            return
        }
        if (/^\d+$/g.test(str)) {
            $(".user-error").show();
            $(".user-error img").attr("src", "/themes/images/icon-err.png");
            $(".user-error em").html("用户名不能是纯数字，请重新输入！")
            userBol = false;
            return
        }
        userBol = true;
    })
    var bol1 = true;
    $('.username').click(function() {
        if (bol1) {
            PAGE_CONTROLLER.showMsg($(".user-error"), false)
            $(".user-error em").html("支持中文、字母、数字、“-”、“_”的组合，4-20个字符");
            bol1 = false;
        }
    })
    var passBol;
    var bol2 = true;
    $('.pass-num').click(function() {
        if (bol2) {
            PAGE_CONTROLLER.showMsg($(".pass-error"), false)
            $(".pass-error span").html("建议使用字母、数字和符号两种及以上的组合，6-20个字符");
            bol2 = false;
        }
    })
    $(".pass-num").keyup(function() {
        var txt = $(this).val();
        var passVal1 = $(".pass-num").val();
        var passVal2 = $(".repeat-pass").val();
        if (txt.length <= 5 && txt.length != 0) {
            $(".pass-error").show();
            $(".pass-error img").attr("src", "/themes/images/icon-err.png");
            $(".pass-error span").html("密码不可低于6位！")
            passBol = false;
            return
        } else {
            $(".pass-error").hide();
            $(".pass-error span").html("")
        }
        if (txt == "") {
            PAGE_CONTROLLER.showMsg($(".pass-error"), false)
            $(".pass-error span").html("建议使用字母、数字和符号两种及以上的组合，6-20个字符");
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
        if (passVal1 != passVal2) {
            $(".repeat-error").show()
            passBol = false;
        } else {
            $(".repeat-error").hide()
        }
        if (txt.length >= 6) {
            //数字组合
            if (/\d+/.test(txt)) {
                PAGE_CONTROLLER.checkPass(1)
                if (txt.length > 15) {
                    PAGE_CONTROLLER.checkPass(2)
                }
                if (txt.length > 10 && /\W+/.test(txt)) {
                    PAGE_CONTROLLER.checkPass(2)
                }
                if (txt.length > 15 && /\W+/.test(txt)) {
                    PAGE_CONTROLLER.checkPass(3)
                }
                if (/[a-z]+/.test(txt) || /[A-Z]+/.test(txt)) {
                    PAGE_CONTROLLER.checkPass(1)
                    if (txt.length > 10) {
                        PAGE_CONTROLLER.checkPass(2)
                        if (txt.length > 15) {
                            PAGE_CONTROLLER.checkPass(3)
                        }
                    }
                    if (/\W+/.test(txt)) {
                        PAGE_CONTROLLER.checkPass(1)
                        if (/\W+/.test(txt) && /[a-z]+/.test(txt) && /[A-Z]+/.test(txt) && txt.length >= 6) {
                            PAGE_CONTROLLER.checkPass(2)
                        }
                        if (/\W+/.test(txt) && /[a-z]+/.test(txt) && txt.length > 6) {
                            PAGE_CONTROLLER.checkPass(2)
                            if (/\W+/.test(txt) && /[a-z]+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 10) {
                                PAGE_CONTROLLER.checkPass(3)
                            }
                        }
                        if (/\W+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 6) {
                            PAGE_CONTROLLER.checkPass(2)
                            if (/\W+/.test(txt) && /[a-z]+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 10) {
                                PAGE_CONTROLLER.checkPass(3)
                            }
                        }
                        if (/\W+/.test(txt) && /[a-z]+/.test(txt) && txt.length > 15) {
                            PAGE_CONTROLLER.checkPass(3)
                        }
                        if (/\W+/.test(txt) && /[A-Z]+/.test(txt) && txt.length > 15) {
                            PAGE_CONTROLLER.checkPass(3)
                        }
                    }
                }
            }
            //    字母组合
            else if (/[a-z]+/.test(txt) || /[A-Z]+/.test(txt)) {
                PAGE_CONTROLLER.checkPass(1)
                if (txt.length > 15) {
                    PAGE_CONTROLLER.checkPass(2)
                }
                if (txt.length > 10 && /\W+/.test(txt)) {
                    PAGE_CONTROLLER.checkPass(2)
                }
                if (txt.length > 15 && /\W+/.test(txt)) {
                    PAGE_CONTROLLER.checkPass(3)
                }
            }
            //    特殊字符
            else if (/\W+/.test(txt)) {
                PAGE_CONTROLLER.checkPass(1)
                if (txt.length > 15) {
                    PAGE_CONTROLLER.checkPass(2)
                }
            }
        }
        passBol = true;
    })
    var repeatBol;
    $(".repeat-pass").keyup(function() {
        var passVal1 = $(".pass-num").val();
        var passVal2 = $(".repeat-pass").val();
        if (passVal1 != passVal2) {
            $(".repeat-error").show();
            repeatBol = false;
        } else {
            if ($(".pass-num").val().length >= 6) {
                $(".pass-error").hide()
                repeatBol = true;
            }
            $(".repeat-error").hide()
        }
    })
    $(".forget_step_four").click(function() {
            window.location.href = "./login.html"
        })
        //$(".agreement").click(function(){
        //    window.location.href = "login.html"
        //})
    $(".at-once").click(function() {
        clearInterval(PAGE_DATA.skipTimer);
        window.location.href = "/pages/personal/home.html?showuse=2"
    })
    $(".lateron").click(function() {
            clearInterval(PAGE_DATA.skipTimer);
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
        if (PAGE_DATA.clickBol) {
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
                PAGE_DATA.clickBol = false;
            } else {
                if (agreeBol && $(".account-one input").eq(0).val() != "" && $(".account-one input").eq(1).val() != "") {
                    $(".next-step em").css({
                        "opacity": "1"
                    })
                    PAGE_DATA.clickBol = true;
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
                PAGE_DATA.clickBol = false;
            } else {
                $(".next-step em").css({
                    "opacity": "1"
                })
                PAGE_DATA.clickBol = true;
            }
        })
    })
    $(".account-three input").each(function(i) {
        $(".account-three input").keyup(function() {
            if ($(".account-three input").eq(i).val() == "") {
                $(".next-step em").css({
                    "opacity": "0.6"
                })
                PAGE_DATA.clickBol = false;
            } else {
                $(".next-step em").css({
                    "opacity": "1"
                })
                PAGE_DATA.clickBol = true;
            }
        })
    })
    $(".account-four input").each(function(i) {
        $(".account-four input").keyup(function() {
            if ($(".account-four input").eq(i).val() == "") {
                $(".next-step em").css({
                    "opacity": "0.6"
                })
                PAGE_DATA.clickBol = false;
            } else {
                $(".next-step em").css({
                    "opacity": "1"
                })
                PAGE_DATA.clickBol = true;
            }
        })
    })
})(jQuery)