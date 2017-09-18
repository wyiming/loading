//倒计时渲染服务
;
(function($) {
    $.fn.countDown = function(duration, downCallback) {
        if (duration >= 0) {
            var day = ("00" + Math.floor(duration / (24 * 60 * 60 * 1000))).substring(("00" + Math.floor(duration / (24 * 60 * 60 * 1000))).length - 2);
            var hour = ("00" + Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))).substring(("00" + Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))).length - 2);
            var minute = ("00" + Math.floor(duration % (60 * 60 * 1000) / (60 * 1000))).substring(("00" + Math.floor(duration % (60 * 60 * 1000) / (60 * 1000))).length - 2);
            var second = Math.floor((duration % (60 * 1000)) / 1000) >= 10 ? ("0" + ((duration % (60 * 1000)) / 1000).toFixed(1)).substr(1,2) : ("0" + ((duration % (60 * 1000)) / 1000).toFixed(1)).substr(0,2);
            var display = '<var class="day">' + day + '</var>' +
                '<em>天</em><var class="hour">' + hour + '</var><em>时</em><var class="minute">' + minute + '</var><em>分</em><var class="second">' + second + '</var><em>秒</em>';
            this.html(display);
            if (!navigator.onLine) {
                alert("网络连接异常，为避免影响您的竞拍，请点击确认，尝试恢复页面！");
                window.location.reload(true);
            }
        } else {
            var display2 = '<var class="day">00</var><em>天</em><var class="hour">00</var><em>时</em><var class="minute">00</var><em>分</em><var class="second">00</var><em>秒</em>';
            this.html(display2);
            if ($.isFunction(downCallback)) {
                downCallback();
            }
        }
    };
})(jQuery);