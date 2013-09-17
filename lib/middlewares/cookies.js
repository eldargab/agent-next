var CookieJar = require('tough-cookie').CookieJar
var parse = require('tough-cookie').Cookie.parse
var loop = require('asyncloop')

module.exports = function(jar) {
  jar = jar instanceof CookieJar ? jar : new CookieJar

  return function(req, send, done) {
    var url = req.url

    jar.getCookies(url, {secure: url.protocol == 'http'}, function(err, cookies) {
      if (err) return done(err)

      cookies = cookies.map(function(cookie) { return cookie.cookieString() }).join('; ')
      if (cookies) req.headers.cookie = cookies

      send(req, function(err, res) {
        if (err) return done(err)

        var cookies = res.headers['set-cookie']
        if (!cookies) return done(null, res)

        cookies = (Array.isArray(cookies) ? cookies : [cookies])
          .map(function(cookie) { return parse(cookie) })
          .filter(function(cookie) { return !!cookie })

        loop(function(next) {
          var cookie = cookies.shift()
          if (!cookie) return done(null, res)
          jar.setCookie(cookie, url, function(err) {
            err ? done(err) : next()
          })
        })
      })
    })
  }
}