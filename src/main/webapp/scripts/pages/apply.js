var myApp = { papersType: "" }; //竞买主体证件类型
var arr = ["", "居民身份证", "中国公民护照", "台湾居民来往大陆通行证", "港澳居民来往内地通行证", "外国公民护照", "户口薄", "营业执照", "组织机构代码证", "事业法人登记证", "社会统一信用代码证", "军官证"]
$(function() {
    var lotId = util.getQueryString('lotId');
    var meetId = util.getQueryString('meetId');
    $('#goodsTitle').attr('href', '/lot/' + lotId + '.html');
    //判断用户是否登录
    if (user.islogin()) {
        //判断用户是否支付保证金
        //		checkPayDeposit();
        loadPayInfo(lotId);
        $(".msg .tips").hide();
    } else {
        window.location.href = '/pages/user/login.html?redirect=/pages/lots/profession.html?lotId=' + lotId + '&meetId=' + meetId;
    }
    $(".agree_link").click(function() {
        if ($(".agree-content").is(":hidden")) {
            $(".agree-content").show();
        } else {
            $(".agree-content").hide();
        }
    });
    $("a.checkbox").click(function() {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
    });
    $('.agree .fields a.checkbox').click(function() {
        if (!$(this).hasClass('active')) {
            $(this).siblings('span').show();
            $('.submit-content input').addClass('disabled');
        } else {
            $(this).siblings('span').hide();
            showSubmit();
        }
    })
    $('.click_check').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active')
            $('.submit-content input').addClass('disabled');
        } else {
            $(this).addClass('active');
            $('.bidderCheck .sub-title').hide();
            showSubmit()
        }
    })
    $('input').focus(function() {
        $('.error-msg').hide();
    });
    var bol1 = true;
    $('.clearval').eq(1).click(function() {
        if (bol1) {
            $(this).val("")
            bol1 = false
        }
    })
    var bol2 = true;
    $('.clearval').eq(2).click(function() {
        if (bol2) {
            $(this).val("")
            bol2 = false
        }
    })

    //点击确认并提交保证金
    $('.submit').click(function() {
        // var mobile = /^1[34578]\d{9}$/;
        checkAgree();
        var choseflag = true;
        if ($(".card-name").val().length == 0) {
            $(".name-error").show();
            $(".name-error em").html("请输入竞买人姓名")
            choseflag = false;
        }
        if (!$(".card-num").val() || $(".card-num").val().length == 0) {
            $(".card-error").show();
            $(".card-error em").html("请输入证件号码")
            choseflag = false;
        }
        if (!$("#user_mobile").val() || $("#user_mobile").val().length == 0) {
            $(".tel-error").show();
            $(".tel-error em").html('请输入手机号码');
            choseflag = false;
        }
        if ($('.click_check').hasClass('active')) {
            $('.bidderCheck .sub-title').hide();
        } else {
            $('.bidderCheck .sub-title').show();
        }

        if (!choseflag) {
            return false;
        }


        if ($(this).hasClass('disabled')) {
            return false;
        }
        $('.submit').addClass('disabled');

        var json = {};
        json.idType = $('#idType').data('val');
        json.idNum = $(".card-num").val();
        json.name = $(".card-name").val();
        json.mobile = $("#user_mobile").val();

        $.ajax({
            url: '/personal-ws/ws/0.1/ensure/lot/' + lotId,
            type: "post",
            dataType: 'json',
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(json),
            cache: false,
            async: true,
            success: function(data) {
                var randomNum = data;
                var url = '/personal-ws/ws/0.1/apply/lot/offline/' + lotId + '?orderRandomNum=' + randomNum
                checkApply(url)
            },
            error: function(data) {

                if (data.status == 200) {
                    var randomNum = data.responseText
                    var url = '/personal-ws/ws/0.1/apply/lot/offline/' + lotId + '?orderRandomNum=' + randomNum
                    checkApply(url)
                } else {
                    $('.submit').removeClass('disabled');
                    var status = JSON.parse(data.responseText)
                    if (status.error == "您输入的证件号码与实名认证资料不符") {
                        $(".card-error").show();
                        $(".card-error em").html(status.error)
                    } else {
                        $(".card-error").hide();
                    }
                    if (status.error.indexOf("手机") > -1) {
                        $(".tel-error").show();
                        $(".tel-error em").html(status.error)
                    } else {
                        $(".tel-error").hide();
                    }
                    if (status.error == "您输入的竞买人姓名与实名认证资料不符") {
                        $(".name-error").show();
                        if (myApp.papersType != 7) {
                            $(".name-error em").html(status.error)
                        } else {
                            $(".name-error em").html(status.error)
                        }
                    } else {
                        $(".name-error").hide();
                    }
                }
            }
        })

    });
    $(".J-container-title").headerStyle();
    $(".bidderSection input").keyup(function() {
        showSubmit()
    })
    if (navigator.userAgent.indexOf("Trident") == -1) {
        if (user.type() == 1) {
            $(".fields-name").attr("placeholder", "请填写竞买机构名称");
            $(".card-num").attr("placeholder", "实名认证的证件号码")
            $("#user_mobile").attr("placeholder", "请输入绑定的手机号");
        } else {
            $(".fields-name").attr("placeholder", "实名认证的姓名");
            $(".card-num").attr("placeholder", "实名认证的证件号码")
            $("#user_mobile").attr("placeholder", "请输入绑定的手机号")
        }
    } else {
        if (user.type() == 1) {
            $(".fields-name").val("请填写竞买机构名称");
            $(".card-num").val("实名认证的证件号码")
            $("#user_mobile").val("请输入绑定的手机号");
        } else {
            $(".fields-name").val("实名认证的姓名");
            $(".card-num").val("实名认证的证件号码")
            $("#user_mobile").val("请输入绑定的手机号")
        }
    }
});
$('.closeBtn').click(function() {
    $('.errorDiv').hide()
    $('.opcy_new').remove();
})

