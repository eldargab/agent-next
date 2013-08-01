
module.exports = Response

function Response(status, headers, body) {
  this.status = status
  this.headers = headers
  this.body = body
}

function getter(name, fn) {
  Object.defineProperty(Response.prototype, name, {get: fn})
}

getter('ok', function() {
  return this.status >= 200 && this.status < 300
})

getter('mime', function() {
  return (this.headers['content-type'] || '').split(/ *; */)[0]
})
