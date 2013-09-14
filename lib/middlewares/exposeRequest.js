module.exports = function() {
  return function(req, send, cb) {
    send(req, function(err, res) {
      if (err) err.req = req
      cb(err, res, req)
    })
  }
}