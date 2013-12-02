module.exports = function(ms) {
  return function(req, send, cb) {
    req.timeout = req.timeout || ms
    send(req, cb)
  }
}