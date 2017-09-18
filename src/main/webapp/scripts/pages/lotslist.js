$(function() {
    var sortname = util.getQueryString('sortname') || "";
    var sortorder = util.getQueryString('sortorder') || "";
    var status = util.getQueryString('status') || "";
    var attribute = util.getQueryString('attribute') || "";
    var province = util.getQueryString('province') || "";
    var city = util.getQueryString('city') || "";
    var priceStart = util.getQueryString('priceStart') || "";
    var priceEnd = util.getQueryString('priceEnd') || "";
    var isRestricted = util.getQueryString('isRestricted') || "";
    var canLoan = util.getQueryString('canLoan') || "";
    var standardType = util.getQueryString('standardType') || "";
    var secondaryType = util.getQueryString('secondaryType') || "";
    var num = util.getQueryString('num') || 0;
    var namevalue = util.getQueryString('name') || '';
    var term = util.getQueryString('term') || '';
    var startTimeStamp = util.getQueryString('startTimeStamp') || '';
    var endTimeStamp = util.getQueryString('endTimeStamp') || '';

    if (namevalue.indexOf(encodeURI('搜索标的')) > -1) {
        namevalue = '';
    }
    if (null != namevalue && "" != namevalue) {
        $("input[name=name]").val(decodeURI(namevalue));

    }

    $('.doubledate').kuiDate({
        className: 'doubledate',
        isDisabled: "0"
    });

    $.ajax({
        url: "/caa-search-ws/ws/0.1/lots?start=" + num + "&count=12&sortname=" + sortname + "&sortorder=" + sortorder + "&name=" + namevalue + "&status=" + status +
            "&attribute=" + attribute + "&province=" + province + "&city=" + city + "&priceStart=" + priceStart + "&priceEnd=" + priceEnd +
            "&isRestricted=" + isRestricted + "&canLoan=" + canLoan + "&standardType=" + standardType + "&secondaryType=" + secondaryType +
            '&term=' + term + '&startTimeStamp=' + startTimeStamp + '&endTimeStamp=' + endTimeStamp + "&time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        contentType: "application/json;charset=UTF-8",
        cache: false,
        async: true,
        success: function(data) {
            if (data.items.length == 0 || data.totalCount == 0) {
                $('.lot-list').hide();
                $('.lot-empty').show();
            } else {
                $('.lot-list').show();
                $('.lot-empty').hide();
                page(data.page, data.totalPages);
            }
            $(".filter-fixed .count").html(data.totalCount || 0);

            $(".auction-list-wrap").lot({
                data: data.items
            });
        }
    });

    setdata();

    $('.starttime').click(function() {
        $('.time-btn').css('display', 'inline-block').addClass('active');
    })
    $('.endtime').click(function() {
        $('.time-btn').css('display', 'inline-block').addClass('active');
    })

    $('.time-btn').click(function() {
        var starttime = $('.starttime').val(),
            endtime = $('.endtime').val();
        starttime = starttime ? (starttime + ' 00:00:00').replace(/-/g, "/") : '';
        endtime = endtime ? (endtime + ' 00:00:00').replace(/-/g, "/") : '';
        starttime = starttime ? new Date(starttime).getTime() : '';
        endtime = endtime ? new Date(endtime).getTime() : '';
        startTimeStamp = starttime;
        endTimeStamp = endtime;
        lots_();
    })

    //页面加载后修改拍卖开始时间
    if (null != startTimeStamp && '' != startTimeStamp) {
        $('.auction-time .value-no-limited a').removeClass("active");
        $('.starttime').val(util.tranferTime2(startTimeStamp, '', 'isyear'));
    }
    //页面加载后修改拍卖结束时间
    if (null != endTimeStamp && '' != endTimeStamp) {
        $('.auction-time .value-no-limited a').removeClass("active");
        $('.endtime').val(util.tranferTime2(endTimeStamp, '', 'isyear'));
    }

    //页面加载后修改拍卖时间
    if (null != term && '' != term) {
        $('.auction-time .value-no-limited a').removeClass("active");
        $('.auction-time .value-limited a[data-term=' + term + ']').addClass("active");
        var termtext = term;
        var year = new Date().getFullYear(),
            month = new Date().getMonth() + 1,
            day = new Date().getDate();
        month = (month < 10) ? '0' + month : month;
        day = (day < 10) ? '0' + day : day;
        var today = year + '-' + month + '-' + day;
        var endtext;
        if (termtext == '3') {
            $('.starttime').val(today);
            endtext = util.addDate((today + ' 00:00:00').replace(/-/g, "/"), 2);
            $('.endtime').val(endtext);
        } else if (termtext == '7') {
            $('.starttime').val(today);
            endtext = util.addDate((today + ' 00:00:00').replace(/-/g, "/"), 6);
            $('.endtime').val(endtext);
        } else if (termtext == '15') {
            $('.starttime').val(today);
            endtext = util.addDate((today + ' 00:00:00').replace(/-/g, "/"), 14);
            $('.endtime').val(endtext);
        } else {
            $('.starttime').val('');
            $('.endtime').val('');
        }
    }
    //标的时间
    $('.auction-time').on('click', 'a', function() {
        var termvalue = $(this).data('term');
        if (termvalue == '-1') {
            term = '';
            startTimeStamp = '';
            endTimeStamp = '';
        } else {
            term = termvalue;
        }
        lots_();
    });

    //标的所在地市
    $('.auction-locus').on('click', '.limited-value-list', function() {
        var provicevalue = $(this).data('proviceid');
        if (provicevalue == '') {
            province = '';
            city = '';
        } else {
            province = provicevalue;
            city = $(this).next('.sub-value').find('a.active').data('cityid');
        }
        lots_();
    });
    //拍卖方式
    $('.auction-way').on('click', 'a', function() {
        var attributevalue = $(this).data('attribute');
        if (attributevalue == '-1') {
            attribute = '';
        } else {
            attribute = attributevalue;
        }
        lots_();
    });

    //页面加载后修改拍卖方式
    if (null != attribute && '' != attribute) {
        $('.auction-way .value-no-limited a').removeClass("active");
        $('.auction-way .value-limited a[data-attribute=' + attribute + ']').addClass("active");
    }


    //标的状态
    $('.auction-status').on('click', 'a', function() {
        var statusvalue = $(this).data('status');
        if (statusvalue == '-1') {
            status = '';
        } else {
            status = statusvalue;
        }
        lots_();
    });

    //页面加载后修改标的状态
    if (null != status && '' != status) {
        $('.auction-status .value-no-limited a').removeClass("active");
        $('.auction-status .value-limited a[data-status=' + status + ']').addClass("active");
    }
    //二级子列表点击
    $('#queryloaction').on('click', 'li.active .auction-filter-value.sub-value a', function() {
        var cityvalue = $(this).data('cityid');
        if (cityvalue == '全部') {
            city = '';
        } else {
            city = cityvalue;
        }
        lots_();
    })


    //定位筛选
    var $filterfixshow = $('.filter-fixed-show');
    $filterfixshow.on('click', '.select-click', function() {
        $(this).toggleClass('active');
    });
    $('.filter-fixed-show .price-input').hover(function() {
        $(this).addClass('hover');
    }, function() {
        $(this).removeClass('hover');
    });
    $('.content-sort').on('click', 'a', function() {
        $('.content-sort a').removeClass('active');
        $(this).addClass('active');
        if ($(this).find('span').hasClass('arrow-down')) {
            $(this).find('span').removeClass('arrow-down');
            $(this).find('span').addClass('arrow-up');
        } else {
            $(this).find('span').removeClass('arrow-up');
            $(this).find('span').addClass('arrow-down');
        }
        lots_();
    });



    //可贷款
    $(".provide-money").find("a").each(function(i) {
        $(this).click(function() {
            if ($(this).find("span").hasClass("input-is-checked")) {
                $(this).find("span").removeClass("input-is-checked");
            } else {
                $(this).find("span").addClass("input-is-checked");
            }
            lots_();
        });
    });
    if (null != canLoan && '' != canLoan) {
        $(".provide-money").find("span").eq(0).addClass("input-is-checked");
    }
    if (null != isRestricted && '' != isRestricted) {
        $(".provide-money").find("span").eq(1).addClass("input-is-checked");
    }

    //价格区间
    $(".price-input-wrap").find("input").eq(2).click(function() {
        lots_();
    });
    $(".price-input-wrap").find("input").eq(0).bind('input propertychange', function() {
        var data = $(this).val();
        if (!(/^(\+|-)?\d+$/.test(data) && $(this).val() >= 0 || $(this).val() == "")) {
            $(this).val("");
        }
    });
    $(".price-input-wrap").find("input").eq(1).bind('input propertychange', function() {
        var data = $(this).val();
        if (!(/^(\+|-)?\d+$/.test(data) && $(this).val() >= 0 || $(this).val() == "")) {
            $(this).val("");
        }
    });

    if (null != priceStart && '' != priceStart) {
        $(".price-input-wrap").find("input").eq(0).val(priceStart);
    }
    if (null != priceEnd && '' != priceEnd) {
        $(".price-input-wrap").find("input").eq(1).val(priceEnd);
    }

    if (null != sortname && '' != sortname) {
        var eqs = 0;
        $(".content-sort").find("a").eq(0).removeClass('active');
        if ("nowPrice" == sortname) {
            $(".content-sort").find("a").eq(1).addClass('active');
            eqs = 1;
        } else if ("bidCount" == sortname) {
            $(".content-sort").find("a").eq(2).addClass('active');
            eqs = 2;
        }
        if (null != sortorder && '' != sortorder) {
            var text = $(".content-sort").find("a").eq(eqs).text();
            if (sortorder == 'asc') {
                $(".content-sort").find("a").eq(eqs).html(text + "<span class='arrow-up'></span>");
            } else {
                $(".content-sort").find("a").eq(eqs).html(text + "<span class='arrow-down'></span>");
            }
        }
    }


    //得到筛选条的值
    function getOptions() {
        var canLoad = "";
        var isRestricted = "";
        if ($(".provide-money span").eq(0).hasClass("input-is-checked")) {
            canLoad = 1;
        }
        if ($(".provide-money span").eq(1).hasClass("input-is-checked")) {
            isRestricted = 2;
        }
        var begin = $(".price-input-wrap").find("input").eq(0).val().replace("¥", "");
        var end = $(".price-input-wrap").find("input").eq(1).val().replace("¥", "");

        var result = {};
        var k = 0;
        result.sortname = "";
        result.sortorder = "";

        while (k < 3) {
            var arrow = $(".content-sort a").eq(k).attr("class");
            if (arrow.indexOf("active") >= 0 && arrow.indexOf("toggle") >= 0) {
                if (k == 1) {
                    result.sortname = "nowPrice";
                } else {
                    result.sortname = "bidCount";
                }
                var dir = $(".content-sort a").eq(k).find("span").attr("class");
                if (dir.indexOf("down") >= 0) {
                    result.sortorder = "desc";
                } else {
                    result.sortorder = "asc";
                }
            }
            k++;
        }

        result.isRestricted = isRestricted;
        result.canLoad = canLoad;
        result.begin = begin;
        result.end = end;
        return result;
    }

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

    function lots_(num) {
        var optionTips = getOptions();
        if (!num) {
            num = 0;
        }

        var urlParam = "";
        urlParam += (null != namevalue && "" != namevalue) ? ('&name=' + namevalue) : "";
        urlParam += (null != province && "" != province) ? ('&province=' + province) : "";
        urlParam += (null != city && "" != city) ? ('&city=' + city) : "";
        urlParam += (null != status) ? ('&status=' + status) : "";
        urlParam += (null != attribute) ? ('&attribute=' + attribute) : "";

        urlParam += (null != term) ? ('&term=' + term) : "";
        urlParam += (null != startTimeStamp) ? ('&startTimeStamp=' + startTimeStamp) : "";
        urlParam += (null != endTimeStamp) ? ('&endTimeStamp=' + endTimeStamp) : "";

        urlParam += (null != standardType && "" != standardType) ? ('&standardType=' + standardType) : "";
        urlParam += (null != secondaryType && "" != secondaryType) ? ('&secondaryType=' + secondaryType) : "";
        urlParam += (null != optionTips.lotMode && "" != optionTips.lotMode) ? ('&lotMode=' + optionTips.lotMode) : "";
        urlParam += (null != optionTips.canLoad) ? ('&canLoan=' + optionTips.canLoad) : "";
        urlParam += (null != optionTips.isRestricted) ? ('&isRestricted=' + optionTips.isRestricted) : "";
        urlParam += (null != optionTips.begin && "" != optionTips.begin) ? ('&priceStart=' + optionTips.begin) : "";
        urlParam += (null != optionTips.end && "" != optionTips.end) ? ('&priceEnd=' + optionTips.end) : "";

        urlParam += (null != optionTips.sortname && "" != optionTips.sortname) ? ('&sortname=' + optionTips.sortname) : "";
        urlParam += (null != optionTips.sortorder && "" != optionTips.sortorder) ? ('&sortorder=' + optionTips.sortorder) : "";
        urlParam += (null != num && "" != num) ? ('&num=' + num) : "";

        window.location.href = '/pages/lots/list.html?' + urlParam;
    }

    function setdata() {
        //标的类型
        $.ajax({
            url: '/personal-ws/ws/0.1/auction/lots/type' + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: true,
            success: function(data) {
                var typestr = '';
                // for (var key in data){
                $.each(data, function(id, item) {
                    // var array = data[key];
                    var liList = "";
                    $.each(item.secondary, function(id2, item2) {
                        if (null != secondaryType && '' != secondaryType && secondaryType == item2.secondaryType) {
                            liList += '<li><a href="javascript:void(0);" class="active secondaryType" data-secondarytype="' + item2.secondaryType + '"><span>' + item2.secondaryName + '</span></a></li>';
                        } else {
                            liList += '<li><a href="javascript:void(0);" class="secondaryType" data-secondarytype="' + item2.secondaryType + '"><span>' + item2.secondaryName + '</span></a></li>';
                        }
                    });
                    typestr += '<li><a href="javascript:void(0);" class="limited-value-list standardtype"  data-standardtype="' + item.standardNum + '"><span>' + item.standardName + '<i></i></span></a>' +
                        '<div class="auction-filter-value sub-value">' +
                        '<div class="value-no-limited">' +
                        '<a href="javascript:void(0);" class="active" data-secondarytype="">' +
                        '<span>全部</span>' +
                        '</a>' +
                        '</div>' +
                        '<ul class="value-limited">' + liList +
                        '</ul>' +
                        '</div>' + '</li>';
                });
                $('.auction-type .value-limited').html(typestr);

                if (null != standardType && '' != standardType) {
                    $('.auction-type .value-no-limited a').removeClass("active");
                    $('.auction-type .value-limited li').each(function() {
                        if ($(this).find('a').data('standardtype') == standardType) {
                            $(this).addClass("active");
                        }
                    });
                    var leftt = $('.auction-type .value-limited li').eq(0).offset().left - $('.auction-type .value-limited li[class=active]').offset().left;
                    $('.auction-type .value-limited li[class=active] .sub-value').css('left', leftt);

                    if (null != secondaryType && '' != secondaryType) {
                        $('.auction-type .value-limited li[class=active] a[data-secondarytype=' + secondaryType + ']').addClass('active');
                    } else {
                        $('.auction-type .value-limited li[class=active] .value-no-limited a').addClass('active');
                    }
                }
            },
            error: function(xhr) {}
        });

        //标的类型点击
        $('.auction-type .auction-filter-value').on('click', 'a', function() {
            if ($(this).hasClass('standardtype')) {
                standardType = $(this).data("standardtype");
                if (standardType) {
                    secondaryType = $(this).next('.sub-value').find('a.active').data('standardtype');
                } else {
                    secondaryType = '';
                }
            } else {
                secondaryType = $(this).data("secondarytype");
            }
            lots_();
        });

        $.ajax({
            url: '/caa-web-ws/ws/0.1/auction/lots/loction' + "?time=" + (new Date().getTime()),
            type: 'get',
            dataType: 'json',
            cache: false,
            async: true,
            success: function(data) {
                var endstr = '',
                    classActive = '',
                    provinceId = util.getQueryString('province'),
                    cc = '';
                $.each(data, function(id, item) {
                    var cityul = '';
                    $.each(item.cities, function(id2, item2) {
                        cityul += '<li><a href="javascript:void(0);" data-cityid="' + item2.cityId + '"><span>' + item2.cityName + '</span></a></li>';
                    });
                    if (item.proId == provinceId) {
                        $('.auction-locus>.auction-filter-value>.value-no-limited').removeClass('active')
                        classActive = 'active';
                        cc = "hassearch"
                    } else {
                        classActive = '';
                        cc = '';
                    }
                    endstr += '<li class="' + classActive + '"><a href="javascript:void(0);" class="limited-value-list" data-proviceid="' + item.proId + '"><span>' + item.proName + '<i></i></span></a><div class="auction-filter-value sub-value ' + cc + '"><div class="value-no-limited"><a href="javascript:void(0);" class="active"><span>全部</span></a></div><ul class="value-limited">' + cityul + '</ul></div></li>';
                });
                $('#queryloaction').html(endstr);
                if (provinceId) {
                    var leftt = $('.auction-locus .value-limited li').offset().left - $('.hassearch').offset().left;
                    $('.hassearch').css('left', leftt);
                }

                //开始进行装载
                if (null != city && "" != city) {
                    $('#queryloaction li[class=active] .value-no-limited a').removeClass('active');
                    $('#queryloaction li[class=active] .value-limited a').each(function() {
                        if ($(this).data('cityid') == city) {
                            $(this).addClass("active");
                        }
                    });
                }
            },
            error: function(xhr) {}
        });
    }
    $(".J-container-title").headerStyle();
})