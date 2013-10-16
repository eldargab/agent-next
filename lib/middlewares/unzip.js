var zlib = require('zlib')
var Simple = require('stream-simple')
var util = require('../util')

module.exports = function() {
  return function(req, send, done) {
    req.headers['accept-encoding'] = req.headers['accept-encoding'] || 'gzip,deflate'
    send(req, function(err, res) {
      if (err) return done(err, res)
      if (!/^(gzip|deflate)$/.test(res.headers['content-encoding'])) return done(null, res)
      var unzip = zlib.createUnzip()
      unzip.destroy = unzip.close
      res.body = util.transform(unzip, res.body)
      done(null, res)
    })
  }
}