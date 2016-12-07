
// ****************************************************************
// ************************** 初始化 ******************************
// ****************************************************************


util.init = function() {
  // json设置
  $.ajaxSetup({
    cache: false,
    type: 'GET',
    dataType: 'json',

    error: function() {
      util.error();
    }
  });

  // default wx share setting
  if (util.config_['is_wx']) {
    util.setDefaultWxShareAppMessage();
    util.setDefaultWxShareTimeline();
  }
  
  $(function(){
    util.simulateBtnClick();
    // 每两秒动态做一次事件绑定，避免动态渲染控件中的btn没有效果
    setInterval(util.simulateBtnClick, 2000);
  });  
};



// ****************************************************************
// ************************** Info，Tips，Errors显示 **************
// ****************************************************************
util.DEFAULT_ERROR_MSG = '网络错误，请稍后重试！';

util.loadingTips = function() {
  util.hideLoadingTips();
  var $node = $('<div id="utilLoading" class="loading"></div>');
  $('body').append($node);
};


util.hideLoadingTips = function() {
  $('#utilLoading').remove();
};

// hideTime: 如果不传入，默认为2s，如果传入0，则需要手动hide
util.info = function(msg, hideTime) {
  util.closeInfo();
  if (undefined === hideTime)
    hideTime = 2000;

  var html = 
    '<div class="tips tips-info">' +
      '<div class="inner"><span>' + msg +
      '</span></div>' +
    '</div>';

  var $node = $(html);
  $('body').append($node);

  function hide() {
    $node.hide();
    $node.remove();
  }
  if (0 !== hideTime)
    setTimeout(hide, hideTime);
};


util.closeInfo = function() {
  $('.tips').remove();
};


util.error = function(msg) {
  util.closeInfo();
  msg = msg || util.DEFAULT_ERROR_MSG;

  var html = 
    '<div class="tips tips-error">' +
      '<div class="inner"><span>' + msg +
      '</span></div>' +
    '</div>';

  var $node = $(html);
  $('body').append($node);

  function hide() {
    $node.hide();
    $node.remove();
  }

  // 两秒后消失
  setTimeout(hide, 2000);
}



// *************************************************************
// ***************** Button相关函数 **********************************
// *************************************************************

util.simulateBtnClick = function(){
  var touchY = 0,
      $btns = $('.btn[click-effect!="true"],.btn-likeness[click-effect!="true"]');

  $btns.on('touchstart', function(e){
    var $btn = $(this);
    if ($btn.attr('disabled') === 'disabled') return;
    $btn.css('opacity', 0.5);

    touchY = e.originalEvent.touches[0].clientY;
  });

  $btns.on('touchmove', function(e){
    var $btn = $(this);
    if ($btn.attr('disabled') === 'disabled') return;
    if (Math.abs(e.originalEvent.touches[0].clientY - touchY) > 5)
      $btn.css('opacity', 1);
  });

  $btns.on('touchend', function(e){
    var $btn = $(this);
    if ($btn.attr('disabled') === 'disabled') return;
    $btn.css('opacity', 1);
  });

  $btns.attr('click-effect', 'true');
};


// *************************************************************
// ***************** 微信分享等相关函数 **********************************
// *************************************************************

util.setDefaultWxShareAppMessage = function(){
  var title = document.title,
      desc = $('meta[name="description"]').attr('content'),
      imgUrl = 'http://res1.ans-original.com/mobile/images/product_pics/post5.jpg';
  wx.ready(function(){
    wx.onMenuShareAppMessage({
      title: title,
      desc: desc,
      link: location.href,
      imgUrl: imgUrl,
      success: function () {},
      cancel: function () {}
    });
  });
};


util.setDefaultWxShareTimeline = function(){
  var title = document.title,
      desc = $('meta[name="description"]').attr('content'),
      imgUrl = 'http://res1.ans-original.com/mobile/images/product_pics/post5.jpg';
  wx.ready(function(){
    wx.onMenuShareTimeline({
      title: title,
      link: location.href,
      imgUrl: imgUrl,
      success: function () {},
      cancel: function () {}
    });
  });
};



function Mask(isShowCloseBtn) {
  UIControl.call(this);
  this.isShowCloseBtn_ = !!isShowCloseBtn;
  this.bg_ = '#f7f7f7';
  // 默认创建浏览器历史，支持back button
  this.createHistory_ = true;
}
util.inherit(Mask, UIControl);


