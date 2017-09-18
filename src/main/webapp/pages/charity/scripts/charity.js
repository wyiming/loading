$(function() {
    $(".J-container-title").headerStyle();
    $('.back-top').remove();

    charity_data.theplayer = jwplayer('lotVideo').setup({
        flashplayer: '/pages/charity/scripts/jwplayer.flash.swf',
        file: '/pages/charity/images/video.flv'
    });

    PAGE_CHARITY_CONTROLLER.init();

})
var charity_data = {
    meetId: util.getQueryString("id") || '',
    start: 0,
    theplayer: ""
}
var PAGE_CHARITY_CONTROLLER = {
    init: function() {

        util.getdata('/caa-search-ws/ws/0.1/lots/sort?start=' + charity_data.start + '&count=10&meetId=' + charity_data.meetId, 'get', 'json', false, true, function(data) {
            if (data.items.length <= 0) {
                $('.page6').hide();
                return;
            }
            $(".page6 ul").lots(data.items);
            if (charity_data.start + 1 < data.totalPages) {
                charity_data.start = data.page;
                PAGE_CHARITY_CONTROLLER.init();
            }
        });
        if (_resource.istest == 'true') {
            $('.customer').show();
            $('.page1').on('click', '.customer-img', function() {
                $('.customer-tel').toggle();
            })
        }
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
        this.append(str);
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
    pagerese()
    setTimeout(function() {
        pagerese()
    }, 0)
    $(window).resize(function() {
        pagerese();
        setvideo();
    })

    function setvideo() {
        var page2 = $('.page2').outerHeight(true),
            page2text = $('.page2-text').outerHeight(true),
            videow = $('#lotVideo').outerWidth(true),
            vimg = $('.page2-right').outerWidth(true)
        var seth = videow / 1.85;

        $('.page2-right').css({
            'height': vimg / 2.3 + 'px',
        })

        $('.page2-other').css({
            'height': page2 - page2text + 'px',
        })

        $('#lotVideo_wrapper').css({
            'height': seth + 'px'
        })

        $('#lotVideo').css({
            'height': seth + 'px'
        }).show();
    };
    setTimeout(function() {
        setvideo()
    }, 0)

    $('.video-img').click(function() {
        $(this).hide();
        $('.video-wrap').show();
        setvideo();
        if (charity_data.theplayer.getState() != 'PLAYING') {
            charity_data.theplayer.play(true);
            this.value = '暂停';
        } else {
            charity_data.theplayer.play(false);
            this.value = '播放';
        }
    })

    $('.page5 a').attr('href', '/pages/meeting/conference.html?id=' + charity_data.meetId);
})(jQuery);