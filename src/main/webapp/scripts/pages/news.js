$(function() {
    $(".J-container-title").headerStyle();
    PAGE_NEWS_CONTROLLER.newslist()
})
var PAGE_NEWS_CONTROLLER = {
    newslist: function() {
        $.ajax({
            url: "/caa-search-ws/ws/0.1/news/list?start=0&count=15" + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: true,
            success: function(data) {
                $('.newsul').temlist(data)
            },
            error: function() {

            }
        })

    }
};
(function($) {
    $.fn.temlist = function(data) {
        if (data.totalCount <= 0) {
            return
        }
        var ul = '';
        $.each(data.items, function(index, data) {
            var li = '<li>' +
                '<a href="/pages/notice/publicity_detail.html?id=' + data.id + '" target="_blank"> ' +
                '<p class="newul_text">' + data.title + '</p>' +
                '<p class="newul_time">' +
                '发布时间：<em class="add_time">' + util.tranferTime2(data.publishTime, false, true) + '</em>' +
                '</p></a>' +
                '</li>';
            ul += li;
        })
        $(".page-wrap").show().page({
            page: data.page, //第几页
            totalPages: data.totalPages, //总页数
            showNum: 5,
            change: lots_()
        });
        this.html(ul)
        return this
    }
    var lots_ = function() {
        return function(pageNum) {
            var url = "/caa-search-ws/ws/0.1/news/list?start=0&count=15";
            var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
            var auctiondata = {};
            util.getdata(newurl, "get", "json", false, false, function(data) {
                auctiondata.data = data;
                auctiondata.url = newurl;
                $('.newsul').temlist(data);
            }, function(data) {
                //TODO 异常处理
            });
            return pageNum;
        }
    };
})(jQuery)