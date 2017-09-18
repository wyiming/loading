$(document).ready(function() {
    order_bid_controller.init(); //加载记录前三条
    order_bid_controller.detailinit();
    order_bid_controller.showbook()
    connection.register('/auctions/auction_' + order_bid.meetId + '/status', order_bid_controller.initLotInfo);
    connection.register('/auctions/auction_' + order_bid.meetId + '/status', order_bid_controller.latestBidInfo);
    connection.register('/lots/lot_' + order_bid.lotId + "/status", order_bid_controller.initLotInfo);
    connection.register('/lots/lot_' + order_bid.lotId + "/status", order_bid_controller.latestBidInfo);
    connection.register('/lots/lot_' + order_bid.lotId + "/price", order_bid_controller.latestBidInfo);
    connection.register('/auctions/lot_' + order_bid.lotId, order_bid_controller.latestSpeaklog);
    connection.register('/auctions/auction_' + order_bid.meetId, order_bid_controller.latestSpeaklog);
    util.getdata("/personal-ws/ws/0.1/onlook/lot/" + order_bid.lotId, 'get', 'json', true, false, function() {})
});
$(".J-container-title").headerStyle();
//页面级的计时器
var PAGE_TIMER = {
    TIMER: false, //页面级的计时器只保留一个。如果想用多个计时器，可以考虑用JSON来实现
    duration: 0,
    start: function(funcName, duration) {
        if (PAGE_TIMER.TIMER) {
            window.clearTimeout(PAGE_TIMER.TIMER);
            PAGE_TIMER.TIMER = null
        }
        PAGE_TIMER.duration = duration;
        var timeFn = function() {
            funcName()
            if (PAGE_TIMER.duration > -100) {
                window.clearTimeout(PAGE_TIMER.TIMER);
                PAGE_TIMER.TIMER = setTimeout(timeFn, 100);
            } else {
                window.clearTimeout(PAGE_TIMER.TIMER);
                PAGE_TIMER.TIMER = null
            }
        }
        timeFn();
    },
    distory: function() {
        if (PAGE_TIMER.TIMER) {
            window.clearTimeout(PAGE_TIMER.TIMER);
        }
    },
    begin: function() {
        $("#LOT_DURATION_BEGIN").countDown(PAGE_TIMER.duration);
        PAGE_TIMER.duration = PAGE_TIMER.duration - 100;
        if (PAGE_TIMER.duration <= -100) {
            PAGE_TIMER.distory();
        }
    },
    finish: function() {
        $("#LOT_DURATION_FINISH").countDown(PAGE_TIMER.duration);
        PAGE_TIMER.duration = PAGE_TIMER.duration - 100;
        if (PAGE_TIMER.duration <= -100) {
            window.clearTimeout(PAGE_TIMER.TIMER);
            if (order_bid.meetMode != '1' && order_bid.timeBol) {
                order_bid_controller.timeover()
                order_bid.timeBol = false
            }
            PAGE_TIMER.distory();
        }
    }
};
//保存标的相关的可变的数据  注意：竞价阶梯、起拍价都是可变的。
var order_bid = {
    lotId: util.getQueryString("lotId"), //获取标的ID
    showuse: util.getQueryString("showuse"),
    meetId: '',
    user: {
        isLogin: false, //当前用户是否登录，在页面初始化时赋值
        isJoin: false, //当前用户是否已经缴纳保证金，在页面初始化时赋值。点击支付完成时赋值
        isApply: false, //当前用户是否报名
        isPrior: false, //当前用户是否是优先竞买人
        isAgent: false //当前用户是否是委托竞买人
    },
    meetStartTime: 0, //拍卖会的开始时间
    meetStatus: 0, //拍卖会状态
    nowPrice: 0, //当前最高价
    deposit: 0, //保证金
    status: '即将开始', //拍卖状态
    endTime: 0, //预计结束时间
    state: 0,
    bidCount: 0,
    mybidNum: "",
    meetMode: 0,
    timeBol: true
};

