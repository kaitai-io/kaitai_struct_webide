(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Scrollbar"] = factory();
	else
		root["Scrollbar"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	var _iterator = __webpack_require__(55);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(62);

	var _symbol2 = _interopRequireDefault(_symbol);

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	var _shared = __webpack_require__(89);

	__webpack_require__(129);

	__webpack_require__(145);

	__webpack_require__(158);

	__webpack_require__(173);

	__webpack_require__(187);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

	exports.default = _smoothScrollbar.SmoothScrollbar;


	_smoothScrollbar.SmoothScrollbar.version = ("7.2.10");

	/**
	 * init scrollbar on given element
	 *
	 * @param {Element} elem: target element
	 * @param {Object} options: scrollbar options
	 *
	 * @return {Scrollbar} scrollbar instance
	 */
	_smoothScrollbar.SmoothScrollbar.init = function (elem, options) {
	    if (!elem || elem.nodeType !== 1) {
	        throw new TypeError('expect element to be DOM Element, but got ' + (typeof elem === 'undefined' ? 'undefined' : _typeof(elem)));
	    }

	    if (_shared.sbList.has(elem)) return _shared.sbList.get(elem);

	    elem.setAttribute('data-scrollbar', '');

	    var childNodes = [].concat(_toConsumableArray(elem.childNodes));

	    var div = document.createElement('div');

	    div.innerHTML = '\n        <article class="scroll-content"></article>\n        <aside class="scrollbar-track scrollbar-track-x">\n            <div class="scrollbar-thumb scrollbar-thumb-x"></div>\n        </aside>\n        <aside class="scrollbar-track scrollbar-track-y">\n            <div class="scrollbar-thumb scrollbar-thumb-y"></div>\n        </aside>\n        <canvas class="overscroll-glow"></canvas>\n    ';

	    var scrollContent = div.querySelector('.scroll-content');

	    [].concat(_toConsumableArray(div.childNodes)).forEach(function (el) {
	        return elem.appendChild(el);
	    });

	    childNodes.forEach(function (el) {
	        return scrollContent.appendChild(el);
	    });

	    return new _smoothScrollbar.SmoothScrollbar(elem, options);
	};

	/**
	 * init scrollbars on pre-defined selectors
	 *
	 * @param {Object} options: scrollbar options
	 *
	 * @return {Array} a collection of scrollbar instances
	 */
	_smoothScrollbar.SmoothScrollbar.initAll = function (options) {
	    return [].concat(_toConsumableArray(document.querySelectorAll(_shared.selectors))).map(function (el) {
	        return _smoothScrollbar.SmoothScrollbar.init(el, options);
	    });
	};

	/**
	 * check if scrollbar exists on given element
	 *
	 * @return {Boolean}
	 */
	_smoothScrollbar.SmoothScrollbar.has = function (elem) {
	    return _shared.sbList.has(elem);
	};

	/**
	 * get scrollbar instance through given element
	 *
	 * @param {Element} elem: target scrollbar container
	 *
	 * @return {Scrollbar}
	 */
	_smoothScrollbar.SmoothScrollbar.get = function (elem) {
	    return _shared.sbList.get(elem);
	};

	/**
	 * get all scrollbar instances
	 *
	 * @return {Array} a collection of scrollbars
	 */
	_smoothScrollbar.SmoothScrollbar.getAll = function () {
	    return [].concat(_toConsumableArray(_shared.sbList.values()));
	};

	/**
	 * destroy scrollbar on given element
	 *
	 * @param {Element} elem: target scrollbar container
	 * @param {Boolean} isRemoval: whether node is removing from DOM
	 */
	_smoothScrollbar.SmoothScrollbar.destroy = function (elem, isRemoval) {
	    return _smoothScrollbar.SmoothScrollbar.has(elem) && _smoothScrollbar.SmoothScrollbar.get(elem).destroy(isRemoval);
	};

	/**
	 * destroy all scrollbars in scrollbar instances
	 *
	 * @param {Boolean} isRemoval: whether node is removing from DOM
	 */
	_smoothScrollbar.SmoothScrollbar.destroyAll = function (isRemoval) {
	    _shared.sbList.forEach(function (sb) {
	        sb.destroy(isRemoval);
	    });
	};
	module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(48);
	module.exports = __webpack_require__(12).Array.from;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(5)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(8)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(6)
	  , defined   = __webpack_require__(7);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(9)
	  , $export        = __webpack_require__(10)
	  , redefine       = __webpack_require__(25)
	  , hide           = __webpack_require__(15)
	  , has            = __webpack_require__(26)
	  , Iterators      = __webpack_require__(27)
	  , $iterCreate    = __webpack_require__(28)
	  , setToStringTag = __webpack_require__(44)
	  , getPrototypeOf = __webpack_require__(46)
	  , ITERATOR       = __webpack_require__(45)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	module.exports = true;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(11)
	  , core      = __webpack_require__(12)
	  , ctx       = __webpack_require__(13)
	  , hide      = __webpack_require__(15)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(14);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(16)
	  , createDesc = __webpack_require__(24);
	module.exports = __webpack_require__(20) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(17)
	  , IE8_DOM_DEFINE = __webpack_require__(19)
	  , toPrimitive    = __webpack_require__(23)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(20) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(18);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(20) && !__webpack_require__(21)(function(){
	  return Object.defineProperty(__webpack_require__(22)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(21)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(18)
	  , document = __webpack_require__(11).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(18);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ }),
/* 24 */
/***/ (function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(15);

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	module.exports = {};

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(29)
	  , descriptor     = __webpack_require__(24)
	  , setToStringTag = __webpack_require__(44)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(15)(IteratorPrototype, __webpack_require__(45)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(17)
	  , dPs         = __webpack_require__(30)
	  , enumBugKeys = __webpack_require__(42)
	  , IE_PROTO    = __webpack_require__(39)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(22)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(43).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(16)
	  , anObject = __webpack_require__(17)
	  , getKeys  = __webpack_require__(31);

	module.exports = __webpack_require__(20) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(32)
	  , enumBugKeys = __webpack_require__(42);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(26)
	  , toIObject    = __webpack_require__(33)
	  , arrayIndexOf = __webpack_require__(36)(false)
	  , IE_PROTO     = __webpack_require__(39)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(34)
	  , defined = __webpack_require__(7);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(35);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ }),
/* 35 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(33)
	  , toLength  = __webpack_require__(37)
	  , toIndex   = __webpack_require__(38);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(6)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(6)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(40)('keys')
	  , uid    = __webpack_require__(41);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(11)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ }),
/* 41 */
/***/ (function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ }),
/* 42 */
/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(11).document && document.documentElement;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(16).f
	  , has = __webpack_require__(26)
	  , TAG = __webpack_require__(45)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(40)('wks')
	  , uid        = __webpack_require__(41)
	  , Symbol     = __webpack_require__(11).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(26)
	  , toObject    = __webpack_require__(47)
	  , IE_PROTO    = __webpack_require__(39)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(7);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var ctx            = __webpack_require__(13)
	  , $export        = __webpack_require__(10)
	  , toObject       = __webpack_require__(47)
	  , call           = __webpack_require__(49)
	  , isArrayIter    = __webpack_require__(50)
	  , toLength       = __webpack_require__(37)
	  , createProperty = __webpack_require__(51)
	  , getIterFn      = __webpack_require__(52);

	$export($export.S + $export.F * !__webpack_require__(54)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(17);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(27)
	  , ITERATOR   = __webpack_require__(45)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(16)
	  , createDesc      = __webpack_require__(24);

	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(53)
	  , ITERATOR  = __webpack_require__(45)('iterator')
	  , Iterators = __webpack_require__(27);
	module.exports = __webpack_require__(12).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(35)
	  , TAG = __webpack_require__(45)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(45)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(56), __esModule: true };

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(57);
	module.exports = __webpack_require__(61).f('iterator');

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(58);
	var global        = __webpack_require__(11)
	  , hide          = __webpack_require__(15)
	  , Iterators     = __webpack_require__(27)
	  , TO_STRING_TAG = __webpack_require__(45)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(59)
	  , step             = __webpack_require__(60)
	  , Iterators        = __webpack_require__(27)
	  , toIObject        = __webpack_require__(33);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(8)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ }),
/* 59 */
/***/ (function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ }),
/* 60 */
/***/ (function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(45);

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(63), __esModule: true };

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(64);
	__webpack_require__(75);
	__webpack_require__(76);
	__webpack_require__(77);
	module.exports = __webpack_require__(12).Symbol;

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(11)
	  , has            = __webpack_require__(26)
	  , DESCRIPTORS    = __webpack_require__(20)
	  , $export        = __webpack_require__(10)
	  , redefine       = __webpack_require__(25)
	  , META           = __webpack_require__(65).KEY
	  , $fails         = __webpack_require__(21)
	  , shared         = __webpack_require__(40)
	  , setToStringTag = __webpack_require__(44)
	  , uid            = __webpack_require__(41)
	  , wks            = __webpack_require__(45)
	  , wksExt         = __webpack_require__(61)
	  , wksDefine      = __webpack_require__(66)
	  , keyOf          = __webpack_require__(67)
	  , enumKeys       = __webpack_require__(68)
	  , isArray        = __webpack_require__(71)
	  , anObject       = __webpack_require__(17)
	  , toIObject      = __webpack_require__(33)
	  , toPrimitive    = __webpack_require__(23)
	  , createDesc     = __webpack_require__(24)
	  , _create        = __webpack_require__(29)
	  , gOPNExt        = __webpack_require__(72)
	  , $GOPD          = __webpack_require__(74)
	  , $DP            = __webpack_require__(16)
	  , $keys          = __webpack_require__(31)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });

	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(73).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(70).f  = $propertyIsEnumerable;
	  __webpack_require__(69).f = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(9)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});

	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(15)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(41)('meta')
	  , isObject = __webpack_require__(18)
	  , has      = __webpack_require__(26)
	  , setDesc  = __webpack_require__(16).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(21)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(11)
	  , core           = __webpack_require__(12)
	  , LIBRARY        = __webpack_require__(9)
	  , wksExt         = __webpack_require__(61)
	  , defineProperty = __webpack_require__(16).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(31)
	  , toIObject = __webpack_require__(33);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(31)
	  , gOPS    = __webpack_require__(69)
	  , pIE     = __webpack_require__(70);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ }),
/* 69 */
/***/ (function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ }),
/* 70 */
/***/ (function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(35);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(33)
	  , gOPN      = __webpack_require__(73).f
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(32)
	  , hiddenKeys = __webpack_require__(42).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(70)
	  , createDesc     = __webpack_require__(24)
	  , toIObject      = __webpack_require__(33)
	  , toPrimitive    = __webpack_require__(23)
	  , has            = __webpack_require__(26)
	  , IE8_DOM_DEFINE = __webpack_require__(19)
	  , gOPD           = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(20) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ }),
