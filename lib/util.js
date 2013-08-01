var Url = require('url')
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

expots.Util = Util

function Url(url) {
  if (typeof url == 'string') url = Url.parse(url)
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
  return Url.format(this)
}

exports.simpleStream = function(stream) {
  var push
  var finished = false
  var closed = false

  function read(cb) {
    if (finished) return cb()
    push = cb
    stream.resume()
  }

  function abort(cb) {
    stream.destroy()
    if (closed) return cb()
    stream.on('close', cb)
  }

  stream.on('error', function(err) {
    push(err)
    push = null
  })

  stream.on('data', function(data) {
    stream.pause()
    push(null, data)
    push = null
  })

  stream.on('end', function() {
    finished = true
    if (push) push()
    push = null
  })

  stream.on('close', function() {
    closed = true
  })

  return {read: read, abort: abort}
}

exports.consume = function(stream, cb, encoding) {
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

  ;(function read() {
    stream.read(function(err, chunk) {
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

exports.bodyParser = function(types) {
  types = mix({
    'application/json': JSON.parse,
    'application/x-www-form-urlencoded': qs.parse
  }, types)
  return function(req, res, next) {
    util.consume(res.body, function(err, text) {
      if (err) return next(err)
      res.text = text
      var parse = types[res.mime]
      try {
        res.body = parse ? parse(text) : text
      } catch(e) {
        return next(e)
      }
      next()
    }, 'utf8')
  }
}
