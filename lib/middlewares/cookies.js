var CookieAccess = require('cookiejar').CookieAccessInfo
var CookieJar = require('cookiejar').CookieJar

module.exports = function(jar) {
	jar = jar instanceof CookieJar ? jar : new CookieJar
	return function(req, send, done) {
		var url = req.url
		var secure = 'https' == url.protocol
		var access = new CookieAccess(url.host, url.pathname, secure)
		req.headers.cookie = jar.getCookies(access).toValueString()
		send(req, function(err, res) {
			if (err) return done(err)
      var cookies = res.headers['set-cookie']
      if (cookies) jar.setCookies(cookies)
      done(null, res)
		})
	}
}