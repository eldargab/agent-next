var http = require('http')
var https = require('https')
var CookieAccess = require('cookiejar').CookieAccessInfo
var CookieJar = require('cookiejar').CookieJar
var util = require('./util')
var Request = require('./request')
var Response = require('./response')

module.exports = Agent

function Agent() {
  this.befores = []
  this.afters = []
  this.maxRedirects = 5
}

Agent.prototype.onRequest = function(fn) {
  this.befores.push(fn)
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

Agent.prototype.send = function(req, done) {
  var self = this
  util.befores(req, this.befores, function(err, req) {
    if (err) return done(err)
    send(req, new RequestState(self), function(err, res) {
      if (err) return done(err)
      util.afters(req, new Response(res.statusCode, res.headers, util.simpleStream(body)), self.afters, done)
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

  opts.method = req.method
  opts.path = url.path
  opts.hostname = url.hostname
  opts.port = url.port
  opts.headers = req.headers

  if (state.jar) {
    var access = new CookieAccess(url.host, url.pathname, secure)
    opts.headers.cookie = state.jar.getCookies(access).toValueString()
  }

  var agent = state.agent || (secure ? https : http).globalAgent

  var native = agent.request(opts)
  .on('error', cb)
  .on('response', function(res) {
    if (state.jar) {
      var cookies = res.headers['set-cookie']
      if (cookies) state.jar.setCookies(cookies)
    }

    if (util.isNotRedirect(res.statusCode)) return cb(null, res)
    state.redirects++
    state.redirectList.push(res.headers.location)
    if (state.redirects > req.maxRedirects) return cb(null, res)

    var location = Url.resolve(url.toString(), res.headers.location)
    var newReq = new Request(req.method == 'HEAD' ? 'HEAD' : 'GET', location)

    newReq.headers = util.stripHeaders(req.headers)

    send(newReq, state, cb)
  })
  .end(req.body)
}
