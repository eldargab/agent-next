var Simple = require('stream-simple')
var loop = require('asyncloop')
var dump = require('simple-stream-dump')
var pipe = require('simple-stream-pipe')

exports.setContentLength = function(headers, body) {
  if (!body) return
  if (headers['content-length']) return
  if (typeof body == 'string') return headers['content-length'] = Buffer.byteLength(body)
  if (Buffer.isBuffer(body)) headers['content-length'] = body.length
}

exports.isStream = function(obj) {
  return obj && typeof obj.read == 'function'
}

exports.transform = function(t, src) {
  var out = Simple(t)
  pipe(src, t, function(err) {
    out.push(err)
  })
  return out
}

exports.dump = function(res) {
  dump(res.body)
  res.body = null
}