/* 75 */
/***/ (function(module, exports) {

	

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(66)('asyncIterator');

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(66)('observable');

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperties = __webpack_require__(79);

	var _defineProperties2 = _interopRequireDefault(_defineProperties);

	var _freeze = __webpack_require__(82);

	var _freeze2 = _interopRequireDefault(_freeze);

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SmoothScrollbar = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @export {Class} SmoothScrollbar
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _shared = __webpack_require__(89);

	var _utils = __webpack_require__(112);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * @constructor
	 * Create scrollbar instance
	 *
	 * @param {Element} container: target element
	 * @param {Object} [options]: options
	 */
	var SmoothScrollbar = exports.SmoothScrollbar = function () {
	    function SmoothScrollbar(container) {
	        var _this = this;

	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	        _classCallCheck(this, SmoothScrollbar);

	        // make container focusable
	        container.setAttribute('tabindex', '1');

	        // reset scroll position
	        container.scrollTop = container.scrollLeft = 0;

	        var content = (0, _utils.findChild)(container, 'scroll-content');
	        var canvas = (0, _utils.findChild)(container, 'overscroll-glow');
	        var trackX = (0, _utils.findChild)(container, 'scrollbar-track-x');
	        var trackY = (0, _utils.findChild)(container, 'scrollbar-track-y');

	        (0, _utils.setStyle)(container, {
	            overflow: 'hidden',
	            outline: 'none'
	        });

	        (0, _utils.setStyle)(canvas, {
	            display: 'none',
	            'pointer-events': 'none'
	        });

	        // readonly properties
	        this.__readonly('targets', (0, _freeze2.default)({
	            container: container, content: content,
	            canvas: {
	                elem: canvas,
	                context: canvas.getContext('2d')
	            },
	            xAxis: (0, _freeze2.default)({
	                track: trackX,
	                thumb: (0, _utils.findChild)(trackX, 'scrollbar-thumb-x')
	            }),
	            yAxis: (0, _freeze2.default)({
	                track: trackY,
	                thumb: (0, _utils.findChild)(trackY, 'scrollbar-thumb-y')
	            })
	        })).__readonly('offset', {
	            x: 0,
	            y: 0
	        }).__readonly('thumbOffset', {
	            x: 0,
	            y: 0
	        }).__readonly('limit', {
	            x: Infinity,
	            y: Infinity
	        }).__readonly('movement', {
	            x: 0,
	            y: 0
	        }).__readonly('movementLocked', {
	            x: false,
	            y: false
	        }).__readonly('overscrollRendered', {
	            x: 0,
	            y: 0
	        }).__readonly('overscrollBack', false).__readonly('thumbSize', {
	            x: 0,
	            y: 0,
	            realX: 0,
	            realY: 0
	        }).__readonly('bounding', {
	            top: 0,
	            right: 0,
	            bottom: 0,
	            left: 0
	        }).__readonly('children', []).__readonly('parents', []).__readonly('size', this.getSize()).__readonly('isNestedScrollbar', false);

	        // non-enmurable properties
	        (0, _defineProperties2.default)(this, {
	            __hideTrackThrottle: {
	                value: (0, _utils.debounce)(this.hideTrack.bind(this), 1000, false)
	            },
	            __updateThrottle: {
	                value: (0, _utils.debounce)(this.update.bind(this))
	            },
	            __touchRecord: {
	                value: new _utils.TouchRecord()
	            },
	            __listeners: {
	                value: []
	            },
	            __handlers: {
	                value: []
	            },
	            __children: {
	                value: []
	            },
	            __timerID: {
	                value: {}
	            }
	        });

	        this.__initOptions(options);
	        this.__initScrollbar();

	        // storage
	        _shared.sbList.set(container, this);

	        // observe
	        if (typeof _shared.GLOBAL_ENV.MutationObserver === 'function') {
	            // observe
	            var observer = new _shared.GLOBAL_ENV.MutationObserver(function () {
	                _this.update(true);
	            });

	            observer.observe(content, {
	                childList: true
	            });

	            Object.defineProperty(this, '__observer', {
	                value: observer
	            });
	        }
	    }

	    _createClass(SmoothScrollbar, [{
	        key: 'MAX_OVERSCROLL',
	        get: function get() {
	            var options = this.options,
	                size = this.size;


	            switch (options.overscrollEffect) {
	                case 'bounce':
	                    var diagonal = Math.floor(Math.sqrt(Math.pow(size.container.width, 2) + Math.pow(size.container.height, 2)));
	                    var touchFactor = this.__isMovementLocked() ? 2 : 10;

	                    return _shared.GLOBAL_ENV.TOUCH_SUPPORTED ? (0, _utils.pickInRange)(diagonal / touchFactor, 100, 1000) : (0, _utils.pickInRange)(diagonal / 10, 25, 50);

	                case 'glow':
	                    return 150;

	                default:
	                    return 0;
	            }
	        }
	    }, {
	        key: 'scrollTop',
	        get: function get() {
	            return this.offset.y;
	        }
	    }, {
	        key: 'scrollLeft',
	        get: function get() {
	            return this.offset.x;
	        }
	    }]);

	    return SmoothScrollbar;
	}();

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(80), __esModule: true };

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(81);
	var $Object = __webpack_require__(12).Object;
	module.exports = function defineProperties(T, D){
	  return $Object.defineProperties(T, D);
	};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(10);
	// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
	$export($export.S + $export.F * !__webpack_require__(20), 'Object', {defineProperties: __webpack_require__(30)});

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(83), __esModule: true };

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(84);
	module.exports = __webpack_require__(12).Object.freeze;

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(18)
	  , meta     = __webpack_require__(65).onFreeze;

	__webpack_require__(85)('freeze', function($freeze){
	  return function freeze(it){
	    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(10)
	  , core    = __webpack_require__(12)
	  , fails   = __webpack_require__(21);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(87), __esModule: true };

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(88);
	var $Object = __webpack_require__(12).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(10);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(20), 'Object', {defineProperty: __webpack_require__(16).f});

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _exportAll = __webpack_require__(93);

	(0, _keys2.default)(_exportAll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _exportAll[key];
	    }
	  });
	});

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(91), __esModule: true };

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(92);
	module.exports = __webpack_require__(12).Object.keys;

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(47)
	  , $keys    = __webpack_require__(31);

	__webpack_require__(85)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _globalEnv = __webpack_require__(94);

	(0, _keys2.default)(_globalEnv).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _globalEnv[key];
	    }
	  });
	});

	var _sbList = __webpack_require__(95);

	(0, _keys2.default)(_sbList).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _sbList[key];
	    }
	  });
	});

	var _selectors = __webpack_require__(111);

	(0, _keys2.default)(_selectors).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _selectors[key];
	    }
	  });
	});

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// global environment

	var memoize = function memoize(source) {
	    var res = {};
	    var cache = {};

	    (0, _keys2.default)(source).forEach(function (prop) {
	        (0, _defineProperty2.default)(res, prop, {
	            get: function get() {
	                if (!cache.hasOwnProperty(prop)) {
	                    var getter = source[prop];

	                    cache[prop] = getter();
	                }

	                return cache[prop];
	            }
	        });
	    });

	    return res;
	};

	var getters = {
	    MutationObserver: function MutationObserver() {
	        return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	    },
	    TOUCH_SUPPORTED: function TOUCH_SUPPORTED() {
	        return 'ontouchstart' in document;
	    },
	    EASING_MULTIPLIER: function EASING_MULTIPLIER() {
	        return navigator.userAgent.match(/Android/) ? 0.5 : 0.25;
	    },
	    WHEEL_EVENT: function WHEEL_EVENT() {
	        // is standard `wheel` event supported check
	        return 'onwheel' in window ? 'wheel' : 'mousewheel';
	    }
	};

	var GLOBAL_ENV = exports.GLOBAL_ENV = memoize(getters);

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _map = __webpack_require__(96);

	var _map2 = _interopRequireDefault(_map);

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @module
	 * @export {Map} sbList
	 */

	var sbList = new _map2.default();

	var originSet = sbList.set.bind(sbList);
	var originDelete = sbList.delete.bind(sbList);

	sbList.update = function () {
	    sbList.forEach(function (sb) {
	        sb.__updateTree();
	    });
	};

	// patch #set,#delete with #update method
	sbList.delete = function () {
	    var res = originDelete.apply(undefined, arguments);
	    sbList.update();

	    return res;
	};

	sbList.set = function () {
	    var res = originSet.apply(undefined, arguments);
	    sbList.update();

	    return res;
	};

	exports.sbList = sbList;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(97), __esModule: true };

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(75);
	__webpack_require__(4);
	__webpack_require__(57);
	__webpack_require__(98);
	__webpack_require__(108);
	module.exports = __webpack_require__(12).Map;

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(99);

	// 23.1 Map Objects
	module.exports = __webpack_require__(104)('Map', function(get){
	  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var dP          = __webpack_require__(16).f
	  , create      = __webpack_require__(29)
	  , redefineAll = __webpack_require__(100)
	  , ctx         = __webpack_require__(13)
	  , anInstance  = __webpack_require__(101)
	  , defined     = __webpack_require__(7)
	  , forOf       = __webpack_require__(102)
	  , $iterDefine = __webpack_require__(8)
	  , step        = __webpack_require__(60)
	  , setSpecies  = __webpack_require__(103)
	  , DESCRIPTORS = __webpack_require__(20)
	  , fastKey     = __webpack_require__(65).fastKey
	  , SIZE        = DESCRIPTORS ? '_s' : 'size';

	var getEntry = function(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index !== 'F')return that._i[index];
	  // frozen object case
	  for(entry = that._f; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	};

	module.exports = {
	  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
	    var C = wrapper(function(that, iterable){
	      anInstance(that, C, NAME, '_i');
	      that._i = create(null); // index
	      that._f = undefined;    // first entry
	      that._l = undefined;    // last entry
	      that[SIZE] = 0;         // size
	      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear(){
	        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that._f == entry)that._f = next;
	          if(that._l == entry)that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /*, that = undefined */){
	        anInstance(this, C, 'forEach');
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
	          , entry;
	        while(entry = entry ? entry.n : this._f){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if(DESCRIPTORS)dP(C.prototype, 'size', {
	      get: function(){
	        return defined(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that._f)that._f = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index !== 'F')that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function(C, NAME, IS_MAP){
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function(iterated, kind){
	      this._t = iterated;  // target
	      this._k = kind;      // kind
	      this._l = undefined; // previous
	    }, function(){
	      var that  = this
	        , kind  = that._k
	        , entry = that._l;
	      // revert to the last existing entry
	      while(entry && entry.r)entry = entry.p;
	      // get next entry
	      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if(kind == 'keys'  )return step(0, entry.k);
	      if(kind == 'values')return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(15);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ }),
/* 101 */
/***/ (function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(13)
	  , call        = __webpack_require__(49)
	  , isArrayIter = __webpack_require__(50)
	  , anObject    = __webpack_require__(17)
	  , toLength    = __webpack_require__(37)
	  , getIterFn   = __webpack_require__(52)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(11)
	  , core        = __webpack_require__(12)
	  , dP          = __webpack_require__(16)
	  , DESCRIPTORS = __webpack_require__(20)
	  , SPECIES     = __webpack_require__(45)('species');

	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var global         = __webpack_require__(11)
	  , $export        = __webpack_require__(10)
	  , meta           = __webpack_require__(65)
	  , fails          = __webpack_require__(21)
	  , hide           = __webpack_require__(15)
	  , redefineAll    = __webpack_require__(100)
	  , forOf          = __webpack_require__(102)
	  , anInstance     = __webpack_require__(101)
	  , isObject       = __webpack_require__(18)
	  , setToStringTag = __webpack_require__(44)
	  , dP             = __webpack_require__(16).f
	  , each           = __webpack_require__(105)(0)
	  , DESCRIPTORS    = __webpack_require__(20);

	module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
	  var Base  = global[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
	    new C().entries().next();
	  }))){
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	    meta.NEED = true;
	  } else {
	    C = wrapper(function(target, iterable){
	      anInstance(target, C, NAME, '_c');
	      target._c = new Base;
	      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
	    });
	    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
	      var IS_ADDER = KEY == 'add' || KEY == 'set';
	      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
	        anInstance(this, C, KEY);
	        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
	        var result = this._c[KEY](a === 0 ? 0 : a, b);
	        return IS_ADDER ? this : result;
	      });
	    });
	    if('size' in proto)dP(C.prototype, 'size', {
	      get: function(){
	        return this._c.size;
	      }
	    });
	  }

	  setToStringTag(C, NAME);

	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F, O);

	  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

	  return C;
	};

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx      = __webpack_require__(13)
	  , IObject  = __webpack_require__(34)
	  , toObject = __webpack_require__(47)
	  , toLength = __webpack_require__(37)
	  , asc      = __webpack_require__(106);
	module.exports = function(TYPE, $create){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
	    , create        = $create || asc;
	  return function($this, callbackfn, that){
	    var O      = toObject($this)
	      , self   = IObject(O)
	      , f      = ctx(callbackfn, that, 3)
	      , length = toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = __webpack_require__(107);

	module.exports = function(original, length){
	  return new (speciesConstructor(original))(length);
	};

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(18)
	  , isArray  = __webpack_require__(71)
	  , SPECIES  = __webpack_require__(45)('species');

	module.exports = function(original){
	  var C;
	  if(isArray(original)){
	    C = original.constructor;
	    // cross-realm fallback
	    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
	    if(isObject(C)){
	      C = C[SPECIES];
	      if(C === null)C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(10);

	$export($export.P + $export.R, 'Map', {toJSON: __webpack_require__(109)('Map')});

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var classof = __webpack_require__(53)
	  , from    = __webpack_require__(110);
	module.exports = function(NAME){
	  return function toJSON(){
	    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
	    return from(this);
	  };
	};

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	var forOf = __webpack_require__(102);

	module.exports = function(iter, ITERATOR){
	  var result = [];
	  forOf(iter, false, result.push, result, ITERATOR);
	  return result;
	};


/***/ }),
/* 111 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @module
	 * @export {String} selectors
	 */

	var selectors = exports.selectors = 'scrollbar, [scrollbar], [data-scrollbar]';

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _exportAll = __webpack_require__(113);

	(0, _keys2.default)(_exportAll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _exportAll[key];
	    }
	  });
	});

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _buildCurve = __webpack_require__(114);

	(0, _keys2.default)(_buildCurve).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _buildCurve[key];
	    }
	  });
	});

	var _debounce = __webpack_require__(115);

	(0, _keys2.default)(_debounce).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _debounce[key];
	    }
	  });
	});

	var _findChild = __webpack_require__(116);

	(0, _keys2.default)(_findChild).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _findChild[key];
	    }
	  });
	});

	var _getDelta = __webpack_require__(117);

	(0, _keys2.default)(_getDelta).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getDelta[key];
	    }
	  });
	});

	var _getPointerData = __webpack_require__(118);

	(0, _keys2.default)(_getPointerData).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getPointerData[key];
	    }
	  });
	});

	var _getPosition = __webpack_require__(119);

	(0, _keys2.default)(_getPosition).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getPosition[key];
	    }
	  });
	});

	var _getTouchId = __webpack_require__(120);

	(0, _keys2.default)(_getTouchId).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getTouchId[key];
	    }
	  });
	});

	var _isOneOf = __webpack_require__(121);

	(0, _keys2.default)(_isOneOf).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _isOneOf[key];
	    }
	  });
	});

	var _pickInRange = __webpack_require__(122);

	(0, _keys2.default)(_pickInRange).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _pickInRange[key];
	    }
	  });
	});

	var _setStyle = __webpack_require__(123);

	(0, _keys2.default)(_setStyle).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _setStyle[key];
	    }
	  });
	});

	var _touchRecord = __webpack_require__(124);

	(0, _keys2.default)(_touchRecord).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _touchRecord[key];
	    }
	  });
	});

