var loading = {
    init: function() {
        //根据windows.path获取加载的JS，开发版本使用debug
        //如果是debug版本的，只加载源文件，如果是release版本的，记载压缩后的文件
        var reqjs = _resource.page[window.location.pathname];
        if (!reqjs) {
            reqjs = _resource.page['/index.html'];
        }
        var debugjs = true;
        if (_resource.edition == 'release' && location.href.indexOf("&debugjs") < 0) {
            debugjs = false;
        }
        if (debugjs) {
            loading._load('', reqjs, debugjs);
        } else {
            for (var i = 0; i < reqjs.length; i++) {
                if (_resource.res[reqjs[i]]) {
                    loading._load('', '/proxy/static/js/' + _resource.res[reqjs[i]]);
                } else {
                    loading._load('', reqjs[i]);
                }
            }
        }
    },

    _load: function(path, file, debugjs) {
        var files = typeof file == "string" ? [file] : file;
        for (var i = 0; i < files.length; i++) {
            var name = files[i].replace(/^\s|\s$/g, "");
            var att = name.split('.');
            var ext = att[att.length - 1].toLowerCase();
            var isCSS = ext == "css";
            var tag = isCSS ? "link" : "script";
            var attr = isCSS ? " type='text/css' rel='stylesheet' " : " type='text/javascript' ";
            if (debugjs) {
                name = name + "?" + new Date().getTime();
            }
            var link = (isCSS ? "href" : "src") + "='" + path + name + "'";
            document.write("<" + tag + attr + link + "></" + tag + ">");
        }
    }
};

var _resource = {
    page: {
        '/pages/enterprises/list.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/companylist.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/enterprises/companydetail.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/auctionnumber.js',
            '/scripts/plugin/plugin.notice.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/pages/companydetail.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/help/helpcenter_index.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/help.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/help/helpcenter_rule.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/help.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/help/helpcenter_buy.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/help.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/help/helpcenter_explain.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/help.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/help/helpcenter_problem.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/help.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/personal/property.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/lots/item.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/cometd/jquery.json-2.2.js',
            '/scripts/cometd/cometd.js',
            '/scripts/cometd/AckExtension.js',
            '/scripts/cometd/jquery.cometd.js',
            '/scripts/cometd/ReloadExtension.js',
            '/scripts/cometd/jquery.cometd-reload.js',
            '/scripts/plugin/plugin.countdown.js',
            '/scripts/global/connection.js',
            '/scripts/pages/focuspic.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/extra/jwplayer.min.js',
            '/scripts/pages/item.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/lots/profession.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/cometd/jquery.json-2.2.js',
            '/scripts/cometd/cometd.js',
            '/scripts/cometd/jquery.cometd.js',
            '/scripts/cometd/AckExtension.js',
            '/scripts/extra/jquery/jquery.cometd-ack.js',
            '/scripts/cometd/ReloadExtension.js',
            '/scripts/cometd/jquery.cometd-reload.js',
            '/scripts/plugin/plugin.countdown.js',
            '/scripts/global/connection.js',
            '/scripts/pages/focuspic.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/extra/jwplayer.min.js',
            '/scripts/pages/profession.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/lots/orderBid.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/cometd/jquery.json-2.2.js',
            '/scripts/cometd/cometd.js',
            '/scripts/cometd/AckExtension.js',
            '/scripts/cometd/jquery.cometd.js',
            '/scripts/cometd/ReloadExtension.js',
            '/scripts/cometd/jquery.cometd-reload.js',
            '/scripts/plugin/plugin.countdown.js',
            '/scripts/global/connection.js',
            '/scripts/pages/focuspic.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/extra/jwplayer.min.js',
            '/scripts/pages/orderBid.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/lots/list.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.lazyload.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/plugin.lot.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/plugin/doubleDate.js',
            '/scripts/pages/lotslist.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/meeting/conference.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.lazyload.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/plugin.lot.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/cometd/jquery.json-2.2.js',
            '/scripts/cometd/cometd.js',
            '/scripts/cometd/AckExtension.js',
            '/scripts/cometd/jquery.cometd.js',
            '/scripts/cometd/ReloadExtension.js',
            '/scripts/cometd/jquery.cometd-reload.js',
            '/scripts/global/connection.js',
            '/scripts/plugin/auctionnumber.js',
            '/scripts/pages/conference.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/meeting/detail.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.lazyload.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/focuspic.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/meeting/hall.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/cometd/jquery.json-2.2.js',
            '/scripts/cometd/cometd.js',
            '/scripts/cometd/AckExtension.js',
            '/scripts/cometd/jquery.cometd.js',
            '/scripts/cometd/ReloadExtension.js',
            '/scripts/cometd/jquery.cometd-reload.js',
            '/scripts/plugin/plugin.countdown.js',
            '/scripts/global/connection.js',
            '/scripts/pages/focuspic.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/pages/auctionhall.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/meeting/list.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/doubleDate.js',
            '/scripts/pages/focuspic.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/plugin/auctionnumber.js',
            '/scripts/pages/auction_list.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/notice/list.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/plugin/plugin.notice.js',
            '/scripts/pages/noticelist.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/notice/item.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/plugin/auctionnumber.js',
            '/scripts/pages/noticedetail.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/notice/publicity.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/pages/news.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/notice/publicity_detail.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/pages/news_detail.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/pay/apply.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/extra/jquery.json-2.2.min.js',
            '/scripts/pages/apply.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/pay/payment.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/extra/jquery.json-2.2.min.js',
            '/scripts/pages/payment.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/personal/home.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/extra/jquery.form.min.js',
            '/scripts/plugin/portal.js',
            '/scripts/extra/jquery.md5.min.js',
            '/scripts/pages/personhome.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/personal/personalassets.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/extra/jquery.form.min.js',
            '/scripts/plugin/portal.js',
            '/scripts/pages/personalassets.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/user/login.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/extra/jquery.md5.min.js',
            '/scripts/pages/login.js',
            '/scripts/plugin/plugin.footer.js'
        ],
        '/pages/user/register.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/extra/jquery.md5.min.js',
            '/scripts/pages/register.js'
        ],
        '/pages/user/forget_pass.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/extra/jquery.md5.min.js',
            '/scripts/pages/register.js'
        ],
        '/index.html': [
            '/scripts/extra/jquery-1.9.1.min.js',
            '/scripts/extra/jquery.cookie.min.js',
            '/scripts/global/global.js',
            '/scripts/global/user.js',
            '/scripts/plugin/plugin.page.js',
            '/scripts/plugin/plugin.lot.js',
            '/scripts/plugin/auctionnumber.js',
            '/scripts/plugin/proxy.lot.js',
            '/scripts/pages/index.js',
            '/scripts/plugin/plugin.footer.js'
        ]
    },
    res: {},
    edition: 'release', //可以为dev or release
    buildTime: '|now|',
    testurl: 'http://test.caa123.org.cn', //测试网址
    officialurl: 'http://paimai.caa123.org.cn', //正式网址
    sfurl: 'http://sf.caa123.org.cn', //导航中司法拍卖的网址
    istest: 'false' //true为测试版false为正式版
}

//|file_res|

loading.init();