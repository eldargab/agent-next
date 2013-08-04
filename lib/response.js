var STATUS_CODES = require('http').STATUS_CODES

module.exports = Response

function Response(status, headers, body) {
  this.status = status
  this.headers = headers
  this.body = body
}

function getter(name, fn) {
  Object.defineProperty(Response.prototype, name, {get: fn})
}

getter('statusType', function() {
  return this.status / 100 | 0
})

getter('statusText', function() {
  return STATUS_CODES[this.status]
})

getter('ok', function() {
  return this.statusType == 2
})

getter('clientError', function() {
  return this.statusType == 4
})

getter('serverError', function() {
  return this.statusType == 5
})

getter('mime', function() {
  return (this.headers['content-type'] || '').split(/ *; */)[0]
})
