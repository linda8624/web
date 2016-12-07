var PATH = '../';
var auid,mid,amid;

//ajax
function ajax_(url, data, sfun){
    $.ajax({ type: "POST",
             url: PATH+'HIOnline.y?cmd=apply',
             data: {"applyUrl": url, "applyParam": data},
             success: function(html, textStatus, XMLHttpRequest){
               if(sfun) sfun(html);
             }
    });
}

$(document).ready(function(){
	auid = util.Cookie.get('hidataAUID');
	mid = util.Cookie.get('hidataMID');
	amid = util.Cookie.get('hidataAMID');
	
	if($('#topbar')) initTopbar();
	if($('#bottombar')) initBottombar();
	
	if($('.tab').hasClass('userTab')) initTab_user();
	if($('.tab').hasClass('mycandidateTab')) initTab_mycandidate();
	if($('.tab').hasClass('myjobTab')) initTab_myjob();
	
	var url = location.href;
	if(url.indexOf("tab=") > 0)
	var tab = url.split("tab=")[1];
	$("#tab_"+tab).addClass("thistab");
});

$(function(){
	$(".tab span").click(function(){
	 $(this).addClass("thistab").siblings().removeClass("thistab");
	});

	$(".login").click(function(){
		location.href = "user_login.html";
	});
	$(".logout").click(function(){
		location.href = "user_login.html";
	});
	$(".register").click(function(){
		location.href = "user_register.html";
	});
	$(".hunter").click(function(){
		location.href = "../acec/user_login.html";
	});
});

function initTab_user(){
	var s = '';
	s += '<a href="user_edit.html?tab=1"><span class="float-l pdr20" id="tab_1">账号设置</span></a>';
	s += '<a href="user_password_set.html?tab=2"><span class="float-l pd20" id="tab_2">修改密码</span></a>';
	s += '<a href="bill_list.html?tab=3"><span class="float-l pd20" id="tab_3">开票记录</span></a>';
	$(".tab").html(s);
}

function initTab_myjob(){
	var s = '';
	s += '<a href="my_job_list.html?tab=1"><span class="float-l pdr20" id="tab_1">招聘中(99)</span></a>';
	s += '<a href="my_job_list_over.html?tab=2"><span class="float-l pd20" id="tab_2">已下线(9)</span></a>';
	$(".tab").html(s);
}

function initTab_mycandidate(){
	var s = '';
	s += '<a href="my_candidate_list_ing.html?tab=1"><span class="float-l pdr20" id="tab_1">进行中</span></a>';
	s += '<a href="my_candidate_list_collect.html?tab=2"><span class="float-l pd20" id="tab_2">已关注</span></a>';
	s += '<a href="my_candidate_list_over.html?tab=3"><span class="float-l pd20" id="tab_3">已结束</span></a>';
	$(".tab").html(s);
}
function checkLogin(){
	if(auid && auid.length > 20){
		return true;
	}else{
		alert("登录信息已过期，请重新登录！");
		location.href = 'user_login.html';
	}
	return false;
	
}
function initTopbar(){
	var s = '';
	if(location.href.indexOf(".html") < 0 || location.href.indexOf("index", 0) > 0 || location.href.indexOf("login", 0) > 0){
		s += '<div class="main display-table">';
		s += '<div class="display-td middle text-c">';
		s += '<span class="float-l logo">LOGO</span>';
		s += '<span class="float-l bold f19 pd20">我们的Slogan</span>';
		s += '<span class="float-r pdr10"><button class="login btn-default f12 pd20">登录</button></span>';
		s += '<span class="float-r pdr20"><button class="register btn-red f12 pd20">申请注册</button></span>';
		s += '<span class="float-r pdr20"><a class="hunter" href="#">我是猎头</a></span>';
		s += '</div>';
		s += '</div>';
	}else{
		if(checkLogin()){

			s += '<div class="main display-table">';
			s += '<div class="display-td middle text-c">';
			s += '<span class="float-l logo">LOGO</span>';
			s += '<span class="float-l f16 pd20"><a href="main.html">每周精选</a></span>';
			s += '<span class="float-l nav-main">';
			s += '<span class="f16 pd20" id="li-1">我的候选人  <img class="arrow middle" src="../doc/images/arrow.png"></span>';
			s += '</span>';
			s += '<span class="float-l f16 pd20"><a href="my_job_list.html?tab=1">我的职位</a></span>';
			s += '<span class="float-r nav-main">';
			s += '<span class="f12 bold" id="li-4">周翔HR <img class="arrow middle" src="../doc/images/arrow.png"></span>';
			s += '</span>';
			s += '<!--隐藏盒子-->';
			s += '<div id="box-1" class="menu hidden-box hidden-loc-index">';
			s += '<p><span><a href="my_candidate_list_ing.html?tab=1">进行中</a></span></p>';
			s += '<p><span><a href="my_candidate_list_collect.html?tab=1">已关注</a></span></p>';
			s += '<p><span><a href="my_candidate_list_over.html?tab=1">已结束</a></span></p>';
			s += '</div>';
			s += '<div id="box-4" class="menu hidden-box hidden-loc-us">';
			s += '<p><span><a href="user_edit.html?tab=1">账号设置</a></span></p>';
			s += '<p><span><a href="user_password_set.html?tab=2">修改密码</a></span></p>';
			s += '<p><span><a href="bill_list.html?tab=3">开票记录</a></span></p>';
			s += '<p><span><a href="#" class="logout">退出</a></span></p>';
			s += '</div>';
			s += '</div>';	
			
		}
	}
	
	$('#topbar').html(s);
}

function initBottombar(){
	var s = '';
	s += '<div class="main">';
	s += '<table class="full-width"><tr>';
	s += '<td class="pdall10">';
	s += '<div>';
	s += '<span class="pd20">关于我们</span>';
	s += '<span class="pd20">联系我们</span>';
	s += '</div>';
	s += '<div class="pd20 f12 grey"><br>沪ICP备15020167号-1 © 2016 上海xxxx有限公司</div>';
	s += '</td>';
	s += '<td><span class="float-r pdr5">关注我们<br><br><br></span></td>';
	s += '<td class="auto pdall5"><img class="img50" src="../doc/images/link.png"></td>';
	s += '<td class="auto pdall5"><img class="img50" src="../doc/images/link.png"></td>';
	s += '<td class="auto pdall5"><img class="img50" src="../doc/images/link.png"></td>';
	s += '</tr></table>';
	s += '</div>';
	$('#bottombar').html(s);

}

