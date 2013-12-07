var qs = require('qs')
var mime = require('mime')
var Url = require('./url')

mime.define({'application/x-www-form-urlencoded': ['urlencoded']})

module.exports = Request

function Request(method, url) {
  this.method = method || 'GET'
  this.url = new Url(url)
  this.headers = {}
}

Request.prototype.query = function(val) {
  if (typeof val != 'string') val = qs.stringify(val)
  this.url.query = this.url.query || ''
  this.url.query += (this.url.query && '&') + val
  return this
}

Request.prototype.set = function(name, val) {
  if (typeof name == 'object') {
    for (var key in name) {
      this.set(key, name[key])
    }
  } else {
    //TODO: think about null values
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

// This should be assigned by HTTP implementation during request processing.
// When called it must close connection as well as pass the given error either
// to the response callback (when no headers received) or
// push it to the body stream.
Request.prototype.destroy = null

Request.prototype.abort = function(err) {
  if (this.aborted) return
  if (!err) {
    err = new Error('Request was aborted.')
    err.code = 'EABORTED'
  }
  this.aborted = err
  this.destroy && this.destroy(this.aborted)
}
