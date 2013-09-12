var Url = require('../url')

module.exports = function(url) {
  var base = new Url(url)
  return function(req, send, cb) {
    req.url = base.resolve(req.url)
    send(req, cb)
  }
}