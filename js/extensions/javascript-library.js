var jl = {
  enum: function (enums, context) {
    context || (context = window);
    var arg = enums.split(",");
    for (var i = 0, l = arg.length; i < l; ++i) {
      context[arg[i]] = i;
    }
    return function (i) {
      return arg[i];
    };
  },
  aryCons: [].constructor,

  make: function (kind) {
    return document.createElement(kind);
  },

  maker: function (kind, className) {
    var o = document.createElement(kind);
    if (className)
      o.className = className;
    return o;
  },

  hide: function (e) {
    e.container && (e = e.container);
    e.style["-was-display"] = e.style.display;
    e.style.display = "none";
  },

  show: function (e) {
    e.container && (e = e.container);
    e.style.display = null; 
  },

  input: function (kind) {
    var o = jl.make("input");
    o.type = kind;
    return o;
  },

  style: function (object, style) {
    if (object.constructor != jl.aryCons) {
      if (object.container)
        object = object.container;
      object = object.style;
      for (var k in style) {
        object[k] = style[k];
      }
    } else {
      for (var i = 0; i < object.length; i++) {
        this.style(object[i], style);
      }
    }

  },

  subClass: function (sup, sub) {
    sub.prototype = Object.create(sup.prototype);
    sub.prototype.constructor = sub;
  },

  inputC: function (kind, className) {
    var o = jl.make("input");
    o.className = className;
    o.type = kind;
    return o;
  },

  divC: function (className) {
    var o = jl.make("div");
    o.className = className;
    return o;
  },

  divCT: function (className, text) {
    var o = jl.make("div");
    o.className = className;
    o.textContent = text;
    return o;
  },

  append: function (p, e) {
    if (e.constructor == jl.aryCons) {
      for (var i = 0, l = e.length; i < l; ++i) {
        jl.append(p, e[i]);
      }
    } else {
      if (p.container)
        p = p.container;
      if (e.container)
        e = e.container;
      p.appendChild(e);
    }
  },

  remove: function (p, e) {
    if (e.constructor == jl.aryCons) {
      for (var i = 0, l = e.length; i < l; ++i) {
        jl.remove(p, e[i]);
      }
    } else {
      if (p.container)
        p = p.container;
      if (e.container)
        e = e.container;
      p.removeChild(e);
    }
  },

  replaceA: function (string, items) {
    var i = 0;
    return string.replace(/%@/g, function () {
      return items[i++];
    });
  },

  printf: function (string, args) {
    var i = 0;
    var argv = arguments;
    console.log(string.replace(/%[isdf]/g, function () {
      return argv[++i];
    }));
  },

  /**
  The "smaller of two" shift by Steph
  performs a circular right shift in
  the optimal number of moves <= end - start
  */
  shift: function (ary, amt, start, end, swap) { //smaller of 2 shift
    var argc = arguments.length
    if (start === undefined)
      start = 0;
    if (end === undefined)
      end = ary.length;
    if (swap === undefined)
      swap = jl.swap;

    var len = end - start;
    if (amt < 0)
      amt += len;
    amt %= len;
    if (amt == 0)
      return ary;
    var d = start + len - amt;
    var s = start;
    while (s < d) {
      var left = d - s;
      var check = amt > left;
      if (check) {
        amt = left;
      }
      for (var k = 0; k < amt; k++) {
        swap(ary, s, k + d);
        ++s;
      }
      if (check) {
        d += amt;
        amt = start + len - d;
      }
    }
    return ary;
  },

  range: function (a, b, s) {
    if (arguments.length == 1) {
      b = a;
      a = 0;
      s = 1;
    }
    b -= a;
    if (!s) {
      s = 1;
      if (b < a)
        s = -1;
    }
    var l = b / s;
    if (l < 0)
      l = 0;
    var d = new Array(l);
    for (var i = 0; i < l; i++) {
      d[i] = i * s + a;
    }
    return d;
  },

  swap: function (x, a, b) {
    var t = x[a];
    x[a] = x[b];
    x[b] = t;
  },

  bind: function (binder, props) {
    for (var i = 0; i < props.length; ++i) {
      binder[props[i]] = binder[props[i]].bind(binder);
    }
  },

  randInt: function (m, mx) {
    if (arguments.length == 1)
      return Math.random() * m | 0;
    return m + Math.random() * (mx - m) | 0;
  },

  defaultStyle: function () {
    document.body.style.margin = "0px";
  },

  styleFull: function (e) {
    e.container && (e = e.container);
    e.style.width = e.style.height = "100%";
  },

  get: function (id) {
    if (id.charAt(0) == "#")
      return document.getElementById(id.substring(1));
    if (id.charAt(0) == ".")
      return document.getElementsByClassName(id.substring(1));
    return document.getElementsByTagName(id.substring(1));
  },
  stylefix: function () {
    var styles = document.getElementsByTagName("style");
    var dict = {};
    for (var i = 0; i < styles.length; ++i) {
      var style = styles[i];
      style.innerHTML = style.innerHTML.replace(/#define\s([^\s]*)\s([^;]*);/g, function (m, key, repl) {
        dict[key] = repl;
        return "";
      });
    }
    for (key in dict) {
      for (var i = 0; i < styles.length; ++i) {
        var style = styles[i];
        style.innerHTML = style.innerHTML.replace(new RegExp(jl.escapeRegExp(key), "g"), dict[key]);
      }
    }
  },
  escapeRegExp: function (str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  },
  bindFileOpen: function (button, callback) {
    var input = jl.make("input");
    input.style.display = "none";
    input.type = "file";
    jl.append(document.body, input);
    input.onchange = callback;
    button.onclick = function () {
      input.click();
    };
  },
  readtext: function (callback) {
    return function (evt) {
      var f = evt.target.files[0];
      if (f) {
        var r = new FileReader();
        r.onload = function (e) {
          var contents = e.target.result;
          evt.target.value = "";
          callback(contents);
        }
        r.readAsText(f);
      }
    }
  },
  readbin: function (callback) {
    return function (evt) {
      var f = evt.target.files[0];
      if (f) {
        var r = new FileReader();
        r.onload = function (e) {
          var contents = e.target.result;
          evt.target.value = "";
          callback(contents);
        }
        r.readAsBinaryString(f);
      }
    }
  }
};

(function () {
  function JLCanvas() {
    var c = this.container = this.canvas = jl.make("canvas");
    this.ctx = c.getContext("2d");
    this.setBounds(300, 300);
  }

  JLCanvas.prototype.setBounds = function (w, h) {
    this.width = w;
    this.height = h;

    this.canvas.width = w;
    this.canvas.height = h;
  };

  JLCanvas.prototype.assumeFull = function () {
    this.canvas.style.position = "absolute";
    this.canvas.style.top = this.canvas.style.left = "0px";
    this.setBounds(window.innerWidth, window.innerHeight);
  };
  JLCanvas.prototype.clear = function () {

  };
  jl.Canvas = JLCanvas;
})();