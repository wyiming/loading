//渲染分页组件
$.fn.page = function(options) {
    var $template = $(
        '<div class="pagination">' +
        '<span class="previous unavailable"><span class="arrow-left"></span></span>' +
        '<div class="page-num-area"></div>' +
        '<a href="javascript:void(0)" class="next"><span class="arrow-right"></span></a>' +
        '<div class="pagination-input-wrap">前往<input class="pagination-input" type="text">页<a class="pagination-go" href="javascript:void(0)">确定</a></div>' +
        '</div>');
    this.empty().append($template);
    var self = this.find('.pagination');
    var page = options.page;
    var currentpage = page - 1;
    var showNum = options.showNum < 3 ? 3 : options.showNum;
    var tatalPages = options.totalPages;
    var preNext = function(self, page, tatalPages) {
        var newPreUn = $('<span>').attr("class", "previous unavailable").html(self.find('.previous').html());
        var newPre = $('<a>').attr("class", "previous").attr("href", "javascript:void(0)").html(self.find('.previous').html());
        page == 1 ? self.find('.previous').replaceWith(newPreUn) :
            self.find('.previous').replaceWith(newPre);

        var newNextUn = $('<span>').attr("class", "next unavailable").html(self.find('.next').html());
        var newNext = $('<a>').attr("class", "next").attr("href", "javascript:void(0)").html(self.find('.next').html());
        page == tatalPages ? self.find('.next').replaceWith(newNextUn) :
            self.find('.next').replaceWith(newNext);
    };
    var pageNum = function(page, tatalPages, showNum) {
        if (tatalPages == 0) {
            $('.pagination').hide();
        }
        showNum = showNum;
        var aStr = "";
        if (tatalPages <= showNum + 2) {
            var i = 1;
            while (i <= tatalPages) {
                if (i == page) {
                    aStr += '<span class="current">' + i + '</span>';
                } else {
                    aStr += '<a href="javascript:void(0)" rel="nofollow">' + i + '</a>';
                }
                i++;
            }
        } else if (page < showNum) {
            var i2 = 1;
            while (i2 < showNum + 1) {
                if (i2 == page) {
                    aStr += '<span class="current">' + i2 + '</span>';
                } else {
                    aStr += '<a href="javascript:void(0)" rel="nofollow">' + i2 + '</a>';
                }
                i2++;
            }
            aStr += '<span class="break">...</span>';
            aStr += '<a href="javascript:void(0)" rel="nofollow">' + (options.totalPages - 1) + '</a>';
            aStr += '<a href="javascript:void(0)" rel="nofollow">' + options.totalPages + '</a>';
        } else if (page > tatalPages - Math.floor(showNum / 2 + 0.5) - 2) {
            aStr += '<a href="javascript:void(0)" rel="nofollow">1</a>';
            aStr += '<a href="javascript:void(0)" rel="nofollow">2</a>';
            aStr += '<span class="break">...</span>';
            var i3 = tatalPages - showNum;
            while (i3 <= tatalPages) {
                if (i3 == page) {
                    aStr += '<span class="current">' + i3 + '</span>';
                } else {
                    aStr += '<a href="javascript:void(0)" rel="nofollow">' + i3 + '</a>';
                }
                i3++;
            }
        } else {
            aStr += '<a href="javascript:void(0)" rel="nofollow">1</a>';
            aStr += '<a href="javascript:void(0)" rel="nofollow">2</a>';
            aStr += '<span class="break">...</span>';
            var i4 = page - Math.floor(showNum / 2);
            var nnn = 0;
            while (i4 < (page + Math.floor(showNum / 2 + 0.5))) {
                nnn++;
                if (i4 == page) {
                    aStr += '<span class="current">' + i4 + '</span>';
                } else {
                    aStr += '<a href="javascript:void(0)" rel="nofollow">' + i4 + '</a>';
                }
                i4++;
            }

            aStr += '<span class="break">...</span>';
            aStr += '<a href="javascript:void(0)" rel="nofollow">' + (options.totalPages - 1) + '</a>';
            aStr += '<a href="javascript:void(0)" rel="nofollow">' + options.totalPages + '</a>';
        }
        return aStr;
    };
    preNext(self, page, tatalPages);
    var aStr = pageNum(page, tatalPages, showNum);
    self.find('.page-num-area').replaceWith(aStr);
    // self.find('.page-total').text(options.totalPages);
    //以下为页码的监听
    self.find("a").each(function(i) {
        if ($(this).attr("rel") == "nofollow") {
            $(this).click(function() {
                var pagenum = $(this).html() - 1;
                if (jQuery.isFunction(options.change)) {
                    currentpage = options.change(pagenum);
                    // $(window).scrollTop(0);
                }
            });
        }
    });
    //以下为上一页，下一页的监听
    if (self.find('.previous').attr("href")) {
        self.find('.previous').click(function() {
            if (jQuery.isFunction(options.change)) {
                currentpage = options.change(currentpage - 1);
                // $(window).scrollTop(0);
            }
        });
    }
    if (self.find('.next').attr("href")) {
        self.find('.next').click(function() {
            if (jQuery.isFunction(options.change)) {
                currentpage = options.change(currentpage + 1);
                // $(window).scrollTop(0);
            }
        });
    };

    self.find('.pagination-go').bind('click', function() {
        var $input = $(this).prev('.pagination-input');
        var pagenum = $input.val() - 1;
        if (pagenum < 0 || pagenum >= options.totalPages) {
            $input.addClass('active');
            return;
        } else {
            $input.removeClass('active');
        }
        if (jQuery.isFunction(options.change)) {
            currentpage = options.change(pagenum);
            // $(window).scrollTop(0);
        }
    });
}