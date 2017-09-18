$(function() {
    $(".J-container-title").headerStyle();
    PAGE_NEWS_CONTROLLER.newsdetail();
    PAGE_NEWS_CONTROLLER.readnum();
})
var PAGE_NEWS_DATA = {
    id: util.getQueryString("id")
}
var PAGE_NEWS_CONTROLLER = {
    newsdetail: function() {
        util.getdata("/caa-search-ws/ws/0.1/news/detail?id=" + PAGE_NEWS_DATA.id, 'get', 'json', true, false, function(data) {
            $('.inform-content').temdetail(data)
        });
    },
    readnum: function() {
        util.getdata("/caa-ngoc-ws/ws/0.1/oc/news/readAmount?id=" + PAGE_NEWS_DATA.id, 'get', 'json', true, false, function() {});
    }
};
(function($) {
    $.fn.temdetail = function(data) {
        $('.news_title_small').html(data.title);
        $('.inform-content h1').html(data.title);
        $('.add_time').html(util.tranferTime2(data.publishTime, false, true));
        $('.add_person').html(data.publisher);
        $('.inform-content-detail').html(data.content);
        if (data.source) {
            $('.news_source').html(data.source);
        } else {
            $('.news_source').parents('p').hide()
        }
        if (data.readAmount) {
            $('.news_looker').html(data.readAmount);
        } else {
            $('.news_looker').parents('p').hide()
        }
        return this
    }

})(jQuery)