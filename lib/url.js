var parse = require('url').parse
var format = require('url').format

module.exports = Url

function Url(url) {
  if (typeof url == 'string') url = parse(url)
  this.protocol = url.protocol
  this.hostname = url.hostname
  this.port = url.port
  this.pathname = url.pathname
  this.query = url.query || ''
}

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

Url.prototype.toString = function() {
  return format(this)
}
