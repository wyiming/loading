$(document).ready(function() {
    $(".J-container-title").headerStyle();
    if (user.islogin()) {
        auction_data.user.isLogin = true;
    } else {
        auction_data.user.isLogin = false;
    }
    auctionHall_controller.init();
    auctionHall_controller.detailinit();
    auctionHall_controller.Lookercount(); //围观
    //订阅当前编辑的拍品的状态(当对竞拍详情页面当前拍品进行出价、拍品的发言、暂停、继续操作时能推送过来)
    connection.register('/lots/lot_' + auction_data.lotId, auctionHall_controller.auctionCatalogPush, auctionHall_controller.outerFailHandler);
    //订阅当前拍卖会的推送，当所有拍卖会的拍品状态发生改变时均发生推送,拍卖会发言时进行推送
    connection.register('/auctions/auction_' + auction_data.meetId, auctionHall_controller.auctionMeetPush, auctionHall_controller.outerFailHandler);
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
                auction_data.timeBol = false;
            };
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
    meetStatus: null,//拍卖会的状态
    show_price: 0, //当前价格
    available_price: 0, //可以出的最低价
    range: 0, //竞价阶梯
    deposit: 0, //保证金
    status: 0, //拍卖状态   state
    mybidNum: null, //我的竞买号
    nowBidNum: null,
    subStatus: null,
    processinglotId: false,
    changedProcessingLotId: false,
    bidCount: 0,
    suspendTime: null,
    lastprice: 0, //上一条自己出的价格
    pagetime: 30000, //30秒计时器的频率在限时竞价时间需更改
    timeBol: true,
    limitFresh: null,
    index: 0,
    popupCount: 0, //此字段控制弹窗提示，用来解决用户切换拍品后，拍卖师操作默认展示拍品为进行时不提示的问题
    isExistGoing: false, //判断拍卖会是否存在正在进行的拍品
    countExecuteItemlist: 0, //此字段用来防止初始化时itemlist和asyncItemlist的重复执行
    referenceTime: (new Date()).getTime(), //参考时间，用来判断当推送执行时,30s自动刷新将不再执行
    tempTime:(new Date()).getTime(),//用来规避页面的过多加载
    timeControl:null,//此对象用来清除之前设置的页面自动加载的时间，用来解决自动刷新时间不准确的问题
    guardCheck: null, //用于当竞价总时间小于30s时，将页面自动刷新时间变为6s
    totalCountTime: null//总的竞价时间
};
var PAGE_LOTShow_DATA = {}; //页面默认展示的拍品
//页面控制器，负责与后台交互，获取数据
var auctionHall_controller = {
    init: function() {
        //进行标的和拍卖会传参的验证(作用是的防止用户修改浏览器url的传参，导致拍卖会和拍品不对应的问题)
        auctionHall_controller.validationParamInfo();
        auctionHall_controller.itemlist(); //初始化拍卖会的标的集合
        //渲染拍品详情信息(包含拍品描述的渲染  拍卖师发言和拍品的竞价纪录)
        auctionHall_controller.initLotInfo(auction_data.lotId); //把正在编辑的标的的信息初始化到 auction_data中
        //拍卖师信息只需要加载一次
        auctionHall_controller.auctionner(); //加载拍卖师信息
        auctionHall_controller.currentBidRecord();

    },
    priceCometd: function() {
        auctionHall_controller.latestBidInfo(auction_data.lotId);
        auctionHall_controller.showPricelog();
    },
    //因为订阅的拍卖会推送，也能将当前的拍品的状态信息推送过来，故当前拍品的推送处不在对当前拍品状态的改变就行处理
    auctionCatalogPush: function(message) {
        //每次拍品的channel接到推送时,重制参考时间
        auction_data.referenceTime = (new Date()).getTime();
        var tipInfo = message.data.remark;
        if (tipInfo == "price") {
            auctionHall_controller.priceCometd();
        } else if (tipInfo == "speak") {
            auctionHall_controller.loadSpeaklog();
            //当推送正常的情况下，清除旧有的计时器，重新定时
            auctionHall_controller.lazyCurrentBidRecordExecution();
        } else if (tipInfo == "status") {
            auctionHall_controller.latestBidInfo(auction_data.lotId);
            //暂停或者继续时，需在拍卖师发言列表处，将拍卖师操作的拍品的状态进行提示
            auctionHall_controller.loadSpeaklog();
        }
    },
    //订阅拍卖会的发言和拍会中所有拍品的状态变化
    auctionMeetPush: function(message) {
        //每次拍卖会的channel接到推送时,重制参考时间
        auction_data.referenceTime = (new Date()).getTime();
        var tipInfo = message.data.remark; 
        if (tipInfo == "speak") {
            auctionHall_controller.loadSpeaklog();
            //当推送正常的情况下，清除旧有的计时器，重新定时
            auctionHall_controller.lazyCurrentBidRecordExecution();
        }else if (tipInfo == "lot") { //非当前拍品的状态发生变化
        	var nowTime=(new Date()).getTime();
        	if(nowTime-auction_data.tempTime> 1000 ){
        		auctionHall_controller.asyncItemlist();
        		auction_data.tempTime=(new Date()).getTime();
        		  //当推送正常的情况下，清除旧有的计时器，重新定时
                auctionHall_controller.lazyCurrentBidRecordExecution();
        	}
        }else if(tipInfo == "status"){
    		 var statusCode= message.data.status;
         	 if(statusCode!=auction_data.meetStatus){
         		 auctionHall_controller.asyncItemlist();
         		 auctionHall_controller.latestBidInfo(auction_data.lotId);
         	 }
    	}
    },
    //设置页面自动刷新，执行latestBidInfo后没必要再执行此方法，因为latestBidInfo方法已经内置有此方法
    lazyCurrentBidRecordExecution: function(){
    	//清除旧有的页面定时刷新计时器
    	 window.clearTimeout(auction_data.timeControl);
    	//创建一个新的页面定时刷新任务的定时器，注意auction_data.pagetime可能的变化
         auction_data.timeControl=window.setTimeout(auctionHall_controller.currentBidRecord, auction_data.pagetime);
    },
    //外层的握手失败的处理，将页面自动刷新时间变为10s
    outerFailHandler: function() {
        auction_data.pagetime = 10000;
    },
    changeProcess: function() {
        //只有同步拍才会有弹窗提示
        if (auction_data.meetMode == 0) {
            var nowProcessingLotId = auction_data.changedProcessingLotId;
            if (nowProcessingLotId) {
                if (nowProcessingLotId != auction_data.lotId) {
                    if (!auction_data.isExistGoing && auction_data.popupCount == 1 && auction_data.changedProcessingLotId == auction_data.processinglotId) {
                        auctionHall_controller.showPopup();
                    }
                    if (auction_data.changedProcessingLotId != auction_data.processinglotId) {
                        auctionHall_controller.showPopup();
                    }
                    auction_data.processinglotId = nowProcessingLotId; //变化知否赋值
                    auction_data.popupCount = auction_data.popupCount + 1;
                }
                if (auction_data.changedProcessingLotId == auction_data.lotId) {
                    auctionHall_controller.hidePopup();
                    auction_data.processinglotId = nowProcessingLotId; //变化知否赋值
                    auction_data.popupCount = auction_data.popupCount + 1;
                }

            }
        }
    },
    showPopup: function() {
        //加载最近的processLotId 信息的内容，展示在弹窗里。
        $('.pauseDiv').slideDown(500) //开启弹窗
        var name = auctionHall_controller.getProcessLotName(auction_data.changedProcessingLotId);
        $('.pauseDiv .pay-tit').html('《' + name + '》标的已经开始竞拍，是否切换?')
    },

    hidePopup: function() {
        $('.pauseDiv').slideUp(500); //关闭弹窗
    },
    //asyncItemlist和itemlist的区别在于，itemlist在页面初始化时同步加载，asyncItemlist在页面自动刷新期间异步加载
    asyncItemlist: function() {
        $.ajax({
            url: '/caa-search-ws/ws/0.1/lots/sort/all?meetId=' + auction_data.meetId + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: true,
            success: function(data) {
                if (data && data.length > 0) {
                    util.transformNull(data);
                    //获取拍卖会的类型
                    auction_data.meetMode = data[0].meetMode;
                    var istopIndex = 0;
                    //如果拍卖会类型为同步拍
                    if (auction_data.meetMode == 0) {
                        $.each(data, function(index, item) {
                            //istop标记此拍品是否正在编辑，为1表示正在编辑，istopIndex存储拍品在列表中的指针,如果不存在istop为1且正在进行的的拍品，默认展示第一个
                            if (item.isTop == "1" && item.status == 1) {
                                istopIndex = index;
                            }
                        })
                    }
                    if (!auction_data.lotId || auction_data.lotId == "undefined") {
                        auction_data.lotId = data[istopIndex].id;
                    }
                    if (data[istopIndex].status == 1) {
                        if (!auction_data.processinglotId) { //只赋值一次
                            auction_data.processinglotId = data[istopIndex].id;
                            auction_data.popupCount = auction_data.popupCount + 1;
                        }
                        auction_data.changedProcessingLotId = data[istopIndex].id;
                    }
                    $('.J-meet-catalog').renderItems(data);
                    auctionHall_controller.changeProcess();
                    auction_data.items = data;
                } else {
                    window.location.href = '/404.html';
                }
            },
            error: function(data) {

            }
        })
    },
    itemlist: function() {
        $.ajax({
            url: '/caa-search-ws/ws/0.1/lots/sort/all?meetId=' + auction_data.meetId + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                if (data && data.length > 0) {
                    util.transformNull(data)
                     //获取拍卖会的类型
                    auction_data.meetMode = data[0].meetMode;
                    var istopIndex = 0;
                    //如果拍卖会类型为同步拍,为网络拍的情况为默认展示第一个，不需要有下面的判断处理
                    if (auction_data.meetMode == 0) {
                        $.each(data, function(index, item) {
                            //istop标记此拍品是否正在编辑，为1表示正在编辑，istopIndex存储拍品在列表中的指针,如果不存在istop为1且正在进行的的拍品，默认展示第一个
                            if (item.isTop == "1" && item.status == 1) {
                                istopIndex = index;
                            }
                        })
                    }
                    if (!auction_data.lotId || auction_data.lotId == "undefined") {
                        auction_data.lotId = data[istopIndex].id;
                    }
                    if (data[istopIndex].status == 1) {
                        auction_data.isExistGoing = true;
                        if (!auction_data.processinglotId) { //只赋值一次
                            auction_data.processinglotId = data[istopIndex].id;
                        }
                        auction_data.changedProcessingLotId = data[istopIndex].id;

                    }
                    $('.J-meet-catalog').renderItems(data);
                    auction_data.items = data;
                    //页面初始化时执行，根据countExecuteItemlist的值判断页面是第一次加载还是加载后页面的渲染，如果页面已经加载过，可以调用异步方法进行渲染，因为一些必要的值已经初始化了，
                    //如果页面初始化加载时就用异步，会导致有些参数未进行初始化就执行后续方法，导致报错
                    auction_data.countExecuteItemlist += 1;
                } else {
                    window.location.href = '/404.html';
                }
                //前提是用户已登录 此处为当用户未缴纳保证金试，每次调用itemlist，向后台查询保证金缴纳情况，如果已经校验了保证金，将不再校验
                if (auction_data.user.isLogin == true && auction_data.user.isApply == false) {
                    auctionHall_controller.checkDeposite(auction_data.lotId);
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
                auction_data.available_price = util.addingFn(auction_data.nowPrice, auction_data.rateLadder);
            } else {
                auctionHall_controller.topprice(auction_data.lotId);
                if (auction_data.lastprice == auction_data.nowPrice) {
                    auction_data.available_price = util.addingFn(auction_data.nowPrice, auction_data.rateLadder);
                } else {
                    auction_data.available_price = auction_data.nowPrice;
                }
            }
        } else {
            if (auction_data.nowBidNum) {
                //如果已经有人出价，可用的最高价位当前价格
                auction_data.available_price = util.addingFn(auction_data.nowPrice, auction_data.rateLadder);
            } else {
                auction_data.available_price = auction_data.nowPrice;
            }
        }
    },
    timeover: function() { //时间走完要调用的方法
        util.getdata('/personal-ws/ws/0.1/lot/currentinfo/' + auction_data.lotId, 'get', 'json', false, false, function(data) {
            if (data.endTime < data.nowTime) {
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
                $('.auctioneername').html(data.name)
                $('.auctioneername2 span').eq(1).html(data.idcard)
                if (data.photo) {
                    $('.auctioneer-pic.J_auctionPhoto').attr("src", data.photo);
                }else{
                	$('.auctioneer-pic.J_auctionPhoto').remove();
                }
                data.idCardPhoto=data.photo;
                if (data.idCardPhoto) {
                    $('.auctioneer-pic.J_auctionIdCardPhoto').attr("src", data.idCardPhoto);
                }else{
                	$('.auctioneer-pic.J_auctionIdCardPhoto').remove();
                	$('.square.J_auctionPhoto').remove();
                	$('.square.J_auctionIdCardPhoto').remove();
                }
                //拍卖师证件照的轮播
                if (data.photo && data.idCardPhoto) {
                    var i = 0;
                    setInterval(function() {
                        if (i >= 2) {
                            i = 0
                        }
                        if ($('.auctioneer-pic').eq(i).hasClass('hidden')) {
                            $('.auctioneer-pic').siblings().addClass('hidden');
                            $('.square').siblings().removeClass('active');
                            $('.auctioneer-pic').eq(i).removeClass('hidden');
                            $('.square').eq(i).addClass('active');
                        }
                        i++
                    }, 4000)
                }
            },
            error: function() {

            }
        })
    },

    getProcessLotName: function(lotId) {
        var name = "";
        $.each(auction_data.items, function(index, item) {
            if (lotId == item.id) {
                name = item.name;
            }
        })
        return name;
    },
    //进行页面的参数有效性校验
    validationParamInfo: function() {
        if (auction_data.lotId) {
            //初始化验证拍品的lotid和meetId是否对应,同时校验其存在性,如果不存在或者不匹配则跳转到404页面
            auctionHall_controller.initValidation(auction_data.lotId);
        }
    },
    initValidation: function(lotId) {
        $.ajax({
            url: "/personal-ws/ws/0.1/lot/" + lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                util.transformNull(data)
                if (data && data.meetId >= 0) {
                    if (auction_data.meetId && auction_data.meetId != data.meetId) {
                        window.location.href = '/404.html';
                    }
                    //如果验证通过的话,则将查到的页面应该展示的拍品进行初始化
                    PAGE_LOTShow_DATA = data;
                } else {
                    window.location.href = '/404.html';
                }
            },
            error: function(data) {

            }
        })
    },
    //initLotInfo方法初始化一些渲染一些不变的基本信息
    initLotInfo: function(lotId) {
        //如果PAGE_LOTShow_DATA(页面初始化进来默认加载的拍品未初始化,则向后台再查询一次)
        if (undefined == PAGE_LOTShow_DATA.meetId) {
            $.ajax({
                url: "/personal-ws/ws/0.1/lot/" + lotId + "?time=" + (new Date().getTime()),
                type: 'get',
                dataType: 'json',
                cache: false,
                async: false,
                success: function(data) {
                    util.transformNull(data);
                    PAGE_LOTShow_DATA = data;
                },
                error: function(data) {

                }
            })
        };
        if (PAGE_LOTShow_DATA.nowPrice) {
            auction_data.nowPrice = PAGE_LOTShow_DATA.nowPrice;
        } else {
            auction_data.nowPrice = PAGE_LOTShow_DATA.startPrice;
        }
        auction_data.meetId = PAGE_LOTShow_DATA.meetId;
        auction_data.deposit = PAGE_LOTShow_DATA.cashDeposit;
        auction_data.range = PAGE_LOTShow_DATA.rateLadder;
        auction_data.status = PAGE_LOTShow_DATA.lotStatus;
        auction_data.freetime = PAGE_LOTShow_DATA.freeTime;
        auction_data.limitTime = PAGE_LOTShow_DATA.limitTime;
        auction_data.endTime = PAGE_LOTShow_DATA.endTime;
        auction_data.nowTime = PAGE_LOTShow_DATA.nowTime;
        auction_data.lotMode = PAGE_LOTShow_DATA.lotMode;
        $('.grid-c').loadinfo(PAGE_LOTShow_DATA); //渲染标的信息页面
    },
    //latestBidInfo，每一次进行推送或者刷新时调用，渲染一些拍品详情页需要变动的信息
    latestBidInfo: function(lotId) { //最新的竞价信息 4种场景下调用改方法 每隔30秒调用一次  竞价成功调用一次  推送状态发生变化调用一次 0.00倒计时结束调用1次
        $.ajax({
            url: '/personal-ws/ws/0.1/lot/currentinfo/' + lotId + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: true,
            success: function(data) {
                util.transformNull(data)
                auction_data.status = data.state
                auction_data.nowBidNum = data.nowBidNum;
                auction_data.endTime = data.endTime;
                auction_data.nowTime = data.nowTime;
                auction_data.limitTime = data.limitTime;
                auction_data.subStatus = data.subStatus;
                auction_data.meetStatus = data.meetStatus;
                auction_data.meetStartTime = data.meetStartTime;
                auction_data.suspendTime = data.suspendTime;
                //对一些已经改变的信息进行渲染
                $('.grid-c').autofreshloadinfo(data); //渲染标的信息页面

                if (data.nowPrice && !auction_data.show_price) {
                    auction_data.show_price = data.nowPrice;
                }
                if (data.hasMinPrice) {
                    $('#retain').html('有')
                } else {
                    $('#retain').html('无')
                }
                if (data.rateLadder) {
                    auction_data.rateLadder = data.rateLadder;
                }
                if (parseFloat(data.nowPrice) > 0) {
                    auction_data.nowPrice = data.nowPrice;
                }
                auctionHall_controller.changePrice();
                var duration=data.endTime - data.nowTime;
                if (data.state == 0) { //如果标的即将开始
                    auction_data.price_type = "起拍价";
                    var $coming = $("#DISPLAY_BID_COMMING").commingBidCommon()
                    if (auction_data.user.isJoin) {
                        auctionHall_controller.loadJPH(lotId); //加载我的竞拍号
                        $coming.waitBid(data).buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount);
                    } else { //没有缴纳保证金
                        $coming.bidUnjoin();
                    } 
                } else if (data.state == 1) {
                    auction_data.price_type = "当前价";
                    auction_data.nowBidNum = data.nowBidNum;
                    if (auction_data.user.isLogin) { //用户已经登录
                        if (auction_data.user.isJoin) {
                            auctionHall_controller.loadJPH(lotId);
                            if (auction_data.mybidNum == data.nowBidNum) {
                                $('#DISPLAY_BID_PROGRESSING').progressBidCommon(duration, "我", data).progressBidJoin(data).progressBidLeader()
                            } else {
                                if (auction_data.bidCount > 0) { //表示自己出过价
                                    $('#DISPLAY_BID_PROGRESSING').progressBidCommon(duration, data.nowBidNum, data).progressBidJoin(data).progressBidOutter()
                                } else {
                                    $('#DISPLAY_BID_PROGRESSING').progressBidCommon(duration, "", data).progressBidJoin(data);
                                }
                            }
                            $('#DISPLAY_BID_PROGRESSING').buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount)
                        } else { //没有缴纳保证金
                            $('#DISPLAY_BID_PROGRESSING').progressBidCommon(duration, data.nowBidNum, data);
                            $('#DISPLAY_BID_PROGRESSING').bidUnjoin();
                        }
                    } else { //用户没有登录
                        $('#DISPLAY_BID_PROGRESSING').progressBidCommon(duration, data.nowBidNum, data);
                        $('#DISPLAY_BID_PROGRESSING').bidUnjoin();
                    }

                    if (auction_data.subStatus === 0) {
                        $('#DISPLAY_BID_PROGRESSING').timefinish();
                    }

                } else if (data.state == 7) {
        			if(data.sureTime.length==0){
        				if(data.endTime-auction_data.suspendTime > auction_data.limitTime*1000){
        					duration=data.endTime-auction_data.suspendTime;
        				}else{
        					duration=auction_data.limitTime*1000;
        				}
        			}else{
        				if(data.endTime-data.sureTime>auction_data.limitTime*1000){
        					duration=data.endTime - data.sureTime;
        				}else{
        					duration=auction_data.limitTime*1000;
        				}
        			}
                    var $coming = $('#DISPLAY_BID_FINISH').finishBidCommon(data);
                    if (auction_data.user.isJoin) {
                        auctionHall_controller.loadJPH(lotId);
                        $coming.buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount);
                    }
                } else if (data.state == 3) { //已成交
                    var $finish = $('#DISPLAY_BID_FINISH').finishBidCommon(data)
                    if (auction_data.user.isJoin) {
                        auctionHall_controller.loadJPH(lotId);
                        if (auction_data.mybidNum == data.nowBidNum) {
                            $finish.finishBidOwer();
                        } else {
                            $finish.finishBidOutter();
                        }
                        $finish.buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount);
                    }
                } else {
                    $('#DISPLAY_BID_FINISH').finishBidCommon(data)
                    if (auction_data.user.isJoin) {
                        auctionHall_controller.loadJPH(lotId);
                        $('#DISPLAY_BID_FINISH').finishBidCommon(data).buildMyBidderInfo(auction_data.mybidNum, auction_data.bidCount);
                    }
                }
                //如果剩余总时间大于30s(小于的话已经是6s刷新，不需要做特殊处理)，创建一个定时任务，当剩余时间等于30s时，执行一次页面重新渲染
                auction_data.totalCountTime=duration;
                console.log(duration);
                if(duration-30*1000>0){
                	window.clearTimeout(auction_data.guardCheck);
                	auction_data.guardCheck=window.setTimeout(auctionHall_controller.guardcurrentBidRecord,duration-30*1000);
                }else{
                	window.clearTimeout(auction_data.guardCheck);
                }
                //因为是异步的，getFreshIterval方法放到此处
                auctionHall_controller.getFreshIterval();
                //设置页面的ajax轮询，将页面自动刷新的定时任务存储到timeControl中；此两行代码之前放在currentBidRecord方法内，因为异步导致的auction_data.pagetime字段不能实时获取，故放在此处执行 
	            //不管存在与否，清除旧有的定时器，重新定时页面刷新操作
	           	 window.clearTimeout(auction_data.timeControl);
	           	//创建一个新的页面定时刷新任务的定时器，注意auction_data.pagetime可能的变化
                auction_data.timeControl=window.setTimeout(auctionHall_controller.currentBidRecord, auction_data.pagetime);
            },
            error: function() {
            }
        });

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
    confirmation: function() {
        //竞价成功确认书
        util.getdata('/personal-ws/ws/0.1/lot/confirmation/' + auction_data.lotId, 'get', 'json', false, true, function(data) {
            util.transformNull(data)
            if (data.companyName || data.barginUserName) {
                $('#AuctConfirmation').buildConfirmation(data);
                $('.tab-menu li:last').removeClass('hidden')
                $('#DetailTabMain').show()
            }
        })
    },
    //拍卖师发言(每次查出来100条，最多展示100条，无分页)
    loadSpeaklog: function() {
        util.getdata('/caa-search-ws/ws/0.1/auctionmeet/speaklogs?meetId=' + auction_data.meetId + '&lotId=' + auction_data.lotId + '&start=0&count=100', 'get', 'json', true, false, function(data) {
            util.transformNull(data);
            $(".auctioneerspeak").speaklogs(data);
        }, function(data) {
            $(".auctioneerspeak").errorspeak(data);
        });
    },

    showPricelog: function() {
        util.getdata('/personal-ws/ws/0.1/bid/pricelog/' + auction_data.lotId + '?sortname=&sortorder=&start=0&count=10', 'get', 'json', true, false, function(data) {
            util.transformNull(data)
            $('#J_RecordList tbody').morePriceLog(data);

            var logs = [];
            $.each(data.items, function(index, item) {
                if (index <= 3) {
                    logs[index] = item;
                } else {
                    return;
                }
            })
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
        if (auction_data.totalCountTime <= 30 * 1000 && (auction_data.status==1 || auction_data.user.isApply == true)) {//总竞价时间小于等于30且（拍品处于正在进行或用户已经报名），将页面自动刷新时间变为6s
        	auction_data.pagetime = 6000;
        	if(auction_data.totalCountTime<0 && auction_data.status!=1){//此处主要校验拍品已经成交，流拍等的结束状态 ；auction_data.status==1 且auction_data.totalCountTime<0的状态为等待拍卖师操作的状态，此时页面的刷新时间为6s
        		auction_data.pagetime = 30000;
        	}
        } else {
            auction_data.pagetime = 30000;
        }
    },
    currentBidRecord: function() {
        if (!navigator.onLine) {
            alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
            window.location.reload(true);
        }
        //获取当前最新的ms数
        var newTime = (new Date()).getTime();
        // countExecuteItemlist字段作用是： 初始化加载页面时， 因为执行了同步的itemlist方法， 不再执行asyncItemlist方法, 之后页面自动刷新则执行异步的asyncItemlist方法
        if (newTime - auction_data.referenceTime >= auction_data.pagetime && auction_data.countExecuteItemlist != 1) {
            auctionHall_controller.asyncItemlist();
        }
        //当页面重新load时加载一次，此后执行的情况是(new Date()).getTime()-auction_data.referenceTime>=300000,即页面在30s内未接收到推送
        if (newTime - auction_data.referenceTime >= auction_data.pagetime || auction_data.countExecuteItemlist == 1) {
            auction_data.countExecuteItemlist += 1;
            auctionHall_controller.latestBidInfo(auction_data.lotId);
            auctionHall_controller.showPricelog();
            auctionHall_controller.loadSpeaklog();
        }
    },
    //用于30s临界点即可转换为6s刷新
    guardcurrentBidRecord: function(){
    	 //不管存在与否，清除旧有的定时器，重新定时页面刷新操作
      	 window.clearTimeout(auction_data.timeControl);
    	 auctionHall_controller.latestBidInfo(auction_data.lotId);
    },
    //标的详情页初始化
    detailinit: function() {
        //标的介绍
        util.getdata('/caa-search-ws/ws/0.1/lot/' + auction_data.lotId + '/introduction/', 'get', 'json', false, true, function(data) {
            util.transformNull(data);
            if (data.remark) {
                $('.pai-remind-tip').html(data.remark); //重要提示
            } else {
                $('.tab-menu li').eq(0).remove();
                $('.record-list').eq(0).remove();
                $('.tab-menu li').eq(0).addClass('current');
                $('.record-list').eq(0).removeClass('hidden');
            }
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
    }
};
(function($) {
    //渲染页面信息,渲染一些固定不变的信息
    $.fn.loadinfo = function(data) {
        if (data.hasProv) {
            $('#prior_span').html("有")
        } else {
            $('#prior_span').html("无")
        }
        if (auction_data.lotMode == 1) {
            $('#all_count').css('display', 'inline_block');
            $('#lot_allnum').html(data.amount);
            $('#unit').html(data.unit);
        } else {
            $('.lot_allnum').hide()
        }
        var meetMode = ["同步拍", "网络拍"]
        $('.auct_name').html(data.meetName);
        $('#pro_bid_name').html(data.name) //标的名称
        $('#assessPrice').html(util.formatCurrency(data.assessPrice)) //评估价
        $('#cashDeposit').html(util.formatCurrency(data.cashDeposit)) //保证金
        $(".J-meet-name").html('<span class="meet-mode meet-mode' + data.meetMode + '">' + meetMode[data.meetMode] + '</span>' + data.meetName); //拍卖会名称
        $('.companyName').html(data.companyName) //拍卖会机构
        if (data.linkTel) {
            $('.companyTel').html(data.linkTel) //联系电话
        } else {
            $('#link').hide()
        }
        $('.linkman').html(data.linkman)
        $(document).attr("title", '拍卖大厅_' + data.meetName + '_中拍平台');
        $('#assess_price span').html(util.changeMoneyToChinese(data.assessPrice))
        $('#deposite_price span').html(util.changeMoneyToChinese(data.cashDeposit))
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
    //渲染页面信息,渲染一些拍品页面会改变的信息
    $.fn.autofreshloadinfo = function(data) {
        $('#startPrice').html(util.formatCurrency(data.startPrice) + '&nbsp;元') //起拍价
        $('#rateLadder').html(util.formatCurrency(data.rateLadder)) //加价幅度
        $('.look_count span').html(data.onLooker) //围观次数
        $('.join_count span').html(data.enrollment) //报名人数
        $('#bidCycle').html(util.tranferTime4(data.freeTime)) //竞价周期
        $('#delayTimes').html(util.tranferTime4(data.limitTime)) //限制周期
        $('#start_price span').html(util.changeMoneyToChinese(data.startPrice))
        $('#rate_price span').html(util.changeMoneyToChinese(data.rateLadder))
    };

    $.fn.buildConfirmation = function(data) {
        $('.tab-menu li:last').removeClass('hidden')
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
        if (auction_data.lotMode == '1') {
            $('.auction-end .detail-common-text').eq(1).html(
                '<div class="detail-common-text">该标的网络拍卖成交单价：' +
                '<span class="bargainPrice">' + util.formatCurrency(data.singlePrice) + '元/' + data.unit + '</span>' +
                // '<span class="bargainPriceL">(' + util.changeMoneyToChinese(data.singlePrice) + ')</span>' +
                '</div>' +
                '<div class="detail-common-text">标的总量：' +
                '<span class="bargainmount">' + data.amount + data.unit + '</span>' +
                '</div>' +
                '<div class="detail-common-text">成交总价：' +
                '<span class="bargainPrice">' + util.formatCurrency(data.bargainPrice) + '元</span>' +
                '<span class="bargainPriceL">( ' + util.changeMoneyToChinese(data.bargainPrice) + ')</span>' +
                '</div>'
            )
        }
    };
    $.fn.errorspeak = function(data) {
        var ul = ""
        ul = '<li class="lineh22">暂无拍卖师发言</li>';
        this.html(ul)
        return this
    }

    $.fn.morePriceLog = function(data) {
        var hisStr = '';
        if (data.totalCount > 0) { //有竞买记录
            var isHaveFirst = false
            $.each(data.items, function(i, record) {
                if (!$.isEmptyObject(record)) {
                    var isProv = record.isProv >= 1 ? '优' : '';
                    var isAgent = record.isAgent >= 1 ? '委' : '';
                    var isRecord = record.isRecord >= 1 && record.bidNum != "现场用户" ? '现' : '';
                    var isexit = record.isBack >= 1 ? 'through' : '';
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
                        if (auction_data.status == 3) {
                            hisStr += '<tr class="get">' +
                                '<td><span class="record-icon"><s>成交</s></span></td>' +
                                '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                '<td>¥' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                '</tr>';
                        } else {
                            if (record.isBack) {
                                hisStr += '<tr class="out">' +
                                    '<td><span class="record-icon"><s>回退</s></span></td>' +
                                    '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                    '<td class="' + isexit + '">¥' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                    '</tr>';
                            } else {
                                hisStr += '<tr class="leader">' +
                                    '<td><span class="record-icon"><s>领先</s></span></td>' +
                                    '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                    '<td>¥' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                    '</tr>';
                            }
                        }
                    } else {
                        if (record.isBack) {
                            hisStr += '<tr class="out">' +
                                '<td><span class="record-icon"><s>回退</s></span></td>' +
                                '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                '<td class="' + isexit + '">¥' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
                                '</tr>';
                        } else {
                            hisStr += '<tr class="out">' +
                                '<td><span class="record-icon"><s>出局</s></span></td>' +
                                '<td><div class="nickname">' + record.bidNum + isProv + isAgent + isRecord + '</div></td>' +
                                '<td>¥' + util.formatCurrency(record.price) + ' </td><td>' + util.tranferTime(record.bidTime) + '</td>' +
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
    //渲染竞价记录
    $.fn.lastestPriceLog = function(logs) {
        var ul = '';
        if (logs.length == 0) {
            ul = '<li class="no-pay-records">暂无竞价记录</li>'
            this.html(ul);
        } else {
            var isHaveFirst = false;
            $.each(logs, function(index, data) {
                var small = "";
                if (index >= 3) {
                    $('.see-record').show()
                    return
                }
                if (data.bidNum == "现场用户") {
                    small = "small_size";
                }
                var arr = ["领先", "出局", "回退", "成交"];
                var through = "";
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
                    '<span class="nickname ' + small + '">' + data.bidNum;
                if (data.isProv) {
                    li += '<em class="isagent">优</em>'
                }
                if (data.isAgent) {
                    li += '<em class="isagent">委</em>'
                }
                if (data.isRecord && data.bidNum != "现场用户") {
                    li += '<em class="isagent">现</em>'
                }
                if (data.isBack) {
                    through = "through"
                }
                li += '</span><span style="width: 36%;" class="' + through + '">¥' + util.formatCurrency(data.price) + '</span></p></li>';
                ul += li
            });
            this.html(ul);
        }
    };
    //即将开始的 竞价效果渲染
    $.fn.commingBidCommon = function() {
        $('.action_bid_aera').hide();
        if (auction_data.meetStatus != 0) {
            var str = "拍卖会正在进行，请尽快报名"
            if (auction_data.user.isApply) {
                str = "拍卖会正在进行，请尽快缴纳保证金"
            }
            if (auction_data.user.isJoin) {
                str = "拍卖会正在进行，请等待开拍"
            }
        } else {
            str = "拍卖会预计" + util.tranferTime5(auction_data.meetStartTime) + "开始"
        }
        var comming = $('<ul class="pm-bid-eyebrow">' +
            '<li class="wait-title">' + str + '</li>' +
            '<li id="sf-price">' +
            '<span class="title">' + auction_data.price_type + '</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.nowPrice) + '</em></span>' +
            '<em class="rmb-unit">元</em>' +
            '</li>' +
            '</ul>');
        this.html(comming);
        this.show();
        return this;
    };
    //拍卖进行中  参数：当前价格，结束时间
    $.fn.progressBidCommon = function(duration, currBidder, data) {
        $('.pay_bid').removeClass('disabled')
        $('.action_bid_aera').hide();
        var display = '<ul class="pm-bid-eyebrow">' +
            '<li class="J_PItem" id="sf-countdown" style="height: 30px">' +
            '<span class="title J_TimeTitle">倒计时</span>' +
            '<span class="countdown J_TimeLeft" id="LOT_DURATION_FINISH"></span>' +
            '<span id="J_Delay" class="pm-delay"><em class="delayCnt">0</em>次延时</span>' +
            '</li>' +
            '<li id="sf-price">' +
            '<span class="title">当前价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.nowPrice) + '</em></span>' +
            '<em class="rmb-red">元</em>';
        if (currBidder && currBidder != '') {
            display += '<div class="bidder_people">' +
                '<span>出价人：</span>' +
                '<span class="curr_person">' + currBidder + '</span>' +
                '<div class="pm-status" style="display: none;"></div>' +
                '</div>';
        }
        display += '</li>' +
            '</ul>';
        this.html(display);
        if (auction_data.status == 1 && data.endTime < data.nowTime) {
            this.hide();
        } else {
            this.show();
        }
        PAGE_TIMER.start(PAGE_TIMER.finish, duration);
        return this;
    };
    //保证金金额
    $.fn.bidUnjoin = function() {
        var display = $('<div class="pm-bid-eye">' +
            '<div class="pm-bid pm-before-apply bid_ing" style="display: block">' +
            '<ul class="pm-bid-eyebrow">' +
            // '<li id="sf-price" style="padding-left:0px;margin-bottom:20px;">' +
            // '<span class="title">保证金</span>' +
            // '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.deposit) + '</em></span>' +
            // '<em class="rmb-red">元</em>' +
            // '</li>' +
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
                if ($(this).html() == "报名") {
                    if (auction_data.user.isLogin) {
                        $('.applyDiv').show().openDialog();
                        window.open("/pages/pay/apply.html?lotId=" + auction_data.lotId); //支付保证金页面 
                    } else {
                        window.open("/pages/user/login.html?redirect=" + window.location.href); //登录页面
                    }
                }
            });
        }
        display.find('.line').append(a);
        this.append(display);
        return this;
    };
    //等待开拍
    $.fn.waitBid = function(data) {
            if (auction_data.show_price < auction_data.available_price) {
                auction_data.show_price = auction_data.available_price;
            }
            var displaywait = $('<div class="pm-bid-eye">' +
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
            if (displaywait.find('.pm-price-input').val().length > 15) {
                displaywait.find('.plus-minus-operation').width(displaywait.find('.plus-minus-operation').width() + 100)
            } else {
                displaywait.find('.plus-minus-operation').width(265)
            }

            this.append(displaywait);
            return this;
        }
        //拍卖进行中  参与者渲染
    $.fn.progressBidJoin = function(data) {
        if (auction_data.show_price < auction_data.available_price) {
            auction_data.show_price = auction_data.available_price;
        }
        var display = $('<div class="pm-bid-eye price-val">' +
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
            if ($(this).hasClass("active")) {
                auction_data.show_price = display.find('.pm-price-input').val();
                auction_data.show_price = util.addingFn(auction_data.show_price, auction_data.rateLadder)
                display.find('.pm-price-input').val(auction_data.show_price);
            }
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
            if (display.find('.pm-price-input').val().length > 15) {
                display.find('.plus-minus-operation').width(display.find('.plus-minus-operation').width() + 100)
            } else {
                display.find('.plus-minus-operation').width(265)
            }

            if (auction_data.show_price <= auction_data.available_price) {
                $(this).removeClass('active');
            }
        });
        display.find(".pay_bid").click(function() {
            if (display.find('.pay_bid').hasClass('disabled')) {
                return false
            }
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
                window.location.href = '/pages/lots/profession.html?meetId=' + auction_data.meetId + '&lotId=' + auction_data.lotId;
            });
        });
        if (display.find('.pm-price-input').val().length > 15) {
            display.find('.plus-minus-operation').width(display.find('.plus-minus-operation').width() + 100)
        } else {
            display.find('.plus-minus-operation').width(265)
        }

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
        this.find('.pm-status').addClass('win').show()
        return this;
    };
    //拍卖进行中_出局者渲染
    $.fn.progressBidOutter = function(data) {
        this.find('.pm-status').show()
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
    $('.applyDiv .successBtn').click(function() {
        auctionHall_controller.checkDeposite(auction_data.lotId);
        if (auction_data.user.isApply) {
            $('.applyDiv').hide().closeDialog();
            auctionHall_controller.latestBidInfo(auction_data.lotId);
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
        var currBidder;
        if (auction_data.nowBidNum) {
            if (auction_data.nowBidNum == data.nowBidNum && auction_data.user.isJoin) {
                currBidder = "我";
            } else {
                currBidder = auction_data.nowBidNum;
            }
        }
        var display = '<ul class="pm-bid-eyebrow end_time">' +
            '<li id="sf-price" class="now-price hidden">' +
            '<span class="title">当前价</span>' +
            '<span class="pm-current-price J_Price" id="_curr_price"><em>' + util.formatCurrency(auction_data.nowPrice) + '</em></span>' +
            '<em class="rmb-red">元</em>';
        if (currBidder && currBidder != '') {
            display += '<div class="bidder_people">' +
                '<span>出价人：</span>' +
                '<span class="curr_person">' + currBidder + '</span>' +
                '<div class="pm-status" style="display: none;"></div>' +
                '</div>';
        }
        display += '</li>' +
            '<li class="J_PItem" id="sf-countdown">' +
            '<span class="time">' + util.tranferTime(data.endTime) + '</span>' +
            '<span class="title J_TimeTitle" style="font-size:16px;color:#333;margin-left:4px;">结束</span>' +
            '</li>' +
            '</ul>' +
            '<div class="pm-bid tex-center" id="J_finish_result">' +
            '<p class="pp_endstate">本标的已成交</p>' +
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
        if (data.state != 0 && data.state != 1 && data.state != 3) {
            $('.delaycount').hide()
            $('.currentrate').css({
                "font-size": "16px"
            })
            $('.currentrate').hide()
            if (data.state == 2) { //已流拍
                if (data.hasMinPrice) {
                    $('.pp_endstate').html('本标的已流拍，未达到保留价！')
                } else {
                    $('.pp_endstate').html('本标的已流拍')
                }
            } else if (data.state == 4) { //已中止
                $('.pp_endstate').html('本标的已中止')
                if (data.unnormalTime) {
                    // $('#sf-countdown .J_TimeTitle').html('中止')
                    $('#sf-countdown .time').html(util.tranferTime(data.unnormalTime, true, false))
                }
                if (data.changeReason) {
                    $('.currentrate').html('中止理由：' + data.changeReason).show()
                } else {
                    $('.currentrate').html('中止理由：无').show()
                }
            } else if (data.state == 5) { //已撤拍
                if (data.unnormalTime) {
                    $('#sf-countdown .time').html(util.tranferTime(data.unnormalTime, true, false))
                }
                $('.pp_endstate').html('本标的已撤拍')
                if (data.changeReason) {
                    $('.currentrate').html('撤拍理由：' + data.changeReason).show()
                } else {
                    $('.currentrate').html('撤拍理由：无').show()
                }
            } else if (data.state == 6) { //已暂缓
                $('.pp_endstate').html('本标的已暂缓')
                $('.currentrate').html('请等待拍卖师操作').show()
            } else if (data.state == 7) { //已暂停
                $('.now-price').removeClass('hidden');
                if (data.suspendTime) {
                    $('#sf-countdown .J_TimeTitle').html('暂停')
                    $('#sf-countdown .time').html(util.tranferTime(data.suspendTime, true, false))
                }
                $('.pp_endstate').html('本标的已暂停')
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
    $.fn.timefinish = function() {
        $('#DISPLAY_BID_PROGRESSING').show();
        //默认取tem的值为等待拍卖师操作
        var tem = '等待拍卖师操作';
        if (auction_data.status == 7) {
            window.clearTimeout(PAGE_TIMER.TIMER);
            tem = '已暂停'
        }

        if (auction_data.status == 1 && auction_data.subStatus === 0) {
            tem = '等待拍卖师操作';
        }

        if ($('#sf-countdown #status_tip').length == 0) {
            $('#sf-countdown').append('<em id="status_tip" style="display:block">' + tem + '</em>')
        }
        if (auction_data.user.isJoin) {
            $('.pay_bid').addClass('disabled').css('background', '#999')
            $('.plus').removeClass('active');
            $('.mlus').removeClass('active')
        }
    };
    $.fn.finishBidOwer = function(bidderNumber, bidCount) {
        this.find(".pm-bid").append('<p class="result">恭喜您，获得本标的。</p>');
        return this;
    };
    //竞拍结束后出局者
    $.fn.finishBidOutter = function(data) {
        this.find(".pm-bid").append('<p class="result">很遗憾，您未获得本标的。<a target="_blank" href="/pages/personal/home.html?showuse=3&lotId=' + auction_data.lotId + '" class="colorred">查看保证金</a></p>');
        var mydiv = $('<div class="my-info clearfix"></div>');
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
        var mydiv = '<p class="bidnum">您的竞买号：<span id="show_jmh">' + bidderNumber + '<em style="font-weight: bold">' + prior + '</em>' +
            '</span><em style="color:#999"> (' + bidCount + '次出价)</em> </p>'
        this.append(mydiv);
        this.width(455);
        if (auction_data.status >= 2) {
            $('.bidnum').css({
                "text-indent": "20px",
                "padding-top": "20px"
            })
        }
        return this;
    }
    $.fn.speaklogs = function(data) { //加载拍卖师发言记录
        var ul = '';
        if (data.totalCount == 0) {
            ul = '<li class="lineh22">暂无拍卖师发言</li>';
        } else {
            $.each(data.items, function(index, data) {
                var bidauction = "";
                var active = "";
                if (data.lotId) {
                    bidauction = "当前标的"
                } else {
                    bidauction = "拍卖会"
                }
                if (data.isSystem) {
                    bidauction = "系统消息"
                    active = "active"
                }
                var auctioneerlogs = '<li class="lineh22">' +
                    // '<em class="tips"></em>' +
                    '<p class="p_name"><span class="color-red ' + active + '">' + bidauction + '</span><em></em><span class="color-999">' + util.tranferTime2(data.date) + '</span></p>' +
                    '<p class="p_content">' + data.content + '</p>' +
                    '</li>'
                ul += auctioneerlogs
            })
        }
        this.html(ul)
        return this
    };
    //标的列表
    $.fn.renderItems = function(catalogs) {
        var $ul = $("<ul></ul>");
        var hasMinPrice = '';
        if (catalogs.length == 0) {
            this.html('<li>暂无信息</li>')
            return
        }
        var active = '';
        $.each(catalogs, function(index, data) {
            var name = data.name.length >= 19 ? data.name.substring(0, 17) + '..' : data.name;
            var arr = ["即将开始", "", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "已暂停"]
            if (data.id == auction_data.lotId) {
                active = 'active';
                if (catalogs.length >= 10) {
                    if (!auction_data.speed && auction_data.speed != parseInt(index / 5) * 5) {
                        auction_data.speed = parseInt(index / 5) * 5;
                    }
                } else {
                    auction_data.index = index;
                    auction_data.speed = parseInt(index / 5) * 5;
                }
            } else {
                active = ""
            }
            var li = '<li class="upcoming_list_msg ' + active + '" data-id=' + data.id + '>' + '<img  src=' + data.pic[0] + '>'
            if (data.status == 1) {
                li = li + '<span class="inside inside1">正在进行</span>'
            } else if (data.status == 0) {
                li = li + '<span class="inside inside3">即将开始</span>'
            } else if (data.status == 7) {
                li = li + '<span class="inside inside4">已暂停</span>'
            } else {
                li = li + '<span class="inside inside2">' + arr[data.status] + '</span>'
            }

            li = li + '<p class="upcoming_list_title">' + name + '</p>' + '</li>'
            var $li = $(li).clone();
            $ul.append($li)
        })
        $(this).html($ul.html());
        $('.upcoming_list_msg img').bind("error", function() {
            this.src = "/themes/images/nobanner.png";
        });
        if (!$('.J-meet-catalog').attr("style")) {
            if ($('.upcoming_list_msg').length >= 5) {
                var width = $('.J-meet-catalog li').length * ($('.J-meet-catalog li').width() + 40)
                $('.J-meet-catalog').width(width)
                if ($('.upcoming_list_msg').length > 5) {
                    $('.scroll_small').width($('.pro_upcoming_wrap').width() / $('.upcoming_list_msg').length * 5)
                }
            } else {
                $('.J-meet-catalog').width(715)
            }
            auction_data.num = $('.upcoming_list_msg').length - 5;
            auction_data.picWidth = $('.upcoming_list_msg').width() + 40;
            if ($('.upcoming_list_msg').length >= 10) {
                $('.J-meet-catalog').css({
                    "left": -auction_data.picWidth * auction_data.speed + "px"
                })
                $('.scroll_small').css({
                    "left": ($('.pro_upcoming_wrap').width() - $('.scroll_small').width()) / auction_data.num * auction_data.speed + "px"
                })
            } else {
                if ($('.upcoming_list_msg').length >= 5 && auction_data.index >= 5) {
                    var index = $('.upcoming_list_msg').length - 5;
                    $('.J-meet-catalog').css({
                        "left": -auction_data.picWidth * index + "px"
                    })
                    $('.scroll_small').css({
                        "left": ($('.pro_upcoming_wrap').width() - $('.scroll_small').width()) / auction_data.num * index + "px"
                    })
                }
            }
        }
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
        var offorPrice = $('#check_price').html()
        var jsonData = {
            lotId: auction_data.lotId,
            price: offorPrice //传递的参数
        };
        $('.pay_bid').addClass('disabled').css('background', '#999')
        $.ajax({
            url: '/personal-ws/ws/0.1/bid/lot/' + auction_data.lotId + "?time=" + (new Date().getTime()),
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            async: true,
            data: JSON.stringify(jsonData),
            success: function(data) {
                util.transformNull(data)
                $('.offerDiv').hide().closeDialog();
                if (data.status) {
                    //
                } else {
                    failtips_bidder(data.msg);
                }
                $('.pay_bid').removeClass('disabled');
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            	$('.offerDiv').hide().closeDialog();
                //此处写明出价失败的信息
            	if(XMLHttpRequest.status=="401"){
            		failtips_bidder("安全提示：您的中拍账号已在其他设备登录，如果不是您本人操作， 您的密码已经泄漏。请重新登录并进入个人中心-修改密码中进行修改。");
            	}else{
            		failtips_bidder("系统开小差啦，请重新出价！");
            	}
            }
        });
    })

    var lots_ = function(pageNum) {
        return function(pageNum) {
            var url = '/personal-ws/ws/0.1/bid/pricelog/' + auction_data.lotId + '?sortname=&sortorder=&start=' + pageNum + '&count=10' + "&time=" + (new Date().getTime())
            var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
            var auctiondata = {};
            util.getdata(newurl, "get", "json", true, false, function(data) {
                auctiondata.data = data;
                auctiondata.url = newurl;
                $('#J_RecordList tbody').morePriceLog(data);
            }, function(data) {

            });
            return pageNum;
        }
    }

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
    $('.auctionnews .dis_block_child').mouseover(function() {
        var _height = -($(this).find('.typeTips').height() + 6)
        $(this).find('.typeTips').show().css('top', _height)
        $(this).mouseout(function() {
            $(this).find('.typeTips').hide()
        })
    })
    $('.tab-menu li').click(function() {
        var ind = $(this).index();
        for (var i = 0; i < $('.tab-menu li').length; i++) {
            $('.record-list').eq(i).addClass('hidden')
            $('.tab-menu li').eq(i).removeClass('current')
        }
        $('.record-list').eq(ind).removeClass('hidden')
        $('.tab-menu li').eq(ind).addClass('current')
    });
    $('.see-record').click(function() {
            for (var i = 0; i < $('.tab-menu li').length; i++) {
                $('.record-list').eq(i).addClass('hidden');
                $('.tab-menu li').eq(i).removeClass('current');
            }
            $('.price_log').addClass('current');
            $('#RecordContent').removeClass('hidden')
            $(window).scrollTop(650)
        })
        //切换拍卖会的标的时触发
    $('.J-meet-catalog').on('click', 'li img,.upcoming_list_title', function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        auction_data.lotId = $(this).parents("li").attr("data-id");
        window.location.href = '/pages/lots/profession.html?meetId=' + auction_data.meetId + '&lotId=' + auction_data.lotId;
    });
    $('.btn-left').click(function() {
        auction_data.speed = parseInt(auction_data.speed) - 5;
        if ($('.J-meet-catalog').offset().left >= 0) {
            auction_data.speed = 0;
        }
        $('.J-meet-catalog').animate({
            "left": -auction_data.picWidth * auction_data.speed + "px"
        })
        $('.scroll_small').animate({
            "left": ($('.pro_upcoming_wrap').width() - $('.scroll_small').width()) / auction_data.num * auction_data.speed + "px"
        })
    })
    $('.btn-right').click(function() {
            if ($('.upcoming_list_msg').length > 5) {
                auction_data.speed = parseInt(auction_data.speed) + 5;
                if (auction_data.speed >= auction_data.num) { //这个4是一共的pic个数8个减去显示的4个
                    auction_data.speed = auction_data.num;
                }
                $('.J-meet-catalog').animate({
                    "left": -auction_data.picWidth * auction_data.speed + "px"
                }, "slow")
                $('.scroll_small').animate({
                    "left": ($('.pro_upcoming_wrap').width() - $('.scroll_small').width()) / auction_data.num * auction_data.speed + "px"
                }, "slow")
                if ($('.pro_upcoming_wrap').offset().left <= -(auction_data.picWidth * $('.upcoming_list_msg').length - $('.pro_upcoming_wrap').width())) {
                    $('.J-meet-catalog').animate({
                        "left": -(auction_data.picWidth * $('.upcoming_list_msg').length - $('.pro_upcoming_wrap').width()) + "px"
                    })
                    $('.scroll_small').animate({
                        "left": ($('.pro_upcoming_wrap').width() - $('.scroll_small').width()) + "px"
                    })
                }
            }
        })
        //当用户单击右上角的X号时，关闭悬浮提示弹窗
    $('.close_btn').click(function() {
        auction_data.popupCount = auction_data.popupCount + 1;
        auctionHall_controller.hidePopup();
    });
    //当用户单击暂不参拍时，关闭悬浮提示弹窗
    $('.pauseBtn').click(function() {
        auction_data.popupCount = auction_data.popupCount + 1;
        auctionHall_controller.hidePopup();
    });
    //当用户单击立即参拍时,跳转到正在进行的页面
    $('.onceBtn').click(function() {
        window.location.href = '/pages/lots/profession.html?meetId=' + auction_data.meetId + '&lotId=' + auction_data.processinglotId;
    });
})(jQuery);