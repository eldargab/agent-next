var http = require('http')
var https = require('https')
var CookieAccess = require('cookiejar').CookieAccessInfo
var CookieJar = require('cookiejar').CookieJar
var resolve = require('url').resolve
var methods = require('methods')
var util = require('./util')
var Request = require('./request')
var Response = require('./response')
var Simple = require('./simple-stream')

module.exports = Agent

function Agent() {
  this.befores = []
  this.afters = []
  this.maxRedirects = 5
}

Agent.prototype.onRequest = function(fn) {
  this.befores.unshift(fn)
  return this
}

Agent.prototype.onResponse = function(fn) {
  this.afters.push(fn)
  return this
}

Agent.prototype.setNative = function(agent) {
  this.native = agent
  return this
}

Agent.prototype.cookieJar = function(jar) {
  this.jar = jar === true ? new CookieJar : jar
  return this
}

Agent.prototype.redirects = function(n) {
  this.maxRedirects = n
  return this
}

Agent.prototype.extend = function() {
  var ret = Object.create(this)
  ret.befores = this.befores.slice()
  ret.afters = this.afters.slice()
  return ret
}

Agent.prototype.request = function(method, url) {
  return new Request(method, url, this)
}

methods.forEach(function(meth) {
  Agent.prototype[meth] = function(url) {
    return this.request(meth.toUpperCase(), url)
  }
})

Agent.prototype.send = function(req, cb) {
  var self = this
  var state = new RequestState(this)

  function done(err, res) {
    if (!err) return cb(null, res)
    err.req = req
    err.redirectList = state.redirectList
    cb(err)
  }

  util.befores(req, this.befores, 0, function(err) {
    if (err) return done(err)
    var received = false
    send(req, state, function(err, res) {
      if (received) {
        // it seems this can happen and that's not our fault
        console.warn('agent-next: Response callback were called more than once')
        return
      }
      received = true
      if (err) return done(err)
      res = new Response(res.statusCode, res.headers, new Simple(res))
      util.afters(req, res, self.afters, 0, done)
    })
  })
}

function RequestState(agent) {
  this.agent = agent.native
  this.jar = agent.jar
  this.maxRedirects = agent.maxRedirects
  this.redirects = 0
  this.redirectList = []
}

function send(req, state, cb) {
  var opts = {}
  var url = req.url
  var secure = /^https:?$/.test(url.protocol)

  util.setContentLength(req.headers, req.body)

  opts.method = req.method
  opts.path = url.path
  opts.hostname = url.hostname
  opts.port = url.port
  opts.headers = req.headers
  opts.agent = state.agent

  if (state.jar) {
    var access = new CookieAccess(url.host, url.pathname, secure)
    opts.headers.cookie = state.jar.getCookies(access).toValueString()
  }

  var mod = secure ? https : http

  var native = mod.request(opts)
  .on('error', cb)
  .on('response', function(res) {
    if (state.jar) {
      var cookies = res.headers['set-cookie']
      if (cookies) state.jar.setCookies(cookies)
    }

    if (this.maxRedirects === false || util.isNotRedirect(res.statusCode))
      return cb(null, res)

    res.destroy()

    state.redirects++
    state.redirectList.push(res.headers.location)

    if (state.redirects > state.maxRedirects)
      return cb(new Error('Max redirects number (' + state.maxRedirects + ') exceeded'))

    var location = resolve(url.toString(), res.headers.location)
    var newReq = new Request(req.method == 'HEAD' ? 'HEAD' : 'GET', location)

    newReq.headers = util.stripHeaders(req.headers)

    send(newReq, state, cb)
  })

  if (util.isStream(req.body))
    util.stream(req.body, native, cb)
  else
    native.end(req.body)
}
