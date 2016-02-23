$(document).ready(function () {
    //模块尺寸
    $('#main').css('width', $(window).width() - $('#left').width() - 90);
    $('#main').css('marginLeft', $('#left').width() + 75);
  });
  $(window).resize(function () {
    //模块尺寸
    $('#main').css('width', $(window).width() - $('#left').width() - 90);
    $('#main').css('marginLeft', $('#left').width() + 75);
  });
$(function(){
	$('.s_content').each(function(){
		$(this).html($(this).html().substr(0,100))
	})
	
})
  
