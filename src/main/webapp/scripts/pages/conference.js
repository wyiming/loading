//保存拍卖会相关的可变的数据  注意：竞价阶梯、起拍价都是可变的。
$(function() {
    PAGE_CONFERENCE_CONTROLLER.init();
    $(".J-container-title").headerStyle();
})
var PAGE_CONFERENCE_DATA = {
    current_price: 0, //当前价格
    available_price: 0, //可以出的最低价
    status: '即将开始', //拍卖状态
    meetId: util.getQueryString("id") || ''
};
//页面控制器，负责与后台交互
var PAGE_CONFERENCE_CONTROLLER = {
    lots_: function(pagenum) {
        var url = "/caa-search-ws/ws/0.1/lots/sort?start=0&count=8&meetId=" + PAGE_CONFERENCE_DATA.meetId;
        var newurl = url.replace(/start\=\d+/, ("start=" + pagenum));
        util.getdata(newurl, "get", "json", false, false, function(data) {
            var auctionnumberdata = {};
            auctionnumberdata.data = data;
            auctionnumberdata.url = newurl;
            if (data.totalPages > 1) {
                $(".page-wrap").page({
                    page: data.page, //第几页
                    totalPages: data.totalPages, //总页数
                    showNum: 5,
                    change: function(data) {
                        PAGE_CONFERENCE_CONTROLLER.lots_(data);
                    }
                });
            }
            $('.auction-list-wrap').lot({
                data: data.items
            })
        }, function(data) {

        });
    },
    notice: function() {
        var that = this;
        util.getdata("/caa-search-ws/ws/0.1/notice?meetId=" + PAGE_CONFERENCE_DATA.meetId, "get", "json", false, false, function(data) {
            $('.notice-title').html(data.name);
            $('.items-notice').append(data.content);
        });

        util.getdata("/personal-ws/ws/0.1/onlook/meet/" + PAGE_CONFERENCE_DATA.meetId, 'get', 'json', true, false, function() {});
        $.ajax({
            url: "/caa-search-ws/ws/0.1/lots/sort?start=0&count=8&meetId=" + PAGE_CONFERENCE_DATA.meetId + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            contentType: "application/json;charset=UTF-8",
            cache: false,
            async: true,
            success: function(data) {
                if (data == null || data.totalCount == 0) {
                    $('.lot-list').hide();
                    $('.lot-empty').show();
                    $(".filter-fixed .count").html('0');
                } else {
                    $('.lot-list').show();
                    $('.lot-empty').hide();
                    if (data.totalPages > 1) {
                        $(".page-wrap").page({
                            page: data.page, //第几页
                            totalPages: data.totalPages, //总页数
                            showNum: 5,
                            change: function(data) {
                                PAGE_CONFERENCE_CONTROLLER.lots_(data);
                            }
                        });
                    }
                    $(".filter-fixed .count").html(data.totalCount);
                }

                $('.auction-list-wrap').lot({
                    data: data.items
                })

            }
        })
    },


    init: function() {
        //获取页面id
        var getdata = { url: "/caa-search-ws/ws/0.1/auctionmeet/" + PAGE_CONFERENCE_DATA.meetId };
        //拍卖会详情页
        util.getdata(getdata.url, "get", "json", false, false, function(data) {
            getdata.data = data;
        }, function(data) {
            if (data.error) {
                window.location.href = '/404.html'
            }
        });
        //渲染拍卖会内容
        $("body").pushAuctionmeet(getdata.data);

        $('.banners-img img').bind("error", function() {
            this.src = "/themes/images/nomeet.png";
        });

        var auctioner = { url: "/caa-search-ws/ws/0.1/auctioneer?meetId=" + PAGE_CONFERENCE_DATA.meetId };
        util.getdata(auctioner.url, "get", "json", false, false, function(data) {
            auctioner.data = data;
        }, function(data) {

        });
        //渲染拍卖师内容
        $("body").pushAuctioner(auctioner.data);
        PAGE_CONFERENCE_CONTROLLER.notice();
    }
};
(function($) {
    //渲染拍卖会基本信息 标的名称、开拍时间等
    $.fn.pushAuctionmeet = function(data) {
        var meetStatus = ["", "预计"]
        var startarr = ["开始", "结束"]
        var modearr = ["同步拍", "网络拍"]; // 0 是顺序拍
        var cname = (data.type == 1) ? 'back-org' : 'type-sign';
        var _timeType, _start, _meetTime;
        _timeType = meetStatus[data.type];
        if (!data.endTime) {
            data.endTime = ""
        }
        if (data.type == 0) { //顺序拍
            _start = startarr[0]
            if (data.status <= 1) {
                _meetTime = data.start
            } else {
                _meetTime = data.endTime
                _start = startarr[1]
            }
        } else {
            _meetTime = data.start
            _start = startarr[1]
            if (data.status >= 1) {
                _meetTime = data.endTime
            } else {
                _start = startarr[0]
            }
        }
        if (data.status >= 2) {
            _start = startarr[1]
        }
        this.find(".bidder_enter a").attr("href", "/pages/lots/profession.html?meetId=" + data.id).end()
            .find(".type-comm").html(modearr[data.type]).addClass(cname).end()
            .find(".auction-bidder-name").html(data.name).end()
            .find(".companyName").html(data.companyName).end()
            .find(".tel").html(data.tel).end()
            .find(".start").html(util.tranferTime(_meetTime, true, '', true) + _start).end()
            .find(".banners-img img").attr("src", data.pic ? data.pic : "/themes/images/nomeet.png").end()
            .find('.nav-name').html(data.companyName).attr("href", "/pages/enterprises/companydetail.html?companyId=" + data.companyId).end()
            .find('.meet-title').html(data.name).end()
            .find('.lot_num').html(data.lotNum).end()
            .find('.apply_num').html(data.signInCount).end()
            .find('.onlooker_num').html(data.onLookerCount).end()
            .find('.focus-list-three p.label').html(_timeType);
        $(document).attr("title", data.name + '_中拍平台');
        if (data.status == 1) {
            this.find(".bidder_enter").show().click(function() {
                //window.location.href = $(this).find('a').attr('href');
            });
        } else {
            this.find(".bidder_enter").hide();
            $('.other-focus-list').css('height', '268px');
            $('.change-height').css('padding-top', '30px');
            $('.other-focus .start').css('line-height', '85px')
        }
        if (data.status == '0') {
            this.find('.start').html(_timeType + util.tranferTime(_meetTime, true, '', true) + "开始")
        }
        if (data.status == '1' && data.type == '1') {
            this.find('.start').addClass('ing').html(_timeType + util.tranferTime(_meetTime, true, '', true) + "结束")
        }
        if (_meetTime == "") {
            $('.other-focus .start').css('visibility', 'hidden')
        }
    };
    //渲染拍卖师信息
    $.fn.pushAuctioner = function(data) {
        this.find(".auction-pic img").attr("src", data.photo).end()
            .find(".auctioneer-name").html(data.name).end()
            .find(".auctioneer-number em").html(data.idcard).end()
            .find(".auctioneer-card img").attr("src", data.idCardPhoto)
    };

    $(".auctioneer-profession").click(function() {
        var index = $(this).index()
        for (var i = 0; i < $(".auctioneer-profession").length; i++) {
            $('.auctioneer-photo-msg').removeClass('display_block')
            $(".auctioneer-profession").removeClass('auctioneers-active')
        }
        $(this).addClass('auctioneers-active')
        $('.auctioneer-photo-msg').eq(index).addClass('display_block')
    })
    $('.auction-affiche').click(function() {
        var index = $(this).index()
        for (var i = 0; i < $('.auction-affiche').length; i++) {
            $('.auction-affiche').removeClass('auctioneers-active')
        }
        if (index == 0) {
            $('.page-wrap').show()
            $('.auction-list-wrap').show()
            $('.items-notice').hide()
        } else {
            $('.page-wrap').hide();
            $('.auction-list-wrap').hide()
            $('.items-notice').show()
        }
        $(this).addClass('auctioneers-active')
    })
})(jQuery);