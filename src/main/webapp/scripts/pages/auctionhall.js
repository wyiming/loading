$(document).ready(function() {
    $(".J-container-title").headerStyle();
    auctionHall_controller.init();
    auctionHall_controller.Lookercount(); //围观
    $.each(auction_data.items, function(i, data) {
        connection.register('/lots/lot_' + data.id + "/status", auctionHall_controller.itemStatus(data.id));
        connection.register('/lots/lot_' + data.id + "/price", auctionHall_controller.priceCometd(data.id));
    })
    connection.register('/auctions/lot_' + auction_data.lotId, auctionHall_controller.latestSpeaklog);
    connection.register('/auctions/auction_' + auction_data.meetId, auctionHall_controller.latestSpeaklog);
});
//页面级的计时器
var PAGE_TIMER = {
    TIMER: false, //页面级的计时器只保留一个。如果想用多个计时器，可以考虑用JSON来实现
    duration: 0,
    start: function(funcName, duration) {
        auction_data.timeBol = true;
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
        window.clearTimeout(PAGE_TIMER.TIMER);
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
            PAGE_TIMER.distory();
            window.clearTimeout(PAGE_TIMER.TIMER);
            if (auction_data.meetMode != '1' && auction_data.timeBol) {
                window.clearTimeout(PAGE_TIMER.TIMER);
                auctionHall_controller.timeover()
                auction_data.timeBol = false
            }
        }
    }
};
//保存标的相关的可变的数据  注意：竞价阶梯、起拍价都是可变的。
var auction_data = {
    meetId: util.getQueryString("meetId"), //获取标的ID
    lotId: util.getQueryString("lotId"),
    showuse: util.getQueryString("showuse"),
    user: {
        isLogin: false, //当前用户是否登录，在页面初始化时赋值
        isJoin: false, //当前用户是否已经缴纳保证金，在页面初始化时赋值。点击支付完成时赋值
        isApply: false, //当前用户是否报名
        isPrior: false, //当前用户是否是优先竞买人
        isAgent: false //当前用户是否是委托竞买人
    },
    meetMode: 0,
    show_price: 0, //当前价格
    available_price: 0, //可以出的最低价
    range: 0, //竞价阶梯
    deposit: 0, //保证金
    status: 0, //拍卖状态   state
    mybidNum: null, //我的竞买号
    nowBidNum: null,
    bidCount: 0,
    lastprice: 0, //上一条自己出的价格
    pagetime: 30000, //30秒计时器的频率在限时竞价时间需更改
    timeBol: true,
    statusFresh: null,
    limitFresh: null
};
//页面控制器，负责与后台交互，获取数据
var auctionHall_controller = {
    init: function() {
        clearInterval(auction_data.statusFresh)
        auctionHall_controller.itemlist()
        auctionHall_controller.initLotInfo(auction_data.lotId); //初始化数据
        auctionHall_controller.latestBidInfo(auction_data.lotId);
        auctionHall_controller.limitlot(auction_data.lotId);
        auctionHall_controller.latestSpeaklog();
        auctionHall_controller.auctionner()
        auctionHall_controller.getFreshIterval()
        auction_data.statusFresh = setInterval(auctionHall_controller.currentBidRecord, auction_data.pagetime)
    },
    itemStatus: function(lotId) {
        return function() {
            auction_data.show_price = 0;
            auctionHall_controller.initLotInfo(lotId);
            auctionHall_controller.itemlist()
            auctionHall_controller.latestBidInfo(lotId);
            auctionHall_controller.getFreshIterval();
        }
    },
    priceCometd: function(lotId) {
        return function() {
            auctionHall_controller.initLotInfo(lotId);
            auctionHall_controller.latestBidInfo(lotId);
        }
    },
    currentBidRecord: function() {

        if (!navigator.onLine) {
            alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
            window.location.reload(true);
        }
        auctionHall_controller.itemlist()
        auctionHall_controller.initLotInfo(auction_data.lotId)
        auctionHall_controller.latestBidInfo(auction_data.lotId)
    },
    itemlist: function() {
        $.ajax({
            url: '/caa-search-ws/ws/0.1/lots/sort?start=0&count=5&meetId=' + auction_data.meetId + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                $('.upcoming_list').waitAuction(data);
                auction_data.lotId = data.items[0].id;
                auction_data.items = data.items
                if (user.islogin()) {
                    auction_data.user.isLogin = true;
                    auctionHall_controller.checkDeposite(auction_data.lotId);
                } else {
                    auction_data.user.isLogin = false;
                }
            },
            error: function(data) {

            }
        })
    },
    changePrice: function() {
        if (auction_data.user.isPrior) {
            //如果是优先竞买人，并且当前价不是自己出的，就最低价就是当前价
            if (auction_data.mybidNum == auction_data.nowBidNum) {
                auction_data.available_price = util.addingFn(auction_data.nowPrice, auction_data.rateLadder)
            } else {
                if (auction_data.lastprice == auction_data.nowPrice) {
                    auction_data.available_price = util.addingFn(auction_data.nowPrice, auction_data.rateLadder)
                } else {
                    auction_data.available_price = auction_data.nowPrice;
                }
            }
        } else {
            if (auction_data.nowBidNum) {
                //如果已经有人出价，可用的最高价位当前价格
                auction_data.available_price = util.addingFn(auction_data.nowPrice, auction_data.rateLadder)
            } else {
                auction_data.available_price = auction_data.nowPrice
            }
        }
    },
    timeover: function() { //时间走完要调用的方法
        util.getdata('/personal-ws/ws/0.1/lot/currentinfo/' + auction_data.lotId, 'get', 'json', false, false, function(data) {
            if (data.endTime < data.nowTime && data.state == '1') {
                $('#DISPLAY_BID_FINISH').timefinish()
            }
        })
    },
    auctionner: function() {
        $.ajax({
            url: '/caa-search-ws/ws/0.1/auctioneer?meetId=' + auction_data.meetId + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                $('.auctioneerpic img').attr("src", data.photo)
                $('.auctioneername').html(data.name)
                $('.auctioneername2 span').eq(1).html(data.idcard)
            },
            error: function() {

            }
        })
    },
    initLotInfo: function(lotId) {
        $.ajax({
            url: "/personal-ws/ws/0.1/lot/" + lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                if (data) {
                    if (data.nowPrice) {
                        auction_data.nowPrice = data.nowPrice;
                    } else {
                        auction_data.nowPrice = data.startPrice;
                    }
                    auction_data.deposit = data.cashDeposit;
                    auction_data.range = data.rateLadder;
                    auction_data.status = data.lotStatus;
                    auction_data.meetMode = data.meetMode
                    auction_data.freetime = data.freeTime;
                    auction_data.limitTime = data.limitTime;
                    $('.grid-c').loadinfo(data); //渲染标的信息页面
                }
            },
            error: function(data) {

            }
        })
    },
    latestBidInfo: function(lotId) { //最新的竞价信息 4种场景下调用改方法 每隔30秒调用一次  竞价成功调用一次  推送状态发生变化调用一次 0.00倒计时结束调用1次
        $.ajax({
            url: '/personal-ws/ws/0.1/lot/currentinfo/' + lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                auction_data.status = data.state
                auction_data.nowBidNum = data.nowBidNum;
                auction_data.endTime = data.endTime;
                auction_data.nowTime = data.nowTime;
                auction_data.limitTime = data.limitTime;
                if (data.nowPrice && !auction_data.show_price) {
                    auction_data.show_price = data.nowPrice;
                }
                if (data.hasMinPrice) {
                    $('#retain').html('有')
                } else {
                    $('#retain').html('无')
                }
                var arr = ["即将开始", "正在进行", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "已暂停"]
                $('#bid_name span').html(arr[data.state])
                if (data.rateLadder) {
                    auction_data.rateLadder = data.rateLadder;
                }
                if (parseFloat(data.nowPrice) > 0) {
                    auction_data.nowPrice = data.nowPrice;
                }
                if (auction_data.user.isLogin) {
                    auctionHall_controller.topprice(auction_data.lotId)
                }
                auctionHall_controller.limitlot(lotId)
                auctionHall_controller.changePrice();
                if (data.state == 0) { //如果标的即将开始
                    auction_data.price_type = "起拍价"
                    var $comming = $("#DISPLAY_BID_COMMING").commingBidCommon(); //TODO 时间需更改
                    if (auction_data.user.isJoin) {
                        auctionHall_controller.loadJPH(lotId); //加载我的竞拍号
                        $comming.commingBidCommon().waitBid(data).buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount);
                    } else { //没有缴纳保证金
                        $comming.bidUnjoin();
                    }
                    if (!auction_data.user.isLogin) { //用户没有登录
                        $comming.bidUnlogin();
                    }
                } else if (data.state == 1) { //正在进行
                    auction_data.price_type = "当前价";
                    auction_data.nowBidNum = data.nowBidNum;
                    var $progressing = $('#DISPLAY_BID_PROGRESSING').progressBidCommon(data.endTime - data.nowTime, data.nowBidNum, data)
                    if (data.endTime < data.nowTime) {
                        return false
                    }
                    if (auction_data.user.isLogin) { //用户已经登录
                        if (auction_data.nowBidNum) { //存在出价记录
                            $progressing.progressBidCommon(data.endTime - data.nowTime, data.nowBidNum, data);
                        }
                        if (auction_data.user.isJoin) {
                            auctionHall_controller.loadJPH(lotId);
                            if (auction_data.mybidNum == data.nowBidNum) {
                                $progressing.progressBidCommon(data.endTime - data.nowTime, "我", data).progressBidJoin(data).progressBidLeader()
                            } else {
                                if (auction_data.bidCount > 0) { //表示自己出过价
                                    $progressing.progressBidCommon(data.endTime - data.nowTime, data.nowBidNum, data).progressBidJoin(data).progressBidOutter()
                                } else {
                                    $progressing.progressBidCommon(data.endTime - data.nowTime, "", data).progressBidJoin(data);
                                }
                            }
                            $progressing.buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount)
                        } else { //没有缴纳保证金
                            $progressing.bidUnjoin();
                        }
                    } else { //用户没有登录
                        $progressing.bidUnjoin().bidUnlogin();
                    }
                } else if (data.state == 3) { //已成交
                    var $finish = $('#DISPLAY_BID_FINISH').finishBidCommon(data)
                    $('.tab-menu li').eq(5).removeClass('hidden')
                    if (auction_data.user.isJoin) {
                        auctionHall_controller.loadJPH(lotId);
                        if (auction_data.mybidNum == data.nowBidNum) {
                            $finish.finishBidOwer();
                        } else {
                            $finish.finishBidOutter();
                        }
                        $finish.buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount)
                    }
                } else {
                    $('#DISPLAY_BID_FINISH').finishBidCommon(data)
                    if (auction_data.user.isJoin) {
                        auctionHall_controller.loadJPH(lotId);
                        $('#DISPLAY_BID_FINISH').finishBidCommon(data).buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount)
                    }
                }
            },
            error: function() {

            }
        })
    },
    checkDeposite: function(lotId) { //检测是否支付保证金
        $.ajax({
            url: "/personal-ws/ws/0.1/checkpay/lot/" + lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                if (data.status) { //已支付保证金
                    auction_data.user.isJoin = true
                    auction_data.user.isApply = true
                    if (auction_data.mybidNum) {
                        $('#DISPLAY_BID_PROGRESSING').buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount);
                    }
                } else { //未支付保证金
                    auction_data.user.isJoin = false
                    if (data.code == '201' || data.code == '200') {
                        auction_data.user.isApply = true
                    } else {
                        auction_data.user.isApply = false
                    }
                }
            },
            error: function(data) {

            }
        })
    },
    loadJPH: function(lotId) { //加载竞买号
        $.ajax({
            url: '/personal-ws/ws/0.1/lot/' + lotId + '/mine' + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                if (data.bidNum || auction_data.user.isJoin) {
                    auction_data.user.isAgent = data.isAgent;
                    auction_data.user.isPrior = data.isPrior;
                    auction_data.bidCount = data.bidCount;
                    auction_data.mybidNum = data.bidNum;
                }
            },
            error: function(data) {

            }
        })
    },
    latestSpeaklog: function() {
        util.getdata('/caa-search-ws/ws/0.1/auctionmeet/speaklogs?meetId=' + auction_data.meetId + '&lotId=' + auction_data.lotId + '&start=0&count=100', 'get', 'json', false, false, function(data) {
            $(".auctioneerspeak").speaklogs(data);
        }, function(data) {
            $(".auctioneerspeak").errorspeak(data);
        });
    },
    limitlot: function(lotId) {
        util.getdata('/personal-ws/ws/0.1/bid/pricelog/list/' + lotId, 'get', 'json', false, false, function(logs) {
            util.transformNull(logs);
            $('.recordUl').lastestPriceLog(logs);
        });
    },
    topprice: function(lotId) { //判断当前价是否为我自己出的
        util.getdata('/personal-ws/ws/0.1/my/top/price/' + lotId, 'get', 'json', false, false, function(data) {
            if (data) { //当前价为自己出的
                auction_data.lastprice = data.lastPrice;
            }
        });
    },
    Lookercount: function() {
        util.getdata("/personal-ws/ws/0.1/onlook/lot/" + auction_data.lotId, 'get', 'json', true, false, function() {})
    },
    getFreshIterval: function() { //限时竞价时间取30秒频率获取    
        clearInterval(auction_data.limitFresh)
        if (parseFloat(auction_data.endTime) - parseFloat(auction_data.nowTime) <= parseFloat(auction_data.limitTime) * 1000) {
            if (parseFloat(auction_data.limitTime) <= 60) {
                auction_data.pagetime = 6000
            } else {
                auction_data.pagetime = 15000;
            }
            clearInterval(auction_data.statusFresh)
            clearInterval(auction_data.limitFresh)
            auction_data.limitFresh = setInterval(currentBidRecord, auction_data.pagetime)
        } else {
            auction_data.pagetime = 30000;
        }

        function currentBidRecord() {
            clearInterval(auction_data.statusFresh)
            if (auction_data.status != '3') {
                auctionHall_controller.itemlist()
            }
            auctionHall_controller.initLotInfo(auction_data.lotId)
            auctionHall_controller.latestBidInfo(auction_data.lotId)
        }
    }
};
(function($) {
    //渲染页面信息
    $.fn.loadinfo = function(data) {
        if (data.hasProv) {
            $('#prior_span').html("有")
        } else {
            $('#prior_span').html("无")
        }
        auction_data.lotMode = data.lotMode;
        auction_data.amount = data.amount;
        auction_data.unit = data.unit;
        var unit = ""
        if (auction_data.lotMode == 1) {
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
        $('.look_count span').html(data.onLooker) //围观次数
        $('.join_count span').html(data.enrollment) //报名人数
        $('#bidCycle').html(util.tranferTime4(data.freeTime)) //竞价周期
        $('#delayTimes').html(util.tranferTime4(data.limitTime)) //限制周期
        $('.companyName').html(data.companyName) //拍卖会机构
        $('.companyTel').html(data.linkTel) //联系电话
        $(document).attr("title", '竞价大厅_' + data.meetName + '_中拍平台');
        $('#start_price span').html(util.changeMoneyToChinese(data.startPrice))
        $('#assess_price span').html(util.changeMoneyToChinese(data.assessPrice))
        $('#deposite_price span').html(util.changeMoneyToChinese(data.cashDeposit))
        $('#rate_price span').html(util.changeMoneyToChinese(data.rateLadder))
        $('.exit-auction').click(function() {
            window.location.href = '/pages/meeting/conference.html?id=' + data.meetId;
        })
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


    };
    //渲染竞价记录
    $.fn.lastestPriceLog = function(items) {
        var ul = '';
        if (items.length > 3) {
            $('.see-record').show()
        }
        if (items.length == 0) {
            ul = '<li class="no-pay-records">暂无竞价记录</li>'
            this.html(ul);
        } else {
            var isHaveFirst = false
            $.each(items, function(index, data) {
                var arr = ["领先", "出局", "回退", "成交"];
                var isBack = data.isBack;
                if (isBack) {
                    index = 2; //回退
                } else {
                    if (isHaveFirst) {
                        index = 1; //有领先的 不是回退 就是 出局
                    } else {
                        index = 0; //领先
                        isHaveFirst = true;
                    }
                }
                if (auction_data.status == 3 && index == 0) {
                    index = 3;
                }
                var li = ' <li class="active' + index + '"><p>' +
                    '<span class="record-icon">' + arr[index] + '</span>' +
                    '<span class="nickname">' + data.bidNum;
                if (data.isProv) {
                    li += '<em class="isagent">优</em>'
                }
                if (data.isAgent) {
                    li += '<em class="isagent">委</em>'
                }
                if (data.isRecord) {
                    li += '<em class="isagent">现</em>'
                }
                li += '</span><span style="width: 36%">' + util.formatCurrency(data.price) + '</span></p><em class="time">' + util.tranferTime2(data.bidTime) + '</em></li>';
                ul += li
            });
            this.html(ul);
        }
    };
    //即将开始的 竞价效果渲染
    $.fn.commingBidCommon = function(duration) {
        $('.action_bid_aera').hide();
        var comming = $('<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">' + auction_data.price_type + '</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.nowPrice) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '</li>' +
            '</ul>');
        this.html(comming);
        this.show();
        if (auction_data.unit) {
            $('.rmb-unit').html('元&nbsp;/&nbsp;' + auction_data.unit)
        }
        return this;
    };
    //拍卖进行中  参数：当前价格，结束时间
    $.fn.progressBidCommon = function(duration, currBidder, data) {
        $('.pay_bid').removeClass('disable')
        $('.action_bid_aera').hide();
        var display = '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">当前价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.nowPrice) + '</em></span>' +
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
        if (auction_data.status == 1 && data.endTime < data.nowTime) {
            this.hide();
        } else {
            this.show();
        }
        if (auction_data.unit) {
            $('.rmb-unit').html('元&nbsp;/&nbsp;' + auction_data.unit)
        }
        PAGE_TIMER.start(PAGE_TIMER.finish, duration);
        return this;
    };
    //保证金金额
    $.fn.bidUnjoin = function() {
        var display = $('<div class="pm-bid-eye">' +
            '<div class="pm-bid pm-before-apply bid_ing" style="display: block">' +
            '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price" style="padding-left:0px">' +
            '<span class="title">保证金</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.deposit) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '</li>' +
            '</ul>' +
            '<dl class="pm-message clearfix" style="padding-left: 0px">' +
            '<dt class="pm-h"></dt>' +
            '<dd>' +
            '<div class="line">' +
            //                    '<input type="hidden" id="lot_status">'+
            '</div>' +
            '</dd>' +
            '</dl>' +
            '</div>' +
            '</div>');
        if (auction_data.user.isApply) {
            var applyTip = "<div class='applytips'><p class='color-333'>您已报名成功！</p><p class='color-999'>请尽快联系拍卖企业完成保证金支付</p></div>"
            display.find('.pm-message').append(applyTip)
        } else {
            var a = $('<a id="pay_bzj_btn" target="_blank" class="pm-button-new pay-bzj-button loading i-b">报名</a>')
            a.bind('click', function() {
                if (auction_data.user.isLogin) {
                    $('.applyDiv').show().openDialog();
                    window.open("/pages/pay/apply.html?lotId=" + auction_data.lotId); //支付保证金页面 
                } else {
                    window.open("/pages/user/login.html?redirect=" + window.location.href); //登录页面
                }
            });
        }
        display.find('.line').append(a);
        this.append(display);
        return this;
    };
    //竞拍过程中_没有登录的用户渲染
    $.fn.bidUnlogin = function(data) {
        var display = '<p class="jph_box">' +
            '提醒：先报名交保证金再出价。如果您已经交付保证金，<a href="/pages/user/login.html" target="_blank" class="enter-jpRoom">请登录</a>' +
            '</p>';
        this.find('.pm-bid-eye').append(display);
    };
    //等待开拍
    $.fn.waitBid = function(data) {
            if (auction_data.show_price < auction_data.available_price) {
                auction_data.show_price = auction_data.available_price;
            }
            var displaywait = $('<div class="pm-bid-eye">' +
                '<div class="pm-status" style="display: none;"></div>' +
                ' <div class="pm-bid pm-before-apply bid_ing">' +
                '<dl class="pm-price J_PmPrice clearfix" style="padding: 0px">' +
                '<dt class="pm-h">' +
                '<label>出 &nbsp;&nbsp;价</label>' +
                '</dt>' +
                '<dd class="plus-minus-operation">' +
                '<input type="text" class="pm-price-input" value="' + auction_data.show_price + '" disabled="disabled" maxlength="" title="" data-range="" data-min="" data-max="">' +
                //                            '<input type="hidden" name="price" id="J_RealPrice" value="">'+
                '<div class="pm-sign">' +
                '<a href="javascript:void(0)" class="plus J_Sign">+</a>' +
                '<a href="javascript:void(0)" class="minus J_Sign">-</a>' +
                '</div>' +
                '</dd>' +
                '<a class="pay_bid action_bid disabled" target="_blank">等待开拍</a>' +
                '</dl>' +
                '</div>' +
                '</div>');
            displaywait.find(".pm-bid-eye .plus").click(function() {
                if (displaywait.find('.pay_bid').hasClass('disabled')) {
                    return false
                }
            });
            displaywait.find(".pm-bid-eye .minus").click(function() {
                if (displaywait.find('.pay_bid').hasClass('disabled')) {
                    return false
                }
            });
            displaywait.find(".pm-bid-eye .pay_bid").click(function() {
                if (displaywait.find('.pay_bid').hasClass('disabled')) {
                    return false
                }
            })
            this.append(displaywait);
            return this;
        }
        //拍卖进行中  参与者渲染
    $.fn.progressBidJoin = function(data) {
        if (auction_data.show_price < auction_data.available_price) {
            auction_data.show_price = auction_data.available_price;
        }
        var display = $('<div class="pm-bid-eye price-val">' +
            '<div class="pm-status" style="display: none;"></div>' +
            ' <div class="pm-bid pm-before-apply bid_ing">' +
            '<dl class="pm-price J_PmPrice clearfix" style="padding: 0px">' +
            '<dt class="pm-h">' +
            '<label>出 &nbsp;&nbsp;价</label>' +
            '</dt>' +
            '<dd class="plus-minus-operation">' +
            '<input type="text" class="pm-price-input" value="' + auction_data.show_price + '" disabled="disabled" maxlength="" title="" data-range="" data-min="" data-max="">' +
            //                            '<input type="hidden" name="price" id="J_RealPrice" value="">'+
            '<div class="pm-sign">' +
            '<a href="javascript:void(0)" class="plus J_Sign active">+</a>' +
            '<a href="javascript:void(0)" class="minus J_Sign">-</a>' +
            '</div>' +
            '</dd>' +
            '<a class="pay_bid action_bid" target="_blank">出 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;价</a>' +
            '</dl>' +
            '</div>' +
            '</div>');
        if (auction_data.show_price > auction_data.available_price) {
            display.find('.minus').addClass('active');
        }
        display.find(".plus").click(function() {
            auction_data.show_price = display.find('.pm-price-input').val();
            auction_data.show_price = util.addingFn(auction_data.show_price, auction_data.rateLadder)
            display.find('.pm-price-input').val(auction_data.show_price);
            //如果显示的价格大于可以出的最低价，减号按钮可以点击
            if (auction_data.show_price > auction_data.available_price) {
                display.find('.minus').addClass('active');
            }
        });
        display.find(".minus").click(function() {
            if ($(this).hasClass("active")) {
                auction_data.show_price = util.addingFn(auction_data.show_price, -auction_data.rateLadder)
                display.find('.pm-price-input').val(auction_data.show_price);
            }
            if (auction_data.show_price <= auction_data.available_price) {
                $(this).removeClass('active');
            }
        });
        display.find(".pay_bid").click(function() {
            if (auction_data.nowBidNum) {
                if (auction_data.mybidNum == auction_data.nowBidNum) {
                    $('.offerDiv h3 p').html('温馨提示：目前您的竞拍价已处于领先位置，请确认是否再次出价');
                    $('.offerDiv h3 p').show();
                } else {
                    $('.offerDiv h3 p').hide();
                }
            } else {
                if ($('.pm-price-input').val() > auction_data.available_price) {
                    $('.offerDiv h3 p').html('温馨提示：第一次出价可以为起拍价，您已进行加价出价，是否确认出价？');
                    $('.dialog').width(525)
                    $('.offerDiv h3 p').show();
                } else {
                    $('.dialog').width(480)
                    $('.offerDiv h3 p').hide();
                }
            }
            $('.offerDiv').show().openDialog()
            if (auction_data.show_price == 0) {
                auction_data.show_price = auction_data.available_price
            }
            $('#check_price').html(auction_data.show_price)
            $('#upper_price').html(util.changeMoneyToChinese(auction_data.show_price))
            $('#jph').html(auction_data.mybidNum)
                //关闭出价弹窗
            $('.closeBtn').click(function() {
                $('.offerDiv').hide().closeDialog(); //标的 当前价格;
                $('#pay_btn').removeClass('noclick');
            });
            //关闭出现错误信息的弹窗
            $('.close_tip').click(function() {
                $('.prompt').hide().closeDialog(); //隐藏错误提示框
                $('.pay_bid').removeClass('noclick');
            });
        });
        display.find('.pm-price-input').val();
        this.append(display);
        return this;
    };
    $.fn.errorspeak = function(data) {
        var ul = ""
        ul = '<li class="lineh22">暂无拍卖师发言</li>';
        this.html(ul)
        return this
    };
    //拍卖进行中_领先者渲染
    $.fn.progressBidLeader = function(data) {
        this.find('.pm-status').addClass('win').show().text("出价领先");
        return this;
    };
    //拍卖进行中_出局者渲染
    $.fn.progressBidOutter = function(data) {
        this.find('.pm-status').show().text("出价被超");
        return this;
    };
    //打开弹窗遮罩效果
    $.fn.openDialog = function() {
        $("body").append("<div class='opcy_new'></div>");
        $(".opcy_new").height($('html').height())
    };
    //关闭弹窗及遮罩效果
    $.fn.closeDialog = function() {
        $(".dialog").hide();
        $(".opcy_new").remove();
    };
    var lots_ = function(pageNum) {
        return function(pageNum) {
            var url = '/caa-search-ws/ws/0.1/lots/sort?start=' + pageNum + '&count=5&meetId=' + auction_data.meetId;
            var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
            var auctiondata = {};
            util.getdata(newurl, "get", "json", false, false, function(data) {
                auctiondata.data = data;
                auctiondata.url = newurl;
                $('.upcoming_list').waitAuction(data);
            }, function(data) {

            });
            return pageNum;
        }
    }
    $('.applyDiv .successBtn').click(function() {
        auctionHall_controller.checkDeposite(auction_data.lotId);
        if (auction_data.user.isApply) {
            $('.applyDiv').hide().closeDialog();
            auctionHall_controller.init();
        } else {
            $('.applyDiv').hide();
            $('.apply-error').show();
        }
    });
    //出价失败的弹窗
    function failtips_bidder(msg) {
        $('.price-fail').remove();
        $(".prompt .error_msg").addClass('prompt_fail').html(msg);
        $('.prompt').prepend("<div class='price-fail'><img src='/themes/images/price-fail.png'><em>出价失败</em></div>")
        $(".error-tip").css('display', 'block').openDialog()
    }
    //结束_未登录用户渲染竞价
    $.fn.finishBidCommon = function(data) {
        $('.action_bid_aera').hide();
        var price = 0
        if (data.nowPrice) {
            price = data.nowPrice
        } else {
            price = auction_data.nowPrice
        }
        var display = '<ul class="pm-bid-eyebrow end_time">' +
            '<li class="J_PItem" id="sf-countdown">' +
            '<span class="title J_TimeTitle">结束时间</span>' +
            '<span class="time">' + util.tranferTime(data.endTime, true, false) + '</span>' +
            '</li>' +
            '</ul>' +
            '<div class="pm-bid tex-center" id="J_finish_result">' +
            '<p class="pp_endstate" style="padding-top: 25px">本标的拍卖已结束</p>' +
            '<p class="currentrate">成交价：<span class="colorred">' + util.formatCurrency(price) + '</span><em class="colorred">元</em></p>' +
            '</div>';
        this.html(display);
        if (data.state == 3) {
            $('.currentrate').show()
            if (data.delayTimes) {
                $('.delaycount').show()
            } else {
                $('.delaycount').hide()
            }
        }
        if (auction_data.lotMode == 1) {
            $('.currentrate em.colorred').html('元&nbsp;/&nbsp;' + auction_data.unit)
        }
        if (data.state != 0 && data.state != 1 && data.state != 3) {
            $('.delaycount').hide()
            $('.currentrate').css({
                "font-size": "16px"
            })
            $('.currentrate').hide()
            if (data.state == 2) { //已流拍
                $('.pp_endstate').html('本场拍卖已流拍')
                $('#J_finish_result').css({
                    "min-height": "100px"
                })
            } else if (data.state == 4) { //已中止
                $('.pp_endstate').html('本场拍卖已中止')
                if (data.unnormalTime) {
                    $('#sf-countdown .J_TimeTitle').html('中止时间：')
                    $('#sf-countdown .time').html(util.tranferTime(data.unnormalTime, true, false))
                }
                if (data.changeReason) {
                    $('.currentrate').html('中止理由：' + data.changeReason).show()
                } else {
                    $('.currentrate').html('中止理由：无').show()
                }
            } else if (data.state == 5) { //已撤拍
                if (data.unnormalTime) {
                    $('#sf-countdown .J_TimeTitle').html('撤拍时间：')
                    $('#sf-countdown .time').html(util.tranferTime(data.unnormalTime, true, false))
                }
                $('.pp_endstate').html('本场拍卖已撤拍')
                if (data.changeReason) {
                    $('.currentrate').html('撤拍理由：' + data.changeReason).show()
                } else {
                    $('.currentrate').html('撤拍理由：无').show()
                }
            } else if (data.state == 6) { //已暂缓
                $('.pp_endstate').html('本场拍卖已暂缓')
                $('.currentrate').html('请等待拍卖师操作').show()
            } else if (data.state == 7) { //已暂停
                if (data.suspendTime) {
                    $('#sf-countdown .J_TimeTitle').html('暂停时间：')
                    $('#sf-countdown .time').html(util.tranferTime(data.suspendTime, true, false))
                }
                $('.pp_endstate').html('本场拍卖已暂停').css({
                    "padding-top": "15px"
                })
                $('.pm-bid').css({
                    "min-height": "100px"
                })
                $('.currentrate').html('请等待拍卖师操作').show()
                if (!auction_data.user.isApply) {
                    var apply = $('<a class="applyName hallenter" target="_blank">报名</a>')
                    apply.bind('click', function() {
                        $('.applyDiv').show().openDialog();
                        window.open('/pages/pay/apply.html?lotId=' + auction_data.lotId + '&meetId=' + auction_data.meetId)
                    })
                    this.find(".pm-bid").append(apply)
                } else {
                    $('.applyName').hide()
                }
            }
        }
        this.show();
        return this;
    };
    $.fn.timefinish = function(data) {
        // $('.action_bid_aera').hide();
        var display =
            '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">当前价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.nowPrice) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '<div class="bidder_people">' +
            '<span>出价人：</span>' +
            '<span class="curr_person">' + auction_data.nowBidNum + '</span>' +
            '</div>' +
            '</li>' +
            '<ul>' +
            '<div class="pm-bid tex-center" id="J_finish_result" style="min-height: 100px;">' +
            '<p class="pp_endstate" style="padding-top: 15px">本标的倒计时已结束</p>' +
            '<p class="currentrate">请等待拍卖师操作</p>' +
            '</div>';
        this.html(display);
        this.show();
        if (!auction_data.nowBidNum || auction_data.nowBidNum == "") {
            $('.bidder_people').hide();
        }
        return this;
    };
    $.fn.finishBidOwer = function(bidderNumber, bidCount) {
        this.find(".pm-bid").append('<p class="result">恭喜您，获得本标的。<a target="_blank" href="/pages/lots/orderBid.html?showuse=1&lotId=' + auction_data.lotId + '#AuctConfirmation" class="colorred">查看成交确认书</a></p>');
        $('.pp_endstate').css({
            "padding-top": "15px"
        })
        return this;
    };
    //竞拍结束后出局者
    $.fn.finishBidOutter = function(data) {
        this.find(".pm-bid").append('<p class="result">很遗憾，您未获得获得本标的。<a target="_blank" href="/pages/personal/home.html?showuse=3&lotId=' + auction_data.lotId + '" class="colorred">查看保证金</a></p>');
        var mydiv = $('<div class="my-info clearfix"></div>');
        $('.pp_endstate').css({
            "padding-top": "15px"
        })
        $('.pm-bd').after(mydiv);
    }

    $.fn.buildMyBidderInfo = function(bidderNumber, bidCount) {
        var prior = ''
        if (auction_data.user.isPrior) {
            prior = "优"
        }
        if (auction_data.user.isAgent) {
            prior = "委"
        }
        if (auction_data.user.isAgent && auction_data.user.isPrior) {
            prior = "优委"
        }
        var mydiv = '<ul class="bidnum-list">' +
            '<li>您的竞拍号：<span id="show_jmh">' + bidderNumber + '<em style="font-weight: bold">' + prior + '</em></span></li>' +
            '<li style="float: right">已出价:<span id="show_time">' + bidCount + '</span>次</li>' +
            '</ul>'
        this.append(mydiv);
        this.width(455);
        return this;
    }
    $.fn.speaklogs = function(data) { //加载拍卖师发言记录
        var ul = '';
        if (data.totalCount == 0) {
            ul = '<li class="lineh22">暂无拍卖师发言</li>';
        } else {
            $.each(data.items, function(index, data) {
                var bidauction = ""
                if (data.lotId) {
                    bidauction = "当前标的"
                } else {
                    bidauction = "拍卖会"
                }
                var auctioneerlogs = '<li class="lineh22">' +
                    '<p class="p_name"><span class="color-red">' + bidauction + '</span><span class="color-999">' + util.tranferTime2(data.date) + '</span></p>' +
                    '<p class="p_content">' + data.content + '</p>' +
                    '</li>'
                ul += auctioneerlogs
            })
        }
        this.html(ul)
        return this
    };
    //标的列表
    $.fn.waitAuction = function(data) {
        var $ul = $("<ul></ul>");
        var hasPriority = "";
        var hasMinPrice = '';
        var arr = ["即将开始", "正在进行", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "已暂停"]
        if (data.items.length == 1) {
            $(".page-wrap").hide()
            return
        }
        $.each(data.items, function(index, data) {
            var unit = '';
            if (data.hasPriority) {
                hasPriority = "有"
            } else {
                hasPriority = "无"
            }
            if (data.hasMinPrice) {
                hasMinPrice = '有'
            } else {
                hasMinPrice = '无'
            }
            if (data.lotMode == '1') {
                unit = "&nbsp;/&nbsp;" + data.unit
            }
            var li = '<li class="dis_block_parent" data-id=' + data.id + '>' +
                '<img src=' + data.pic[0] + ' class="dis_block_child">' +
                '<div class="upcoming_list_right dis_block_child">' +
                '<a class="waiting_tit" href="/pages/lots/orderBid.html?lotId=' + data.id + '">' + data.name + '</a>' +
                '<div class="viewstatus1">' +
                '<p class="waiting_price"><span class="color-999">起拍价：</span><em class="color-red price">' + data.startPrice + '</em><span class="color-red">元' + unit + '</span></p>' +
                '<p class="waiting_price"><span class="color-999">状&nbsp&nbsp&nbsp态：</span><span class="color-333 autionstate">' + arr[data.status] + '</span></p>' +
                '</div>' +
                '<div class="auctionnews dis_block_parent pt20">' +
                '<p class="p_td1 dis_block_child">起拍价：<em>' + util.formatCurrency(data.startPrice) + '元' + unit + '</em></p>' +
                '<p class="p_td2 dis_block_child">加价幅度：<em class="color-red">' + util.formatCurrency(data.rateLadder) + '元</em></p>' +
                '<p class="p_td3 dis_block_child">优先竞买：<em>' + hasPriority + '</em></p>' +
                '</div>' +
                '<div class="auctionnews dis_block_parent">' +
                '<p class="p_td1 dis_block_child">评估价：<em>' + util.formatCurrency(data.assertPrice) + '元</em></p>' +
                '<p class="p_td2 dis_block_child">自由竞价时间：<em>' + util.tranferTime4(data.freeTime) + '</em></p>' +
                '<p class="p_td3 dis_block_child" style="width: 90px">保留价：<em id="retain">' + hasMinPrice + '</em></p>' +
                '</div>' +
                '<div class="auctionnews dis_block_parent">' +
                '<p class="p_td1 dis_block_child">保证金：<em>' + util.formatCurrency(data.cashDeposit) + '元</em></p>' +
                '<p class="p_td2 dis_block_child">限时竞价时间：<em>' + util.tranferTime4(data.limitTime) + '</em></p>' +
                '<p class="p_td3 dis_block_child" style="width:90px;" id="all_count">标的总量：<span id="lot_allnum"></span></p>' +
                '</div>' +
                '</div>' +
                '</li>'
            var $li = $(li).clone();
            if (!data.changeReason) {
                data.changeReason = '无'
            }
            if (data.lotMode == '1') {
                $li.find('#all_count').css('display', 'inline_block')
                $li.find('#lot_allnum').html(data.amount + data.unit)
            } else {
                $li.find('#all_count').hide()
            }
            if (data.status == 2) {
                $li.find('.viewstatus1').addClass('viewstatus').html('<p class="waiting_price waiting_priceone" style="padding-bottom: 20px;">本标的已流拍</p>')
            } else if (data.status == 3) {
                var endprice = data.nowPrice;
                if (data.lotMode == 1) {
                    endprice = data.amount * data.nowPrice;
                }
                $li.find('.viewstatus1').addClass('viewstatus').html('<p class="waiting_price waiting_priceone">本标的已成交</p><p class="waiting_price waiting_price_succ">成交价：<em>' + util.formatCurrency(endprice) + '元</em></p>')
            } else if (data.status == 4) {
                $li.find('.viewstatus1').addClass('viewstatus').html('<p class="waiting_price waiting_priceone">本标的已中止</p><p class="waiting_price waiting_price_one">中止理由：<em>' + data.changeReason + '</em></p>')
            } else if (data.status == 5) {
                $li.find('.viewstatus1').addClass('viewstatus').html('<p class="waiting_price waiting_priceone">本标的已撤拍</p><p class="waiting_price waiting_price_one">撤拍理由：<em>' + data.changeReason + '</em></p>')
            } else if (data.status == 6) {
                $li.find('.viewstatus1').addClass('viewstatus').html('<p class="waiting_price waiting_priceone">本标的已暂缓</p>')
            } else if (data.status == 7) {
                $li.find('.viewstatus1').addClass('viewstatus').html('<p class="waiting_price waiting_priceone">本标的已暂停</p>')
            }
            $ul.append($li)
        })
        $(".page-wrap").show().page({
            page: data.page, //第几页
            totalPages: data.totalPages, //总页数
            showNum: 5,
            change: lots_()
        });
        $(this).html($ul.html());
        $('.dis_block_parent img.dis_block_child').bind("error", function() {
            this.src = "/themes/images/nobanner.png";
        });
        if ($('.dis_block_parent img.dis_block_child').attr("src") == 'null') {
            this.src = "/themes/images/nobanner.png";
        }
        for (var i = 0; i < $('.autionstate').length; i++) {
            if ($('.autionstate').eq(i).html() == "即将开始") {
                $('.autionstate').eq(i).css({
                    "color": "#d6363b"
                })
            } else {
                $('.autionstate').eq(i).css({
                    "color": "#333"
                })
            }
        }
        if (data.page == 1) {
            $('.upcoming_list .dis_block_parent').eq(0).hide()
        }
        return this
    };
    $('.applyDiv .dangerBtn').click(function() {
        window.open('/pages/help/helpcenter_problem.html');
    })
    $('.apply-error .sureBtn').click(function() {
        $('.apply-error').hide().closeDialog()
    });
    $('.pay_tip_close').click(function() {
        $('.applyDiv').hide().closeDialog();
    });
    //确认出价
    $(".submit_bid").off("click").on("click", function() {
        var curry = setTimeout(function() {
            alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
            window.location.reload(true);
        }, 5000);
        var offorPrice = $('#check_price').html()
        var jsonData = {
            lotId: auction_data.lotId,
            price: offorPrice //传递的参数
        };
        $.ajax({
            url: '/personal-ws/ws/0.1/bid/lot/' + auction_data.lotId,
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            async: true,
            data: JSON.stringify(jsonData),
            success: function(data) {
                clearTimeout(curry);
                util.transformNull(data)
                $('.offerDiv').hide().closeDialog();
                if (data.status) {
                    //
                } else {
                    failtips_bidder(data.msg)
                }
            },
            error: function(data) {
                if (data) {
                    window.location.href = "/pages/user/login.html"
                }
            }
        });
    })
    $('.p_tit span').click(function() {
        var index = $(this).index();
        $(this).addClass('active')
        $(this).siblings().removeClass('active')
        if (index == 0) {
            $('.auctioneerspeak').removeClass('hidden')
            $('.auctioneer').addClass('hidden')
        } else {
            $('.auctioneerspeak').addClass('hidden')
            $('.auctioneer').removeClass('hidden')
        }
    })
    $('.wait_auction').on("click", "img", function() {
        auction_data.lotId = $(this).parents('.dis_block_parent').data("id");
        window.open("/pages/lots/orderBid.html?lotId=" + auction_data.lotId);
    })
    $('.auctionnews .dis_block_child').mouseover(function() {
        var _height = -($(this).find('.typeTips').height() + 6)
        $(this).find('.typeTips').show().css('top', _height)
        $(this).mouseout(function() {
            $(this).find('.typeTips').hide()
        })
    })
})(jQuery);