/***/ }),
/* 114 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @module
	 * @export {Function} buildCurve
	 */

	/**
	 * Build easing curve based on distance and duration
	 * m(n) = m(0) * d^n
	 *
	 * @param {Number} begin
	 * @param {Number} duration
	 *
	 * @return {Array}: points
	 */
	var buildCurve = exports.buildCurve = function buildCurve(distance, duration) {
	  var res = [];

	  if (duration <= 0) return res;

	  var n = Math.round(duration / 1000 * 60) - 1;
	  var d = distance ? Math.pow(1 / Math.abs(distance), 1 / n) : 0;

	  for (var i = 1; i <= n; i++) {
	    res.push(distance - distance * Math.pow(d, i));
	  }

	  // last frame
	  res.push(distance);

	  return res;
	};

/***/ }),
/* 115 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * @module
	 * @export {Function} debounce
	 */

	// debounce timers reset wait
	var RESET_WAIT = 100;

	/**
	 * Call fn if it isn't be called in a period
	 *
	 * @param {Function} fn
	 * @param {Number} [wait]: debounce wait, default is REST_WAIT
	 * @param {Boolean} [immediate]: whether to run task at leading, default is true
	 *
	 * @return {Function}
	 */
	var debounce = exports.debounce = function debounce(fn) {
	    var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : RESET_WAIT;
	    var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

	    if (typeof fn !== 'function') return;

	    var timer = void 0;

	    return function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }

	        if (!timer && immediate) {
	            setTimeout(function () {
	                return fn.apply(undefined, args);
	            });
	        }

	        clearTimeout(timer);

	        timer = setTimeout(function () {
	            timer = undefined;
	            fn.apply(undefined, args);
	        }, wait);
	    };
	};

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

	/**
	 * @module
	 * @export {Function} findChild
	 */

	/**
	 * Find element with specific class name within children, like selector '>'
	 *
	 * @param {Element} parentElem
	 * @param {String} className
	 *
	 * @return {Element}: first matched child
	 */
	var findChild = exports.findChild = function findChild(parentElem, className) {
	    var children = parentElem.children;

	    var res = null;

	    if (children) {
	        [].concat(_toConsumableArray(children)).some(function (elem) {
	            if (elem.className.match(className)) {
	                res = elem;
	                return true;
	            }
	        });
	    }

	    return res;
	};

/***/ }),
/* 117 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * @module
	 * @export {Function} getDelta
	 */

	var DELTA_SCALE = {
	    STANDARD: 1,
	    OTHERS: -3
	};

	var DELTA_MODE = [1.0, 28.0, 500.0];

	var getDeltaMode = function getDeltaMode(mode) {
	    return DELTA_MODE[mode] || DELTA_MODE[0];
	};

	/**
	 * Normalizing wheel delta
	 *
	 * @param {Object} evt: event object
	 */
	var getDelta = exports.getDelta = function getDelta(evt) {
	    if ('deltaX' in evt) {
	        var mode = getDeltaMode(evt.deltaMode);

	        return {
	            x: evt.deltaX / DELTA_SCALE.STANDARD * mode,
	            y: evt.deltaY / DELTA_SCALE.STANDARD * mode
	        };
	    }

	    if ('wheelDeltaX' in evt) {
	        return {
	            x: evt.wheelDeltaX / DELTA_SCALE.OTHERS,
	            y: evt.wheelDeltaY / DELTA_SCALE.OTHERS
	        };
	    }

	    // ie with touchpad
	    return {
	        x: 0,
	        y: evt.wheelDelta / DELTA_SCALE.OTHERS
	    };
	};

/***/ }),
/* 118 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @module
	 * @export {Function} getPointerData
	 */

	/**
	 * Get pointer/touch data
	 * @param {Object} evt: event object
	 */
	var getPointerData = exports.getPointerData = function getPointerData(evt) {
	  // if is touch event, return last item in touchList
	  // else return original event
	  return evt.touches ? evt.touches[evt.touches.length - 1] : evt;
	};

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getPosition = undefined;

	var _getPointerData = __webpack_require__(118);

	/**
	 * Get pointer/finger position
	 * @param {Object} evt: event object
	 *
	 * @return {Object}: position{x, y}
	 */
	var getPosition = exports.getPosition = function getPosition(evt) {
	  var data = (0, _getPointerData.getPointerData)(evt);

	  return {
	    x: data.clientX,
	    y: data.clientY
	  };
	}; /**
	    * @module
	    * @export {Function} getPosition
	    */

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getTouchID = undefined;

	var _getPointerData = __webpack_require__(118);

	/**
	 * Get touch identifier
	 *
	 * @param {Object} evt: event object
	 *
	 * @return {Number}: touch id
	 */
	var getTouchID = exports.getTouchID = function getTouchID(evt) {
	  var data = (0, _getPointerData.getPointerData)(evt);

	  return data.identifier;
	}; /**
	    * @module
	    * @export {Function} getTouchID
	    */

/***/ }),
/* 121 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @module
	 * @export {Function} isOneOf
	 */

	/**
	 * Check if `a` is one of `[...b]`
	 *
	 * @return {Boolean}
	 */
	var isOneOf = exports.isOneOf = function isOneOf(a) {
	  var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	  return b.some(function (v) {
	    return a === v;
	  });
	};

/***/ }),
/* 122 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @module
	 * @export {Function} pickInRange
	 */

	/**
	 * Pick value in range [min, max]
	 * @param {Number} value
	 * @param {Number} [min]
	 * @param {Number} [max]
	 *
	 * @return {Number}
	 */
	var pickInRange = exports.pickInRange = function pickInRange(value) {
	  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -Infinity;
	  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
	  return Math.max(min, Math.min(value, max));
	};

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @module
	 * @export {Function} setStyle
	 */

	var VENDOR_PREFIX = ['webkit', 'moz', 'ms', 'o'];

	var RE = new RegExp('^-(?!(?:' + VENDOR_PREFIX.join('|') + ')-)');

	var autoPrefix = function autoPrefix(styles) {
	    var res = {};

	    (0, _keys2.default)(styles).forEach(function (prop) {
	        if (!RE.test(prop)) {
	            res[prop] = styles[prop];
	            return;
	        }

	        var val = styles[prop];

	        prop = prop.replace(/^-/, '');
	        res[prop] = val;

	        VENDOR_PREFIX.forEach(function (prefix) {
	            res['-' + prefix + '-' + prop] = val;
	        });
	    });

	    return res;
	};

	/**
	 * set css style for target element
	 *
	 * @param {Element} elem: target element
	 * @param {Object} styles: css styles to apply
	 */
	var setStyle = exports.setStyle = function setStyle(elem, styles) {
	    styles = autoPrefix(styles);

	    (0, _keys2.default)(styles).forEach(function (prop) {
	        var cssProp = prop.replace(/^-/, '').replace(/-([a-z])/g, function (m, $1) {
	            return $1.toUpperCase();
	        });
	        elem.style[cssProp] = styles[prop];
	    });
	};

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _assign = __webpack_require__(125);

	var _assign2 = _interopRequireDefault(_assign);

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.TouchRecord = undefined;

	var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @export {Class} TouchRecord
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _getPosition = __webpack_require__(119);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Tracker = function () {
	    function Tracker(touch) {
	        _classCallCheck(this, Tracker);

	        this.updateTime = Date.now();
	        this.delta = { x: 0, y: 0 };
	        this.velocity = { x: 0, y: 0 };
	        this.lastPosition = (0, _getPosition.getPosition)(touch);
	    }

	    _createClass(Tracker, [{
	        key: 'update',
	        value: function update(touch) {
	            var velocity = this.velocity,
	                updateTime = this.updateTime,
	                lastPosition = this.lastPosition;


	            var now = Date.now();
	            var position = (0, _getPosition.getPosition)(touch);

	            var delta = {
	                x: -(position.x - lastPosition.x),
	                y: -(position.y - lastPosition.y)
	            };

	            var duration = now - updateTime || 16;
	            var vx = delta.x / duration * 1e3;
	            var vy = delta.y / duration * 1e3;
	            velocity.x = vx * 0.8 + velocity.x * 0.2;
	            velocity.y = vy * 0.8 + velocity.y * 0.2;

	            this.delta = delta;
	            this.updateTime = now;
	            this.lastPosition = position;
	        }
	    }]);

	    return Tracker;
	}();

	var TouchRecord = exports.TouchRecord = function () {
	    function TouchRecord() {
	        _classCallCheck(this, TouchRecord);

	        this.touchList = {};
	        this.lastTouch = null;
	        this.activeTouchID = undefined;
	    }

	    _createClass(TouchRecord, [{
	        key: '__add',
	        value: function __add(touch) {
	            if (this.__has(touch)) return null;

	            var tracker = new Tracker(touch);

	            this.touchList[touch.identifier] = tracker;

	            return tracker;
	        }
	    }, {
	        key: '__renew',
	        value: function __renew(touch) {
	            if (!this.__has(touch)) return null;

	            var tracker = this.touchList[touch.identifier];

	            tracker.update(touch);

	            return tracker;
	        }
	    }, {
	        key: '__delete',
	        value: function __delete(touch) {
	            return delete this.touchList[touch.identifier];
	        }
	    }, {
	        key: '__has',
	        value: function __has(touch) {
	            return this.touchList.hasOwnProperty(touch.identifier);
	        }
	    }, {
	        key: '__setActiveID',
	        value: function __setActiveID(touches) {
	            this.activeTouchID = touches[touches.length - 1].identifier;
	            this.lastTouch = this.touchList[this.activeTouchID];
	        }
	    }, {
	        key: '__getActiveTracker',
	        value: function __getActiveTracker() {
	            var touchList = this.touchList,
	                activeTouchID = this.activeTouchID;


	            return touchList[activeTouchID];
	        }
	    }, {
	        key: 'isActive',
	        value: function isActive() {
	            return this.activeTouchID !== undefined;
	        }
	    }, {
	        key: 'getDelta',
	        value: function getDelta() {
	            var tracker = this.__getActiveTracker();

	            if (!tracker) {
	                return this.__primitiveValue;
	            }

	            return _extends({}, tracker.delta);
	        }
	    }, {
	        key: 'getVelocity',
	        value: function getVelocity() {
	            var tracker = this.__getActiveTracker();

	            if (!tracker) {
	                return this.__primitiveValue;
	            }

	            return _extends({}, tracker.velocity);
	        }
	    }, {
	        key: 'getLastPosition',
	        value: function getLastPosition() {
	            var coord = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	            var tracker = this.__getActiveTracker() || this.lastTouch;

	            var position = tracker ? tracker.lastPosition : this.__primitiveValue;

	            if (!coord) return _extends({}, position);

	            if (!position.hasOwnProperty(coord)) return 0;

	            return position[coord];
	        }
	    }, {
	        key: 'updatedRecently',
	        value: function updatedRecently() {
	            var tracker = this.__getActiveTracker();

	            return tracker && Date.now() - tracker.updateTime < 30;
	        }
	    }, {
	        key: 'track',
	        value: function track(evt) {
	            var _this = this;

	            var targetTouches = evt.targetTouches;


	            [].concat(_toConsumableArray(targetTouches)).forEach(function (touch) {
	                _this.__add(touch);
	            });

	            return this.touchList;
	        }
	    }, {
	        key: 'update',
	        value: function update(evt) {
	            var _this2 = this;

	            var touches = evt.touches,
	                changedTouches = evt.changedTouches;


	            [].concat(_toConsumableArray(touches)).forEach(function (touch) {
	                _this2.__renew(touch);
	            });

	            this.__setActiveID(changedTouches);

	            return this.touchList;
	        }
	    }, {
	        key: 'release',
	        value: function release(evt) {
	            var _this3 = this;

	            this.activeTouchID = undefined;

	            [].concat(_toConsumableArray(evt.changedTouches)).forEach(function (touch) {
	                _this3.__delete(touch);
	            });

	            return this.touchList;
	        }
	    }, {
	        key: '__primitiveValue',
	        get: function get() {
	            return { x: 0, y: 0 };
	        }
	    }]);

	    return TouchRecord;
	}();

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(126), __esModule: true };

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(127);
	module.exports = __webpack_require__(12).Object.assign;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(10);

	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(128)});

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(31)
	  , gOPS     = __webpack_require__(69)
	  , pIE      = __webpack_require__(70)
	  , toObject = __webpack_require__(47)
	  , IObject  = __webpack_require__(34)
	  , $assign  = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(21)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _exportAll = __webpack_require__(130);

	(0, _keys2.default)(_exportAll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _exportAll[key];
	    }
	  });
	});

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _clearMovement = __webpack_require__(131);

	(0, _keys2.default)(_clearMovement).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _clearMovement[key];
	    }
	  });
	});

	var _destroy = __webpack_require__(132);

	(0, _keys2.default)(_destroy).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _destroy[key];
	    }
	  });
	});

	var _getContentElem = __webpack_require__(133);

	(0, _keys2.default)(_getContentElem).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getContentElem[key];
	    }
	  });
	});

	var _getSize = __webpack_require__(134);

	(0, _keys2.default)(_getSize).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getSize[key];
	    }
	  });
	});

	var _infiniteScroll = __webpack_require__(135);

	(0, _keys2.default)(_infiniteScroll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _infiniteScroll[key];
	    }
	  });
	});

	var _isVisible = __webpack_require__(136);

	(0, _keys2.default)(_isVisible).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _isVisible[key];
	    }
	  });
	});

	var _listener = __webpack_require__(137);

	(0, _keys2.default)(_listener).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _listener[key];
	    }
	  });
	});

	var _manageEvents = __webpack_require__(138);

	(0, _keys2.default)(_manageEvents).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _manageEvents[key];
	    }
	  });
	});

	var _scrollIntoView = __webpack_require__(139);

	(0, _keys2.default)(_scrollIntoView).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _scrollIntoView[key];
	    }
	  });
	});

	var _scrollTo = __webpack_require__(140);

	(0, _keys2.default)(_scrollTo).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _scrollTo[key];
	    }
	  });
	});

	var _setOptions = __webpack_require__(141);

	(0, _keys2.default)(_setOptions).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _setOptions[key];
	    }
	  });
	});

	var _setPosition = __webpack_require__(142);

	(0, _keys2.default)(_setPosition).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _setPosition[key];
	    }
	  });
	});

	var _toggleTrack = __webpack_require__(143);

	(0, _keys2.default)(_toggleTrack).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _toggleTrack[key];
	    }
	  });
	});

	var _update = __webpack_require__(144);

	(0, _keys2.default)(_update).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _update[key];
	    }
	  });
	});