//页面控制器，负责与后台交互，获取数据
var order_bid_controller = {
    init: function() {
        //页面初始化检查用户是否已经登录
        if (user.islogin()) {
            order_bid.user.isLogin = true;
            order_bid_controller.checkDeposite();
        } else {
            order_bid.user.isLogin = false;
        }
        order_bid_controller.initLotInfo(); //初始化数据
        order_bid_controller.latestSpeaklog();
        order_bid_controller.latestBidInfo();
        if (!navigator.onLine) {
            alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
            window.location.reload(true);
        }
    },
    initLotInfo: function() {
        $.ajax({
            url: "/personal-ws/ws/0.1/lot/" + order_bid.lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                if (data) {
                    if (data.nowPrice) {
                        order_bid.nowPrice = data.nowPrice;
                    } else {
                        order_bid.nowPrice = data.startPrice;
                    }
                    order_bid.meetId = data.meetId;
                    order_bid.deposit = data.cashDeposit;
                    order_bid.range = data.rateLadder;
                    order_bid.status = data.lotStatus;
                    order_bid.meetMode = data.meetMode
                    order_bid.endTime = data.endTime - data.nowTime;
                    order_bid.meetStartTime = data.meetStartTime;
                    order_bid.meetStatus = data.meetStatus;
                    $('.grid-c').loadinfo(data); //渲染标的信息页面
                }
            },
            error: function(data) {

            }
        })
    },
    latestBidInfo: function() { //最新的竞价信息 4种场景下调用改方法 每隔30秒调用一次  竞价成功调用一次  推送状态发生变化调用一次 0.00倒计时结束调用1次
        $.ajax({
            url: '/personal-ws/ws/0.1/lot/currentinfo/' + order_bid.lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                order_bid.state = data.state
                order_bid.meetStatus = data.meetStatus;
                order_bid_controller.currentPriceLog()
                var arr = ["即将开始", "正在进行", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "已暂停"]
                $('#bid_name span').html(arr[data.state])
                if (parseFloat(data.nowPrice) > 0) {
                    order_bid.nowPrice = data.nowPrice;
                }
                if (data.hasMinPrice) {
                    $('#retain').html('有')
                } else {
                    $('#retain').html('无')
                }
                var $finish;
                if (data.state == '0') { //如果标的即将开始
                    order_bid.price_type = "起拍价"
                    order_bid.status = "拍卖会"
                    var $comming = $("#DISPLAY_BID_COMMING").commingBidCommon(data.nowTime - data.startTime, data);
                    if (order_bid.user.isLogin) { //用户已经登录
                        if (order_bid.user.isJoin) {
                            order_bid_controller.loadJPH()
                            $comming.bidUnjoin().buildMyBidderInfo()
                        } else { //没有缴纳保证金
                            $comming.bidUnjoin()
                            if (order_bid.meetStatus == '1') {
                                $comming.bidUnlogin()
                            }
                        }
                    } else { //用户没有登录
                        $comming.bidUnjoin()
                        if (order_bid.meetStatus == '1') {
                            $comming.bidUnlogin()
                        }
                    }
                } else if (data.state == '1') { //正在进行
                    order_bid.price_type = "当前价"
                    order_bid.status = "距结束"
                    var $progressing = $('#DISPLAY_BID_PROGRESSING').progressBidCommon(data.endTime - data.nowTime)
                    if (order_bid.user.isLogin) { //用户已经登录
                        if (order_bid.user.isJoin) {
                            order_bid_controller.loadJPH()
                            $progressing.bidUnjoin().buildMyBidderInfo()
                        } else { //没有缴纳保证金
                            $progressing.bidUnjoin()
                            if (order_bid.meetStatus == '1') {
                                $progressing.bidUnlogin()
                            }
                        }
                    } else { //用户没有登录
                        $progressing.bidUnjoin()
                        if (order_bid.meetStatus == '1') {
                            $progressing.bidUnlogin()
                        }
                    }
                } else if (data.state == '3') { //已成交
                    $finish = $('#DISPLAY_BID_FINISH').finishBidCommon(data)
                    if (order_bid.user.isJoin) {
                        if (order_bid.mybidNum == data.nowBidNum) {
                            $finish.finishBidOwer()
                        } else {
                            $finish.finishBidOutter()
                        }
                        order_bid_controller.loadJPH();
                        $finish.buildMyBidderInfo()
                    }
                    order_bid_controller.confirmation();
                } else {
                    $finish = $('#DISPLAY_BID_FINISH').finishBidCommon(data)
                    if (order_bid.user.isJoin) {
                        $finish.buildMyBidderInfo()
                    }
                }
                if (data.state == '7' && !order_bid.user.isJoin) { //已暂停
                    $('#DISPLAY_BID_FINISH').pausenoJoin().bidUnjoin()
                }
            },
            error: function() {

            }
        })
    },
    timeover: function() { //时间走完要调用的方法
        util.getdata('/personal-ws/ws/0.1/lot/currentinfo/' + order_bid.lotId, 'get', 'json', false, false, function(data) {
            if (data.endTime < data.nowTime && data.state == '1') {
                $('#LOT_DURATION_FINISH').html('等待拍卖师操作')
            }
        })
    },
    checkDeposite: function() { //检测是否支付保证金
        $.ajax({
            url: "/personal-ws/ws/0.1/checkpay/lot/" + order_bid.lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                if (data.status) { //已支付保证金
                    order_bid.user.isJoin = true
                    order_bid.user.isApply = true
                    if (order_bid.mybidNum) {
                        $('#DISPLAY_BID_PROGRESSING').buildMyBidderInfo();
                    } else {
                        order_bid_controller.loadJPH()
                        $('#DISPLAY_BID_PROGRESSING').buildMyBidderInfo();
                    }
                } else { //未支付保证金
                    order_bid.user.isJoin = false
                    if (data.code == '201' || data.code == '200') {
                        order_bid.user.isApply = true
                    } else {
                        order_bid.user.isApply = false
                    }
                }
            },
            error: function(data) {

            }
        })
    },
    loadJPH: function() { //加载竞买号
        $.ajax({
            url: '/personal-ws/ws/0.1/lot/' + order_bid.lotId + '/mine' + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                if (data.bidNum && order_bid.user.isJoin) {
                    order_bid.user.isAgent = data.isAgent;
                    order_bid.user.isPrior = data.isPrior;
                    order_bid.bidCount = data.bidCount;
                    order_bid.mybidNum = data.bidNum;
                }
            },
            error: function(data) {

            }
        })
    },
    latestSpeaklog: function() {
        util.getdata('/caa-search-ws/ws/0.1/auctionmeet/speaklogs?meetId=' + order_bid.meetId + '&lotId=' + order_bid.lotId + '&start=0&count=10', 'get', 'json', false, false, function(data) {
            util.transformNull(data);
            $('.speaklogs-list').morespeaklogs(data)
        }, function(data) {
            $('.speaklogs-list').errorspeak(data)
        });
    },
    detailinit: function() {
        //标的介绍
        util.getdata('/caa-search-ws/ws/0.1/lot/' + order_bid.lotId + '/introduction/', 'get', 'json', false, true, function(data) {
            util.transformNull(data);
            $('.pai-remind-tip').html(data.remark); //重要提示
            $('#J_ItemNotice').html(data.guidance);
            $('#J_desc').html(data.describe);
            $('#NoticeDetail .detail-common-text').html(data.content); //标的公告
            $('#bigpicshow img').attr("src", data.pics[0])
            if (!data.position) {
                $('#position').addClass('hidden')
            }
            $('#position').html('标的所在地：' + data.position);
            var pics = '';
            $.each(data.pics, function(id, items) {
                pics += '<img src="' + items + '">';
            })
            $('.sf-pic-slide').html(pics);
            if (data.enclosure && data.enclosure.length > 0) { //附件
                var fjStr = '';
                $.each(data.enclosure, function(i, fj) {
                    fjStr += '<li><a href="/caa-search-ws/ws/0.1/web/enclosure/download/' + fj.id + '">' + fj.fileName + '</a><li>';
                });
                $('#J_DownLoadSecond').html(fjStr);
            } else {
                $('#J_DownLoadSecond').html('没有相关下载附件');
            }

            if (data.videoPath) {
                $('.video_slide').show();
                jwplayer('lotVideo').setup({
                    flashplayer: '/scripts/extra/jwplayer.flash.swf',
                    file: data.videoPath,
                    width: '900',
                    height: '510'
                })
            }
        })
    },
    currentPriceLog: function() {
        util.getdata('/personal-ws/ws/0.1/bid/pricelog/' + order_bid.lotId + '?sortname=&sortorder=&start=0&count=10', 'get', 'json', false, false, function(data) {
            util.transformNull(data)
            $('#J_RecordList tbody').morePriceLog(data);
        });
    },
    confirmation: function() {
        //竞价成功确认书
        util.getdata('/personal-ws/ws/0.1/lot/confirmation/' + order_bid.lotId, 'get', 'json', false, true, function(data) {
            util.transformNull(data)
            if (data.companyName || data.barginUserName) {
                $('#AuctConfirmation').buildConfirmation(data);
                $('.tab-menu li').eq(6).removeClass('hidden')
                $('#DetailTabMain').show()
            }
        })
    },
    showbook: function() {
        if (order_bid.showuse == '1') {
            $('.record-list').addClass('hidden');
            $('#AuctConfirmation').removeClass('hidden');
            $('.tab-menu li').eq(6).addClass('current').siblings().removeClass('current');
            $(window).scrollTop(770);
        }
    }
};
(function($) {
    //渲染页面信息
    $.fn.loadinfo = function(data) {
        if (data.hasProv) {
            $('#prior_span').html("有")
            $('.pay-first-icon').show();
        } else {
            $('#prior_span').html("无")
            $('.pay-first-icon').hide()
        }
        order_bid.lotMode = data.lotMode;
        order_bid.amount = data.amount;
        order_bid.unit = data.unit;
        var unit = ""
        if (order_bid.lotMode == '1') {
            $('#all_count').css('display', 'inline_block')
            $('#lot_allnum').html(data.amount + data.unit)
            unit = "&nbsp;/&nbsp;" + data.unit
        } else {
            $('#all_count').hide()
        }
        var arr = ["即将开始", "正在进行", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "已暂停"]
        $('.auct_type').html(data.auctionType);
        //$('.auct_time').html(util.tranferTime(data.startTime, true, true) + "- " + util.tranferTime(data.endTime, true, true))
        $('.auct_name').html(data.meetName);
        $('#bid_name').html('<span>' + arr[data.lotStatus] + '</span><em style="margin-right: 16px">' + data.name + '</em>') //标的名称
        $('#startPrice').html(util.formatCurrency(data.startPrice) + '&nbsp;元' + unit) //起拍价
        $('#assessPrice').html(util.formatCurrency(data.assessPrice)) //评估价
        $('#cashDeposit').html(util.formatCurrency(data.cashDeposit)) //保证金
        $('#rateLadder').html(util.formatCurrency(data.rateLadder)) //加价幅度
        $('#bidCycle').html(util.tranferTime4(data.freeTime)) //竞价周期
        $('#delayTimes').html(util.tranferTime4(data.limitTime)) //限制周期
        $('.companyName').html(data.companyName) //拍卖会机构
        $('.companyTel').html(data.linkTel) //拍卖会机构
        $('.look_count span').html(data.onLooker) //围观次数
        $('.join_count span').html(data.enrollment) //报名人数
        $('.linkman').html(data.linkMan);
        $('#start_price span').html(util.changeMoneyToChinese(data.startPrice))
        $('#assess_price span').html(util.changeMoneyToChinese(data.assessPrice))
        $('#deposite_price span').html(util.changeMoneyToChinese(data.cashDeposit))
        $('#rate_price span').html(util.changeMoneyToChinese(data.rateLadder))
        $(document).attr("title", data.name + '_中拍平台');
        var title = '<p><em><a href="/pages/meeting/list.html">拍卖会</a></em><em class="auction-enter">' + data.meetName + '</em><em>' + data.name + '</em></p>'
        $('.breadcrumb').html(title)
        $('.auction-enter').click(function() {
            window.open('/pages/meeting/conference.html?id=' + data.meetId)
        })
        var icontext = '';
        if (data.isRestricted == '2') {
            icontext = '<div class="pai-tag  tag-buy-restrictions">不限购</div>'
            $('#bid_name').append(icontext)
        }
        if (data.canLoan == '1') {
            icontext = '<div class="pai-tag  tag-support-loans">可贷款</div>'
            $('#bid_name').append(icontext)
        }
        var showsum = '';
        if (data.picSmall.length > 0) {
            for (var i = 0; i < data.picSmall.length; i++) {
                var classname = (i == 0) ? 'current' : '';
                var span = '<span class="dis_block_child ' + classname + '"><img src=' + data.picSmall[i].filePath + '></span>'
                showsum += span;
            }
        } else {
            showsum = '<span class="dis_block_child current"><img src="/themes/images/lotdetail.png"></span>';
        }

        if (data.picLarge.length > 0) {
            $('#showbox .showimg').attr("src", data.picLarge[0].filePath)
        } else {
            $('#showbox .showimg').attr("src", "/themes/images/lotdetail.png")
        }

        $('#showsum p').html(showsum)
        if (data.picSmall.length > 0 || data.picLarge.length > 0) {
            focuspicfn(data.picSmall, data.picLarge)
        }
        $('#showbox img').bind("error", function() {
            this.src = "/themes/images/lotdetail.png";
            $(this).addClass('no-lotdetail');
        });
        $('#showsum img').bind("error", function() {
            this.src = "/themes/images/lotdetail.png";
        });

    }
    $.fn.morePriceLog = function(data) {
        var hisStr = '';
        if (data.totalCount > 0) { //有竞买记录
            var isHaveFirst = false
            $.each(data.items, function(i, record) {
                if (!$.isEmptyObject(record)) {
                    var isProv = record.isProv >= 1 ? '优' : '';
                    var isAgent = record.isAgent >= 1 ? '委' : '';
                    var isRecord = record.isRecord >= 1 ? '现' : '';
                    var isBack = data.items[i].isBack;
                    if (isBack) {
                        i = 2; //回退
                    } else {
                        if (isHaveFirst) {
                            i = 1; //有领先的 不是回退 就是 出局
                        } else {
                            i = 0; //领先
                            isHaveFirst = true;
                        }
                    }
                    if (i == 0 && data.page == 1) {
                        $('#curr_jmh').val(record.bidNum); //领先人的竞买号
                        if (order_bid.state == 3) {
                            hisStr += '<tr class="get">' +
                                '<td><span class="record-icon"><s>成交</s></span></td>' +
                                '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                '<td>' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                '</tr>';
                        } else {
                            if (record.isBack) {
                                hisStr += '<tr class="out">' +
                                    '<td><span class="record-icon"><s>回退</s></span></td>' +
                                    '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                    '<td>' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                    '</tr>';
                            } else {
                                hisStr += '<tr class="leader">' +
                                    '<td><span class="record-icon"><s>领先</s></span></td>' +
                                    '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                    '<td>' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                    '</tr>';
                            }
                        }
                    } else {
                        if (record.isBack) {
                            hisStr += '<tr class="out">' +
                                '<td><span class="record-icon"><s>回退</s></span></td>' +
                                '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                '<td>' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                '</tr>';
                        } else {
                            hisStr += '<tr class="out">' +
                                '<td><span class="record-icon"><s>出局</s></span></td>' +
                                '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                '<td>' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                '</tr>';
                        }
                    }
                }
            });
            $(".page-wrap").show().page({
                page: data.page, //第几页
                totalPages: data.totalPages, //总页数
                showNum: 5,
                change: lots_()
            });
        } else { //无竞买记录
            hisStr = '<tr><td colspan="4">没有更多出价记录...</td></tr>';
        }
        this.html(hisStr);
    };
    $.fn.errorspeak = function(data) {
        var ul = ""
        ul = '<li class="lineh22">暂无拍卖师发言</li>';
        this.html(ul)
        return this
    }
    $.fn.morespeaklogs = function(data) { //加载拍卖师发言记录//
        var ul = ""
        if (data.totalCount == 0) {
            ul = '<li>暂无拍卖师发言</li>';
            $(".page-wrap-two").hide()
        } else {
            $.each(data.items, function(index, data) {
                var bidauction = ""
                if (data.lotId) {
                    bidauction = "当前标的"
                } else {
                    bidauction = "拍卖会"
                }
                var auctioneerlogs = '<li class="lineh22">' +
                    '<span class="sendtype">' + bidauction + '</span>' +
                    '<span class="sendcontent">' + data.content + '</span>' +
                    '<span class="sendtime">' + util.tranferTime2(data.date) + '</span>' +
                    '</li>'
                ul += auctioneerlogs
            })
            $(".page-wrap-two").show().page({
                page: data.page, //第几页
                totalPages: data.totalPages, //总页数
                showNum: 5,
                change: lots_two()
            });
        }
        this.html(ul)
        return this
    };
    //即将开始的 竞价效果渲染
    $.fn.commingBidCommon = function(duration, data) { //TODO 开始时间需修改为拍卖会的开始时间
        $('.action_bid_aera').hide();
        var comming = $('<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">' + order_bid.price_type + '</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(order_bid.nowPrice) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '</li>' +
            '<li class="distance_start">' +
            '<span class="title">' + order_bid.status + '</span>' +
            '<span class="countdown J_TimeLeft" id="LOT_DURATION_BEGIN"></span>' +
            '<span class="end">开始</span>' +
            '</li>' +
            '</ul>');
        this.html(comming);
        if (order_bid.meetStatus == '0') {
            comming.find('#LOT_DURATION_BEGIN').html(util.tranferTime(order_bid.meetStartTime, true))
            comming.find('.end').show();
        }
        if (order_bid.meetStatus == '1' && data.state != '1') {
            comming.find('.distance_start').hide()
        }
        if (order_bid.meetStatus == '1' && data.state == '1') {
            comming.find('.distance_start .title').html('距结束')
            PAGE_TIMER.start('PAGE_TIMER.begin()', duration);
            comming.find('.end').hide()
        }
        $('#LOT_DURATION_BEGIN').css({
            "font-size": "20px",
            "color": "#333"
        })
        this.show();
        if (order_bid.unit) {
            $('.rmb-unit').html('元&nbsp;/&nbsp;' + order_bid.unit)
        }
        return this;
    };
    $.fn.commingBidJoin = function(data) {
        var display = $('<div class="pm-bid-eye">' +
            '<div class="pm-bid pm-before-apply bid_ing" style="display: block">' +
            '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price" style="padding-left:0px">' +
            '<span class="title">保证金</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(order_bid.deposit) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '<span class="tip_pay"><img src="/themes/images/pay_success.png">支付完成</span>' +
            '</li>' +
            '</ul>' +
            '<dl class="pm-message clearfix" style="padding-left: 0px">' +
            '<dt class="pm-h"></dt>' +
            '<dd>' +
            '<div class="line">' +
            '<a id="pay_bzj_btn" target="_blank" class="pm-button-new pay-bzj-button loading i-b"></a>' +
            '</div>' +
            '</dd>' +
            '</dl>' +
            '</div>' +
            '</div>');
        $('.tip_pay').show()
        this.append(display);
        return this;
    };
    //拍卖进行中  参数：当前价格，结束时间
    $.fn.progressBidCommon = function(duration, currBidder) {
        $('.action_bid_aera').hide();
        var display = '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">当前价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(order_bid.nowPrice) + '</em></span>' +
            '<em class="rmb-unit">元</em>';
        if (currBidder && currBidder != '') {
            display += '<div class="bidder_people">' +
                '<span>出价人：</span>' +
                '<span class="curr_person">' + currBidder + '</span>' +
                '</div>';
        }
        display += '</li>' +
            '<li class="J_PItem" id="sf-countdown" style="height: 30px">' +
            '<span class="title J_TimeTitle">距结束</span>' +
            '<span class="countdown J_TimeLeft" id="LOT_DURATION_FINISH"></span>' +
            '<span id="J_Delay" class="pm-delay"><em class="delayCnt">0</em>次延时</span>' +
            '</li>' +
            '</ul>';
        this.html(display);
        this.show();
        if (duration > 0) {
            PAGE_TIMER.start(PAGE_TIMER.finish, duration);
        } else {
            $('#LOT_DURATION_FINISH').html('等待拍卖师操作')
        }
        if (order_bid.unit) {
            $('.rmb-unit').html('元&nbsp;/&nbsp;' + order_bid.unit)
        }
        return this;
    };
    $.fn.pausenoJoin = function() {
        $('.action_bid_aera').hide();
        var display = '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">当前价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(order_bid.nowPrice) + '</em></span>' +
            '<em class="rmb-unit">元</em>';
        display += '</li>' +
            '<li class="J_PItem" id="sf-countdown" style="height: 30px">' +
            '<span class="title J_TimeTitle">距结束</span>' +
            '<span class="countdown J_TimeLeft" id="pausenoJoin" >已暂停</span>' +
            '</li>' +
            '</ul>';
        this.html(display);
        this.show();
        if (order_bid.unit) {
            $('.rmb-unit').html('元&nbsp;/&nbsp;' + order_bid.unit)
        }
        return this;
    };
    //保证金金额
    $.fn.bidUnjoin = function() {
        var display = $('<div class="pm-bid-eye">' +
            '<div class="pm-bid pm-before-apply bid_ing" style="display: block">' +
            '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price" style="padding-left:0px">' +
            '<span class="title">保证金</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(order_bid.deposit) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '<span class="tip_pay"><img src="/themes/images/pay_success.png">支付完成</span>' +
            '</li>' +
            '</ul>' +
            '<dl class="pm-message clearfix" style="padding-left: 0px">' +
            '<dt class="pm-h"></dt>' +
            '<dd>' +
            '<div class="line">' +
            '<a id="pay_bzj_btn" target="_blank" class="pm-button-new pay-bzj-button loading i-b"></a>' +
            '</div>' +
            '</dd>' +
            '</dl>' +
            '</div>' +
            '</div>');
        if (order_bid.user.isApply) {
            display.find('#pay_bzj_btn').hide()
            var applyTip = "<div class='applytips'><p class='color-333'>您已报名成功！</p><p class='color-999'>请尽快联系拍卖企业完成保证金支付</p></div>"
            display.find('.pm-message').append(applyTip)
            if (order_bid.user.isJoin) {
                display.find('#pay_bzj_btn').show().css({
                    "display": "inline-block"
                })
                display.find('.applytips').hide()
                if (order_bid.meetStatus == '1') { // TODO 修改为拍卖会的开始时间
                    display.find('#pay_bzj_btn').html("进入竞价大厅")
                    display.find('.tip_pay').show()
                    display.find('#pay_bzj_btn').attr("href", '/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId);
                } else {
                    if (order_bid.meetStatus == '0') {
                        display.find('#pay_bzj_btn').html("等待开拍").css({
                            "background": "#999"
                        })
                    }
                }
            }
        } else {
            display.find('#pay_bzj_btn').html('报名').width(150)
        }
        display.find('#pay_bzj_btn').bind('click', function() {
            if (display.find('#pay_bzj_btn').html() == "报名") {
                if (order_bid.user.isLogin) {
                    $('.applyDiv').show().openDialog();
                    window.open("/pages/pay/apply.html?lotId=" + order_bid.lotId); //支付保证金页面 TODO 需要穿lotID
                } else {
                    window.open("/pages/user/login.html") //登录页面
                }
            }
        });
        this.append(display);
        return this;
    };
    //竞拍过程中_没有登录的用户渲染
    $.fn.bidUnlogin = function(data) {
        var display = '<p class="jph_box">' +
            '此页面仅支持报名，如要参拍出价，请进入竞价大厅。<a href="/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId + '" target="_blank" class="enter-jpRoom">进入竞价大厅</a>' +
            '</p>';
        this.find('.pm-bid-eye').append(display);
        return this
    };
    //打开弹窗遮罩效果
    $.fn.openDialog = function() {
        $("body").append("<div class='opcy_new'></div>");
        $(".opcy_new").height($('html').height())
            // $(".opcy_new").height($(".sifa-head").height() + $(".sifa-content-div").height() + $(".J-sifa-foot").height());
    };
    //关闭弹窗及遮罩效果
    $.fn.closeDialog = function() {
        $(".dialog").hide();
        $(".opcy_new").remove();
    };
    //结束_未登录用户渲染竞价
    $.fn.finishBidCommon = function(data) {
        $('.action_bid_aera').hide();
        var price = 0
        if (data.nowPrice) {
            price = data.nowPrice
        } else {
            price = order_bid.nowPrice
        }

        var display = '<ul class="pm-bid-eyebrow end_time">' +
            '<li class="J_PItem" id="sf-countdown">' +
            '<span class="title J_TimeTitle">结束时间</span>' +
            '<span class="time">' + util.tranferTime(data.endTime, true, false) + '</span>' +
            '</li>' +
            '</ul>' +
            '<div class="pm-bid tex-center" id="J_finish_result" >' +
            '<p class="pp_endstate" style="padding-top: 20px">本标的拍卖已结束</p>' +
            '<p class="currentrate">成交价：<span class="colorred">' + util.formatCurrency(price) + '</span><em class="colorred">元+' + util + '</em></p>' +
            '</div>';
        this.html(display);
        if (data.state == '3') {
            $('.currentrate').show()
            if (data.delayTimes) {
                $('.delaycount').show()
            } else {
                $('.delaycount').hide()
            }
            $('.pp_endstate').css({
                "padding-top": "27px"
            })
        }
        if (order_bid.lotMode == 1) {
            $('.currentrate em.colorred').html('元&nbsp;/&nbsp;' + order_bid.unit)
        }
        var enter;
        if (data.state != 0 && data.state != 1 && data.state != 3) {
            $('.pp_endstate').css({
                "padding-top": "45px"
            })
            $('.hallenter').css({
                "bottom": "35px"
            })
            $('.delaycount').hide()
            $('.currentrate').css({
                "font-size": "16px"
            })
            $('.currentrate').hide()
            if (data.state == '2') { //已流拍
                if (parseFloat(order_bid.meetStatus) > 1) {
                    $('.hallenter').hide()
                    $('#J_finish_result').css({
                        "padding-bottom": "0px",
                        "min-height": "120px"
                    })
                    $('.pp_endstate').html('本场拍卖已流拍').css({
                        "padding-top": "46px"
                    })
                } else {
                    enter = '<a class="hallenter" href="/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId + '">进入竞价大厅</a>'
                    this.find(".pm-bid").append(enter)
                    $('#J_finish_result').css({
                        "padding-bottom": "0px"
                    })
                    $('.hallenter').css({
                        "margin": "30px 0px"
                    })
                    $('.pp_endstate').html('本场拍卖已流拍').css({
                        "padding-top": "30px"
                    })
                }

            } else if (data.state == '4') { //已中止
                if (parseFloat(order_bid.meetStatus) > 1) {
                    $('.hallenter').hide()
                    $('#J_finish_result').css({
                        "padding-bottom": "15px"
                    })
                } else {
                    enter = '<a class="hallenter" href="/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId + '">进入竞价大厅</a>'
                    this.find(".pm-bid").append(enter)
                    $('#J_finish_result').height(150)
                    $('.hallenter').css({
                        "margin": "15px 0px"
                    })
                }
                $('.pp_endstate').html('本场拍卖已中止').css({
                    "padding-top": "30px"
                })
                if (data.unnormalTime) {
                    $('#sf-countdown .J_TimeTitle').html('中止时间：')
                    $('#sf-countdown .time').html(util.tranferTime(data.unnormalTime, true, false))
                }
                if (data.changeReason) {
                    $('.currentrate').html('中止理由：' + data.changeReason).show()
                } else {
                    $('.currentrate').html('中止理由：无').show()
                }
            } else if (data.state == '5') { //已撤拍
                if (parseFloat(order_bid.meetStatus) > 1) {
                    $('.hallenter').hide()
                    $('#J_finish_result').css({
                        "padding-bottom": "15px"
                    })
                } else {
                    enter = '<a class="hallenter" href="/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId + '">进入竞价大厅</a>'
                    this.find(".pm-bid").append(enter)
                    $('#J_finish_result').height(150)
                    $('.hallenter').css({
                        "margin": "15px 0px"
                    })
                }
                if (data.unnormalTime) {
                    $('#sf-countdown .J_TimeTitle').html('撤拍时间：')
                    $('#sf-countdown .time').html(util.tranferTime(data.unnormalTime, true, false))
                }
                $('.pp_endstate').html('本场拍卖已撤拍').css({
                    "padding-top": "30px"
                })
                if (data.changeReason) {
                    $('.currentrate').html('撤拍理由：' + data.changeReason).show()
                } else {
                    $('.currentrate').html('撤拍理由：无').show()
                }
            } else if (data.state == '6') { //已暂缓
                $('.pp_endstate').html('本场拍卖已暂缓')
                $('.currentrate').hide()
            } else if (data.state == '7') { //已暂停
                if (order_bid.user.isJoin) {
                    if (parseFloat(order_bid.meetStatus) > 1) {
                        $('.hallenter').hide()
                        $('#J_finish_result').css({
                            "padding-bottom": "15px"
                        })
                    } else {
                        enter = '<a class="hallenter" target="_blank" href="/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId + '">进入竞价大厅</a>'
                        this.find(".pm-bid").append(enter)
                        $('.pp_endstate').css({
                            "padding-top": "33px"
                        })
                        $('#J_finish_result').css({
                            "height": "130px"
                        })
                        $('.hallenter').css({
                            "margin-top": "25px"
                        })
                        $('.hallenter').hide()
                    }
                    if (data.suspendTime) {
                        $('#sf-countdown .J_TimeTitle').html('暂停时间：')
                        $('#sf-countdown .time').html(util.tranferTime(data.suspendTime, true, false))
                    }
                    $('.pp_endstate').html('本场拍卖已暂停')
                    $('#J_finish_result').css({
                        "height": "130px"
                    })
                    $('.hallenter').css({
                        "margin-top": "25px"
                    })
                }
            }
        }
        this.show();
        return this;
    };

    $.fn.finishBidOwer = function(bidderNumber, bidCount) {
        this.find(".pm-bid").append('<p class="result">恭喜您，获得本标的。<a href="#RecordContent" class="colorred success_book">查看成交确认书</a></p>');
        var mydiv = $('<div class="my-info clearfix"></div>');
        if (parseFloat(order_bid.meetStatus) > 1) {
            $('.hallenter').hide()
            $('#J_finish_result').css({
                "padding-bottom": "0px"
            })
        } else {
            if (!$('.hallenter')) {
                var enter2 = '<a class="hallenter" href="/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId + '">进入竞价大厅</a>'
                this.find(".pm-bid").append(enter2)
                $('.hallenter').css({
                    "margin": "0px"
                })
            }
        }
        $('.success_book').click(function() {
            $('.record-list').addClass('hidden');
            $('#AuctConfirmation').removeClass('hidden');
            $('.tab-menu li').eq(6).addClass('current').siblings().removeClass('current');
            $(window).scrollTop(770);
        })
        this.append(mydiv);
        return this;
    };
    //竞拍结束后出局者
    $.fn.finishBidOutter = function(data) {
        this.find(".pm-bid").append('<p class="result">很遗憾，您未获得获得本标的。<a href="/pages/personal/home.html?showuse=3&lotId=' + order_bid.lotId + '" class="colorred">查看保证金</a></p>');
        var mydiv = $('<div class="my-info clearfix"></div>');
        if (parseFloat(order_bid.meetStatus) > 1) {
            $('.hallenter').hide()
            $('#J_finish_result').css({
                "padding-bottom": "0px"
            })
        } else {
            if (!$('.hallenter')) {
                var enter3 = '<a class="hallenter" href="/pages/meeting/hall.html?lotId=' + order_bid.lotId + '&meetId=' + order_bid.meetId + '">进入竞价大厅</a>'
                this.find(".pm-bid").append(enter3)
                $('.hallenter').css({
                    "margin": "0px"
                })
            }
        }
        $('.pm-bd').after(mydiv);
        return this
    }
    $.fn.buildMyBidderInfo = function() {
            var prior = ''
            if (order_bid.user.isPrior) {
                prior = "优"
            }
            if (order_bid.user.isAgent) {
                prior = "委"
            }
            if (order_bid.user.isAgent && order_bid.user.isPrior) {
                prior = "优委"
            }
            var mydiv = '<ul class="bidnum-list">' +
                '<li>您的竞拍号：<span id="show_jmh">' + order_bid.mybidNum + prior + '</span></li>' +
                '<li style="float: right">已出价:<span id="show_time">' + order_bid.bidCount + '</span>次</li>' +
                '</ul>'
            this.append(mydiv);
            return this;
        }
        //渲染竞价成功确认书
    $.fn.buildConfirmation = function(data) {
        $('.tab-menu li').eq(6).removeClass('hidden')
        util.changeToEmpty(data);
        this.find('.courtName').html(data.companyName).end()
            .find('.lotName').html(data.name).end()
            .find('.linkUrl').html(window.location.href).end()
            .find('.noticeTime').html(util.tranferTime(data.noticeTime)).end()
            .find('.startTime').html(util.tranferTime(data.startTime)).end()
            .find('.endTime').html(util.tranferTime(data.bargainTime)).end()
            .find('.bargainUserName').html(data.barginUserName).end()
            .find('.nowPriceNum').html(data.barginPriceNum).end()
            .find('.bargainYear').html(new Date(data.bargainTime).getFullYear()).end()
            .find('.bargainMonth').html(new Date(data.bargainTime).getMonth() + 1).end()
            .find('.bargainDay').html(new Date(data.bargainTime).getDate()).end()
            .find('.bargainPrice').html(util.formatCurrency(data.bargainPrice) + '元').end()
            .find('.bargainPriceL').html('(' + util.changeMoneyToChinese(data.bargainPrice) + ')').end()
            .find('.bargainTime').html(util.tranferTime(data.bargainTime));
        if (order_bid.lotMode == '1') {
            $('.auction-end .detail-common-text').eq(1).html(
                '<div class="detail-common-text">该标的网络拍卖成交单价：' +
                '<span class="bargainPrice">' + util.formatCurrency(data.bargainPrice / order_bid.amount) + '元</span>' +
                '<span class="bargainPriceL">(' + util.changeMoneyToChinese(data.bargainPrice / order_bid.amount) + ')</span>' +
                '</div>' +
                '<div class="detail-common-text">标的总量：' +
                '<span class="bargainmount">' + $('#lot_allnum').html() + '</span>' +
                '</div>' +
                '<div class="detail-common-text">成交总价：' +
                '<span class="bargainPrice">' + util.formatCurrency(data.bargainPrice * order_bid.amount) + '元</span>' +
                '<span class="bargainPriceL">( ' + util.changeMoneyToChinese(data.bargainPrice * order_bid.amount) + ')</span>' +
                '</div>'
            )
        }
    };
    $('.applyDiv .successBtn').click(function() {
        order_bid_controller.checkDeposite();
        if (order_bid.user.isApply) {
            $('.applyDiv').hide().closeDialog();
            order_bid_controller.init();
        } else {
            $('.applyDiv').hide();
            $('.apply-error').show();
        }
    });
    $('.applyDiv .dangerBtn').click(function() {
        window.open('/pages/help/helpcenter_problem.html');
    })
    $('.apply-error .sureBtn').click(function() {
        $('.apply-error').hide().closeDialog()
    });
    $('.pay_tip_close').click(function() {
        $('.applyDiv').hide().closeDialog();
    });
    var lots_two = function(pageNum) { //竞价记录分页
        return function(pageNum) {
            var url = '/caa-search-ws/ws/0.1/auctionmeet/speaklogs?meetId=' + order_bid.meetId + '&lotId=' + order_bid.lotId + '&start=' + pageNum + '&count=10'
            var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
            var auctiondata = {};
            util.getdata(newurl, "get", "json", false, false, function(data) {
                auctiondata.data = data;
                auctiondata.url = newurl;
                $('.speaklogs-list').morespeaklogs(data);
            }, function(data) {
                //TODO 异常处理
            });
            return pageNum;
        }
    }
    var lots_ = function(pageNum) { //竞价记录分页
            return function(pageNum) {
                var url = '/personal-ws/ws/0.1/bid/pricelog/' + order_bid.lotId + '?sortname=&sortorder=&start=' + pageNum + '&count=10'
                var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
                var auctiondata = {};
                util.getdata(newurl, "get", "json", false, false, function(data) {
                    auctiondata.data = data;
                    auctiondata.url = newurl;
                    $('#J_RecordList tbody').morePriceLog(data);
                }, function(data) {
                    //TODO 异常处理
                });
                return pageNum;
            }
        }
        //底部信息的点击
    $('.tab-menu li').click(function() {
        var ind = $(this).index();
        for (var i = 0; i < $('.tab-menu li').length; i++) {
            $('.record-list').eq(i).addClass('hidden')
            $('.tab-menu li').eq(i).removeClass('current')
        }
        $('.record-list').eq(ind).removeClass('hidden')
        $('.tab-menu li').eq(ind).addClass('current')
    });

    setInterval(order_bid_controller.init, 30000)
    $('.auctionnews .dis_block_child').mouseover(function() {
        var _height = -($(this).find('.typeTips').height() + 6)
        $(this).find('.typeTips').show().css('top', _height)
        $(this).mouseout(function() {
            $(this).find('.typeTips').hide()
        })
    })
})(jQuery);