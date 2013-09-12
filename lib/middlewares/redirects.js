var util = require('../util')
var Url = require('../url')
var Request = require('../request')

module.exports = function(max) {
  max = max == null ? 10 : max
  return function(req, send, cb) {
    send(req, function(err, res) {
      if (err) return cb(err)
      if (isNotRedirect(res)) return cb(null, res)

      var list = []
      var count = 0

      function done(err, res) {
        if (err) err.redirects = list
        if (res) res.redirects = list
        if (err && res) err.res = res
        cb(err, res)
      }

      ;(function loop(err, res) {
        if (err) return done(err)
        if (isNotRedirect(res)) return done(null, res)
        if (util.isStream(res.body)) util.dump(res)
        var location = res.headers['location'] || ''
        list.push(location)
        count++
        if (count > max) return done(new Error('Max redirects count (' + max + ') exceeded.'), res)
        var redirect = new Request
        redirect.method = req.method == 'HEAD' ? 'HEAD' : 'GET'
        redirect.headers = copy(req.headers)
        redirect.url = req.url.resolve(location)
        send(redirect, loop)
      })(null, res)
    })
  }
}

function isNotRedirect(res) {
  return !~[301, 302, 303].indexOf(res.status)
}

function copy(headers) {
  var ret = {}
  for (var key in headers) {
    if (key == 'content-length') continue
    if (key == 'content-type') continue
    if (key == 'transfer-encoding') continue
    if (key == 'host') continue
    if (key == 'cookie') continue
    ret[key] == headers[key]
  }
  return ret
}