/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Stop scrollbar right away
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.clearMovement = _smoothScrollbar.SmoothScrollbar.prototype.stop = function () {
	  this.movement.x = this.movement.y = 0;
	  cancelAnimationFrame(this.__timerID.scrollTo);
	}; /**
	    * @module
	    * @prototype {Function} clearMovement|stop
	    */

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	var _shared = __webpack_require__(89);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
	                                                                                                                                                                                                              * @module
	                                                                                                                                                                                                              * @prototype {Function} destroy
	                                                                                                                                                                                                              */

	/**
	 * @method
	 * @api
	 * Remove all scrollbar listeners and event handlers
	 *
	 * @param {Boolean} isRemoval: whether node is removing from DOM
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.destroy = function (isRemoval) {
	    var __listeners = this.__listeners,
	        __handlers = this.__handlers,
	        __observer = this.__observer,
	        targets = this.targets;
	    var container = targets.container,
	        content = targets.content;

	    // remove handlers

	    __handlers.forEach(function (_ref) {
	        var evt = _ref.evt,
	            elem = _ref.elem,
	            fn = _ref.fn;

	        elem.removeEventListener(evt, fn);
	    });

	    __handlers.length = __listeners.length = 0;

	    // stop render
	    this.stop();
	    cancelAnimationFrame(this.__timerID.render);

	    // stop observe
	    if (__observer) {
	        __observer.disconnect();
	    }

	    // remove form sbList
	    _shared.sbList.delete(container);

	    if (isRemoval) return;

	    // restore DOM
	    this.scrollTo(0, 0, 300, function () {
	        // check if element has been removed from DOM
	        if (!container.parentNode) {
	            return;
	        }

	        // reset scroll position
	        (0, _utils.setStyle)(container, {
	            overflow: ''
	        });

	        container.scrollTop = container.scrollLeft = 0;

	        // reset content
	        var childNodes = [].concat(_toConsumableArray(content.childNodes));

	        container.innerHTML = '';

	        childNodes.forEach(function (el) {
	            return container.appendChild(el);
	        });
	    });
	};

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Get scroll content element
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.getContentElem = function () {
	  return this.targets.content;
	}; /**
	    * @module
	    * @prototype {Function} getContentElem
	    */

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Get container and content size
	 *
	 * @return {Object}: an object contains container and content's width and height
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.getSize = function () {
	    var container = this.targets.container;
	    var content = this.targets.content;

	    return {
	        container: {
	            // requires `overflow: hidden`
	            width: container.clientWidth,
	            height: container.clientHeight
	        },
	        content: {
	            // border width should be included
	            width: content.offsetWidth - content.clientWidth + content.scrollWidth,
	            height: content.offsetHeight - content.clientHeight + content.scrollHeight
	        }
	    };
	}; /**
	    * @module
	    * @prototype {Function} getSize
	    */

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Create infinite scroll listener
	 *
	 * @param {Function} cb: infinite scroll action
	 * @param {Number} [threshold]: infinite scroll threshold(to bottom), default is 50(px)
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.infiniteScroll = function (cb) {
	    var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;

	    if (typeof cb !== 'function') return;

	    var lastOffset = {
	        x: 0,
	        y: 0
	    };

	    var entered = false;

	    this.addListener(function (status) {
	        var offset = status.offset,
	            limit = status.limit;


	        if (limit.y - offset.y <= threshold && offset.y > lastOffset.y && !entered) {
	            entered = true;
	            setTimeout(function () {
	                return cb(status);
	            });
	        }

	        if (limit.y - offset.y > threshold) {
	            entered = false;
	        }

	        lastOffset = offset;
	    });
	}; /**
	    * @module
	    * @prototype {Function} infiniteScroll
	    */

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Check if an element is visible
	 *
	 * @param  {Element} target  target element
	 * @return {Boolean}
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.isVisible = function (elem) {
	  var bounding = this.bounding;


	  var targetBounding = elem.getBoundingClientRect();

	  // check overlapping
	  var top = Math.max(bounding.top, targetBounding.top);
	  var left = Math.max(bounding.left, targetBounding.left);
	  var right = Math.min(bounding.right, targetBounding.right);
	  var bottom = Math.min(bounding.bottom, targetBounding.bottom);

	  return top < bottom && left < right;
	}; /**
	    * @module
	    * @prototype {Function} isVisible
	    */

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Add scrolling listener
	 *
	 * @param {Function} cb: listener
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.addListener = function (cb) {
	  if (typeof cb !== 'function') return;

	  this.__listeners.push(cb);
	};

	/**
	 * @method
	 * @api
	 * Remove specific listener from all listeners
	 * @param {type} param: description
	 */
	/**
	 * @module
	 * @prototype {Function} addListener
	 *            {Function} removeListener
	 */

	_smoothScrollbar.SmoothScrollbar.prototype.removeListener = function (cb) {
	  if (typeof cb !== 'function') return;

	  this.__listeners.some(function (fn, idx, all) {
	    return fn === cb && all.splice(idx, 1);
	  });
	};

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty2 = __webpack_require__(86);

	var _defineProperty3 = _interopRequireDefault(_defineProperty2);

	var _METHODS;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
	                                                                                                                                                                                                                           * @module
	                                                                                                                                                                                                                           * @prototype {Function} unregisterEvents
	                                                                                                                                                                                                                           */

	var ACTIONS = {
	    REGIESTER: 0,
	    UNREGIESTER: 1
	};

	var METHODS = (_METHODS = {}, _defineProperty(_METHODS, ACTIONS.REGIESTER, 'addEventListener'), _defineProperty(_METHODS, ACTIONS.UNREGIESTER, 'removeEventListener'), _METHODS);

	function matchSomeRules(str, rules) {
	    return !!rules.length && rules.some(function (regex) {
	        return str.match(regex);
	    });
	};

	function manageEvents() {
	    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ACTIONS.REGIESTER;

	    var method = METHODS[action];

	    return function () {
	        for (var _len = arguments.length, rules = Array(_len), _key = 0; _key < _len; _key++) {
	            rules[_key] = arguments[_key];
	        }

	        this.__handlers.forEach(function (handler) {
	            var elem = handler.elem,
	                evt = handler.evt,
	                fn = handler.fn,
	                hasRegistered = handler.hasRegistered;


	            if (hasRegistered && action === ACTIONS.REGIESTER || !hasRegistered && action === ACTIONS.UNREGIESTER) {
	                return;
	            }

	            if (matchSomeRules(evt, rules)) {
	                elem[method](evt, fn);
	                handler.hasRegistered = !hasRegistered;
	            }
	        });
	    };
	};

	_smoothScrollbar.SmoothScrollbar.prototype.registerEvents = manageEvents(ACTIONS.REGIESTER);
	_smoothScrollbar.SmoothScrollbar.prototype.unregisterEvents = manageEvents(ACTIONS.UNREGIESTER);

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Scroll target element into visible area of scrollbar.
	 *
	 * @param  {Element} target                      target element
	 * @param  {Boolean} options.onlyScrollIfNeeded  whether scroll container when target element is visible
	 * @param  {Number}  options.offsetTop           scrolling stop offset to top
	 * @param  {Number}  options.offsetLeft          scrolling stop offset to left
	 * @param  {Number}  options.offsetBottom        scrolling stop offset to bottom
	 * @param  {Boolean} options.alignToTop          align to the top or bottom of parent container
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.scrollIntoView = function (elem) {
	    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	        _ref$onlyScrollIfNeed = _ref.onlyScrollIfNeeded,
	        onlyScrollIfNeeded = _ref$onlyScrollIfNeed === undefined ? false : _ref$onlyScrollIfNeed,
	        _ref$offsetTop = _ref.offsetTop,
	        offsetTop = _ref$offsetTop === undefined ? 0 : _ref$offsetTop,
	        _ref$offsetLeft = _ref.offsetLeft,
	        offsetLeft = _ref$offsetLeft === undefined ? 0 : _ref$offsetLeft,
	        _ref$offsetBottom = _ref.offsetBottom,
	        offsetBottom = _ref$offsetBottom === undefined ? 0 : _ref$offsetBottom,
	        _ref$alignToTop = _ref.alignToTop,
	        alignToTop = _ref$alignToTop === undefined ? true : _ref$alignToTop;

	    var targets = this.targets,
	        bounding = this.bounding;


	    if (!elem || !targets.container.contains(elem)) return;

	    var targetBounding = elem.getBoundingClientRect();

	    if (onlyScrollIfNeeded && this.isVisible(elem)) return;

	    this.__setMovement(targetBounding.left - bounding.left - offsetLeft, alignToTop ? targetBounding.top - bounding.top - offsetTop : targetBounding.bottom - bounding.bottom - offsetBottom);
	}; /**
	    * @module
	    * @prototype {Function} scrollIntoView
	    */

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _utils = __webpack_require__(112);

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Scrolling scrollbar to position with transition
	 *
	 * @param {Number} [x]: scrollbar position in x axis
	 * @param {Number} [y]: scrollbar position in y axis
	 * @param {Number} [duration]: transition duration
	 * @param {Function} [cb]: callback
	 */
	/**
	 * @module
	 * @prototype {Function} scrollTo
	 */

	_smoothScrollbar.SmoothScrollbar.prototype.scrollTo = function () {
	    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.offset.x;
	    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.offset.y;

	    var _this = this;

	    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	    var cb = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	    var options = this.options,
	        offset = this.offset,
	        limit = this.limit,
	        __timerID = this.__timerID;


	    cancelAnimationFrame(__timerID.scrollTo);
	    cb = typeof cb === 'function' ? cb : function () {};

	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        x = Math.round(x);
	        y = Math.round(y);
	    }

	    var startX = offset.x;
	    var startY = offset.y;

	    var disX = (0, _utils.pickInRange)(x, 0, limit.x) - startX;
	    var disY = (0, _utils.pickInRange)(y, 0, limit.y) - startY;

	    var curveX = (0, _utils.buildCurve)(disX, duration);
	    var curveY = (0, _utils.buildCurve)(disY, duration);

	    var totalFrame = curveX.length;
	    var frame = 0;

	    var scroll = function scroll() {
	        _this.setPosition(startX + curveX[frame], startY + curveY[frame]);

	        frame++;

	        if (frame === totalFrame) {
	            requestAnimationFrame(function () {
	                cb(_this);
	            });
	        } else {
	            __timerID.scrollTo = requestAnimationFrame(scroll);
	        }
	    };

	    scroll();
	};

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Set scrollbar options
	 *
	 * @param {Object} options
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.setOptions = function () {
	  var _this = this;

	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  (0, _keys2.default)(options).forEach(function (prop) {
	    if (!_this.options.hasOwnProperty(prop) || options[prop] === undefined) return;

	    _this.options[prop] = options[prop];
	  });
	}; /**
	    * @module
	    * @prototype {Function} setOptions
	    */

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _assign = __webpack_require__(125);

	var _assign2 = _interopRequireDefault(_assign);

	var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
	                                                                                                                                                                                                                                                                      * @module
	                                                                                                                                                                                                                                                                      * @prototype {Function} setPosition
	                                                                                                                                                                                                                                                                      */

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _utils = __webpack_require__(112);

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @api
	 * Set scrollbar position without transition
	 *
	 * @param {Number} [x]: scrollbar position in x axis
	 * @param {Number} [y]: scrollbar position in y axis
	 * @param {Boolean} [withoutCallbacks]: disable callback functions temporarily
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.setPosition = function () {
	    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.offset.x;
	    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.offset.y;
	    var withoutCallbacks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	    this.__hideTrackThrottle();

	    var status = {};
	    var options = this.options,
	        offset = this.offset,
	        limit = this.limit,
	        targets = this.targets,
	        __listeners = this.__listeners;


	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        x = Math.round(x);
	        y = Math.round(y);
	    }

	    if (x !== offset.x) this.showTrack('x');
	    if (y !== offset.y) this.showTrack('y');

	    x = (0, _utils.pickInRange)(x, 0, limit.x);
	    y = (0, _utils.pickInRange)(y, 0, limit.y);

	    if (x === offset.x && y === offset.y) return;

	    status.direction = {
	        x: x === offset.x ? 'none' : x > offset.x ? 'right' : 'left',
	        y: y === offset.y ? 'none' : y > offset.y ? 'down' : 'up'
	    };

	    this.__readonly('offset', { x: x, y: y });

	    status.limit = _extends({}, limit);
	    status.offset = _extends({}, this.offset);

	    // reset thumb position after offset update
	    this.__setThumbPosition();

	    (0, _utils.setStyle)(targets.content, {
	        '-transform': 'translate3d(' + -x + 'px, ' + -y + 'px, 0)'
	    });

	    // invoke all listeners
	    if (withoutCallbacks) return;

	    __listeners.forEach(function (fn) {
	        if (options.syncCallbacks) {
	            fn(status);
	        } else {
	            requestAnimationFrame(function () {
	                fn(status);
	            });
	        }
	    });
	};

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty2 = __webpack_require__(86);

	var _defineProperty3 = _interopRequireDefault(_defineProperty2);

	var _METHODS;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
	                                                                                                                                                                                                                           * @module
	                                                                                                                                                                                                                           * @prototype {Function} showTrack
	                                                                                                                                                                                                                           * @prototype {Function} hideTrack
	                                                                                                                                                                                                                           */

	var ACTIONS = {
	    SHOW: 0,
	    HIDE: 1
	};

	var CLASS_NAMES = {
	    TRACK: 'show',
	    CONTAINER: 'scrolling'
	};

	var METHODS = (_METHODS = {}, _defineProperty(_METHODS, ACTIONS.SHOW, 'add'), _defineProperty(_METHODS, ACTIONS.HIDE, 'remove'), _METHODS);

	function toggleTrack() {
	    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ACTIONS.SHOW;

	    var method = METHODS[action];

	    /**
	     * toggle scrollbar track on given direction
	     *
	     * @param {String} direction: which direction of tracks to show/hide, default is 'both'
	     */
	    return function () {
	        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'both';
	        var options = this.options,
	            movement = this.movement,
	            _targets = this.targets,
	            container = _targets.container,
	            xAxis = _targets.xAxis,
	            yAxis = _targets.yAxis;

	        // add/remove scrolling class to container

	        if (movement.x || movement.y) {
	            container.classList.add(CLASS_NAMES.CONTAINER);
	        } else {
	            container.classList.remove(CLASS_NAMES.CONTAINER);
	        }

	        // keep showing
	        if (options.alwaysShowTracks && action === ACTIONS.HIDE) return;

	        direction = direction.toLowerCase();

	        if (direction === 'both') {
	            xAxis.track.classList[method](CLASS_NAMES.TRACK);
	            yAxis.track.classList[method](CLASS_NAMES.TRACK);
	        }

	        if (direction === 'x') {
	            xAxis.track.classList[method](CLASS_NAMES.TRACK);
	        }

	        if (direction === 'y') {
	            yAxis.track.classList[method](CLASS_NAMES.TRACK);
	        }
	    };
	};

	_smoothScrollbar.SmoothScrollbar.prototype.showTrack = toggleTrack(ACTIONS.SHOW);
	_smoothScrollbar.SmoothScrollbar.prototype.hideTrack = toggleTrack(ACTIONS.HIDE);

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _utils = __webpack_require__(112);

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @this-binding
	 *
	 * Update canvas size
	 */
	/**
	 * @module
	 * @prototype {Function} update
	 */

	function updateCanvas() {
	    if (this.options.overscrollEffect !== 'glow') return;

	    var targets = this.targets,
	        size = this.size;
	    var _targets$canvas = targets.canvas,
	        elem = _targets$canvas.elem,
	        context = _targets$canvas.context;

	    var DPR = window.devicePixelRatio || 1;

	    var nextWidth = size.container.width * DPR;
	    var nextHeight = size.container.height * DPR;

	    if (nextWidth === elem.width && nextHeight === elem.height) {
	        return;
	    }

	    elem.width = nextWidth;
	    elem.height = nextHeight;

	    context.scale(DPR, DPR);
	};

	/**
	 * @this-binding
	 *
	 * Update scrollbar track and thumb
	 */
	function updateTrack() {
	    var size = this.size,
	        thumbSize = this.thumbSize,
	        _targets = this.targets,
	        xAxis = _targets.xAxis,
	        yAxis = _targets.yAxis;

	    // hide scrollbar if content size less than container

	    (0, _utils.setStyle)(xAxis.track, {
	        'display': size.content.width <= size.container.width ? 'none' : 'block'
	    });
	    (0, _utils.setStyle)(yAxis.track, {
	        'display': size.content.height <= size.container.height ? 'none' : 'block'
	    });

	    // use percentage value for thumb
	    (0, _utils.setStyle)(xAxis.thumb, {
	        'width': thumbSize.x + 'px'
	    });
	    (0, _utils.setStyle)(yAxis.thumb, {
	        'height': thumbSize.y + 'px'
	    });
	}

	/**
	 * @this-binding
	 *
	 * Re-calculate sizes:
	 *     1. offset limit
	 *     2. thumb sizes
	 */
	function update() {
	    var options = this.options;


	    this.__updateBounding();

	    var size = this.getSize();
	    var newLimit = {
	        x: Math.max(size.content.width - size.container.width, 0),
	        y: Math.max(size.content.height - size.container.height, 0)
	    };

	    var thumbSize = {
	        // real thumb sizes
	        realX: size.container.width / size.content.width * size.container.width,
	        realY: size.container.height / size.content.height * size.container.height
	    };

	    // rendered thumb sizes
	    thumbSize.x = Math.max(thumbSize.realX, options.thumbMinSize);
	    thumbSize.y = Math.max(thumbSize.realY, options.thumbMinSize);

	    this.__readonly('size', size).__readonly('limit', newLimit).__readonly('thumbSize', thumbSize);

	    // update appearance
	    updateTrack.call(this);
	    updateCanvas.call(this);

	    // re-positioning
	    this.setPosition();
	    this.__setThumbPosition();
	};

	/**
	 * @method
	 * @api
	 * Update scrollbars appearance
	 *
	 * @param {Boolean} inAsync: update asynchronous
	 */
	_smoothScrollbar.SmoothScrollbar.prototype.update = function (inAsync) {
	    if (inAsync) {
	        requestAnimationFrame(update.bind(this));
	    } else {
	        update.call(this);
	    }
	};

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _exportAll = __webpack_require__(146);

	(0, _keys2.default)(_exportAll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _exportAll[key];
	    }
	  });
	});

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _addMovement = __webpack_require__(147);

	(0, _keys2.default)(_addMovement).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _addMovement[key];
	    }
	  });
	});

	var _movementLock = __webpack_require__(148);

	(0, _keys2.default)(_movementLock).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _movementLock[key];
	    }
	  });
	});

	var _renderOverscroll = __webpack_require__(149);

	(0, _keys2.default)(_renderOverscroll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _renderOverscroll[key];
	    }
	  });
	});

	var _render = __webpack_require__(154);

	(0, _keys2.default)(_render).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _render[key];
	    }
	  });
	});

	var _setMovement = __webpack_require__(155);

	(0, _keys2.default)(_setMovement).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _setMovement[key];
	    }
	  });
	});

	var _shouldPropagateMovement = __webpack_require__(156);

	(0, _keys2.default)(_shouldPropagateMovement).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _shouldPropagateMovement[key];
	    }
	  });
	});

	var _willOverscroll = __webpack_require__(157);

	(0, _keys2.default)(_willOverscroll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _willOverscroll[key];
	    }
	  });
	});

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _utils = __webpack_require__(112);

	var _smoothScrollbar = __webpack_require__(78);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
	                                                                                                                                                                                                              * @module
	                                                                                                                                                                                                              * @prototype {Function} __addMovement
	                                                                                                                                                                                                              */

	function __addMovement() {
	    var deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    var deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	    var allowOverscroll = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	    var limit = this.limit,
	        options = this.options,
	        movement = this.movement;


	    this.__updateThrottle();

	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        deltaX = Math.round(deltaX);
	        deltaY = Math.round(deltaY);
	    }

	    var x = movement.x + deltaX;
	    var y = movement.y + deltaY;

	    if (limit.x === 0) x = 0;
	    if (limit.y === 0) y = 0;

	    var deltaLimit = this.__getDeltaLimit(allowOverscroll);

	    movement.x = _utils.pickInRange.apply(undefined, [x].concat(_toConsumableArray(deltaLimit.x)));
	    movement.y = _utils.pickInRange.apply(undefined, [y].concat(_toConsumableArray(deltaLimit.y)));
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__addMovement', {
	    value: __addMovement,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var DIRECTIONS = ['x', 'y'];

	// only lock movement on direction that is scrolling onto edge
	/**
	 * @module
	 * @prototype {Function} __autoLockMovement
	 */

	function __autoLockMovement() {
	    var _this = this;

	    var movement = this.movement,
	        movementLocked = this.movementLocked;


	    DIRECTIONS.forEach(function (dir) {
	        movementLocked[dir] = movement[dir] && _this.__willOverscroll(dir, movement[dir]);
	    });
	};

	function __unlockMovement() {
	    var movementLocked = this.movementLocked;


	    DIRECTIONS.forEach(function (dir) {
	        movementLocked[dir] = false;
	    });
	};

	function __isMovementLocked() {
	    var movementLocked = this.movementLocked;


	    return movementLocked.x || movementLocked.y;
	}

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__autoLockMovement', {
	    value: __autoLockMovement,
	    writable: true,
	    configurable: true
	});

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__unlockMovement', {
	    value: __unlockMovement,
	    writable: true,
	    configurable: true
	});

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__isMovementLocked', {
	    value: __isMovementLocked,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _assign = __webpack_require__(125);

	var _assign2 = _interopRequireDefault(_assign);

	var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
	                                                                                                                                                                                                                                                                      * @module
	                                                                                                                                                                                                                                                                      * @prototype {Function} __renderOverscroll
	                                                                                                                                                                                                                                                                      */

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	var _overscroll = __webpack_require__(150);

	var _shared = __webpack_require__(89);

	var _utils = __webpack_require__(112);

	// @this-binding
	function calcNext() {
	    var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	    if (!dir) return;

	    var options = this.options,
	        movement = this.movement,
	        overscrollRendered = this.overscrollRendered,
	        MAX_OVERSCROLL = this.MAX_OVERSCROLL;


	    var dest = movement[dir] = (0, _utils.pickInRange)(movement[dir], -MAX_OVERSCROLL, MAX_OVERSCROLL);
	    var damping = options.overscrollDamping;

	    var next = overscrollRendered[dir] + (dest - overscrollRendered[dir]) * damping;

	    if (options.renderByPixels) {
	        next |= 0;
	    }

	    if (!this.__isMovementLocked() && Math.abs(next - overscrollRendered[dir]) < 0.1) {
	        next -= dest / Math.abs(dest || 1);
	    }

	    if (Math.abs(next) < Math.abs(overscrollRendered[dir])) {
	        this.__readonly('overscrollBack', true);
	    }

	    if (next * overscrollRendered[dir] < 0 || Math.abs(next) <= 1) {
	        next = 0;
	        this.__readonly('overscrollBack', false);
	    }

	    overscrollRendered[dir] = next;
	}

	// @this-bind
	function shouldUpdate(lastRendered) {
	    var __touchRecord = this.__touchRecord,
	        overscrollRendered = this.overscrollRendered;

	    // has unrendered pixels?

	    if (overscrollRendered.x !== lastRendered.x || overscrollRendered.y !== lastRendered.y) return true;

	    // is touch position updated?
	    if (_shared.GLOBAL_ENV.TOUCH_SUPPORTED && __touchRecord.updatedRecently()) return true;

	    return false;
	}

	// @this-binding
	function __renderOverscroll() {
	    var _this = this;

	    var dirs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	    if (!dirs.length || !this.options.overscrollEffect) return;

	    var options = this.options,
	        overscrollRendered = this.overscrollRendered;


	    var lastRendered = _extends({}, overscrollRendered);

	    dirs.forEach(function (dir) {
	        return calcNext.call(_this, dir);
	    });

	    if (!shouldUpdate.call(this, lastRendered)) return;

	    // x,y is same direction as it's in `setPosition(x, y)`
	    switch (options.overscrollEffect) {
	        case 'bounce':
	            return _overscroll.overscrollBounce.call(this, overscrollRendered.x, overscrollRendered.y);
	        case 'glow':
	            return _overscroll.overscrollGlow.call(this, overscrollRendered.x, overscrollRendered.y);
	        default:
	            return;
	    }
	}

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__renderOverscroll', {
	    value: __renderOverscroll,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _exportAll = __webpack_require__(151);

	(0, _keys2.default)(_exportAll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _exportAll[key];
	    }
	  });
	});

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _bounce = __webpack_require__(152);

	(0, _keys2.default)(_bounce).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _bounce[key];
	    }
	  });
	});

	var _glow = __webpack_require__(153);

	(0, _keys2.default)(_glow).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _glow[key];
	    }
	  });
	});

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.overscrollBounce = overscrollBounce;

	var _utils = __webpack_require__(112);

	function overscrollBounce(x, y) {
	    var size = this.size,
	        offset = this.offset,
	        targets = this.targets,
	        thumbOffset = this.thumbOffset;
	    var xAxis = targets.xAxis,
	        yAxis = targets.yAxis,
	        content = targets.content;


	    (0, _utils.setStyle)(content, {
	        '-transform': 'translate3d(' + -(offset.x + x) + 'px, ' + -(offset.y + y) + 'px, 0)'
	    });

	    if (x) {
	        var ratio = size.container.width / (size.container.width + Math.abs(x));

	        (0, _utils.setStyle)(xAxis.thumb, {
	            '-transform': 'translate3d(' + thumbOffset.x + 'px, 0, 0) scale3d(' + ratio + ', 1, 1)',
	            '-transform-origin': x < 0 ? 'left' : 'right'
	        });
	    }

	    if (y) {
	        var _ratio = size.container.height / (size.container.height + Math.abs(y));

	        (0, _utils.setStyle)(yAxis.thumb, {
	            '-transform': 'translate3d(0, ' + thumbOffset.y + 'px, 0) scale3d(1, ' + _ratio + ', 1)',
	            '-transform-origin': y < 0 ? 'top' : 'bottom'
	        });
	    }
	} /**
	   * @module
	   * @this-bind
	   * @export {Function} overscrollBounce
	   */

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.overscrollGlow = overscrollGlow;

	var _utils = __webpack_require__(112);

	var GLOW_MAX_OPACITY = 0.75; /**
	                              * @module
	                              * @this-bind
	                              * @export {Function} overscrollGlow
	                              */

	var GLOW_MAX_OFFSET = 0.25;

	function overscrollGlow(x, y) {
	    var size = this.size,
	        targets = this.targets,
	        options = this.options;
	    var _targets$canvas = targets.canvas,
	        canvas = _targets$canvas.elem,
	        ctx = _targets$canvas.context;


	    if (!x && !y) {
	        return (0, _utils.setStyle)(canvas, {
	            display: 'none'
	        });
	    }

	    (0, _utils.setStyle)(canvas, {
	        display: 'block'
	    });

	    ctx.clearRect(0, 0, size.content.width, size.container.height);
	    ctx.fillStyle = options.overscrollEffectColor;
	    renderGlowX.call(this, x);
	    renderGlowY.call(this, y);
	}

	function renderGlowX(strength) {
	    var size = this.size,
	        targets = this.targets,
	        __touchRecord = this.__touchRecord,
	        MAX_OVERSCROLL = this.MAX_OVERSCROLL;
	    var _size$container = size.container,
	        width = _size$container.width,
	        height = _size$container.height;
	    var ctx = targets.canvas.context;


	    ctx.save();

	    if (strength > 0) {
	        // glow on right side
	        // horizontally flip
	        ctx.transform(-1, 0, 0, 1, width, 0);
	    }

	    var opacity = (0, _utils.pickInRange)(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
	    var startOffset = (0, _utils.pickInRange)(opacity, 0, GLOW_MAX_OFFSET) * width;

	    // controll point
	    var x = Math.abs(strength);
	    var y = __touchRecord.getLastPosition('y') || height / 2;

	    ctx.globalAlpha = opacity;
	    ctx.beginPath();
	    ctx.moveTo(0, -startOffset);
	    ctx.quadraticCurveTo(x, y, 0, height + startOffset);
	    ctx.fill();
	    ctx.closePath();
	    ctx.restore();
	}

	function renderGlowY(strength) {
	    var size = this.size,
	        targets = this.targets,
	        __touchRecord = this.__touchRecord,
	        MAX_OVERSCROLL = this.MAX_OVERSCROLL;
	    var _size$container2 = size.container,
	        width = _size$container2.width,
	        height = _size$container2.height;
	    var ctx = targets.canvas.context;


	    ctx.save();

	    if (strength > 0) {
	        // glow on bottom side
	        // vertically flip
	        ctx.transform(1, 0, 0, -1, 0, height);
	    }

	    var opacity = (0, _utils.pickInRange)(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
	    var startOffset = (0, _utils.pickInRange)(opacity, 0, GLOW_MAX_OFFSET) * width;

	    // controll point
	    var x = __touchRecord.getLastPosition('x') || width / 2;
	    var y = Math.abs(strength);

	    ctx.globalAlpha = opacity;
	    ctx.beginPath();
	    ctx.moveTo(-startOffset, 0);
	    ctx.quadraticCurveTo(x, y, width + startOffset, 0);
	    ctx.fill();
	    ctx.closePath();
	    ctx.restore();
	}

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	// @this-bind
	/**
	 * @module
	 * @prototype {Function} __render
	 */

	function nextTick(dir) {
	    var options = this.options,
	        offset = this.offset,
	        movement = this.movement,
	        __touchRecord = this.__touchRecord;
	    var damping = options.damping,
	        renderByPixels = options.renderByPixels,
	        overscrollDamping = options.overscrollDamping;


	    var current = offset[dir];
	    var remain = movement[dir];

	    var renderDamping = damping;

	    if (this.__willOverscroll(dir, remain)) {
	        renderDamping = overscrollDamping;
	    } else if (__touchRecord.isActive()) {
	        renderDamping = 0.5;
	    }

	    if (Math.abs(remain) < 1) {
	        var next = current + remain;

	        return {
	            movement: 0,
	            position: remain > 0 ? Math.ceil(next) : Math.floor(next)
	        };
	    }

	    var nextMovement = remain * (1 - renderDamping);

	    if (renderByPixels) {
	        nextMovement |= 0;
	    }

	    return {
	        movement: nextMovement,
	        position: current + remain - nextMovement
	    };
	};

	function __render() {
	    var options = this.options,
	        offset = this.offset,
	        limit = this.limit,
	        movement = this.movement,
	        overscrollRendered = this.overscrollRendered,
	        __timerID = this.__timerID;


	    if (movement.x || movement.y || overscrollRendered.x || overscrollRendered.y) {
	        var nextX = nextTick.call(this, 'x');
	        var nextY = nextTick.call(this, 'y');
	        var overflowDir = [];

	        if (options.overscrollEffect) {
	            var destX = (0, _utils.pickInRange)(nextX.position, 0, limit.x);
	            var destY = (0, _utils.pickInRange)(nextY.position, 0, limit.y);

	            // overscroll is rendering
	            // or scrolling onto particular edge
	            if (overscrollRendered.x || destX === offset.x && movement.x) {
	                overflowDir.push('x');
	            }

	            if (overscrollRendered.y || destY === offset.y && movement.y) {
	                overflowDir.push('y');
	            }
	        }

	        if (!this.movementLocked.x) movement.x = nextX.movement;
	        if (!this.movementLocked.y) movement.y = nextY.movement;

	        this.setPosition(nextX.position, nextY.position);
	        this.__renderOverscroll(overflowDir);
	    }

	    __timerID.render = requestAnimationFrame(__render.bind(this));
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__render', {
	    value: __render,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _utils = __webpack_require__(112);

	var _smoothScrollbar = __webpack_require__(78);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
	                                                                                                                                                                                                              * @module
	                                                                                                                                                                                                              * @prototype {Function} __setMovement
	                                                                                                                                                                                                              */

	function __setMovement() {
	    var deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    var deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	    var allowOverscroll = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	    var options = this.options,
	        movement = this.movement;


	    this.__updateThrottle();

	    var limit = this.__getDeltaLimit(allowOverscroll);

	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        deltaX = Math.round(deltaX);
	        deltaY = Math.round(deltaY);
	    }

	    movement.x = _utils.pickInRange.apply(undefined, [deltaX].concat(_toConsumableArray(limit.x)));
	    movement.y = _utils.pickInRange.apply(undefined, [deltaY].concat(_toConsumableArray(limit.y)));
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__setMovement', {
	    value: __setMovement,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	// check whether to propagate movement to outer scrollbars
	// this situations are considered as `true`:
	//         1. continuous scrolling is enabled (automatically disabled when overscroll is enabled)
	//         2. scrollbar reaches one side and not about to scroll on the other direction
	/**
	 * @module
	 * @prototype {Function} __shouldPropagateMovement
	 */

	function __shouldPropagateMovement() {
	    var deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    var deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	    var options = this.options,
	        offset = this.offset,
	        limit = this.limit;


	    if (!options.continuousScrolling) return false;

	    var destX = (0, _utils.pickInRange)(deltaX + offset.x, 0, limit.x);
	    var destY = (0, _utils.pickInRange)(deltaY + offset.y, 0, limit.y);
	    var res = true;

	    // offset not about to change
	    res &= destX === offset.x;
	    res &= destY === offset.y;

	    // current offset is on the edge
	    res &= destX === limit.x || destX === 0 || destY === limit.y || destY === 0;

	    return res;
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__shouldPropagateMovement', {
	    value: __shouldPropagateMovement,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	// check if scrollbar scrolls onto very edge in particular direction
	/**
	 * @module
	 * @prototype {Function} __willOverscroll
	 */

	function __willOverscroll() {
	    var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	    var delta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	    if (!dir) return false;

	    var offset = this.offset,
	        limit = this.limit;


	    var currentOffset = offset[dir];

	    // cond:
	    //  1. next scrolling position is supposed to stay unchange
	    //  2. current position is on the edge
	    return (0, _utils.pickInRange)(delta + currentOffset, 0, limit[dir]) === currentOffset && (currentOffset === 0 || currentOffset === limit[dir]);
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__willOverscroll', {
	    value: __willOverscroll,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _exportAll = __webpack_require__(159);

	(0, _keys2.default)(_exportAll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _exportAll[key];
	    }
	  });
	});

/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _drag = __webpack_require__(160);

	(0, _keys2.default)(_drag).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _drag[key];
	    }
	  });
	});

	var _keyboard = __webpack_require__(161);

	(0, _keys2.default)(_keyboard).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _keyboard[key];
	    }
	  });
	});

	var _mouse = __webpack_require__(168);

	(0, _keys2.default)(_mouse).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _mouse[key];
	    }
	  });
	});

	var _resize = __webpack_require__(169);

	(0, _keys2.default)(_resize).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _resize[key];
	    }
	  });
	});

	var _select = __webpack_require__(170);

	(0, _keys2.default)(_select).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _select[key];
	    }
	  });
	});

	var _touch = __webpack_require__(171);

	(0, _keys2.default)(_touch).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _touch[key];
	    }
	  });
	});

	var _wheel = __webpack_require__(172);

	(0, _keys2.default)(_wheel).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _wheel[key];
	    }
	  });
	});

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	/**
	 * @module
	 * @prototype {Function} __dragHandler
	 */

	function __dragHandler() {
	    var _this = this;

	    var _targets = this.targets,
	        container = _targets.container,
	        content = _targets.content;


	    var isDrag = false;
	    var animation = void 0,
	        padding = void 0;

	    Object.defineProperty(this, '__isDrag', {
	        get: function get() {
	            return isDrag;
	        },

	        enumerable: false
	    });

	    var scroll = function scroll(_ref) {
	        var x = _ref.x,
	            y = _ref.y;

	        if (!x && !y) return;

	        var speed = _this.options.speed;


	        _this.__setMovement(x * speed, y * speed);

	        animation = requestAnimationFrame(function () {
	            scroll({ x: x, y: y });
	        });
	    };

	    this.__addEvent(container, 'dragstart', function (evt) {
	        if (_this.__eventFromChildScrollbar(evt)) return;

	        isDrag = true;
	        padding = evt.target.clientHeight;

	        (0, _utils.setStyle)(content, {
	            'pointer-events': 'auto'
	        });

	        cancelAnimationFrame(animation);
	        _this.__updateBounding();
	    });

	    this.__addEvent(document, 'dragover mousemove touchmove', function (evt) {
	        if (!isDrag || _this.__eventFromChildScrollbar(evt)) return;
	        cancelAnimationFrame(animation);
	        evt.preventDefault();

	        var dir = _this.__getPointerTrend(evt, padding);

	        scroll(dir);
	    });

	    this.__addEvent(document, 'dragend mouseup touchend blur', function () {
	        cancelAnimationFrame(animation);
	        isDrag = false;
	    });
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__dragHandler', {
	    value: __dragHandler,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _isIterable2 = __webpack_require__(162);

	var _isIterable3 = _interopRequireDefault(_isIterable2);

	var _getIterator2 = __webpack_require__(165);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if ((0, _isIterable3.default)(Object(arr))) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @prototype {Function} __keyboardHandler
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	var KEY_CODE = {
	    SPACE: 32,
	    PAGE_UP: 33,
	    PAGE_DOWN: 34,
	    END: 35,
	    HOME: 36,
	    LEFT: 37,
	    UP: 38,
	    RIGHT: 39,
	    DOWN: 40
	};

	/**
	 * @method
	 * @internal
	 * Keypress event handler builder
	 */
	function __keyboardHandler() {
	    var _this = this;

	    var targets = this.targets;


	    var getKeyDelta = function getKeyDelta(keyCode) {
	        // key maps [deltaX, deltaY, useSetMethod]
	        var size = _this.size,
	            offset = _this.offset,
	            limit = _this.limit,
	            movement = _this.movement; // need real time data

	        switch (keyCode) {
	            case KEY_CODE.SPACE:
	                return [0, 200];
	            case KEY_CODE.PAGE_UP:
	                return [0, -size.container.height + 40];
	            case KEY_CODE.PAGE_DOWN:
	                return [0, size.container.height - 40];
	            case KEY_CODE.END:
	                return [0, Math.abs(movement.y) + limit.y - offset.y];
	            case KEY_CODE.HOME:
	                return [0, -Math.abs(movement.y) - offset.y];
	            case KEY_CODE.LEFT:
	                return [-40, 0];
	            case KEY_CODE.UP:
	                return [0, -40];
	            case KEY_CODE.RIGHT:
	                return [40, 0];
	            case KEY_CODE.DOWN:
	                return [0, 40];
	            default:
	                return null;
	        }
	    };

	    var container = targets.container;


	    this.__addEvent(container, 'keydown', function (evt) {
	        if (document.activeElement !== container) return;

	        var options = _this.options,
	            parents = _this.parents,
	            movementLocked = _this.movementLocked;


	        var delta = getKeyDelta(evt.keyCode || evt.which);

	        if (!delta) return;

	        var _delta = _slicedToArray(delta, 2),
	            x = _delta[0],
	            y = _delta[1];

	        if (_this.__shouldPropagateMovement(x, y)) {
	            container.blur();

	            if (parents.length) {
	                parents[0].focus();
	            }

	            return _this.__updateThrottle();
	        }

	        evt.preventDefault();

	        _this.__unlockMovement(); // handle for multi keypress
	        if (x && _this.__willOverscroll('x', x)) movementLocked.x = true;
	        if (y && _this.__willOverscroll('y', y)) movementLocked.y = true;

	        var speed = options.speed;

	        _this.__addMovement(x * speed, y * speed);
	    });

	    this.__addEvent(container, 'keyup', function () {
	        _this.__unlockMovement();
	    });
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__keyboardHandler', {
	    value: __keyboardHandler,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(163), __esModule: true };

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(57);
	__webpack_require__(4);
	module.exports = __webpack_require__(164);

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(53)
	  , ITERATOR  = __webpack_require__(45)('iterator')
	  , Iterators = __webpack_require__(27);
	module.exports = __webpack_require__(12).isIterable = function(it){
	  var O = Object(it);
	  return O[ITERATOR] !== undefined
	    || '@@iterator' in O
	    || Iterators.hasOwnProperty(classof(O));
	};

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(166), __esModule: true };

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(57);
	__webpack_require__(4);
	module.exports = __webpack_require__(167);

