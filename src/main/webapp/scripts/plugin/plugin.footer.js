/**
 * Created by lxj on 2017/6/19.
 */
;
$.fn.appendFooter = function() {
    var footerHTML = '<div class="judicial-school ">' +
        '<div class="container ">' +
        '<ul class="judicial-school-ul">' +
        '<h2 class="judicial-school-h2">竞买人帮助</h2>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_buy.html" target="_blank">竞拍流程</a></li>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_rule.html#b4" target="_blank">出价规则</a></li>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_rule.html#b2" target="_blank">延时规则</a></li>' +
        '</ul>' +
        '<ul class="judicial-school-ul">' +
        '<h2 class="judicial-school-h2">支付帮助</h2>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_buy.html#d3" target="_blank">如何报名交保证金</a></li>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_problem.html#e1" target="_blank">交保遇到限额</a></li>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_buy.html#d5" target="_blank">尾款如何支付</a></li>' +
        '</ul>' +
        '<ul class="judicial-school-ul">' +
        '<h2 class="judicial-school-h2">常见问题</h2>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_problem.html#e4" target="_blank">退还保证金</a></li>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_problem.html#e3" target="_blank">悔拍怎么办</a></li>' +
        '<li class="judicial-school-li"><a href="/pages/help/helpcenter_problem.html#e7" target="_blank">如何办理过户</a></li>' +
        '</ul>' +
        '<ul class="judicial-school-ul about-us">' +
        '<h2 class="judicial-school-h2">关于我们</h2>' +
        '<li class="judicial-school-li">邮编: 100015</li>' +
        '<li class="judicial-school-li">客服专线: 400-898-5988 / 010-50868263 <span></span></li>' +
        '<li class="judicial-school-li">联系地址: 北京市朝阳区酒仙桥路恒通国际商务园<span>B4号楼2层</span></li>' +
        '</ul>' +
        '<div style="clear:both; "></div>' +
        '</div>' +
        '</div>' +
        '<div class="container ">' +
        '<p class="sifa-foot-p"><span  class="sifa-foot-s">京公网安备：1101051611</span>|<span class="sifa-foot-s">备案号：京ICP备13044676号</span>|<span class="sifa-foot-s">中拍平台网络科技股份有限公司</span></p>' +
        '</div>';
    if (this.length < 0) {
        var $footer = $("<div class='sifa-foot J-sifa-foot'></div>");
        $footer.html(footerHTML);
        $("body").append($footer);
    } else {
        this.html(footerHTML);
    }
};
//添加统一的页脚
$(".J-sifa-foot").appendFooter();