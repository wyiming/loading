var myauction = {};
myauction.proxyhtml = '<li><a href="javascript:void(0)"><div class="img-wrap"><img src="/themes/images/meeting.jpg" alt=""><div class="other-wrap">' +
    '<p class="meeting-type">同步拍+顺序排</p><p class="meetingtitle">拍卖title</p></div>' +
    '<div class="collect"><span class="collect-title text12-333">关注<em class="triangle"></em></span><span class="collect-icon is-collect"></span></div>' +
    '</div><div class="meeting-info"><p class="text14-999">' +
    '当前状态：<span class="text16-333">已结束</span></p><p class="text14-999">主拍机构：<span class="text16-333">上海安吉机动车拍卖有限公司</span>' +
    '</p><p class="text14-999">开拍时间：<span class="text16-333">4月15日 13：30</span></p><p class="text14-999">标的数量：<span class="text16-333">5个</span>' +
    '</p><p class="text14-999 onlooker"><span class="">3423</span>次围观</p><div class="go-meeting back-red">进入拍卖会</div></div></a></li>';
//contentbox 为放内容的 ul data 为 返回的 数组对象
myauction.build_proxy = function(contentbox, data) {
    var $ul = $("<ul></ul>");
    var len = data.length;
    //给li添加信息
    var addlidata = function(li, lidata) {
        li.find("a").attr("href", "/pages/lots/item.html?lotId=" + lidata.id).end()
            .find("img").attr("src", lidata.imgsrc)
            .end().find(".meeting-info").find("p span").eq(0).html(lidata.state)
            .end().eq(1).html(lidata.name)
            .end().eq(2).html(lidata.time)
            .end().eq(3).html(lidata.num)
            .end().eq(4).html(lidata.total);
        $ul.append(li);
    }
    for (var i = 0; i < len; i++) {
        addlidata($(this.proxyhtml).clone(), data[i]);
    }
    //用创建的$ul 替换 contentbox
    contentbox.replaceWith($ul)
};
//此组件 $(this) 指的是 li 父级 ul 最好是用id获取ul
$.fn.proxy = function(options) {
    var self = $(this);
    self.html("");
    if (options.data) {
        myauction.build_proxy(self, options.data);
    } else {
        $.ajax({
            type: 'GET',
            url: options.url + "?time=" + (new Date().getTime()),
            dataType: "json",
            cache: false,
            async: true,
            success: function(data) {
                myauction.build_proxy(self, data.items);
                if (jQuery.isFunction(options.success)) {
                    options.success(data);
                }
            }
        });
    }
};