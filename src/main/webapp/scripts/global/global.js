(function($) {
    function browsersupport() {
        var $browser = $('<div>').addClass('browser');
        var $diolag = $('<div>').addClass('browser-diolag');
        var $browsercontent = $('<div>').addClass('browser-content');
        var $browsertext = $('<div>').addClass('browser-text');

        var $text1 = $('<h3>').addClass('not-allowed').html('您的浏览器暂不支持本网站');
        var $text2 = $('<p>').addClass('recommed').html('推荐您使用以下浏览器进行竞拍：');
        var $text3 = $('<p>').addClass('allowed').html('Chrome；360安全浏览器；IE8；IE9；IE11；UC浏览器； 搜狗浏览器；Firefox；Microsoft Edge；Safari');
        var $text4 = $('<input>').addClass('btn-cancel').attr({ 'type': 'button' }).val('关闭网站');

        $browsertext.append($text1);
        $browsertext.append($text2);
        $browsertext.append($text3);
        $browsertext.append($text4);

        $browsercontent.append($browsertext);

        $browser.append($diolag);
        $browser.append($browsercontent);

        $(document.body).append($browser);
        $text4.click(function() {
            closeWindows();
        })
    }

    function closeWindows() {
        var userAgent = navigator.userAgent;
        if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") != -1) {
            window.location.href = "about:blank";
        } else {
            window.opener = null;
            window.open("", "_self");
            window.close();
        }
    }
    BrowserType();

    function BrowserType() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
        if (isIE) {
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseFloat(RegExp["$1"]);
            if (fIEVersion < 8) {
                browsersupport()
                return
            } else {
                return
            }
        }
        if (userAgent.indexOf("Chrome") < -1) {
            browsersupport()
            return
        }
        if (userAgent.indexOf("Firefox") < -1) {
            browsersupport()
            return
        }
        if (userAgent.indexOf("Edge") < -1) {
            browsersupport()
            return
        }
        if (userAgent.indexOf("Safari") < -1) {
            browsersupport()
            return
        }
    }

    var doc = document,
        inputs = $('.search-input'),
        supportPlaceholder = 'placeholder' in doc.createElement('input'),

        placeholder = function(input) {
            var text = input.getAttribute('placeholder'),
                defaultValue = input.defaultValue;
            if (defaultValue == '') {
                input.value = text
            }
            input.onfocus = function() {
                if (input.value === text) {
                    this.value = ''
                }
            };
            input.onblur = function() {
                if (input.value === '') {
                    this.value = text
                }
            }
        };

    if (!supportPlaceholder) {
        for (var i = 0, len = inputs.length; i < len; i++) {
            var input = inputs[i],
                text = input.getAttribute('placeholder');
            if (input.type === 'text' && text) {
                placeholder(input)
            }
        }
    }

    $.cookie_userinfo = function(sucFun, errorFun) {
        $.ajax({
            type: 'GET',
            url: "/caa-personal-ws/ws/0.1/login/mine" + "?time=" + (new Date().getTime()),
            dataType: "json",
            cache: false,
            async: true,
            success: function(data) {
                if (data && data.userId) {
                    $.cookie('GLOBAL_ME_ID', data.userId, { path: '/' });
                    $.cookie('GLOBAL_ME_NICKNAME', data.userName, { path: '/' });
                    $.cookie('GLOBAL_ME_TYPE', data.userType, { path: '/' });
                }
                if ($.isFunction(sucFun)) {
                    sucFun(data);
                }
            },
            error: function(data) {
                if ($.isFunction(errorFun)) {
                    errorFun(data);
                }
            }
        });
    }

    $.remove_userinfo = function() {
        $.removeCookie('GLOBAL_ME_ID', { path: '/' });
        $.removeCookie('GLOBAL_ME_NICKNAME', { path: '/' });
        $.removeCookie('GLOBAL_ME_TYPE', { path: '/' });
    }
    $.logout = function(sucFun) {
        $.ajax({
            type: 'GET',
            url: "/caa-personal-ws/ws/0.1/logout" + "?time=" + (new Date().getTime()),
            dataType: "json",
            cache: false,
            async: true,
            success: function(data) {
                $.remove_userinfo();
                window.location.href = '/pages/user/login.html?redirect=' + window.location.href;
            },
            error: function(data) {
                $.remove_userinfo();
                window.location.href = '/pages/user/login.html?redirect=' + window.location.href;
            }
        });
    }
    $.loadMailNum = function(userId) {
        $.ajax({
            type: 'GET',
            url: "/personal-ws/ws/0.1/inmail/num?state=0" + "&time=" + (new Date().getTime()),
            dataType: "json",
            async: true,
            cache: false,
            success: function(data) {
                if (data == 0) {
                    $('.mailNum').html('');
                } else {
                    $('.mailNum').html(data).css('padding', '0px 3px 2px');
                }
            },
            error: function() {}
        });
    }
    $.changeMailState = function(userId) {
        $.ajax({
            type: 'get',
            url: "/personal-ws/ws/0.1/change/inmail/state" + "?time=" + (new Date().getTime()),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            async: true,
            success: function(data) {
                $('.mailNum').html('');
            },
            error: function() {}
        });
    }
})(jQuery);
//公用方法存放地址
util = {
    setlogo: function() {
        if (_resource.istest == 'true') {
            //测试版
            $('.main-nav li .nav-sifa').hide();
            $('.caa-logo').attr('src', '/themes/images/testlogo.png');
            $('.caa-red-logo').attr('src', '/themes/images/logo-redtest.png');

            $('.shop-test').attr('href', _resource.officialurl);
            $('.shop-official').attr('href', _resource.testurl + '/shop');
        } else {
            //正式版
            $('.main-nav li .nav-sifa').attr('href', _resource.sfurl).css('display', 'inline-block');
            $('.caa-logo').attr('src', '/themes/images/headbanner.png');
            $('.caa-red-logo').attr('src', '/themes/images/logo-red.png');

            $('.shop-test').attr('href', _resource.testurl);
            $('.shop-official').attr('href', _resource.officialurl + '/shop');
        }
    },
    getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return (r[2]);
        return null;
    },
    IsPC: function() {
        var userAgentInfo = navigator.userAgent;
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
        }
        return flag;
    },
    getvalue: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return (r[2]);
        return null;
    },
    getIdFromUrl: function() {
        var href = window.location.toString();
        var startIndex = href.lastIndexOf('/');
        var uri = href.substring(startIndex + 1);
        var endIndex = uri.lastIndexOf('.html');
        if (endIndex > 0) {
            var str = uri.substring(0, endIndex);
            if (str != null) {
                return str;
            }
        } else {
            return uri;
        }
        return null;
    },
    getdata: function(url, get, json, cache, async, success, error) {
        var symbol = '&';
        if (url.indexOf('?') == -1) {
            symbol = '?';
        }
        $.ajax({
            url: url + symbol + 'time=' + new Date().getTime(),
            type: get,
            dataType: json,
            cache: cache,
            async: async,
            success: success,
            error: error
        });
    },
    /** 
     * 将数值四舍五入(保留2位小数)后格式化成金额形式 
     * 
     * @param num 数值(Number或者String) 
     * @return 金额格式的字符串,如'1,234,567.45' 
     * @type String 
     */
    formatCurrency: function(num) {
        if (num == '0') {
            return '0'
        }
        if (num == '' || num == null || num == undefined) {
            return '';
        }
        num = num.toString().replace(/\$|\,/g, '');
        var sign = (num == (num = Math.abs(num)));
        num = Math.floor(num * 100 + 0.50000000001);
        num = (Math.floor(num) / 100).toString();
        //将数字格式化输出
        var splitNum = num.split(".");
        var _length = splitNum[0].length;
        var _index = splitNum[0].length % 3;
        var _num = '';
        while (_length > 0) {
            if (_length % 3 > 0) {
                _num += splitNum[0].substring(0, _index) + ',';
                _length -= _index;
            } else {
                _num += splitNum[0].substring(_index, _index + 3) + ',';
                _length -= 3;
                _index = _index + 3;
            }
        }
        num = _num.substring(0, _num.length - 1);
        num = num + (isNaN(splitNum[1]) ? "" : "." + splitNum[1]);
        return (((sign) ? '' : '-') + num);
    },
    formatNum: function(num) {
        num = num.toString().replace(/\$|\,/g, '');
        return num;
    },
    changeMoneyToChinese: function(money) {
        if (money == '0') {
            return '零元整';
        }
        var cnNums = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); //汉字的数字
        var cnIntRadice = new Array("", "拾", "佰", "仟"); //基本单位
        var cnIntUnits = new Array("", "万", "亿", "兆"); //对应整数部分扩展单位
        var cnDecUnits = new Array("角", "分", "毫", "厘"); //对应小数部分单位
        var cnInteger = "整"; //整数金额时后面跟的字符
        var cnIntLast = "元"; //整型完以后的单位
        var maxNum = 999999999999999.9999; //最大处理的数字

        var IntegerNum; //金额整数部分
        var DecimalNum; //金额小数部分
        var ChineseStr = ""; //输出的中文金额字符串
        var parts; //分离金额后用的数组，预定义

        if (money == "") {
            return "";
        }

        money = parseFloat(money);
        //alert(money);
        if (money >= maxNum) {
            //	$.alert('超出最大处理数字');
            return "";
        }
        if (money == 0) {
            ChineseStr = cnNums[0] + cnIntLast + cnInteger;
            //document.getElementById("show").value=ChineseStr;
            return ChineseStr;
        }
        money = money.toString(); //转换为字符串
        if (money.indexOf(".") == -1) {
            IntegerNum = money;
            DecimalNum = '';
        } else {
            parts = money.split(".");
            IntegerNum = parts[0];
            DecimalNum = parts[1].substr(0, 4);
        }
        if (parseInt(IntegerNum, 10) > 0) { //获取整型部分转换
            var zeroCount = 0;
            var IntLen = IntegerNum.length;
            for (var i = 0; i < IntLen; i++) {
                var n = IntegerNum.substr(i, 1);
                var p = IntLen - i - 1;
                var q = p / 4;
                var m = p % 4;
                if (n == "0") {
                    zeroCount++;
                } else {
                    if (zeroCount > 0) {
                        ChineseStr += cnNums[0];
                    }
                    zeroCount = 0; //归零
                    ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
                }
                if (m == 0 && zeroCount < 4) {
                    ChineseStr += cnIntUnits[q];
                }
            }
            ChineseStr += cnIntLast;
            //整型部分处理完毕
        }
        if (DecimalNum != '') { //小数部分
            var decLen = DecimalNum.length;
            for (i = 0; i < decLen; i++) {
                n = DecimalNum.substr(i, 1);
                if (n != '0') {
                    ChineseStr += cnNums[Number(n)] + cnDecUnits[i];
                }
            }
        }
        if (ChineseStr == '') {
            ChineseStr += cnNums[0] + cnIntLast + cnInteger;
        } else if (DecimalNum == '') {
            ChineseStr += cnInteger;
        }
        return ChineseStr;
    },
    //x年x月x日 12:00:00
    tranferTime: function(t, isyear, ishour, issecond) { //isyear ishour 为真时 不显示 年 不显示 小时
        var time = parseInt(t);
        var trans = new Date(time);
        var yeartxt = !isyear ? trans.getFullYear() + "年" : "";
        var hourtxt = !ishour ? ("0000" + trans.getHours()).substring(("0000" + trans.getHours()).length - 2) + ":" +
            ("0000" + trans.getMinutes()).substring(("0000" + trans.getMinutes()).length - 2) : "";
        hourtxt += (!issecond && !ishour) ? (":" + ("0000" + trans.getSeconds()).substring(("0000" + trans.getSeconds()).length - 2)) : "";
        var result = yeartxt +
            ("0000" + (trans.getMonth() + 1)).substring(("0000" + (trans.getMonth() + 1)).length - 2) + "月" +
            ("0000" + trans.getDate()).substring(("0000" + trans.getDate()).length - 2) + "日" + " &nbsp;" + hourtxt;
        return result;
    },
    //2017-10-25
    tranferTime2: function(t, isyear, ishour, issecond) { //isyear ishour 为真时 不显示 年 不显示 小时
        if (!t) {
            return "";
        }
        var time = parseInt(t);
        var trans = new Date(time);
        var yeartxt = !isyear ? trans.getFullYear() + "-" : "";
        var hourtxt = !ishour ? ("0000" + trans.getHours()).substring(("0000" + trans.getHours()).length - 2) + ":" +
            ("0000" + trans.getMinutes()).substring(("0000" + trans.getMinutes()).length - 2) : "";

        hourtxt += issecond ? ":" + ("0000" + trans.getSeconds()).substring(("0000" + trans.getSeconds()).length - 2) : '';

        var result = yeartxt +
            ("0000" + (trans.getMonth() + 1)).substring(("0000" + (trans.getMonth() + 1)).length - 2) + "-" +
            ("0000" + trans.getDate()).substring(("0000" + trans.getDate()).length - 2) + " " + hourtxt;
        return result;
    },
    tranferTime3: function(t, ishour, issecond) { //isyear ishour 格式为 5小时5分 12秒
        if (!t) {
            return "";
        }
        var time = parseInt(t);
        var trans = new Date(time);
        var hourtxt = trans.getHours() + "小时" +
            ("0000" + trans.getMinutes()).substring(("0000" + trans.getMinutes()).length - 2) + "分";
        var Secondstxt = ("0000" + trans.getSeconds()).substring(("0000" + trans.getSeconds()).length - 2);
        var result = ishour ? hourtxt : "";
        result = issecond ? Secondstxt + "秒" : result;
        return result;
    },
    tranferTime4: function(second_time) {
        var time = parseInt(second_time) + "秒";
        if (parseInt(second_time) > 60) {

            var second = parseInt(second_time) % 60;
            var min = parseInt(second_time / 60);
            time = min + "分" + second + "秒";

            if (min > 60) {
                min = parseInt(second_time / 60) % 60;
                var hour = parseInt(parseInt(second_time / 60) / 60);
                time = hour + "小时" + min + "分" + second + "秒";

                if (hour > 24) {
                    hour = parseInt(parseInt(second_time / 60) / 60) % 24;
                    var day = parseInt(parseInt(parseInt(second_time / 60) / 60) / 24);
                    time = day + "天" + hour + "小时" + min + "分" + second + "秒";
                }
            }
        }
        return time;
    },
    //x年x月x日 12:00
    tranferTime5: function(t, isyear, ishour, issecond) { //isyear ishour 为真时 不显示 年 不显示 小时
        var time = parseInt(t);
        var trans = new Date(time);
        var yeartxt = !isyear ? trans.getFullYear() + "年" : "";
        var hourtxt = !ishour ? ("0000" + trans.getHours()).substring(("0000" + trans.getHours()).length - 2) + ":" +
            ("0000" + trans.getMinutes()).substring(("0000" + trans.getMinutes()).length - 2) : "";
        var result = yeartxt +
            ("0000" + (trans.getMonth() + 1)).substring(("0000" + (trans.getMonth() + 1)).length - 2) + "月" +
            ("0000" + trans.getDate()).substring(("0000" + trans.getDate()).length - 2) + "日" + " &nbsp;" + hourtxt;
        return result;
    },
    //将对象中的null或undefined值置为空
    changeToEmpty: function(data, returntext) {
        if (data) {
            if ('string' != typeof data) {
                $.each(data, function(i, item) {
                    if (item == null || item == undefined || item == 'null' || item == 'undefined') {
                        item = returntext ? returntext : '';
                        data[i] = item;
                    }
                });
            }
            return data;
        } else {
            if (returntext) {
                return returntext;
            } else {
                return '';
            }

        }
    },
    /**
     * 价格格式化，15200 => 1.52万
     * @param money
     * @returns {Number}
     */
    formatMoney: function(money, unit) { //unit 表示带单位
        var account = money * 100 + "";
        if (account >= 10000000000) {
            var account1 = (account).replace(/(\d{10}$)/, ".$1");
            account = (account1).replace(/(.)([1-9]*)(0{1,}$)/, function(rs, $1, $2, $3) {
                if (!$2 && $3.length > 0) {
                    return ""
                } else {
                    return $1 + $2
                }
            }) + "<em class='f14'>亿</em>";
        } else if (account >= 1000000) {
            var account2 = (account).replace(/(\d{6}$)/, ".$1");
            account = account2.replace(/(.)([1-9]*)(0{1,}$)/, function(rs, $1, $2, $3) {
                if (!$2 && $3.length > 0) {
                    return ""
                } else {
                    return $1 + $2
                }
            }) + "<em class='f14'>万</em>";
        } else {
            account = money;
        }
        return account;
    },
    //    数据null 转为空字符串
    transformNull: function(val) {
        if (!val && (typeof val == "object" || typeof val == "undefined")) {
            return "";
        } else {
            return val;
        }
    },
    //两个数相加的方法
    addingFn: function(arg1, arg2) {
        arg1 = parseFloat(arg1)
        arg2 = parseFloat(arg2)
        if (typeof arg1 != "number" || typeof arg2 != "number") {
            return "";
        };
        var r1, r2, m;
        var _result
        if (arg1.toString().split(".")[1] && arg2.toString().split(".")[1]) {
            r1 = arg1.toString().split(".")[1].length;
            r2 = arg2.toString().split(".")[1].length;
            m = Math.pow(10, Math.max(r1, r2));
            _result = (arg1 * m + arg2 * m) / m;
        } else {
            _result = arg1 + arg2;
        }
        if (_result.toString().indexOf(".") > -1) {
            _result = parseFloat(_result).toFixed(2);
        }
        return _result;
    },
    addDate: function(date, days) {
        var d = new Date(date).getTime();
        d = d + 24 * 60 * 60 * 1000 * days;
        d = new Date(d);
        var m = d.getMonth() + 1,
            y = d.getDate();
        m = (m < 10) ? '0' + m : m;
        y = (y < 10) ? '0' + y : y;
        return d.getFullYear() + '-' + m + '-' + y;
    }
};
// if (!util.IsPC()) {
//     location.href = '/m/index.html'
// };
String.prototype.replaceSpace = function() {
    return this.replace(/(^\s{1,})|(\s{1,}$)|(\s{1,})/g, "")
};
util.setlogo();