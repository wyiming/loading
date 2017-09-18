$.fn.lot = function(options) {
    //给type设置默认值
    var depositArrlist = null;
    var buildLotlist = {
        stateArr: ["即将开始", "正在进行", "已流拍", "已成交", "已中止", "已撤拍", "已暂缓", "暂停", ""],
        lotTxtArr: ["起拍价", "成交价", "开拍时间", "当前价", "预&nbsp;&nbsp;&nbsp;&nbsp;计", "结束", "结束时间", "开始", "结束价"],
        stateTxtArr: ["开始", "结束", "", "", "", "", "", "结束", "结束", "结束", "结束", "结束"],
        classNames: ["start", "now", "finish", "finish", "finish", "finish", "finish", "now"],
        moneyClass: ['price-todo', 'price-current', '', 'price-done', '', '', ''],
        appendAllLots: function(self, data, type) {
            //self 指标的 容器 ul
            var $ul = $('<ul  class="lots-list"></ul>');
            $.each(data, function(i, value) {
                var isdeposit; //交了保证金为 true
                if (!depositArrlist && typeof depositArrlist != "undefined" && depositArrlist != 0) {
                    isdeposit = false;
                } else {
                    for (var n in depositArrlist) {
                        if (n == data[i]["id"]) {
                            isdeposit = true; //标的用户交了保证金
                            return;
                        }
                    }
                }
                buildLotlist.buildEveryLot($ul, value, type, isdeposit);
            });
            //这里是把组装好的标的列表代码渲染到页面
            if (self.find("ul").length == 0) { //如果页面没有ul 就创建一个ul
                self.append($ul);
            } else {
                self.find("ul").remove().end().append($ul);
            }
            $('.lot-header-section img').bind("error", function() {
                this.src = "/themes/images/nopic.png";
            });
        },
        /**
         * 构建每一个标的方格
         */
        buildEveryLot: function(self, data, type, isdeposit) {
            var template =
                '<li class="lot-li">' +
                '<a class="lot-li-a"  target="_blank">' +
                '<div class="lot-header-section">' +
                '<img class="lot-pic" src="/themes/images/nopic.png">' +
                '</div>' +
                '<p class="lot-title"></p>' +
                '<div class="info-section">' +
                '<p class="price">' +
                '<span class="label"></span>' +
                '<span class="lot-current-price f24">' +
                '</span>' +
                '</p>' +
                '<p class="price lot-price-assess">' +
                '<span class="label">评估价</span>' +
                '<span class="lot-assess-price"></span>' +
                '</p>' +
                '<p class="lot-time time-doing pai-status-doing-show">' +
                '<span class="label"></span>' +
                '<span class="value pai-countdown pai-xmpp-countdown">' +
                '<span class="time-text"></span>' +
                '</span>' +
                '</p>' +
                '</div>' +
                '<div class="lot-state-div">' +
                '<p  class="num-apply"><span class="pai-xmpp-viewer-count"></span>次围观' +
                '<span class="bid-tips"> | <em class="pai-xmpp-bid-count">0</em>次出价</span>' +
                '</p>' +
                '<p class="num-auction">' +
                '<input type="button" class="done" value="">' +
                '</p>' +
                '</div>' +
                '<div class="flag-section">' +
                '<div class="flag flag-done"></div>' +
                '<p>已成交</p>' +
                '</div>' +
                '<div class="tag-section">' +
                '<div class="pai-tag  tag-buy-restrictions">不限购</div>' +
                '<div class="pai-tag  tag-support-loans">可贷款</div>' +
                '</div>' +
                ' </a>' +
                '</li>';
            var temp = $(template).clone(); //这个是 li
            if (isdeposit) {
                temp.find(".bid-tips").show(); //出价次数隐藏
            } else if (!isdeposit && data.bidCount < 1) {
                temp.find(".bid-tips").hide(); //出价次数显示
            }
            temp = buildLotlist.buildOneLot(temp, data, type);
            self.append(temp);
        },
        /**
         * 替换每一个方格的内容
         * @param self
         * @param data
         */
        buildOneLot: function(self, data, type) {
            self.find('.flag-section').hide();
            if (data.meetType == 0) {
                self.find('.lot-li-a').attr("href", "/pages/lots/profession.html?lotId=" + data.id + "&meetId=" + data.meetId);
            } else if (data.meetType == 1) {
                self.find('.lot-li-a').attr("href", "/pages/lots/profession.html?lotId=" + data.id + "&meetId=" + data.meetId);
            }
            if (data.pic[0]) {
                self.find('.lot-header-section').find('.lot-pic').attr("src", data.pic[0]).attr("alt", data.name);
            }
            self.find('p.lot-title').text(data.name);
            if (data.canLoan == 1 || data.canLoan == "1") {
                self.find('.tag-section').find('.tag-support-loans').show();
            } else {
                self.find('.tag-section').find('.tag-support-loans').hide();
            }
            if (data.isRestricted == 2 || data.isRestricted == "2") {
                self.find('.tag-section').find('.tag-buy-restrictions').show();
            } else {
                self.find('.tag-section').find('.tag-buy-restrictions').hide();
            }
            var _startPrice = data.startPrice;
            var _nowPrice = data.nowPrice;
            var status = data.status;
            var stateTxt = buildLotlist.stateArr[status];
            var timeStartEnd = status == 0 ? data.startTime : data.endTime;
            var currentPrice = _startPrice;
            var _unit = (data.unit) ? '/' + data.unit : '';
            var currentPriceTxt;
            var currentTimeTxt = (status == 0 || status == 1 || status == 7) ? buildLotlist.lotTxtArr[4] : buildLotlist.lotTxtArr[6];
            if (status == 0) {
                currentPrice = _startPrice;
                currentPriceTxt = buildLotlist.lotTxtArr[0]
            } else if (status == 1 || status == 7) {
                currentPrice = _nowPrice > 0 ? _nowPrice : _startPrice;
                currentPriceTxt = buildLotlist.lotTxtArr[3];
                if (data.subStatus == 0) {
                    stateTxt = '等待拍卖师操作';
                }
            } else if (status == 3) {

                currentPrice = _nowPrice > 0 ? _nowPrice : _startPrice;
                if (data.lotMode == 1) {
                    currentPrice = currentPrice;
                }
                currentPriceTxt = buildLotlist.lotTxtArr[1]
            } else if (status == 2) { //流拍
                currentPrice = _startPrice;
                currentPriceTxt = buildLotlist.lotTxtArr[0]
            } else if (status == 5 || status == 4) {
                if (status == 5) {
                    currentTimeTxt = '撤拍时间';
                    timeStartEnd = data.changeTime;
                }
                currentPrice = _startPrice;
                currentPriceTxt = buildLotlist.lotTxtArr[0]
            }

            timeStartEnd = timeStartEnd ? timeStartEnd : '';
            self.find('.info-section').find("p")
                .eq(0).addClass(buildLotlist.moneyClass[status]).find('span[class=label]').text(currentPriceTxt).end().find('.lot-current-price').html(util.formatMoney(currentPrice) + '<em class="f14">元' + _unit + "</em>").end().end()
                .eq(1).find('.lot-assess-price').html(util.formatMoney(data.assertPrice) + '元').end().end()
                .eq(2).find('span[class=label]').text(currentTimeTxt).end()
                .find('.time-text').html(buildLotlist.formatDate_lot(timeStartEnd) + '<span style="color: #999;margin-left: 5px;font-size: 12px">' + buildLotlist.stateTxtArr[status] + '</span>').end().children(".label").html(currentTimeTxt).end().end().end().end()
                .find('.lot-state-div').find("input").attr("class", buildLotlist.classNames[status]).attr("value", stateTxt).end()
                .find('.pai-xmpp-bid-count').text((data.bidCount != null ? data.bidCount : 0)).end()
                .find(".num-apply").find('.pai-xmpp-viewer-count').text(data.onLookerCount);
            if (!timeStartEnd) {
                self.find('.lot-time').html('');
            }
            return self;
        },
        /**
         * 时间戳转字符串时间
         **/
        formatDate_lot: function(timeStamp) {
            if (!timeStamp) {
                return '';
            }
            var time = new Date(parseInt(timeStamp));
            var today = new Date().getDate();
            var IsToday = time.getDate() == today ? true : false;
            var timeFormat = "";
            var timetxt = "";
            timetxt = IsToday ? "今日" : ("0000" + (time.getMonth() + 1)).substring(("0000" + (time.getMonth() + 1)).length - 2) + "月" + ("0000" + time.getDate()).substring(("0000" + time.getDate()).length - 2) + "日"
            timeFormat = timetxt + ("0000" + time.getHours()).substring(("0000" + time.getHours()).length - 2) + ":" +
                ("0000" + time.getMinutes()).substring(("0000" + time.getMinutes()).length - 2);
            return timeFormat;
        },
        auctionGoodShow: function($, window, document, undefined, depositArr) {}
    }
    buildLotlist.appendAllLots(this, options.data)
}