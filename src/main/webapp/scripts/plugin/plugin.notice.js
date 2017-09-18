//公告列表渲染组件
;
$.fn.notice = function(option) {
    var $this = $(this), //调用该方法的jq对象
        auctionlisturl = option.url;
    var noticecontent = function(data) {
        var datalist
        if (data && data.data) {
            datalist = data.data.items;
            data = data.data;
        } else {
            datalist = data.items;
        }
        var len = datalist.length;
        var $ul = $("<ul></ul>");
        // var $li = '<li>' +
        //     '<a class="notice-left-img" href="" target="_blank">' +
        //     '<img class="itm-pic" data-original="" alt="" src="" style="display: inline;">' +
        //     '</a>' +
        //     '<div class="notice-content">' +
        //     '<h2><a href="" target="_blank" title="" class="ellipsis2"></a></h2>' +
        //     '<a href="" target="_blank" title=""></a>' +
        //     '<span class="line"></span>' +
        //     '<div class="item-descript ellipsis3"></div>' +
        //     '<p class="item-author"><a href="#void()" target="_blank" title=""></a>' +
        //     '<span class="line"></span><span class="date"></span>' +
        //     '</p>' +
        //     '</div>' +
        //     '</li>';
        var $li = '<li>' +
            '<a class="" href="/pages/notice/item.html?id=41" target="_blank">' +
            '<div class="notice-left-img">' +
            '<img class="itm-pic" data-original="" alt="" src="">' +
            '</div>' +
            '<div class="notice-content">' +
            '<h2 class="ellipsis2">这是一个网络拍的公告123</h2>' +
            '<div class="item-descript ellipsis3"></div>' +
            '<p class="item-author"><span class="company"></span><span class="line"></span><span class="date"></span></p>' +
            '</div>' +
            ' </a>' +
            '</li>';
        for (var i = 0; i < len; i++) {
            var $data = datalist[i];
            var $lichild = $($li).clone();
            var $time = $data.publishDate;
            var title = $data.name.length < 35 ? $data.name : ($data.name.substring(0, 35) + '...');
            var $p = $('<p>');
            $p.html($data.content)
            var content = $p.text().replaceSpace();
            content = content.length < 65 ? content : (content.substring(0, 65) + '...');
            // todo 企业详情跳转
            $lichild.find("a").attr("href", "/pages/notice/item.html?id=" + $data.id).end()
                .find("h2").html(title).end()
                .find(".item-descript").html(content).end()
                .find(".date").html(util.tranferTime2($time, '', 'isyear')).end()
                .find(".company").html($data.source).end()
                // .find(".item-author a").html($data.source).attr("href", "/pages/enterprises/companydetail.html?companyId=" + $data.companyId).end()
                .find(".itm-pic").attr("src", ($data.pic) ? $data.pic : '/themes/images/nopic.png');
            $ul.append($lichild);
            // $('.notice-term').on('click', '.item-descript', function() {
            //     window.open($(this).find(".notice-left-img").attr('href'));
            // })
        }
        $this.html($ul.html());

        $('.notice-left-img img').bind("error", function() {
            this.src = "/themes/images/nopic.png";
        });

        //分页点击触发的函数
        var lots_ = function() {
            return function(pageNum) {
                var url = auctionlisturl;
                var newurl = url.replace(/start\=\d+/, ("start=" + pageNum));
                var auctiondata = {};
                util.getdata(newurl, "get", "json", false, false, function(data) {
                    auctiondata.data = data;
                    auctiondata.url = newurl;
                    noticecontent(auctiondata);
                }, function(data) {
                    //TODO 异常处理
                });
                return pageNum;
            }
        };
        var totalPages = data.totalPages;
        var whichPage = data.page;
        if (totalPages > 1) {
            $this.parent().next(".page-wrap").page({
                page: whichPage,
                totalPages: totalPages,
                showNum: 10,
                change: lots_()
            });
        }
    };
    noticecontent(option.data);
}