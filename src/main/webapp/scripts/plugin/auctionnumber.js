;
//拍卖会场次按天显示
$.fn.auctionnumber = function(option) {
        var $this = $(this); //调用该方法的jq对象
        // var auctionlisturl = option.url; //
        // var n = 0; //
        // var todaynum = new Date().getDate();
        var today = Date.parse(new Date());
        var oneday = 60 * 60 * 24 * 1000;
        var _url = "/caa-search-ws/ws/0.1/auctionmeets?start=0&count=5&status=1";
        //status 1 正在进行 2 已完成的拍卖会 0即将开始 不设置就是不限
        util.getdata(_url, "get", "json", false, false, function(data) {
            AUCTIONNUMBER.nowauctionnum = data.totalCount;
        }, function(data) {
            //TODO
        });
        var appendtimecontent = function(data) {
                var $li = '<li><p class="text16-333"></p><p class="time-num text14-999"></p></li>';
                var $ul = $("<ul></ul>");
                var $lifirst = $($li).clone();
                // var $lisecond = $($li).clone();
                // var $winlocation = window.location.href;
                $lifirst.attr("data-state", "1").find("p:eq(0)").html("正在进行").end()
                    .find("p:eq(1)").html(util.transformNull(AUCTIONNUMBER.nowauctionnum) + '场');
                $ul.append($lifirst);
                var n = 0; //拍卖会场次循环
                for (var i = 0; i < 1000; i++) {
                    if (data) {
                        var $data = data[n];
                        var $lichild = $($li).clone();
                        var current = today + oneday * i;
                        var ishaveday = $data && util.tranferTime($data.date, true, true) == util.tranferTime(current, true, true) ? true : false;
                        if ($data && ishaveday) {
                            var timetxt = util.tranferTime($data.date, true, true);
                            if (i == 0) {
                                timetxt = "今天";
                            }
                            var num = typeof $data.count == "number" || typeof $data.count == "string" ? $data.count : 0;
                            $lichild.attr("data-time", $data.dateStamp).find(".text16-333").html(timetxt).end().find(".time-num").html(num + "场");
                            $ul.append($lichild);
                            n += 1;
                        } else {
                            $lichild.find(".text16-333").html(util.tranferTime(current, true, true)).end().find(".time-num").html("0场");
                            $ul.append($lichild);
                        }
                    } else {
                        var $lichild1 = $($li).clone();
                        var current1 = today + oneday * i;
                        $lichild1.find(".text16-333").html(util.tranferTime(current1, true, true)).end().find(".time-num").html("0场");
                        $ul.append($lichild1);
                    }
                }
                if (option.islistpage) {
                    $ul.find("li").addClass("liststyle");
                }
                $this.html($ul.html());
            }
            //渲染拍卖会场次
        appendtimecontent(option.data);
    }
    //渲染拍卖会列表