/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(17)
	  , get      = __webpack_require__(52);
	module.exports = __webpack_require__(12).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	/**
	 * @method
	 * @internal
	 * Mouse event handlers builder
	 */
	/**
	 * @module
	 * @prototype {Function} __mouseHandler
	 */

	function __mouseHandler() {
	    var _this = this;

	    var _targets = this.targets,
	        container = _targets.container,
	        xAxis = _targets.xAxis,
	        yAxis = _targets.yAxis;


	    var getDest = function getDest(direction, offsetOnTrack) {
	        var size = _this.size,
	            thumbSize = _this.thumbSize;


	        if (direction === 'x') {
	            var totalWidth = size.container.width - (thumbSize.x - thumbSize.realX);

	            return offsetOnTrack / totalWidth * size.content.width;
	        }

	        if (direction === 'y') {
	            var totalHeight = size.container.height - (thumbSize.y - thumbSize.realY);

	            return offsetOnTrack / totalHeight * size.content.height;
	        }

	        return 0;
	    };

	    var getTrackDir = function getTrackDir(elem) {
	        if ((0, _utils.isOneOf)(elem, [xAxis.track, xAxis.thumb])) return 'x';
	        if ((0, _utils.isOneOf)(elem, [yAxis.track, yAxis.thumb])) return 'y';
	    };

	    var isMouseDown = void 0,
	        isMouseMoving = void 0,
	        startOffsetToThumb = void 0,
	        startTrackDirection = void 0,
	        containerRect = void 0;

	    this.__addEvent(container, 'click', function (evt) {
	        if (isMouseMoving || !(0, _utils.isOneOf)(evt.target, [xAxis.track, yAxis.track])) return;

	        var track = evt.target;
	        var direction = getTrackDir(track);
	        var rect = track.getBoundingClientRect();
	        var clickPos = (0, _utils.getPosition)(evt);

	        var offset = _this.offset,
	            thumbSize = _this.thumbSize;


	        if (direction === 'x') {
	            var offsetOnTrack = clickPos.x - rect.left - thumbSize.x / 2;
	            _this.__setMovement(getDest(direction, offsetOnTrack) - offset.x, 0);
	        } else {
	            var _offsetOnTrack = clickPos.y - rect.top - thumbSize.y / 2;
	            _this.__setMovement(0, getDest(direction, _offsetOnTrack) - offset.y);
	        }
	    });

	    this.__addEvent(container, 'mousedown', function (evt) {
	        if (!(0, _utils.isOneOf)(evt.target, [xAxis.thumb, yAxis.thumb])) return;

	        isMouseDown = true;

	        var cursorPos = (0, _utils.getPosition)(evt);
	        var thumbRect = evt.target.getBoundingClientRect();

	        startTrackDirection = getTrackDir(evt.target);

	        // pointer offset to thumb
	        startOffsetToThumb = {
	            x: cursorPos.x - thumbRect.left,
	            y: cursorPos.y - thumbRect.top
	        };

	        // container bounding rectangle
	        containerRect = _this.targets.container.getBoundingClientRect();
	    });

	    this.__addEvent(window, 'mousemove', function (evt) {
	        if (!isMouseDown) return;

	        evt.preventDefault();
	        isMouseMoving = true;

	        var offset = _this.offset;

	        var cursorPos = (0, _utils.getPosition)(evt);

	        if (startTrackDirection === 'x') {
	            // get percentage of pointer position in track
	            // then tranform to px
	            // don't need easing
	            var offsetOnTrack = cursorPos.x - startOffsetToThumb.x - containerRect.left;
	            _this.setPosition(getDest(startTrackDirection, offsetOnTrack), offset.y);
	        }

	        if (startTrackDirection === 'y') {
	            var _offsetOnTrack2 = cursorPos.y - startOffsetToThumb.y - containerRect.top;
	            _this.setPosition(offset.x, getDest(startTrackDirection, _offsetOnTrack2));
	        }
	    });

	    // release mousemove spy on window lost focus
	    this.__addEvent(window, 'mouseup blur', function () {
	        isMouseDown = isMouseMoving = false;
	    });
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__mouseHandler', {
	    value: __mouseHandler,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @internal
	 * Resize event handler builder
	 */
	function __resizeHandler() {
	  this.__addEvent(window, 'resize', this.__updateThrottle);
	} /**
	   * @module
	   * @prototype {Function} __resizeHandler
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__resizeHandler', {
	  value: __resizeHandler,
	  writable: true,
	  configurable: true
	});

/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	// todo: select handler for touch screen
	/**
	 * @module
	 * @prototype {Function} __selectHandler
	 */

	function __selectHandler() {
	    var _this = this;

	    var isSelected = false;
	    var animation = void 0;

	    var _targets = this.targets,
	        container = _targets.container,
	        content = _targets.content;


	    var scroll = function scroll(_ref) {
	        var x = _ref.x,
	            y = _ref.y;

	        if (!x && !y) return;

	        var speed = _this.options.speed;


	        _this.__setMovement(x * speed, y * speed);

	        animation = requestAnimationFrame(function () {
	            scroll({ x: x, y: y });
	        });
	    };

	    var setSelect = function setSelect() {
	        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	        (0, _utils.setStyle)(container, {
	            '-user-select': value
	        });
	    };

	    this.__addEvent(window, 'mousemove', function (evt) {
	        if (!isSelected) return;

	        cancelAnimationFrame(animation);

	        var dir = _this.__getPointerTrend(evt);

	        scroll(dir);
	    });

	    this.__addEvent(content, 'selectstart', function (evt) {
	        if (_this.__eventFromChildScrollbar(evt)) {
	            return setSelect('none');
	        }

	        cancelAnimationFrame(animation);

	        _this.__updateBounding();
	        isSelected = true;
	    });

	    this.__addEvent(window, 'mouseup blur', function () {
	        cancelAnimationFrame(animation);
	        setSelect();

	        isSelected = false;
	    });

	    // temp patch for touch devices
	    this.__addEvent(container, 'scroll', function (evt) {
	        evt.preventDefault();
	        container.scrollTop = container.scrollLeft = 0;
	    });
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__selectHandler', {
	    value: __selectHandler,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	var _shared = __webpack_require__(89);

	var _utils = __webpack_require__(112);

	var MIN_VELOCITY = 100; /**
	                         * @module
	                         * @prototype {Function} __touchHandler
	                         */

	var activeScrollbar = null;

	/**
	 * @method
	 * @internal
	 * Touch event handlers builder
	 */
	function __touchHandler() {
	    var _this = this;

	    var targets = this.targets,
	        __touchRecord = this.__touchRecord;
	    var container = targets.container;


	    this.__addEvent(container, 'touchstart', function (evt) {
	        if (_this.__isDrag) return;

	        var __timerID = _this.__timerID,
	            movement = _this.movement;

	        // stop scrolling but keep movement for overscrolling

	        cancelAnimationFrame(__timerID.scrollTo);
	        if (!_this.__willOverscroll('x')) movement.x = 0;
	        if (!_this.__willOverscroll('y')) movement.y = 0;

	        // start records
	        __touchRecord.track(evt);
	        _this.__autoLockMovement();
	    });

	    this.__addEvent(container, 'touchmove', function (evt) {
	        if (_this.__isDrag) return;
	        if (activeScrollbar && activeScrollbar !== _this) return;

	        __touchRecord.update(evt);

	        var _touchRecord$getDelt = __touchRecord.getDelta(),
	            x = _touchRecord$getDelt.x,
	            y = _touchRecord$getDelt.y;

	        if (_this.__shouldPropagateMovement(x, y)) {
	            return _this.__updateThrottle();
	        }

	        var movement = _this.movement,
	            MAX_OVERSCROLL = _this.MAX_OVERSCROLL,
	            options = _this.options;


	        if (movement.x && _this.__willOverscroll('x', x)) {
	            var factor = 2;

	            if (options.overscrollEffect === 'bounce') {
	                factor += Math.abs(10 * movement.x / MAX_OVERSCROLL);
	            }

	            if (Math.abs(movement.x) >= MAX_OVERSCROLL) {
	                x = 0;
	            } else {
	                x /= factor;
	            }
	        }
	        if (movement.y && _this.__willOverscroll('y', y)) {
	            var _factor = 2;

	            if (options.overscrollEffect === 'bounce') {
	                _factor += Math.abs(10 * movement.y / MAX_OVERSCROLL);
	            }

	            if (Math.abs(movement.y) >= MAX_OVERSCROLL) {
	                y = 0;
	            } else {
	                y /= _factor;
	            }
	        }

	        _this.__autoLockMovement();

	        evt.preventDefault();

	        _this.__addMovement(x, y, true);
	        activeScrollbar = _this;
	    });

	    this.__addEvent(container, 'touchcancel touchend', function (evt) {
	        if (_this.__isDrag) return;

	        var speed = _this.options.speed;


	        var velocity = __touchRecord.getVelocity();
	        var movement = {};

	        (0, _keys2.default)(velocity).forEach(function (dir) {
	            var value = (0, _utils.pickInRange)(velocity[dir] * _shared.GLOBAL_ENV.EASING_MULTIPLIER, -1e3, 1e3);

	            // throw small values
	            movement[dir] = Math.abs(value) > MIN_VELOCITY ? value * speed : 0;
	        });

	        _this.__addMovement(movement.x, movement.y, true);

	        _this.__unlockMovement();
	        __touchRecord.release(evt);
	        activeScrollbar = null;
	    });
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__touchHandler', {
	    value: __touchHandler,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	var _shared = __webpack_require__(89);

	/**
	 * @method
	 * @internal
	 * Wheel event handler builder
	 */
	function __wheelHandler() {
	    var _this = this;

	    var container = this.targets.container;


	    var wheelLocked = false;

	    // since we can't detect whether user release touchpad
	    // handle it with debounce is the best solution now, as a trade-off
	    var releaseWheel = (0, _utils.debounce)(function () {
	        wheelLocked = false;
	    }, 30, false);

	    this.__addEvent(container, _shared.GLOBAL_ENV.WHEEL_EVENT, function (evt) {
	        var options = _this.options;

	        var _getDelta = (0, _utils.getDelta)(evt),
	            x = _getDelta.x,
	            y = _getDelta.y;

	        x *= options.speed;
	        y *= options.speed;

	        if (_this.__shouldPropagateMovement(x, y)) {
	            return _this.__updateThrottle();
	        }

	        evt.preventDefault();
	        releaseWheel();

	        if (_this.overscrollBack) {
	            wheelLocked = true;
	        }

	        if (wheelLocked) {
	            if (_this.__willOverscroll('x', x)) x = 0;
	            if (_this.__willOverscroll('y', y)) y = 0;
	        }

	        _this.__addMovement(x, y, true);
	    });
	} /**
	   * @module
	   * @prototype {Function} __wheelHandler
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__wheelHandler', {
	    value: __wheelHandler,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _exportAll = __webpack_require__(174);

	(0, _keys2.default)(_exportAll).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _exportAll[key];
	    }
	  });
	});

/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _addEvent = __webpack_require__(175);

	(0, _keys2.default)(_addEvent).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _addEvent[key];
	    }
	  });
	});

	var _eventFromChildScrollbar = __webpack_require__(176);

	(0, _keys2.default)(_eventFromChildScrollbar).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _eventFromChildScrollbar[key];
	    }
	  });
	});

	var _getDeltaLimit = __webpack_require__(177);

	(0, _keys2.default)(_getDeltaLimit).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getDeltaLimit[key];
	    }
	  });
	});

	var _getPointerTrend = __webpack_require__(178);

	(0, _keys2.default)(_getPointerTrend).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _getPointerTrend[key];
	    }
	  });
	});

	var _initOptions = __webpack_require__(179);

	(0, _keys2.default)(_initOptions).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _initOptions[key];
	    }
	  });
	});

	var _initScrollbar = __webpack_require__(182);

	(0, _keys2.default)(_initScrollbar).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _initScrollbar[key];
	    }
	  });
	});

	var _readonly = __webpack_require__(183);

	(0, _keys2.default)(_readonly).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _readonly[key];
	    }
	  });
	});

	var _setThumbPosition = __webpack_require__(184);

	(0, _keys2.default)(_setThumbPosition).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _setThumbPosition[key];
	    }
	  });
	});

	var _updateBounding = __webpack_require__(185);

	(0, _keys2.default)(_updateBounding).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _updateBounding[key];
	    }
	  });
	});

	var _updateTree = __webpack_require__(186);

	(0, _keys2.default)(_updateTree).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  (0, _defineProperty2.default)(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _updateTree[key];
	    }
	  });
	});

/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	function __addEvent(elem, events, handler) {
	    var _this = this;

	    if (!elem || typeof elem.addEventListener !== 'function') {
	        throw new TypeError('expect elem to be a DOM element, but got ' + elem);
	    }

	    var fn = function fn(evt) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }

	        // ignore default prevented events or user ignored events
	        if (!evt.type.match(/drag/) && evt.defaultPrevented) return;

	        handler.apply(undefined, [evt].concat(args));
	    };

	    events.split(/\s+/g).forEach(function (evt) {
	        _this.__handlers.push({ evt: evt, elem: elem, fn: fn, hasRegistered: true });

	        elem.addEventListener(evt, fn);
	    });
	} /**
	   * @module
	   * @prototype {Function} __addEvent
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__addEvent', {
	    value: __addEvent,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	function __eventFromChildScrollbar() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        target = _ref.target;

	    return this.children.some(function (sb) {
	        return sb.contains(target);
	    });
	} /**
	   * @module
	   * @prototype {Function} __eventFromChildScrollbar
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__eventFromChildScrollbar', {
	    value: __eventFromChildScrollbar,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	function __getDeltaLimit() {
	    var allowOverscroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	    var options = this.options,
	        offset = this.offset,
	        limit = this.limit;


	    if (allowOverscroll && (options.continuousScrolling || options.overscrollEffect)) {
	        return {
	            x: [-Infinity, Infinity],
	            y: [-Infinity, Infinity]
	        };
	    }

	    return {
	        x: [-offset.x, limit.x - offset.x],
	        y: [-offset.y, limit.y - offset.y]
	    };
	} /**
	   * @module
	   * @prototype {Function} __getDeltaLimit
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__getDeltaLimit', {
	    value: __getDeltaLimit,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	var _utils = __webpack_require__(112);

	/**
	 * @module
	 * @prototype {Function} __getPointerTrend
	 */

	function __getPointerTrend(evt) {
	    var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	    var _bounding = this.bounding,
	        top = _bounding.top,
	        right = _bounding.right,
	        bottom = _bounding.bottom,
	        left = _bounding.left;

	    var _getPosition = (0, _utils.getPosition)(evt),
	        x = _getPosition.x,
	        y = _getPosition.y;

	    var res = {
	        x: 0,
	        y: 0
	    };

	    if (x === 0 && y === 0) return res;

	    if (x > right - padding) {
	        res.x = x - right + padding;
	    } else if (x < left + padding) {
	        res.x = x - left - padding;
	    }

	    if (y > bottom - padding) {
	        res.y = y - bottom + padding;
	    } else if (y < top + padding) {
	        res.y = y - top - padding;
	    }

	    return res;
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__getPointerTrend', {
	    value: __getPointerTrend,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	var _keys = __webpack_require__(90);

	var _keys2 = _interopRequireDefault(_keys);

	var _stringify = __webpack_require__(180);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	var _iterator = __webpack_require__(55);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(62);

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                                                                                          * @module
	                                                                                                                                                                                                                                                                                                                          * @prototype {Function} __initOptions
	                                                                                                                                                                                                                                                                                                                          */

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _utils = __webpack_require__(112);

	var _smoothScrollbar = __webpack_require__(78);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

	function __initOptions(userPreference) {
	    var scrollbar = this;

	    var options = {
	        speed: 1, // scroll speed scale
	        damping: 0.1, // damping factor
	        thumbMinSize: 20, // min size for scrollbar thumb
	        syncCallbacks: false, // execute callbacks in synchronous
	        renderByPixels: true, // rendering by integer pixels
	        alwaysShowTracks: false, // keep scrollbar tracks visible
	        continuousScrolling: 'auto', // allow outer scrollbars to scroll when reaching edge
	        overscrollEffect: false, // overscroll effect, false | 'bounce' | 'glow'
	        overscrollEffectColor: '#87ceeb', // android overscroll effect color
	        overscrollDamping: 0.2 };

	    var limit = {
	        damping: [0, 1],
	        speed: [0, Infinity],
	        thumbMinSize: [0, Infinity],
	        overscrollEffect: [false, 'bounce', 'glow'],
	        overscrollDamping: [0, 1]
	    };

	    var isContinous = function isContinous() {
	        var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'auto';

	        if (options.overscrollEffect !== false) return false;

	        switch (mode) {
	            case 'auto':
	                return scrollbar.isNestedScrollbar;
	            default:
	                return !!mode;
	        }
	    };

	    var optionAccessors = {
	        // @deprecated
	        set ignoreEvents(v) {
	            console.warn('`options.ignoreEvents` parameter is deprecated, use `instance#unregisterEvents()` method instead. https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceunregisterevents-regex--regex-regex--');
	        },

	        // @deprecated
	        set friction(v) {
	            console.warn('`options.friction=' + v + '` is deprecated, use `options.damping=' + v / 100 + '` instead.');

	            this.damping = v / 100;
	        },

	        get syncCallbacks() {
	            return options.syncCallbacks;
	        },
	        set syncCallbacks(v) {
	            options.syncCallbacks = !!v;
	        },

	        get renderByPixels() {
	            return options.renderByPixels;
	        },
	        set renderByPixels(v) {
	            options.renderByPixels = !!v;
	        },

	        get alwaysShowTracks() {
	            return options.alwaysShowTracks;
	        },
	        set alwaysShowTracks(v) {
	            v = !!v;
	            options.alwaysShowTracks = v;

	            var container = scrollbar.targets.container;


	            if (v) {
	                scrollbar.showTrack();
	                container.classList.add('sticky');
	            } else {
	                scrollbar.hideTrack();
	                container.classList.remove('sticky');
	            }
	        },

	        get continuousScrolling() {
	            return isContinous(options.continuousScrolling);
	        },
	        set continuousScrolling(v) {
	            if (v === 'auto') {
	                options.continuousScrolling = v;
	            } else {
	                options.continuousScrolling = !!v;
	            }
	        },

	        get overscrollEffect() {
	            return options.overscrollEffect;
	        },
	        set overscrollEffect(v) {
	            if (v && !~limit.overscrollEffect.indexOf(v)) {
	                console.warn('`overscrollEffect` should be one of ' + (0, _stringify2.default)(limit.overscrollEffect) + ', but got ' + (0, _stringify2.default)(v) + '. It will be set to `false` now.');

	                v = false;
	            }

	            options.overscrollEffect = v;
	        },

	        get overscrollEffectColor() {
	            return options.overscrollEffectColor;
	        },
	        set overscrollEffectColor(v) {
	            options.overscrollEffectColor = v;
	        }
	    };

	    (0, _keys2.default)(options).filter(function (prop) {
	        return !optionAccessors.hasOwnProperty(prop);
	    }).forEach(function (prop) {
	        (0, _defineProperty2.default)(optionAccessors, prop, {
	            enumerable: true,
	            get: function get() {
	                return options[prop];
	            },
	            set: function set(v) {
	                if (isNaN(parseFloat(v))) {
	                    throw new TypeError('expect `options.' + prop + '` to be a number, but got ' + (typeof v === 'undefined' ? 'undefined' : _typeof(v)));
	                }

	                options[prop] = _utils.pickInRange.apply(undefined, [v].concat(_toConsumableArray(limit[prop])));
	            }
	        });
	    });

	    this.__readonly('options', optionAccessors);
	    this.setOptions(userPreference);
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__initOptions', {
	    value: __initOptions,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(181), __esModule: true };

/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(12)
	  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @internal
	 * initialize scrollbar
	 *
	 * This method will attach several listeners to elements
	 * and create a destroy method to remove listeners
	 *
	 * @param {Object} option: as is explained in constructor
	 */
	function __initScrollbar() {
	  this.update(); // initialize thumb position

	  this.__keyboardHandler();
	  this.__resizeHandler();
	  this.__selectHandler();
	  this.__mouseHandler();
	  this.__touchHandler();
	  this.__wheelHandler();
	  this.__dragHandler();

	  this.__render();
	} /**
	   * @module
	   * @prototype {Function} __initScrollbar
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__initScrollbar', {
	  value: __initScrollbar,
	  writable: true,
	  configurable: true
	});

/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = __webpack_require__(86);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @internal
	 * create readonly property
	 *
	 * @param {String} prop
	 * @param {Any} value
	 */
	function __readonly(prop, value) {
	    return (0, _defineProperty2.default)(this, prop, {
	        value: value,
	        enumerable: true,
	        configurable: true
	    });
	} /**
	   * @module
	   * @prototype {Function} __readonly
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__readonly', {
	    value: __readonly,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _utils = __webpack_require__(112);

	var _smoothScrollbar = __webpack_require__(78);

	/**
	 * @method
	 * @internal
	 * Set thumb position in track
	 */
	/**
	 * @module
	 * @prototype {Function} __setThumbPosition
	 */

	function __setThumbPosition() {
	    var targets = this.targets,
	        size = this.size,
	        offset = this.offset,
	        thumbOffset = this.thumbOffset,
	        thumbSize = this.thumbSize;


	    thumbOffset.x = offset.x / size.content.width * (size.container.width - (thumbSize.x - thumbSize.realX));

	    thumbOffset.y = offset.y / size.content.height * (size.container.height - (thumbSize.y - thumbSize.realY));

	    (0, _utils.setStyle)(targets.xAxis.thumb, {
	        '-transform': 'translate3d(' + thumbOffset.x + 'px, 0, 0)'
	    });

	    (0, _utils.setStyle)(targets.yAxis.thumb, {
	        '-transform': 'translate3d(0, ' + thumbOffset.y + 'px, 0)'
	    });
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__setThumbPosition', {
	    value: __setThumbPosition,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _smoothScrollbar = __webpack_require__(78);

	function __updateBounding() {
	    var container = this.targets.container;

	    var _container$getBoundin = container.getBoundingClientRect(),
	        top = _container$getBoundin.top,
	        right = _container$getBoundin.right,
	        bottom = _container$getBoundin.bottom,
	        left = _container$getBoundin.left;

	    var _window = window,
	        innerHeight = _window.innerHeight,
	        innerWidth = _window.innerWidth;


	    this.__readonly('bounding', {
	        top: Math.max(top, 0),
	        right: Math.min(right, innerWidth),
	        bottom: Math.min(bottom, innerHeight),
	        left: Math.max(left, 0)
	    });
	} /**
	   * @module
	   * @prototype {Function} __updateBounding
	   */

	;

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__updateBounding', {
	    value: __updateBounding,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _from = __webpack_require__(2);

	var _from2 = _interopRequireDefault(_from);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _smoothScrollbar = __webpack_require__(78);

	var _shared = __webpack_require__(89);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
	                                                                                                                                                                                                              * @module
	                                                                                                                                                                                                              * @prototype {Function} __updateTree
	                                                                                                                                                                                                              */

	function __updateTree() {
	    var _targets = this.targets,
	        container = _targets.container,
	        content = _targets.content;


	    this.__readonly('children', [].concat(_toConsumableArray(content.querySelectorAll(_shared.selectors))));
	    this.__readonly('isNestedScrollbar', false);

	    var parents = [];

	    var elem = container;

	    // eslint-disable-next-line no-cond-assign
	    while (elem = elem.parentElement) {
	        if (_shared.sbList.has(elem)) {
	            this.__readonly('isNestedScrollbar', true);
	            parents.push(elem);
	        }
	    }

	    this.__readonly('parents', parents);
	};

	Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__updateTree', {
	    value: __updateTree,
	    writable: true,
	    configurable: true
	});

/***/ }),
/* 187 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ })
/******/ ])
});
;