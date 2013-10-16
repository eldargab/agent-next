module.exports = function() {
  return function(req, send, cb) {
    send(req, function(err, res) {
      if (err) {
        err.req = req
        err.res = res
      }
      if (res) {
        res.req = req
      }
      cb(err, res)
    })
  }
}