var connection = {
	params:{},
	innerfailHandler:null,
	subscribers:{},
	init:function() {
		//拼接cometd服务器url
		var cometdURL = location.protocol + "//" + location.host + "/caa-push-rpc/cometd";
    	$.cometd.configure({
    		url: cometdURL,
    		logLevel: 'info',
    		stickyReconnect : false
    	});
    	//增加一个针对每一个channel的监听，判断返回值message的successful字段，为true则表示连接正常，为false则表示连接异常，需要断开之前全部旧有的连接，重新订阅
    	function _metaConnect(message){
    		 var returnInfo=message.successful;//因为当returnInfo为false时，cometd为自动调用handshake操作，握手成功后的注册操作可方到_metaHandshake方法中执行
    		 //此处是一个拍品meta channel的监听,当returnInfo返回为false时，会默认调用handshake方法，故此处暂不做业务处理
        }
       
      //在握手期间启用ack扩展
        $.cometd.ackEnabled = true;
      //配置是否支持websocket协议，此处设置为默认不支持
        $.cometd.websocketEnabled = false;
        //添加底层两个监听器
        $.cometd.addListener('/meta/handshake', function (message){
        	var returnInfo=message.successful;
    		if(returnInfo){//每一次握手成功后然后注册所需要的channel
    			//如果handshake失败,说明推送的服务端有异常,则更改页面刷新时间为10s
    			for(var path in connection.params){
    				//根据要订阅的path获取之前是否已经订阅
    				var oldConnection=connection.subscribers[path];
    				//如果之前已经订阅过，则先取消订阅(此处的取消订阅为被动调用)
    				if(oldConnection){
    					$.cometd.unsubscribe(oldConnection);
    				}
    				//newConnection为新建立的通道
    				var newConnection = $.cometd.subscribe(path, function(message){
    					connection.params[message.channel](message);
    				});
    				//没有新path的新建，有path的话覆盖，将链接放入到对象中
    				connection.subscribers[path] = newConnection;
    			}
    		}else{
    			connection.innerfailHandler;
    		}
        });
        $.cometd.addListener('/meta/connect', _metaConnect);
        //此处与服务器进行握手操作
    	$.cometd.handshake();
	},
	register:function(path,msgHandler,outerFailHandler){
		connection.innerfailHandler=outerFailHandler;
		connection.params[path]=msgHandler;
		//根据要订阅的path获取之前是否已经订阅
		
		//以下几行代码解决火狐浏览器不能收到推送的问题（原因火狐不走handshake握手成功后的回调函数）
		var oldConnection=connection.subscribers[path];
		//如果之前已经订阅过，则先取消订阅(此处的取消订阅为被动调用)
		if(oldConnection){
			$.cometd.unsubscribe(oldConnection);
		}
		//newConnection为新建立的通道
		var newConnection = $.cometd.subscribe(path, function(message){
			connection.params[message.channel](message);
		});
		//没有新path的新建，有path的话覆盖，将链接放入到对象中
		connection.subscribers[path] = newConnection;
	},
	//此处 的取消订阅为主动调用
	unregister:function(path){
		var oldConnection=connection.subscribers[path];
		if(oldConnection){
			$.cometd.unsubscribe(oldConnection);
		}
	}
}
connection.init();