Mask.prototype.init = function(){
  UIControl.prototype.init.call(this);
  
}

Mask.prototype.show = function(){
  if (this.isShown_) return;
  $('html,body').addClass('frozen');
  UIControl.prototype.show.call(this);
  
  //用户按浏览器后退按钮，关闭mask，回退到上层页面
  if (this.createHistory_) {
    var url = util.makeUrl(location.href, {state: (new Date()).getTime()});
    history.pushState({}, "安的鸡尾酒", url);
    var scope = this;
    setTimeout(function () {
      $(window).one('popstate', $.proxy(Mask.prototype.hide, scope));
    }, 0);
  }
};


Mask.prototype.hide = function(){
  $('html,body').removeClass('frozen');
  UIControl.prototype.hide.call(this);
};


Mask.prototype.createUI_ = function(){
  UIControl.prototype.createUI_.call(this);

  this.$container_.addClass('mask');
  this.$container_.css('background', this.bg_);
  if (this.isShowCloseBtn_) {
    this.$container_.append('<a class="btn btn-close" href="javascript:void(0);"></a>');
    this.$container_.on('click', '.btn-close', $.proxy(this.hide, this));
  }

  this.$container_.appendTo('body');
};


// 统一所有列表选择器的基本样式和行为
// 这是个虚拟类，不可被实例化
// 因为并不知道：
//  1. data的获取方式
//  2. data的标准化逻辑
//  3. selector标题等
function Selector(callback) {
  UIControl.call(this);
  this.callback_ = callback;
  this.data_ = null;
  this.btnName_ = '选 择';
  this.title_ = null;
}
util.inherit(Selector, UIControl);


Selector.prototype.show = function(){
  if (this.isShown_) return;
  if (!this.data_) {
    util.loadingTips();
    var deferred = this.requestData_();

    deferred.done($.proxy(function(){
      this.createListUI_();
      this.show();
    }, this));

    deferred.fail(function(msg){
      util.error(msg);
    });

    deferred.always(function(){
      util.hideLoadingTips();
    });

    return;
  }

  UIControl.prototype.show.call(this);
};


Selector.prototype.createUI_ = function(){
  UIControl.prototype.createUI_.call(this);
  this.$container_.addClass('selector');

  if (this.title_) {
    this.$container_.append('<div class="title2">' + this.title_ + '</div>');
  }

  this.$container_.append(
    '<table>' +
      '<tbody>' +
      '</tbody>' +
    '</table>'
  );
  
  this.createListUI_();
};


Selector.prototype.createListUI_ = function(){
  if (!this.data_) return;

  var html = '', i, item;
  for (i = 0; i < this.data_.length; i++) {
    item = this.data_[i];
    html +=
        '<tr data-id="' + item.id + '">' +
          '<td data-type="desc">' + item.left + '</td>' +
          '<td class="auto" data-type="op"><span class="btn btn-red btn-small btn-pick">' + this.btnName_ + '</span></td>' +
        '</tr>';
  }
  this.$container_.find('tbody').html(html);
  this.$container_.on('click', '.btn-pick', $.proxy(function(e){
    var id = $(e.target).closest('tr').attr('data-id');
    this.callback_(id);
  }, this));
};


// 子类重载获取data逻辑, 修改this.data_。
// 返回一个jQuery Deferred对象
//
// 标准的this.data_应表现为
//  [
//    {
//      id: 'xx',
//      left: 'html',
//    },
//    ...
//  ]
Selector.prototype.requestData_ = function(){};


// 选择地址控件
function AddressSelector(callback) {
  Selector.call(this, callback);
  this.title_ = '选择收货地址';
}
util.inherit(AddressSelector, Selector);


AddressSelector.prototype.init = function(data){
  if (data) this.convertData_(data);
  Selector.prototype.init.call(this);
};


AddressSelector.prototype.convertData_ = function(origData){
  var i, address, data = [];
  for (i = 0; i < origData.length; i++) {
    address = origData[i];
    data.push({
      id: address.address_id,
      left:
          '<div class="cont">' +
          '<p>' + address.recipient + '</p>' +
          '<p>' + address.address_str + '</p>' +
          '<p>' + address.tel + '</p>' +
          '</div>'
    });
  }
  this.data_ = data;
};


AddressSelector.prototype.createUI_ = function(){
  Selector.prototype.createUI_.call(this);
  this.$container_.addClass('address-selector');
};


