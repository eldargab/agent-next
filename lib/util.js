var URL = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var qs = require('qs')
var mix = require('mixobjects')

exports.isNotRedirect = function(code) {
  return !~[301, 302, 303, 305, 307].indexOf(code)
}

exports.stripHeaders = function(headers) {
  var ret = {}
  for (var key in headers) {
    if (key == 'content-length') continue
    if (key == 'content-type') continue
    if (key == 'transfer-encoding') continue
    if (key == 'host') continue
    if (key == 'cookie') continue
    ret[key] == headers[key]
  }
  return ret
}

exports.Url = Url

function Url(url) {
  if (typeof url == 'string') url = URL.parse(url)
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
  return URL.format(this)
}

exports.Simple = Simple

function Simple(src) {
  this.src = src
  this.started = false
  this.finished = false
  this.closed = false
  this._push = null
}

Simple.prototype.read = function(cb) {
  if (!this.started) this.start(); this.started = true
  if (this.finished) return cb()
  this._push = cb
  this.src.resume()
}

Simple.prototype.abort = function(cb) {
  this.src.destroy()
  if (!cb) return
  if (this.closed) return cb()
  this.src.on('close', cb)
}

Simple.prototype.start = function() {
  var self = this

  this.src.on('error', function(err) {
    self.push(err)
  })

  this.src.on('data', function(data) {
    this.pause()
    self.push(null, data)
  })

  this.src.on('end', function() {
    self.finished = true
    self.push()
  })

  this.src.on('close', function() {
    self.closed = true
  })
}

Simple.prototype.push = function(err, data) {
  var push = this._push
  this._push = null
  push(err, data)
}

Simple.prototype.consume = function(encoding, cb) {
  if (typeof encoding == 'function') {
    cb = encoding
    encoding = null
  }

  var binary = !encoding
    , push
    , end

  if (binary) {
    var chunks = []
    var length = 0

    push = function(chunk) {
      length += chunks.length
      chunks.push(chunk)
    }

    end = function() {
      return Buffer.concat(chunks, length)
    }
  } else {
    var decoder = new StringDecoder(encoding)
    var out = ''

    push = function(chunk) {
      out += decoder.write(chunk)
    }

    end = function() {
      return out + decoder.end()
    }
  }

  var self = this

  ;(function read() {
    self.read(function(err, chunk) {
      if (err) return cb(err)
      if (!chunk) return cb(null, end())
      push(chunk)
      read()
    })
  })()
}

exports.befores = function befores(req, fns, i, cb) {
  var fn = fns[i]
  if (!fn) return cb(null, req)
  fn(req, function(err) {
    if (err) return cb(err)
    befores(req, fns, i + 1, cb)
  })
}

exports.afters = function afters(req, res, fns, i, cb) {
  var fn = fns[i]
  if (!fn) return cb(null, res)
  fn(req, res, function(err, rs) {
    if (err) return cb(err)
    afters(req, rs || res, fns, i + 1, cb)
  })
}

exports.serialize = function(types) {
  types = mix({'application/x-www-form-urlencoded': qs.stringify}, types)
  return function(req, next) {
    if (!req.body) return next()
    if (typeof req.body != 'object') return next()
    if (Buffer.isBuffer(req.body)) return next()
    if (typeof req.body.read == 'function') return next() // stream

    var type = req.headers['content-type']
    var serialize = types[type] || JSON.stringify

    try {
      req.body = serialize(req.body)
    } catch(e) {
      return next(e)
    }
    if (!type) req.headers['content-type'] = 'application/json'
    next()
  }
}

exports.bodyParser = function() {
  var types = {
    'application/json': JSON.parse,
    'application/x-www-form-urlencoded': qs.parse
  }
  return function(req, res, next) {
    res.body.consume('utf8', function(err, text) {
      if (err) return next(err)
      res.text = text
      var parse = types[res.mime]
      try {
        res.body = parse ? parse(text) : text
      } catch(e) {
        return next(e)
      }
      next()
    })
  }
}
