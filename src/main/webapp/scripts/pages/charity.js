$(function() {
    $(".J-container-title").headerStyle();
    $('.back-top').remove();

    PAGE_CHARITY_CONTROLLER.init();

})
var charity_data = {
    meetId: util.getQueryString("id") || '' //获取标的ID
}
var PAGE_CHARITY_CONTROLLER = {
    init: function() {
        jwplayer('lotVideo').setup({
            flashplayer: '/scripts/extra/jwplayer.flash.swf',
            file: '/pages/charity/images/video.flv'
        });

        util.getdata('/caa-search-ws/ws/0.1/lots/sort?start=0&count=30&meetId=' + charity_data.meetId, 'get', 'json', false, true, function(data) {
            if (data.items.length <= 0) {
                $('.page6').hide();
                return;
            }
            $(".page6 ul").lots(data.items);
        });

    }
};

//渲染服务
(function($) {
    $.fn.lots = function(items) {
        var str = '';
        $.each(items, function(id, item) {
            str += '<li class="lots-list">' +
                '<a href="/pages/lots/profession.html?meetId=' + item.meetId + '&lotId=' + item.id + '" target="_blank">' +
                '<img class="img-100 lot-img" src="' + item.pic[0] + '" alt="">' +
                '<h3 class="lots-title">' + item.name + '</h3>' +
                '<div class="lots-price">' +
                '<span>¥' + item.startPrice + '</span>起拍价' +
                '</div>' +
                '</a>' +
                '</li>';
        })
        this.html(str);
        $('.lot-img').bind("error", function() {
            this.src = "/themes/images/nopic.png";
        });
        return this;
    };

    var pagerese = function() {
        var wh = $(window).height(), //974
            head = $('.sifa-head').outerHeight(true),
            logo = $('.logo1').outerHeight(true),
            title = $('.title').outerHeight(true),
            person = $('.person').outerHeight(true);

        if (wh > 974) {
            wh = 974
        }
        var h = wh - head;
        if (wh - head - logo - title - person <= 100) {
            h = logo + title + person + 100;
        }
        $('.page1').css({
            'height': h + 'px'
        })
    };

    pagerese();
    $(window).resize(function() {
        pagerese();
        setvideo();
    })

    function setvideo() {
        var page2 = $('.page2').outerHeight(true),
            page2text = $('.page2-text').outerHeight(true),
            videow = $('#lotVideo').outerWidth(true);
        var seth = videow / 4 * 2.5;
        $('#lotVideo').css({
            'height': seth + 'px',
            'margin-top': (page2 - page2text - seth) / 5 * 4 + 'px'
        }).show();

        $('#lotVideo_wrapper').css({
            width: '100%'
        })
    }

    setTimeout(function() {
        setvideo()
    }, 0)

    setTimeout(function() {
        setvideo()
    }, 1000)

    $('.page5 a').attr('href', '/pages/meeting/conference.html?id=' + charity_data.meetId);

})(jQuery);