var StringDecoder = require('string_decoder').StringDecoder

module.exports = Simple

function Simple(src) {
  this.src = src
  this.started = false
  this.closed = false
  this.queue = []
  this._push = null
}

Simple.prototype.read = function(cb) {
  if (!this.started) this.start(); this.started = true
  var call = this.queue.shift()
  if (call)
    cb.apply(null, call)
  else
    this._push = cb
  if (!this.queue.length) this.src.resume()
}

Simple.prototype.abort = function(cb) {
  this.src.destroy()
  if (!cb) return
  if (this.closed || !this.started) return cb()
  this.src.on('close', cb)
}

Simple.prototype.start = function() {
  var self = this

  this.src.on('error', function(err) {
    self.push(err)
  })

  this.src.on('data', function(data) {
    this.pause()
    self.push(null, data)
  })

  this.src.on('end', function() {
    self.push()
  })

  this.src.on('close', function() {
    self.closed = true
  })
}

Simple.prototype.push = function(err, data) {
  var push = this._push
  this._push = null
  if (push) return push(err, data)
  this.queue.push(arguments)
}

Simple.prototype.consume = function(encoding, cb) {
  if (typeof encoding == 'function') {
    cb = encoding
    encoding = null
  }

  var binary = !encoding
    , push
    , end

  if (binary) {
    var chunks = []
    var length = 0

    push = function(chunk) {
      length += chunks.length
      chunks.push(chunk)
    }

    end = function() {
      return Buffer.concat(chunks, length)
    }
  } else {
    var decoder = new StringDecoder(encoding)
    var out = ''

    push = function(chunk) {
      out += decoder.write(chunk)
    }

    end = function() {
      return out + decoder.end()
    }
  }

  var self = this

  ;(function read() {
    var async = false
    self.read(function(err, chunk) {
      if (err) return cb(err)
      if (!chunk) return cb(null, end())
      push(chunk)
      async ? read() : process.nextTick(read)
    })
    async = true
  })()
}
