var methods = require('methods')
var Request = require('./request')

module.exports = Agent

function Agent(send) {
  this.send = send
}

Agent.prototype.request = function(method, url) {
  return new Request(method, url, this)
}

methods.forEach(function(meth) {
  Agent.prototype[meth] = function(url) {
    return this.request(meth.toUpperCase(), url)
  }
})

Agent.prototype.use = function(fn) {
  var send = this.send
  this.send = function(req, cb) {
    fn(req, send, cb)
  }
  return this
}

Agent.prototype.extend = function() {
  return new Agent(this.send)
}