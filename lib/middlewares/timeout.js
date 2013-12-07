module.exports = function(ms) {
  return function(req, send, cb) {
    var timer = setTimeout(function() {
      var err = new Error('Timeout of ' + ms + 'ms exceeded.')
      err.code = 'ETIMEDOUT'
      req.abort(err)
    }, ms)

    send(req, function(err, res) {
      clearTimeout(timer)
      cb(err, res)
    })
  }
}