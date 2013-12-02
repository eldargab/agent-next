var loop = require('asyncloop')
var CookieJar = require('tough-cookie').CookieJar
var Cookie = require('tough-cookie').Cookie

module.exports = function(jar) {
  jar = jar instanceof CookieJar ? jar : new CookieJar

  return function(req, send, done) {
    var url = req.url

    jar.getCookies(url, {secure: url.protocol == 'https'}, function(err, cookies) {
      if (err) return done(err)

      cookies = cookies.map(function(cookie) { return cookie.cookieString() }).join('; ')
      if (cookies) req.headers.cookie = cookies

      send(req, function(err, res) {
        if (err) return done(err, res)

        var cookies = res.headers['set-cookie']
        if (!cookies) return done(null, res)

        cookies = (Array.isArray(cookies) ? cookies : [cookies])
          .map(function(cookie) { return parse(cookie) })
          .filter(function(cookie) { return !!cookie })

        loop(function(next) {
          var cookie = cookies.shift()
          if (!cookie) return done(null, res)
          jar.setCookie(cookie, url, {ignoreError: true}, function(err) {
            err ? done(err, res) : next()
          })
        })
      })
    })
  }
}

function parse(str) {
  var strict = true // strict RFC conformance
  return Cookie.parse(str, strict)
}