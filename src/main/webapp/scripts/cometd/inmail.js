(function($) {
    var userId = user.id(); //用户id
    $(document).ready(function() {
        if (userId) {
            // 页面加载完链接cometd,从org.cometd.COOKIE中获取用户信息
            var stateCookie = org.cometd.COOKIE.get('org.cometd.demo.state');
            var state = stateCookie ? org.cometd.JSON.fromJSON(stateCookie) : null;
            var chat = new Chat(state);
        }
    });

    function Chat(state) {
        var _self = this;
        var _wasConnected = false; //连接标识，最开始是未连接的
        var _connected = false;
        var _clientId; //cometd客户端clientId
        var _disconnecting; //断开连接标识
        var _lotSubscription;
        var _msgSubscription;

        this.join = function(clientId) {
            _disconnecting = false;
            if (clientId) {
                _clientId = clientId;
            }
            //拼接cometd服务器url
            var cometdURL = location.protocol + "//" + location.host + "/caa-oc/cometd";

            $.cometd.configure({
                url: cometdURL,
                logLevel: 'info'
            });
            //与服务器简历链接
            $.cometd.handshake();
        };


        //接受系统消息
        this.receiveMsg = function(message) {
            $('.mailNum').html(message.data.msg).css('padding', '0px 3px 2px');
        };

        //更改标的状态
        this.changStatus = function(message) {
            if (message.data.status == 1) {
                $('.bid_ing').hide();
                $('.bid_end').show();
            } else {
                $('.bid_ing').show();
                $('.bid_end').hide();
            }
        }

        //取消订阅信息
        function _unsubscribe() {
            if (_lotSubscription) {
                $.cometd.unsubscribe(_lotSubscription);
            }
            _lotSubscription = null;
            if (_msgSubscription) {
                $.cometd.unsubscribe(_msgSubscription);
            }
            _msgSubscription = null;
        }

        function _subscribe() {
            _msgSubscription = $.cometd.subscribe('/user/message_' + userId, _self.receiveMsg);
        }

        function _connectionInitialized() {
            $.cometd.batch(function() {
                _subscribe();
            });
        }

        function _metaConnect(message) {
            if (_disconnecting) {
                _connected = false;
            } else {
                _wasConnected = _connected;
                _connected = message.successful === true;
            }
        }

        function _metaHandshake(message) {
            if (message.successful) {
                _clientId = message.clientId
                _connectionInitialized();
            }
        }

        $.cometd.addListener('/meta/handshake', _metaHandshake);
        $.cometd.addListener('/meta/connect', _metaConnect);

        // Restore the state, if present
        if (state) {
            setTimeout(function() {
                // This will perform the handshake
                _self.join(state.clientId);
            }, 0);
        } else {
            _self.join(null);
        }

        $(window).unload(function() {
            $.cometd.reload();
            // Save the application state only if the user was chatting
            if (_wasConnected && _clientId) {
                var expires = new Date();
                expires.setTime(expires.getTime() + 5 * 1000);
                org.cometd.COOKIE.set('org.cometd.demo.state', org.cometd.JSON.toJSON({
                    clientId: _clientId
                }), { 'max-age': 5, expires: expires });
            }
        });
    }

})(jQuery);