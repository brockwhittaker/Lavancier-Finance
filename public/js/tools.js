var $ = (function () {
  var storage = {
    stylesheet: null
  };

  var _utils = {
    clone: function (node) {
        // Clone the node, don't clone the childNodes right now...
        var dupNode = node.cloneNode(true);

        var events = [
          'onclick', 'onmouseover', 'onscroll', 'ondblclick', 'oncontextmenu',
          'onmousemove', 'onmousedown', 'onmouseup', 'ondrag'
        ];

        events.forEach(function(method) {
            dupNode[method] = node[method];
        });

        // console.log("This only supports " + events.join(", ") + ".");


        return dupNode;
    },
    expressionForms: function (node) {
      return {
        class: "." + node.className,
        id: "#" + node.id,
        tag: node.tagName
      };
    },
    nodes: function ($sel) {
      if (typeof $sel == "string") {
        return document.querySelectorAll($sel);
      } else if (Array.isArray($sel) || $sel.length > 0) {
        return $sel;
      } else if (typeof $sel == "object" && $sel.nodeType) {
        return [$sel];
      }
    },
    each: function (arr, callback) {
      var x;

      if (Array.isArray(arr)) {
        for (x = 0; x < arr.length; x++) {
          callback.call(arr[x], x, arr);
        }
      } else if (typeof arr == "object") {
        for (x in arr) {
          if (arr.hasOwnProperty(x)) {
            callback.call(arr[x], parseFloat(x) ? parseFloat(x) : x, arr);
          }
        }
      }
    },
    serialize: function (obj) {
      var string = "";
      /** initialize empty string **/

      for (var x in obj) {
        /** iterate through object. **/

        obj[x] = (typeof obj[x] === "object") ? JSON.stringify(obj[x]) : obj[x];
        /** if the property is of object type, stringify it. **/

        obj[x] = encodeURI(obj[x]);
        /** encode the value to URI so that it is address bar safe. **/

        string += x + "=" + obj[x] + "&";
        /** add var=value& for each object property. **/
      }

      return string.slice(0, string.length - 1);
      /** return the string without the last & char. **/

      /** -----
      @param : obj - an object of data to be stringified.
      @desc  : Stringify an object to send across as [GET/POST] data.
      ----- **/
    },
    first: function (arr) {
      return arr[0];
    },
    remove: function (arr, str) {
      var index = arr.indexOf(str);
      arr.splice(index, 1);
    },
    isset: function (val) {
      return (
        typeof val !== "undefined" &&
        val !== null &&
        (typeof val == "string" && val.length > 0 || typeof val !== "string")
      );
    },
    DOM: {
      getClasses: function (node) {
        return node.className.split(/[\s+]/g);
      },
      hasClass: function (node, className) {
        return this
          .getClasses(node)
          .indexOf(className) > -1;
      },
      addClass: function (node, className) {
        if (!this.hasClass(node, className)) {
          var classes = _utils.DOM.getClasses(node);

          classes = classes.filter(function (o) {
            return o.length > 0;
          });

          return classes
            .concat(className)
            .join(" ");
        } else return node.className;
      },
      removeClass: function (node, className) {
        var classes = this.getClasses(node);
        var index = classes.indexOf(className);

        if (index > -1) {
          classes.splice(index, 1);

          return classes.join(" ");
        } else return classes.join(" ");
      },
      attr: {
        get: function (node, attr) {
          return node[attr] || node.getAttribute(attr);
        },
        set: function (node, attr, value) {
          node.setAttribute(attr, value);
        }
      },
      style: {
        object: function (node, obj) {
          for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
              node.style[x] = obj[x];
            }
          }
        },
        attrVal: function (node, attr, val) {
          node.style[attr] = val;
        },
        readVal: function (node, attr) {
          return node.style[attr];
        },
        setDefaults: function (node, obj) {
          var defaults = {
            height: node.clientHeight,
            width: node.clientWidth,
            left: "0",
            right: "0",
            top: "0",
            bottom: "0"
          };

          var extractUnits = function (value) {
            return value.replace(/[^A-z]/g, "");
          };

          for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
              if (!_utils.isset(node.style[x])) {
                if (_utils.isset(defaults[x])) {
                  if (defaults[x] == "0") {
                    node.style[x] = defaults[x] + extractUnits(obj[x]);
                  } else if (typeof defaults[x] == "number") {
                    node.style[x] = defaults[x] + "px";
                  } else {
                    node.style[x] = defaults[x];
                  }
                } else continue; // there's no default value
              } else continue; // there's already a value, we don't need to create one
            }
          }
        }
      }
    },
    CSS: {
      addStyleSheet: function (name) {
        var sheet = (function() {
        	var style = document.createElement("style");
        	style.appendChild(document.createTextNode(""));
        	document.head.appendChild(style);
          style.id = name || "";
        	return style.sheet;
        })();

        storage.stylesheet = sheet;
      },
      addRule: function (sel, rules) {
        var rule_arr = [];
        for (var x in rules) {
          if (rules.hasOwnProperty(x)) {
            rule_arr.push(x + ":" + rules[x]);
          }
        }
        var str = sel + " {" + rule_arr.join(";") + "}";

        if (!storage.stylesheet) this.addStyleSheet("bTools");
        storage.stylesheet.insertRule(str, 0);
      }
    }
  };

  var Tools = function ($sel) {
    var $nodes = _utils.nodes($sel);

    var _dom = [];

    var prototype = {
      addClass: function (className) {
        this.each(function () {
          this.className = _utils.DOM.addClass(this, className);
        });

        return this;
      },
      after: function (node) {
        this.each(function () {
          this.parentNode.insertBefore(node.cloneNode(true), this.nextSibling);
        });

        return this;
      },
      animate: function (obj, seconds, callback) {
        seconds /= 1000;

        var className = "b-transition-" +
            seconds
              .toString()
              .replace(/\./, "-") + "s";

        _utils.CSS.addRule("." + className, {
          "transition": "all " + seconds + "s ease"
        });

        this.addClass(className);

        this.each(function () {
          _utils.DOM.style.setDefaults(this, obj);
        });

        setTimeout((function () {
          this.css(obj);
        }).bind(this), 0);

        setTimeout((function () {
          this.removeClass(className);
          if (typeof callback == "function") callback();
        }).bind(this), seconds * 1000);

        return this;
      },
      append: function (node) {
        if (typeof node == "string") node = Tools.create(node);
        this.each(function () {

          if (_utils.isset(node.nodeType)) {
            this.appendChild(_utils.clone(node));
          } else if (node.length > 0) {
            var self = this;
            _utils.each(node, function () {
              self.appendChild(_utils.clone(this));
            });
          }
        });

        return this;
      },
      attr: function (attr, value) {
        if (!_utils.isset(value)) {
          var node = this.el(0, true);
          return _utils.DOM.attr.get(node, attr);
        } else {
          this.each(function () {
            _utils.DOM.attr.set(this, attr, value);
          });
        }

        return this;
      },
      before: function (node) {
        var self;

        this.each(function () {
          self = this;
          _utils.each(node, function () {
            self.parentNode.insertBefore(_utils.clone(this), self);
          });
        });

        return this;
      },
      click: function (callback) {
        if (typeof callback == "function") {
          this.on("click", callback);
        } else {
          this.el(0, true).click();
        }

        return this;
      },
      css: function (attr, value) {
        if (!_utils.isset(attr) && !_utils.isset(value)) {
          return _utils.DOM.style.readVal(this.el(0, true), attr);
        }

        this.each(function () {
          if (typeof attr === "object") {
            _utils.DOM.style.object(this, attr);
          } else if (attr && value) {
            _utils.DOM.style.attrVal(this, attr, value);
          }
        });

        return this;
      },
      data: function (attr, value) {
        if (!_utils.isset(value)) {
          return this.el(0, true).dataset[attr];
        } else {
          this.each(function () {
            this.dataset[attr] = value;
          });
        }

        return this;
      },
      dblclick: function (callback) {
        if (typeof callback == "function") {
          this.on("dblclick", callback);
        } else {
          var event = new MouseEvent('dblclick', {
              'view': window,
              'bubbles': true,
              'cancelable': true
            });
          this.el(0, true).dispatchEvent(event);
        }

        return this;
      },
      disable: function () {
        this.each(function () {
          this.disabled = true;
        });

        return this;
      },
      each: function (callback) {
        _utils.each($nodes, callback);

        return this;
      },
      el: function (method, unobject) {
        var $new_sel = [];
        if (typeof method == "function") {
          this.each(function (i) {
            if (method(i))
              $new_sel.push(this);
          });
        } else if (typeof method == "number") {
          if (unobject) return $nodes[method];
          else $new_sel.push($nodes[method]);
        } else if (typeof method == "string") {
          this.el(parseInt(method, 10));
        }

        return Tools($new_sel);
      },
      empty: function () {
        return $nodes.length === 0;
      },
      enable: function () {
        this.each(function () {
          this.disabled = false;
        });

        return this;
      },
      find: function ($inner_sel) {
        var parents = this;
        var children = Tools($inner_sel);
        var validChildren = [];

        children.each(function () {
          var pointer = this;
          var self;

          while (pointer) {
            pointer = pointer.parentNode;
            self = this;
            parents.each(function () {
              if (pointer && pointer.isSameNode(this)) {
                validChildren.push(self);
              }
            });
          }
        });

        return Tools(validChildren);
      },
      focus: function (callback) {
        if (typeof callback == "function") {
          this.on("focus", callback);
        } else {
          this.el(0, true).focus();
        }

        return this;
      },
      hasClass: function (className) {
        var node = this.el(0, true);
        return _utils.DOM.hasClass(node, className);
      },
      height: function (val) {
        if (!_utils.isset(val)) {
          return this.el(0, true).clientHeight;
        } else {
          if (typeof val == "number") val += "px";

          this.each(function () {
            this.style.height = val;
          });
        }

        return this;
      },
      html: function (html) {
        if (typeof html == "string") {
          this.each(function () {
            this.innerHTML = html;
          });
        } else if (typeof html == "number") {
          return this.html(html.toString());
        } else if (!html) {
          return this.el(0, true).innerHTML;
        }

        return this;
      },
      on: function (event, callback, callback_delegate) {
        this.each(function () {
          if (typeof callback == "string" && typeof callback_delegate == "function") {
            this.addEventListener(event, function (e) {
              var forms;

              /* essentially look through all nodes up the chain to see if they
                 are the sel. */
              e.path.forEach(function (o) {
                forms = _utils.expressionForms(o);

                if (callback == forms.class || callback == forms.id || callback == forms.tag) {
                  callback_delegate.call(o, e);
                }
              });
            });
          } else {
            this.addEventListener(event, callback);
          }
        });

        return this;
      },
      parent: function () {
        var parents = [];

        this.each(function () {
          if (this.parentNode) parents.push(this.parentNode);
        });

        return Tools(parents);
      },
      remove: function () {
        this.each(function () {
          if (this.parentNode)
            this.parentNode.removeChild(this);
        });

        return this;
      },
      removeClass: function (className) {
        this.each(function () {
          this.className = _utils.DOM.removeClass(this, className);
        });

        return this;
      },
      text: function (val) {
        if (!_utils.isset(val)) {
          return this.el(0, true).innerText;
        } else {
          this.each(function () {
            this.innerText = val;
          });
        }

        return this;
      },
      then: function (callback, ms) {
        var self = this;

        setTimeout(function () {
          callback.call(self);
        }, ms);
      },
      toggleClass: function (className) {
        this.each(function () {
          if (_utils.DOM.hasClass(this, className)) {
            this.className = _utils.DOM.removeClass(this, className);
          } else {
            this.className = _utils.DOM.addClass(this, className);
          }
        });

        return this;
      },
      val: function (val) {
        if (!_utils.isset(val) && val !== "") {
          return this.el(0, true).value;
        } else {
          this.each(function () {
            this.value = val;
          });
        }

        return this;
      },
      width: function (val) {
        if (!_utils.isset(val)) {
          return this.el(0, true).clientWidth;
        } else {
          if (typeof val == "number") val += "px";

          this.each(function () {
            this.style.width = val;
          });
        }

        return this;
      },
    };

    _utils.each(prototype, function (i) {
      _dom[i] = this;
    });

    var index = 0;
    _utils.each($nodes, function () {
      _dom[index++] = this;
    });

    return _dom;
  };

  Tools.assign = function (target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source !== undefined && source !== null) {
        for (var nextKey in source) {
          if (source.hasOwnProperty(nextKey)) {
            output[nextKey] = source[nextKey];
          }
        }
      }
    }
    return output;
  };

  Tools.ajax = function (obj) {
    try {
      var xhttp = new XMLHttpRequest();

      var data = _utils.serialize(obj.data);
      /** change the data into http address format ?var1=x&var2=y... **/

      if (obj.type.toLowerCase() == "get" && data) {
        /** if the type is GET.. **/
        obj.url += "?" + data;
        /** add the serialized object data to the end of the address line. **/
      }

      xhttp.open(obj.type, obj.url, true);
      /** open a connection of obj.type [GET/POST], obj.url [PATH] **/

      xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded" || obj.contentType);
      /** set a request header type form. **/

      xhttp.send(data);
      /** send the POST data or null. **/

      xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          var error, response;

          try {
            if (obj.dataType) {
              response = (obj.dataType.toLowerCase() === "json") ?
                JSON.parse(xhttp.response) : xhttp.response;
            } else {
              response = xhttp.response;
            }
            /** if the dataType is JSON, parse before returning. **/
          } catch (err) { error = err; }
          /** if dataType was supposed to be JSON but wasn't, set error to the
             caught parse error and pass to the callback. **/

          obj.callback(response, error);
          /** execute object callback with @params response and
             [optional] error. **/
        } else if (xhttp.status === 0) {
          obj.error();
        }
      };
    } catch (error) {
      if (obj.error) obj.error();
    }

    /** -----
    @param : obj - an object with types:
               type     : [GET/POST],
               data     : Object of data to send.
               url      : Valid HTTP url to send to.
               callback : a function callback with @params results and error.
               dataType : [Optional] "JSON" to auto parse JSON results.
    @desc  : An AJAX function that accepts GET and POST and posts a callback
             function with the data recieved.
    ----- **/
  };

  Tools.create = function (str) {
    return document.createRange().createContextualFragment(str).childNodes;
  };

  Tools.get = function (url, callback) {
    Tools.ajax({
      type      : "GET",
      url       : url,
      callback  : callback
    });

    /** -----
    @param : url - a valid url for the ajax request
             callback - a callback function with @param response.
    @desc  : A quick call that uses the internal ajax function to execute.
    ----- **/
  };

  Tools.each = function (arr, callback) {
    for (var x = 0; x < arr.length; x++) {
      callback(arr[x], x, arr);
    }
  };

  Tools.stackOverflowError = function (err) {
    var addr = "http://www.stackoverflow.com/search?q=[js]+" + err.message;
    window.open(addr, "_blank");
  };

  Tools.moment = function (time) {
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date = (time) ? new Date(time) : new Date();

    return {
      d: date.getDate(),
      m: date.getMonth(),
      month: MONTHS[date.getMonth()],
      y: date.getFullYear(),
      h: date.getHours(),
      mm: date.getMinutes(),
      s: date.getSeconds(),
      ms: date.getMilliseconds(),
      fmt: {
        d: ("0" + date.getDate()).slice(-2),
        m: ("0" + (date.getMonth() + 1)).slice(-2),
        y: ("0" + date.getFullYear()).slice(-4),
        h: ("0" + date.getHours()).slice(-2),
        mm: ("0" + date.getMinutes()).slice(-2),
        s: ("0" + date.getSeconds()).slice(-2),
        ms: ("000" + date.getMilliseconds()).slice(-3),
      }
    };
  };

  Tools.zip = function () {
    let args = arguments;
    let new_arr = [];

    if (args[0]) {
      for (var x = 0; x < args[0].length; x++) {
        new_arr[x] = [];
        for (var y = 0; y < args.length; y++) {
          new_arr[x].push(args[y][x]);
        }
      }
    }

    return new_arr;
  };

  Tools.finance = {
    assetReturn: function (iv, pv, t) {
      return Math.pow(pv / iv, 1 / t) - 1;

      /** -----
      @param  : iv - the initial value of the asset.
                pv - the present value of the asset.
                t - the time in years held.
      @desc   : Get the annualized return of an asset.
      @return : returns a number.
      ----- **/
    },

    futureValue: function (pv, ir, t) {
      var total_interest = Math.pow(ir + 1, t);
      /* calculate compounded interest over t(years). */

      return pv * total_interest;

      /** -----
      @param  : pv - the present value of the asset.
                ir - the interest rate expected (in decimal).
                t - the time in years held.
      @desc   : Get the future value of an asset with a given interest rate.
      @return : returns a number.
      ----- **/
    },

    mortgagePayment: function (p, ir, t) {
      ir /= 12;
      /* reduce the interest rate to monthly terms. */

      t *= 12;
      /* increase time to monthly terms from yearly. */

      return p * ir / (1 - Math.pow(1 + ir, -t));
      /* mortgage formula. */

      /** -----
      @param  : p - the principle owed.
                ir - the interest rate expected (in decimal).
                t - the time in years held.
      @desc   : Get the payment on a principle owed.
      @return : returns a number.
      ----- **/
    },

    sharpeRatio: function (ar, rfr, av) {
      return (ar - rfr) / av;
      /* sharpe ratio formula. */

      /** -----
      @param  : ar - the asset volatility.
                rfr - the risk free rate.
                av - the asset volatility.
      @desc   : Return the Sharpe Ratio of an asset.
      @return : returns a number.
      ----- **/
    },

    capm: function (rfr, ab, mr) {
      return rfr + ab * (mr - rfr);
      /* capm formula. */

      /** -----
      @param  : rfr - the risk free rate.
                ab - the asset beta.
                mr - the market return.
      @desc   : Return the CAPM of an asset.
      @return : returns a number.
      ----- **/
    },

    expectedValue: function (events, probabilities) {
      var expectedValue = 0;
      /* initialize expectedValue variable. */

      if (events.length === probabilities.length) {
        /* check that events and probabilities arrays are the same length. */
        events.forEach(function (i, o) {
          /* for each event. */
          expectedValue += (i * probabilities[o]);
          /* multiply event by p(event). */
        });
      } else throw "Error. Arrays should be the same length.";

      return expectedValue;
      /* return the expected value. */

      /** -----
      @param  : events - an array of numbers (events).
                probabilities - an array of probabilities of each event.
      @desc   : Return the expected value.
      @return : returns a number.
      ----- **/
    }

  };

  Tools.quant = {
    sum: function (arr) {
      return arr.reduce(function (a, b) {
        return a + b;
      });

      /** -----
      @param  : arr - an array of numbers.
      @desc   : Get the sum of an array.
      @return : returns a number.
      ----- **/
    },

    mean: function (arr) {
      return this.sum(arr) / arr.length;

      /** -----
      @param  : arr - an array of numbers.
      @desc   : Get the mean of an array. Requires internal sum function.
      @return : returns a number.
      ----- **/
    },

    variance: function (arr, sample) {
      var mean = this.mean(arr);
      /* get the mean of the data set. */
      var resids = arr.map(function (i) {
        return Math.pow(i - mean, 2);
        /* for each, get the residual and square it. */
      });

      return this.sum(resids) / (arr.length - !!sample);
      /* return the sum of the residuals over the array length -- minus on
         if it is a sample. */

      /** -----
      @param  : arr - an array of numbers.
               sample - bool for whether it is sample or not (population).
      @desc   : Get the variance of an array.
      @return : returns a number.
      ----- **/
    },

    last: function (arr) {
      return arr[arr.length - 1];

      /** -----
      @param  : arr - an array of numbers.
      @desc   : Get the last index of an array.
      @return : returns a single index.
      ----- **/
    },

    standardDeviation: function (arr, sample) {
      var variance = this.variance(arr, sample);

      return Math.sqrt(variance);
      /* standard deviation is the square root of the variance. */

      /** -----
      @param  : arr - an array of numbers.
               sample - bool for whether it is sample or not (population).
      @desc   : Get the standard deviation of an array.
      @return : returns a number.
      ----- **/
    },

    kurtosis: function (arr) {
      var n1 = 1 / arr.length;
      /* first part of the kurtosis equation. */

      var mean = this.mean(arr);

      var n2_top = this.sum(
        arr.map(function (i) {
          return Math.pow(i - mean, 4);
          /* get the residual and take it to the 4th power. */
        })
      );
      /* the top of the second part of the kurtosis equation. */

      var n2_bottom = Math.pow(this.standardDeviation(arr), 4);
      /* the bottom of the second part of the kurtosis equation. */

      return n1 * (n2_top / n2_bottom);
      /* return the equation to show kurtosis. */

      /** -----
      @param  : arr - an array of numbers.
      @desc   : Get the kurtosis of an array.
      @return : returns a number.
      ----- **/
    },

    skewness: function (arr) {
      var length = arr.length;
      var mean = this.mean(arr);

      var top = this.sum(
        arr.map(function (i) {
          return Math.pow(i - mean, 3);
          /* get the residual and take it to the 3rd power. */
        })
      );
      /* this is the top part of the equation. */

      var bottom = (length - 1) * Math.pow(this.standardDeviation(arr, true), 3);
      /* this is the bottom part of the equation. */

      return top / bottom;
      /* return the skewness. */

      /** -----
      @param  : arr - an array of numbers.
      @desc   : Get the skewness of an array.
      @return : returns a number.
      ----- **/
    },

    volatilityFromPrice: function (arr) {
      var residuals = this.residuals(arr).slice(1);
      /* get the residuals array from the price array. */

      var variance = this.variance(residuals, true);

      return Math.sqrt(variance) * Math.sqrt(251);
      /* take the standard deviation and annualize the result. */

      /** -----
      @param  : arr - an array of price values from an asset.
      @desc   : Get the volatility of the total set.
      @return : returns a number.
      ----- **/
    },

    skewnessFromPrice: function (arr) {
      var residuals = this.residuals(arr).slice(1);
      /* get the residuals array from the price array. */

      var skewness = this.skewness(residuals);

      return skewness;
      /* return the skewness value. */

      /** -----
      @param  : arr - an array of price values from an asset.
      @desc   : Get the skewness of the total set.
      @return : returns a number.
      ----- **/
    },

    kurtosisFromPrice: function (arr) {
      var residuals = this.residuals(arr).slice(1);
      /* get the residuals array from the price array. */

      var kurtosis = this.kurtosis(residuals);

      return kurtosis;
      /* return the kurtosis value. */

      /** -----
      @param  : arr - an array of price values from an asset.
      @desc   : Get the kurtosis of the total set.
      @return : returns a number.
      ----- **/
    },

    movingSample: function (arr, period, callback) {
      var slice = arr.slice(0, period);
      /* get the first slice of the array. */

      var newArray = [];
      /* create the array to be returned. */

      for (var x = period; x < arr.length; x++) {
        newArray[x] = callback.call(this, slice, arr[x]);
        /* return a callback with args of this (for use of other funcs),
           the current slice, and the current index. */

        slice.shift();
        /* remove first element (furthest back). */

        slice.push(arr[x]);
        /* add new element to the end. */
      }

      return newArray;
      /* return the custom array. */

      /** -----
      @param  : arr - an array of numbers.
                period - a period to slice and calculate by.
                callback - a function for performing math inside and
                returning a value in.
      @desc   : Perform any continuous period calculation.
      @return : returns an array.
      ----- **/
    },

    productSample: function (arr, callback) {
      var newArray = [];
      /* create the array to be returned. */

      for (var x = 1; x < arr.length; x++) {
        newArray[x] = callback(arr[x], arr[x - 1]);
        /* give a callback with the current and previous index. */
      }

      return newArray;
      /* return the custom array. */

      /** -----
      @param  : arr - an array of numbers.
                callback - a function for performing math inside and
                returning a value in.
      @desc   : Perform any continuous product calculation.
      @return : returns an array.
      ----- **/
    },

    bollingerBands: function (arr, period, numDeviations) {
      return this.movingSample(arr, period, function (slice, current) {
        /* utilizes the movingSample property. */

        var tempStdDev = this.standardDeviation(
          this.residuals(slice).filter(function (i) {
            return typeof i == "number";
          }), true) * (numDeviations || 1) + 1,
        /* calculate the standard deviation of the slice. */

        tempMean = this.mean(slice);
        /* calculate the mean of the slice. */

        return {
          high: tempMean * tempStdDev,
          current: current,
          low: tempMean * (1 / tempStdDev)
        };
        /* return rolling mean + 1 stddev, current, and
           rolling mean - 1stddev for each index. */
      });

      /** -----
      @param  : arr - an array of numbers.
                period - a period to calculate by.
                numDeviations - the number of standard deviations from mean.
      @desc   : Return an array of bollinger bands.
      @return : Returns an array of objects with the high, current, and low.
      ----- **/
    },

    simpleMovingAverage: function (arr, period) {
      return this.movingSample(arr, period, function (slice) {
        /* utilizes the movingSample property. */

        return this.mean(slice);
        /* return the mean of the trailing period. */
      });

      /** -----
      @param  : arr - an array of numbers.
                period - a period to calculate by.
      @desc   : Return an array of simple moving average values.
      @return : Returns an array.
      ----- **/
    },

    RSI: function (arr) {
      var counter = 0;

      var residuals = this.residuals(arr).filter(function (i) {
        return typeof i == "number";
      });

      residuals.forEach(function (i) {
        if (i >= 1) counter++;
        /* if the current index is greater than 1, add to counter. */

      });

      return counter / arr.length;
      /* divide by arr.length to get proportion instead of count. */

      /** -----
      @param  : arr - an array of numbers.
      @desc   : Return the simple Relative Strength Index value for an array
                of daily returns.
      @return : Returns a number.
      ----- **/
    },

    rollingVolatility: function (arr, period, rel_time) {
      var mult = Math.sqrt(251 * (1 / (rel_time || 1)));

      return this.movingSample(arr, period, function (slice) {
        /* utilizes the movingSample property. */

        return this.standardDeviation(slice, true) * mult;
        /* return the volatility of the trailing period. */
      });

      /** -----
      @param  : arr - an array of numbers.
                period - a period to calculate by.
      @desc   : Return an array of volatility values.
      @return : Returns an array.
      ----- **/
    },

    rollingSkewness: function (arr, period) {
      return this.movingSample(arr, period, function (slice) {
        /* utilizes the movingSample property. */

        return this.skewness(slice);
        /* return the skewness over the trailing period. */
      });

      /** -----
      @param  : arr - an array of numbers.
                period - a period to calculate by.
      @desc   : Return an array of volatility values.
      @return : Returns an array.
      ----- **/
    },

    rollingKurtosis: function (arr, period) {
      return this.movingSample(arr, period, function (slice) {
        /* utilizes the movingSample property. */

        return this.kurtosis(slice);
        /* return the kurtosis over the trailing period. */
      });

      /** -----
      @param  : arr - an array of numbers.
                period - a period to calculate by.
      @desc   : Return an array of kurtosis values.
      @return : Returns an array.
      ----- **/
    },

    residuals: function (arr) {
      return this.productSample(arr, function (a, b) {
        /* utilizes the productSample property. */

        return a / b;
        /* returns the index over the previous index. */
      });

      /** -----
      @param  : arr - an array of numbers.
      @desc   : Return an array of daily changes.
      @return : Returns an array.
      ----- **/
    },

    summaryStatistics: function (arr) {
      arr = arr.sort(function (a, b) {
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      });

      return {
        min: arr[0],
        max: this.last(arr),
        mean: this.sum(arr) / arr.length,
        q1: arr[Math.floor(arr.length * 0.25)],
        q3: arr[Math.ceil(arr.length * 0.75)]
      };
    },

    gaussian: function () {
      var x1, x2, r;

      do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        r = x1 * x1 + x2 * x2;
      } while (r >= 1 || r === 0);

      return Math.sqrt(-2 * Math.log(r) / r) * x1;

      /** -----
      @desc   : Returns a number with a mean of 0 and stddev of 1.
      @return : Returns a number.
      ----- **/
    },

    normalDist: function (mean, standardDeviation) {
      return mean + this.gaussian() * standardDeviation;

      /** -----
      @param  : mean - the desired mean.
                standardDeviation - the desired standard deviation.
      @desc   : Return a random number along a distribution with given mean
                and standard deviation.
      @return : Returns a number.
      ----- **/
    }
  };

  Tools.style = _utils.CSS.addRule.bind(_utils.CSS);

  return Tools;
})();