AddressSelector.prototype.requestData_ = function(){
  var deferred = $.Deferred();

  $.ajax(util.makeUrl('/json/address/getlist'), {
    context: this,
    success: function(resp) {
      if (0 != resp.status) {
        deferred.rejectWith(this, resp.msg);
        return;
      }
   
      this.convertData_(resp.data.address_list);
      deferred.resolve();
    },

    error: function(){
      deferred.reject();
    }
  });

  return deferred;
};


// 选择优惠券控件
function CouponSelector(callback) {
  Selector.call(this, callback);
  this.title_ = '选择优惠券';
}
util.inherit(CouponSelector, Selector);


CouponSelector.prototype.init = function(data){
  if (data) this.convertData_(data);
  Selector.prototype.init.call(this);
};


CouponSelector.prototype.convertData_ = function(origData){
  var data = [], i, coupon;
  for (i = 0; i < origData.length; i++) {
    coupon = origData[i];
    data.push({
      id: coupon.user_coupon_id,
      left: this.makeLeftHtml_(coupon)
    });
  }
  data.push({
    id: null,
    left: this.makeLeftHtml_(null)
  });
  
  this.data_ = data;
}

CouponSelector.prototype.createUI_ = function(){
  Selector.prototype.createUI_.call(this);
  this.$container_.addClass('coupon-selector');
};


// 基于coupon数据结构，生成此控件使用的leftHtml
CouponSelector.prototype.makeLeftHtml_ = function(coupon){
  var html = '<div class="f12 cont">';
  if (null === coupon) {
    html += '<span class="grey2">不使用优惠</span>';
  } else {
    html += '<span>' + coupon.coupon_str + '</span></br>' +
      '<span class="f10 grey2">' + coupon.expiration_str + '</span>';
  }
  html += '</div>';
  return html;
};


CouponSelector.prototype.requestData_ = function(){
    util.loadingTips();

    var deferred = new $.Deferred();
    $.ajax(util.makeUrl('/json/coupon/getlist'), {
      context: this,

      success: function(resp) {
        if (0 != resp['status']) {
          deferred.rejectWith(this, resp);
          return;
        }
        
        this.convertData_(resp.data.coupon_list);
        deferred.resolve();
      },

      error: function(){
        deferred.reject();
      },

      complete: function(){
        util.hideLoadingTips();
      }
    });

    return deferred;  
};


// 添加地址控件
function AddAddress(callback) {
  UIControl.call(this);
  this.callback_ = callback;
  this.data_ = null;
  this.provinceId_ = null;
  this.cityId_ = null;
  this.districtId_ = null;
  
  if (_GEO_DATA) this.data_ = _GEO_DATA;

  // 标识是否正在提交新增
  // 避免用户手快添加多个相同地址
  this.isSaving_ = false;
}
util.inherit(AddAddress, UIControl);


AddAddress.prototype.show = function(){
  if (this.isShown_) return;

  if (!this.data_) {
    util.loadingTips();

    $.ajax(util.makeUrl('/json/address/get'), {
      context: this,

      success: function(resp){
        if (0 != resp['status']) {
          util.error(resp.msg);
          return;
        }

        this.data_ = resp.data;
        this.updateSelectUI_(); 
        this.show();
      },

      complete: function(){
        util.hideLoadingTips();
      }
    });

    return;
  }
  
  UIControl.prototype.show.call(this);
};


AddAddress.prototype.updateSelectOptions_ = function ($select, listData, selectedId) {
    var item, html = '', text;
    for (var i = 0; i < listData.length; i++) {
      item = listData[i];
      html += '<option value="' + item['id'] + '"';
      if (i == selectedId) {
        html += ' selected="selected"'
      }
      html += '>' + item['name'] + '</option>';
    }
    $select.html(html);
};


AddAddress.prototype.updateSelectUI_ = function(){
  if (!this.data_) return;
  
  var pid = this.$province_[0].selectedIndex;
  var cid = this.$city_[0].selectedIndex;
  var did = this.$district_[0].selectedIndex;

  if (pid !== this.provinceId_) {
    this.provinceId_ = pid >= 0 ? pid : 0;
    this.cityId_ = 0;
    this.districtId_ = 0;
  } else if (cid !== this.cityId_) {
    this.cityId_ = cid;
    this.districtId_ = 0;
  } else if (did !== this.districtId_) {
    this.districtId_ = did;
  } else {
    return;
  }

  this.updateSelectOptions_(this.$province_, this.data_.provinces, this.provinceId_);
  this.updateSelectOptions_(this.$city_, this.data_.provinces[this.provinceId_].cities, this.cityId_);
  this.updateSelectOptions_(this.$district_, this.data_.provinces[this.provinceId_].cities[this.cityId_].districts, this.districtId_);

  this.$district_.trigger('change');
  this.$city_.trigger('change');
  this.$province_.trigger('change');
};


