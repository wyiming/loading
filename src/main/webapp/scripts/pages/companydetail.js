$(document).ready(function() {
    PAGE_ENTERPRISEDETAIL_CONTROLLER.init();

    $(".J-container-title").headerStyle();
    $(document).on("click", ".J-show-all", function() {
        $('.company-intro').removeClass("ellipsis5").html(PAGE_ENTERPRISEDETAIL_CONTROLLER._introduce);
    })
    $('.company_nav').on('click', '.dis_block_child', function() {
        $(this).addClass('current').siblings().removeClass('current');
        var indx = $(this).data('index');
        if (indx == 0) {
            $('.company_auctionmeeting_list').show();
            $('.notice-wrap').hide();
        } else {
            $('.company_auctionmeeting_list').hide();
            $('.notice-wrap').show();

            util.getdata("/caa-search-ws/ws/0.1/notices?start=0&count=10&companyId=" + PAGE_COMPANY_DATA.companyId, "get", "json", false, false, function(data) {
                if (data.items.length == 0) {
                    $(".notice-term").html('<div class="no-noticelist color-999"">抱歉，暂无公告！</div>');
                } else {
                    var auctionnumberdata = {};
                    auctionnumberdata.data = data;
                    auctionnumberdata.url = "/caa-search-ws/ws/0.1/notices?start=0&count=10&companyId=" + PAGE_COMPANY_DATA.companyId;
                    $(".notice-term").notice(auctionnumberdata);
                }
            }, function(data) {
                $(".notice-term").html('<div class="no-noticelist color-999">抱歉，暂无公告！</div>');
            });
        }
    })
});

var PAGE_COMPANY_DATA = {
    companyId: util.getQueryString('companyId')
};

//页面控制器，负责与后台交互，获取数据
var PAGE_ENTERPRISEDETAIL_CONTROLLER = {
    init: function() {
        util.getdata('/caa-search-ws/ws/0.1/company/' + PAGE_COMPANY_DATA.companyId, 'get', 'json', false, true, function(data) {
            $(".companylogo").companyinfo(data);
        });
        PAGE_ENTERPRISEDETAIL_CONTROLLER.meetlist();
    },
    meetlist: function() {
        AUCTIONNUMBER.createMeetinglist('/caa-search-ws/ws/0.1/auctionmeets/company?start=0' + '&companyId=' + PAGE_COMPANY_DATA.companyId, $(".company-meetlist"), $(".time-content .active"), "liststyle");
        //添加收藏,取消拍卖会功能
        AUCTIONNUMBER.auctionstore();
    }

};

//渲染服务
;
(function($) {
    $.fn.companyinfo = function(items) {
        this.find('.company-logo').attr('src', items.logoPath);
        this.find('.company-name').html(items.name);
        this.find('.company-city').html(items.cityName);
        this.find('.company-tel').html(items.tel);
        this.find('.company-time').html(util.tranferTime(items.addDate, '', 'ishour'));
        this.find('.company-success').html(items.doneLotCount);
        this.find('.company-lot').html(items.allLotCount);
        this.find('.company-meet').html(items.allMeetCount);
        var _introduce = items.introduce;
        PAGE_ENTERPRISEDETAIL_CONTROLLER._introduce = items.introduce;
        if (_introduce && _introduce.length > 322) {
            var _introduce_cont = _introduce.substring(0, 322);
            this.find('.company-intro').html(_introduce_cont + "..." + "<span class='J-show-all red cursor'>查看全部</span>");
        } else {
            this.find('.company-intro').html(_introduce);
        }
        $('.meet-count').html(items.meetCount);
        $('.notice-count').html(items.noticeCount);
        $(document).attr("title", items.name + '_中拍平台');

        this.find('.company-logo').bind("error", function() {
            this.src = "/themes/images/nocompany.png";
        });
    };

})(jQuery);