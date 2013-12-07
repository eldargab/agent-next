var http = require('http')
var https = require('https')
var Simple = require('stream-simple')
var pipe = require('simple-stream-pipe')
var util = require('./util')
var Response = require('./response')

module.exports = function send(req, cb) {
  util.setContentLength(req.headers, req.body)

  var url = req.url
  var secure = 'https' == url.protocol

  var nativeReq = (secure ? https : http).request({
    method: req.method,
    path: url.path,
    hostname: url.hostname,
    port: url.port,
    headers: req.headers
  })

  var body
  var completed = false
  var aborted = false

  function done(err, res) {
    if (completed) {
      if (err) console.warn(err.stack)
      console.warn('agent-next: Response callback was called more than once.')
      console.warn('agent-next: This might be due to non-conformant http server implementation.')
      return
    }
    completed = true
    if (err) return cb(err)
    body = Simple(res)
    cb(null, new Response(res.statusCode, res.headers, body))
  }

  req.destroy = function(err) {
    aborted = true
    nativeReq.abort()
    body ? body.push(err) : done(err)
  }

  nativeReq
  .on('error', function(err) {
    if (!aborted) done(err)
  })
  .on('response', function(res) {
    done(null, res)
  })

  if (util.isStream(req.body))
    pipe(req.body, nativeReq, done)
  else
    nativeReq.end(req.body)
}