AddAddress.prototype.isValidData_ = function(){
  var recipient = this.$recipient_.val();
  if (!recipient) {
    util.error("请输入姓名");
    return false;
  }
  if (!util.validName(recipient)) {
    util.error("姓名不可超过10个字");
    return false;
  }

  var tel = this.$tel_.val();
  if (!tel) {
    util.error("请输入手机号");
    return false;
  }
  if (!util.validTel(tel)) {
    util.error("请输入正确的手机号");
    return false;
  }

  var address = this.$address_.val();
  if (!address) {
    util.error('请输入地址');
    return false;
  }
  if (!util.validAddress(address)) {
    util.error('地址不可超过100个字');
    return false;
  }

  return true;
};


AddAddress.prototype.save_ = function(){
  if (this.isSaving_) return;
  if (!this.isValidData_()) return;

  util.loadingTips();
  this.isSaving_ = true;

  $.ajax(util.makeUrl('/json/address/set'), {
    data: {
      address: {
        recipient: this.$recipient_.val(),
        tel: this.$tel_.val(),
        address: this.$address_.val(),
        province_id: this.$province_.val(),
        city_id: this.$city_.val(),
        district_id: this.$district_.val()
      }
    },

    context: this,

    success: function(resp) {
      if (0 != resp['status']) {
        util.error(resp.msg);
        return;
      }

      this.callback_(resp.data.address_id);
    },

    complete: function(){
      util.hideLoadingTips();
      this.isSaving_ = false;
    }
  });
};


AddAddress.prototype.createUI_ = function(){
  UIControl.prototype.createUI_.call(this);

  this.$container_.addClass('addaddress');

  var $mainUI = $(
    '<div class="title2">填写收货人信息</div>' +
    '<div class="h15"></div>' +
    '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td class="name">姓名</td>' +
          '<td class="content"><input class="recipient" type="text" value=""/></td>' +
        '</tr>' +

        '<tr>' +
          '<td class="name">手机</td>' +
          '<td class="content"><input class="tel" type="text" value=""/></td>' +
        '</tr>' +

        '<tr>' +
          '<td class="name">地区</td>' +
          '<td>' +
              '<span class="pretty-select province">' +
                '<select>' +
                '</select>' +
              '</span>' +
              '<span class="pretty-select city">' +
                '<select>' +
                '</select>' +
              '</span>' +
              '<span class="pretty-select district">' +
                '<select>' +
                '</select>' +
              '</span>' +
            '</div>' +
          '</td>' +
        '</tr>' +

        '<tr>' +
          '<td class="name">地址</td>' +
          '<td class="content">' +
            '<input class="address" type="text" value=""/>' +
          '</td>' +
        '</tr>' +

        '<tr>' +
          '<td class="name"></td>' +
          '<td class="content">' +
            '<span class="red">找不到您所在的区？</span>请选择「其他区」，并在地址栏输入所在区和详细地址。' +
          '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>' +
    '<div class="h20"></div>' + 
    '<div class="line"></div>' +
    '<div class="h20"></div>' + 
    '<div >' +
      '<span class="btn btn-red btn-large btn-save">保存</span>' +
    '</div>'
  );

  this.$province_ = $mainUI.find('.province select');
  this.$city_ = $mainUI.find('.city select');
  this.$district_ = $mainUI.find('.district select');
  this.$recipient_ = $mainUI.find('.recipient');
  this.$tel_ = $mainUI.find('.tel');
  this.$address_ = $mainUI.find('.address');

  new PrettySelect(this.$province_);
  new PrettySelect(this.$city_);
  new PrettySelect(this.$district_);

  $mainUI.find('select').on('change', $.proxy(this.updateSelectUI_, this));
  $mainUI.on('click', '.btn-save', $.proxy(this.save_, this));

  this.$container_.append($mainUI);
  this.updateSelectUI_();
};


