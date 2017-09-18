$(function() {
    $(".J-container-title").headerStyle();
    PAGE_NOTICE_CONTROLLER.init();

    $('.search-form').submit(function() {
        PAGE_NOTICE_DATA.name = encodeURI($('.search-input').val());
        PAGE_NOTICE_CONTROLLER.init();
        return false;
    })
})
var PAGE_NOTICE_DATA = {
    name: util.getQueryString('name') || ''
};
if (PAGE_NOTICE_DATA.name.indexOf(encodeURI('搜索公告')) > -1) {
    PAGE_NOTICE_DATA.name = '';
}
var PAGE_NOTICE_CONTROLLER = {
    init: function() {
        $('.page-wrap .pagination').remove()
        var url = '/caa-search-ws/ws/0.1/notices?start=0&count=10';
        if (PAGE_NOTICE_DATA.name) {
            url = '/caa-search-ws/ws/0.1/notices/list?start=0&count=10&name=' + PAGE_NOTICE_DATA.name;
        }
        util.getdata(url, "get", "json", true, false, function(data) {
            if (data.totalCount == 0 || data.items.length == 0) {
                $('.no-notice').show();
                $('.notice-term').html('');
                return;
            }
            $('.no-notice').hide();
            var auctionnumberdata = {};
            auctionnumberdata.data = data;
            auctionnumberdata.url = url;
            $(".notice-term").notice(auctionnumberdata);
        }, function(data) {
            $('.no-notice').show();
            $('.notice-term').html('');
        });
    }
};