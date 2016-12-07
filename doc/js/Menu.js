$(document).ready(function(){
//    nav-li hover e
    var num;
    $('.nav-main>span[id]').hover(function(){
       /*图标向上旋转*/
        $(this).children().removeClass().addClass('hover-up');
        /*下拉框出现*/
        var Obj = $(this).attr('id');
        if(Obj){
            var Obj_W = $(this).width();
            var Obj_H = $(this).height();
            num = Obj.substring(3, Obj.length);
            $('#box-'+num).slideDown(200);
            var box_W = $('#box-'+num).width();
            $('#box-'+num).css("top", ($(this).offset().top + Obj_H - 1)+"px");
            $('#box-'+num).css("left", ($(this).offset().left + Obj_W - box_W + 20) + "px");
        }
    },function(){
        /*图标向下旋转*/
        $(this).children().removeClass().addClass('hover-down');
        /*下拉框消失*/
        $('#box-'+num).hide();
    });
//    hidden-box hover e
    $('.hidden-box').hover(function(){
        /*保持图标向上*/
        $('#li-'+num).children().removeClass().addClass('hover-up');
        $(this).show();
    },function(){
        $(this).slideUp(200);
        $('#li-'+num).children().removeClass().addClass('hover-down');
    });
});
