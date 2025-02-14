! function () {
  "use strict";
  var t = function (t) {
      return e.template.replace(e.pattern, (function (n, r) {
        var i = e.middleware(r, t[r], e.template);
        return void 0 !== i ? i : t[r] || n
      }))
    },
    e = {
      pattern: /\{(.*?)\}/g,
      template: "",
      middleware: function () {}
    },
    n = new function () {
      this.matches = function (t, e) {
        return function (t, e) {
          var n = e.length,
            r = t.length;
          if (n < r) return !1;
          if (r === n) return t === e;
          t: for (var i = 0, o = 0; i < r; i++) {
            for (var u = t.charCodeAt(i); o < n;)
              if (e.charCodeAt(o++) === u) continue t;
            return !1
          }
          return !0
        }(e.toLowerCase(), t.toLowerCase())
      }
    },
    r = new function () {
      this.matches = function (t, e) {
        return !!t && (t = t.trim().toLowerCase(), (e = e.trim().toLowerCase()).split(" ").filter((function (e) {
          return 0 <= t.indexOf(e)
        })).length === e.split(" ").length)
      }
    };

  function i() {
    return 0
  }
  var o, u, a, c, s, l = [],
    f = {};

  function p(t) {
    return Boolean(t) && "[object Object]" === Object.prototype.toString.call(t)
  }

  function d(t) {
    return l.push(t), l
  }

  function h(t, e, n, r) {
    for (var i in t)
      if (!m(t[i], r.exclude) && n.matches(t[i], e)) return t
  }

  function m(t, e) {
    for (var n = !1, r = 0, i = (e = e || []).length; r < i; r++) {
      var o = e[r];
      !n && new RegExp(t).test(o) && (n = !0)
    }
    return n
  }

  function v(t) {
    (function (t) {
      p(t) ? d(t) : function (t) {
        return Boolean(t) && "[object Array]" === Object.prototype.toString.call(t)
      }(t) && function (t) {
        var e = [];
        l.length = 0;
        for (var n = 0, r = t.length; n < r; n++) p(t[n]) && e.push(d(t[n]))
      }(t)
    })(t), u.searchInput.addEventListener("keyup", (function (t) {
      ! function (t) {
        return -1 === [13, 16, 20, 37, 38, 39, 40, 91].indexOf(t)
      }(t.which) || (w(), g(t.target.value))
    }))
  }

  function w() {
    u.resultsContainer.innerHTML = ""
  }

  function y(t) {
    u.resultsContainer.innerHTML += t
  }

  function g(e) {
    ! function (t) {
      return t && 0 < t.length
    }(e) || (w(), function (e, n) {
      var r = e.length;
      if (0 === r) return y(u.noResultsText);
      for (var i = 0; i < r; i++) e[i].query = n, y(t(e[i]))
    }(function (t) {
      return t ? function (t, e, n, r) {
        for (var i = [], o = 0; o < t.length && i.length < r.limit; o++) {
          var u = h(t[o], e, n, r);
          u && i.push(u)
        }
        return i
      }(l, t, f.searchStrategy, f).sort(f.sort) : []
    }(e), e))
  }

  function z(t) {
    throw new Error("SimpleJekyllSearch --- " + t)
  }
  f.fuzzy = !1, f.limit = 10, f.searchStrategy = f.fuzzy ? n : r, f.sort = i, o = window, u = {
    searchInput: null,
    resultsContainer: null,
    json: [],
    success: Function.prototype,
    searchResultTemplate: '<div><a href="{url}"><h3>{title}</h3></a></div>',
    templateMiddleware: Function.prototype,
    sortMiddleware: function () {
      return 0
    },
    noResultsText: "Sin resultados. Busca con otra palabra",
    limit: 10,
    fuzzy: !1,
    exclude: []
  }, c = function t(e) {
    if (! function (t) {
        return t && void 0 !== t.required && t.required instanceof Array
      }(e)) throw new Error("-- OptionsValidator: required options missing");
    if (!(this instanceof t)) return new t(e);
    var n = e.required;
    this.getRequiredOptions = function () {
      return n
    }, this.validate = function (t) {
      var e = [];
      return n.forEach((function (n) {
        void 0 === t[n] && e.push(n)
      })), e
    }
  }({
    required: a = ["searchInput", "resultsContainer", "json"]
  }), s = function (t) {
    return 0 < c.validate(t).length && z("You must specify the following required options: " + a),
      function (t) {
        e.pattern = t.pattern || e.pattern, e.template = t.template || e.template, "function" == typeof t.middleware && (e.middleware = t.middleware)
      }({
        template: (u = function (t, e) {
          var n = {};
          for (var r in t) n[r] = t[r], void 0 !== e[r] && (n[r] = e[r]);
          return n
        }(u, t)).searchResultTemplate,
        middleware: u.templateMiddleware
      }),
      function (t) {
        (f = t || {}).fuzzy = t.fuzzy || !1, f.limit = t.limit || 10, f.searchStrategy = t.fuzzy ? n : r, f.sort = t.sort || i
      }({
        fuzzy: u.fuzzy,
        limit: u.limit,
        sort: u.sortMiddleware
      }), (function (t) {
        try {
          return !!(t instanceof Object && JSON.parse(JSON.stringify(t)))
        } catch (t) {
          return !1
        }
      }(u.json) ? v : function (t) {
        ! function (t, e) {
          var n = window.XMLHttpRequest ? new window.XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
          n.open("GET", t, !0), n.onreadystatechange = function (t, e) {
            return function () {
              if (4 === t.readyState && 200 === t.status) try {
                e(null, JSON.parse(t.responseText))
              } catch (t) {
                e(t, null)
              }
            }
          }(n, e), n.send()
        }(t, (function (e, n) {
          e && z("failed to get JSON (" + t + ")"), v(n)
        }))
      })(u.json), {
        search: g
      }
  }, o.SimpleJekyllSearch = function (t) {
    var e = s(t);
    return t.success.call(e), e
  }
}();