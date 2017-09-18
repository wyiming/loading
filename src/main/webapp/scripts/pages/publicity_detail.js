$(function() {
    $(".J-container-title").headerStyle();
    var setheight = $(window).height() - $('.sifa-head').outerHeight(true) - $('.J-sifa-foot').outerHeight(true);
    $('.inform-detail').css('min-height', setheight);
    var infoId = util.getQueryString('publicityId');
    var $noticeBox = $('.noticeDetail');
    $.ajax({
        url: '/caa-web-ws/ws/0.1/web/sys/notice/' + infoId + "?time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        cache: false,
        async: true,
        success: function(data) {
            $noticeBox.find('h3').html(data.noticeTitle);
            var time = new Date(parseInt(data.publishTime));
            $noticeBox.find('h4').html('公告时间：' + (time.getFullYear()) + "/" + (time.getMonth() + 1) + "/" + (time.getDate()) + "   " + (time.getHours()) + ":" + (time.getMinutes()));
            $noticeBox.find('.inform-content').html(data.noticeContent);
            var enc = '';
            if (data.enclosures) {
                $.each(data.enclosures, function(id, item) {
                    enc += '<li>附件：<a href="/caa-web-ws/ws/0.1/web/enclosure/download/' + item.id + '" target="_blank">' + item.name + '</a></li>';
                });
            }
            $noticeBox.find('.list').html(enc);
        },
        error: function(xhr) {
            $noticeBox.html('加载错误!!去公告页查看更多');
        }
    });
});