$(function() {
    $(".J-container-title").headerStyle();
    var $helpcenterleft = $(".helpcenter-left");
    var $helptit = $(".help-tit");
    var offsettop = $helptit.offset().top;
    if ($(window).scrollTop() > offsettop) {
        $(".helpcenter-left").addClass("top");
    }
    $helpcenterleft.find(".menu").each(function(i, cur) {
        if ($(cur).find("dt").find("a").attr("href") == "#"){
            $(cur).find(".arrow").addClass("add").end().find("dd").show();
            return;
        }else{
            $(".menu:eq(3) dd:eq(0) a").addClass("current");
        }
    })
    $(document).on("click scroll", function(e) {
        var $this = $(e.target);
        $(".helpcenter-left").addClass("top");
        if ($this.hasClass("arrow")) {
            e.preventDefault();
            $this.toggleClass("add");
            $this.parents("dt").nextAll("dd").toggle();
        } else if ((/^#\w+/).test($this.attr("href"))) {
            //alert("000")
            $("dd a").removeClass("current");
            $this.addClass("current");

        }
        if ($(window).scrollTop() < offsettop) {
            $(".helpcenter-left").removeClass("top");
        }
    })
})