/**
 * 上传插件
 */
(function($, undefined) {
    if (!$.browser) {
        var matched, browser;
        $.uaMatch = function(ua) {
            ua = ua.toLowerCase();
            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
            return {
                browser: match[1] || "",
                version: match[2] || "0"
            }
        };
        matched = $.uaMatch(navigator.userAgent);
        browser = {};
        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }
        $.browser = browser;
    }

    var multiplible = 'multiple' in document.createElement('INPUT');
    $.fn.ace_file_input = function(options) {
        var settings = $.extend({
                style: 'well',
                no_file: '未选择 ...',
                btn_choose: '点击上传图片',
                btn_change: '',
                no_icon: 'icon-plus',
                icon_remove: 'icon-remove',
                droppable: false,
                thumbnail: 'large',
                before_change: null,
                star_change: false,
                file: null,
                isMain: false,
                before_remove: null,
                noName: false
            },
            options);
        var hasFileList = !!window.FileList;
        return this.each(function() {
            var that = this;
            var $this = $(this);
            var remove = !!settings.icon_remove;
            var multi = $this.attr('multiple') && multiplible;
            var well_style = settings.style == 'well' ? true : false;

            $this.wrap("<div class='ace-file-input" + (well_style ? " ace-file-multiple" : "") + "' />");
            $this.after('<label data-title="' + settings.btn_choose + '" for="' + $(this).attr('id') + '"><span data-title="' + settings.no_file + '">' + (settings.no_icon ? '<i class="' + settings.no_icon + '"></i>' : '') + ($.browser.msie && $.browser.version == '7.0' ? ('<span class="msie">' + settings.no_file + '</span>') : '') + '</span>' + (remove ? '<a class="remove" href="#"><i class="' + settings.icon_remove + '"></i></a>' : '') + '</label>');
            var $label = $this.next();
            if (settings.file) {
                $label.addClass('hide-placeholder selected');
                var $img = $('<img>').attr('src', settings.file);
                $label.find('span:last').prepend($img);
                $label.attr('data-title', settings.btn_change).addClass('selected').removeClass('hide-placeholder');
            }
            if (remove) {
                $label.find('a').on('click', function() {
                    var ret = true;
                    if (settings.before_remove) ret = settings.before_remove.call(that);
                    if (!ret) return false;
                    return reset_input();
                });
            }
            if (settings.droppable && hasFileList) {
                var dropbox = this.parentNode;
                $(dropbox).on('dragenter',
                    function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }).on('dragover',
                    function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }).on('drop',
                    function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var dt = e.originalEvent.dataTransfer;
                        var files = dt.files;
                        if (!multi && files.length > 1) {
                            var tmpfiles = [];
                            tmpfiles.push(files[0]);
                            files = tmpfiles;
                        }
                        var ret = true;
                        if (settings.before_change) ret = settings.before_change.call(that, files, true);
                        if (!ret || ret.length == 0) {
                            return false;
                        }
                        if (ret instanceof Array || (hasFileList && ret instanceof FileList)) files = ret;
                        $this.data('ace_input_files', files);
                        $this.data('ace_input_method', 'drop');
                        var filenames = [];
                        for (var i = 0; i < files.length; i++) filenames.push(files[i].name);
                        show_file_list(filenames);
                        $this.triggerHandler('change', [true]);
                        return true;
                    })
            }
            $this.on('change', function() {
                if (this.value === '') reset_input();
            });
            $this.on('change.inner_call',
                function(e, inner_call) {
                    if (inner_call === true) return;
                    var ret = true;
                    if (settings.before_change) ret = settings.before_change.call(that, this.files || this.value, false);
                    if (!ret || ret.length == 0) {
                        if (!$this.data('ace_input_files')) reset_input_field();
                        return false;
                    }
                    var files = (ret instanceof Array || (hasFileList && ret instanceof FileList)) ? ret : this.files;
                    $this.data('ace_input_method', 'select');
                    var filenames = [];
                    var name;
                    if (files) {
                        $this.data('ace_input_files', files);
                        for (var i = 0; i < files.length; i++) {
                            name = $.trim(files[i].name);
                            if (!name) continue;
                            filenames.push(name);
                        }
                    } else {
                        name = $.trim(this.value);
                        if (name) filenames.push(name);
                    }
                    if (filenames.length == 0) return false;
                    show_file_list(filenames);
                    return true;
                });
            var show_file_list = function(filenames) {
                if (settings.noName) {
                    return;
                }
                var files = $this.data('ace_input_files');
                if (well_style) {
                    $label.find('span').remove();
                    if (!settings.btn_change) $label.addClass('hide-placeholder');
                }
                $label.attr('data-title', settings.btn_change).addClass('selected');
                $label.parents('.upimgwrap').find('input[type="file"]').data('url', '');
                for (var i = 0; i < filenames.length; i++) {
                    var filename = filenames[i];
                    var index = filename.lastIndexOf("\\") + 1;
                    if (index == 0) index = filename.lastIndexOf("/") + 1;
                    filename = filename.substr(index);
                    var fileType = 'icon-file';
                    if ((/\.(jpe?g|png)$/i).test(filename)) fileType = 'icon-picture';
                    else if ((/\.(doc|docx)$/i).test(filename)) fileType = 'icon-word';
                    else if ((/\.(xls|xlsx)$/i).test(filename)) fileType = 'icon-excel';
                    else if ((/\.(text)$/i).test(filename)) fileType = 'icon-txt';
                    else if ((/\.(rar|war|zip)$/i).test(filename)) fileType = 'icon-rar';
                    else if ((/\.(mpe?g|flv|mov|avi|swf|mp4|mkv|webm|wmv|3gp)$/i).test(filename)) fileType = 'icon-film';
                    else if ((/\.(mp3|ogg|wav|wma|amr|aac)$/i).test(filename)) fileType = 'icon-music';
                    if (!well_style) {
                        $label.find('span:first').attr({
                            'data-title': filename
                        }).find('[class*="icon-"]').attr('class', fileType);
                        if ($.browser.msie && $.browser.version == '7.0') {
                            $label.find('span:first').text(filename);
                        }
                    } else {
                        $label.append('<span data-title="' + filename + '"><i class="' + fileType + '"></i>' + ($.browser.msie && $.browser.version == '7.0' ? ('<span class="msie">' + filename + '</span>') : '') + '</span>');
                        var preview = settings.thumbnail && files && files[i].type.match('image') && !!window.FileReader;
                        if (preview) {
                            preview_image(files[i], $this);
                        }
                    }
                    if (fileType !== 'icon-picture') {
                        $label.parents('.upimgwrap').siblings('em').html('图片格式错误').show(0).delay(3000).hide(0);
                    }
                }
                return true;
            }
            var preview_image = function(file, input) {
                $label.parents('.upimgwrap').find('input[type="file"]').data('url', '');
                var $span = $label.find('span:last');
                var size = 185;
                if (settings.thumbnail == 'large') size = 278;
                else if (settings.thumbnail == 'fit') size = $span.width();
                var img = $span.find('img:last').get(0);
                if (img == undefined) {
                    $span.addClass(size > 100 ? 'large' : '').prepend("<img align='absmiddle' style='display:none;' />");
                    img = $span.find('img:last').get(0);
                }
                var reader = new FileReader();
                reader.onload = (function(img) {
                    return function(e) {
                        $(img).one('load',
                            function() {
                                var thumb = get_thumbnail(img, size, file.type);
                                var w = thumb.w,
                                    h = thumb.h;
                                if (settings.thumbnail == 'small') {
                                    w = h = size;
                                };
                                $(img).css({
                                    background: 'url(' + thumb.src + ')',
                                    width: w,
                                    height: h
                                }).attr('src', thumb.src).show();
                            });
                        img.src = e.target.result;
                    }
                })(img);
                reader.readAsDataURL(file);
                // reader = null;
            }
            var reset_input = function() {
                $label.attr({
                    'data-title': settings.btn_choose,
                    'class': ''
                }).find('span:first').attr({
                    'data-title': settings.no_file,
                    'class': ''
                }).find('[class*="icon-"]').attr('class', settings.no_icon).prev('img').remove();
                if ($.browser.msie && $.browser.version == '7.0') {
                    $label.find('span:first').html(settings.no_file);
                }
                if (!settings.no_icon) $label.find('[class*="icon-"]').remove();
                $label.find('span').not(':first').remove();
                if ($this.data('ace_input_files')) {
                    $this.removeData('ace_input_files');
                    $this.removeData('ace_input_method');
                }
                reset_input_field();
                return false;
            }
            var reset_input_field = function() {
                $this.wrap('<form>').closest('form').get(0).reset();
                $this.unwrap();
                $this.val('');
                $this.data('url', '');
            }
            var get_thumbnail = function(img, size, type) {
                var canvas = document.createElement('canvas');
                var w = img.width,
                    h = img.height;
                if (w > size || h > size) {
                    if (w > h) {
                        h = parseInt(size / w * h);
                        w = size;
                    } else {
                        w = parseInt(size / h * w);
                        h = size;
                    }
                }
                canvas.width = w;
                canvas.height = h;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
                return {
                    src: canvas.toDataURL(type == 'image/jpeg' ? type : 'image/png', 10),
                    w: w,
                    h: h
                };
            }
            var show = function(url, star, formIds, starFunc) {
                var $span = $label.find('span:last');
                var img = $span.find('img:last').get(0);
                if (url && url != '' && url != 'undefined') {
                    if (img) {
                        img.src = url;
                    } else {
                        var size = 150;
                        if (settings.thumbnail == 'large') size = 278;
                        else if (settings.thumbnail == 'fit') size = $span.width();
                        img = $('<img>').width(size).attr('src', url);
                        $span.prepend(img);
                    }
                    var $starImag = $("<em>").addClass("img-star img-star-font").html("&#xe66a;");
                    $label.prepend($starImag);
                    if (star) {
                        $starImag.addClass('main');
                    }
                    var sid = $label.parent().parent().data('id');
                    $starImag.on('click', function() {
                        $.each(formIds, function(index, _formId) {
                            $("#form_" + _formId.id).find('.img-star').removeClass('main');
                            if (sid != _formId.id) {
                                _formId.star = false;
                            } else {
                                _formId.star = true;
                                $("#form_" + _formId.id).find('.img-star').addClass('main');
                            }
                        });
                        if ($.isFunction(starFunc)) {
                            starFunc(formIds);
                        }
                    });
                    $label.parent().find('input').remove();
                }
            };
            // 清空输入框
            that.clear = function() {
                reset_input();
            };
            that.show = function(url, star, formIds, starFunc) {
                show(url, star, formIds, starFunc);
            };
        });
    }
})(jQuery);