// 添加地址弹层类
function AddAddressMask(callback) {
  Mask.call(this, false);
  this.callback_ = callback;
  // 添加地址控件, 在createUI_时候被初始化
  this.addAddress_ = null;
}
util.inherit(AddAddressMask, Mask);


AddAddressMask.prototype.show = function(){
  if (this.isShown_) return;
  this.addAddress_.show();
  Mask.prototype.show.call(this);
};


AddAddressMask.prototype.createUI_ = function(){
  Mask.prototype.createUI_.call(this);

  this.$container_.addClass('mask-padding1');

  this.addAddress_ = new AddAddress(this.callback_);
  this.addAddress_.init();
  this.$container_.append(this.addAddress_.getContainer());
};


// 选择优惠券弹层
function CouponSelectorMask(couponData, callback) {
  Mask.call(this, false);
  this.callback_ = callback;
  // 选择优惠券控件
  this.couponSelector_ = null;
  this.couponData_ = couponData;
}
util.inherit(CouponSelectorMask, Mask);


CouponSelectorMask.prototype.createUI_ = function(){
  Mask.prototype.createUI_.call(this);

  this.$container_.addClass('mask-padding1');

  this.couponSelector_ = new CouponSelector($.proxy(function(couponId){
    this.callback_(couponId);
  }, this));
  this.couponSelector_.init(this.couponData_);
  this.$container_.append(this.couponSelector_.getContainer());
};


CouponSelectorMask.prototype.show = function(){
  this.couponSelector_.show();
  Mask.prototype.show.call(this);
};


// 选择地址弹层
function AddressSelectorMask(addressData, callback) {
  Mask.call(this, false);
  this.callback_ = callback;
  this.addressData_ = addressData;
}
util.inherit(AddressSelectorMask, Mask);

AddressSelectorMask.prototype.createUI_ = function(){
  Mask.prototype.createUI_.call(this);

  this.$container_.addClass('mask-address-selector');
  this.$container_.addClass('mask-padding1');

  this.selector_ = new AddressSelector(this.callback_);
  this.selector_.init(this.addressData_);
  this.$container_.append(this.selector_.getContainer());
  this.$container_.append('<div class="h60"></div>');
  var $addBtn = $('<div><span class="btn btn-red btn-large btn-add">新增收货地址</span></div>');

  $addBtn.on('click', '.btn-add', $.proxy(function(e){
    var addAddress = new AddAddressMask($.proxy(function(addressId){
      addAddress.hide();
      this.callback_(addressId);
    }, this));
    addAddress.init();
    addAddress.show();
  }, this));

  this.$container_.append($addBtn);
};

AddressSelectorMask.prototype.show = function(){
  this.selector_.show();
  Mask.prototype.show.call(this);
};



// 给select添加标准样式的一个decorator类
function PrettySelect(select) {
  this.$select_ = $(select);
  this.$span_ = $('<span></span>');
  this.$select_.before(this.$span_);

  this.decorate_();
  this.$select_.on('change', $.proxy(this.decorate_, this));
}


PrettySelect.prototype.decorate_ = function(){
  var val = this.$select_.val(),
      text = this.$select_.find('option[value=' + val + ']').text();
  this.$span_.text(text);
}



// 分享给朋友类
function ShareToFriends(total, $container, callback, title, desc, link, imgUrl) {
  this.$container_ = $container;
  this.callback_ = callback;
  this.title_ = title;
  this.desc_ = desc;
  this.link_ = link;
  this.imgUrl_ = imgUrl;

  this.total_ = total;
  this.count_ = 0;

  var html = 
      '<div><span class="f18 white">已送达&nbsp;</span><span data-type="count" class="f36 red">0</span><span class="f18 white">&nbsp;位朋友</span></div>';

  html += '<div class="h30"></div><div>';
  for (var i = 0; i < total; i++) {
	  html += '<span class="person-empty pdr5 inline-block"></span>';
  }
  html += '</div>';
  this.$container_.html(html);

  this.$count_ = this.$container_.find('[data-type="count"]');
}


ShareToFriends.prototype.share = function(){
  var shareData = {
    title: this.title_,
    desc: this.desc_,
    link: this.link_,
    imgUrl: this.imgUrl_,
    success: $.proxy(this.afterShare_, this)
  };

  wx.ready(function(){
    wx.onMenuShareAppMessage(shareData);
    wx.onMenuShareTimeline(shareData);
  });
};


