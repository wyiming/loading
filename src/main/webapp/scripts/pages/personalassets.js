var IEBOL;
var browser = navigator.appName;
var b_version = navigator.appVersion
var version = b_version;
var trim_Version;
var canSubmit = true;
if (browser != "Microsoft Internet Explorer" && trim_Version != "MSIE8.0") {
    IEBOL = true
} else {
    IEBOL = false
}
if (IEBOL) {
    $('.loadimg-chrome').removeClass('hidden')
    $('#userPhoto').ace_file_input();
    $('#userPhotoone').ace_file_input()
    $('#userPhototwo').ace_file_input()
    $('#userPhotothree').ace_file_input()
    $('#userPhotofour').ace_file_input()
} else {
    $('.loadimg-ie').removeClass('hidden')
    $('#userPhoto-ie').attr("onchange", "previewImage(this,'preview-span',0)");
    $('#userPhoto-ie-one').attr("onchange", "previewImage(this,'preview-span-one',1)");
    $('#userPhoto-ie-two').attr("onchange", "previewImage(this,'preview-span-two',2)");
    $('#userPhoto-ie-three').attr("onchange", "previewImage(this,'preview-span-three',3)");
    $('#userPhoto-ie-four').attr("onchange", "previewImage(this,'preview-span-four',4)");
};

