var consume = require('simple-binary-consume')
var qs = require('qs')

module.exports = function() {
  return function(req, send, cb) {
    send(req, function(err, res) {
      if (err) return cb(err, res)
      consume(res.body, 'utf8', function(err, text) {
        if (err) return cb(err, res)
        var parse = types[res.mime]
        res.text = text
        try {
          res.body = parse ? parse(text) : {}
        } catch(e) {
          return cb(e, res)
        }
        cb(null, res)
      })
    })
  }
}

var types = {
  'application/json': JSON.parse,
  'application/x-www-form-urlencoded': qs.parse
}