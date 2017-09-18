/**
 * 2017/5/31.
 */
focuspicfn = function(smallimgarr, bigimgarr) {
    var index = 0;
    $(document).on("mouseenter mouseout mousemove", ".showimg,#moveposition,#showsum img", function(e) {
        if (!e) {
            e = window.event; //���ݻ�������
        }
        var $showimg = $(".showimg")
        var currentdom = e.target; //�˴�һֱָ�� showimg
        var $bigpicshow = $("#bigpicshow");
        var $moveposition = $("#moveposition");
        var $position = $showimg.offset();
        var $left = e.pageX - 100 - $position.left;
        var $top = e.pageY - 70 - $position.top;
        if ($left < 0) {
            $left = 0;
        } else if ($left > 420 - 200) {
            $left = 220
        };
        if ($top < 0) {
            $top = 0;
        } else if ($top > 280 - 140) {
            $top = 280 - 140
        }
        var $leftbigpic = -2 * $left;
        var $topbigpic = -2 * $top;
        if (e.type == "mousemove") {
            $moveposition.css({ "left": $left + "px", "top": $top + "px" });
            $("#bigpicshow img").css({ "left": ($leftbigpic + "px"), "top": ($topbigpic + "px") })
        } else if (e.type == "mouseout") {
            $bigpicshow.hide();
            $moveposition.hide();
        } else if (e.type == "mouseenter") {
            if ($(currentdom).parent().hasClass('dis_block_child')) {
                index = $('#showsum img').index($(this))
            }
            if ($(currentdom).parents("#showsum").length == 1) {
                $showimg.attr("src", bigimgarr[index].filePath);
                $moveposition.hide();
                $(currentdom).parent().addClass("current").siblings().removeClass("current");
            } else {
                var filepath = bigimgarr[index] ? bigimgarr[index].filePath : "/themes/images/lotdetail.png";
                $bigpicshow.find("img").attr("src", filepath).end().show();
                $moveposition.show();
            }
        }

    })
}