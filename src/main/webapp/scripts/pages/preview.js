$(function() {

    var timeStart = util.getQueryString('timeStart') || "";
    var province = util.getQueryString('province') || "";
    var city = util.getQueryString('city') || "";
    var standardType = util.getQueryString('standardType') || "";
    var secondaryType = util.getQueryString('secondaryType') || "";
    var num = util.getQueryString('num') || 0;
    var data_ = {};
    var liIndex = 0;
    CalendarHandler.initialize();
    if (null != timeStart && "" != timeStart && !isNaN(timeStart)) {
        var timesLong = new Date(parseInt(timeStart));
        var year = timesLong.getFullYear();
        var month = timesLong.getMonth() + 1;
        var day = timesLong.getDate();
        CalendarHandler.CreateCurrentCalendar(CalendarHandler.CreateCalendar(year, month, day));
    } else {
        timeStart = new Date().getTime();
    }


    util.getdata("/caa-search-ws/ws/0.1/lots?start=" + num + "&count=12&sortname=&sortorder=&province=" + province + "&city=" + city + "&standardType=" + standardType + "&secondaryType=" + secondaryType + "&date=" + timeStart, "get", "json", false, true, function(data) {
        if (data.items.length == 0 || data.totalCount == 0) {
            $('.lot-list').hide();
            $('.lot-empty').show();
        } else {
            $('.lot-list').show();
            $('.lot-empty').hide();
            page(data.page, data.totalPages);

        }
        $(".auction-list-wrap").lot({
            data: data.items
        });
    });

    // 设置内容区域高度
    var setheight = $(window).height() - $('.sifa-head').outerHeight(true) - $('.J-sifa-foot').outerHeight(true);
    $('.sf-wrap').css('min-height', setheight);

    $.ajax({
        url: '/caa-web-ws/ws/0.1/auction/lots/type' + "?time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        cache: false,
        async: true,
        success: function(data) {
            var b = {};
            $.each(data, function(i, val) {
                var key = val.standardNum + "-" + val.standardName;
                $.each(val.secondary, function(k, vals) {
                    if (null == b[key]) {
                        b[key] = [];
                    }
                    b[key].push({
                        secondaryName: vals.secondaryName,
                        secondaryType: vals.secondaryType,
                        standardName: val.standardName,
                        standardType: val.standardNum
                    });
                });
            });
            data_ = b;

            var typestr = '';
            var i = 1;
            $.each(data, function(id, item) {
                    typestr += '<li class="hasChild" ><a href="javascript:void(0);" data-id="' + item.standardNum +
                        '" data-typeid="' + i + '">' + item.standardName + '<i></i></a></li>';
                    i++;
                })
                //不足4的倍数的时候补齐，防止最后一层的二级数据显示不出来
            if ((i % 4) != 0) {
                var lestLi = 4 - i % 4;
                for (var y = 0; y < lestLi; y++) {
                    typestr += '<li></li>';
                }
            }
            $('#caltype').empty().append(typestr).prepend('<li class="active"><a class="default" href="javascript:void(0)">全部</a></li>')
            if (null != standardType && '' != standardType) {
                var types = "";
                var div;
                $('#caltype li[class=active]').removeClass("active");
                $('#caltype li').each(function() {
                    if ($(this).find("a").data('id') == standardType) {
                        types = ($(this).text());
                        div = $(this);
                        $(this).addClass("hasChild-active");
                    }
                });
                var array = data_[standardType + "-" + types];
                var citys = "";
                $.each(array, function(id, item) {
                    citys += '<li><em><a href="javascript:void(0);" data-id="' + item.secondaryType + '">' + item.secondaryName + '</a></em></li>';
                });
                var endstr = '<div class="childWrap"> ' +
                    '<ul>' +
                    '<li class="active"><a class="defaul" href="javascript:void(0);">全部</a></li>' + citys +
                    '</ul>' +
                    '</div>';

                var insert = $(div).find('a').attr('data-typeid');
                var inArea = parseInt(insert / 4) * 4;
                $(endstr).insertAfter($('#caltype>li').eq(inArea + 3));
                if (null != secondaryType && "" != secondaryType) {
                    $('.childWrap').find('li').eq(0).removeClass('active');
                    $('.childWrap').find('a[data-id=' + secondaryType + ']').parent().parent().addClass('active');
                }
            } else {
                if (liIndex == 0) {
                    $(this).addClass('active');
                }
            }
        },
        error: function(xhr) {}
    });
    $('#caltype').on('click', 'li', function() {
        liIndex = $('#caltype>li').index($(this));
        if (liIndex == 0) {
            standardType = "";
            secondaryType = "";
        } else if ($(this).find('a').html().indexOf('<i></i>') >= 0 || $(this).find('a').html().indexOf('<I></I>') >= 0) {
            standardType = $(this).find('a').data('id');
            secondaryType = "";
        } else if ($(this).html().indexOf('<em>') >= 0 || $(this).html().indexOf('<EM>') >= 0) {
            secondaryType = $(this).find('a').data('id');
        } else {
            secondaryType = "";
        }
        lots_();
    });

    $.ajax({
        url: '/caa-web-ws/ws/0.1/authorize/provinces' + "?time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        cache: false,
        async: true,
        success: function(data) {
            var pro = '';
            $.each(data, function(id, item) {
                pro += '<li class="hasChild" data-proviceid="' + item.id + '"><a href="javascript:void(0)">' + item.shortName + '<i></i></a></li>';
            });
            $('#callocus>ul').empty().append(pro).prepend('<li class="all-locus active"><a class="default" href="javascript:void(0)">全部<i></i></a></li>');
            if (null != province && "" != province) {
                $('#callocus .showlist li').eq(0).removeClass('active');
                var divs;
                $('#callocus .showlist li').each(function() {
                    if ($(this).data('proviceid') == province) {
                        $(this).addClass('hasChild-active');
                        divs = $(this);
                    }
                });

                var num = $(divs).index("#callocus>.showlist>li"),
                    insert = Math.floor(num / 4) * 4 + 4,
                    leg = $('#callocus>.showlist>li').length;
                $.ajax({
                    url: '/caa-web-ws/ws/0.1/authorize/cities/' + province + "?time=" + (new Date().getTime()),
                    type: 'get',
                    dataType: 'json',
                    cache: false,
                    async: true,
                    success: function(data) {
                        var citys = '';
                        $.each(data, function(id, item) {
                            citys += '<li><em><a href="javascript:void(0);" data-cityid="' + item.id + '">' + item.name + '</a></em></li>';
                        });
                        var endstr = '<div class="childWrap"> ' +
                            '<ul>' +
                            '<li class="active"><a class="defaul" href="javascript:void(0);" data-cityid="">全部</a></li>' + citys +
                            '</ul>' +
                            '</div>';
                        if (insert < leg) {
                            $(endstr).insertBefore($('#callocus>.showlist>li').eq(insert));
                        } else {
                            $(endstr).insertAfter($('#callocus>.showlist>li').eq(leg - 1));
                        }

                        if (null != city && "" != city) {
                            $('#callocus .childWrap li').eq(0).removeClass('active');
                            $('#callocus .childWrap li').each(function() {
                                if ($(this).find('a').data('cityid') == city) {
                                    $(this).addClass('active');
                                }
                            });
                        }
                    },
                    error: function(xhr) {}
                });
            } else {
                $(this).addClass('active');
            }
        },
        error: function(xhr) {}
    });
    $('#callocus').on('click', '.showlist>li', function() {
        $('#callocus .childWrap').remove();
        if ($(this).hasClass('hasChild')) {
            $('#callocus>.showlist>li.all-locus').removeClass('active');
            $('#callocus>.showlist>li.hasChild').removeClass('hasChild-active');
            $(this).addClass('hasChild-active');
            province = $(this).data('proviceid');
            city = '';
            lots_();
            var num = $(this).index("#callocus>.showlist>li"),
                insert = Math.floor(num / 4) * 4 + 4,
                leg = $('#callocus>.showlist>li').length;
            $.ajax({
                url: '/caa-web-ws/ws/0.1/authorize/cities/' + province + "?time=" + (new Date().getTime()),
                type: 'get',
                dataType: 'json',
                cache: false,
                async: true,
                success: function(data) {
                    var citys = '';
                    $.each(data, function(id, item) {
                        citys += '<li><em><a href="javascript:void(0);" data-cityid="' + item.id + '">' + item.name + '</a></em></li>';
                    });
                    var endstr = '<div class="childWrap"> ' +
                        '<ul>' +
                        '<li class="active"><a class="defaul" href="javascript:void(0);"  data-cityid="">全部</a></li>' + citys +
                        '</ul>' +
                        '</div>';
                    if (insert < leg) {
                        $(endstr).insertBefore($('#callocus>.showlist>li').eq(insert));
                    } else {
                        $(endstr).insertAfter($('#callocus>.showlist>li').eq(leg - 1));
                    }
                },
                error: function(xhr) {}
            });
        } else {
            province = '';
            city = '';
            lots_();
            $('#callocus>.showlist>li.all-locus').addClass('active');
            $('#callocus>.showlist>li.hasChild').removeClass('hasChild-active');
        }
    });

    $('#callocus').on('click', '.childWrap li', function() {
        $(this).addClass('active').siblings().removeClass("active");
        city = $(this).find('a').data('cityid');
        lots_();
    });



    function page(pages, totalPages) {
        $(".page-wrap").page({
            page: pages, //第几页
            totalPages: totalPages, //总页数
            showNum: 5,
            change: function(data) {
                lots_(data);
            }
        });
    }

    function getTimeForCalender() {
        var stringTime =
            $('.selectYear').html().substring(0, 4) + "/" +
            ("0000" + $('.selectMonth').html()).substr(("0000" + $('.selectMonth').html()).length - 3, 2) + "/" +
            ("0000" + $(".currentItem").find('a[style]').html()).substring(("0000" + $(".currentItem").find('a[style]').html()).length - 2);

        var todayBegin = new Date(stringTime).getTime();
        var todayEnd = new Date(stringTime).getTime() + 24 * 3600 * 1000;
        var result = {};
        result.todayBegin = todayBegin;
        result.todayEnd = todayEnd;
        return result;
    }
    $("#center").on('click', ' .item', function() {
        if ($(this).attr("class").indexOf("lastItem") < 0) {
            $(this).addClass("currentItem").siblings().removeClass("currentItem");
            $(this).find("a").css("margin", "3px 0 0 5.5px");
            lots_();
        }
    });

    function lots_(num) {
        var timePerior = getTimeForCalender();
        if (isNaN(timePerior.todayBegin)) {
            timeStart = new Date().getTime();
            // timeStart = timestr - timestr % (24 * 3600 * 1000);
            timePerior.todayBegin = timeStart;
        }
        if (!num) {
            num = 0;
        }
        var urlParam = "";
        if (!+"\v1") {
            province = decodeURI(province);
            city = decodeURI(city);
        }
        urlParam += (null != timePerior.todayBegin && "" != timePerior.todayBegin) ? ('&timeStart=' + timePerior.todayBegin) : "";
        urlParam += (null != province && "" != province) ? ('&province=' + province) : "";
        urlParam += (null != city && "" != city) ? ('&city=' + city) : "";
        urlParam += (null != standardType && "" != standardType) ? ('&standardType=' + standardType) : "";
        urlParam += (null != secondaryType && "" != secondaryType) ? ('&secondaryType=' + secondaryType) : "";
        urlParam += (null != num && "" != num) ? ('&num=' + num) : "";
        window.location.href = '/pages/lots/preview.html?' + urlParam;
    }

    $(".lastItem").click(function() {
        $(this).removeClass("currentItem");
    });
    $(".J-container-title").headerStyle();
});