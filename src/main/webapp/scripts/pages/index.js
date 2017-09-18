$(function() {
    $(".J-container-title").headerStyle();
    PAGE_INDEX_CONTROLLER.init();
})

var PAGE_INDEX_DATA = {
    $circle: '',
    $banner: ''
};

var PAGE_INDEX_CONTROLLER = {
    init: function() {
        PAGE_INDEX_CONTROLLER.advertising();
        PAGE_INDEX_CONTROLLER.type();
        PAGE_INDEX_CONTROLLER.location();
        PAGE_INDEX_CONTROLLER.meet();
        PAGE_INDEX_CONTROLLER.today();
        PAGE_INDEX_CONTROLLER.recent();
        PAGE_INDEX_CONTROLLER.company();
        PAGE_INDEX_CONTROLLER.notice();
        PAGE_INDEX_CONTROLLER.news();
    },
    advertising: function() {
        util.getdata("/caa-web-ws/ws/0.1/web/advs/images?belong=2", "get", "json", false, true, function(data) {
            $(".J-banner").pushAdvertising(data);
        });
    },
    type: function() {
        util.getdata('/personal-ws/ws/0.1/auction/lots/type', 'get', 'json', false, true, function(data) {
            $('.J-type-list').pushType(data);
        });
    },
    location: function() {
        util.getdata('/caa-web-ws/ws/0.1/authorize/provinces', 'get', 'json', false, true, function(data) {
            $('.J-location-list').pushLocation(data);
        });
    },
    meet: function() {
        AUCTIONNUMBER.createMeetinglist("", $('.meeting-ul'));
        var auctionnumberdata = {};
        util.getdata("/caa-search-ws/ws/0.1/auctionmeet/count", "get", "json", false, false, function(data) {
            auctionnumberdata.data = data;
            auctionnumberdata.url = "/caa-search-ws/ws/0.1/auctionmeet/count";
        });
        $(".J-time-content").auctionnumber(auctionnumberdata);
    },
    today: function() {
        util.getdata('/caa-search-ws/ws/0.1/lots/today?count=8&scope=1', 'get', 'json', false, true, function(data) {
            if (data.length == 0) {
                $(".J-auction-today").hide();
            } else {
                $(".J-today-list").lot({
                    data: data
                });
            }
        });
    },
    recent: function() {
        util.getdata("/caa-search-ws/ws/0.1/lots/recent?count=8&scope=1", "get", "json", false, true, function(data) {
            if (data.length == 0) {
                $(".J-next-preview").hide();
            } else {
                $(".J-recent-list").lot({
                    data: data
                });
                var time = new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
                $('.J-next-preview .main-tit').attr('href', '/pages/lots/list.html?startTimeStamp=' + time);
            }
        });
    },
    company: function() {
        // util.getdata("/caa-search-ws/ws/0.1/companies?count=16", "get", "json", false, true, function(data) {
        var data = [
            { "id": 12630, "name": "山东齐鲁瑞丰拍卖有限公司" },
            { "id": 13663, "name": "齐齐哈尔鑫鼎拍卖有限责任公司" },
            { "id": 16896, "name": "宁夏嘉德拍卖行（有限公司）" },
            { "id": 14488, "name": "金诺国际拍卖有限公司" },
            { "id": 12997, "name": "江苏广聚源拍卖有限公司" },
            { "id": 15873, "name": "济宁天和拍卖有限公司" },
            { "id": 13208, "name": "吉林省金石拍卖有限责任公司" },
            { "id": 14548, "name": "黑龙江信达拍卖有限责任公司" },
            { "id": 12615, "name": "黑龙江农垦北大荒佳兴拍卖有限公司" },
            { "id": 14685, "name": "河北价信拍卖有限责任公司" },
            { "id": 13753, "name": "河北华信拍卖有限公司" },
            { "id": 13367, "name": "海南冠亚拍卖有限公司" },
            { "id": 12875, "name": "赣州市拍卖行" },
            { "id": 15520, "name": "佛山市公联拍卖有限公司" },
            { "id": 12974, "name": "北京嘉禾国际拍卖有限公司" },
            { "id": 13019, "name": "安徽盘龙企业拍卖集团有限公司" }
        ];
        $(".J-enterprises-wrap").pushCompany(data);
    },
    notice: function() {
        util.getdata('/caa-search-ws/ws/0.1/notices?start=0&count=5', 'get', 'json', false, true, function(data) {
            $(".J-notice-auction").pushNotice(data);
        });

    },
    news: function() {
        util.getdata('/caa-search-ws/ws/0.1/news/index?count=5', 'get', 'json', false, true, function(data) {
            $(".J-news-auction").pushNews(data);
        });
    }
};

