
exports.setContentLength = function(headers, body) {
  if (!body) return
  if (headers['content-length']) return
  if (typeof body == 'string') return headers['content-length'] = Buffer.byteLength(body)
  if (Buffer.isBuffer(body)) headers['content-length'] = body.length
}

exports.isStream = function(obj) {
  return obj && typeof obj.read == 'function'
}

exports.stream = function(simple, writable, cb) {
  writable
  .on('error', abort)
  .on('close', abort)
  .on('drain', next)

  function abort() {
    simple.abort(function(err){
      if (err) console.warn(err)
    })
  }

  function next() {
    simple.read(function(err, chunk) {
      if (err) return writable.destroy(), cb(err)
      if (!chunk) return writable.end()
      var drain = writable.write(chunk)
      if (drain) next()
    })
  }

  next()
}

exports.dump = function(res) {
  var body = res.body
  ;(function loop() {
    body.read(function(err, chunk) {
      if (!err && chunk) loop()
    })
  })()
}