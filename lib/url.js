var parse = require('url').parse
var format = require('url').format
var resolve = require('url').resolve

module.exports = Url

function Url(url) {
  url = url || {}
  if (typeof url == 'string') url = parse(url, false, true)
  this.protocol = url.protocol
  this.hostname = url.hostname
  this.port = url.port
  this.pathname = url.pathname
  this.query = url.query || ''
}

Object.defineProperty(Url.prototype, 'protocol', {
  get: function() {
    return this._protocol
  },
  set: function(p) {
    if (p && p[p.length - 1] == ':') p = p.slice(0, p.length - 1)
    this._protocol = p
  },
  enumerable: true
})

Object.defineProperty(Url.prototype, 'host', {
  get: function() {
    if (!this.hostname) return
    return this.hostname + (this.port ? ':' + this.port : '')
  },
  set: function(host) {
    var i = host.indexOf(':')
    this.hostname = ~i ? host.slice(0, i) : host
    this.port = ~i ? host.slice(i) : null
  }
})

Object.defineProperty(Url.prototype, 'path', {
  get: function() {
    return this.pathname + (this.query ? '?' + this.query : '')
  },
  set: function(p) {
    var i = path.indexOf('?')
    this.pathname = ~i ? p.slice(0, i) : p
    this.query = ~i ? p.slice(i) : null
  }
})

Url.prototype.toJSON = function() {
  return {
    protocol: this.protocol,
    hostname: this.hostname,
    port: this.port,
    pathname: this.pathname,
    query: this.query
  }
}

Url.prototype.resolve = function(url) {
  return new Url(resolve(''+this, ''+url))
}

Url.prototype.toString = function() {
  return format(this)
}