(function($) {
    $.fn.pushAdvertising = function(data) {
        if (data.totalCount == 0) {
            return false;
        }
        $('.J-banner-img').html('');
        $.each(data.items, function(id, item) {
            if (id > 4) return false;
            if (item.imgUrl) {
                var link = '',
                    ac = '';
                if (item.link.indexOf('http') == '-1') {
                    link = 'http://' + item.link;
                } else {
                    link = item.link;
                }
                if (id == 0) {
                    ac = 'active';
                }
                $('.J-banner-img').append('<div class="banner-list ' + ac + '">' +
                    '<a href="' + link + '" target="_blank">' +
                    '<img src="' + item.imgUrl + '" alt="' + item.remark + '">' + //javascript:this.src="images/nobanner.png"
                    '</a>' +
                    '</div>');
            }
        });

        $('.main-banner img').bind("error", function() {
            this.src = "/themes/images/nobanner.png";
        });

        if (data.items.length == 1) {
            $('.J-circle').html('<li class="active"></li>');
        } else if (data.items.length > 5) {
            $('.J-circle').html('<li class="active"></li><li></li><li></li><li></li><li></li>');
        } else {
            var li = '';
            for (var i = 0; i < data.items.length; i++) {
                if (i == 0) {
                    li += '<li class="active">';
                } else {
                    li += '<li></li>';
                }
            }
            $('.circle').html(li);
        }

        var deleft = $('.J-circle').width() / 2;
        $('.J-circle').css('margin-left', -deleft);
        PAGE_INDEX_DATA.$circle = $('.J-banner>.circle>li');
        PAGE_INDEX_DATA.$banner = $('.J-banner>.J-banner-img>.banner-list');
        reset();
    };
    $.fn.pushType = function(data) {
        var typestr = '';
        $.each(data, function(id, item) {
            if (id < 9) {
                var isred = 'hover-red';
                if (item.weight == 1 || item.weight == '1') {
                    isred = 'red';
                }
                if (item.standardName.length > 4) {
                    item.standardName = item.standardName.substring(0, 4) + '...';
                }
                typestr += '<li><a href="/pages/lots/list.html?standardType=' + item.standardNum + '" class="' + isred + '">' + item.standardName + '</a></li>';
            }
        });
        this.html(typestr);
        return this;
    };
    $.fn.pushLocation = function(data) {
        var locstr = '';
        $.each(data, function(id, item) {
            if (id < 32) {
                var isred = 'hover-red';
                if (item.level == 1 || item.level == '1') {
                    isred = 'red';
                }
                locstr += '<li><a href="/pages/lots/list.html?province=' + item.id + '" class="' + isred + '">' + item.shortName + '</a></li>';
            }
        });
        this.html(locstr);
        return this;
    };
    $.fn.pushCompany = function(data) {
        if (data.length == 0) {
            $(".J-enterprises-wrap").hide();
            return;
        }
        var temp = '';
        $.each(data, function(id, item) {
                // var logo = item.logoPath ? item.logoPath : '/themes/images/nocompany.png';
                // var isactive = id <= 3 ? "color-red" : "";
                temp += '<li class="enterprises-li">' +
                    '<a href="/pages/enterprises/companydetail.html?companyId=' + item.id + '" target="_blank">' +
                    // '<div class="enterprises-img">' +
                    // '<img src="' + logo + '">'+
                    // '</div>' +
                    '<div class="enterprises-info"><p class="enterprises-name ellipsis">' + item.name + '</p>' +
                    // '<p class="enterprises-num">' + item.meetCount + '场</p>'+
                    '</div>' +
                    '</a>' +
                    '</li>';

            })
            // });
        $('.J-enterprises-list').html(temp);
        $('.enterprises-img img').bind("error", function() {
            this.src = "/themes/images/nocompany.png";
        });
        return this;
    };
    $.fn.pushNotice = function(data) {
        if (data.totalCount == 0) {
            this.hide();
            return;
        }
        var temp = '';
        $.each(data.items, function(id, item) {
            temp += '<li>' +
                '<p class="notice-content ellipsis mb8"><a class="f14" href="/pages/notice/item.html?id=' + item.id + '" target="_blank">' + item.name + '</a></p>' +
                '<p class="notice-other"><a class="notice-other-a hover-red" href="/pages/enterprises/companydetail.html?companyId=' + item.companyId + '" target="_blank">' + item.source + '</a>' + util.tranferTime2(item.publishDate, '', 'isyear') + '</p>' +
                '</li>';
        })
        this.find("ul").html(temp);
        return this;
    };
    $.fn.pushNews = function(data) {
        if (data.totalCount == 0) {
            this.hide();
            return;
        }
        var temp = '';
        $.each(data, function(id, item) {
            temp += '<li>' +
                '<p class="notice-content ellipsis mb8"><a class="f14" href="/pages/notice/publicity_detail.html?id=' + item.id + '" target="_blank">' + item.title + '</a></p>' +
                '<p class="notice-other"><a class="notice-other-a hover-red" href="/pages/notice/publicity_detail.html?id=' + item.id + '" target="_blank">' + item.publisher + '</a>' + util.tranferTime2(item.publishTime, '', 'isyear') + '</p>' +
                '</li>';
        })
        this.find("ul").html(temp);
        return this;
    };

    function reset() {
        var index = 0,

            timerId;
        $('.J-banner').hover(function() {
            $('.J-tab-btn').css('display', 'block');
        }, function() {
            $('.J-tab-btn').css('display', 'none');
        });
        var lunbo = function() {
            index++;
            if (index == PAGE_INDEX_DATA.$banner.length) {
                index = 0;
            }
            PAGE_INDEX_DATA.$banner.removeClass('active').eq(index).addClass('active');
            PAGE_INDEX_DATA.$circle.removeClass('active').eq(index).addClass('active');

        };
        timerId = setInterval(lunbo, 3000);
        PAGE_INDEX_DATA.$circle.each(function(i) {
            $(this).data('index', i);
        });
        PAGE_INDEX_DATA.$circle.hover(function() {
            clearInterval(timerId);
            PAGE_INDEX_DATA.$circle.removeClass('active');
            $(this).addClass('active');
            var i = $(this).data('index');
            index = i;
            PAGE_INDEX_DATA.$banner.removeClass('active').eq(index).addClass('active');
        }, function() {
            clearInterval(timerId);
            timerId = setInterval(lunbo, 3000);
        });

        $('.to-left').click(function() {
            clearInterval(timerId);
            index--;
            if (index == -1) {
                index = PAGE_INDEX_DATA.$banner.length - 1;
            }
            PAGE_INDEX_DATA.$banner.removeClass('active').eq(index).addClass('active');
            PAGE_INDEX_DATA.$circle.removeClass('active').eq(index).addClass('active');
            timerId = setInterval(lunbo, 3000);
        });
        $('.J-to-right').click(function() {
            clearInterval(timerId);
            index++;
            if (index == PAGE_INDEX_DATA.$banner.length) {
                index = 0;
            }
            PAGE_INDEX_DATA.$banner.removeClass('active').eq(index).addClass('active');
            PAGE_INDEX_DATA.$circle.removeClass('active').eq(index).addClass('active');
            timerId = setInterval(lunbo, 3000);
        });
    }
})(jQuery);