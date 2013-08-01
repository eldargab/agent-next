var qs = require('qs')
var util = require('./util')

module.exports = Request

function Request(method, url, agent) {
  this.method = method
  this.url = new util.Url(url)
  this.headers = {}
  this.agent = agent
}

Request.prototype.query = function(val) {
  if (typeof val != 'string') val = qs.stringify(val)
  this.url.query += (this.url.query && '&') + val
  return this
}

Request.prototype.set = function(name, val) {
  this.headers[name.toLowerCase()] = val
  return this
}

Request.prototype.send = function(body) {
  this.body = body
  return this
}

Request.prototype.type = function(type) {
  this.headers['content-type'] = type
  return this
}

Request.prototype.end = function(cb) {
  return this.agent.send(this, cb)
}
