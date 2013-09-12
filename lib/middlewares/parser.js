var consume = require('simple-binary-consume')
var qs = require('qs')

module.exports = function() {
  return function(req, send, cb) {
    send(req, function(err, res) {
      if (err) return cb(err)

      function done(err) {
        if (err) err.res = res
        cb(err, res)
      }

      consume(res.body, 'utf8', function(err, text) {
        if (err) return done(err)
        var parse = types[res.mime]
        res.text = text
        try {
          res.body = parse ? parse(text) : {}
        } catch(e) {
          return done(e)
        }
        done()
      })
    })
  }
}

var types = {
  'application/json': JSON.parse,
  'application/x-www-form-urlencoded': qs.parse
}