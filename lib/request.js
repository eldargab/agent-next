var qs = require('qs')
var mime = require('mime')
var Url = require('./url')

mime.define({'application/x-www-form-urlencoded': ['form', 'urlencoded']})

module.exports = Request

function Request(method, url, agent) {
  this.method = method
  this.url = new Url(url)
  this.headers = {}
  this.agent = agent
}

Request.prototype.query = function(val) {
  if (typeof val != 'string') val = qs.stringify(val)
  this.url.query += (this.url.query && '&') + val
  return this
}

Request.prototype.set = function(name, val) {
  if (typeof name == 'object') {
    for (var key in name) {
      this.set(key, name[key])
    }
  } else {
    this.headers[name.toLowerCase()] = ''+val
  }
  return this
}

Request.prototype.send = function(body) {
  this.body = body
  return this
}

Request.prototype.type = function(type) {
  type = ~type.indexOf('/') ? type : mime.lookup(type)
  this.headers['content-type'] = type
  return this
}

Request.prototype.end = function(cb) {
  return this.agent.send(this, cb)
}
