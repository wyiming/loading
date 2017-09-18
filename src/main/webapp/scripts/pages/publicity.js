$(function() {
    $(".J-container-title").headerStyle();
    var setheight = $(window).height() - $('.sifa-head').outerHeight(true) - $('.J-sifa-foot').outerHeight(true) - 80;
    $('.inform.notice .container').css('min-height', setheight);
    //通知公告
    function page(pages, totalPages) {
        $(".page-wrap").page({
            page: pages, //第几页
            totalPages: totalPages, //总页数
            showNum: 3,
            change: function(data) {
                getinform(data);
            }
        });
    }

    function getinform(dNum) {
        var num = 0;
        if (dNum) {
            num = dNum - 1;
        }
        $.ajax({
            url: '/caa-web-ws/ws/0.1/web/sys/notices?start=' + num + '&count=10&sortname=id&sortorder=desc' + "&time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: true,
            success: function(data) {
                var noticelist = '';
                $.each(data.items, function(id, item) {
                    var time = new Date(parseInt(item.publishTime));
                    noticelist += '<li>' +
                        '<a href="/pages/notice/publicity_detail.html?publicityId=' + item.id + '" target="_blank" >' + item.noticeTitle + '</a></br>' +
                        '<span>' + (time.getFullYear()) + "-" + (time.getMonth() + 1) + "-" + (time.getDate()) + "   " + (time.getHours()) + ":" + (time.getMinutes()) + ":" + (time.getSeconds()) + '</p>' +
                        '</li>';
                });
                $('.newsul').html(noticelist);
                page(data.page, data.totalPages);
            }
        });
    }
    getinform(1);
});