ShareToFriends.prototype.afterShare_ = function(){
  this.count_++;
  this.$count_.text(this.count_);
  this.$container_.find('.person-empty').first()
      .removeClass('person-empty').addClass('person');

  // 恢复微信默认的share行为处理
  if (this.total_ === this.count_) {
    util.setDefaultWxShareAppMessage();
    util.setDefaultWxShareTimeline();
  }

  this.callback_(this.count_);
};


// 运费减半弹层控件
function CutShippingMask(callback, couponUrl, total) {
  Mask.call(this);
  this.callback_ = callback;
  this.couponUrl_ = couponUrl;
  this.bg_ = 'rgba(0,0,0,.9)';
  this.total_ = total || 3;
}
util.inherit(CutShippingMask, Mask);


CutShippingMask.prototype.createUI_ = function(){
  Mask.prototype.createUI_.call(this);
  
  var html = '<div class="mask-cut-shipping text-c full-width">' +
             '  <div class="imgdiv"><img class="bg" src="' + util.imgResSrc("cut_shipping_head.png") + '"/></div>' +
			 '  <div class="h40"></div>' +

       '	<div data-type="share" class="imgdiv" style="margin-bottom:40px; display:none">' +
			 '    <img class="bg" src="' + util.imgResSrc("cut_shipping_bg.png") + '"/>' +
			 '    <div class="mask-cut-shipping-count">' +
			 '      <div class="display-table"><div data-type="shareContent" class="display-td"></div></div>' +
			 '    </div>' +
			 '  </div>' +

			 '  <div data-type="normalHongbao">' +
             '    <div class="imgdiv"><img class="bg" src="' + util.imgResSrc("cut_shipping_hongbao1.png") + '"/></div>' +
			 '    <div class="h50"></div>' +
			 '  </div>' +
			 '  <div data-type="smallHongbao" style="display:none">' +
			 '    <div class="imgdiv"><img class="bg" src="' + util.imgResSrc("cut_shipping_hongbao2.png") + '"/></div>' +
			 '    <div class="h20"></div>' +
			 '  </div>' +
			 '  <div class="btn-div"><span data-type="btnReject" class="btn btn-red btn-large">我是土豪，不在乎运费</span></div>' +
       '  <div class="h30"></div>';

  this.$container_.append(html);
  var $btn = this.$container_.find('[data-type="btnReject"]');
  $btn.click($.proxy(this.hide, this));

  var $shareContent = this.$container_.find('[data-type="shareContent"]');
  var share = new ShareToFriends(this.total_, $shareContent,
      $.proxy(function(count){
        if (1 == count) {
          this.$container_.find('[data-type="share"]').show();
		  this.$container_.find('[data-type="normalHongbao"]').hide();
		  this.$container_.find('[data-type="smallHongbao"]').show();
        }
        if (this.total_ > count) return;

        // 更新购物车Cookie
        var shoppingCart = JSON.parse(util.Cookie.get('shopping_cart'));
        shoppingCart.shipping_discount_type = 1; // type = 1为half_shipping
        util.Cookie.set('shopping_cart', JSON.stringify(shoppingCart));

        this.callback_();
      }, this),
      '来拿酒钱呀', '就是酒钱嘛', this.couponUrl_,
      'http://res1.ans-original.com/images/wx_share_icon.jpg');
  share.share();  
};


// 菜单Mask
function MenuMask(menu) {
  Mask.call(this, true);
  
  this.menu_ = menu;
  this.createHistory_ = false;
}
util.inherit(MenuMask, Mask);


MenuMask.prototype.createUI_ = function() {
  Mask.prototype.createUI_.call(this);
  
  var html = 
    '<div id="menu">' +
    '  <div class="line"></div>'+
    '  <table class="full-width">';
  for (var i = 0; i < this.menu_.length; i++) {
    html += '<tr><td onclick="location.href=\'' + this.menu_[i][1] +
        '\'">' + this.menu_[i][0] + '</td><td class="auto">' +
        '<img class="menu-arrow" src="' + util.imgResSrc("right_arrow.png") + '"></td></tr>';
  }
  html += '</table></div>';
  this.$container_.append($(html));
  this.$container_.addClass('menu-trans');
};


MenuMask.prototype.show = function() {
  Mask.prototype.show.call(this);
  this.$container_.css({'opacity':1});
}
