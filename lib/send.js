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

  var aborted = false
  var completed = false
  var body

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

  nativeReq
  .on('error', function(err) {
    if (!aborted) done(err)
  })
  .on('response', function(res) {
    done(null, res)
  })

  if (req.timeout) {
    var timer = setTimeout(function() {
      aborted = true
      timer = null
      var err = new Error('Timeout of ' + req.timeout + 'ms exceeded.')
      err.code = 'ETIMEDOUT'
      body ? body.push(err) : done(err)
      nativeReq.abort()
    }, req.timeout)

    function clearTimer() {
      timer && clearTimeout(timer)
    }

    nativeReq.on('end', clearTimer)
    nativeReq.on('close', clearTimer)
  }

  if (util.isStream(req.body))
    pipe(req.body, nativeReq, done)
  else
    nativeReq.end(req.body)
}