;
$.fn.auctionmeetlist = function(option, liststyle) {
    var $this = $(this); //调用该方法的jq对象
    var auctionlisturl;
    if (typeof option != "undefined") { auctionlisturl = option.url; } //
    else {
        $(".page-wrap").hide();
        var $div = $('<li class="no-meetlist color-999">抱歉，暂无拍卖会！</li>');
        $this.html($div);
        return;
    }
    //渲染拍卖会
    var appendauctioncontent = function(data, liststyle) {
        if (data && data.data) {
            data = data.data;
        } else if (!data) {
            return;
        }
        if (data.totalCount == 0 || data.items.length == 0) {
            $(".page-wrap").hide();
            var $div1 = $('<li class="no-meetlist color-999">抱歉，暂无拍卖会！</li>');
            $this.html($div1);
            return;
        }
        var totalPages = data.totalPages;
        //拍卖会分页点击触发的函数
        var lots_ = function(pageNum) {
            return function(pageNum) {
                var url = auctionlisturl;
                var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
                var auctiondata = {};
                util.getdata(newurl, "get", "json", false, false, function(data) {
                    auctiondata.data = data;
                    auctiondata.url = newurl;
                    appendauctioncontent(auctiondata, liststyle);
                }, function(data) {
                    //TODO 异常处理
                });
                return pageNum;
            }
        };
        if (!data) { return }
        if (typeof data != "undefined") {
            if (totalPages > 1) {
                $(".page-wrap").show().page({
                    page: data.page, //第几页
                    totalPages: totalPages, //总页数
                    showNum: 5,
                    change: lots_()
                });
            } else {
                $(".page-wrap").hide();
            }
        } else {
            return;
        }
        var len = typeof data == "object" ? data.count : 0;
        $this.parent().find(".loadingimg").remove();
        if (len == 0 && $this.parent().find(".loadingimg").size() == 0) {
            $(".page-wrap").hide();
            var $div = $('<li class="no-meetlist color-999">抱歉，暂无拍卖会！</li>');
            $this.html($div);
            return;
        }
        var $li = "";
        if (liststyle && liststyle == "liststyle") {
            //除首页外的其他页面都用此结构渲染拍卖会模块
            $li = '<li class="other-meet">' +
                '<div class="img-wrap">' +
                '<img src="/themes/images/meeting.jpg" alt="" />' +
                '<div class="other-wrap">' +
                '</div>' +
                '</div>' +
                '<div class="meeting-info">' +
                '<p class="text16-333  ellipsis titlep meetingtitle">上海安吉机动车拍卖有限公司</p>' +
                '<p class="text12-999 ellipsis">送拍机构：<span class="companyname" style="color:#333"></span></p>' +
                '<p class="text12-999 ellipsis">拍卖类型：<span class="meeting-type meeting-list-type"></span></p>' +
                '<p class="text12-999 ellipsis">围观次数：<span class="meetingcount meeting-list-type"></span></p>' +
                '<p class="text16-333 time-background"><span class="meettime"></span><span class="meetstate back-red"></span></p></div>' +
                '<div class="meet-btn"><a target="_blank" class="meeting-btn lotlist">标的目录</a><a target="_blank" class="meeting-btn go-meeting back-red">拍卖大厅</a></div>' +
                '</li>';
        } else {
            $li = '<li class="index-meet">' +
                '<div class="img-wrap"><img src="/themes/images/meeting.jpg" alt="">' +
                '<div class="other-wrap"><p class="meeting-type">同步拍</p><p class="meetingcount">123次围观</p></div>' +
                '</div>' +
                '<div class="meeting-info">' +
                '<p class="text18-333 meetingtitle ellipsis">xxx拍卖</p>' +
                '<p class="text12-999 ellipsis p1" style="line-height:55px;">送拍机构：<span class="companyname"></span></p>' +
                '<p class="text16-333 p2"><img src="/themes/images/clock.png"><span class="meettime"></span><span class="meetstate back-red"></span></p>' +
                '<div class="meet-btn"><a target="_blank" class="meeting-btn lotlist">标的目录</a><a target="_blank" class="meeting-btn go-meeting back-red">拍卖大厅</a></div></div>' +
                // '</a>' +
                '</li>';
        }
        var $ul = $("<ul></ul>");
        var auctionlistarr = data.items;
        var auclen = auctionlistarr.length;
        for (var i = 0; i < auclen; i++) {
            var $data = data["items"][i];
            if (typeof $data == "undefined") {
                return;
            }
            var $lichild = $($li).clone();
            // var num = typeof $data.count == "number" || typeof $data.count == "string" ? $data.count : 0;
            var wgnum = util.transformNull($data.outLookerCount || $data.onLookerCount || 0);
            // var statearr = ["即将开始", "正在进行", "已结束", "已撤拍"]; // TODO 撤拍改为驳回
            // var titlecolor = ["text16-333", "text16-red", "text16-333", "text16-333"];
            var modetxt = ["同步拍", "网络拍"][$data["mode"]];
            var meetstate = $data.status;
            // var meetstatetxt = (!meetstate && typeof meetstate == "object") ? "" : statearr[meetstate];
            var collectxt = $data["like"] > 0 ? "is-collect" : "no-collect";
            var companyname = typeof $data["companyName"] != "object" ? $data["companyName"] : "";
            // var cuctionName = $data["name"];
            var lotNum = $data.lotNum > 0 ? $data.lotNum : "";
            var like = $data.like ? "is-collect" : "no-collect";
            var active = ($data.type == 0) ? 'active' : '';
            $lichild.attr("id", $data.id).addClass(active)
                .find(".collect-icon").attr("data-id", $data.id).addClass(like).end()
                .find(".lotlist").attr("href", "/pages/meeting/conference.html?id=" + $data.id).end()
                .find(".go-meeting").attr("href", "/pages/lots/profession.html?meetId=" + $data.id).end()
                .find(".img-wrap img").attr("src", $data.pic ? $data.pic : '/themes/images/nomeet.png').end()
                .find(".meetingtitle").html($data.name).end()
                .find('.meetingcount').html(wgnum + '次围观').end()
                .find(".onlooker .text").html(wgnum).end()
                // .find(".meetstate").html(meetstatetxt).addClass(titlecolor[meetstate]).end()
                .find(".collect-icon").attr("class", "collect-icon " + collectxt).end()
                .find(".companyname").html(companyname).end()
                .find(".meettime").html(util.tranferTime($data.start, true, '', true) + '开始').end()
                .find(".lotNum").html(lotNum + "个").end()

            .find(".meeting-type").html(util.transformNull(modetxt));

            if (meetstate == 1 || meetstate == 7) {
                $lichild.find(".meetstate").html('正在进行');
            } else {
                if (meetstate == 0) {
                    $lichild.find(".meettime").html('预计' + util.tranferTime($data.start, true, '', true) + '开始').end()
                } else {
                    var timetext = ($data.endTime) ? util.tranferTime($data.endTime, true, '', true) + '结束' : '';
                    $lichild.find(".meettime").html(timetext);
                }
                $lichild.find(".meetstate").remove().end()
                    .find(".go-meeting").remove();
            }
            $ul.append($lichild);
        }
        $this.empty().html($ul.html());
        $('.img-wrap img').bind("error", function() {
            this.src = "/themes/images/nomeet.png";
            $(this).addClass('auc-noimg');
        });
        $('.is-collect').hover(function() {
            $this.prev().html("取消收藏<em class='triangle'></em>").css('display', 'inline-block');
        }, function() {
            $this.prev().hide();
        });
    };
    appendauctioncontent(option.data, liststyle)
};
AUCTIONNUMBER = {
    islogined: user.islogin(),
    nowauctionnum: 0, //正在进行的拍卖会场次
    fnstore: function(id, $this) {
        if (!id) { return }
        util.getdata("/personal-ws/ws/0.1/attention/meet/" + id, "get", "json", false, false, function(data) {
            if (data) {
                $this.removeClass("no-collect").addClass("is-collect").prev().html("收藏成功<em class='triangle'></em>").css('display', 'inline-block');
                setTimeout(function() {
                    $this.prev().hide();
                }, 1000)
            }
        }, function(data) {});
    },
    //事件只在初始化时绑定一次
    init: function($dom) {
        //$dom 传 所有需要绑定事件的jq对象 {starmove:".meeting-ul li",star:".collect-icon",timeselect:".time-left,.time-right,.time-content li"}
        $(document).on("mouseenter mouseleave mousemove", $dom.starmove, function(e) {
            if (!e) { e = window.event };
            var $this = $(this);
            if (e.type == "mouseenter") {
                $this.addClass("enterstyle");
            } else if (e.type == "mouseleave") {
                $this.removeClass("enterstyle");
            } else {
                var $start = $(e.target);
                if ($start.hasClass('collect-icon')) {
                    if ($start.hasClass('is-collect')) {
                        $start.prev(".collect-title").html("取消收藏<em class='triangle'></em>").css('display', 'inline-block');
                    } else {
                        $start.prev(".collect-title").html("点击收藏<em class='triangle'></em>").css('display', 'inline-block');
                    }
                } else {
                    $(".collect-title").hide();
                }
            }
        })
        $(document).on("click", $dom.star, function(e) {
            if (!e) { e = window.event };
            var $this = $(this);
            var $id = $this.data("id"); //获取拍卖会id
            var winlocation = window.location.href;
            //{"id": 0,"petId": 0,"quantity": 0,"shipDate": "2017-06-05T02:16:37.630Z","status": "placed","complete": true}
            if (AUCTIONNUMBER.islogined) {
                if ($this.hasClass("no-collect")) {
                    AUCTIONNUMBER.fnstore($id, $this);
                } else {
                    util.getdata("/personal-ws/ws/0.1/cancel/attention/meet/" + $id, "get", "json", false, false, function(data) {
                        if (data) {
                            $this.removeClass("is-collect").addClass("no-collect").prev().html("取消收藏<em class='triangle'></em>").css('display', 'inline-block');
                            setTimeout(function() {
                                $this.prev().hide()
                            }, 1000)
                        }
                    }, function(data) {
                        var info = JSON.parse(data.responseText);
                        if (info.error == '未登录') {
                            window.location.href = "/pages/user/login.html?redirect=" + winlocation;
                        }
                    });
                }
            } else {
                window.location.href = "/pages/user/login.html?redirect=" + winlocation;
            }
        });
        //点击拍卖会时间选择场次
        var n = 0;
        $(document).on("click", $dom.timeselect, function(e) {
            if (!e) { e = window.event }
            var $thisbtn = $(this);
            var time = $thisbtn.data("time");
            var state = $thisbtn.data("state");
            var urlstrings = "";
            var $ul;
            var liststyle = $thisbtn.hasClass("liststyle") ? "liststyle" : "";
            $thisbtn.siblings().removeClass("active").end().addClass("active");
            $(".auction-type .active").each(function(i) {
                if (typeof $(this).data("status") != "undefined") {
                    urlstrings += ("&status=" + $(this).data("status"));
                } else if (typeof $(this).data("attribute") == "string" || typeof $(this).data("attribute") == "number") {
                    urlstrings += ("&attribute=" + $(this).data("attribute"));
                } else if (typeof $(this).data("mode") == "string" || typeof $(this).data("mode") == "number") {
                    urlstrings += ("&type=" + $(this).data("type") + "&mode=" + $(this).data("mode"));
                }
            })
            if ($thisbtn.hasClass("time-right")) {
                e.preventDefault();
                $(".time-left").addClass("hover-red");
                n -= 1;
                $ul = $(".time-content");
                // var len = $ul.find("li").size();
                var $width = n * 7 * $ul.find("li").outerWidth();
                $ul.stop().animate({ "left": $width + "px" }, 1000);
            } else if ($thisbtn.hasClass("time-left")) {
                e.preventDefault();
                $ul = $(".time-content");
                // var len = $ul.find("li").size();
                n += 1;
                n = n > 0 ? 0 : n;
                if (n == 0) {
                    $thisbtn.removeClass("hover-red");
                } else {
                    $thisbtn.addClass("hover-red");
                }
                var $width1 = n * 7 * $ul.find("li").outerWidth();
                $ul.stop().animate({ "left": $width1 + "px" }, 1000);
            } else if (time != "undefined" || $thisbtn.attr("data-state") != "undefined") {

                if (typeof time != "undefined") {
                    time = (time + ' 00:00:00').replace(/-/g, "/");
                    time = time ? new Date(time).getTime() : '';
                    urlstrings += "&date=" + time;
                } else if (typeof state == "string" || typeof state == "number") {
                    urlstrings += "&status=" + state;
                } else {
                    $('.meeting-ul').html('<li class="no-meetlist color-999">抱歉，暂无拍卖会！</li>');
                    $(".page-wrap").hide();
                    return;
                }
                //$("#auctionlist").auctionmeetlist(getdata);
                AUCTIONNUMBER.createMeetinglist(urlstrings, $(".meeting-ul"), $thisbtn, liststyle);
            }
        })
    },
    //渲染拍卖会场次列表
    createMeetinglist: function(urlsting, $container, $this, liststyle) {
        var countnum;
        if (!liststyle) {
            //首页要调的接口类型 liststyle 为真时 是非首页的页面
            countnum = 5
        } else {
            countnum = 10
        }
        var getdata = {};
        if (urlsting.indexOf('caa-search-ws') == -1) {
            getdata.url = "/caa-search-ws/ws/0.1/auctionmeets?start=0&count=" + countnum + urlsting;
        } else {
            getdata.url = urlsting + '&count=' + countnum;
        }

        //status 1 正在进行 2 已完成的拍卖会 0即将开始 不设置就是不限
        util.getdata(getdata.url, "get", "json", false, false, function(data) {
            getdata.data = data;
        }, function(data) {
            //TODO
        });
        $container.auctionmeetlist(getdata, liststyle);
        //}
    },
    //收藏功能模块
    auctionstore: function() {
        // var that = this;
        //未登录点击收藏 登录界面登录回来 当初点击的拍卖会自动收藏
        var auctionid = util.getQueryString("auctionid");
        this.fnstore(auctionid, $("[data-id='" + auctionid + "']"));
    }
}

//初始化 完成所有jq对象事件委托
AUCTIONNUMBER.init({ starmove: ".meeting-ul li", star: ".collect-icon", timeselect: ".time-left,.time-right,.time-content li" });