var meetId = util.getQueryString("id");
$(document).ready(function() {
    PAGE_LOT_CONTROLLER.init();
});
var PAGE_LOT_CONTROLLER = {
    //分页点击触发的函数
    auctionlist: { url: "/caa-search-ws/ws/0.1/lots/sort?start=0&count=8&meetId=" + meetId },
    lots_: function(pagenum) {
        var url = PAGE_LOT_CONTROLLER.auctionlist.url;
        var newurl = url.replace(/start\=\d+/, ("start=" + pagenum));
        util.getdata(newurl, "get", "json", false, false, function(data) {
            var auctionnumberdata = {};
            auctionnumberdata.data = data;
            auctionnumberdata.url = newurl;
            PAGE_LOT_CONTROLLER.page(data.page, data.totalPages, data);
            $('.auction-list-wrap').lot({
                data: data.items
            })
        }, function(data) {

        });
    },
    page: function(pages, totalPages, data) {
        if (totalPages > 1) {
            $(".page-wrap").page({
                page: pages, //第几页
                totalPages: totalPages, //总页数
                showNum: 5,
                change: function(data) {
                    PAGE_LOT_CONTROLLER.lots_(data);
                }
            });
        }
    },
    init: function() {
        var that = this;
        util.getdata("/caa-search-ws/ws/0.1/notice?meetId=" + meetId, "get", "json", false, false, function(data) {
            $('.notice-title').html(data.name);
            $('.items-notice').append(data.content);
        });

        util.getdata("/personal-ws/ws/0.1/onlook/meet/" + meetId, 'get', 'json', true, false, function() {});
        $.ajax({
            url: PAGE_LOT_CONTROLLER.auctionlist.url + "&time=" + (new Date().getTime()),
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
                    that.page(data.page, data.totalPages, data);
                    $(".filter-fixed .count").html(data.totalCount);
                }

                $('.auction-list-wrap').lot({
                    data: data.items
                })

            }
        });
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
    }
}