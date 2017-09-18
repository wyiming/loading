// 将设置放入此文件中以覆盖默认设置
$(function() {
    $(".J-container-title").headerStyle();
    PAGE_LOT_CONTROLLER.init();
    PAGE_LOT_CONTROLLER.detailinit();
    connection.register('/lots/lot_' + PAGE_LOT_DATA.lotId + "/price", PAGE_LOT_CONTROLLER.initLotInfo);
    connection.register('/lots/lot_' + PAGE_LOT_DATA.lotId + "/price", PAGE_LOT_CONTROLLER.latestBidInfo);
    connection.register('/lots/lot_' + PAGE_LOT_DATA.lotId + "/status", PAGE_LOT_CONTROLLER.cometdlotStatus);
    connection.register('/auctions/lot_' + PAGE_LOT_DATA.lotId, PAGE_LOT_CONTROLLER.latestSpeaklog);
    connection.register('/auctions/auction_' + PAGE_LOT_DATA.meetId, PAGE_LOT_CONTROLLER.latestSpeaklog);
    util.getdata("/personal-ws/ws/0.1/onlook/lot/" + PAGE_LOT_DATA.lotId, 'get', 'json', true, false, function() {});
});
//页面级的计时器
var PAGE_TIMER = {
    TIMER: false, //页面级的计时器只保留一个。如果想用多个计时器，可以考虑用JSON来实现
    duration: 0,
    start: function(funcName, duration) {
        PAGE_LOT_DATA.timeBol = true;
        if (PAGE_TIMER.TIMER) {
            window.clearTimeout(PAGE_TIMER.TIMER);
            PAGE_TIMER.TIMER = null
        }
        PAGE_TIMER.duration = duration;
        var timeFn = function() {
            funcName()
            if (PAGE_TIMER.duration > -100) {
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
            if (PAGE_LOT_DATA.meetMode != '1' && PAGE_LOT_DATA.timeBol) {
                PAGE_LOT_CONTROLLER.timeover()
                PAGE_LOT_DATA.timeBol = false
            }
            PAGE_TIMER.distory();
        }
    }
};
//保存标的相关的可变的数据  注意：竞价阶梯、起拍价都是可变的。
var PAGE_LOT_DATA = {
    lotId: util.getQueryString("lotId"), //获取标的ID
    meetMode: 0, //拍卖会类型
    user: {
        isLogin: false, //当前用户是否登录，在页面初始化时赋值
        isJoin: false, //当前用户是否已经缴纳保证金，在页面初始化时赋值。点击支付完成时赋值
        isApply: false, //当前用户是否报名
        isPrior: false, //当前用户是否是优先竞买人
        isAgent: false //当前用户是否是委托竞买人
    },
    meetId: 0,
    show_price: 0, //输入框的当前价格
    nowPrice: 0, //当前最高价
    available_price: 0, //可以出的最低价
    rateLadder: 0, //竞价阶梯
    deposit: 0, //保证金
    status: 0, //拍卖状态
    endTime: 0, //预计结束时间
    mybidNum: null, //我的竞买号
    nowBidNum: false, //最新出价竞买号
    bidCount: 0, //我的出价次数
    lastPrice: 0,
    pagetime: 30000, //30秒计时器的频率在限时竞价时间需更改
    timeBol: true,
    statusFresh: null,
    limitFresh: null
};
//页面控制器，负责与后台交互，获取数据
var PAGE_LOT_CONTROLLER = {
    init: function() {
        //页面初始化检查用户是否已经登录
        if (user.islogin()) {
            PAGE_LOT_DATA.user.isLogin = true;
            PAGE_LOT_CONTROLLER.checkDeposite();
        } else {
            PAGE_LOT_DATA.user.isLogin = false;
        }
        PAGE_LOT_CONTROLLER.initLotInfo();
        PAGE_LOT_CONTROLLER.loadJPH()
        PAGE_LOT_CONTROLLER.latestBidInfo();
        PAGE_LOT_CONTROLLER.latestSpeaklog()
        PAGE_LOT_CONTROLLER.currentPriceLog();
        PAGE_LOT_CONTROLLER.pagedPriceLog();
        PAGE_LOT_CONTROLLER.getFreshIterval();
        PAGE_LOT_DATA.statusFresh = setInterval(PAGE_LOT_CONTROLLER.currentBidRecord, PAGE_LOT_DATA.pagetime)
    },
    currentBidRecord: function() {
        if (!navigator.onLine) {
            alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
            window.location.reload(true);
        }
        PAGE_LOT_CONTROLLER.initLotInfo()
        PAGE_LOT_CONTROLLER.latestBidInfo()
    },
    cometdlotStatus: function() {
        PAGE_LOT_CONTROLLER.initLotInfo()
        PAGE_LOT_CONTROLLER.latestBidInfo();
        PAGE_LOT_CONTROLLER.getFreshIterval();
    },
    changePrice: function() {
        if (PAGE_LOT_DATA.user.isPrior) {
            //如果是优先竞买人，并且当前价不是自己出的，就最低价就是当前价
            if (PAGE_LOT_DATA.mybidNum == PAGE_LOT_DATA.nowBidNum) {
                PAGE_LOT_DATA.available_price = util.addingFn(PAGE_LOT_DATA.nowPrice, PAGE_LOT_DATA.rateLadder)
            } else {
                if (PAGE_LOT_DATA.lastprice == PAGE_LOT_DATA.nowPrice) {
                    PAGE_LOT_DATA.available_price = util.addingFn(PAGE_LOT_DATA.nowPrice, PAGE_LOT_DATA.rateLadder)
                } else {
                    PAGE_LOT_DATA.available_price = PAGE_LOT_DATA.nowPrice;
                }
            }
        } else {
            if (PAGE_LOT_DATA.nowBidNum) {
                //如果已经有人出价，可用的最高价位当前价格
                PAGE_LOT_DATA.available_price = util.addingFn(PAGE_LOT_DATA.nowPrice, PAGE_LOT_DATA.rateLadder)
            } else {
                PAGE_LOT_DATA.available_price = PAGE_LOT_DATA.nowPrice
            }
        }
    },
    currentPriceLog: function() {
        util.getdata('/personal-ws/ws/0.1/bid/pricelog/list/' + PAGE_LOT_DATA.lotId, 'get', 'json', false, false, function(logs) {
            util.transformNull(logs)
            $('.recordUl').lastestPriceLog(logs);
        });
    },
    pagedPriceLog: function() {
        util.getdata('/personal-ws/ws/0.1/bid/pricelog/' + PAGE_LOT_DATA.lotId + '?sortname=&sortorder=&start=0&count=10', 'get', 'json', false, false, function(logs) {
            util.transformNull(logs)
            $('#J_RecordList tbody').morePriceLog(logs);
        });
    },
    initLotInfo: function() {
        util.getdata("/personal-ws/ws/0.1/lot/" + PAGE_LOT_DATA.lotId, 'get', 'json', false, false, function(data) {
            util.transformNull(data)
            if (data) {
                PAGE_LOT_DATA.deposit = data.cashDeposit;
                if (data.nowPrice) {
                    PAGE_LOT_DATA.nowPrice = data.nowPrice;
                } else {
                    PAGE_LOT_DATA.nowPrice = data.startPrice;
                }
                PAGE_LOT_DATA.rateLadder = data.rateLadder;
                PAGE_LOT_DATA.startTime = data.startTime;
                PAGE_LOT_DATA.nowTime = data.nowTime;
                PAGE_LOT_DATA.meetMode = data.meetMode;
                PAGE_LOT_DATA.meetId = data.meetId;

                $('.grid-c').loadinfo(data); //渲染标的信息页面
            }
        })
    },
    timeover: function() { //时间走完要调用的方法
        util.getdata('/personal-ws/ws/0.1/lot/currentinfo/' + PAGE_LOT_DATA.lotId, 'get', 'json', false, false, function(data) {
            if (data.endTime < data.nowTime && data.state == '1') {
                $('#DISPLAY_BID_FINISH').timefinish()
            }
        })
    },
    latestBidInfo: function() { //最新的竞价信息 4种场景下调用改方法 每隔30秒调用一次  竞价成功调用一次  推送状态发生变化调用一次 0.00倒计时结束调用1次
        util.getdata('/personal-ws/ws/0.1/lot/currentinfo/' + PAGE_LOT_DATA.lotId, 'get', 'json', false, false, function(data) {
            PAGE_LOT_DATA.status = data.state;
            PAGE_LOT_DATA.nowBidNum = data.nowBidNum;
            if (PAGE_LOT_DATA.user.isLogin) {
                PAGE_LOT_CONTROLLER.topprice()
            }
            PAGE_LOT_CONTROLLER.currentPriceLog();
            PAGE_LOT_CONTROLLER.changePrice();
            PAGE_LOT_DATA.endTime = data.endTime;
            PAGE_LOT_DATA.nowTime = data.nowTime;
            PAGE_LOT_DATA.limitTime = data.limitTime;
            util.transformNull(data)
            if (data.nowPrice && !PAGE_LOT_DATA.show_price) {
                PAGE_LOT_DATA.show_price = data.nowPrice;
            }
            if (data.hasMinPrice) {
                $('#retain').html('有')
            } else {
                $('#retain').html('无')
            }
            var arr = ["即将开始", "正在进行", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "已暂停"]
            $('#bid_name span').html(arr[data.state])
            if (parseFloat(data.nowPrice) > 0) {
                PAGE_LOT_DATA.nowPrice = data.nowPrice;
            }
            if (data.rateLadder) {
                PAGE_LOT_DATA.rateLadder = data.rateLadder;
            }
            if (data.state == '0') { //如果标的即将开始
                var $comming = $("#DISPLAY_BID_COMMING").commingBidCommon(data);
                if (PAGE_LOT_DATA.user.isLogin) { //用户已经登录
                    if (PAGE_LOT_DATA.user.isJoin) {
                        PAGE_LOT_CONTROLLER.loadJPH(); //加载我的竞拍号
                        $comming.waitBid(data).buildMyBidderInfo(PAGE_LOT_DATA.mybidNum, PAGE_LOT_DATA.bidCount);
                    } else { //没有缴纳保证金
                        $comming.bidUnjoin();
                    }
                } else { //用户没有登录
                    $comming.bidUnjoin().bidUnlogin();
                }
            } else if (data.state == '1') { //正在进行
                PAGE_LOT_DATA.status = data.state;
                var $progressing = $('#DISPLAY_BID_PROGRESSING').progressBidCommon(data.endTime - data.nowTime, data.nowBidNum, data);
                if (data.endTime < data.nowTime) {
                    return false
                }
                if (PAGE_LOT_DATA.user.isLogin) { //用户已经登录
                    if (PAGE_LOT_DATA.nowBidNum) { //存在出价记录
                        $progressing.progressBidCommon(data.endTime - data.nowTime, data.nowBidNum, data);
                    }
                    if (PAGE_LOT_DATA.user.isJoin) {
                        PAGE_LOT_CONTROLLER.loadJPH();
                        if (PAGE_LOT_DATA.mybidNum == data.nowBidNum) {
                            $progressing.progressBidCommon(data.endTime - data.nowTime, "我", data).progressBidJoin(data).progressBidLeader()
                        } else {
                            if (PAGE_LOT_DATA.myBidCount > 0) { //表示自己出过价
                                $progressing.progressBidCommon(data.endTime - data.nowTime, data.nowBidNum, data).progressBidJoin(data).progressBidOutter()
                            } else {
                                $progressing.progressBidCommon(data.endTime - data.nowTime, "", data).progressBidJoin(data);
                            }
                        }
                        $progressing.buildMyBidderInfo();
                    } else { //没有缴纳保证金
                        $progressing.bidUnjoin();
                    }
                } else { //用户没有登录
                    $progressing.bidUnjoin().bidUnlogin();
                }
            } else if (data.state == '3') { //已成交
                var $finish = $('#DISPLAY_BID_FINISH').finishBidCommon(data);

                if (PAGE_LOT_DATA.user.isJoin) {
                    PAGE_LOT_CONTROLLER.loadJPH();
                    if (PAGE_LOT_DATA.mybidNum == data.nowBidNum) {
                        $finish.finishBidOwer();
                    } else {
                        $finish.finishBidOutter();
                    }
                    $finish.buildMyBidderInfo();
                }

                PAGE_LOT_CONTROLLER.confirmation();
            } else { //已中止  已撤拍 已流拍
                $('#DISPLAY_BID_FINISH').finishBidCommon(data)
                if (PAGE_LOT_DATA.user.isJoin) {
                    $('#DISPLAY_BID_FINISH').finishBidCommon(data).buildMyBidderInfo(PAGE_LOT_DATA.mybidNum, PAGE_LOT_DATA.bidCount)
                }
            }
        }, function(data, status) {
            if (status == 'timeout') {
                alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
                window.location.reload(true);
            }
        })
    },
    latestSpeaklog: function() {
        util.getdata('/caa-search-ws/ws/0.1/auctionmeet/speaklogs?meetId=' + PAGE_LOT_DATA.meetId + '&lotId=' + PAGE_LOT_DATA.lotId + '&start=0&count=10', 'get', 'json', false, false, function(data) {
            util.transformNull(data);
            $(".auctioneerspeak").speaklogs(data);
            $('.speaklogs-list').morespeaklogs(data)
        }, function(data) {
            $(".auctioneerspeak").errorspeak(data);
            $('.speaklogs-list').errorspeak(data)
        });
    },
    checkDeposite: function() { //检测是否支付保证金  只在页面初始化和点击支付完成时调用
        util.getdata("/personal-ws/ws/0.1/checkpay/lot/" + PAGE_LOT_DATA.lotId, 'get', 'json', false, false, function(data) {
            util.transformNull(data)
            if (data.status) { //已支付保证金
                PAGE_LOT_DATA.user.isApply = true
                PAGE_LOT_DATA.user.isJoin = true;
                PAGE_LOT_CONTROLLER.loadJPH(); //加载我的竞拍号
                $('#DISPLAY_BID_PROGRESSING').buildMyBidderInfo(PAGE_LOT_DATA.mybidNum, PAGE_LOT_DATA.bidCount);
            } else { //未支付保证金
                PAGE_LOT_DATA.user.isJoin = false;
                if (data.code == '201' || data.code == '200') {
                    PAGE_LOT_DATA.user.isApply = true
                } else {
                    PAGE_LOT_DATA.user.isApply = false
                }
            }
        })
    },
    loadJPH: function() { //加载竞买号
        util.getdata('/personal-ws/ws/0.1/lot/' + PAGE_LOT_DATA.lotId + '/mine', 'get', 'json', false, false, function(data) {
            util.transformNull(data)
            if (data.bidNum || PAGE_LOT_DATA.user.isJoin) {
                PAGE_LOT_DATA.user.isAgent = data.isAgent;
                PAGE_LOT_DATA.user.isPrior = data.isPrior;
                PAGE_LOT_DATA.mybidNum = data.bidNum;
                PAGE_LOT_DATA.myBidCount = data.bidCount;
            }
        }, function(data, status) {
            if (status == 'timeout') {
                alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
                window.location.reload(true);
            }
        });
    },
    topprice: function() { //判断当前价是否为我自己出的
        util.getdata('/personal-ws/ws/0.1/my/top/price/' + PAGE_LOT_DATA.lotId, 'get', 'json', false, false, function(data) {
            if (data) { //当前价为自己出的
                PAGE_LOT_DATA.lastprice = data.lastPrice;
            }
        });
    },
    detailinit: function() {
        //标的介绍
        util.getdata('/caa-search-ws/ws/0.1/lot/' + PAGE_LOT_DATA.lotId + '/introduction/', 'get', 'json', false, true, function(data) {
            util.transformNull(data);
            $('.pai-remind-tip').html(data.remark); //重要提示
            $('#J_ItemNotice').html(data.guidance); //竞买须知
            $('#J_desc').html(data.describe); //标的介绍
            $('#NoticeDetail .detail-common-text').html(data.content); //标的公告
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
                });
            }
        });
    },
    confirmation: function() {
        //竞价成功确认书
        util.getdata('/personal-ws/ws/0.1/lot/confirmation/' + PAGE_LOT_DATA.lotId, 'get', 'json', false, true, function(data) {
            if (data.companyName || data.barginUserName) {
                $('#DetailTabMain').show()
                $('.tab-menu li').eq(6).removeClass('hidden')
                $('#AuctConfirmation').buildConfirmation(data);
            }
        })
    },
    getFreshIterval: function() { //限时竞价时间取30秒频率获取
        clearInterval(PAGE_LOT_DATA.limitFresh)
        if (parseFloat(PAGE_LOT_DATA.endTime) - parseFloat(PAGE_LOT_DATA.nowTime) <= parseFloat(PAGE_LOT_DATA.limitTime) * 1000) {
            PAGE_LOT_DATA.pagetime = parseFloat(PAGE_LOT_DATA.limitTime) * 1000 / 10;
            if (parseFloat(PAGE_LOT_DATA.limitTime) <= 60) {
                PAGE_LOT_DATA.pagetime = 6000
            } else {
                PAGE_LOT_DATA.pagetime = 15000;
            }
            clearInterval(PAGE_LOT_DATA.statusFresh)
            clearInterval(PAGE_LOT_DATA.limitFresh)
            PAGE_LOT_DATA.limitFresh = setInterval(currentBidRecord, PAGE_LOT_DATA.pagetime)
        } else {
            PAGE_LOT_DATA.pagetime = 30000
        }

        function currentBidRecord() {
            clearInterval(PAGE_LOT_DATA.statusFresh)
            if (PAGE_LOT_DATA.status == '1' || PAGE_LOT_DATA.status == '0' || PAGE_LOT_DATA.status == '7') {
                PAGE_LOT_CONTROLLER.initLotInfo()
                PAGE_LOT_CONTROLLER.latestBidInfo()
            } else {
                clearInterval(PAGE_LOT_DATA.limitFresh)
            }
        }
    }
};
(function($) {
    //渲染标的基本信息 标的名称
    $.fn.loadinfo = function(data) {
        if (data.hasProv) {
            $('#prior_span').html("有")
            $('.pay-first-icon').show();
        } else {
            $('#prior_span').html("无")
            $('.pay-first-icon').hide()
        }
        var arr = ["即将开始", "正在进行", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "已暂停"]
        PAGE_LOT_DATA.lotMode = data.lotMode;
        PAGE_LOT_DATA.amount = data.amount;
        PAGE_LOT_DATA.unit = data.unit;
        var unit = ""
        if (PAGE_LOT_DATA.lotMode == 1) {
            $('#all_count').css('display', 'inline_block')
            $('#lot_allnum').html(data.amount + data.unit)
            unit = "&nbsp;/&nbsp;" + data.unit
        } else {
            $('#all_count').hide()
        }
        $('.auct_type').html(data.auctionType);
        //$('.auct_time').html(util.tranferTime(data.startTime, true, true) + "- " + util.tranferTime(data.endTime, true, true))
        $('.auct_name').html(data.meetName);
        $('#bid_name').html('<span>' + arr[data.lotStatus] + '</span><em style="margin-right: 16px">' + data.name + '</em>')
        $('#startPrice').html(util.formatCurrency(data.startPrice) + '&nbsp;元' + unit) //起拍价
        $('#assessPrice').html(util.formatCurrency(data.assessPrice)) //评估价
        $('#cashDeposit').html(util.formatCurrency(data.cashDeposit)) //保证金
        $('#rateLadder').html(util.formatCurrency(data.rateLadder)) //加价幅度
        $('#bidCycle').html(util.tranferTime4(data.freeTime)) //竞价周期
        $('#delayTimes').html(util.tranferTime4(data.limitTime)) //限制周期
        $('.companyName').html(data.companyName) //拍卖会机构
        $('.companyTel').html(data.linkTel) //联系电话
        $('.look_count span').html(data.onLooker) //围观次数
        $('.join_count span').html(data.enrollment); //报名
        $('.linkman').html(data.linkMan);
        $(document).attr("title", data.name + '_中拍平台');
        $('#start_price span').html(util.changeMoneyToChinese(data.startPrice))
        $('#assess_price span').html(util.changeMoneyToChinese(data.assessPrice))
        $('#deposite_price span').html(util.changeMoneyToChinese(data.cashDeposit))
        $('#rate_price span').html(util.changeMoneyToChinese(data.rateLadder))
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
            $('.see-record').hide()
        } else {
            var isHaveFirst = false
            $.each(items, function(index, data) {
                if (index > 2) {
                    return false
                }
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
                if (PAGE_LOT_DATA.status == 3 && index == 0) {
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
                li += '</span><span style="width: 42%">' + util.formatCurrency(data.price) + '</span></p><em class="time">' + util.tranferTime2(data.bidTime) + '</em></li>';
                ul += li
            });
            this.html(ul);
        }
        $('.recordList li').eq(2).css({
            "border-bottom": "none"
        })
    };
    $.fn.morePriceLog = function(data) {
        //TODO 更多的竞买记录
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
                        if (PAGE_LOT_DATA.status == 3) {
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
    //即将开始的 竞价效果渲染
    $.fn.commingBidCommon = function(data) {
        $('.action_bid_aera').hide();
        var comming = $('<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">起拍价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(PAGE_LOT_DATA.nowPrice) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '</li>' +
            '<li class="distance_start">' +
            '<span class="title">预 &nbsp;&nbsp;&nbsp;计</span>' +
            '<span class="countdown J_TimeLeft" id="LOT_DURATION_BEGIN">' + util.tranferTime(data.startTime, true, false) + '</span>' +
            '<span class="end">开始</span>' +
            '</li>' +
            '</ul>');
        this.html(comming);
        this.show();
        if (PAGE_LOT_DATA.unit) {
            $('.rmb-unit').html('元&nbsp;/&nbsp;' + PAGE_LOT_DATA.unit)
        }
        return this;
    };
    //拍卖进行中  参数：当前价格，结束时间
    $.fn.progressBidCommon = function(duration, currBidder, data) {
        $('.action_bid_aera').hide();
        var display = '<ul class="pm-bid-eyebrow">' +
            '<li id="sf-price">' +
            '<span class="title">当前价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(PAGE_LOT_DATA.nowPrice) + '</em></span>' +
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
        if (PAGE_LOT_DATA.status == 1 && data.endTime < data.nowTime) {
            this.hide();
        } else {
            this.show();
        }
        PAGE_TIMER.start(PAGE_TIMER.finish, duration);
        if (PAGE_LOT_DATA.unit) {
            $('.rmb-unit').html('元&nbsp;/&nbsp;' + PAGE_LOT_DATA.unit)
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
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(PAGE_LOT_DATA.deposit) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '</li>' +
            '</ul>' +
            '<dl class="pm-message clearfix" style="padding-left: 0px">' +
            '<dt class="pm-h"></dt>' +
            '<dd>' +
            '<div class="line">' +
            '</div>' +
            '</dd>' +
            '</dl>' +
            '</div>' +
            '</div>');
        if (PAGE_LOT_DATA.user.isApply) {
            var applyTip = "<div class='applytips'><p class='color-333'>您已报名成功！</p><p class='color-999'>请尽快联系拍卖企业完成保证金支付</p></div>"
            display.find('.pm-message').append(applyTip)
        } else {
            var a = $('<a id="pay_bzj_btn" target="_blank" class="pm-button-new pay-bzj-button loading i-b">报名</a>')
            a.bind('click', function() {
                if (PAGE_LOT_DATA.user.isLogin) {
                    $('.applyDiv').show().openDialog();
                    window.open("/pages/pay/apply.html?lotId=" + PAGE_LOT_DATA.lotId); //支付保证金页面 
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
            '提醒：先报名交保证金再出价。如果您已经交付保证金，<a href="/pages/user/login.html?redirect=' + window.location.href + '" target="_blank" class="enter-jpRoom">请登录</a>' +
            '</p>';
        this.find('.pm-bid-eye').append(display);
    };
    $.fn.waitBid = function(data) {
            if (PAGE_LOT_DATA.show_price < PAGE_LOT_DATA.available_price) {
                PAGE_LOT_DATA.show_price = PAGE_LOT_DATA.available_price
            }
            var display = $('<div class="pm-bid-eye">' +
                '<div class="pm-status" style="display: none;"></div>' +
                ' <div class="pm-bid pm-before-apply bid_ing">' +
                '<dl class="pm-price J_PmPrice clearfix" style="padding: 0px">' +
                '<dt class="pm-h">' +
                '<label>出 &nbsp;&nbsp;价</label>' +
                '</dt>' +
                '<dd class="plus-minus-operation">' +
                '<input type="text" class="pm-price-input" value="' + PAGE_LOT_DATA.show_price + '" disabled="disabled" maxlength="" title="" data-range="" data-min="" data-max="">' +
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
            display.find(".pm-bid-eye .plus").click(function() {
                if (display.find('.pay_bid').hasClass('disabled')) {
                    return false
                }
            });
            display.find(".pm-bid-eye .minus").click(function() {
                if (display.find('.pay_bid').hasClass('disabled')) {
                    return false
                }
            });
            display.find(".pm-bid-eye .pay_bid").click(function() {

            })
            this.append(display);
            return this;
        }
        //拍卖进行中  参与者渲染
    $.fn.progressBidJoin = function(data) {
        if (PAGE_LOT_DATA.show_price < PAGE_LOT_DATA.available_price) {
            PAGE_LOT_DATA.show_price = PAGE_LOT_DATA.available_price
        }
        var display = $('<div class="pm-bid-eye price-val">' +
            '<div class="pm-status" style="display: none;"></div>' +
            ' <div class="pm-bid pm-before-apply bid_ing">' +
            '<dl class="pm-price J_PmPrice clearfix" style="padding: 0px">' +
            '<dt class="pm-h">' +
            '<label>出 &nbsp;&nbsp;价</label>' +
            '</dt>' +
            '<dd class="plus-minus-operation">' +
            '<input type="text" class="pm-price-input" value="' + PAGE_LOT_DATA.show_price + '" disabled="disabled" maxlength="" title="" data-range="" data-min="" data-max="">' +
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
        if (PAGE_LOT_DATA.show_price > PAGE_LOT_DATA.available_price) {
            display.find('.minus').addClass('active');
        }
        display.find(".plus").click(function() {
            PAGE_LOT_DATA.show_price = display.find('.pm-price-input').val();
            PAGE_LOT_DATA.show_price = util.addingFn(PAGE_LOT_DATA.show_price, PAGE_LOT_DATA.rateLadder);
            display.find('.pm-price-input').val(PAGE_LOT_DATA.show_price);
            //如果显示的价格大于可以出的最低价，减号按钮可以点击
            if (PAGE_LOT_DATA.show_price > PAGE_LOT_DATA.available_price) {
                display.find('.minus').addClass('active');
            }
        });
        display.find(".minus").click(function() {
            if ($(this).hasClass("active")) {
                PAGE_LOT_DATA.show_price = util.addingFn(PAGE_LOT_DATA.show_price, -PAGE_LOT_DATA.rateLadder);
                display.find('.pm-price-input').val(PAGE_LOT_DATA.show_price);
            }
            if (PAGE_LOT_DATA.show_price <= PAGE_LOT_DATA.available_price) {
                $(this).removeClass('active');
            }
        });
        display.find('.pm-price-input').keyup(function() {
            PAGE_LOT_DATA.show_price = display.find('.pm-price-input').val()
        })
        display.find(".pay_bid").click(function() {
            if (PAGE_LOT_DATA.nowBidNum) {
                if (PAGE_LOT_DATA.mybidNum == PAGE_LOT_DATA.nowBidNum) {
                    $('.offerDiv h3 p').html('温馨提示：目前您的竞拍价已处于领先位置，请确认是否再次出价');
                    $('.offerDiv h3 p').show();
                } else {
                    $('.offerDiv h3 p').hide();
                }
            } else {
                if ($('.pm-price-input').val() > PAGE_LOT_DATA.available_price) {
                    $('.offerDiv h3 p').html('温馨提示：第一次出价可以为起拍价，您已进行加价出价，是否确认出价？');
                    $('.dialog').width(525)
                    $('.offerDiv h3 p').show();
                } else {
                    $('.dialog').width(480)
                    $('.offerDiv h3 p').hide();
                }
            }
            $('.offerDiv').show().openDialog()
            $('#check_price').html(PAGE_LOT_DATA.show_price)
            $('#upper_price').html(util.changeMoneyToChinese(PAGE_LOT_DATA.show_price))
            $('#jph').html(PAGE_LOT_DATA.mybidNum)
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

        var endprice = PAGE_LOT_DATA.nowPrice;
        var display = '<ul class="pm-bid-eyebrow end_time">' +
            '<li class="J_PItem" id="sf-countdown">' +
            '<span class="title J_TimeTitle">结束时间</span>' +
            '<span class="time">' + util.tranferTime(PAGE_LOT_DATA.endTime, true, false) + '</span>' +
            '<span style="margin-left: 18px" class="delaycount">' + data.delayTimes + '次延时</span>' +
            '</li>' +
            '</ul>' +
            '<div class="pm-bid tex-center" id="J_finish_result">' +
            '<p class="pp_endstate" style="padding-top: 30px">本标的拍卖已结束</p>' +
            '<p class="currentrate">成交价：<span class="colorred">' + util.formatCurrency(endprice) + '</span><em class="colorred">元</em></p>' +
            '</div>';
        this.html(display);
        if (data.state == '3') {
            $('.currentrate').show()
            if (data.delayTimes) {
                $('.delaycount').show()
            } else {
                $('.delaycount').hide()
            }
        }
        if (PAGE_LOT_DATA.lotMode == 1) {
            $('.currentrate em.colorred').html('元&nbsp;/&nbsp;' + PAGE_LOT_DATA.unit)
        }
        if (data.state != 0 && data.state != 1 && data.state != 3) {
            $('.delaycount').hide()
            $('.currentrate').css({
                "font-size": "16px"
            })
            $('.currentrate').hide()
            if (data.state == '2') { //已流拍
                $('.pp_endstate').html('本场拍卖已流拍').css({
                    "padding-top": "45px"
                })
            } else if (data.state == '4') { //已中止
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
            } else if (data.state == '5') { //已撤拍
                if (data.suspendTime) {
                    $('#sf-countdown .J_TimeTitle').html('撤拍时间：')
                    $('#sf-countdown .time').html(util.tranferTime(data.suspendTime, true, false))
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
                if (data.suspendTime) {
                    $('#sf-countdown .J_TimeTitle').html('暂停时间：')
                    $('#sf-countdown .time').html(util.tranferTime(data.suspendTime, true, false))
                }
                $('.pp_endstate').html('本场拍卖已暂停').css({
                    "padding-top": "45px"
                })
                if (!PAGE_LOT_DATA.user.isApply) {
                    var apply = $('<a class="applyName hallenter" target="_blank">报名</a>')
                    apply.bind('click', function() {
                        $('.applyDiv').show().openDialog();
                        window.open('/pages/pay/apply.html?lotId=' + PAGE_LOT_DATA.lotId + '&meetId=' + PAGE_LOT_DATA.meetId)
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
    $.fn.finishBidOwer = function() {
        this.find(".pm-bid").append('<p class="result">恭喜您，获得本标的。<a href="#RecordContent" class="colorred success_book">查看成交确认书</a></p>');
        $('.tab-menu li').eq(6).removeClass('hidden');
        $('.success_book').click(function() {
            $('.record-list').addClass('hidden');
            $('#AuctConfirmation').removeClass('hidden');
            $('.tab-menu li').eq(6).addClass('current').siblings().removeClass('current');
            $(window).scrollTop(770);
        })
        $('.pp_endstate').css({
            "padding-top": "30px"
        })
        $('#J_finish_result').css({
            "padding-bottom": "0px"
        })
        return this;
    };
    //竞拍结束后出局者
    $.fn.finishBidOutter = function(data) {
        this.find(".pm-bid").append('<p class="result">很遗憾，您未获得获得本标的。<a href="/pages/personal/home.html?showuse=3&lotId=' + PAGE_LOT_DATA.lotId + '" class="colorred">查看保证金</a></p>');
        var mydiv2 = $('<div class="my-info clearfix"></div>');
        $('.pp_endstate').css({
            "padding-top": "30px"
        })
        $('#J_finish_result').css({
            "padding-bottom": "0px"
        })
        $('.pm-bd').after(mydiv2);
    };
    $.fn.buildMyBidderInfo = function() {
        var prior = ''
        if (PAGE_LOT_DATA.user.isPrior) {
            prior = "优"
        }
        if (PAGE_LOT_DATA.user.isAgent) {
            prior = "委"
        }
        if (PAGE_LOT_DATA.user.isAgent && PAGE_LOT_DATA.user.isPrior) {
            prior = "优委"
        }
        var mydiv3 = '<ul class="bidnum-list">' +
            '<li>您的竞拍号：<span id="show_jmh">' + PAGE_LOT_DATA.mybidNum + prior + '</span></li>' +
            '<li style="float: right">已出价:<span id="show_time">' + PAGE_LOT_DATA.myBidCount + '</span>次</li>' +
            '</ul>'
        this.append(mydiv3);
        return this;
    };
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
        }
        $(".page-wrap-two").show().page({
            page: data.page, //第几页
            totalPages: data.totalPages, //总页数
            showNum: 5,
            change: lots_two()
        });
        this.html(ul)
        return this
    };
    $.fn.errorspeak = function(data) {
            var ul = ""
            ul = '<li class="lineh22">暂无拍卖师发言</li>';
            this.html(ul)
            return this
        }
        //渲染竞价成功确认书
    $.fn.buildConfirmation = function(data) {
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
        if (PAGE_LOT_DATA.lotMode == '1') {
            $('.auction-end .detail-common-text').eq(1).html(
                '<div class="detail-common-text">该标的网络拍卖成交单价：' +
                '<span class="bargainPrice">' + util.formatCurrency(data.bargainPrice / PAGE_LOT_DATA.amount) + '元</span>' +
                '<span class="bargainPriceL">(' + util.changeMoneyToChinese(data.bargainPrice / PAGE_LOT_DATA.amount) + ')</span>' +
                '</div>' +
                '<div class="detail-common-text">标的总量：' +
                '<span class="bargainmount">' + $('#lot_allnum').html() + '</span>' +
                '</div>' +
                '<div class="detail-common-text">成交总价：' +
                '<span class="bargainPrice">' + util.formatCurrency(data.bargainPrice * PAGE_LOT_DATA.amount) + '元</span>' +
                '<span class="bargainPriceL">( ' + util.changeMoneyToChinese(data.bargainPrice * PAGE_LOT_DATA.amount) + ')</span>' +
                '</div>'
            )
        }
    };
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
    $('.applyDiv .successBtn').click(function() {
        PAGE_LOT_CONTROLLER.checkDeposite();
        if (PAGE_LOT_DATA.user.isApply) {
            $('.applyDiv').hide().closeDialog();
            PAGE_LOT_CONTROLLER.init();
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
    $.fn.timefinish = function() {
        $('.action_bid_aera').hide();
        var display =
            '<div class="pm-bid tex-center" id="J_finish_result">' +
            '<p class="pp_endstate" style="padding-top: 24px;">本标的倒计时已结束</p>' +
            '<p class="currentrate">请等待拍卖师操作</p>' +
            '</div>';
        this.html(display);
        this.show();
        return this;
    };
    //确认出价
    $(".submit_bid").off("click").on("click", function() {
        var curry = setTimeout(function() {
            alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
            window.location.reload(true);
        }, 5000);
        var offorPrice = $('#check_price').html()
        var jsonData = {
            lotId: PAGE_LOT_DATA.lotId,
            price: offorPrice //传递的参数
        };
        $.ajax({
            url: '/personal-ws/ws/0.1/bid/lot/' + PAGE_LOT_DATA.lotId,
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            async: true,
            data: JSON.stringify(jsonData),
            success: function(data) {
                util.transformNull(data)
                $('.offerDiv').hide().closeDialog();
                if (!data.status) {
                    failtips_bidder(data.msg)
                }
                clearTimeout(curry);
            },
            error: function(data) {

            }
        });
    })
    $(document).on("click", ".see-record", function() {
        for (var i = 0; i < $('.tab-menu li').length; i++) {
            $('.tab-menu li').eq(i).removeClass('current')
            $('.record-list').addClass('hidden')
        }
        $('.record-list').eq(5).removeClass('hidden')
        $(".tab-menu li").eq(5).addClass('current')
    })
    var lots_ = function(pageNum) {
        return function(pageNum) {
            var url = '/personal-ws/ws/0.1/bid/pricelog/' + PAGE_LOT_DATA.lotId + '?sortname=&sortorder=&start=' + pageNum + '&count=10'
            var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
            var auctiondata = {};
            util.getdata(newurl, "get", "json", false, false, function(data) {
                auctiondata.data = data;
                auctiondata.url = newurl;
                $('#J_RecordList tbody').morePriceLog(data);
            }, function(data) {

            });
            return pageNum;
        }
    }
    var lots_two = function(pageNum) { //竞价记录分页
        return function(pageNum) {
            var url = '/caa-search-ws/ws/0.1/auctionmeet/speaklogs?meetId=' + PAGE_LOT_DATA.meetId + '&lotId=' + PAGE_LOT_DATA.lotId + '&start=' + pageNum + '&count=10'
            var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
            var auctiondata = {};
            util.getdata(newurl, "get", "json", false, false, function(data) {
                auctiondata.data = data;
                auctiondata.url = newurl;
                $('.speaklogs-list').morespeaklogs(data)
            }, function(data) {
                //TODO 异常处理
            });
            return pageNum;
        }
    }
    $('.auctionnews .dis_block_child').mouseover(function() {
        var _height = -($(this).find('.typeTips').height() + 6)
        $(this).find('.typeTips').show().css('top', _height)
        $(this).mouseout(function() {
            $(this).find('.typeTips').hide()
        })
    })
})(jQuery);