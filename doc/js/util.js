util = {};

util.config = function(config) {
  util.config_ = config || {};
};


// 对象的继承工具方法
// 一定要在子类的构造方法之后立刻调用
util.inherit = function (subClass, superClass) {  
  function F() {}  
  F.prototype = superClass.prototype;  
  subClass.prototype = new F();  
  subClass.prototype.constructor = subClass.constructor;  
};


// ****************************************************************
// ************************** HACKS *******************************
// ****************************************************************

// 同步加载json请求（需要url加上js=1），获得返回值
util.getLastJson = function() {
  return _LAST_JSON;
}


// ****************************************************************
// ************************** 表单元素有效性验证 **************
// ****************************************************************

util.validTel = function(tel) {
  return (/1\d{10}$/.test(tel));
};


util.validName = function(recipient) {
    if (!recipient) return false;
    if (recipient.length > 10) return false;
    return true;
};


util.validAddress = function(address) {
    if (!address) return false;
    if (address.length > 100) return false;
    return true;
};


//***************************************************************
//************************字符串、日期等格式化*******************
//***************************************************************

// util.data() ==> 2006-07-02
// util.date("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// util.date("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
util.date = function (fmt, time) {
    fmt = fmt || 'yyyy-MM-dd';
    var date = new Date();
    if (time) date.setTime(parseInt(time));

    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


util.moneyToDisplay = function(money) {
  return '¥' + (money / 100.0).toFixed(2);
};


// ****************************************************************
// ************************** Cookie ******************************
// ****************************************************************
(function(){
  var Cookie = {};

  var decode = decodeURIComponent;
  var encode = encodeURIComponent;


  /**
   * Returns the cookie value for the given name.
   *
   * @param {String} name The name of the cookie to retrieve.
   *
   * @param {Function|Object} options (Optional) An object containing one or
   *     more cookie options: raw (true/false) and converter (a function).
   *     The converter function is run on the value before returning it. The
   *     function is not used if the cookie doesn't exist. The function can be
   *     passed instead of the options object for conveniently. When raw is
   *     set to true, the cookie value is not URI decoded.
   *
   * @return {*} If no converter is specified, returns a string or undefined
   *     if the cookie doesn't exist. If the converter is specified, returns
   *     the value returned from the converter.
   */
  Cookie.get = function(name, options) {
      validateCookieName(name);

      if (typeof options === 'function') {
          options = { converter: options };
      }
      else {
          options = options || {};
      }

      var cookies = parseCookieString(document.cookie, !options['raw']);
      return (options.converter || same)(cookies[name]);
  };


  /**
   * Sets a cookie with a given name and value.
   *
   * @param {string} name The name of the cookie to set.
   *
   * @param {*} value The value to set for the cookie.
   *
   * @param {Object} options (Optional) An object containing one or more
   *     cookie options: path (a string), domain (a string),
   *     expires (number or a Date object), secure (true/false),
   *     and raw (true/false). Setting raw to true indicates that the cookie
   *     should not be URI encoded before being set.
   *
   * @return {string} The created cookie string.
   */
  Cookie.set = function(name, value, options) {
      validateCookieName(name);

      options = options || {};
      var expires = options['expires'];
      var domain = options['domain'];
      var path = options['path'];

      if (!options['raw']) {
          value = encode(String(value));
      }

      var text = name + '=' + value;

      // expires
      var date = expires;
      if (typeof date === 'number') {
          date = new Date();
          date.setDate(date.getDate() + expires);
      }
      if (date instanceof Date) {
          text += '; expires=' + date.toUTCString();
      }

      // domain
      if (isNonEmptyString(domain)) {
          text += '; domain=' + domain;
      }

      // path
      if (isNonEmptyString(path)) {
          text += '; path=' + path;
      }

      // secure
      if (options['secure']) {
          text += '; secure';
      }

      document.cookie = text;
      return text;
  };


  /**
   * Removes a cookie from the machine by setting its expiration date to
   * sometime in the past.
   *
   * @param {string} name The name of the cookie to remove.
   *
   * @param {Object} options (Optional) An object containing one or more
   *     cookie options: path (a string), domain (a string),
   *     and secure (true/false). The expires option will be overwritten
   *     by the method.
   *
   * @return {string} The created cookie string.
   */
  Cookie.remove = function(name, options) {
      options = options || {};
      options['expires'] = new Date(0);
      return this.set(name, '', options);
  };


  function parseCookieString(text, shouldDecode) {
      var cookies = {};

      if (isString(text) && text.length > 0) {

          var decodeValue = shouldDecode ? decode : same;
          var cookieParts = text.split(/;\s/g);
          var cookieName;
          var cookieValue;
          var cookieNameValue;

          for (var i = 0, len = cookieParts.length; i < len; i++) {

              // Check for normally-formatted cookie (name-value)
              cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
              if (cookieNameValue instanceof Array) {
                  try {
                      cookieName = decode(cookieNameValue[1]);
                      cookieValue = decodeValue(cookieParts[i]
                              .substring(cookieNameValue[1].length + 1));
                  } catch (ex) {
                      // Intentionally ignore the cookie -
                      // the encoding is wrong
                  }
              } else {
                  // Means the cookie does not have an "=", so treat it as
                  // a boolean flag
                  cookieName = decode(cookieParts[i]);
                  cookieValue = '';
              }

              if (cookieName) {
                  cookies[cookieName] = cookieValue;
              }
          }

      }

      return cookies;
  }


  // Helpers

  function isString(o) {
      return typeof o === 'string';
  }

  function isNonEmptyString(s) {
      return isString(s) && s !== '';
  }

  function validateCookieName(name) {
      if (!isNonEmptyString(name)) {
          throw new TypeError('Cookie name must be a non-empty string');
      }
  }

  function same(s) {
      return s;
  }


  // 包装为本项目使用的Cookie
  // 默认domain和path参数
  var domain = '.ans-original.com';
  var path = '/';
  util.Cookie = {};
  util.Cookie.get = Cookie.get;
  util.Cookie.remove = Cookie.remove;

  util.Cookie.set = function(name, value, options) {
    options = options || {};
    options.domain = options.domain || domain;
    options.path = options.path || path;
    Cookie.set(name, value, options);
  };
})();


// *************************************************************
// ***************** URL相关函数 **********************************
// *************************************************************

util.URLParser = (function(document) {
    var COMPONENTS = 'protocol host hostname port pathname search hash href'.split(' ');
    var PROPS = COMPONENTS.concat('port requestUri parameters'.split(' '));
    var URI_PATTERN = /^((?:ht|f)tp(?:s?)?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/;
    var prependIf = function(value, char) {
        return value.indexOf(char) !== 0 ? char + value : value;
    };
    var parseParamVal = function(value) {
        if (value.match(/^-?\d+$/)) {
            return parseInt(value, 10);
        } else if (value.match(/^-?\d+\.\d+$/)) {
            return parseFloat(value);
        }
        return value;
    };
    var parseParams = function(query) {
        query = query.substring(1) || '';
        var params = {};
        var pairs = query.split('&');
        if (pairs[0].length > 1) {
            pairs.forEach(function(pair) {
                var param = pair.split("=");
                var key = decodeURI(param[0]);
                var val = parseParamVal(decodeURI(param[1]));
                if (params[key] === undefined) {
                    params[key] = val;
                } else if (typeof params[key] === "string") {
                    params[key] = [params[key], val];
                } else {
                    params[key].push(val);
                }
            }, this);
        }
        return params;
    };
    var self = function(debug) {
        this.debug = debug;
        this.domExists = document !== undefined;
        if (this.domExists) {
            this.aEl = document.createElement('a');
        }
    };
    self.prototype.parse = function(url) {
        var success = false;
        if (this.domExists && !this.debug) {
            this.aEl.href = url;
            if (this.aEl.host == "") {
                this.aEl.href = this.aEl.href;
            }
            COMPONENTS.forEach(function(prop) {
                this[prop] = this.aEl[prop];
            }, this);
            success = true;
        } else {
            var match = url.match(URI_PATTERN);
            if (match) {
                COMPONENTS.forEach(function(component, index) {
                    this[component] = match[index + 1] || '';
                }, this);
                success = true;
            }
        }
        if (success) {
            this.href = url;
            this.hash = this.hash.substr(1);
            this.pathname = prependIf(this.pathname, '/');
            this.requestUri = this.pathname + this.search;
            this.parameters = parseParams(this.search);
        }
        return this.toObj();
    };
    self.prototype.toObj = function() {
        var obj = {};
        PROPS.forEach(function(prop) {
            obj[prop] = this[prop];
        }, this);
        return obj;
    };
    self.prototype.toString = function() {
        return this.href;
    };
    return self;
})(document);


// TODO: 改成js、css、image分别生成url
util.imgResSrc = function(src) {
  return util.config_['res_prefix'] + 'images/' + src + '?_v=' + util.config_['version'];
};


util.makeUrl = function(url, params) {
  var params = params || {},
      parser = new util.URLParser(),
      parts = parser.parse(url),
      exportParams = parts.parameters,
      curUrlParams = parser.parse(location.href).parameters,
      exportUrl = '', key, i;

  // add sticky flags
  for (i = 0; i < util.config_['sticky_flags'].length; i++) {
    key = util.config_['sticky_flags'][i];
    if (undefined !== exportParams[key]) continue;
    if (undefined === curUrlParams[key]) continue;
    exportParams[key] = curUrlParams[key];
  }

  // params merge
  for (key in params) {
    if (undefined === params[key] || null === params[key])
      delete exportParams[key];
    else
      exportParams[key] = params[key];
  }
  
  // export params sort
  var _exportParams = [];
  for (key in exportParams)
    _exportParams.push(key + '=' + exportParams[key]);
  _exportParams.sort();
  exportParams = _exportParams.join('&');

  // build export url
  if (parts['protocol'] && parts['host'])
    exportUrl += parts['protocol'] + '//' + parts['host'];
  exportUrl += parts['pathname'];
  if (_exportParams.length)
    exportUrl += '?' + exportParams;

  return exportUrl;
};



// *************************************************************
// ***************** Logging相关函数 **********************************
// *************************************************************

util.stats = function(action) {
  var url = util.makeUrl('/shared_js/stats.js', {action: action});
  $.ajax(url, {
    cache: false,
    type: 'GET',
    dataType: 'text'
  });
};

// *************************************************************
// ***************** 图片处理函数 **********************************
// *************************************************************
util.fetchImage = function(url, callback) {
    var img = new Image();
    img.src = url;
    img.onload = img.onerror = function () {
      callback(img);
    }
}


util.scaleImage = function($img, $container) {
  $container.css({overflow: 'hidden'});
  $container.css({position: 'relative'});
  $img.css({position: 'absolute'});

  var w = $container.width();
  var h = $container.height();
  var iw = $img.width();
  var ih = $img.height();
  var newW = w;
  var newH = h;
  var top = 0;
  var left = 0;
  if (iw / ih < w / h) {
    newH = Math.round(ih * (newW / iw));
    top = -Math.round((newH - h) / 2);
  } else {
    newW = Math.round(iw * (newH / ih));
    left = -Math.round((newW - w) / 2);
  }
  $img.height(newH);
  $img.width(newW);
  $img.css('left', left + 'px');
  $img.css('top', top + 'px');
}


// 图片预先加载类
function ImageLoader() {
  this.images_ = [];
  this.cur_ = 0;
}

ImageLoader.prototype.addImages = function(images) {
  this.images_ = this.images_.concat(images);
};

ImageLoader.prototype.loadNext = function(count, callback) {
  if (this.cur_ + count > this.images_.length)
    count = this.images_.length - this.cur_;
  
  for (var i = 0; i < count; i++) {
    var img = new Image();
    img.src = this.images_[this.cur_];
    this.cur_++;
    img.onload = img.onerror = function() {
      count--;
      if (0 === count) callback();
    };
  }
};


ImageLoader.prototype.autoLoad = function() {
  if (this.cur_ >= this.images_.length) return;
  
  this.loadNext(1, $.proxy(function() {
    setTimeout(this.autoLoad.bind(this), 0);
  }, this));
};


// *************************************************************
// ***************** 数学计算 **********************************
// *************************************************************
util.rand = function(min, max) {
  return min + Math.round(Math.random() * (max - min));
}


// *************************************************************
// ***************** 动画特效 **********************************
// *************************************************************

util.TRANSITION_END = 'transitionend webkitTransitionEnd oTransitionEnd';

util.fadeInOut = function($element, callback, stayDuration, duration, easingFunction) {
  util.fadeIn($element, function(){
    setTimeout(function(){
      util.fadeOut($element, callback, duration, easingFunction);
    }, stayDuration);
  }, duration, easingFunction);
};


util.fadeIn = function($element, callback, duration, easingFunction, delay) {
  easingFunction = easingFunction || 'ease-out';
  util.fade_('in', $element, callback, duration, easingFunction, delay);
};

// 使用css3动画执行fadeOut效果
util.fadeOut = function($element, callback, duration, easingFunction, delay) {
  easingFunction = easingFunction || 'ease-in';
  util.fade_('out', $element, callback, duration, easingFunction, delay);
};

// 使用css3动画执行opacity淡出、淡入效果
util.fade_ = function(type, $element, callback, duration, easingFunction, delay) {
  duration = duration || '1s';
  easingFunction = easingFunction || 'linear';
  delay = delay || '0s';
  callback = callback || function(){};

  var tsCss = 'opacity ' + duration + ' ' + easingFunction + ' ' + delay;

  if ('in' === type) {
    $element.css({
      'opacity': 0
    });
    $element.show();
  }

  $element.one(util.TRANSITION_END, function(){
    if (type === 'out') $element.hide();
    $element.css({
      'transition': '',
      '-moz-transition': '',
      '-webkit-transition': '',
      '-o-transition': ''
    });
    callback();
  });

  function go(){
    $element.css({
      'transition': tsCss,
      '-moz-transition': tsCss,
      '-webkit-transition': tsCss,
      '-o-transition': tsCss,
      'opacity': ('in' === type) ? 1 : 0
    });
  }
  setTimeout(go, 0);
};


// *************************************************************
// ***************** 渐隐切换控件*******************************
// *************************************************************

function Slider(data, $e0, $e1, duration) {
  this.$active_ = $e1;
  this.$inactive_ = $e0;
  this.swapActive_();
  
  this.duration_ = duration;
  this.inAnimation_ = false;
  
  this.cur_ = 0;
  this.data_ = data;
  this.tickHandle_ = null;
}


Slider.prototype.start = function() {
  this.render_(this.$active_, this.cur_, function() {});
  this.tick_();
};


Slider.prototype.clearTick_ = function() {
  if (!this.tickHandle_) return;
  
  clearTimeout(this.tickHandle_);
  this.tickHandle_ = null;
};


Slider.prototype.tick_ = function() {
  this.clearTick_();
  this.tickHandle_ = setTimeout($.proxy(function() {
    this.slide(this.cur_ + 1);
  }, this), this.duration_);
};


Slider.prototype.onAnimationBegin_ = function() {};


Slider.prototype.swapActive_ = function() {
  this.$active_.css('z-index', 1);
  this.$inactive_.css('z-index', 2);
  var t = this.$active_;
  this.$active_ = this.$inactive_;
  this.$inactive_ = t;
};


Slider.prototype.onAnimationEnd_ = function() {
  this.inAnimation_ = false;

  // 把index图片置顶，之前一张放背后
  this.$active_.hide();
  this.swapActive_();
  
  this.tick_();
};


Slider.prototype.render_ = function($e, index, callback) {
  $e.show();
};


Slider.prototype.slide = function(index) {
  // 此处立即设置inAnimation=true，不能在onAnimationBegin_里面设。
  // 因为render_方法里面可能是异步调用。
  if (this.inAnimation_) return;
  this.inAnimation_ = true;

  if (index >= this.data_.length) index = 0;
  this.cur_ = index;

  this.clearTick_();
  this.render_(this.$inactive_, index, $.proxy(this, 'onAnimationBegin_'));
};


function FadeSlider(data, $e0, $e1, duration) {
  Slider.call(this, data, $e0, $e1, duration);
}
util.inherit(FadeSlider, Slider);


FadeSlider.prototype.onAnimationBegin_ = function() {
  Slider.prototype.onAnimationBegin_.call(this);
  this.$inactive_.css('opacity', 1);
  util.fadeOut(this.$active_, $.proxy(this, 'onAnimationEnd_'));  
};


// *************************************************************

// ***************** UI控件基类 **********************************
// *************************************************************

function UIControl() {
  this.isShown_ = false;
  this.$container_ = null;
  this.data_ = null;
}

UIControl.prototype.init = function(data){
  if (data) this.data_ = data;
  this.createUI_();
  this.hide();
}

UIControl.prototype.show = function() {
 if (this.isShown_) return;
  this.$container_.show();
  this.isShown_ = true;
};


UIControl.prototype.hide = function(){
  this.$container_.hide();
  this.isShown_ = false;
};


UIControl.prototype.getContainer = function(){
  return this.$container_;
};


UIControl.prototype.createUI_ = function(){
  this.$container_ = $('<div></div>');
};
