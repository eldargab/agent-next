var methods = require('methods')
var Request = require('./request')

module.exports = Agent

function Agent(send) {
  this.send = send
}

Agent.prototype.request = function(method, url) {
  var req = new Request(method, url, this)
  var send = this.send

  req.end = function(cb) {
    send(this, cb)
  }

  return req
}

methods.forEach(function(meth) {
  Agent.prototype[meth] = function(url) {
    return this.request(meth.toUpperCase(), url)
  }
})

Agent.prototype.use = function(fn) {
  var send = this.send
  this.send = function(req, cb) {
    if (req.aborted) return cb(req.aborted)
    fn(req, send, cb)
  }
  return this
}

Agent.prototype.extend = function() {
  return new Agent(this.send)
}