var qs = require('qs')
var mix = require('mixobjects')

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

exports.acceptEncoding = function(str) {
  return function(req, next) {
    req.headers['accept-encoding'] = str
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

exports.unzip = function() {
  var zlib = require('zlib')
  var util = require('./util')
  var Simple = require('./simple-stream')

  return function(req, res, next) {
    if (!/^(gzip|deflate)$/.test(res.headers['content-encoding'])) return next()
    var unzip = zlib.createUnzip()
    unzip.destroy = unzip.close
    var out = new Simple(unzip)
    util.stream(res.body, unzip, function(err) {
      out.push(err)
    })
    res.body = out
    next()
  }
}