function checkApply(url) {
    $.ajax({
        url: url + "&time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        contentType: "application/json;charset=utf-8",
        async: true,
        success: function(data) {
            $("body").append("<div class='opcy_new'></div>");
            var index = 5;
            var time = setInterval(function() {
                index--
                $('.last_time em').html(index)
                if (index <= 0) {
                    clearInterval(time)
                    window.opener = null;
                    window.open('', '_self');
                    window.close();
                }
            }, 1000)
        },
        error: function(data) {
            if (data.status == '200') {
                $("body").append("<div class='opcy_new'></div>");
                $('.opcy_new').height($('.sifa-head').height() + $('.apply-content').height() + $('.sifa-foot').height())
                $('.succDiv').show()
                var index = 5;
                var time = setInterval(function() {
                    index--
                    $('.last_time em').html(index)
                    if (index <= 0) {
                        clearInterval(time)
                        window.opener = null;
                        window.open('', '_self');
                        window.close();
                    }
                }, 1000)
            } else {
                $('.submit').removeClass('disabled');
                if (data.responseText) {
                    var info = JSON.parse(data.responseText).error;
                    $("body").append("<div class='opcy_new'></div>");
                    $('.opcy_new').height($('.sifa-head').height() + $('.apply-content').height() + $('.sifa-foot').height())
                    $('.apply-msg').html(info)
                    $('.errorDiv').show()
                }
            }
        }
    })
}
//加载支付保证金页面信息
function loadPayInfo(lotId) {
    $.ajax({
        url: '/personal-ws/ws/0.1/apply/lot/' + lotId + "?time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        cache: false,
        async: true,
        success: function(data) {
            util.changeToEmpty(data);
            myApp.papersType = data.idType;
            $('#noticeTitle').html(data.noticeTitle);
            $('#noticeTitle').attr('href', '/notice/' + data.noticeId + '.html');
            $('#goodsTitle').html(data.goodsTitle);
            $('#pay_cort').html(''); //法院
            $('#pay_notice').html(data.noticeTitle);
            $('#despoit').html(data.deposite);
            // $(".card-num-val").html(arr[myApp.papersType])
            if (data.fee && data.fee > 0) {
                $('.fee_span').show();
                $('.fee_detail').html(data.fee);
                $('.total_fee').html(parseFloat(data.deposite) + parseFloat(data.fee));
            } else {
                $('.bailExplain em').hide();
            }
            //$('#bidderName').html(data.bidderName + '<span style="color: #999;font-weight: normal;margin-left: 20px;">(竞价成功后，将以此身份办理过户，如有委托，请咨询资产处置单位)</span>');
            // if (data.deposite == 0) {
            //     $('.submit-content input').val('确认');
            //     $(".checkbox").eq(0).addClass("active")
            //     $(".checkbox").eq(1).addClass("active")
            // }
            if (data.isAudit == 1) { //已认证
                $('.paystep').hide();
                $('#idType').val(arr[data.idType]).data('val', data.idType).attr("disabled", "disabled");
                $('#price').val(data.deposite);
                $('#isCorp').val(data.isCorp);
                $('#h_bidderName').val(data.bidderName);

            } else {
                $('.paystep').show();
            }
        }
    });
}

/*校验竞买条件勾选*/
function checkAgree() {
    //判断是否勾选协议
    $('.agree .fields a.checkbox').each(function() {
        if (!$(this).hasClass("active")) {
            $(this).siblings('span').show();
            $('.submit-content input').addClass('disabled');
            $(window).scrollTop(0);
        } else {
            $(this).siblings('span').hide();
        }
    })
}

//校验输入
function showSubmit() {
    var flag = true;
    $('.agree .fields a.checkbox').each(function() {
        if (!$(this).hasClass("active")) {
            $('.submit-content input').addClass('disabled');
            flag = false;
        } else {
            $(this).siblings('span').hide();
        }
    })
    if (!flag) {
        return;
    }
    var carNum = $('input.card-num');
    var mobile = $('#user_mobile');
    if (navigator.userAgent.indexOf("Trident") == -1) {
        if ($(".fields-name").val() == "") {
            $('.submit-content input').addClass('disabled');
            return;
        }
        if (carNum.val() == "") {
            $('.submit-content input').addClass('disabled');
            return;
        }
        if (mobile.val() == "") {
            $('.submit-content input').addClass('disabled');
            return;
        }
        if (!$('.click_check').hasClass('active')) {
            $('.submit-content input').addClass('disabled');
            return;
        }
        $('.submit-content input').removeClass('disabled');
    } else {
        if ($(".fields-name").val() == "" || $(".fields-name").val() == "实名认证时姓名" || $(".fields-name").val() == "请填写竞买机构名称") {
            $('.submit-content input').addClass('disabled');
            return;
        }
        if (carNum.val() == "" || carNum.val() == "实名认证时营业执照的证件号码" || carNum.val() == "实名认证证件号码") {
            $('.submit-content input').addClass('disabled');
            return;
        }
        if (mobile.val() == "" || carNum.val() == "实名认证时手机号") {
            $('.submit-content input').addClass('disabled');
            return;
        }
        var bidderName = $('#bidderName');
        if (bidderName.val() == "" || bidderName.val() == "请竞买人姓名") {
            $('.submit-content input').addClass('disabled');
            return;
        }
        if (!$('.click_check').hasClass('active')) {
            $('.submit-content input').addClass('disabled');
            return;
        }
        $('.submit-content input').removeClass('disabled');
    }
}