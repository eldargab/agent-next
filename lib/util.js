var qs = require('qs')
var mix = require('mixobjects')

exports.isNotRedirect = function(code) {
  return !~[301, 302, 303, 305, 307].indexOf(code)
}

exports.stripHeaders = function(headers) {
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

exports.setContentLength = function(headers, body) {
  if (!body) return
  if (headers['content-length']) return
  headers['content-length'] = typeof body == 'string'
    ? Buffer.byteLength(body)
    : Buffer.isBuffer(body) ? body.length : undefined
}

exports.befores = function befores(req, fns, i, cb) {
  var fn = fns[i]
  if (!fn) return cb(null, req)
  fn(req, function(err) {
    if (err) return cb(err)
    befores(req, fns, i + 1, cb)
  })
}

exports.afters = function afters(req, res, fns, i, cb) {
  var fn = fns[i]
  if (!fn) return cb(null, res)
  fn(req, res, function(err, rs) {
    if (err) return cb(err)
    afters(req, rs || res, fns, i + 1, cb)
  })
}
