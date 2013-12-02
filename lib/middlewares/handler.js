module.exports = function(fn) {
  fn = fn || defaultHandler
  return function(req, send, cb) {
    send(req, function(err, res) {
      fn(err, req, res, cb)
    })
  }
}

function defaultHandler(err, req, res, cb) {
  if (err) {
    err.req = req
    err.res = res
  }
  if (res) {
    res.req = req
  }
  cb(err, res)
}