var http = require('http')
var https = require('https')
var Simple = require('stream-simple')
var util = require('./util')
var Response = require('./response')

module.exports = function send(req, opts, cb) {
  util.setContentLength(req.headers, req.body)

  var url = req.url
  var secure = /^https:?$/.test(url.protocol)

  var nativeReq = (secure ? https : http).request({
    method: req.method,
    path: url.path,
    hostname: url.hostname,
    port: url.port,
    headers: req.headers,
    agent: opts.nativeAgent
  })

  var aborted = false
  var completed = false
  var body

  function done(err, res) {
    if (completed) {
      console.warn('agent-next: Response callback were called more than once')
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

  if (opts.timeout) {
    var timer = setTimeout(function() {
      aborted = true
      timer = null
      var err = new Error('Timeout of ' + opts.timeout + 'ms exceeded.')
      body ? body.push(err) : done(err)
      nativeReq.abort()
    }, opts.timeout)

    function clearTimer() {
      timer && clearTimeout(timer)
    }

    nativeReq.on('end', clearTimer)
    nativeReq.on('close', clearTimer)
  }

  if (util.isStream(req.body))
    util.stream(req.body, nativeReq, cb)
  else
    nativeReq.end(req.body)
}