$('.preview-ie-wrap').on('click', '.ie-remove', function() {
    var removeA = $(this);
    var index = $('.ie-remove').index($(this))
    removeA.siblings('span').css('filter', 'none');
    if (!$('.upimgwrap-ie').eq(index + 1).find('span.custorm-style').attr("style")) {
        $('.upimgwrap-ie').eq(index + 1).addClass('hidden')
    }
    if ($('.upimgwrap-ie').eq(index + 1).find('span.custorm-style').attr("style").indexOf('none') > -1) {
        $('.upimgwrap-ie').eq(index + 1).addClass('hidden')
    }
    var idStr = removeA.parents().siblings('input').attr('id');
    removeA.parents().siblings('input').attr('value', "");
    var obj = document.getElementById(idStr);
    obj.select();
    document.selection.clear();
    removeA.hide();
});
var _showerrerFn = function(obj, txt) {
    var _left = obj.offset().left + obj.outerWidth() + 15;
    var _top = obj.offset().top + 10;
    if (obj.hasClass('au-submit-img')) {
        _left = obj.offset().left + 50;
        _top += obj.outerHeight() + 40;
    }
    var $errer = $('<p class="au-errer"></p>');
    $errer.html(txt).css({
        "left": _left + "px",
        "top": _top + "px"
    });
    $("body").append($errer);
    canSubmit = false;
};
//图片上传预览    IE是用了滤镜。
function previewImage(file, divId, i) {
    if ($(".preview-ie-input").eq(i).val() == "") {
        _showerrerFn($('.au-submit-img'), "请上传图片")
        return
    } else {
        // var MAXWIDTH = 260;
        // var MAXHEIGHT = 180;
        var div = document.getElementById(divId);
        $('.ie-remove').eq(i).show();
        div.style.display = 'block';
        // var div = document.getElementById(divId);
        file.select();
        top.parent.document.body.focus();
        var src = document.selection.createRange().text;
        document.selection.empty();
        div.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
        div.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = src;
        $(".preview-ie-input").eq(i).val(src)
    }
}
$(document).ready(function() {
    var jsonData = {};
    $('.ace-file-input input').each(function(i) {
        $('.ace-file-input input').eq(i).on("change", function() {
            if ($(this).val() != "") {
                $('.upimgwrapType').eq(i + 1).removeClass('hidden')
            }
        })
    });
    $('.remove').each(function(i) {
        $('.remove').eq(i).on("click", function() {
            if ($('.upimgwrapType').eq(i + 1).find('img').length == "0") {
                $('.upimgwrapType').eq(i + 1).addClass('hidden')
            }
        })
    });
    $('.preview-ie-input').each(function(i) {
        $('.preview-ie-input').eq(i).on("change", function() {
            if ($(this).val() != "") {
                $('.upimgwrap-ie').eq(i + 1).removeClass('hidden')
            }
        })
    });

    function uploadimg(ind, one, two, three, four, five) {
        if (ind == '0') {
            _showerrerFn($('.au-submit-img'), '请上传图片')
            return false
        }
        var _getImgDataFn = function(num) {
            if (typeof num == "undefined") {
                return;
            }
            var _formArr = [one, two, three, four, five];
            _formArr[num].ajaxSubmit({
                url: '/caa-oc/ws/0.1/web/certificate/img',
                dataType: "text/plain",
                type: "post",
                async: false,
                success: function(data) {
                    data = JSON.parse(data);
                    if (data.error && num == 0) {
                        _showerrerFn($('.au-submit-img'), data.error)
                        return false;
                    } else {
                        var arrpicUrl = data[0].url;
                        jsonData["handPhoto" + num] = arrpicUrl;
                    }
                    if (ind <= num + 1) {
                        submitUser(jsonData);
                        return false
                    } else {
                        num += 1;
                        _getImgDataFn(num);
                    }
                },
                error: function(xhr) {
                    submitUser(jsonData);
                }
            });
        };
        _getImgDataFn(0);
    };
    var _checkAllFn = function(id, num) {
        $(".au-errer").remove();
        var _idArr = ["asset-type", "asset-province", "asset-city", "person-province", "person-city", "asset-text", "submit-img", "person-name", "person-number", "person-sure", "J-person-sure-mobile", "au-hasSelect"];
        var _tipsArr = ["请选择资产类型", "请选择资产所在地", "请选择资产所在地", "请选择卖家所在地", "请选择卖家所在地", "请填写资产描述", "请上传图片", "请输入卖家姓名", "请输入有效手机号", "请输入验证码", "输入短信验证码", "请确认资产信息真实可信"];
        var _isNullArr = ["请选择资产类型", "请选择省份", "请选择市区", "请选择省份", "请选择市区", "描述一下资产相关信息", "", "", "", "", "输入短信验证码", "", "", "", "", "", "", "", ""]
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(elt /*, from*/ ) {
                var len = this.length >>> 0;
                var from = Number(arguments[1]) || 0;
                from = (from < 0) ?
                    Math.ceil(from) :
                    Math.floor(from);
                if (from < 0)
                    from += len;
                for (; from < len; from++) {
                    if (from in this &&
                        this[from] === elt)
                        return from;
                }
                return -1;
            };
        }
        var _index = _idArr.indexOf(id);
        var _len = typeof id != "undefined" ? _index : _idArr.length;
        for (var i = 0; i < _len; i++) {
            var n = i;
            if (n == 1) {
                n = 2
            } else if (n == 3) {
                n = 4
            }
            var $target = $("#" + _idArr[i]);
            if ((i == 11 && !$target.hasClass("isselect"))) {
                _showerrerFn($("#" + _idArr[n]), _tipsArr[i]);
            } else if (i == 6 && ((!IEBOL && $(".preview-ie-input").eq(0).val() == "") || (IEBOL && $("#submit-img img").length == 0))) {
                _showerrerFn($("#" + _idArr[n]), _tipsArr[i]);
            } else if (i == 8 && !(/^\d{11}$/).test($("#" + _idArr[i]).val())) {
                _showerrerFn($("#" + _idArr[n]), _tipsArr[i]);
            } else if (i != 11 && i != 8 && i != 6 && ($target.val() == _isNullArr[i] || $target.val() == "" || $target.find("option:selected").val() == "" || $target.find("option:selected").val() == _isNullArr[i])) {
                _showerrerFn($("#" + _idArr[n]), _tipsArr[i]);
            }
        }
    };

    function submitUser(jsonData) {
        canSubmit = true;
        _checkAllFn();
        if (canSubmit) {
            var _a_provinceId;
            var _a_cityId;
            var _p_provinceId;
            var _p_cityId;
            var _lottype;
            for (var n = 0; n < _province_city_data.length; n++) {
                var _one = _province_city_data[n];
                if (_one.proName == $("#asset-province").val() || _one.proName == $("#asset-province").find("option:selected").val()) {
                    _a_provinceId = _one.proId;
                    for (var k = 0; k < _one.cities.length; k++) {
                        if (_one.cities[k].cityName == $("#asset-city").val() || _one.cities[k].cityName == $("#asset-city").find("option:selected").val()) {
                            _a_cityId = _one.cities[k].cityId;
                        }
                    }
                }
                if (_one.proName == $("#person-province").val() || _one.proName == $("person-province").find("option:selected").val()) {
                    _p_provinceId = _one.proId;
                    for (var i = 0; i < _one.cities.length; i++) {
                        if (_one.cities[i].cityName == $("#person-city").val() || _one.cities[i].cityName == $("#person-city").find("option:selected").val()) {
                            _p_cityId = _one.cities[i].cityId;
                        }
                    }
                }
            }
            for (var j = 0; j < lotsTypeData.length; j++) {
                if (lotsTypeData[j].standardName == $("#asset-type").val() || lotsTypeData[j].standardName == $("#asset-type").find("option:selected").val()) {
                    _lottype = lotsTypeData[j].standardNum;
                }
            }
            var _imgUrl = "";
            for (var prop in jsonData) {
                _imgUrl += jsonData[prop] ? jsonData[prop] + "," : "";
            }
            var jsonData1 = {
                linkTel: $("#person-number").val(),
                pic: _imgUrl,
                sellerName: $("#person-name").val(),
                description: $("#asset-text").val(),
                assetsProvince: _a_provinceId,
                assetsCity: _a_cityId,
                sellerProvince: _p_provinceId,
                sellerCity: _p_cityId,
                standardType: _lottype,
                capCha: $("#J-person-sure-mobile").val()
            };
            $.ajax({
                url: '/personal-ws/ws/0.1/save/assets',
                contentType: "application/json",
                type: 'post',
                dataType: 'json',
                async: false,
                data: JSON.stringify(jsonData1),
                success: function() {
                    $(".J-alert-box").removeClass("dis-none");
                    $(".J-applyDiv").removeClass("dis-none");
                },
                error: function(data) {
                    if (data.responseText) {
                        var info = JSON.parse(data.responseText).error
                        _showerrerFn($('#J-person-sure-mobile'), info)
                    }
                }
            });
        }
    };

    function codeNum() {
        $(".au-get-yam").attr("src", "/caa-personal-ws/ws/0.1/captcha/image/jpeg?time=" + new Date().getTime());
    }
    //渲染图片验证码 /caa-personal-ws/ws/0.1/captcha/image/jpeg?time=1
    $('.au-get-yam').click(function() {
        codeNum()
    })
    codeNum();
    //省市渲染
    var _province_city_data;
    $.ajax({
        url: "/caa-web-ws/ws/0.1/auction/lots/loction" + "?time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        cache: false,
        async: false,
        success: function(data) {
            _province_city_data = data;
            var _option = $("<option></option>");
            $("#asset-province").html($("<option>请选择省份</option>"));
            $("#person-province").html($("<option>请选择省份</option>"));
            for (var i = 0; i < data.length; i++) {
                $("#asset-province").append(_option.clone().html(data[i].proName));
                $("#person-province").append(_option.clone().html(data[i].proName));
            }
        },
        error: function(data) {

        }
    });
    //渲染资产类型
    var lotsTypeData;
    $.ajax({
        url: "/personal-ws/ws/0.1/auction/lots/type" + "?time=" + (new Date().getTime()),
        type: 'get',
        dataType: 'json',
        cache: false,
        async: false,
        success: function(data) {
            //[{"standardNum":"","secondary":[],"standardName":"机动车","logoPath":""}]
            lotsTypeData = data;
            var _option = $("<option></option>");
            $("#asset-type").html($("<option>请选择资产类型</option>"));
            for (var i = 0; i < data.length; i++) {
                $("#asset-type").append(_option.clone().html(data[i].standardName))
            }

        },
        error: function(data) {

        }
    });

    $(document).on("blur focus click change", "#submit-img input,input.au-input,textarea,select,option,.J-submit-btn,.J-au-get-yam2,.dangerBtn,.closeBtn,.au-hasSelect", function(e) {
        var $target = $(e.target);

        var _id = $target.attr("id") || $target.parent().attr("id");
        if ($target.hasClass("au-hasSelect")) {
            $target.toggleClass("isselect");
            _checkAllFn(_id);
        }
        if (e.type == "blur" || e.type == "focusout" || e.type == "change") {
            _checkAllFn(_id);
        } else if (e.type == "focusin" || e.type == "focus") {
            $(".au-errer").remove();
            _checkAllFn(_id);
        } else if (e.type == "click") {
            if ($target.hasClass("dangerBtn")) {
                window.location.reload();
            }
            if ($target.hasClass("closeBtn")) {

                window.opener = null;
                window.open('', '_self');
                window.close();
            }
            //发送短信验证码
            if ($target.hasClass("J-au-get-yam2") && $target.html() == "获取短信验证码") {
                $.ajax({
                    url: "/personal-ws/ws/0.1/send/assets/captcha?tel=" + $("#person-number").val() + "&picCha=" + $("#person-sure").val() + "&time=" + (new Date().getTime()),
                    type: 'get',
                    dataType: 'json',
                    cache: false,
                    async: false,
                    success: function(data) {
                        $(".J-au-get-yam2").html("验证码发送成功");
                        setTimeout(function() {
                            $(".J-au-get-yam2").html("获取短信验证码");
                        }, 60000)
                    },
                    error: function(data) {
                        if (data.responseText) {
                            var info = JSON.parse(data.responseText).error;
                            _showerrerFn($('#J-person-sure-mobile'), info)
                        }
                        codeNum()
                    }
                });
            }
            if ($target.hasClass("J-submit-btn")) {
                canSubmit = true;
                //获取图片url
                _checkAllFn();
                if (canSubmit) {
                    if (IEBOL) { //非IE
                        if ($('.ace-file-multiple label span img').length <= 0) {
                            _showerrerFn($('.au-submit-img'), "请上传图片")
                        }
                        var ind = $('.ace-file-multiple label span img').length
                        var one = $('#userPhotoForm');
                        var two = $('#userPhotoFormone');
                        var three = $('#userPhotoFormtwo');
                        var four = $('#userPhotoFormthree');
                        var five = $('#userPhotoFormfour');
                        uploadimg(ind, one, two, three, four, five)
                    } else {
                        var ind1 = 0;
                        $('.preview-ie-input').each(function(i, _this) {
                            if ($(_this).val() != "") {
                                ind1++;
                            }
                        })
                        if (ind1 == '0') {
                            _showerrerFn($('.au-submit-img'), "请上传图片")
                        }
                        var one1 = $('#userPhotoForm-ie');
                        var two1 = $('#userPhotoForm-ie-one');
                        var three1 = $('#userPhotoForm-ie-two');
                        var four1 = $('#userPhotoForm-ie-three');
                        var five1 = $('#userPhotoForm-ie-four');
                        uploadimg(ind1, one1, two1, three1, four1, five1)
                    }
                }
            } else if ($target.get(0).tagName.toLocaleLowerCase() == "select" || $target.get(0).tagName.toLocaleLowerCase() == "option") {
                if ($target.attr("id") == "person-province" || $target.parent().attr("id") == "person-province") {
                    for (var n = 0; n < _province_city_data.length; n++) {
                        var _one = _province_city_data[n];
                        if (_one.proName == $("#person-province").val() || _one.proName == $("#person-province").find("option:selected").val()) {
                            var _option = $("<option></option>");
                            $("#person-city").html($("<option>请选择市区</option>"));
                            for (var l = 0; l < _one.cities.length; l++) {
                                $("#person-city").append(_option.clone().html(_one.cities[l].cityName));
                            }
                        }
                    }
                } else if ($target.attr("id") == "asset-province" || $target.parent().attr("id") == "asset-province") {
                    for (var m = 0; m < _province_city_data.length; m++) {
                        var _one1 = _province_city_data[m];
                        if (_one1.proName == $("#asset-province").val() || _one1.proName == $("#asset-province").find("option:selected").val()) {
                            var _option = $("<option></option>");
                            $("#asset-city").html($("<option>请选择市区</option>"));
                            for (var a = 0; a < _one1.cities.length; a++) {
                                $("#asset-city").append(_option.clone().html(_one1.cities[a].cityName))
                            }
                        }
                    }
                }
                var _id1 = $target.attr("id") || $target.parent().attr("id");
                _checkAllFn(_id1);
            } else if ($target.hasClass("au-get-yam")) {
                $.ajax({
                    url: "/personal-ws/send/assets/captcha?tel=" + $("#person-number").val() + "&picCha=" + $("#person-sure").val() + "&time=" + (new Date().getTime()),
                    type: 'get',
                    dataType: 'json',
                    cache: false,
                    async: false,
                    success: function(data) {

                    },
                    error: function(data) {

                    }
                });
            }
        }
    })
})