$(function() {
    var lotId = util.getQueryString('lotId');
    var randomStr = util.getQueryString('randomStr');
    var nologin = true;
    user.gologin();
    $.ajax({
        url: '/personal-ws/ws/0.1/apply/lot/' + lotId + "?time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        cache: false,
        async: true,
        success: function(data) {
            util.changeToEmpty(data);
            $('#user_mobile').val(data.mobile);
            $('#idType').val(data.idType);
            $('#noticeTitle').val(data.noticeTitle);
            $('#goodsTitle').val(data.goodsTitle);
            $('.goodsTitle_div').html(data.goodsTitle);
            $('#price').val(data.deposite);
            $('#isCorp').val(data.isCorp);
            $('#fee').val(data.fee);
            $('#h_bidderName').val(data.bidderName);
            $('#card-num').val(data.idNum);
            $('.deposit').html(' ¥' + parseFloat(data.deposite));
            $('.goodsTitle_div').html(data.goodsTitle);
            $('.fy_span').html(data.companyName);
        }
    });
    $('.submit-money').click(function() {
        user.gologin();
        submitPay()
    });

    $(".J-container-title").headerStyle();
    $('.support-bank ul').on('click', 'li', function() {
        $(this).addClass('active').siblings().removeClass('active');
    })

    //提交
    function submitPay() {
        var bankId = $('.support-bank li.active input').val();
        $.ajax({
            url: '/personal-ws/ws/0.1/pay/lot/' + lotId + '?bankId=' + bankId + '&orderRandomNum=' + randomStr + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            contentType: "application/json;charset=utf-8",
            async: true,
            success: function(data) {
                if (data.status) {
                    util.changeToEmpty(data);
                    pay(data);
                } else {
                    if (data.msg || data.msg == "您已成功报名该标的！") {
                        $(".errorDiv .error_msg").html(data.msg);
                        nologin = false
                    } else {
                        $(".errorDiv .error_msg").html('订单已超时，请重新登录');
                        nologin = true;
                    }
                    $(".errorDiv").css('display', 'block');
                    openDialog();
                }
            },
            error: function(data) {
                if (data.status == 200) {
                    util.changeToEmpty(data);
                    pay(data);
                } else {
                    if (data.msg || data.msg == "您已成功报名该标的！") {
                        $(".errorDiv .error_msg").html(data.msg);
                        nologin = false
                    } else {
                        $(".errorDiv .error_msg").html('订单已超时，请重新登录');
                        nologin = true;
                    }
                    $(".errorDiv").css('display', 'block');
                    openDialog();
                }
            }
        });
    }

    function pay(data) {
        $('#form_div').attr('action', data.paymentUrl);
        //中金支付
        if (data.source == 0) {
            $('#form_div')
                .append('<input name="txCode" class="txCode" />')
                .append('<input name="message" class="message" />')
                .append('<input name="signature" class="signature" />');

            $('.txCode').val(data.txCode);
            $('.message').val(data.message);
            $('.signature').val(data.signature);
            $('#form_div').submit();

        } else if (data.source == 1) { //先锋支付
            $('#form_div')
                .append('<input name="service" class="service" />')
                .append('<input name="secId" class="secId" />')
                .append('<input name="version" class="version" />')
                .append('<input name="reqSn" class="reqSn" />')
                .append('<input name="merchantId" class="merchantId" />')
                .append('<input name="data" class="data" />')
                .append('<input name="sign" class="sign" />');
            $('.service').val(data.service);
            $('.secId').val(data.secId);
            $('.version').val(data.version);
            $('.reqSn').val(data.reqSn);
            $('.merchantId').val(data.merchantId);
            $('.data').val(data.data);
            $('.sign').val(data.sign);
            $('#form_div').submit();
        }
    }
    //打开弹窗遮罩效果
    function openDialog() {
        $("body").append("<div class='opcy_submit'></div>");
        // $('body,html').addClass('overflow');
    }
    //关闭弹窗及遮罩效果

    function closeDialog() {
        $(".dialog").hide();
        $(".opcy_submit").remove();
        // $('body,html').removeClass('overflow');
    }
    $('.close,.sureBtn').click(function() {
        if (nologin) {
            $('.errorDiv').hide(); //标的 当前价格
            closeDialog();
            window.location.href = '/login.html';
        } else {
            $('.errorDiv').hide(); //标的 当前价格
            closeDialog();
        }
    });
});