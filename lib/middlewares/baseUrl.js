var Url = require('../url')

module.exports = function(url) {
  var b = new Url(url)
  return function(req, send, cb) {
    var url = req.url
    if (url.protocol || url.host) return send(req, cb)
    req.url = new Url
    req.url.protocol = b.protocol
    req.url.hostname = b.hostname
    req.url.port = b.port
    req.url.pathname = resolve(b.pathname, url.pathname)
    req.url.query = url.query
    send(req, cb)
  }
}

function resolve(from, to) {
  if (!from) return to
  if (!to) return from
  if (to[0] == '/') return to

  var segs = from.split('/')
  var path = to.split('/')

  path.forEach(function(seg) {
    if (seg == '.') return
    if (seg == '..') return segs.pop()
    segs.push(seg)
  })

  return segs.join('/')
}